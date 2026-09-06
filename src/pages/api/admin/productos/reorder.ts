export const prerender = false;

import type { APIRoute } from 'astro';
import { guard, json, readJson, requireRole, ApiError } from '../../../../lib/api';
import { adminReorder } from '../../../../lib/catalog';
import { writeAudit } from '../../../../lib/audit';

/** POST /api/admin/productos/reorder  { items: [{ slug, sort }] } */
export const POST: APIRoute = guard(async ({ request, locals }) => {
  const { user } = requireRole(locals, 'superadmin', 'editor');
  const body = await readJson<{ items?: unknown }>(request);

  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new ApiError(400, { error: 'Falta "items"' });
  }
  const items = body.items.map((it) => {
    const o = (it ?? {}) as { slug?: unknown; sort?: unknown };
    const slug = typeof o.slug === 'string' ? o.slug : '';
    const sort = Number(o.sort);
    if (!slug || !Number.isFinite(sort)) throw new ApiError(400, { error: 'item inválido' });
    return { slug, sort: Math.trunc(sort) };
  });

  await adminReorder(items, user.id);
  await writeAudit({
    actor: user,
    action: 'reorder',
    summary: `Reordenó ${items.length} producto(s)`,
    diff: { orden: items },
  });
  return json({ ok: true });
});
