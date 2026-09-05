/**
 * Protege el panel. Todo lo que cuelga de `/admin` y `/api/admin` exige sesión,
 * salvo el propio login. El resto del sitio pasa sin tocar (y en el build
 * estático este middleware ni se ejecuta para esas rutas).
 */
import { defineMiddleware } from 'astro:middleware';
import { verifySession, SESSION_COOKIE } from './lib/auth';

const PUBLIC_PATHS = new Set([
  '/admin/login',
  '/api/admin/login',
  '/api/admin/logout',
]);

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  const isGuarded =
    (pathname === '/admin' ||
      pathname.startsWith('/admin/') ||
      pathname.startsWith('/api/admin/')) &&
    !PUBLIC_PATHS.has(pathname);

  if (!isGuarded) return next();

  const ok = verifySession(context.cookies.get(SESSION_COOKIE)?.value);
  if (ok) return next();

  if (pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }
  return context.redirect(`/admin/login?next=${encodeURIComponent(pathname)}`, 302);
});
