export const prerender = false;

import type { APIRoute } from 'astro';
import { guard, json, readJson, requireRole, ApiError } from '../../../../lib/api';
import {
  adminGetRow,
  adminUpdateFields,
  adminUpsertFull,
  adminDeleteRow,
} from '../../../../lib/catalog';
import {
  pickEditorFields,
  validateFullPlantilla,
  ValidationError,
  ForbiddenFieldError,
  type PlantillaInput,
} from '../../../../lib/validate';
import { writeAudit, diffFields } from '../../../../lib/audit';
import type { PlantillaLang } from '../../../../data/plantillas';

/**
 * Si un texto del bloque de idioma era exactamente el nombre anterior (o sea,
 * derivado automáticamente y nunca tocado por el superadmin), lo actualiza al
 * nuevo nombre. Nunca pisa copy escrito a mano.
 *
 * Ya no toca `short`: ese campo desapareció y el nombre visible sale siempre
 * de la columna `name`.
 */
function cascadeName(lang: PlantillaLang, oldName: string, newName: string): PlantillaLang {
  const swap = (v: string) => (v === oldName ? newName : v);
  return { ...lang, title: swap(lang.title), h1: swap(lang.h1) };
}

/** PATCH /api/admin/productos/:slug */
export const PATCH: APIRoute = guard(async ({ params, request, locals }) => {
  const { user, role } = requireRole(locals, 'superadmin', 'editor');
  const slug = params.slug!;
  const existing = await adminGetRow(slug);
  if (!existing) throw new ApiError(404, { error: 'No existe' });

  const input = await readJson<PlantillaInput>(request);

  try {
    if (role === 'editor') {
      const fields = pickEditorFields(input);
      const payload: Record<string, unknown> = { ...fields };

      if (fields.name && fields.name !== existing.name) {
        payload.es = cascadeName(existing.es, existing.name, fields.name);
        payload.en = cascadeName(existing.en, existing.name, fields.name);
      }

      await adminUpdateFields(slug, payload, user.id);
      await writeAudit({
        actor: user,
        action: 'update',
        entityId: slug,
        summary: `Editó ${Object.keys(fields).join(', ')}`,
        diff: diffFields(existing as unknown as Record<string, unknown>, fields),
      });
      return json({ ok: true, slug });
    }

    // superadmin: cuerpo completo. El slug sale de la URL; el icono y el orden
    // ya no se editan a mano, así que se conservan los de la fila existente.
    const row = validateFullPlantilla({
      ...input,
      slug,
      icon: existing.icon,
      sort: existing.sort,
    });
    await adminUpsertFull(row, user.id);
    await writeAudit({
      actor: user,
      action: 'update',
      entityId: slug,
      summary: `Editó "${row.name}" (formulario completo)`,
      diff: diffFields(existing as unknown as Record<string, unknown>, {
        name: row.name,
        price: row.price,
        href: row.href,
        active: row.active,
      }),
    });
    return json({ ok: true, slug });
  } catch (err) {
    if (err instanceof ForbiddenFieldError) throw new ApiError(403, { error: err.message });
    if (err instanceof ValidationError) {
      throw new ApiError(422, { error: 'Datos incompletos', issues: err.issues });
    }
    throw err;
  }
});

/** DELETE /api/admin/productos/:slug — borrado duro, con copia en la auditoría. */
export const DELETE: APIRoute = guard(async ({ params, locals }) => {
  const { user } = requireRole(locals, 'superadmin', 'editor');
  const slug = params.slug!;
  const existing = await adminGetRow(slug);
  if (!existing) throw new ApiError(404, { error: 'No existe' });

  await adminDeleteRow(slug);
  await writeAudit({
    actor: user,
    action: 'delete',
    entityId: slug,
    summary: `Eliminó "${existing.name}"`,
    diff: { fila_eliminada: existing },
  });
  return json({ ok: true });
});
