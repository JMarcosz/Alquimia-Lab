export const prerender = false;

import type { APIRoute } from 'astro';
import { adminSetActive } from '../../../lib/catalog';

export const POST: APIRoute = async ({ request, url, redirect }) => {
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== url.host) return new Response('Origen no permitido', { status: 403 });

  const form = await request.formData();
  const slug = String(form.get('slug') ?? '');
  const active = String(form.get('active') ?? '') === '1';
  if (!slug) return new Response('Falta slug', { status: 400 });

  await adminSetActive(slug, active);
  return redirect('/admin?ok=saved', 302);
};
