# Auditoría SEO / GEO / AEO — Alquimia Lab

**Tipo:** Auditoría Completa
**Fecha:** 2026-09-04
**Sitio analizado:** <https://alquimia-lab.netlify.app/> (versión en vivo, anterior a la migración)
**También evaluado:** el código de la migración a Astro presente en este repositorio (aún sin desplegar)
**Preparado para:** Isabel Correa Boder — marca *Alquimia Lab*
**Objetivos de negocio:**

- **Meta A** — captar clientes de **servicios de diseño** (branding, UI/UX, redes sociales, diseño visual) en **Bogotá, Colombia**.
- **Meta B** — vender **plantillas de Notion**.

> **Qué es GEO y AEO** (en breve):
> **SEO** = posicionarte en resultados clásicos de Google.
> **GEO** (*Generative Engine Optimization*) = que motores de IA como Perplexity, ChatGPT Search, Google AI Overviews y Gemini te *citen* al redactar sus respuestas.
> **AEO** (*Answer Engine Optimization*) = ganar los fragmentos destacados, el bloque "Otras preguntas" y las respuestas de búsqueda por voz, con contenido que responde una pregunta de forma directa.

---

## 0. Cuadro resumen de puntuaciones

Puntuación 1-10 por dimensión. Dos columnas: **Hoy** = lo que un buscador ve ahora mismo en `alquimia-lab.netlify.app`; **Proyectado** = lo que verá cuando despliegues la migración a Astro *tal como está*, sin trabajo adicional.

| Dimensión | Hoy (Netlify) | Proyectado (post-deploy) | Estado |
|---|:---:|:---:|---|
| SEO | 3/10 | 6/10 | Requiere trabajo |
| GEO | 4/10 | 5/10 | Requiere trabajo |
| AEO | 2/10 | 2/10 | Crítico |
| Internacionalización / hreflang | 1/10 | 7/10 | La migración lo resuelve |
| SEO Local (Bogotá) | 1/10 | 1/10 | Crítico — no lo toca la migración |
| **Combinado** | **11 / 50** | **21 / 50** | |

**Bandas:** 1-3 Crítico · 4-5 Por debajo de la media · 6-7 Base aceptable · 8-9 Fuerte · 10 Ejemplar.

**Lectura rápida:** la migración a Astro **duplica** la salud técnica del sitio (sobre todo internacionalización y datos estructurados), pero las dos dimensiones más ligadas a tus objetivos comerciales —**AEO** y **SEO Local**— quedan intactas y hay que trabajarlas aparte.

---

## 1. Resumen ejecutivo

El sitio en vivo está, para efectos de buscadores, **solo en inglés**: el HTML que se sirve es `<html lang="en">` con textos en inglés, y la versión en español se genera **en el navegador con JavaScript** (`js/lang.js`). Google y los motores de IA indexan lo que reciben en el HTML inicial, así que **hoy tu contenido en español no existe para búsqueda**, y con él se van todas las oportunidades en tu mercado (Colombia). Además faltan piezas técnicas básicas: no hay `canonical`, no hay `hreflang`, `robots.txt` y `sitemap.xml` devuelven **404**, no hay Open Graph ni Twitter Card, y no hay ningún dato estructurado (JSON-LD). La jerarquía de encabezados está rota: solo la página de inicio tiene un `<h1>`; en las otras 7 páginas los títulos visibles son `<div>`, no encabezados.

La **migración a Astro** de este repositorio resuelve casi toda esa fontanería: español como idioma por defecto en `/` con URL propia, inglés en `/en/`, `hreflang` recíproco es/en/x-default, `sitemap` con alternates, `robots.txt`, y JSON-LD de `Organization` + `WebSite` en todas las páginas y `Person` en el portafolio. Esa es tu **mayor fortaleza**: partes de una base limpia, sin deuda técnica.

Lo más urgente que **la migración NO resuelve** y que bloquea la Meta A: el sitio **no menciona Bogotá ni Colombia ni una sola vez**, no declara un negocio (schema `LocalBusiness`/`ProfessionalService`), no hay páginas de servicio, no hay Google Business Profile, no hay reseñas y los precios están en dólares. Para la Meta B, tus plantillas enlazan a fichas **en inglés** de `notion.com`/Gumroad, no hay páginas de producto propias e indexables, ni contenido de apoyo ("cómo usar una plantilla de Notion", comparativas, FAQ), que es exactamente lo que posiciona a la competencia hispanohablante (`plantillasnotion.es`, `talentodigital.com`, `estudionotion.gumroad.com`).

**Oportunidad clave:** eres una persona real, con nombre, trayectoria verificable y producto propio — justo el perfil de E-E-A-T que premian los motores de IA. Con contenido en español orientado a Bogotá, páginas de servicio y de producto, y datos estructurados completos, puedes competir por consultas de intención comercial donde hoy no apareces.

> Las recomendaciones de la sección 11 están **divididas por objetivo**: 11.A (servicios en Bogotá), 11.B (plantillas de Notion) y 11.C (top 5 combinado de esta semana).

---

## 2. Metodología y alcance

| Aspecto | Detalle |
|---|---|
| Qué se rastreó | Las 8 páginas del sitio en vivo (`/`, `/portafolio`, `/productos`, `/contacto`, `/branding`, `/ux`, `/social`, `/ai-characters`) + `robots.txt` + `sitemap.xml`. |
| Qué más se auditó | El código de la migración a Astro en disco: `src/layouts/BaseLayout.astro`, `astro.config.mjs`, `src/consts.ts`, `public/robots.txt`, `src/i18n.ts`, `src/components/pages/*.astro`, `src/pages/**`, y la salida compilada en `dist/`. |
| Dimensiones | Las 3 de la skill `seo-geo-aeo` (SEO, GEO, AEO) **+ 2 añadidas**: Internacionalización/hreflang y SEO Local para Bogotá, porque la skill no las cubre y son centrales para tus objetivos. |
| Investigación de mercado | Búsquedas de SERP para "diseñador gráfico freelance Bogotá", "diseñador UI/UX freelance Bogotá", "plantillas de Notion en español", "plantilla Notion finanzas personales gratis". |
| Puntuación | Doble columna (hoy / proyectado). Cada puntuación se apoya en evidencia citada (texto entre comillas, `archivo:línea`, o ausencia confirmada por búsqueda + rastreo). |

### Limitaciones de esta auditoría (herramientas que hacen falta aparte)

| No evaluado aquí | Herramienta recomendada |
|---|---|
| Core Web Vitals, velocidad real, render móvil | <https://pagespeed.web.dev> |
| Validación real de los datos estructurados | <https://search.google.com/test/rich-results> y <https://validator.schema.org> |
| Backlinks, autoridad de dominio | Ahrefs / Semrush / Ubersuggest (versión gratuita) |
| Rendimiento de keywords, clics, impresiones | Google Search Console (instalar tras el deploy) |
| Tráfico y conversión | Google Analytics 4 / Plausible |
| Estado de la ficha local | Google Business Profile (perfil de empresa) |

---

## 3. Páginas auditadas

Rastreo del sitio en vivo. "Palabras" = texto total con etiquetas quitadas (incluye nav/footer y, en las páginas de portafolio, códigos hex y nombres de fuente); el **texto editorial único** es bastante menor y se anota entre paréntesis.

