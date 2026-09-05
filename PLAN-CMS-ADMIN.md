# Plan y levantamiento — Panel admin tipo CMS (serverless en Vercel)

> Objetivo: que el cliente entre a `/admin`, edite/añada/active los productos
> (hoy en `src/data/plantillas.ts`), suba imágenes que se comprimen, y todo eso
> **sin base de datos externa ni librerías nuevas de servidor**, sobre el
> despliegue actual (Astro `output: 'static'` + `@astrojs/vercel`, Cloudflare
> delante para DNS/redirección/caché).

---

## 1. La restricción que define todo el diseño

**El sistema de archivos de una función serverless en Vercel es de solo
lectura.** `/tmp` es escribible pero **efímero** (se borra al reciclar la
instancia) y **no compartido** entre invocaciones. Conclusión:

- Un archivo `plantillas.json` incluido en el repo **no se puede reescribir en
  runtime**. Si lo editas en memoria, el cambio se pierde en la siguiente
  petición.
- Por tanto, "base de datos JSON sin complemento externo" en Vercel **solo es
  viable si el guardado escribe de vuelta en algún sitio persistente**. La única
  opción que no añade infraestructura ni servicio aparte es: **escribir el JSON
  de vuelta en el repositorio de GitHub vía su API REST** (un `commit`), lo que
  dispara un redeploy automático de Vercel.

Eso da exactamente lo que pides:

| Requisito | Cómo se cumple |
|---|---|
| "Base de datos tipo JSON" | Un archivo `src/data/plantillas.json` versionado en el repo |
| "Sin librería ni complemento externo" | Solo `fetch` contra `api.github.com` con un token en variable de entorno. Cero SDK, cero DB, cero add-on de Vercel |
| "Serverless en Vercel" | Rutas API de Astro con `export const prerender = false` (funciones de Vercel) |
| Historial / backups / rollback | Gratis: es git. Cada guardado es un commit; revertir = `git revert` o "Instant Rollback" de Vercel |
| SEO/rendimiento actuales intactos | Las páginas de producto siguen siendo HTML estático pre-renderizado |

**Coste del modelo:** cada guardado = un commit = un despliegue. Un cambio tarda
**~1–2 min** en verse en producción. Para un catálogo que se edita unas veces
por semana es irrelevante; si necesitas que sea instantáneo, ver §8 (Alternativa
D, con su compromiso de rendimiento).

### Descartado explícitamente

- **`/tmp` + sincronización**: no persiste. No es una opción real.
- **Vercel KV / Blob / Postgres**: son add-ons de Vercel con su propio panel y
  SDK → incumplen "sin complemento externo". Se mencionan solo como vía de
  escape futura (§8, Alternativa B).
- **Servicio JSON externo (JSONBin, Gist como DB, etc.)**: externo.

---

## 2. Estado actual del que partimos (levantamiento del código)

| Elemento | Situación hoy | Impacto en el plan |
|---|---|---|
| Datos de producto | `src/data/plantillas.ts`: `export const plantillas: Plantilla[]` con **8 entradas** (plantillas de Notion). También `src/data/servicios.ts` con **4 servicios** | Hay que migrar `.ts` → `.json` sin perder los tipos en el resto del código |
| Modelo de datos | Bilingüe **obligatorio** `es` + `en` (una traducción faltante = error de compilación). Campos: `slug`, `name`, `img?`, `icon?`, `price` (string, p. ej. `"$9.99"` / `"Free"`), `href` (enlace externo de compra), y por idioma `title`, `metaDescription`, `h1`, `short`, `intro`, `forWho[]`, `includes[]`, `faq[]` | El formulario admin debe exigir ES **y** EN antes de permitir guardar |
| Consumo de los datos | `src/pages/plantillas-notion/[slug].astro` y `/en/...` usan `getStaticPaths()` sobre `plantillas`. `PlantillasIndexPage.astro` filtra por `price` (`/free/i`) | Si migramos a JSON manteniendo el mismo `export const plantillas`, **estas páginas no cambian** |
| Imágenes de producto | `img` = nombre de archivo en `src/assets/img/`. Se renderizan con `<Pic>`, que **no** usa `astro:assets`: lee `src/image-manifest.json` y sirve variantes **AVIF/WebP pre-generadas a mano** con `npm run images` (`scripts/build-images.mjs`) y commiteadas en `public/img/opt/` | **Clave:** el pipeline de imágenes es de build local, no admite subidas en runtime. Una imagen subida por el cliente **no puede pasar por `<Pic>`** sin regenerar el manifest en local. Necesita una ruta de render aparte (ver §5) |
| Puertas de build | `npm run build` = `astro check && astro build && node scripts/check-assets.mjs && node scripts/check-meta.mjs`. `check-assets.mjs` valida que toda URL de imagen en el JSON-LD resuelva a un archivo real | Un commit con datos inválidos → **deploy en rojo → Vercel mantiene la versión buena anterior**. Buen modo de fallo, pero hay que devolver el estado del build al panel |
| Adaptador | `@astrojs/vercel` v11, Astro v7, `output: 'static'` + `adapter: vercel()`. SSR bajo demanda disponible por ruta con `prerender = false` | Ya está todo para crear rutas API sin tocar config |
| `sharp` | Ya es dependencia (lo usan los scripts de build) | Disponible si se quiere compresión/variantes en el servidor (§5, opción B) |
| Hosting / red | Vercel (build estático) + Cloudflare delante (DNS, redirects, caché). Dominio `www.alquimialab.shop`. `alquimialab.vercel.app` 308→ dominio | Cloudflare puede cachear HTML/API y romper el panel → reglas de bypass obligatorias (§6) |
| i18n | `prefixDefaultLocale: false` (ES en `/`, EN en `/en/`), `trailingSlash: 'never'` | `/admin` no se ve afectado. Hay que excluir `/admin` de sitemap y `robots.txt` |

