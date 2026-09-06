export const prerender = false;

import type { APIRoute } from 'astro';
import { guard, json, readJson, requireRole, ApiError } from '../../../../../lib/api';
import { adminGetRow, adminSetActive } from '../../../../../lib/catalog';
import { writeAudit } from '../../../../../lib/audit';

/** POST /api/admin/productos/:slug/visibility  { active: boolean } */
export const POST: APIRoute = guard(async ({ params, request, locals }) => {
  const { user } = requireRole(locals, 'superadmin', 'editor');
  const slug = params.slug!;
  const existing = await adminGetRow(slug);
  if (!existing) throw new ApiError(404, { error: 'No existe' });

  const { active } = await readJson<{ active?: unknown }>(request);
  if (typeof active !== 'boolean') throw new ApiError(400, { error: 'Falta "active" (booleano)' });

  await adminSetActive(slug, active, user.id);
  await writeAudit({
    actor: user,
    action: active ? 'show' : 'hide',
    entityId: slug,
    summary: `${active ? 'Mostró' : 'Ocultó'} "${existing.name}"`,
  });
  return json({ ok: true, slug, active });
});