| # | URL (hoy) | URL prevista tras migración | Tipo | ¿H1? | Meta description | Palabras | Problemas clave |
|---|---|---|---|:---:|---|:---:|---|
| 1 | `/` | `/` y `/en/` | Inicio | ✅ "Welcome to Alquimia Lab" | EN, ~135 car. | ~348 | Único H1 del sitio; copy de "vibra", poco factual; CTAs genéricos ("Explore"). |
| 2 | `/portafolio` | `/portafolio` · `/en/portafolio` | Portafolio / Sobre mí | ❌ (solo `<h2>` "Isabel Correa Boder") | EN | ~716 | Sin H1; "section titles" son `<div>`; 4 servicios en una línea cada uno, sin precio ni CTA; sin schema de `Service`. |
| 3 | `/productos` | `/productos` · `/en/productos` | Catálogo de producto | ❌ (solo `<h2>` "My Products") | EN | ~562 | 11 productos con precio en USD y **sin** schema `Product`/`Offer`; enlaces salen a fichas en inglés; el copy dice "7 plantillas" pero hay 8. |
| 4 | `/contacto` | `/contacto` · `/en/contacto` | Contacto | ❌ (solo `<h2>` "Shall we work together?") | EN | ~90 | Contenido muy delgado (~15 palabras útiles); email Gmail gratuito; formulario `mailto:` sin backend; sin NAP, sin `ContactPoint`. |
| 5 | `/branding` | `/branding` · `/en/branding` | Proyecto de portafolio | ❌ | EN, casi duplicada | ~324 (≈25 útiles) | Sin H1/H2; una frase de intro + rejilla de logos + paletas hex + nombres de fuente. Sin descripción por marca, sin contexto de cliente ni resultados. |
| 6 | `/ux` | `/ux` · `/en/ux` | Proyecto de portafolio | ❌ | EN, casi duplicada | ~192 (≈20 útiles) | Igual que arriba; el más delgado. |
| 7 | `/social` | `/social` · `/en/social` | Proyecto de portafolio | ❌ | EN, casi duplicada | ~351 (≈20 útiles) | Igual; 8 maquetas de Instagram sin texto descriptivo. |
| 8 | `/ai-characters` | `/ai-characters` · `/en/ai-characters` | Proyecto de portafolio | ❌ | EN, casi duplicada | ~230 | Dos biografías de ~60 palabras (lo más rico de las subpáginas) pero **fuera de tema** para el negocio de diseño. |
| — | `/robots.txt` | (la migración lo añade) | — | — | — | — | **HTTP 404** en el sitio en vivo. |
| — | `/sitemap.xml` | `/sitemap-index.xml` (lo añade la migración) | — | — | — | — | **HTTP 404** en el sitio en vivo. |
| — | `/404` | (Astro genera una en build) | — | — | — | — | Sin página 404 propia; se sirve la de Netlify por defecto. |

**Proyectos sin URL rastreable:** *Illustration*, *Packaging & Editorial* y *Email Marketing* solo se muestran en ventanas modales dentro de `/portafolio` (código en `src/components/pages/PortafolioPage.astro`, `slot="end"`). No tienen dirección propia, no se pueden enlazar ni indexar.

---

## 4. Detalle de puntuaciones

| Dimensión | Hoy | Proyectado | Conclusión de una línea |
|---|:---:|:---:|---|
| **SEO** | 3/10 | 6/10 | La migración arregla lo técnico; siguen fallando encabezados, contenido delgado y cero orientación a keywords. |
| **GEO** | 4/10 | 5/10 | Buen perfil de persona real; falta densidad factual, schema enriquecido y señales de ubicación. |
| **AEO** | 2/10 | 2/10 | Sin FAQ, sin encabezados-pregunta, sin contenido de respuesta directa ni schema `FAQPage`/`HowTo`. La migración no toca esto. |
| **Internacionalización** | 1/10 | 7/10 | Hoy el español no tiene URL propia; la migración lo resuelve con hreflang recíproco y sitemap con alternates. |
| **SEO Local** | 1/10 | 1/10 | Cero menciones de Bogotá/Colombia, sin schema de negocio, sin GBP, sin reseñas, precios en USD. |

---

## 5. Análisis SEO

Puntuación **hoy 3/10 · proyectado 6/10**.

### 5.1 Técnico on-page

| Señal | Hallazgo (evidencia) | Estado hoy | ¿Lo corrige la migración? |
|---|---|---|---|
| Etiqueta `<title>` | Presente y única por página, longitud aceptable, pero **en inglés** y sin keyword ni ciudad. Ej.: `"Portfolio · Alquimia Lab"`, `"Products · Alquimia Lab"`. | Requiere atención | **Parcial** — la migración las pasa a español (`src/i18n.ts:232-241`, ej. `"Portafolio · Alquimia Lab"`) pero siguen sin keyword de intención ni geo. |
| Meta description | Presente en las 8 páginas. En inglés. Las 4 subpáginas de portafolio usan una plantilla casi idéntica: `"Alquimia Lab Portfolio — X."`. | Requiere atención | **Parcial** — se traducen (`src/i18n.ts:244-260`) pero siguen casi duplicadas entre subpáginas. |
| Jerarquía de encabezados | **Solo `/` tiene `<h1>`** ("Welcome to Alquimia Lab"). Las otras 7 páginas no tienen `<h1>`; los títulos visibles son `<div class="section-title"><span>…</span></div>`. `/branding`, `/ux`, `/social`, `/ai-characters` no tienen ni `<h1>` ni `<h2>`. | **Ausente** | **No** — persiste en el código migrado (ej. `dist/productos/index.html` solo tiene `<h2>Mis Productos`; `src/components/pages/*` usan `section-title` en `<div>`). |
| Estructura de URL | Limpia y legible (`/portafolio`, `/productos`, `/contacto`). Sin parámetros. | Bien | Se mantiene. |
| `rel="canonical"` | **Ausente** en las 8 páginas. | **Ausente** | **Sí** — `src/layouts/BaseLayout.astro:64` emite canonical autorreferente absoluto. |
| Meta `robots` | Ausente (el sitio es indexable por defecto, ok). | Bien | Se mantiene (sin `noindex` accidental). |
| Meta viewport | Presente: `width=device-width, initial-scale=1.0`. | Bien | Se mantiene. |
| `robots.txt` | **HTTP 404.** | **Ausente** | **Sí** — `public/robots.txt` (pero apunta al dominio placeholder, ver 5.3). |
| `sitemap.xml` | **HTTP 404.** | **Ausente** | **Sí** — `@astrojs/sitemap` genera `/sitemap-index.xml` con 16 URLs (8 ES + 8 EN) y alternates hreflang. |
| Open Graph / Twitter | **Ausentes** por completo. Al compartir en WhatsApp/Instagram/LinkedIn no se genera tarjeta con imagen. | **Ausente** | **Sí** — `BaseLayout.astro:80-91`: `og:*` completos + `twitter:card=summary_large_image`. Faltan `og:image:width/height/alt`, `twitter:site`, `twitter:creator`, y la imagen es genérica (una sola `og-image.png` de 85 KB para todo el sitio). |
| Texto alternativo de imágenes | Todas las imágenes tienen `alt` (el componente `src/components/Pic.astro` lo exige), pero son genéricos: `"Alquimia Lab Banner"`, `alt={p.title}` → `"User Experience Design"`, `alt={b.name}` → `"PetsGo"`, `"Post 1"`, `"Illustration"`. Ninguno contiene "diseño", "logo", "Bogotá", "plantilla Notion". | Requiere atención | **No** — el `alt` genérico viene del código migrado. |
| Enlaces internos | Presentes vía nav y tarjetas, pero con anchor text genérico: "Explore"/"Explorar", "Get it"/"Conseguir", "View project"/"Ver". | Requiere atención | **No.** |
| `<html lang>` | `en` en todas las páginas servidas, aunque el contenido "real" para el usuario sea español tras el toggle JS. | **Ausente (para ES)** | **Sí** — `lang` correcto por locale (`es` en `/`, `en` en `/en/`). |

### 5.2 Calidad de contenido

