# Plan — Backend de productos con roles (super admin + clienta)

> Portafolio de Isabel. Tú (dueño del repo) eres **super admin**: puedes todo.
> La **clienta** entra con su propia cuenta y solo gestiona **productos**
> (plantillas de Notion): crear, editar, ocultar/mostrar, borrar y reordenar.
> Toda la escritura pasa a la base (Supabase). Nada de contraseña compartida.
>
> **Alcance de esta fase:** solo productos. Servicios, FAQ editables y consultas
> de visitantes quedan para más adelante (ver §14).

---

## 1. Qué cambia respecto a hoy

| Hoy | Con este plan |
|---|---|
| Una sola contraseña (`ADMIN_PASSWORD`) + cookie HMAC casera | **Supabase Auth**: email + contraseña, una cuenta por persona |
| No hay usuarios ni roles | Tabla `profiles` con rol `superadmin` \| `editor`. Rol también en el JWT (`app_metadata`) |
| Cualquiera que entra al panel puede todo | Guardas por rol en cada endpoint y en el middleware |
| `/api/admin/save` (upsert + delete) y `/api/admin/toggle` | Endpoints REST de productos con contrato claro y control de rol |
| Formulario único con todos los campos, incluido SEO | **Formulario según rol**: la clienta ve uno sencillo; tú ves el completo |
| Sin rastro de quién cambió qué | Tabla `audit_log`: quién, qué, cuándo |
| Alta de nueva plantilla exige rellenar título SEO, meta, h1… | La clienta solo pone nombre, precio, enlace e imagen; el resto se deriva solo |

Lo que **no** cambia: las páginas del sitio siguen leyendo con la clave
publicable y RLS (`getPlantillas()` en [`src/lib/catalog.ts`](src/lib/catalog.ts)),
el catálogo sigue SSR, el sitemap y el hreflang siguen igual.

---

## 2. Roles y permisos

| Acción | `superadmin` (tú) | `editor` (clienta) |
|---|:---:|:---:|
| Entrar al panel | ✅ | ✅ |
| Ver lista de productos | ✅ | ✅ |
| Crear producto (formulario sencillo) | ✅ | ✅ |
| Editar campos comerciales (nombre, precio, enlace, imagen, orden) | ✅ | ✅ |
| Ocultar / mostrar producto | ✅ | ✅ |
| Reordenar productos | ✅ | ✅ |
| Borrar producto | ✅ | ✅ |
| Editar textos SEO (título, meta description, h1), copy largo ES/EN, FAQ | ✅ | ❌ |
| Editar el `slug` (URL) de un producto | ✅ | ❌ |
| Crear / desactivar cuentas de usuario | ✅ | ❌ |
| Ver el registro de cambios | ✅ | ❌ |
| Gestionar servicios | ⏳ fase 2 | ⏳ fase 2 |

**Campos que toca la clienta al crear/editar un producto:**
`name`, `price` (`"$9.99"` \| `"Free"`), `href` (enlace de compra), imagen
(subida → `image_url`) o `icon`, `sort`, `active`. Nada más.

El `slug` se genera solo a partir del nombre en el alta (kebab-case, único; si
choca se le añade `-2`, `-3`…) y luego queda bloqueado para el rol `editor`.

---

## 3. Modelo de datos (SQL, se aplica con el MCP de Supabase)

### 3.1 `profiles` — usuarios del panel y su rol

```sql
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text not null default 'editor' check (role in ('superadmin','editor')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada quien lee su propia fila; el listado de usuarios del panel se hace
-- desde el servidor con service_role.
create policy "self read" on public.profiles
  for select to authenticated using (id = auth.uid());
```

### 3.2 Alta automática de `profiles` al crear un usuario

```sql
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, coalesce(new.raw_app_meta_data->>'role', 'editor'));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 3.3 `plantillas` — columnas nuevas (la tabla ya existe, 8 filas)

```sql
alter table public.plantillas
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_by uuid references auth.users(id),
  add column if not exists created_at timestamptz not null default now();

