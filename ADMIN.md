# Panel de contenido (`/admin`)

Sistema tipo CMS para gestionar las **plantillas de Notion** del sitio. Los
datos viven en Supabase (Postgres + Storage); las páginas del sitio siguen
siendo estáticas y se regeneran con un deploy tras cada cambio.

## Cómo se usa

1. Entrar a **`https://www.alquimialab.shop/admin`** e introducir la contraseña.
2. **Lista de plantillas**: editar, mostrar/ocultar u ordenar. "Oculta" = sigue
   en la base pero no se publica (su URL deja de existir en el próximo build).
3. **Editar / Nueva**: formulario con español e inglés lado a lado. Los dos
   idiomas son obligatorios. La imagen se comprime en el navegador a WebP antes
   de subirse.
4. **Guardar y publicar** → el dato queda en Supabase al instante y se dispara
   un rebuild de Vercel. El sitio muestra el cambio en **1-2 minutos**.
5. **Deshacer un error**: volver a editar y guardar, o revertir el último
   deploy desde el panel de Vercel ("Instant Rollback").

## Arquitectura

| Pieza | Dónde |
|---|---|
| Datos | Supabase, tabla `public.plantillas` (proyecto `Alquimia-Lab`) |
| Imágenes | Supabase Storage, bucket público `productos` |
| Lectura del sitio | `src/lib/catalog.ts` → `getPlantillas()` (clave publicable, RLS: solo `active`) |
| Escritura | `src/pages/api/admin/*` con la **secret key** (solo servidor) |
| Sesión | Cookie firmada HMAC-SHA256, `src/lib/auth.ts` + `src/middleware.ts` |
| Publicación | `src/lib/deploy.ts` → Deploy Hook de Vercel |
| Esquema / semilla | `db/schema.sql`, `db/plantillas.seed.json`, `scripts/seed-supabase.mjs` |

Rutas: `/admin` (lista), `/admin/nuevo`, `/admin/editar/[slug]`, `/admin/login`.
APIs: `/api/admin/{login,logout,save,toggle,upload}`. Todo `prerender = false`.

## Variables de entorno

`.env.local` en local; las mismas en **Vercel → Settings → Environment
Variables** (Production + Preview):

| Var | Qué es |
|---|---|
| `SUPABASE_URL` | URL del proyecto |
| `SUPABASE_KEY` | Clave **publicable** (`sb_publishable_…`). Lectura pública, respeta RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave **secreta** (`sb_secret_…`). Escritura. Nunca en el navegador |
| `ADMIN_PASSWORD` | Contraseña del panel |
| `SESSION_SECRET` | Firma de la cookie (32+ bytes aleatorios) |
| `VERCEL_DEPLOY_HOOK_URL` | Deploy Hook de la rama `main`. Sin esto, el guardado persiste pero no publica |

## Pendientes de configuración

- [ ] Cargar las 6 variables en Vercel (Production + Preview).
- [ ] Crear el **Deploy Hook**: Vercel → Settings → Git → Deploy Hooks, rama `main`.
- [ ] Cambiar `ADMIN_PASSWORD` (ahora es temporal: `alquimia-temporal-2026`).
- [ ] Cloudflare → Cache Rules: **Bypass cache** para `/admin*` y `/api/*`.
- [ ] (Opcional) Cloudflare Access sobre `/admin*` como segunda capa de login.
- [ ] (Opcional) Supabase plan Pro o un cron de ping: el free tier pausa el
      proyecto tras ~1 semana inactivo y el primer request tras la pausa puede
      hacer fallar un build.

## Nota sobre el build local (Windows)

`pnpm build` completa el sitio estático pero **falla en el último paso**
(empaquetado de la función serverless) por un límite de symlinks de Windows con
pnpm dentro de OneDrive. **No afecta a Vercel** (Linux). Para arreglarlo en
local: activar *Modo de programador* (Ajustes → Sistema → Para programadores) o
abrir la terminal como administrador. Verificación local sin build completo:
`pnpm astro check` y `pnpm astro dev`.
