/**
 * Utilidades comunes de las rutas `/api/admin/*`.
 * El middleware ya validó la sesión y puso `locals.user` / `locals.role`.
 */
import type { APIContext } from 'astro';
import type { Role } from './session';

export const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

/** El POST/PATCH/DELETE debe venir del mismo origen (anti-CSRF básico). */
export function sameOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false; // fetch() siempre manda Origin
  try {
    return new URL(origin).host === url.host;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(typeof body === 'string' ? body : JSON.stringify(body));
  }
}

/** Exige sesión. Devuelve el usuario o lanza `ApiError` 401. */
export function requireUser(locals: App.Locals) {
  if (!locals.user) throw new ApiError(401, { error: 'No autorizado' });
  return locals.user;
}

/** Exige uno de los roles dados. Lanza `ApiError` 403 si no. */
export function requireRole(locals: App.Locals, ...roles: Role[]) {
  const user = requireUser(locals);
  if (!locals.role || !roles.includes(locals.role)) {
    throw new ApiError(403, { error: 'Tu rol no permite esta acción' });
  }
  return { user, role: locals.role };
}

/** Envuelve un handler: traduce `ApiError` a Response y valida el origen. */
export function guard(
  handler: (ctx: APIContext) => Promise<Response>,
  opts: { checkOrigin?: boolean } = {},
) {
  return async (ctx: APIContext): Promise<Response> => {
    try {
      const safe = ['GET', 'HEAD', 'OPTIONS'].includes(ctx.request.method);
      if (!safe && opts.checkOrigin !== false && !sameOrigin(ctx.request, ctx.url)) {
        return json({ error: 'Origen no permitido' }, 403);
      }
      return await handler(ctx);
    } catch (err) {
      if (err instanceof ApiError) return json(err.body, err.status);
      console.error('[api] error no controlado:', err);
      return json({ error: err instanceof Error ? err.message : 'Error interno' }, 500);
    }
  };
}

export async function readJson<T = unknown>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError(400, { error: 'JSON inválido' });
  }
}
