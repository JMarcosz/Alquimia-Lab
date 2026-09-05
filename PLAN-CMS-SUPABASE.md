# Opción rápida — Panel admin con Supabase (persistencia real)

> Reemplaza el modelo "commit al repo" del plan anterior. Ahora los datos viven
> en Postgres (Supabase) y las imágenes en Supabase Storage. El guardado
> persiste **al instante** en la base; la publicación al sitio se hace con un
> rebuild disparado por la propia ruta de guardado (~1–2 min) para no tocar el
> SEO estático actual (sitemap + hreflang).
>
> **Sin dependencias nuevas:** todo se hace con `fetch` contra la API REST de
> Supabase (PostgREST + Storage). `@supabase/supabase-js` es opcional.

---

## 1. Qué cambia respecto al plan anterior

| Antes (Alternativa A) | Ahora (Supabase) |
|---|---|
| JSON en el repo, cada guardado = commit | Filas en Postgres, cada guardado = `UPSERT` |
| Imágenes commiteadas en `public/uploads/` | Supabase Storage (bucket público) |
| Sin librería posible | Sin librería igualmente (REST + `fetch`) |
| Rollback = `git revert` | Rollback = editar de nuevo / restaurar desde `updated_at` (o snapshots de Supabase) |
| Auth: Cloudflare Access + cookie | Igual, o Supabase Auth (magic link) más adelante |

Lo que **no** cambia: las páginas de producto siguen siendo estáticas
(pre-render en build), el sitemap y el emparejado hreflang siguen intactos, y el
componente `<Pic>` legado se mantiene para las imágenes actuales.

---

## 2. Modelo de datos en Supabase

Una fila por producto. `es`/`en` como `jsonb` (misma forma que la interfaz
`Plantilla` actual, así el resto del código no cambia).

```sql
-- Tabla
create table public.plantillas (
  slug        text primary key,
  name        text        not null,
  price       text        not null,          -- "$9.99" | "Free"
  href        text        not null,          -- enlace externo de compra
  img         text,                          -- legado <Pic>: nombre en src/assets/img
  icon        text,                          -- nombre de icono Lucide
  image_url   text,                          -- subidas nuevas: URL pública de Storage
  active      boolean     not null default true,
  sort        int         not null default 0,
  es          jsonb       not null,          -- {title, metaDescription, h1, short, intro, forWho[], includes[], faq[]}
  en          jsonb       not null,
  updated_at  timestamptz not null default now()
);

create trigger set_updated_at before update on public.plantillas
  for each row execute function extensions.moddatetime(updated_at);

-- RLS: lectura pública solo de activos; escritura solo service_role (bypassa RLS)
alter table public.plantillas enable row level security;

create policy "public read active"
  on public.plantillas for select
  using (active = true);
-- (no se crea ninguna policy de insert/update/delete → el anon key no puede escribir)

-- Storage: bucket público para imágenes de producto
insert into storage.buckets (id, name, public)
  values ('productos', 'productos', true);

create policy "public read productos"
  on storage.objects for select
  using (bucket_id = 'productos');
-- (escritura solo desde el servidor con service_role)
```

Si más adelante entran los **servicios** (`servicios.ts`), misma tabla `servicios`
con el mismo patrón.

---

## 3. Variables de entorno (Vercel → Production y Preview)

| Var | Uso | ¿Cliente? |
|---|---|---|
| `SUPABASE_URL` | Endpoint del proyecto | server |
| `SUPABASE_ANON_KEY` | Lectura pública (respeta RLS: solo `active`). Se usa en build y en el `/admin` para listar | server |
| `SUPABASE_SERVICE_ROLE_KEY` | **Acceso total, bypassa RLS.** Solo en `/api/admin/*`. Nunca con prefijo `PUBLIC_`, nunca en el bundle | server, secreto |
| `ADMIN_PASSWORD` | Contraseña del panel | server, secreto |
| `SESSION_SECRET` | Firma HMAC de la cookie de sesión (32+ bytes) | server, secreto |
| `VERCEL_DEPLOY_HOOK_URL` | URL del Deploy Hook de Vercel; la ruta de guardado hace `POST` aquí para rebuild | server, secreto |

