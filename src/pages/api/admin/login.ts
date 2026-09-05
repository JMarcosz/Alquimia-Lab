export const prerender = false;

import type { APIRoute } from 'astro';
import { checkPassword, issueSession, SESSION_COOKIE, SESSION_MAX_AGE } from '../../../lib/auth';

function sameOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // navegación normal de formulario
  try {
    return new URL(origin).host === url.host;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request, url, cookies, redirect }) => {
  if (!sameOrigin(request, url)) return new Response('Origen no permitido', { status: 403 });

  const form = await request.formData();
  const password = String(form.get('password') ?? '');
  const next = String(form.get('next') ?? '/admin');
  const safeNext = next.startsWith('/admin') ? next : '/admin';

  // pequeño retardo anti fuerza bruta
  await new Promise((r) => setTimeout(r, 400));

  if (!password || !checkPassword(password)) {
    return redirect(`/admin/login?e=1&next=${encodeURIComponent(safeNext)}`, 302);
  }

  cookies.set(SESSION_COOKIE, issueSession(), {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
  });
  return redirect(safeNext, 302);
};