| Señal | Hallazgo | Estado |
|---|---|---|
| Volumen de contenido | `/` ~348 palabras; `/portafolio` ~716 (mayormente listas: skills, tools, timeline); `/productos` ~562. Subpáginas de portafolio: 20-25 palabras de texto editorial único cada una. Ninguna página llega a las 500+ palabras de contenido sustantivo recomendadas; ninguna se acerca a 1500+ para contenido pilar. | Requiere atención |
| Señales de keyword | El copy es aspiracional ("santuarios digitales", "calma", "ruido mental", "intención"). Aparecen los sustantivos de categoría ("plantillas de Notion", "branding", "UI/UX", "diseño editorial") pero **nunca** frases de intención comercial ("contratar diseñador", "cotización", "precios", "portafolio de diseño gráfico en Bogotá") ni long-tail de producto ("planificador Notion", "plantilla Notion para estudiantes"). | Requiere atención |
| Frescura | **Sin fechas** de publicación ni actualización en ninguna página. Sin blog, sin "novedades", sin changelog de productos. | Ausente |
| Legibilidad | Buena a nivel visual (párrafos cortos, subtítulos), pero la falta de encabezados semánticos rompe el esquema para lectores de pantalla y rastreadores. | Requiere atención |
| Contenido de apoyo | Sin blog, sin guías, sin casos de estudio con problema/solución/resultado, sin comparativas, sin "cómo usar". Nada que un motor de IA pueda citar. | Ausente |

### 5.3 Datos estructurados

| Tipo | Hoy | Proyectado | Nota |
|---|:---:|:---:|---|
| `Organization` | ❌ | ✅ (mínima) | `BaseLayout.astro:33-44`. Falta `description`, `address`, `contactPoint`, `areaServed`, `email`, `telephone`, `founder`. `logo` apunta a la OG de 1200×630, no a un logo cuadrado. |
| `WebSite` | ❌ | ✅ (mínima) | `BaseLayout.astro:45-51`. Sin `potentialAction`/`SearchAction`, sin `publisher`. `url` siempre es la raíz, no la de la página. |
| `Person` | ❌ | ✅ solo en portafolio | `PortafolioPage.astro:87-95`. Falta `image`, `sameAs`, `address`, `alumniOf`, `knowsLanguage`, `nationality`. |
| `LocalBusiness` / `ProfessionalService` | ❌ | ❌ | **La gran ausencia para la Meta A.** Sin `areaServed`, sin `priceRange`, sin `openingHoursSpecification`, sin `telephone`. |
| `Product` + `Offer` | ❌ | ❌ | 11 productos con precio explícito (`$9.99`, `$5.99`, `$15`, `$4`, `$27`, `Free`) y **cero** marcado. Sin `priceCurrency`, sin `availability`, sin `aggregateRating`/`review`. |
| `Service` | ❌ | ❌ | 4 servicios de diseño como rejilla de texto plano; sin `Service`/`OfferCatalog`/`provider`/`areaServed`. |
| `BreadcrumbList` | ❌ | ❌ | Existe jerarquía (Portafolio → Branding/UX/Social/AI) pero sin marcado ni migas visibles (solo un enlace "← Volver al portafolio"). |
| `FAQPage` / `QAPage` | ❌ | ❌ | No hay contenido de FAQ que marcar. |
| `VideoObject` | ❌ | ❌ | Hay 3 vídeos (música lofi, contacto, reels de personajes IA) sin marcado. |
| `CreativeWork` | ❌ | ❌ | Los proyectos de portafolio no están marcados. |

---

## 6. Análisis GEO

Puntuación **hoy 4/10 · proyectado 5/10**. Optimización para que Perplexity, ChatGPT Search, Google AI Overviews y Gemini te *citen*.

### 6.1 E-E-A-T (Experiencia, Pericia, Autoridad, Confianza)

| Señal | Hallazgo | Estado |
|---|---|---|
| Autor identificado | ✅ Fuerte. `/portafolio` presenta a "Isabel Correa Boder", con biografía, timeline de experiencia (Freepik, Dual Content & Marketing, La Company, Blink Spanish), educación (Institución Universitaria Pascual Bravo, Coderhouse, EducaciónIT) y 3 certificaciones de Notion con ID de credencial. | Bien |
| Página "Sobre mí" | ✅ Existe (dentro de `/portafolio`, ancla `#about`). Explica quién es y su trayectoria. Le falta foto marcada, enlaces a perfiles y ubicación. | Bien / mejorable |
| Información de contacto | Email + WhatsApp flotante + 3 redes. El email es un Gmail gratuito (`alquimialab88@gmail.com`), el enlace de Facebook es la URL sin personalizar `profile.php?id=61592768576548`. El número de WhatsApp no se muestra como texto (solo `aria-label="WhatsApp"`). | Requiere atención |
| Señales de confianza | **Sin testimonios, sin reseñas, sin premios, sin menciones de prensa, sin logos de clientes.** Los proyectos muestran marcas ("PetsGo", "Blink Spanish", "Hillerbräu") pero sin contexto ni validación. | Ausente |
| `Organization` schema | ❌ hoy. ✅ tras migración, pero mínima (ver 5.3). El array `sameAs` está escrito a mano en `BaseLayout.astro:39-43` en vez de reutilizar `SOCIAL_LINKS` de `src/consts.ts`. | Requiere atención |

### 6.2 Contenido para síntesis por IA

| Señal | Hallazgo | Estado |
|---|---|---|
| Densidad factual | Baja. El copy es de "vibra" ("Alquimia Lab es donde el diseño reflexivo se encuentra con una vida consciente"). Pocos datos concretos citables. El portafolio aporta algunos (años, % de dominio de herramientas, nombres de clientes). | Requiere atención |
| Afirmaciones claras | La propuesta de valor no se enuncia arriba de forma directa ("Isabel Correa Boder es diseñadora gráfica en Bogotá especializada en …"). | Requiere atención |
| Citas de fuentes | Ninguna. | Ausente |
| Exhaustividad | Cada tema se toca en 1-2 frases; nada se desarrolla. | Requiere atención |
| Claridad de entidad | ✅ "Alquimia Lab" e "Isabel Correa Boder" se nombran de forma consistente. Falta el schema que ate la entidad (Person con `sameAs`, Organization con `founder`). | Bien / mejorable |
| Originalidad / punto de vista | Hay una voz de marca distintiva, pero no respaldada por datos propios, procesos documentados ni casos de estudio. | Requiere atención |

### 6.3 GEO técnico

| Señal | Hallazgo | Estado |
|---|---|---|
| Profundidad de datos estructurados | Nula hoy; básica tras migración. Sin `Author`, `Dataset`, `SpeakableSpecification`, `Review`. | Requiere atención |
| HTTPS | ✅ Sí. | Bien |
| Rastreabilidad limpia | El HTML es estático (bueno), **pero el contenido en español depende de JavaScript** (`js/lang.js`): los rastreadores de IA que no ejecutan JS ven **solo inglés**. La migración lo resuelve al renderizar el español en el servidor. | **Ausente (hoy)** → Bien (proyectado) |
| Enlaces `sameAs` | Existen enlaces a Instagram/YouTube/Facebook en footer y contacto, pero sin `Organization.sameAs` en el HTML hoy. Tras la migración sí. Falta añadir LinkedIn, Behance y el perfil de creadora de Notion. | Requiere atención |

---

## 7. Análisis AEO

Puntuación **hoy 2/10 · proyectado 2/10**. **La migración no cambia nada aquí** porque es 100% contenido.