---

## 3. Arquitectura propuesta (Alternativa A — recomendada)

```
Cliente (navegador)
  │  1. GET /admin           → Cloudflare Access pide login (email/Google)
  ▼
Panel admin (Astro, prerender=false)
  │  2. Carga plantillas.json (lectura directa del repo, va en el bundle)
  │  3. Cliente edita / sube imagen (compresión en el navegador, Canvas API)
  │  4. POST /api/admin/save  (JSON del producto + imagen en base64)
  ▼
Función serverless /api/admin/save (Vercel)
  │  5. Verifica sesión (cookie firmada) + valida datos (ES+EN, slug, etc.)
  │  6. GitHub API: lee plantillas.json actual + su SHA
  │  7. GitHub Git Data API: crea blob(s) [json + imagen] → tree → commit → update ref
  │     (UN solo commit atómico: nunca queda el JSON apuntando a una imagen ausente)
  ▼
GitHub  →  webhook  →  Vercel redeploy  →  build estático  →  live (~1–2 min)
  │
  └─ check-assets.mjs / check-meta.mjs actúan de red de seguridad
```

### Piezas a construir

| # | Pieza | Detalle |
|---|---|---|
| 3.1 | **Migración de datos** | Script `scripts/migrate-data.mjs`: lee `plantillas.ts`, escribe `src/data/plantillas.json`. Las FAQ hoy son constantes compartidas (`FAQ_ES`/`FAQ_EN`) → se **inlinean** en cada producto en el JSON (el cliente podrá personalizarlas). Igual para `servicios.ts` **si entra en alcance** (pregunta abierta §9.1) |
| 3.2 | **Loader tipado** | `plantillas.ts` pasa a: `import data from './plantillas.json'; export const plantillas = data as Plantilla[];` Se conservan `interface Plantilla` y `getPlantilla()`. **El resto del código no se toca.** `tsconfig` de Astro ya trae `resolveJsonModule` |
| 3.3 | **Esquema + validador** | `scripts/check-data.mjs` (nueva puerta en `build`): valida estructura, `slug` único y con formato `^[a-z0-9-]+$`, `price` con formato, `href` URL válida, imagen referenciada existe, ES y EN completos. Mismo validador se reutiliza en la función `/api/admin/save` |
| 3.4 | **Rutas API** (`src/pages/api/admin/*.ts`, `prerender = false`) | `login.ts` (comprueba `ADMIN_PASSWORD`, emite cookie HMAC), `logout.ts`, `save.ts` (crear/editar producto + imagen), `delete.ts` (opcional), `status.ts` (consulta a la API de despliegues de Vercel el estado del último commit para mostrar "Publicando… / Publicado / Error") |
| 3.5 | **Middleware** (`src/middleware.ts`) | Protege `/admin` y `/api/admin/*`: valida la cookie firmada y/o el JWT `Cf-Access-Jwt-Assertion` de Cloudflare Access. Redirige a `/admin/login` si falta |
| 3.6 | **UI del panel** (`src/pages/admin/*.astro`, `prerender = false`) | `index` (lista de productos con toggle activo/inactivo), `editar/[slug]`, `nuevo`. Formulario **ES y EN lado a lado**, validación en vivo, no deja guardar incompleto. Drag&drop de imagen con vista previa + tamaño resultante |
| 3.7 | **Cliente API GitHub** | Módulo `src/lib/github.ts`: `getFile(path) → {content, sha}` y `commitFiles([{path, content}], message)` usando `fetch` + `GITHUB_TOKEN`. Sin dependencias |
| 3.8 | **Config** | `astro.config.mjs` sitemap `filter`: excluir `/admin`. `src/pages/robots.txt.ts`: `Disallow: /admin`. `vercel.json`: cabeceras `noindex` para `/admin/*`. Reglas de Cloudflare (§6) |
| 3.9 | **Campo `active`** | Nuevo booleano por producto. `getStaticPaths` e índices filtran `p.active !== false`. Permite ocultar sin borrar |

