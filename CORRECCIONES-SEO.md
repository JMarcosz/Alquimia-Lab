# Correcciones SEO / GEO / AEO — registro de implementación

Basado en `informe-auditoria-seo.md` (auditoría del 2026-09-04).
Fecha de implementación: 2026-09-04.

- **Fase 1** (técnica) y **Fase 2** (andamiaje de contenido): **implementadas** ✅
- **Fase 3** (requiere datos de Isabel): **pendiente** — checklist al final.

`pnpm build` → 27 páginas. `pnpm astro check` → 0 errores, 0 avisos.

---

## Fase 1 — Correcciones técnicas (implementadas)

| # | Cambio | Archivos |
|---|---|---|
| 1 | **Jerarquía de encabezados.** Los `<div class="section-title">` pasan a `<h1>`/`<h2>` reales. Ahora **cada página tiene exactamente un `<h1>`**: inicio, portafolio, productos, contacto, servicios, y las 4 subpáginas de portafolio (branding/ux/social/ai-characters) y las 4 de servicio. | `HomePage`, `PortafolioPage`, `ProductosPage`, `ContactoPage`, `BrandingPage`, `UxPage`, `SocialPage`, `AiCharactersPage`, `global.css` (reset de márgenes de `h1/h2.section-title`) |
| 2 | **Señales de Bogotá / Colombia.** Añadidas a: `<title>` y meta description de inicio/portafolio/productos/contacto (y subpáginas de portafolio), `<h1>` de inicio ("Diseño de marca y plantillas de Notion desde Bogotá"), `<h1>` de portafolio y de productos, bio ("Trabajo desde Bogotá, Colombia, con clientes locales y en remoto"), y línea visible en contacto. `og:locale` → **`es_CO`**. | `i18n.ts` (mapas `titles`/`descriptions` reescritos + nuevas cadenas), `BaseLayout.astro`, todos los `pages/*` |
| 3 | **`Organization` schema enriquecida.** Ahora incluye `@id`, `alternateName`, `description`, `email`, `telephone`, `founder` (Person), `areaServed` (Bogotá + Colombia), `logo` como `ImageObject`, `sameAs` desde `consts.ts`. | `BaseLayout.astro`, `consts.ts` |
| 4 | **Nuevo `ProfessionalService` schema** (negocio de área de servicio, **sin** `address`) en todo el sitio: `areaServed`, `priceRange`, `telephone`, `email`, `provider` → `#isabel`, `knowsLanguage`, `hasOfferCatalog` con los 4 servicios. | `BaseLayout.astro` |
| 5 | **`Person` schema enriquecida** y unificada: `@id: #isabel`, `image`, `address` (Bogotá/CO), `worksFor`, `alumniOf`, `knowsLanguage`, `knowsAbout` ampliado, `sameAs`. Se emite en **todas** las páginas (antes solo en portafolio) para consistencia de entidad. | `BaseLayout.astro` (se eliminó el `personLd` duplicado de `PortafolioPage`) |
| 6 | **`Product` + `Offer` schema** (como `ItemList`) para las 8 plantillas de Notion, con `price`, `priceCurrency` (**USD** por ahora — ver Fase 3), `availability`, `brand`. | `ProductosPage.astro` |
| 7 | **`VideoObject` schema** para el vídeo de música lofi. | `ProductosPage.astro` |
| 8 | **`BreadcrumbList`** + migas de pan visibles en portafolio, productos, contacto, servicios, las 4 subpáginas de portafolio y las 4 de servicio. Componente reutilizable. | `components/Breadcrumbs.astro` (nuevo), `global.css` |
| 9 | **Open Graph / Twitter** ampliados: `og:image:width/height/alt`, `twitter:image:alt`, `meta name="author"`, prop `ogImageAlt` por página. | `BaseLayout.astro` |
| 10 | **Script de auto-redirección por idioma eliminado.** Ya no hace `location.replace()` en la primera visita (riesgo de cloaking / inconsistencia para buscadores). Se conserva solo el guardado de la preferencia al pulsar el toggle ES/EN. | `BaseLayout.astro` |
| 11 | **Página 404 propia** (`/404`) con `noindex, follow` y enlaces a inicio, servicios y portafolio. | `pages/404.astro` (nuevo), `global.css` |
| 12 | **"7 plantillas" → "8"** (coincidía mal con el array de 8 productos). Anchor text mejorado con `aria-label` en los CTA "Conseguir" del inicio. | `i18n.ts`, `HomePage.astro`, `ProductosPage.astro` |
| 13 | Prop **`noindex`** disponible en `BaseLayout` para el futuro (decisión sobre `/en/`). | `BaseLayout.astro` |

## Fase 2 — Andamiaje de contenido (implementado — BORRADOR)

| # | Cambio | Archivos |
|---|---|---|
| 14 | **4 páginas de servicio** con ciudad en el slug y el `<h1>`, más su espejo en inglés: <br>· `/servicios/identidad-de-marca-bogota` <br>· `/servicios/diseno-ui-ux-bogota` <br>· `/servicios/diseno-redes-sociales-bogota` <br>· `/servicios/diseno-visual-y-editorial-bogota` <br>Cada una: `<h1>`, intro, "Qué incluye" (lista), "Cómo trabajo" (4 pasos), **FAQ** (3-4 preguntas), doble CTA (contacto + WhatsApp), y schema **`Service`** + **`FAQPage`**. | `data/servicios.ts` (nuevo — **contenido en borrador**), `components/pages/ServicioPage.astro` (nuevo), `pages/servicios/[slug].astro`, `pages/en/servicios/[slug].astro` (nuevos) |
| 15 | **Índice `/servicios`** (+ `/en/servicios`) con tarjetas a cada servicio, enlazado desde el **menú principal** ("Servicios") y desde la sección de servicios del portafolio (cada tarjeta enlaza a su página). | `components/pages/ServiciosIndexPage.astro`, `pages/servicios/index.astro`, `pages/en/servicios/index.astro` (nuevos), `Nav.astro`, `PortafolioPage.astro` |
| 16 | Componentes reutilizables **`Faq.astro`** (bloque `<details>` + `FAQPage` JSON-LD) y **`Breadcrumbs.astro`**. | `components/Faq.astro`, `components/Breadcrumbs.astro` (nuevos) |