| Señal | Hallazgo | Estado |
|---|---|---|
| Párrafos de respuesta directa | Ninguno. No hay ningún bloque de 40-60 palabras que responda una pregunta bajo un encabezado en forma de pregunta. | Ausente |
| Patrones de definición | El sitio nunca define sus términos en formato "X es …". La página de inicio pregunta "¿Qué es Alquimia Lab?" pero responde con una frase poética, no una definición citable. | Ausente |
| Contenido en listas | Hay listas (productos, features del journal) pero no estructuradas como respuesta ("pasos para…", "tipos de…"). | Requiere atención |
| Tablas comparativas | Ninguna (ej.: "Finance Planner Free vs Pro", "plantilla Notion vs Google Sheets"). | Ausente |
| Schema `FAQPage` | Ausente. Sin contenido de preguntas frecuentes en ninguna página. | Ausente |
| Schema `HowTo` | Ausente. No hay contenido paso a paso ("Cómo instalar una plantilla de Notion", "Cómo funciona un proyecto de branding conmigo"). | Ausente |
| Encabezados en forma de pregunta | Ninguno ("¿Cuánto cuesta un logo en Bogotá?", "¿Cómo uso esta plantilla?"). | Ausente |
| Schema `Speakable` | Ausente. | Ausente |
| Lenguaje conversacional / long-tail | El copy es de marca, no responde a consultas naturales de tipo quién/qué/cuándo/dónde/por qué/cómo. | Ausente |
| Señales locales para voz (NAP) | Sin nombre-dirección-teléfono estructurado. La búsqueda por voz local ("diseñadora gráfica cerca de mí en Bogotá") no tiene nada a lo que engancharse. | Ausente |

**AEO es tu mayor oportunidad sin explotar:** un bloque de FAQ bien hecho por página de servicio y por producto, más 2-3 guías tipo "cómo…", pueden capturar fragmentos destacados y citas de IA que hoy no tienes forma de ganar.

---

## 8. Internacionalización y hreflang (dimensión añadida)

Puntuación **hoy 1/10 · proyectado 7/10**. La skill `seo-geo-aeo` no cubre esta dimensión; se evalúa manualmente porque tu sitio es bilingüe y tu mercado es hispanohablante.

| Comprobación | Hoy (Netlify) | Proyectado (migración) |
|---|---|---|
| ¿El español tiene URL propia? | ❌ **No.** Una sola URL por página; el español se pinta con JS. `/es/` da 404. Google no puede indexar la versión en español. | ✅ Español en `/` (idioma por defecto, sin prefijo), inglés en `/en/`. |
| `<html lang>` correcto por idioma | ❌ Siempre `en` en el HTML servido. | ✅ `es` en `/`, `en` en `/en/` (`BaseLayout.astro:55`). |
| `hreflang` recíproco | ❌ Ausente. | ✅ `es`, `en` y `x-default` en cada página, URLs absolutas, autorreferente incluido (`BaseLayout.astro:64-67`). Verificado en `dist/index.html` y `dist/en/portafolio/index.html`. |
| `x-default` | ❌ N/A. | ✅ Apunta al español — correcto para un objetivo Colombia. |
| Alternates en el sitemap | ❌ (no hay sitemap). | ✅ `@astrojs/sitemap` con config i18n emite `xhtml:link` por URL. |
| `og:locale` | ❌ Ausente. | ⚠️ Presente pero como `es_ES` / `en_US` (`BaseLayout.astro:86`). Para Colombia conviene `es_CO`. |
| Consistencia de slugs | — | ⚠️ Las rutas en inglés usan slug español (`/en/portafolio`, `/en/productos`). Funciona y es válido, pero no está localizado (`/en/portfolio`, `/en/products` sería lo ideal). |
| Script de redirección por idioma | ❌ Hoy: `js/lang.js` cambia el texto en cliente. | ⚠️ La migración añade en `BaseLayout.astro:116-149` un script `is:inline` que lee `localStorage['alquimia-lang']` y hace `location.replace()` a la otra versión en la primera visita de la sesión. **Riesgo:** puede leerse como cloaking/redirección inconsistente por Googlebot y molesta a usuarios que llegan por un enlace directo. Recomendación: quitarlo o limitarlo (no ejecutar si `navigator.webdriver`, respetar siempre la URL solicitada, y como mucho mostrar un aviso "¿Ver en inglés?" en vez de redirigir). |
| Contenido duplicado ES/EN | — | ⚠️ El copy ES y EN es ~95% equivalente (traducción directa, `src/i18n.ts`). Con `hreflang` correcto no hay penalización, pero la versión EN aporta poco valor. **Decisión pendiente:** si el mercado anglo (expats en Bogotá, clientes internacionales) *sí* interesa, diferenciar el copy EN; si no, poner `noindex` en `/en/` y dejarlo solo como comodidad de UI. |

---

## 9. SEO Local para Bogotá (dimensión añadida)

Puntuación **hoy 1/10 · proyectado 1/10**. **La migración no toca nada de esto.** Es el bloqueante nº1 de la Meta A. Perfil confirmado contigo: **negocio de área de servicio, sin dirección pública.**

| Comprobación | Hallazgo (evidencia) | Estado |
|---|---|---|
| Menciones de "Bogotá" | **0** en todo `src/` y `public/` (búsqueda `grep -i "bogot"`). | Ausente |
| Menciones de "Colombia" / "Latinoamérica" | **0.** Única señal indirecta: el prefijo `+57` en `WHATSAPP_URL = 'https://wa.me/573104108483'` (`src/consts.ts:7`). | Ausente |
| Ciudad en title / H1 / meta / body de páginas de servicio | No existen páginas de servicio, y ningún title/description/encabezado lleva modificador geográfico. | Ausente |
| NAP (Nombre-Dirección-Teléfono) | Nombre: sí ("Alquimia Lab" / "Isabel Correa Boder"). Dirección: no (esperado en área de servicio). Teléfono: no se muestra como texto; solo WhatsApp flotante con `aria-label="WhatsApp"`. | Requiere atención |
| Schema `LocalBusiness` / `ProfessionalService` | Ausente. Sin `areaServed`, sin `geo`, sin `priceRange`, sin `openingHoursSpecification`. | Ausente |
| Google Business Profile | No hay enlace ni referencia. No verificable desde el código, pero nada indica que exista una ficha. | Requiere atención (acción externa) |
| Reseñas / valoraciones | Ninguna en el sitio. Sin `Review` / `AggregateRating`. | Ausente |
| Contenido local dedicado | Sin landing por servicio + ciudad ("Diseño de identidad de marca en Bogotá"). | Ausente |
| Citations / directorios | No verificable desde el código. Canales relevantes: Google Business Profile, perfil de Behance/Dribbble con ubicación "Bogotá", LinkedIn, Domestika, Malt, Workana, Cámara de Comercio de Bogotá. La consistencia del NAP entre Instagram / Facebook / YouTube / Behance debe revisarse. | Acción externa |
| Precios en moneda local | Todos los precios son strings en USD desnudos (`$9.99`, `$27`, `Free`) en `src/components/pages/ProductosPage.astro`. Sin COP, sin selector de moneda, sin `priceCurrency`. En el mercado colombiano de UI/UX se manejan honorarios en COP (los anuncios de referencia citan rangos de "$3.000.000–$3.500.000 COP"). | Requiere atención |
| Contacto profesional | Email `@gmail.com` en vez de `@alquimialab.*`; sin WhatsApp Business; sin horario de atención; `+57` sin formato E.164 visible. | Requiere atención |

### Panorama de mercado (búsquedas realizadas)

- **"diseñador gráfico freelance Bogotá"** y **"diseñador UI/UX freelance Bogotá"** son consultas reales y con volumen (aparecen bolsas de empleo como LinkedIn, Computrabajo, Indeed y Jooble, además de agencias). Los que posicionan como *freelance individual* lo hacen con **una página dedicada de servicio + ciudad** (p. ej. Alberto Lobato `/disenador-grafico-freelance/`, `estegrafico.com/portafolio`, `logocrea.com/.../disenador-grafico-freelance-en-bogota.html`). Es un formato replicable.
- Los perfiles de **Behance / Dribbble con ubicación** aparecen para "web design bogota colombia": vale la pena tener ese perfil optimizado y enlazado (canal de citation + backlink).

