/**
 * Protege el panel. Todo lo que cuelga de `/admin` y `/api/admin` exige sesión
 * de Supabase Auth, salvo el login. Además:
 *  - pone `locals.user` y `locals.role` para las páginas y endpoints;
 *  - restringe las rutas de usuarios y de registro al rol `superadmin`.
 *
 * En el build estático este middleware no se ejecuta para las páginas
 * prerenderizadas: solo corre en las rutas SSR (`prerender = false`).
 */
import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient, roleOf } from './lib/session';

const LOGIN_PATHS = new Set(['/admin/login', '/api/admin/login', '/api/admin/logout']);

const SUPERADMIN_PREFIXES = ['/admin/usuarios', '/admin/registro', '/api/admin/usuarios', '/api/admin/registro'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isPanel =
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/api/admin/');

  if (!isPanel) return next();

  const supabase = createSupabaseServerClient(context.cookies, context.request.headers);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.user = user ?? null;
  context.locals.role = roleOf(user);

  if (LOGIN_PATHS.has(pathname)) return next();

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
    return context.redirect(`/admin/login?next=${encodeURIComponent(pathname)}`, 302);
  }

  if (SUPERADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (context.locals.role !== 'superadmin') {
      if (pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({ error: 'Solo el superadmin' }), {
          status: 403,
          headers: { 'content-type': 'application/json' },
        });
      }
      return context.redirect('/admin?e=forbidden', 302);
    }
  }

  return next();
});