---

## 4. Acceso a los datos desde el sitio

Nuevo módulo `src/lib/catalog.ts` — **cero dependencias**, solo `fetch` a PostgREST:

```ts
import type { Plantilla } from '../data/plantillas'; // se conserva solo la interfaz

const URL = import.meta.env.SUPABASE_URL;
const KEY = import.meta.env.SUPABASE_ANON_KEY;

export async function getPlantillas(): Promise<Plantilla[]> {
  const r = await fetch(
    `${URL}/rest/v1/plantillas?select=*&order=sort.asc`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } },
  );
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  return (await r.json()).map(rowToPlantilla);
}

export async function getPlantilla(slug: string) {
  return (await getPlantillas()).find((p) => p.slug === slug);
}

// mapea fila plana → forma que ya consumen los componentes
function rowToPlantilla(row: any): Plantilla {
  return {
    slug: row.slug, name: row.name, price: row.price, href: row.href,
    img: row.img ?? undefined, icon: row.icon ?? undefined,
    image: row.image_url ?? undefined, active: row.active,
    es: row.es, en: row.en,
  };
}
```

**Cambios en el código existente** (mínimos, ~4 sitios):

| Archivo | Cambio |
|---|---|
| `src/data/plantillas.ts` | Se queda **solo con la `interface Plantilla`** (+ campo nuevo `image?` y `active?`). Se borra el array y `getPlantilla` |
| `src/pages/plantillas-notion/[slug].astro` y `/en/...` | `getStaticPaths` pasa a `async` y usa `await getPlantillas()` |
| `src/components/pages/PlantillasIndexPage.astro` y su variante EN | `const plantillas = await getPlantillas()` en el frontmatter en vez del `import` |
| `src/components/pages/ProductosPage.astro` | Igual, si consume `plantillas` |

### Estrategia de render — **recomendada (rápida): SSG + Deploy Hook**

- `getStaticPaths` lee de Supabase **en el build** → páginas 100 % estáticas.
- La ruta `/api/admin/save`, tras escribir en la DB, hace
  `fetch(VERCEL_DEPLOY_HOOK_URL, { method: 'POST' })` → Vercel reconstruye.
- Cambio visible en ~1–2 min. Sitemap y hreflang **intactos** (siguen saliendo
  de `getStaticPaths`).
- Un botón **"Guardar"** (solo DB, borrador) y otro **"Publicar"** (DB + Deploy
  Hook) si el cliente hace varias ediciones seguidas y no quieres un deploy por
  cada una. Hobby = 100 deploys/día.

### Variante instantánea (si hace falta): ISR

`@astrojs/vercel` admite `isr`. Las páginas se sirven estáticas pero se
revalidan bajo demanda con un token; `/api/admin/save` llama a la URL de
revalidación en vez del Deploy Hook. Cambio visible en segundos, sin rebuild
completo, y **siguen en el sitemap**. Más piezas → dejar para v2.

---

## 5. Migración de los 8 productos actuales

Script único `scripts/seed-supabase.mjs` (se corre una vez en local):