---

## 4. Modelo de datos (`plantillas.json`)

Se mantiene 1:1 con la interfaz `Plantilla` actual + dos campos nuevos:

```jsonc
{
  "version": 1,
  "updatedAt": "2026-09-05T00:00:00Z",
  "items": [
    {
      "slug": "crm-para-freelancers",
      "name": "Freelancer CRM - Planner",
      "active": true,                 // NUEVO: activar/desactivar sin borrar
      "image": "/uploads/crm-freelancers-a1b2c3.webp", // subidas nuevas; ver §5
      "img": "cover-freelancer-crm.webp",              // legado <Pic> (se mantiene mientras exista)
      "icon": null,
      "price": "$9.99",
      "href": "https://bordergaze.gumroad.com/l/FreelancerCRM?wanted=true",
      "es": { "title": "...", "metaDescription": "...", "h1": "...", "short": "...",
              "intro": "...", "forWho": ["..."], "includes": ["..."],
              "faq": [{ "q": "...", "a": "..." }] },
      "en": { "...igual..." }
    }
  ]
}
```

Notas:
- `version` + `updatedAt` para migraciones futuras y para detectar ediciones
  concurrentes.
- Se conserva `img` (pipeline `<Pic>` legado) y se añade `image` (ruta directa a
  subida nueva). El componente de tarjeta decide: si hay `image` → `<img>`
  normal; si no y hay `img` → `<Pic>`; si no → `<Icon>`.

---

## 5. Subida y compresión de imágenes

El pipeline `<Pic>` actual (variantes AVIF/WebP hasheadas + `image-manifest.json`
generado en local) **no puede ingerir subidas en runtime**. Dos caminos:

### Opción B1 — Compresión en el navegador (recomendada por "sin librería")

- En el formulario admin, al soltar la imagen: `<canvas>` la redibuja a un ancho
  máximo (p. ej. 1600 px), `canvas.toBlob(blob, 'image/webp', 0.8)`.
- Se sube el WebP ya reducido (típicamente 60–200 KB). Se muestra al cliente el
  peso final antes de guardar.
- La función la commitea en `public/uploads/<slug>-<hash>.webp` (Vercel copia
  `public/` tal cual; cabecera de caché larga por hash en el nombre).
- Render: `<img src="/uploads/..." width height loading="lazy" decoding="async">`.
- **Cero librería de servidor.** EXIF se descarta al pasar por canvas (bonus de
  privacidad). Límite de payload de función Vercel = 4.5 MB; validar y rechazar
  >3 MB en servidor.

### Opción B2 — `sharp` en la función (mayor calidad, ya está instalado)

- La función recibe el archivo original y con `sharp` genera WebP (y opcional
  AVIF) + varios anchos, e incluso **actualiza el `image-manifest.json`** para que la
  imagen fluya por `<Pic>` sin cambiar el render.
- `sharp` es técnicamente una "librería", pero **ya es dependencia del repo**
  (lo usan `build-images.mjs` y `check-assets.mjs`), así que no añade nada nuevo
  a instalar.
- Más código en la función y commits más pesados (varias variantes por imagen).

**Recomendación:** empezar con **B1** (simple, correcto, honra el requisito). Si
más adelante se quiere AVIF responsive en las imágenes del catálogo, migrar a
B2. En ambos casos las imágenes viven en el repo; para un catálogo de decenas de
imágenes <200 KB el crecimiento del historial de git es despreciable durante
años (Vercel Blob es la vía de escape si algún día pesa).

---

## 6. Cloudflare (delante de Vercel)

