/**
 * Sesión del panel con Supabase Auth (email + contraseña).
 *
 * Reemplaza la cookie HMAC casera de `auth.ts`. `@supabase/ssr` guarda el
 * access/refresh token en cookies `httpOnly` y las renueva solo. El rol viaja
 * dentro del JWT (`app_metadata.role`), así que el middleware autoriza sin
 * consultar la base.
 *
 * Las variables NO llevan prefijo `PUBLIC_`: solo existen en contexto de
 * servidor (build + SSR). El bundle del cliente no las incluye.
 */
import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

const url = import.meta.env.SUPABASE_URL;
const anonKey = import.meta.env.SUPABASE_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Faltan SUPABASE_URL / SUPABASE_KEY. Definilas en `.env.local` (local) y en ' +
      'Vercel → Settings → Environment Variables (deploy).',
  );
}

export type Role = 'superadmin' | 'editor';

/** Parser de la cabecera `Cookie` sin dependencias frágiles. */
function parseCookieHeader(header: string | null): { name: string; value: string }[] {
  if (!header) return [];
  return header
    .split(';')
    .map((pair) => {
      const eq = pair.indexOf('=');
      if (eq < 0) return null;
      const name = pair.slice(0, eq).trim();
      if (!name) return null;
      let value = pair.slice(eq + 1).trim();
      try {
        value = decodeURIComponent(value);
      } catch {
        /* deja el valor crudo */
      }
      return { name, value };
    })
    .filter((c): c is { name: string; value: string } => c !== null);
}

/**
 * Cliente de Supabase ligado a las cookies del request/response de Astro.
 * Usar en middleware y en las rutas `/api/admin/*`.
 */
export function createSupabaseServerClient(
  cookies: AstroCookies,
  headers: Headers,
): SupabaseClient {
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(headers.get('Cookie'));
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          // El panel es 100% server-side: el token nunca lo necesita el JS del
          // navegador, así que lo forzamos `httpOnly` + `secure` en producción.
          cookies.set(name, value, {
            ...(options as CookieOptionsWithName),
            httpOnly: true,
            sameSite: 'lax',
            secure: import.meta.env.PROD,
            path: '/',
          });
        }
      },
    },
  });
}

/** Rol efectivo leído del JWT. `editor` por defecto si falta. */
export function roleOf(user: User | null | undefined): Role | null {
  if (!user) return null;
  const r = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  return r === 'superadmin' ? 'superadmin' : 'editor';
}