```js
import { plantillas } from '../src/data/plantillas.legacy.ts'; // copia del .ts actual antes de vaciarlo

const URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const rows = plantillas.map((p, i) => ({
  slug: p.slug, name: p.name, price: p.price, href: p.href,
  img: p.img ?? null, icon: p.icon ?? null, image_url: null,
  active: true, sort: i, es: p.es, en: p.en,
}));

const r = await fetch(`${URL}/rest/v1/plantillas?on_conflict=slug`, {
  method: 'POST',
  headers: {
    apikey: SERVICE, Authorization: `Bearer ${SERVICE}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates',
  },
  body: JSON.stringify(rows),
});
console.log(r.status, await r.text());
```

Verificar: `npm run build` reconstruye leyendo de Supabase y el sitio queda
idéntico al actual.

---

## 6. Rutas admin + autenticación (versión rápida)

Todas con `export const prerender = false`.

| Ruta | Función |
|---|---|
| `src/pages/api/admin/login.ts` | Compara `ADMIN_PASSWORD` con `crypto.timingSafeEqual` + retardo. Emite cookie `__Host-alq_sess` = payload + `HMAC-SHA256(SESSION_SECRET)`, `Secure; HttpOnly; SameSite=Lax`. **`node:crypto`, sin librería** |
| `src/pages/api/admin/logout.ts` | Borra la cookie |
| `src/pages/api/admin/save.ts` | Verifica cookie → valida payload (ES **y** EN completos, `slug` `^[a-z0-9-]+$` y único, `price` con formato, `href` URL) → `UPSERT` a Supabase con **service_role** → `POST` al Deploy Hook → responde |
| `src/pages/api/admin/upload.ts` | Verifica cookie → sube el WebP a Storage con service_role → devuelve la URL pública (ver §7) |
| `src/pages/admin/index.astro` | Lista de productos con toggle activo/inactivo y orden |
| `src/pages/admin/editar/[slug].astro`, `src/pages/admin/nuevo.astro` | Formulario **ES y EN lado a lado**, validación en vivo, no guarda incompleto, drag&drop de imagen con vista previa y peso final |
| `src/middleware.ts` | Protege `/admin` y `/api/admin/*`: valida la cookie (y/o el JWT `Cf-Access-Jwt-Assertion` si activas Cloudflare Access). Redirige a `/admin/login` |

**UPSERT desde `save.ts`:**

```ts
await fetch(`${URL}/rest/v1/plantillas?on_conflict=slug`, {
  method: 'POST',
  headers: {
    apikey: SERVICE, Authorization: `Bearer ${SERVICE}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=representation',
  },
  body: JSON.stringify(row),
});
```

Como **todas** las escrituras pasan por el servidor con `service_role` y el
`anon key` solo puede leer filas `active`, el navegador nunca tiene capacidad de
escritura. RLS cubre el resto.

**Upgrade de auth (v2):** Supabase Auth con magic link a el/los correo(s) del
cliente — sin contraseña que compartir. Requiere manejar la sesión de Supabase
en el middleware.

---

## 7. Subida y compresión de imágenes

**Compresión en el navegador** (sin librería, honra el requisito original):

```js
async function comprimir(file, maxW = 1600, quality = 0.8) {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, maxW / img.width);
  const canvas = new OffscreenCanvas(img.width * scale, img.height * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.convertToBlob({ type: 'image/webp', quality }); // ~60–200 KB típico
}
```

Flujo:
1. El admin comprime el archivo y muestra el peso resultante.
2. `POST /api/admin/upload` con el blob WebP.
3. La ruta lo sube a Storage:
   `PUT ${URL}/storage/v1/object/productos/${slug}-${Date.now()}.webp`
   con `Authorization: Bearer ${SERVICE}` y `Content-Type: image/webp`.
4. URL pública resultante:
   `${URL}/storage/v1/object/public/productos/${filename}` → se guarda en
   `image_url`.
5. Render: `<img src={image_url} width height loading="lazy" decoding="async">`
   cuando existe; si no, se usa `<Pic name={img}>` legado; si no, `<Icon>`.

EXIF se descarta al pasar por canvas. Validar tamaño en servidor y rechazar
>3 MB (límite de payload de función Vercel = 4.5 MB).

Alternativa de mayor calidad: `sharp` (ya es dependencia del repo) en
`upload.ts` para generar AVIF + varios anchos. Dejar para v2.

---

## 8. Fases de implementación

| Fase | Entregable |
|---|---|
| 1 | Proyecto Supabase + SQL de §2 (tabla, RLS, bucket, políticas). Env vars en Vercel. Crear el Deploy Hook |
| 2 | `src/lib/catalog.ts` + adelgazar `plantillas.ts` a la interfaz + adaptar los ~4 sitios que consumen `plantillas` (`getStaticPaths` async). **Sin cambios visibles** |
| 3 | `scripts/seed-supabase.mjs` → cargar los 8 productos. `npm run build` verde leyendo de Supabase. Verificar sitio idéntico |
| 4 | Auth: `login`/`logout`, cookie HMAC, `src/middleware.ts`. `/admin` protegido con la lista (solo lectura) |
| 5 | `/api/admin/save` + formulario ES/EN con validación (sin imagen aún). UPSERT → Deploy Hook. Probar ciclo completo |
| 6 | `/api/admin/upload` + compresión en navegador + render `<img>` de `image_url` |
| 7 | `active` (mostrar/ocultar), alta de producto nuevo, borrado lógico (`active=false`) + redirect de la URL si se elimina de verdad |
| 8 | Endurecer: Cloudflare *bypass cache* en `/admin*` y `/api/*`, `noindex` + `Disallow: /admin` (robots + sitemap filter), rate-limit en `/api/admin/login`, chequeo de `Origin` en los POST |
| 9 | Manual breve para el cliente (guardar vs publicar, cuánto tarda, cómo se deshace un cambio) |

---

## 9. Riesgos y notas

- **Supabase free tier pausa el proyecto tras ~1 semana de inactividad.** El
  primer request tras la pausa es lento y **puede tumbar un build**. Para
  producción: plan Pro, o un cron (Cloudflare Worker / GitHub Action) que haga
  ping diario, o cachear el último catálogo bueno como fallback en el build.
- `getStaticPaths` ahora depende de la red en el build → añadir 1–2 reintentos y
  fallar con mensaje claro si Supabase no responde.
- `SUPABASE_SERVICE_ROLE_KEY` = acceso total a la DB. Solo en env de servidor,
  jamás `PUBLIC_`, jamás en código que llegue al navegador. Revisar el bundle.
- Cada "Publicar" = 1 deploy (Hobby 100/día) → botón separado guardar/publicar
  si el cliente edita en tandas.
- Cambios en la DB no se ven hasta el rebuild (estrategia SSG). El manual debe
  dejarlo claro: "Guardar" persiste, "Publicar" lo hace visible en ~2 min.
- Bucket `productos` es público: cualquiera con la URL ve la imagen (aceptable
  para imágenes de catálogo).
- `alquimialab.vercel.app` y las URLs de preview saltan Cloudflare → el
  middleware de la app es imprescindible aunque actives Cloudflare Access.
- Excluir `/admin` de `sitemap` (`filter`) y `robots.txt`; añadir `noindex`.
- Probar en local: `astro dev` con las env de un **proyecto Supabase de
  pruebas** o la misma DB con cuidado; el Deploy Hook no debe dispararse en dev
  (guardar el `POST` tras `import.meta.env.PROD`).

---

## 10. Preguntas para arrancar

1. **Alcance:** ¿solo "plantillas" (8), o también "servicios" (4)?
2. **Publicación:** ¿SSG + Deploy Hook (~1–2 min, recomendado) o vamos directo a
   ISR para que sea en segundos?
3. **Auth:** ¿contraseña compartida + cookie (rápido), o Supabase Auth magic
   link desde ya? ¿Qué correo(s) del cliente?
4. **Campos editables por el cliente:** ¿todo el copy ES/EN, o solo nombre,
   precio, imagen, enlace y activo/inactivo?
5. **Altas y borrados** por el cliente, ¿o solo editar/ocultar los existentes?
6. **Plan de Supabase:** ¿free (con el riesgo de pausa) o Pro desde el inicio?
</content>
