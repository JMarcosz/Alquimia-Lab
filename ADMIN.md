# Panel de contenido (`/admin`)

Sistema tipo CMS para gestionar las **plantillas de Notion** del sitio. Los
datos viven en Supabase (Postgres + Storage). Las páginas del catálogo son
**SSR**: se renderizan en cada visita leyendo de la base, así que altas,
ediciones y bajas se ven **sin volver a desplegar**.

## Cómo se usa

1. Entrar a **`https://www.alquimialab.shop/admin`** e introducir la contraseña.
2. **Lista de plantillas**: editar, mostrar/ocultar u ordenar. "Oculta" = sigue
   en la base pero su página devuelve 404 y desaparece del catálogo.
3. **Editar / Nueva**: formulario con español e inglés lado a lado. Los dos
   idiomas son obligatorios. La imagen se comprime en el navegador a WebP antes
   de subirse.
4. **Guardar** → el dato queda en Supabase al instante. El sitio lo refleja en
   **~1 minuto** (cache de borde de 60 s + cache interno de 10 s). No hay
   deploy.
5. **Deshacer un error**: volver a editar y guardar.

## Arquitectura

| Pieza | Dónde |
|---|---|
| Datos | Supabase, tabla `public.plantillas` (proyecto `Alquimia-Lab`) |
| Imágenes | Supabase Storage, bucket público `productos` |
| Lectura del sitio | `src/lib/catalog.ts` → `getPlantillas()` (clave publicable, RLS: solo `active`), cache TTL 10 s |
| Escritura | `src/pages/api/admin/*` con la **secret key** (solo servidor) |
| Sesión | Cookie firmada HMAC-SHA256, `src/lib/auth.ts` + `src/middleware.ts` |
| Esquema / semilla | `db/schema.sql`, `db/plantillas.seed.json`, `scripts/seed-supabase.mjs` |

**Rutas SSR** (`prerender = false`): `/admin/*`, `/api/admin/*`,
`/plantillas-notion`, `/plantillas-notion/[slug]`, `/productos` (y sus `/en/`).
Con `Cache-Control: public, s-maxage=60, stale-while-revalidate=86400` en las
públicas. El resto del sitio sigue estático.

**Sitemap**: las URLs SSR ya no las descubre el crawler del build; se listan en
`astro.config.mjs` (`customPages`), resueltas desde Supabase en cada build. Un
producto nuevo entra al sitemap en el **siguiente build**; mientras tanto Google
lo alcanza por los enlaces internos del hub (SSR, siempre al día) y la página
lleva su `hreflang` en el `<head>`.

**Footer**: se renderiza en las páginas estáticas del resto del sitio, que se
generan en el build. Si se borra o reordena una plantilla del top-4, esos
footers quedan desactualizados hasta el próximo build (la página borrada
devuelve 404, no rompe). El hub y las páginas de producto sí están siempre al
día.

## Variables de entorno

`.env.local` en local; las mismas en **Vercel → Settings → Environment
Variables** (Production + Preview):

| Var | Qué es | Se usa en |
|---|---|---|
| `SUPABASE_URL` | Origen del proyecto: `https://xgeddcqutgwtxfftnxoe.supabase.co` (sin `/rest/v1/`) | build + runtime |
| `SUPABASE_KEY` | Clave **publicable** (`sb_publishable_…`). Lectura pública, respeta RLS | build + runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave **secreta** (`sb_secret_…`). Escritura. Nunca en el navegador | runtime `/api/admin/*` |
| `ADMIN_PASSWORD` | Contraseña del panel | runtime `/api/admin/login` |
| `SESSION_SECRET` | Firma de la cookie (32+ bytes aleatorios) | runtime `/admin`, `/api/admin` |

Ya **no** hace falta `VERCEL_DEPLOY_HOOK_URL`: el modelo SSR no dispara deploys.

## Pendientes de configuración

- [ ] Cargar las 5 variables en Vercel (Production **y** Preview).
- [ ] Cambiar `ADMIN_PASSWORD` (temporal: `alquimia-temporal-2026`).
- [ ] Cloudflare → Cache Rules: **Bypass cache** para `/admin*` y `/api/*`.
      Para `/plantillas-notion*` y `/productos`, respetar el `s-maxage` del
      origen (no "Cache Everything" con TTL largo).
- [ ] (Opcional) Cloudflare Access sobre `/admin*` como segunda capa de login.
- [ ] (Opcional) Supabase plan Pro o un cron de ping: el free tier pausa el
      proyecto tras ~1 semana inactivo; con SSR, una pausa deja el catálogo
      caído hasta que responda (las demás páginas estáticas siguen vivas).

## Nota sobre el build local (Windows)

`pnpm build` completa el sitio pero **falla en el último paso** (empaquetado de
la función serverless) por un límite de symlinks de Windows con pnpm dentro de
OneDrive. **No afecta a Vercel** (Linux). Para arreglarlo en local: activar
*Modo de programador* (Ajustes → Sistema → Para programadores) o abrir la
terminal como administrador. Verificación local sin build completo:
`pnpm astro check` y `pnpm astro dev`.