---

## 10. Investigación de palabras clave

Dificultad estimada de forma cualitativa (Baja / Media / Alta) a partir de los SERP observados; confírmala con una herramienta de keywords antes de priorizar presupuesto.

### 10.A — Meta A: servicios de diseño en Bogotá

| Consulta objetivo | Intención | Dificultad aprox. | Página que debería responderla |
|---|---|:---:|---|
| diseñadora gráfica freelance Bogotá | Comercial local | Media-Alta | Nueva landing `/servicios/diseno-grafico-bogota` (o `/portafolio` reescrita con geo) |
| diseño de identidad de marca Bogotá / diseño de logotipo Bogotá | Comercial local | Media | Nueva `/servicios/branding-bogota` |
| diseñador UI/UX freelance Bogotá / Colombia | Comercial local | Media-Alta | Nueva `/servicios/ui-ux-bogota` |
| diseño para redes sociales Bogotá / community management diseño | Comercial local | Media | Nueva `/servicios/diseno-redes-sociales-bogota` |
| cuánto cuesta un logo en Colombia / precio diseño de marca | Informacional → comercial | Baja-Media | Bloque FAQ + artículo de precios |
| portafolio diseñadora gráfica Colombia | Navegacional / evaluación | Baja | `/portafolio` con `Person` + ubicación |
| contratar diseñador freelance Bogotá | Transaccional local | Media | `/contacto` reforzada + CTA en cada servicio |

### 10.B — Meta B: plantillas de Notion

| Consulta objetivo | Intención | Dificultad aprox. | Página que debería responderla |
|---|---|:---:|---|
| plantilla de Notion finanzas personales gratis (en español) | Comercial / lead magnet | Alta (compite Notion.com) | Página propia de producto ES para *Finance Planner Free* con captura de correo |
| plantilla Notion para estudiantes / agenda escolar Notion | Comercial | Media | Página ES de *Student OS & Study Planner* |
| plantilla Notion seguimiento de hábitos español | Comercial | Media | Página ES de *Habit Planner* |
| CRM para freelancers Notion / plantilla gestión de clientes | Comercial | Media | Página ES de *Freelancer CRM* |
| planificador de productividad Notion español | Comercial | Media-Alta | Página ES de *Quiet Mind* / *Social Media Planner* |
| cómo usar / instalar una plantilla de Notion | Informacional (AEO) | Baja | Guía `/blog/como-usar-plantilla-notion` con `HowTo` |
| mejores plantillas de Notion en español 2026 | Informacional (listicle) | Alta | Artículo comparativo que incluya las tuyas |

**Observación clave (Meta B):** hoy todos los enlaces de producto salen a `notion.com/templates/...` o `bordergaze.gumroad.com` **en inglés** (`src/components/pages/ProductosPage.astro`). Para posicionar "plantilla de Notion en español" necesitas **páginas de producto propias en español** en tu dominio (aunque el botón final lleve a Gumroad/Notion), con schema `Product` y contenido de apoyo. La competencia hispanohablante (`plantillasnotion.es`, `talentodigital.com/plantillas-notion/`, `estudionotion.gumroad.com`, `cerebroprogramable.com`) hace exactamente eso.

---

## 11. Recomendaciones priorizadas

Prioridad: 🔴 Crítica · 🟠 Alta · 🟡 Media · 🟢 Quick Win. Esfuerzo: S (≤2 h) · M (media jornada) · L (varios días). Impacto sobre la meta indicada.

### 11.A — Meta A: captar clientes de servicios de diseño en Bogotá

| ID | Prior. | Acción | Por qué | Dim. | Esf. | Impacto | Dónde | Cómo verificar |
|---|:--:|---|---|---|:--:|:--:|---|---|
| A1 | 🔴 | **Desplegar la migración a Astro** con `site` y `SITE_URL` cambiados al dominio real, y `robots.txt` alineado. | Hasta que exista una URL en español rastreable, nada de lo demás posiciona. | SEO/i18n | M | Alto | `astro.config.mjs:10`, `src/consts.ts:4`, `public/robots.txt` | La URL de producción sirve `<html lang="es">`, `curl /sitemap-index.xml` = 200, Rich Results Test detecta `Organization`. |
| A2 | 🔴 | **Crear una página por servicio** (`/servicios/branding-bogota`, `/servicios/ui-ux-bogota`, `/servicios/diseno-redes-sociales-bogota`, `/servicios/diseno-visual-bogota`), cada una con: `<h1>` con servicio + ciudad, 500-900 palabras (problema, proceso, entregables, para quién), 3-5 ejemplos del portafolio, FAQ, CTA a WhatsApp/formulario. | Es el formato con el que los freelance individuales rankean en Bogotá; hoy no tienes ninguna. | SEO/Local/AEO | L | Alto | nuevo `src/pages/servicios/*` + `src/pages/en/...` | Cada página tiene 1 `<h1>` con "Bogotá", indexada en Search Console, aparece para su keyword. |
| A3 | 🔴 | **Añadir "Bogotá / Colombia" al contenido**: title e `<h1>` de inicio y portafolio, bio ("diseñadora gráfica basada en Bogotá, trabajo con clientes de toda Colombia y en remoto"), footer. | 0 menciones hoy = imposible asociarte a la ciudad. | Local/SEO | S | Alto | `src/i18n.ts` (titles/descriptions/dict), `HomePage.astro`, `PortafolioPage.astro` | `grep -ri "bogot" src/` devuelve resultados en title, h1 y bio. |
| A4 | 🔴 | **Implementar schema `ProfessionalService`** (negocio de área de servicio, sin `address`): `name`, `description`, `url`, `image`, `telephone` (+57 E.164), `email`, `areaServed` = Bogotá + Colombia, `priceRange`, `sameAs`, `founder` → `Person`. Ver Anexo 16.2. | Ata la entidad "negocio de diseño en Bogotá" para Google y motores de IA. | GEO/Local | M | Alto | nuevo componente o `slot="head"` en Layout | validator.schema.org sin errores; Rich Results Test lo reconoce. |
| A5 | 🟠 | **Crear / reclamar Google Business Profile** como negocio de área de servicio (categoría "Diseñador gráfico"), zona = Bogotá, enlazar el sitio, subir portafolio, y **pedir 5-10 reseñas** a clientes pasados. | GBP + reseñas es el factor nº1 del paquete local y de "cerca de mí". | Local | M | Alto | Plataforma externa (business.google.com) | La ficha aparece en Google Maps para "diseñador gráfico Bogotá". |
| A6 | 🟠 | **Enriquecer el `Person` schema**: `image`, `sameAs` (Instagram, LinkedIn, Behance, YouTube, perfil de creadora Notion), `address` (`addressLocality: Bogotá`, `addressCountry: CO`), `knowsLanguage: ["es","en"]`, `alumniOf`. | Refuerza E-E-A-T y ayuda a la IA a describirte con precisión. | GEO | S | Medio | `src/components/pages/PortafolioPage.astro:87-95` | Rich Results Test muestra el `Person` completo. |
| A7 | 🟠 | **Sección de testimonios** con 3-6 reseñas de clientes (nombre, empresa, foto) + schema `Review`/`AggregateRating` en la Organization/ProfessionalService. | Hoy: cero prueba social. | GEO/Local | M | Alto | nuevo componente reusable en `/`, `/portafolio`, `/servicios/*` | Los testimonios se renderizan y el schema valida. |
| A8 | 🟠 | **Reescribir 3-4 proyectos como casos de estudio** (cliente, reto, proceso, resultado, 300-500 palabras) y darles URL propia (sacar *Illustration*, *Packaging & Editorial*, *Email Marketing* de las modales). | Contenido citable por IA + páginas indexables; hoy son ~20 palabras o ni siquiera tienen URL. | SEO/GEO | L | Medio | `src/pages/portafolio/*`, `src/components/pages/*` | 3+ casos con URL propia, cada uno con `<h1>` y `CreativeWork` schema. |
| A9 | 🟡 | **Email de dominio** (`hola@alquimialab.com` o similar) y personalizar la URL de Facebook. | Un `@gmail.com` y un `profile.php?id=` restan confianza (E-E-A-T). | GEO/Local | S | Bajo | `src/consts.ts:8,13` | El sitio muestra el email de marca; la URL de Facebook es `/AlquimiaLab`. |
| A10 | 🟡 | **FAQ en cada página de servicio** ("¿Cuánto cuesta un logo?", "¿Cuánto tarda un proyecto de branding?", "¿Trabajas con clientes fuera de Bogotá?", "¿Cómo es el proceso?") + schema `FAQPage`. | Gana fragmentos destacados y respuestas de IA para consultas de intención. | AEO | M | Alto | `src/pages/servicios/*` + Anexo 16.6 | El bloque FAQ valida como `FAQPage` en Rich Results Test. |
| A11 | 🟡 | **`BreadcrumbList`** + migas visibles en las subpáginas de portafolio y en las nuevas de servicio. | Mejora la comprensión de jerarquía y el aspecto en SERP. | SEO | S | Bajo | nuevo componente `Breadcrumbs.astro` | Rich Results Test detecta `BreadcrumbList`. |
| A12 | 🟢 | **Anchor text descriptivo**: cambiar "Ver" / "Explorar" / "Conseguir" por "Ver el caso de branding de PetsGo", "Explorar servicios de diseño de marca", etc. | Los anchors genéricos no transmiten relevancia. | SEO | S | Bajo | `src/components/pages/*` | Los enlaces internos describen el destino. |
| A13 | 🟢 | **`og:image` por página** (al menos una para servicios y otra para portafolio) + `og:image:alt` y dimensiones; `twitter:creator`. | Hoy una sola imagen genérica para todo. | SEO | S | Bajo | `BaseLayout.astro:85`, prop `ogImage` por página | El validador de LinkedIn/Twitter muestra la tarjeta correcta por página. |