| Regla | Motivo |
|---|---|
| **Bypass cache** para `/admin*` y `/api/*` | Si Cloudflare cachea una página de admin o una respuesta de API, el panel se rompe (contenido de otro usuario, respuestas obsoletas) |
| No cachear HTML, **o** purgar caché tras deploy | Las páginas de producto son HTML estático en el CDN de Vercel. Si Cloudflare tiene "Cache Everything" para HTML, tras un redeploy puede servir producto obsoleto. Opciones: (a) no cachear HTML en CF; (b) Deploy Hook de Vercel → purga la caché de CF vía API; (c) TTL de edge corto |
| Cookies de sesión: asegurar que CF no las filtra/riesga | Usar cookie `__Host-` con `Secure; HttpOnly; SameSite=Lax` |
| Regla de rate-limiting en `/api/admin/login` | Freno a fuerza bruta sin código |

**Aviso:** Cloudflare Access solo protege el tráfico que pasa por Cloudflare. El
origen `alquimialab.vercel.app` y cualquier URL de preview de Vercel **saltan
Cloudflare**. Por eso el middleware de la app **también** valida la cookie
propia (defensa en profundidad), y conviene activar *Deployment Protection* de
Vercel en previews.

---

## 7. Autenticación (doble capa)

1. **Cloudflare Access** sobre `/admin*` y `/api/admin/*` (self-service, cero
   código). Login por email OTP o Google para el/los correo(s) del cliente.
   Aporta MFA y registro de accesos. — *Pregunta abierta §9.4: ¿qué correos?*
2. **Capa de app** (defensa en profundidad y para `astro dev` local):
   - `POST /api/admin/login` compara contra `ADMIN_PASSWORD` con
     `crypto.timingSafeEqual` + pequeño retardo artificial.
   - Emite cookie `__Host-alq_sess` = payload + HMAC-SHA256(`SESSION_SECRET`)
     con caducidad. **Node `crypto`, sin librería.**
   - `src/middleware.ts` valida cookie y/o JWT de CF Access en cada `/admin` y
     `/api/admin`.
   - Chequeo de `Origin`/`Referer` en los POST (anti-CSRF) + `SameSite=Lax`.

**Variables de entorno** (Vercel → Production y Preview; ninguna con prefijo
`PUBLIC_`):

| Var | Uso |
|---|---|
| `GITHUB_TOKEN` | PAT *fine-grained*, un solo repo, permiso *Contents: Read and write* |
| `GITHUB_REPO` / `GITHUB_BRANCH` | p. ej. `JMarcosz/Alquimia-Lab` / `main` (o una rama `contenido`) |
| `SESSION_SECRET` | Firma de la cookie (32+ bytes aleatorios) |
| `ADMIN_PASSWORD` | Contraseña del panel (capa de app) |
| `CF_ACCESS_TEAM_DOMAIN` / `CF_ACCESS_AUD` | Validar el JWT de Cloudflare Access (opcional) |
| `VERCEL_API_TOKEN` | Leer estado de despliegue para el indicador "Publicando…" (opcional) |

---

## 8. Alternativas (si cambian las prioridades)

| Alt. | Qué es | Cuándo elegirla | Contra |
|---|---|---|---|
| **A (recomendada)** | JSON en el repo + commit-back vía API de GitHub | El catálogo se edita ocasionalmente y el SEO estático es prioridad | Cambio visible en ~1–2 min; consume 1 deploy por guardado (Hobby: 100/día) |
| **B** | Vercel Blob o KV para el JSON y las imágenes | Si algún día hay muchas ediciones/hora o el repo pesa | Es un add-on de Vercel con SDK → incumple "sin complemento externo" |
| **D** | Páginas de producto en **SSR** (`prerender = false`) leyendo el JSON desde `raw.githubusercontent.com` en cada request (con caché de edge) | Si se necesita que el cambio se vea en **segundos**, sin deploy | Se pierde parte del rendimiento/SEO estático que la arquitectura actual defiende a propósito; hay que gestionar caché con cuidado. Híbrido posible: estático + ISR/On-Demand Revalidation de Vercel disparada por la función |

Se puede empezar por **A** y evolucionar a un híbrido **A+D con ISR** sin tirar
nada.

---

## 9. Preguntas abiertas (necesito tu respuesta para cerrar el plan)

1. **Alcance de contenido:** ¿solo "plantillas" (los 8 productos actuales), o
   también "servicios" (`servicios.ts`, 4) y/o otras secciones?
2. **Latencia aceptable:** ¿está bien que un cambio tarde ~1–2 min en verse
   (modelo commit→deploy, Alternativa A), o necesitas que sea casi instantáneo
   (implica SSR, Alternativa D, con coste de rendimiento/SEO)?
3. **Almacén = GitHub:** ¿te sirve que el "JSON DB" sea un archivo versionado en
   el propio repo y que **cada guardado sea un commit**? Es la única forma de
   "JSON sin base de datos externa" que persiste en Vercel. Si no, la única
   alternativa real es Vercel Blob/KV (add-on de Vercel).