-- El staff autenticado ve también las filas ocultas (para la lista del panel).
-- La lectura pública sigue limitada a active = true (policy ya existente).
create policy "staff read all" on public.plantillas
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid()));
```

Las escrituras en `plantillas` **siguen sin policy**: solo se hacen desde
`/api/admin/*` con la clave `service_role`, que ignora RLS. El rol se comprueba
en el endpoint antes de escribir.

### 3.4 `audit_log` — registro de cambios

```sql
create table public.audit_log (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor_id    uuid references auth.users(id),
  actor_email text,
  actor_role  text,
  action      text not null check (action in
                ('create','update','delete','show','hide','reorder','login','user_create')),
  entity      text not null default 'plantilla',
  entity_id   text,                       -- slug del producto
  summary     text,                       -- "Editó precio: $9 → $12"
  diff        jsonb                        -- { antes, despues } de los campos tocados
);

alter table public.audit_log enable row level security;

create policy "superadmin read" on public.audit_log
  for select to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = auth.uid() and p.role = 'superadmin'));
```

---

## 4. Autenticación

- **Proveedor:** Supabase Auth, método email + contraseña.
- En el panel de Supabase: activar *Email*, **desactivar el registro público**
  (invite-only). Las cuentas las crea el super admin.
- **Rol en dos sitios:**
  - `profiles.role` → para listar usuarios y decidir qué UI mostrar.
  - `auth.users.app_metadata.role` → viaja dentro del JWT, así el middleware
    autoriza sin consultar la base en cada request.
- **Sesión en el servidor:** `@supabase/ssr` (`createServerClient`) con
  adaptador de cookies de Astro. Cookies `httpOnly`, `Secure`, `SameSite=Lax`.
  (Alternativa sin dependencia nueva: verificar el JWT a mano con `jose` — más
  código; ver decisión C en §12.)
- **Flujo de login:** `/admin/login` hace `POST` (form) → el endpoint llama
  `supabase.auth.signInWithPassword` → set-cookie → redirect a `/admin`.
  Se mantiene el chequeo de `Origin` que ya hacen los endpoints actuales.
- **Recuperar contraseña:** enlace "¿Olvidaste tu contraseña?" →
  `supabase.auth.resetPasswordForEmail` → correo de Supabase.

---

## 5. Endpoints del backend

Todos bajo `src/pages/api/admin/`, todos con `export const prerender = false`,
todos verifican sesión (middleware) y, dentro, el rol.

| Método | Ruta | Roles | Cuerpo | Efecto |
|---|---|---|---|---|
| `POST` | `/api/admin/login` | público | `email`, `password` (form) | Inicia sesión Supabase, set-cookie, redirect. Registra `login` en auditoría |
| `POST` | `/api/admin/logout` | ambos | — | `signOut`, limpia cookies |
| `GET` | `/api/admin/session` | ambos | — | `{ email, role }` del usuario actual (para la UI) |
| `GET` | `/api/admin/productos` | ambos | — | Lista **todas** las filas (incluidas ocultas), ordenadas por `sort` |
| `POST` | `/api/admin/productos` | ambos | payload sencillo (§6) | Crea. Deriva `slug` y los bloques `es`/`en` mínimos. Auditoría `create` |
| `PATCH` | `/api/admin/productos/:slug` | ambos | campos a cambiar | Actualiza. `editor` solo puede mandar campos comerciales; si manda SEO/`slug` → `403`. Auditoría `update` con `diff` |
| `POST` | `/api/admin/productos/:slug/visibility` | ambos | `active: boolean` | Muestra/oculta. Auditoría `show`/`hide` |
| `POST` | `/api/admin/productos/reorder` | ambos | `[{ slug, sort }]` | Reordena en lote. Auditoría `reorder` |
| `DELETE` | `/api/admin/productos/:slug` | ambos | — | Borra la fila. Auditoría `delete` (guarda copia en `diff`) |
| `POST` | `/api/admin/upload` | ambos | `image/*` (binario) | Sube a Storage `productos`, devuelve URL pública. **Ya existe**, solo se le añade guarda de sesión real |
| `POST` | `/api/admin/usuarios` | **superadmin** | `email`, `role` | `auth.admin.createUser` con contraseña temporal + `app_metadata.role`. Devuelve la contraseña una vez. Auditoría `user_create` |
| `GET` | `/api/admin/usuarios` | **superadmin** | — | Lista de cuentas y su rol |
| `POST` | `/api/admin/usuarios/:id/disable` | **superadmin** | — | Banea la cuenta (`auth.admin.updateUserById`, `ban_duration`) |
| `GET` | `/api/admin/registro` | **superadmin** | `?limit&offset` | Página del `audit_log` |

Se **eliminan** `/api/admin/save.ts` y `/api/admin/toggle.ts` (su función queda
cubierta por lo de arriba). Se reescriben `login.ts` y `logout.ts`.

### Patrón interno de cada endpoint de escritura

1. Middleware ya validó la sesión y puso `locals.user` + `locals.role`.
2. Comprobar rol permitido para la acción. Si no → `403`.
3. Si el rol es `editor`, filtrar el payload a la lista blanca de campos
   comerciales (ignora/rechaza el resto).
4. Validar (§6).
5. Escribir con el cliente `service_role` ([`createAdminClient()`](src/lib/supabase.ts)).
6. Insertar fila en `audit_log` con `actor_*`, `action`, `entity_id`, `diff`.
7. Responder `{ ok: true, ... }`.

---

## 6. Validación y creación "sencilla"

Se parte [`src/lib/validate.ts`](src/lib/validate.ts) en dos:

- **`validateEditorInput`** (rol `editor`, alta y edición):
  - `name` obligatorio.
  - `price`: `"Free"` o `"$" + número` (regex actual).
  - `href`: URL `http(s)` válida.
  - imagen: `image_url` **o** `icon` presente.
  - `sort`: entero ≥ 0 (por defecto, al final de la lista).
  - `active`: booleano (por defecto `true`).
  - **No acepta** `slug`, `es`, `en`, `img`.

- **`validateFullInput`** (rol `superadmin`): la validación actual completa,
  con `es`/`en`, títulos ≤ 60, meta 70–160, FAQ, etc.

**Derivación automática al crear como `editor`** (para que la página de producto
renderice y no rompa el SEO):

| Campo | Valor derivado |
|---|---|
| `slug` | `kebab(name)`, único |
| `es.title` / `en.title` | `name` (recortado a 60) |
| `es.h1` / `es.short` | `name` |
| `es.metaDescription` | plantilla: `"{name} — plantilla de Notion{ , gratuita \| ($price) }. Descárgala y organiza tu trabajo."` (ajustada a 70–160) |
| `es.intro` | plantilla corta basada en `name` |
| `en.*` | equivalente en inglés |
| `forWho`, `includes`, `faq` | `[]` |

Como `includes` queda vacío, la validación completa dejaría de pasar: para el
alta de `editor` ese requisito baja a *aviso*. Tú completas el copy real cuando
quieras desde el formulario de super admin. **Decisión A (§12):** ¿el producto
recién creado por la clienta se publica visible al momento, o entra oculto hasta
que tú lo revises?

---

## 7. Middleware y guardas

Reescribir [`src/middleware.ts`](src/middleware.ts):

```
Para /admin/* y /api/admin/*  (salvo /admin/login y /api/admin/login|logout):
  1. createServerClient con las cookies del request.
  2. const { data: { user } } = await supabase.auth.getUser()
  3. Sin user:
       - ruta /api/  → 401 JSON
       - ruta /admin → redirect /admin/login?next=...
  4. locals.user  = user
     locals.role  = user.app_metadata.role ?? 'editor'
  5. Rutas solo-superadmin (/admin/usuarios, /admin/registro,
     /api/admin/usuarios*, /api/admin/registro):
       locals.role !== 'superadmin'  → 403 / redirect a /admin
```

---

## 8. Panel admin (UI por rol)

| Página | Rol | Notas |
|---|---|---|
| `/admin/login` | público | email + contraseña + "olvidé mi contraseña" |
| `/admin` (lista) | ambos | tabla de productos; acciones (editar, ocultar, borrar, subir/bajar orden). Botón "+ Nuevo" |
| `/admin/nuevo` | ambos | **form según rol**: `editor` → nombre, precio, enlace, imagen. `superadmin` → + slug + pestañas ES/EN + FAQ |
| `/admin/editar/[slug]` | ambos | igual, con los datos cargados. `editor` no ve la sección SEO/FAQ ni el campo slug |
| `/admin/usuarios` | superadmin | crear cuenta de la clienta, ver cuentas, desactivar, mostrar contraseña temporal una vez |
| `/admin/registro` | superadmin | tabla del `audit_log` con filtros por actor y acción |

[`AdminLayout.astro`](src/layouts/AdminLayout.astro): mostrar el email y una
etiqueta con el rol; ocultar del menú "Usuarios" y "Registro" cuando el rol es
`editor`. La imagen se sigue comprimiendo en el navegador a WebP antes de subir
(código ya existente).

---

## 9. Variables de entorno

| Var | Estado |
|---|---|
| `SUPABASE_URL` | se mantiene |
| `SUPABASE_KEY` (publicable / anon) | se mantiene (lectura pública del sitio) |
| `SUPABASE_SERVICE_ROLE_KEY` | se mantiene (escritura + `auth.admin.*` en los endpoints) |
| `ADMIN_PASSWORD` | **se elimina** |
| `SESSION_SECRET` | **se elimina** (Supabase gestiona los tokens) |

En el panel de Supabase → Authentication: activar Email, desactivar "Enable
signups", configurar el correo de "reset password" y el Site URL
(`https://www.alquimialab.shop`).

---

## 10. Fases de implementación

| Fase | Entregable | Verificación |
|---|---|---|
| 1 | Migración SQL con el MCP: `profiles`, trigger, `audit_log`, columnas nuevas en `plantillas`, policies. Crear **tu** cuenta super admin (dashboard) y `update profiles set role='superadmin'` | `list_tables` muestra las tablas; tu usuario tiene rol correcto |
| 2 | `@supabase/ssr` + helper `src/lib/session.ts`. Reescribir `login.ts`, `logout.ts`, `middleware.ts` | Login con tu cuenta entra a `/admin`; sin sesión redirige |
| 3 | Endpoints de productos (`GET/POST/PATCH/DELETE`, visibility, reorder) con guarda de rol y auditoría. Borrar `save.ts` y `toggle.ts`, adaptar la lista `/admin` | Ciclo completo crear→editar→ocultar→borrar como super admin; cada acción deja fila en `audit_log` |
| 4 | Partir `validate.ts` (`validateEditorInput` + derivación). Formulario `/admin/nuevo` y `/admin/editar` según rol | Crear un producto solo con nombre/precio/enlace/imagen; la página `/plantillas-notion/[slug]` renderiza |
| 5 | `/api/admin/usuarios*` + `/admin/usuarios`. Crear la cuenta de la clienta (rol `editor`) | La clienta entra, ve solo el form sencillo, no ve "Usuarios" ni "Registro", un `PATCH` con campo SEO le da 403 |
| 6 | `/admin/registro` (vista del `audit_log`) | Se ven los cambios de ambos usuarios |
| 7 | Limpieza: quitar `ADMIN_PASSWORD`/`SESSION_SECRET` de Vercel y del código, `db/schema.sql` actualizado, `ADMIN.md` reescrito, breve manual para la clienta | `astro check` limpio; build de Vercel verde |

---

## 11. Riesgos y notas

- **Supabase free tier pausa el proyecto tras ~1 semana sin actividad.** Con el
  catálogo en SSR, una pausa deja `/productos` y `/plantillas-notion/*` caídos
  hasta que responda. No entra en esta fase (no marcaste el keep-alive), pero
  conviene un cron de ping o el plan Pro antes de entregar a la clienta.
- **Borrado duro:** la clienta puede borrar productos y no hay papelera (no se
  incluyó "borrado suave"). Mitigación mínima: el endpoint guarda la fila
  completa en `audit_log.diff` antes de borrar, así se puede recrear a mano.
  Reconsiderar si quieres una papelera real.
- `SUPABASE_SERVICE_ROLE_KEY` da acceso total: solo en env de servidor, nunca
  con prefijo `PUBLIC_`, nunca en el bundle del cliente. Igual que hoy.
- `getUser()` en el middleware valida el token contra Supabase en cada request
  (no confía solo en la firma local). Añade una llamada de red por request al
  panel; es aceptable para el volumen de un panel de una persona.
- Mantener `/admin` fuera del sitemap y con `noindex` (ya está en
  `astro.config.mjs` y `robots.txt`).

---

## 12. Decisiones (resueltas en la implementación)

- **A. Producto creado por la clienta → entra OCULTO** (`active=false`). La
  clienta puede mostrarlo desde la lista cuando esté listo.
- **B. Borrado DURO.** Antes de borrar, el endpoint guarda la fila completa en
  `audit_log.diff` para poder recrearla a mano.
- **C. Sesión con `@supabase/ssr`** (cookies `httpOnly`, refresh automático).
- **D. Super admin: `jeanmarte22@gmail.com`.** La cuenta de la clienta se crea
  desde `/admin/usuarios` (rol *Editora*).
- **E. FAQ:** no se editan desde el panel. Las de los 8 productos siguen igual;
  el super admin las gestiona con su formulario completo si hace falta.

> Nota: al editar con el **formulario completo** (super admin) un producto que
> creó la clienta, la validación exige rellenar "qué incluye" y una meta
> description de 70–160 (estaban vacíos/derivados). Es el momento de completar
> el copy real.

---

## 13. Fase 2 (fuera de alcance ahora)

- Migrar **servicios** (`src/data/servicios.ts`, 4 filas) a una tabla `servicios`
  con el mismo patrón ES/EN y los mismos endpoints/roles.
- FAQ editables desde el panel (como lista de pares pregunta/respuesta).
- Formulario de contacto que guarde las consultas en la base en vez de `mailto:`.
- Migrar el contenido de portafolio / social / UX / branding / ai-characters.