### 11.B — Meta B: vender plantillas de Notion

| ID | Prior. | Acción | Por qué | Dim. | Esf. | Impacto | Dónde | Cómo verificar |
|---|:--:|---|---|---|:--:|:--:|---|---|
| B1 | 🔴 | **Página de producto propia (en español) por plantilla**, en tu dominio: `<h1>` con la keyword ("Plantilla de Notion para finanzas personales"), 400-800 palabras (qué incluye, para quién, capturas, cómo instalarla), botón que lleva a Gumroad/Notion. | Los enlaces actuales salen a fichas en inglés → invisibles para "plantilla de Notion en español". La competencia hispana rankea así. | SEO/AEO | L | Alto | nuevo `src/pages/productos/[slug].astro` (o content collection) | Cada plantilla tiene URL propia indexada; aparece para su keyword ES. |
| B2 | 🔴 | **Schema `Product` + `Offer`** en cada página de producto: `name`, `description`, `image`, `brand`, `offers` con `priceCurrency` (COP y/o USD), `price`, `availability`, `url`; añadir `aggregateRating`/`review` cuando tengas valoraciones. Ver Anexo 16.5. | Habilita resultados enriquecidos de producto y precio; hoy 11 productos con precio y cero marcado. | SEO | M | Alto | páginas de producto nuevas | Rich Results Test muestra `Product` válido con precio. |
| B3 | 🔴 | **Precios en COP** (o COP + USD con selector). Añadir nota "precios en pesos colombianos, pago internacional vía Gumroad". | El comprador colombiano espera COP; genera confianza y reduce fricción. | Local/SEO | S | Medio | `src/components/pages/ProductosPage.astro` + páginas nuevas | La página muestra COP y el schema lleva `priceCurrency: "COP"`. |
| B4 | 🟠 | **Lead magnets con captura de correo**: para las 3 plantillas gratuitas (*Finance Planner Free*, *Habit Planner*, *Quiet Mind*), landing ES con formulario "te la enviamos por correo" en vez de enlace directo. | Es el patrón de la competencia (`cerebroprogramable.com`, `plantillasnotion.es`); construye lista para vender las de pago. | SEO/negocio | M | Alto | páginas nuevas + servicio de email (MailerLite/Brevo, plan gratis) | El formulario funciona y la plantilla llega por correo. |
| B5 | 🟠 | **Guía "Cómo instalar y usar una plantilla de Notion"** (`/blog/como-usar-plantilla-notion`) con pasos numerados + schema `HowTo` + capturas. Enlazar desde cada página de producto. | Consulta informacional de alto volumen y baja competencia; alimenta AEO y enlaza a producto. | AEO/SEO | M | Alto | nuevo `src/pages/blog/*` + Anexo 16.6 | Rich Results Test valida `HowTo`; posiciona para "cómo usar plantilla notion". |
| B6 | 🟡 | **Artículo comparativo** "Mejores plantillas de Notion en español para [productividad / finanzas / estudiantes] (2026)" que incluya las tuyas con enlace. | Formato listicle que domina la SERP; canal de descubrimiento. | SEO/GEO | L | Medio | `src/pages/blog/*` | Publicado, indexado, con fecha visible. |
| B7 | 🟡 | **FAQ por producto** ("¿Necesito Notion de pago?", "¿Puedo duplicarla varias veces?", "¿Está en español?", "¿Incluye actualizaciones?") + `FAQPage`. | Gana "Otras preguntas" y respuestas de IA sobre tus productos. | AEO | S | Medio | páginas de producto | El bloque valida como `FAQPage`. |
| B8 | 🟡 | **Corregir el conteo**: el copy dice "7 plantillas disponibles" pero hay 8 (`src/i18n.ts:175-176` vs `ProductosPage.astro`). Traducir/gestionar el modal "Calma y Orden" (hoy solo en español, sin versión EN). | Coherencia y confianza. | SEO | S | Bajo | `src/i18n.ts`, `src/components/pages/ProductosPage.astro` | El número coincide; el modal existe en ambos idiomas o se documenta por qué no. |
| B9 | 🟢 | **`VideoObject`** para el vídeo de música lofi y los reels de personajes IA (`name`, `description`, `thumbnailUrl`, `uploadDate`, `contentUrl`). | Elegibilidad para carrusel de vídeo; hoy 3 vídeos sin marcar. | SEO | S | Bajo | `src/components/pages/ProductosPage.astro`, `AiCharactersPage.astro` | Rich Results Test detecta `VideoObject`. |

### 11.C — Top 5 de esta semana (combinado, mayor impacto / menor esfuerzo)

| # | Acción | IDs | Esfuerzo |
|---|---|---|:--:|
| 1 | **Desplegar la migración** con el dominio real en `astro.config.mjs`, `consts.ts` y `robots.txt`; dar de alta el sitio en **Google Search Console** y enviar el sitemap. | A1 | M |
| 2 | **Meter "Bogotá / Colombia"** en title + `<h1>` de inicio y portafolio y en la bio; añadir `og:locale` `es_CO`. | A3 | S |
| 3 | **Crear / reclamar el Google Business Profile** (área de servicio, categoría "Diseñador gráfico") y pedir las primeras 3-5 reseñas. | A5 | M |
| 4 | **Publicar 1 página de servicio ancla** (`/servicios/branding-bogota`) completa, como plantilla para las demás. | A2 | M |
| 5 | **Añadir schema `ProfessionalService`** (Anexo 16.2) y enriquecer el `Person` (Anexo 16.3). | A4, A6 | S-M |

---

## 12. Lo que ya funciona bien

