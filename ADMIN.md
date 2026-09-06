# Panel de contenido (`/admin`)

CMS para las **plantillas de Notion** ("productos") del sitio. Los datos viven en
Supabase (Postgres + Storage). Las páginas del catálogo son **SSR**: altas,
ediciones y bajas se ven **sin volver a desplegar** (~1 min de cache de borde).

## Roles

| | Super admin (tú) | Editora (la clienta) |
|---|:---:|:---:|
| Ver / entrar al panel | ✅ | ✅ |
| Crear, editar, mostrar/ocultar, reordenar y **eliminar** productos | ✅ | ✅ |
| Editar textos SEO (título, meta description, h1), copy ES/EN largo y FAQ | ✅ | ❌ |
| Editar el `slug` (URL) de un producto | ✅ | ❌ |
| Crear / desactivar cuentas (`/admin/usuarios`) | ✅ | ❌ |
| Ver el registro de cambios (`/admin/registro`) | ✅ | ❌ |

La editora usa un **formulario sencillo**: nombre, precio, enlace de compra,
imagen, orden. Al crear un producto entra **oculto** (`active=false`) hasta que
el super admin completa la ficha (o la editora lo muestra desde la lista).

Los textos de la página de un producto creado por la editora se **derivan del
nombre** (título = nombre, intro y meta genéricas, "qué incluye" y FAQ vacíos).
El super admin los completa desde su formulario completo.

## Cómo se usa

1. Entrar a **`https://www.alquimialab.shop/admin`** con **correo + contraseña**
   (Supabase Auth). "¿Olvidaste la contraseña?" envía un enlace de Supabase.
2. **Lista de productos**: editar, mostrar/ocultar, reordenar (▲▼) o eliminar.
   "Oculta" = sigue en la base pero su página devuelve 404 y sale del catálogo.
3. **Nuevo / Editar**: formulario según el rol. La imagen se comprime en el
   navegador a WebP antes de subirse.
4. **Guardar** → el dato queda en Supabase al instante; el sitio lo refleja en
   **~1 minuto** (cache de borde 60 s + cache interno 10 s). No hay deploy.
5. **Deshacer un error**: volver a editar y guardar. Un borrado guarda la fila
   completa en el registro (`/admin/registro`) para poder recrearla a mano.

## Arquitectura

| Pieza | Dónde |
|---|---|
| Datos | Supabase, tabla `public.plantillas` (proyecto `Alquimia-Lab`, `xgeddcqutgwtxfftnxoe`) |
| Usuarios / rol | Supabase Auth + `public.profiles` (`role`) + `auth.users.app_metadata.role` (viaja en el JWT) |
| Registro de cambios | `public.audit_log` (solo lo lee el super admin) |
| Imágenes | Supabase Storage, bucket público `productos` |
| Lectura del sitio | `src/lib/catalog.ts` → `getPlantillas()` (clave publicable, RLS: solo `active`), cache TTL 10 s |
| Sesión | `@supabase/ssr` → cookies `httpOnly` `sb-*-auth-token`; `src/lib/session.ts` + `src/middleware.ts` |
| Escritura | `src/pages/api/admin/*` con la **secret key** (service_role, solo servidor). Cada escritura comprueba el rol y deja fila en `audit_log` |
| Esquema | `db/schema.sql` (foto) · migraciones aplicadas con el MCP de Supabase |

### Endpoints (`prerender = false`)

| Método | Ruta | Rol |
|---|---|---|
| `POST` | `/api/admin/login` · `/api/admin/logout` | público / con sesión |
| `GET` | `/api/admin/productos` | ambos |
| `POST` | `/api/admin/productos` | ambos (editor → payload sencillo, entra oculto) |
| `PATCH` | `/api/admin/productos/:slug` | ambos (editor: solo campos comerciales; `es`/`en`/`slug` → 403) |
| `POST` | `/api/admin/productos/:slug/visibility` | ambos |
| `POST` | `/api/admin/productos/reorder` | ambos |
| `DELETE` | `/api/admin/productos/:slug` | ambos |
| `POST` | `/api/admin/upload` | ambos |
| `GET`/`POST` | `/api/admin/usuarios` | **superadmin** |
| `POST` | `/api/admin/usuarios/:id/disable` | **superadmin** |

**Rutas SSR públicas**: `/plantillas-notion`, `/plantillas-notion/[slug]`,
`/productos` (y `/en/`), con `Cache-Control: public, s-maxage=60,
stale-while-revalidate=86400`. El resto del sitio sigue estático.

## Variables de entorno

`.env.local` en local; las mismas en **Vercel → Settings → Environment
Variables** (Production + Preview):

| Var | Qué es |
|---|---|
| `SUPABASE_URL` | Origen del proyecto (`https://xgeddcqutgwtxfftnxoe.supabase.co`) |
| `SUPABASE_KEY` | Clave **publicable** (`sb_publishable_…`). Lectura pública, respeta RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave **secreta** (`sb_secret_…`). Escritura + `auth.admin.*`. Nunca en el navegador |

Ya **no** se usan `ADMIN_PASSWORD` ni `SESSION_SECRET` (los gestionaba la cookie
HMAC casera). Se pueden borrar de Vercel.

## Pendientes de configuración

- [ ] Cargar las 3 variables en Vercel (Production **y** Preview) y borrar
      `ADMIN_PASSWORD` / `SESSION_SECRET`.
- [ ] Supabase → **Authentication → Providers → Email**: dejar activo el login
      por contraseña y **desactivar "Enable signups"** (las cuentas las crea el
      super admin desde `/admin/usuarios`).
- [ ] Supabase → **Authentication → Policies**: activar *Leaked password
      protection* (avisa el linter de seguridad).
- [ ] Supabase → **Authentication → URL Configuration**: Site URL =
      `https://www.alquimialab.shop` (para el correo de "reset password").
- [ ] Cambiar la contraseña del super admin tras el primer acceso.
- [ ] Crear la cuenta de la clienta en `/admin/usuarios` (rol *Editora*) y
      pasarle la contraseña por un canal seguro.
- [ ] Cloudflare → Cache Rules: **Bypass cache** para `/admin*` y `/api/*`.
      Para `/plantillas-notion*` y `/productos`, respetar el `s-maxage` del
      origen (no "Cache Everything" con TTL largo).
- [ ] (Opcional) Supabase plan Pro o un cron de ping: el free tier pausa el
      proyecto tras ~1 semana inactivo; con SSR, una pausa deja el catálogo
      caído hasta que responda.

## Nota sobre el build local (Windows)

`pnpm build` completa el sitio pero **falla en el último paso** (empaquetado de
la función serverless) por un límite de symlinks de Windows con pnpm dentro de
OneDrive. **No afecta a Vercel** (Linux). Verificación local sin build completo:
`pnpm astro check` y `pnpm astro dev`.