> ⚠️ **El copy de las páginas de servicio es un borrador** derivado de tus descripciones actuales + un proceso estándar de 4 pasos. Está todo en **`src/data/servicios.ts`**. Revísalo, ajústalo a tu voz y añade tus **precios, plazos y entregables reales** antes de promocionarlas. En `pnpm dev` cada página muestra un aviso de borrador (no aparece en producción).

### Impacto esperado en las puntuaciones del informe

| Dimensión | Antes (proyectado) | Después de Fase 1+2 (estimado) |
|---|:--:|:--:|
| SEO | 6/10 | ~8/10 |
| GEO | 5/10 | ~7/10 |
| AEO | 2/10 | ~5/10 |
| Internacionalización | 7/10 | ~8/10 (se quitó el script de redirección) |
| SEO Local | 1/10 | ~4/10 (falta GBP, reseñas, citations, COP) |

---

## Fase 3 — Pendiente (requiere tus datos / acciones fuera del código)

| Ref. informe | Acción | Qué necesito de ti |
|---|---|---|
| A1 | Cambiar el **dominio de producción** real. | El dominio definitivo. Editar en `astro.config.mjs` (`site`), `src/consts.ts` (`SITE_URL`) y `public/robots.txt`. |
| A5 | **Google Business Profile**: crear/reclamar como negocio de área de servicio (categoría "Diseñador gráfico"), zona = Bogotá, pedir 5-10 reseñas. | Que lo crees. Luego enlazarlo. |
| A7 | **Testimonios** con schema `Review`/`AggregateRating`. El componente NO se creó con datos falsos. | 3-6 testimonios reales (nombre, empresa, texto, foto opcional). |
| A9 | **Email de dominio** (`hola@alquimialab.com` o similar) y **URL personalizada de Facebook**. | Que los crees. Actualizar `CONTACT_EMAIL` y `SOCIAL_LINKS` en `consts.ts`. |
| A6 | Añadir **LinkedIn y Behance** al `sameAs`. | Las URLs de tus perfiles. Descomentar en `consts.ts`. |
| A8 | Reescribir 3-4 proyectos como **casos de estudio** con URL propia (sacar Illustration / Packaging / Email de las modales). | Para cada proyecto: cliente, reto, qué hiciste, resultado, tu rol, año. |
| B1 / B2 / B3 | **Páginas de producto individuales en español** con schema `Product` completo y **precios en COP** (`priceCurrency: "COP"`). | Confirmar precios en COP. (El schema `Product` ya existe con USD; cambiar `PRICE_CURRENCY` y los precios en `ProductosPage.astro`.) |
| B4 | **Lead magnets** con captura de correo para las plantillas gratuitas. | Cuenta en MailerLite / Brevo (plan gratis) para conectar el formulario. |
| B5 / B6 | Artículo **"Cómo usar una plantilla de Notion"** (`HowTo`) y comparativa "mejores plantillas de Notion en español". | Luz verde para redactarlos (puedo hacer un primer borrador). |
| Sección 8 | Decidir si **`/en/` se indexa** o lleva `noindex`. Si el mercado anglo no interesa: poner `noindex` (ya hay prop `noindex` en `BaseLayout`). Si interesa: diferenciar el copy EN. | Tu decisión. |
| — | Instalar **Google Search Console** + **Analytics** tras el deploy y enviar el sitemap. | Acceso a la propiedad del dominio. |

### Anexos JSON-LD del informe: estado

| Anexo | Estado |
|---|---|
| 16.1 `Organization` completa | ✅ implementado (`BaseLayout.astro`) — falta `email` de dominio y LinkedIn/Behance en `sameAs` |
| 16.2 `ProfessionalService` | ✅ implementado (`BaseLayout.astro`) |
| 16.3 `Person` enriquecida | ✅ implementado (`BaseLayout.astro`) — falta LinkedIn/Behance en `sameAs` |
| 16.4 `Service` (x4) | ✅ implementado (`ServicioPage.astro`) |
| 16.5 `Product` + `Offer` | ✅ implementado (`ProductosPage.astro`) — **en USD**, migrar a COP en Fase 3 |
| 16.6 `FAQPage` | ✅ implementado en las 4 páginas de servicio (`Faq.astro`) |
| 16.7 `HowTo` | ⏳ Fase 3 (artículo de blog) |
| 16.8 `BreadcrumbList` | ✅ implementado (`Breadcrumbs.astro`) |
| 16.9 `VideoObject` | ✅ implementado para el vídeo lofi (`ProductosPage.astro`) — falta `uploadDate` real; los reels de personajes IA aún sin marcar |

### Verificación recomendada tras desplegar

1. Pasar `/`, `/servicios/identidad-de-marca-bogota` y `/productos` por <https://search.google.com/test/rich-results> (Organization, ProfessionalService, Service, FAQPage, Product, BreadcrumbList, VideoObject).
2. Confirmar en la URL real: `canonical` absoluta, `hreflang` recíproco, `/sitemap-index.xml` = 200 y con las 26 URLs, `robots.txt` con el dominio correcto.
3. <https://pagespeed.web.dev> para Core Web Vitals (no evaluable desde el código).
