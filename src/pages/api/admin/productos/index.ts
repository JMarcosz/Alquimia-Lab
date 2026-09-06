export const prerender = false;

import type { APIRoute } from 'astro';
import { guard, json, readJson, requireRole, requireUser, ApiError } from '../../../../lib/api';
import {
  adminListRows,
  adminInsertRow,
  adminNextSort,
  uniqueSlug,
} from '../../../../lib/catalog';
import {
  validateEditorCreate,
  validateFullPlantilla,
  slugify,
  ValidationError,
  type PlantillaInput,
} from '../../../../lib/validate';
import { writeAudit } from '../../../../lib/audit';

/** GET /api/admin/productos — lista completa (incluye ocultas). */
export const GET: APIRoute = guard(async ({ locals }) => {
  requireUser(locals);
  const rows = await adminListRows();
  return json({ ok: true, rows });
});

/** POST /api/admin/productos — alta. */
export const POST: APIRoute = guard(async ({ request, locals }) => {
  const { user, role } = requireRole(locals, 'superadmin', 'editor');
  const input = await readJson<PlantillaInput>(request);

  try {
    if (role === 'editor') {
      const partial = validateEditorCreate(input);
      const slug = await uniqueSlug(slugify(partial.name));
      const row = { ...partial, slug, sort: await adminNextSort() };
      await adminInsertRow(row, user.id);
      await writeAudit({
        actor: user,
        action: 'create',
        entityId: slug,
        summary: `Creó "${row.name}" (${row.price}) — entra oculta`,
        diff: { name: row.name, price: row.price, href: row.href },
      });
      return json({ ok: true, slug, active: false });
    }

    // superadmin: cuerpo completo. El slug se deriva del nombre y el orden
    // manda la fila al final (ambos campos ya no están en el formulario).
    const withSlug = { ...input, slug: slugify(input.slug || input.name || '') };
    const row = validateFullPlantilla(withSlug);
    row.slug = await uniqueSlug(row.slug);
    row.sort = await adminNextSort();
    await adminInsertRow(row, user.id);
    await writeAudit({
      actor: user,
      action: 'create',
      entityId: row.slug,
      summary: `Creó "${row.name}" (${row.price})`,
      diff: { name: row.name, price: row.price, href: row.href, active: row.active },
    });
    return json({ ok: true, slug: row.slug, active: row.active });
  } catch (err) {
    if (err instanceof ValidationError) {
      throw new ApiError(422, { error: 'Datos incompletos', issues: err.issues });
    }
    throw err;
  }
});