| Fortaleza | Evidencia |
|---|---|
| Persona real y verificable | `/portafolio` con nombre completo, bio, timeline de empleos (Freepik, Dual, La Company, Blink), educación con instituciones nombradas y 3 certificaciones de Notion con ID de credencial. Es un perfil E-E-A-T fuerte de base. |
| Arquitectura técnica limpia tras la migración | Astro estático + adaptador; canonical, hreflang recíproco es/en/x-default, sitemap con alternates, JSON-LD de `Organization`+`WebSite` en todas las páginas y `Person` en portafolio (`src/layouts/BaseLayout.astro`, verificado en `dist/`). |
| Español como idioma por defecto | La migración sirve `/` en español con URL propia y `<html lang="es">` — decisión correcta para el mercado objetivo. |
| URLs limpias y estables | `/portafolio`, `/productos`, `/contacto`, `/branding`, etc. Sin parámetros, legibles, sin cambios de estructura. |
| Producto propio + trayectoria de venta | 11 plantillas ya publicadas en Notion Marketplace / Gumroad, algunas gratuitas — base perfecta para lead magnets. |
| HTTPS y hosting sólido | Sitio en HTTPS, servido estático (bueno para rastreo). |
| Imágenes con `alt` obligatorio | `src/components/Pic.astro` obliga a pasar `alt` (aunque falte optimizar el texto). |
| Verificación de dominio de Pinterest | `<meta name="p:domain_verify">` presente — señal menor de propiedad/confianza. |

---

## 13. Qué corrige ya la migración a Astro

| Problema en el sitio en vivo | ¿Lo resuelve la migración? | Qué queda pendiente |
|---|:--:|---|
| Español sin URL propia (solo JS) | ✅ Sí | Diferenciar o `noindex` la versión EN. |
| Sin `canonical` | ✅ Sí | — (corregir dominio placeholder). |
| Sin `hreflang` | ✅ Sí | Cambiar `og:locale` a `es_CO`; localizar slugs `/en/`. |
| `robots.txt` 404 | ✅ Sí | Apuntar el `Sitemap:` al dominio real; opcional: reglas para bots de IA. |
| `sitemap.xml` 404 | ✅ Sí | — |
| Sin Open Graph / Twitter Card | ✅ Sí | `og:image` por página, `og:image:alt`/dimensiones, `twitter:creator`. |
| Sin ningún JSON-LD | ✅ Parcial | `Organization`/`WebSite`/`Person` son mínimos; faltan `ProfessionalService`, `Product`, `Service`, `FAQPage`, `BreadcrumbList`, `VideoObject`, `Review`. |
| `<html lang="en">` para contenido español | ✅ Sí | — |
| Sin página 404 propia | ✅ Sí (Astro genera una) | Personalizarla con enlaces útiles. |
| Contenido en inglés por defecto | ✅ Sí (ES por defecto) | — |
| Solo la home tiene `<h1>`; títulos en `<div>` | ❌ No | Convertir `section-title` en encabezados; 1 `<h1>` por página. |
| Contenido delgado en subpáginas de portafolio | ❌ No | Reescribir como casos de estudio. |
| 0 menciones de Bogotá / Colombia | ❌ No | Recomendaciones A2, A3, A4. |
| Precios en USD sin `priceCurrency` | ❌ No | B2, B3. |
| Sin FAQ / contenido de respuesta (AEO) | ❌ No | A10, B5, B7. |
| Sin testimonios / reseñas | ❌ No | A5, A7. |
| Plantillas enlazan a fichas en inglés | ❌ No | B1. |
| Email `@gmail.com`, Facebook sin vanity URL | ❌ No | A9. |
| `og-image.png` genérica única | ❌ No | A13. |
| Script de redirección por idioma (nuevo, en `BaseLayout`) | ⚠️ Introduce un riesgo | Quitarlo o condicionarlo (sección 8). |
| Fuentes de Google bloqueando el render | ❌ No | `preload` de la fuente o `font-display` + autoalojar. |
| Dominio placeholder en `site` / `SITE_URL` / `robots.txt` | ❌ No (config) | Cambiarlo antes del deploy (A1). |

---

## 14. Plan de acción a 90 días

### Fase 1 — Semanas 1-2: base técnica y quick wins
- A1 desplegar la migración con dominio real + Search Console + envío de sitemap.
- A3 meter Bogotá/Colombia en title/H1/bio; `og:locale` `es_CO`.
- A5 crear/reclamar Google Business Profile + primeras reseñas.
- A4 + A6 schema `ProfessionalService` + `Person` enriquecido.
- A9 email de dominio + vanity URL de Facebook.
- Sección 8: quitar o condicionar el script de redirección por idioma.
- Convertir `section-title` en `<h1>/<h2>` reales (1 `<h1>` por página).

### Fase 2 — Semanas 3-6: contenido local y de producto
- A2 publicar las 4 páginas de servicio con ciudad (empezar por branding como plantilla).
- A10 FAQ + `FAQPage` en cada página de servicio.
- B1 + B2 + B3 páginas de producto propias en español con `Product`/`Offer` y precios en COP.
- B4 lead magnets con captura de correo para las 3 plantillas gratuitas.
- A7 sección de testimonios + `Review`/`AggregateRating`.
- A11 `BreadcrumbList` + migas.

### Fase 3 — Semanas 7-12: autoridad, AEO y off-site
- A8 reescribir 3-4 proyectos como casos de estudio con URL propia + `CreativeWork`.
- B5 guía "Cómo usar una plantilla de Notion" con `HowTo`.
- B6 artículo comparativo de plantillas de Notion en español.
- B7 FAQ por producto.
- B9 `VideoObject`.
- Off-site: perfiles de Behance/Dribbble/LinkedIn/Domestika con ubicación "Bogotá" y NAP consistente; alta en directorios (Malt, Workana, Cámara de Comercio de Bogotá).
- Revisar Search Console: consultas que ya generan impresiones y reforzarlas.

---

## 15. Glosario

| Término | En español llano |
|---|---|
| **SEO** | Optimización para aparecer en los resultados normales de Google. |
| **GEO** | Optimización para que los buscadores con IA (Perplexity, ChatGPT Search, Gemini, los "AI Overviews" de Google) te mencionen y enlacen al construir su respuesta. |
| **AEO** | Optimización para "ganar la respuesta": fragmentos destacados, el bloque "Otras preguntas" y la búsqueda por voz. Se logra respondiendo una pregunta concreta en 40-60 palabras bajo un encabezado con esa pregunta. |
| **hreflang** | Etiqueta que le dice a Google "esta página tiene una versión en otro idioma en esta otra URL", para que muestre la correcta a cada usuario. |
| **NAP** | *Name, Address, Phone*: nombre, dirección y teléfono del negocio, escritos igual en todas partes (web, Google, redes, directorios). |
| **GBP** | *Google Business Profile*: la ficha de empresa que aparece en Google Maps y en el panel lateral. Un "negocio de área de servicio" es el que va a donde el cliente y no muestra dirección. |
| **E-E-A-T** | *Experience, Expertise, Authoritativeness, Trustworthiness*: las señales de que detrás del sitio hay alguien con experiencia real, identificable y confiable. |
| **Schema / JSON-LD / datos estructurados** | Un bloque de código oculto en la página que describe su contenido en un formato que Google entiende ("esto es un producto, cuesta X", "esto es una persona, se llama Y"). Habilita los resultados enriquecidos. |
| **Canonical** | Etiqueta que declara cuál es la URL "oficial" de una página, para evitar contenido duplicado. |
| **Lead magnet** | Recurso gratuito (aquí: una plantilla de Notion) que se entrega a cambio del correo del visitante. |

---

## 16. Anexos — fragmentos JSON-LD recomendados