4. **Auth / Cloudflare Access:** ¿lo activo como puerta principal? ¿Qué correo(s)
   del cliente tendrán acceso? (Si no quieres Cloudflare Access, nos quedamos
   solo con contraseña + cookie firmada.)
5. **Imágenes:** ¿ok comprimir en el navegador (Canvas API, sin librería) y
   servir un `<img>` normal desde `public/uploads/` (Opción B1), o quieres que
   pasen por el pipeline `<Pic>` AVIF/WebP responsive usando `sharp` en la
   función (Opción B2, más trabajo pero ya tienes `sharp`)?
6. **Campos editables por el cliente:** ¿edita **todo** (title, metaDescription,
   h1, short, intro, forWho, includes, faq — en ES y EN), o solo un subconjunto
   (nombre, precio, imagen, enlace, activo/inactivo) y el copy SEO lo llevas tú?
7. **Alta de productos nuevos** por el cliente, ¿o solo editar y
   activar/desactivar los existentes?
8. **Borrado:** ¿permitir eliminar productos? Implica gestionar la URL muerta
   (redirect 301 o dejar 404) para no perder SEO.
9. **Flujo de guardado:** ¿un botón "Publicar" que agrupa varios cambios en un
   commit/deploy, o guardar cada cambio al instante (más deploys)?
10. **Rama de trabajo:** ¿los commits van directos a `main`, o a una rama
    `contenido` que revisas antes de fusionar?

---

## 10. Fases de implementación (una vez cerradas las preguntas)

| Fase | Entregable | Depende de |
|---|---|---|
| 0 | Crear `GITHUB_TOKEN`, `SESSION_SECRET`, `ADMIN_PASSWORD` en Vercel. (Opc.) configurar Cloudflare Access | Respuestas §9.3, §9.4 |
| 1 | Migración `plantillas.ts` → `plantillas.json` + loader tipado + `check-data.mjs`. **Sin cambios visibles en el sitio.** Verificar `npm run build` verde | — |
| 2 | `src/lib/github.ts` (getFile/commitFiles) + prueba con `DRY_RUN` (loguea el commit en vez de hacer push) | Fase 0, 1 |
| 3 | Auth: `login`/`logout`, cookie HMAC, `src/middleware.ts`. Ruta `/admin` protegida mostrando la lista de productos (solo lectura) | Fase 0 |
| 4 | `/api/admin/save` (crear/editar, sin imagen aún) + formulario ES/EN con validación. Commit real a rama de pruebas | Fase 2, 3 |
| 5 | Subida de imagen (Opción elegida en §9.5): compresión, commit atómico JSON+imagen, render en tarjetas/página de producto | Fase 4 |
| 6 | `active` (activar/desactivar), borrado (si aplica §9.8) + redirect | Fase 4 |
| 7 | Indicador de estado de publicación (`/api/admin/status` vs API de Vercel), mensajes claros al cliente ("Publicado, visible en ~2 min") | Fase 4 |
| 8 | Endurecimiento: reglas de caché/rate-limit en Cloudflare, `noindex`/`robots`/`sitemap` para `/admin`, repaso CSRF, retardo en login | Todas |
| 9 | Manual breve para el cliente (cómo editar, cuánto tarda, cómo se revierte un error) | Todas |

---

## 11. Checklist de riesgos a vigilar

- [ ] Commit atómico JSON + imagen (nunca JSON apuntando a imagen inexistente → `check-assets.mjs` tumbaría el build).
- [ ] Conflicto de SHA en la API de GitHub si hay dos guardados seguidos → reintentar leyendo el SHA nuevo, o rechazar con "recarga, alguien editó".
- [ ] Cloudflare cacheando `/admin` o `/api` → bypass obligatorio antes de la primera demo.
- [ ] `alquimialab.vercel.app` y previews saltan Cloudflare Access → middleware de app imprescindible.
- [ ] Payload de función Vercel 4.5 MB → validar tamaño de imagen en servidor.
- [ ] Cuota de despliegues Hobby (100/día) → botón "Publicar" que agrupe (§9.9).
- [ ] `astro check` en el build: el `import` de JSON debe quedar tipado (`as Plantilla[]`) sin romper tipos.
- [ ] Quitar un producto cambia sitemap, JSON-LD y enlaces internos → se regeneran en el build (ok), pero la URL vieja necesita redirect.
- [ ] Probar en local: los commits de `astro dev` irían al repo real → usar rama de pruebas o `DRY_RUN`.
- [ ] `robots.txt` y sitemap deben excluir `/admin`; añadir `noindex`.
</content>
</invoke>
