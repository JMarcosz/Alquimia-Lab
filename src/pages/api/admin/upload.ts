export const prerender = false;

import type { APIRoute } from 'astro';
import { createAdminClient } from '../../../lib/supabase';
import { json, sameOrigin, requireRole } from '../../../lib/api';

const BUCKET = 'productos';
const MAX_BYTES = 3 * 1024 * 1024;

export const POST: APIRoute = async ({ request, url, locals }) => {
  try {
    requireRole(locals, 'superadmin', 'editor');
  } catch {
    return json({ error: 'No autorizado' }, 401);
  }
  if (!sameOrigin(request, url)) return json({ error: 'Origen no permitido' }, 403);

  const type = request.headers.get('content-type') ?? '';
  if (!type.startsWith('image/')) return json({ error: 'Se espera un cuerpo image/*' }, 415);

  const buf = await request.arrayBuffer();
  if (buf.byteLength === 0) return json({ error: 'Archivo vacío' }, 400);
  if (buf.byteLength > MAX_BYTES) return json({ error: 'La imagen supera 3 MB' }, 413);

  const rawSlug = (url.searchParams.get('slug') || 'plantilla')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'plantilla';
  const ext = type === 'image/png' ? 'png' : type === 'image/jpeg' ? 'jpg' : 'webp';
  const path = `${rawSlug}-${Date.now()}.${ext}`;

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: type,
    upsert: true,
    cacheControl: '31536000',
  });
  if (error) return json({ error: `Storage: ${error.message}` }, 500);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return json({ ok: true, url: data.publicUrl, path, bytes: buf.byteLength });
};