> **Antes de publicar cualquiera de estos:** valídalo en <https://validator.schema.org> y <https://search.google.com/test/rich-results>, y sustituye los valores de ejemplo (`REEMPLAZAR_*`) por los reales. Reemplaza `https://TU-DOMINIO` por el dominio de producción definitivo.

### 16.1 `Organization` completa (reemplaza la actual de `BaseLayout.astro:33-44`)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Alquimia Lab",
  "alternateName": "Alquimia Lab — Isabel Correa Boder",
  "url": "https://TU-DOMINIO/",
  "logo": {
    "@type": "ImageObject",
    "url": "https://TU-DOMINIO/logo-alquimia.png",
    "width": 512,
    "height": 512
  },
  "image": "https://TU-DOMINIO/og-image.png",
  "description": "Estudio de diseño de Isabel Correa Boder: identidad de marca, UI/UX, diseño para redes sociales y plantillas de Notion. Con sede en Bogotá, Colombia.",
  "email": "REEMPLAZAR_correo@alquimialab.com",
  "telephone": "+573104108483",
  "founder": { "@type": "Person", "name": "Isabel Correa Boder" },
  "areaServed": [
    { "@type": "City", "name": "Bogotá" },
    { "@type": "Country", "name": "Colombia" }
  ],
  "sameAs": [
    "https://www.instagram.com/alquimia.lab8/",
    "https://www.youtube.com/channel/UCWb7zKnOw5k_XDgfUcBn9eQ",
    "https://www.facebook.com/REEMPLAZAR_AlquimiaLab",
    "https://www.linkedin.com/in/REEMPLAZAR",
    "https://www.behance.net/REEMPLAZAR"
  ]
}
```

### 16.2 `ProfessionalService` (negocio de área de servicio, sin dirección)

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://TU-DOMINIO/#negocio",
  "name": "Alquimia Lab — Diseño gráfico y de marca en Bogotá",
  "url": "https://TU-DOMINIO/",
  "image": "https://TU-DOMINIO/og-image.png",
  "description": "Servicios de identidad de marca, UI/UX y diseño para redes sociales para empresas y marcas personales en Bogotá y toda Colombia.",
  "priceRange": "$$",
  "telephone": "+573104108483",
  "email": "REEMPLAZAR_correo@alquimialab.com",
  "areaServed": [
    { "@type": "City", "name": "Bogotá" },
    { "@type": "AdministrativeArea", "name": "Colombia" }
  ],
  "provider": { "@type": "Person", "name": "Isabel Correa Boder" },
  "knowsLanguage": ["es", "en"],
  "sameAs": ["https://www.instagram.com/alquimia.lab8/"],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Servicios de diseño",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Identidad de marca / Branding" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Diseño UI/UX" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Diseño para redes sociales" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Diseño visual y editorial" } }
    ]
  }
}
```

### 16.3 `Person` enriquecida (reemplaza `PortafolioPage.astro:87-95`)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Isabel Correa Boder",
  "jobTitle": "Diseñadora Gráfica y Curadora de Contenido Visual",
  "url": "https://TU-DOMINIO/portafolio",
  "image": "https://TU-DOMINIO/foto-isabel.jpg",
  "description": "Diseñadora gráfica basada en Bogotá, Colombia. Branding, UI/UX, ilustración y diseño editorial.",
  "worksFor": { "@type": "Organization", "name": "Freepik Company" },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Bogotá",
    "addressCountry": "CO"
  },
  "knowsLanguage": ["es", "en"],
  "knowsAbout": ["Branding", "Diseño UI/UX", "Ilustración", "Diseño editorial", "Diseño para redes sociales", "Plantillas de Notion"],
  "alumniOf": { "@type": "CollegeOrUniversity", "name": "Institución Universitaria Pascual Bravo" },
  "sameAs": [
    "https://www.instagram.com/alquimia.lab8/",
    "https://www.linkedin.com/in/REEMPLAZAR",
    "https://www.behance.net/REEMPLAZAR"
  ]
}
```

### 16.4 `Service` (una por página de servicio)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Diseño de identidad de marca",
  "name": "Diseño de identidad de marca en Bogotá",
  "url": "https://TU-DOMINIO/servicios/branding-bogota",
  "provider": { "@type": "Person", "name": "Isabel Correa Boder", "@id": "https://TU-DOMINIO/#negocio" },
  "areaServed": { "@type": "City", "name": "Bogotá" },
  "description": "Creación de identidades de marca: logotipo, sistema visual, guía de marca y aplicaciones.",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "COP",
    "price": "REEMPLAZAR",
    "priceSpecification": { "@type": "PriceSpecification", "priceCurrency": "COP", "price": "REEMPLAZAR" }
  }
}
```

### 16.5 `Product` + `Offer` (una por plantilla)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Plantilla de Notion — CRM para Freelancers",
  "description": "Sistema operativo en Notion para estructurar tu flujo de trabajo como freelance de principio a fin.",
  "image": "https://TU-DOMINIO/cover-freelancer-crm.webp",
  "brand": { "@type": "Brand", "name": "Alquimia Lab" },
  "url": "https://TU-DOMINIO/productos/crm-freelancers-notion",
  "offers": {
    "@type": "Offer",
    "url": "https://bordergaze.gumroad.com/l/FreelancerCRM",
    "priceCurrency": "COP",
    "price": "REEMPLAZAR",
    "availability": "https://schema.org/InStock"
  }
}
```
*(Para las plantillas gratuitas: `"price": "0"` y añade `"priceValidUntil"` si aplica. Añade `"aggregateRating"` solo cuando tengas valoraciones reales.)*

### 16.6 `FAQPage` (bloque en páginas de servicio y de producto)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta un proyecto de identidad de marca en Bogotá?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "REEMPLAZAR con una respuesta de 40-60 palabras que incluya un rango en COP y qué incluye."
      }
    },
    {
      "@type": "Question",
      "name": "¿Trabajas con clientes fuera de Bogotá?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí. Trabajo con clientes de toda Colombia y en remoto; el proceso es 100% en línea con reuniones por videollamada."
      }
    }
  ]
}
```

### 16.7 `HowTo` (guía "Cómo usar una plantilla de Notion")

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Cómo instalar y usar una plantilla de Notion",
  "totalTime": "PT5M",
  "step": [
    { "@type": "HowToStep", "position": 1, "name": "Abre el enlace de la plantilla", "text": "REEMPLAZAR" },
    { "@type": "HowToStep", "position": 2, "name": "Pulsa \"Duplicar\"", "text": "REEMPLAZAR" },
    { "@type": "HowToStep", "position": 3, "name": "Elige tu espacio de trabajo", "text": "REEMPLAZAR" },
    { "@type": "HowToStep", "position": 4, "name": "Personalízala", "text": "REEMPLAZAR" }
  ]
}
```

### 16.8 `BreadcrumbList`

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://TU-DOMINIO/" },
    { "@type": "ListItem", "position": 2, "name": "Portafolio", "item": "https://TU-DOMINIO/portafolio" },
    { "@type": "ListItem", "position": 3, "name": "Identidad de marca" }
  ]
}
```

### 16.9 `VideoObject`

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Música Lofi — Alquimia Lab",
  "description": "Selección de música lofi producida por Alquimia Lab.",
  "thumbnailUrl": "https://TU-DOMINIO/lofi-poster.png",
  "uploadDate": "REEMPLAZAR_2026-01-01",
  "contentUrl": "https://TU-DOMINIO/video/lofi-video.mp4"
}
```

---

*Informe generado con la skill `seo-geo-aeo` (adaptada: entrega en Markdown y con dos dimensiones añadidas — Internacionalización y SEO Local — que la skill base no cubre). Las puntuaciones y hallazgos se basan en el rastreo del sitio en vivo del 2026-09-04 y en la revisión del código de la migración presente en este repositorio.*
