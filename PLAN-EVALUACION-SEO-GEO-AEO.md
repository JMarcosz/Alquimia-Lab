# Plan de evaluación SEO / GEO / AEO — Alquimia Lab

**Fecha del plan:** 2026-09-05
**Preparado para:** Isabel Correa Boder — *Alquimia Lab*
**Skills aplicadas:** `seo-geo-aeo` (metodología de auditoría y rúbrica) + `portafolio-conversion` (lente de conversión como criterio de evaluación de contenido).
**Documentos previos que este plan continúa:**

- `informe-auditoria-seo.md` — auditoría completa del 2026-09-04 (sitio en vivo en Netlify + código de la migración a Astro).
- `CORRECCIONES-SEO.md` — registro de implementación: **Fase 1 (técnica)** y **Fase 2 (andamiaje de contenido)** ya aplicadas; **Fase 3** pendiente de datos de Isabel.

> **Qué NO es este plan.** No es un rediseño de frontend ni un cambio de estética. Es el procedimiento para **medir** el estado SEO / GEO / AEO del sitio ya migrado, **verificar** que las correcciones de Fase 1+2 funcionan de verdad, **re-puntuar** cada dimensión contra la línea base del informe, y dejar una **cadencia repetible** de evaluación. Todo hallazgo se traduce en una recomendación de posicionamiento, no en un rediseño visual.

---

## 1. Objetivo y alcance

### 1.1 Objetivos de negocio (heredados del informe)

| Meta | Descripción | Dimensiones que más la afectan |
|---|---|---|
| **A** | Captar clientes de **servicios de diseño** (branding, UI/UX, redes sociales, diseño visual/editorial) en **Bogotá y Colombia**. | SEO Local, AEO, GEO, contenido de conversión. |
| **B** | Vender **plantillas de Notion en español** (y productos impresos). | SEO de producto, AEO (comparativas / "cómo usar"), contenido. |

### 1.2 Qué evalúa este plan

1. **Salud técnica on-page** del sitio Astro desplegado (o del `dist/` compilado si aún no hay deploy).
2. **Datos estructurados** realmente emitidos y su validez.
3. **GEO**: perfil de entidad (Isabel + Alquimia Lab), densidad factual, y si los motores de IA citan a Alquimia Lab para las consultas objetivo.
4. **AEO**: aptitud para fragmentos destacados, FAQ, búsqueda por voz.
5. **Internacionalización / hreflang** ES ↔ EN.
6. **SEO Local Bogotá**: señales de ubicación, schema de negocio, GBP, reseñas, moneda.
7. **Contenido con lente de conversión** (`portafolio-conversion`): el copy actual, ¿responde a "¿entiende mi problema? / ¿puede hacerlo? / ¿voy a perder mi dinero?"?
8. **Verificación de Fase 1+2**: cada ítem implementado, ¿está vivo y correcto en producción?

### 1.3 Fuera de alcance (se nombra la herramienta que sí lo mide)

| No se evalúa aquí | Herramienta |
|---|---|
| Core Web Vitals, velocidad real, render móvil | <https://pagespeed.web.dev> |
| Backlinks / autoridad de dominio | Ahrefs / Semrush / Ubersuggest (free) |
| Clics, impresiones, posición media reales | Google Search Console (tras el deploy) |
| Tráfico y conversión | Google Analytics 4 / Plausible |
| Estado de la ficha local | Google Business Profile |
| Rediseño visual, cambios de layout o de marca | — (explícitamente excluido) |

---

## 2. Estado de partida (línea base a batir)

Puntuaciones **proyectadas** del informe del 2026-09-04 para el sitio migrado *tal cual*, antes de Fase 1+2, y el **objetivo** de esta evaluación tras Fase 1+2:

| Dimensión | Base informe (proyectado) | Estimado tras Fase 1+2 (`CORRECCIONES-SEO.md`) | Objetivo a confirmar en esta evaluación |
|---|:--:|:--:|:--:|
| SEO | 6/10 | ~8/10 | ≥ 7/10 verificado |
| GEO | 5/10 | ~7/10 | ≥ 6/10 verificado |
| AEO | 2/10 | ~5/10 | ≥ 5/10 verificado |
| Internacionalización / hreflang | 7/10 | ~8/10 | ≥ 8/10 verificado |
| SEO Local (Bogotá) | 1/10 | ~4/10 | ≥ 4/10 verificado |

**Regla de la evaluación:** una puntuación solo sube si hay **evidencia citada** (texto entre comillas, `archivo:línea`, captura de un validador, o URL con respuesta HTTP). Nada se da por hecho porque "se implementó".

### 2.1 Pendientes de Fase 3 que condicionan el techo de puntuación

Estos ítems están fuera del código y limitan lo que la evaluación puede puntuar hoy. Se listan para no penalizarlos como "defecto nuevo" sino como "pendiente conocido":

- Dominio de producción real (hoy `alquimia-lab.vercel.app`).
- Google Business Profile + 5-10 reseñas.
- `Review` / `AggregateRating` schema (no se creó con datos falsos — correcto).
- Email de dominio propio; LinkedIn y Behance en `sameAs`.
- Casos de estudio con URL propia para *Illustration*, *Packaging & Editorial*, *Email Marketing* (hoy solo en modales de `/portafolio`).
- Páginas de producto individuales en español con `Product` + precios en **COP**.
- Artículo `HowTo` "Cómo usar una plantilla de Notion" + comparativa.
- Decisión sobre si `/en/` se indexa o lleva `noindex`.
- `src/data/servicios.ts` es **borrador**: sin precios, plazos ni entregables reales.
- GSC + Analytics sin instalar.

---

## 3. Metodología

### 3.1 Dimensiones y rúbrica

Se puntúa cada dimensión **1-10** con la escala de la skill `seo-geo-aeo`:

| Banda | Significado |
|---|---|
| 1-3 | Crítico — invisible o penalizado |
| 4-5 | Por debajo de la media — oportunidades grandes sin aprovechar |
| 6-7 | Base aceptable — mejoras concretas necesarias |
| 8-9 | Fuerte — refinamientos menores |
| 10 | Ejemplar |

Dimensiones: **SEO, GEO, AEO** (de la skill) **+ Internacionalización/hreflang** y **SEO Local Bogotá** (añadidas en el informe; se mantienen porque son centrales para las Metas A y B).

### 3.2 Modo de recolección de datos

1. **Inspección de código / build.** Leer `dist/**/*.html` tras `pnpm build` (27 páginas). Confirmar qué llega en el HTML **inicial** (no lo que pinta JS).
2. **Fetch de URLs reales** (cuando haya deploy). Por cada URL objetivo, pedir el HTML crudo completo: meta tags, JSON-LD, encabezados, `link` (canonical/alternate), nav y cuerpo.
3. **Validadores externos** (sección 8).
4. **SERP manual** para las consultas objetivo (sección 7), en incógnito, geolocalización Bogotá.
5. **Prueba de citación en motores de IA** (sección 6.2): lanzar las preguntas objetivo en Perplexity, ChatGPT Search y Gemini y anotar si Alquimia Lab aparece citada.

### 3.3 Principios (de ambas skills)

- **Evaluar todo el sitio, no solo la home.** No marcar algo como "ausente" sin haberlo buscado en las 27 páginas.
- **Ser específico:** cada hallazgo cita evidencia real de una página concreta.
- **No inventar** métricas, testimonios ni compromisos comerciales al redactar recomendaciones de contenido. Resultado cualitativo factual antes que cifra sin fuente.
- **Resultado antes que tecnología** al evaluar el copy: el stack/herramientas nunca deben ir antes que el problema del cliente y el resultado.
- **Calibrar el tono** a los hallazgos: si algo está bien, se dice; si está roto, se comunica con urgencia sin alarmismo.

---

## 4. Inventario de páginas a evaluar

27 páginas (13 ES + 13 EN + 404). Fuente: `src/pages/**`.

| # | Ruta ES | Ruta EN | Tipo | Qué se revisa con prioridad |
|---|---|---|---|---|
| 1 | `/` | `/en/` | Inicio | H1 con señal Bogotá; copy factual vs "vibra"; CTA (¿"Explorar" genérico o acción?); enlaces internos a servicios; los **6 mensajes** de conversión. |
| 2 | `/portafolio` | `/en/portafolio` | Portafolio + Sobre mí | H1 único; bio con E-E-A-T y ubicación; los 4 servicios, ¿enlazan a `/servicios/*`?; ¿capacidades traducidas a problemas?; jerarquía global (proyectos → experiencia → habilidades → formación). |
| 3 | `/servicios` | `/en/servicios` | Índice de servicios | H1; tarjetas a las 4 páginas; enlace desde el menú; texto introductorio con keyword + ciudad. |
| 4 | `/servicios/identidad-de-marca-bogota` | `/en/servicios/…` | Servicio | `Service` + `FAQPage` schema; H1 con ciudad; "Qué incluye"; "Cómo trabajo"; FAQ (encabezados-pregunta); doble CTA; **aviso de borrador ausente en prod**; ¿precios/plazos reales o placeholder? |
| 5 | `/servicios/diseno-ui-ux-bogota` | `/en/servicios/…` | Servicio | Igual que #4. |
| 6 | `/servicios/diseno-redes-sociales-bogota` | `/en/servicios/…` | Servicio | Igual que #4. |
| 7 | `/servicios/diseno-visual-y-editorial-bogota` | `/en/servicios/…` | Servicio | Igual que #4. |
| 8 | `/productos` | `/en/productos` | Catálogo | `Product`+`Offer` (ItemList); `VideoObject`; moneda (**USD hoy → COP**); nº de plantillas coherente (8); enlaces salientes (¿fichas en inglés?); ausencia de páginas de producto propias. |
| 9 | `/contacto` | `/en/contacto` | Contacto | Profundidad de contenido; NAP / `ContactPoint`; email (¿Gmail?); formulario (¿backend o `mailto:`?); línea visible Bogotá. |
| 10 | `/branding` | `/en/branding` | Proyecto portafolio | H1/H2 reales; profundidad (el informe medía ~25 palabras útiles); contexto de cliente y resultado por marca; ¿candidato a caso de estudio? |
| 11 | `/ux` | `/en/ux` | Proyecto portafolio | Igual que #10 (era el más delgado). |
| 12 | `/social` | `/en/social` | Proyecto portafolio | Igual; 8 maquetas sin texto descriptivo. |
| 13 | `/ai-characters` | `/en/ai-characters` | Proyecto portafolio | Contenido más rico pero **fuera de tema** para el negocio de diseño: evaluar si canibaliza relevancia o si conviene `noindex` / reencuadre. |
| 14 | `/404` | (build) | Utilidad | `noindex, follow`; enlaces a inicio/servicios/portafolio. |

**Recursos a nivel de sitio:** `/robots.txt` (dominio correcto, apunta al sitemap), `/sitemap-index.xml` (HTTP 200, 26 URLs, alternates hreflang), `favicon`, `/og-image.png` (1200×630).

**Proyectos sin URL rastreable:** *Illustration*, *Packaging & Editorial*, *Email Marketing* — solo en modales de `PortafolioPage.astro`. Evaluar como hueco de indexación (candidatos a caso de estudio en Fase 3).

---

## 5. Guía de evaluación — SEO

Por cada página del inventario, registrar hallazgo + estado (**Bien / A revisar / Falta**).

### 5.1 Técnico on-page

| Señal | Criterio de "Bien" | Dónde mirar |
|---|---|---|
| `<title>` | Presente, 50-60 car., keyword + (donde aplique) ciudad, único por página | `i18n.ts` mapas `titles`, `servicios.ts`, `dist/**` |
| Meta description | Presente, 150-160 car., con gancho/CTA, única | `i18n.ts` `descriptions`, `servicios.ts` |
| H1 | Exactamente **uno** por página, con keyword | `dist/**` (grep `<h1`), componentes `pages/*` |
| Jerarquía H2/H3 | Lógica, sin saltos, sin `<div>` haciendo de título | `dist/**` |
| Canonical | Absoluta, auto-referente, correcta por locale | `BaseLayout.astro:162` |
| `hreflang` | `es`, `en`, `x-default` recíprocos y absolutos | `BaseLayout.astro:163-165` |
| Robots meta | Indexable salvo 404; decisión consciente sobre `/en/` | `BaseLayout.astro:157`, prop `noindex` |
| Viewport | Presente | `BaseLayout.astro:154` |
| `alt` en imágenes | Descriptivo, con keyword donde sea natural | componentes `pages/*`, `Pic.astro` |
| Enlaces internos | Anchor text descriptivo (no "Explorar"/"Ver") | `HomePage.astro`, `PortafolioPage.astro` |
| OG / Twitter | `og:title/description/url/image` + `image:width/height/alt` | `BaseLayout.astro:178-193` |

### 5.2 Calidad de contenido

- **Nº de palabras útiles** (texto editorial, sin nav/footer/hex/fuentes) por página; marcar las < 300.
- **Señal de keyword**: el tema principal queda claro en el primer párrafo; términos semánticos presentes.
- **Frescura**: ¿hay fecha de publicación/actualización donde tenga sentido (blog futuro, casos)?
- **Escaneabilidad**: subtítulos, párrafos cortos, listas.
- **Duplicación**: subpáginas de portafolio con meta casi idénticas (el informe lo señaló) — reconfirmar.

### 5.3 Datos estructurados (inventario de lo que se emite hoy)

| Tipo | Dónde | Qué verificar |
|---|---|---|
| `Organization` | `BaseLayout` (todas) | `@id`, `logo` ImageObject, `sameAs`, `email` (¿dominio?), `areaServed` |
| `ProfessionalService` | `BaseLayout` (todas) | sin `address`; `areaServed`, `priceRange`, `hasOfferCatalog` (4 servicios), `provider` → `#isabel` |
| `WebSite` | `BaseLayout` (todas) | `inLanguage` por locale, `publisher` |
| `Person` (`#isabel`) | `BaseLayout` (todas) | `knowsAbout`, `alumniOf`, `worksFor`, `sameAs`, `image` resuelve |
| `Service` | `ServicioPage` (×4) | uno por página, `provider`, `areaServed`, `serviceType` |
| `FAQPage` | `Faq.astro` en servicios | Q/A bien formados, coincide con el texto visible |
| `Product` + `Offer` | `ProductosPage` (ItemList) | `price`, `priceCurrency` (**USD → COP**), `availability`, `brand` |
| `VideoObject` | `ProductosPage` (lofi) | `uploadDate` real (hoy falta), `thumbnailUrl`, `contentUrl` |
| `BreadcrumbList` | `Breadcrumbs.astro` | posición correcta, en todas las páginas internas |

**Validación:** cada tipo pasa por <https://validator.schema.org> y <https://search.google.com/test/rich-results> sin errores; los *warnings* se listan pero no bajan la nota si son opcionales.

---

## 6. Guía de evaluación — GEO

### 6.1 E-E-A-T

| Señal | Criterio |
|---|---|
| Autor identificado | Isabel nombrada, con rol y trayectoria verificable (Freepik, formación) |
| Página "Sobre mí" | Explica quién es, formación, experiencia — hoy vive en `/portafolio` |
| Contacto accesible | Email, WhatsApp, ubicación visibles en varias páginas |
| Señales de confianza | Testimonios / premios / prensa — **hoy ausentes** (Fase 3, no inventar) |
| `Organization` schema | Marca declarada con logo, URL, `sameAs` a redes reales |

### 6.2 Contenido para síntesis por IA + prueba de citación

- **Densidad factual**: ¿hay datos concretos y citables (años de experiencia, ubicación, entregables, proceso numerado) o solo lenguaje de "vibra"?
- **Claim claro arriba**: la propuesta de valor en la primera frase de cada página.
- **Claridad de entidad**: "Alquimia Lab" e "Isabel Correa Boder" nombradas de forma consistente en texto + schema.
- **Prueba de citación (ejecutar y registrar):** lanzar estas consultas en Perplexity / ChatGPT Search / Gemini y anotar si el sitio es citado y con qué URL:
  - "diseñador gráfico freelance en Bogotá"
  - "diseño de identidad de marca en Bogotá precios"
  - "plantillas de Notion en español para finanzas personales"
  - "quién es Isabel Correa Boder diseñadora"
- Repetir tras cada avance de Fase 3; la mejora en citación es el KPI de GEO.

### 6.3 GEO técnico

- HTTPS; sin bloqueos en `robots.txt`; contenido en el HTML inicial (no solo JS).
- `sameAs` completo (falta LinkedIn, Behance).
- Profundidad de schema: tipos ricos ya presentes (`Person`, `Service`, `FAQPage`, `VideoObject`); pendiente `HowTo`, `Review`.

---

## 7. Guía de evaluación — AEO

| Señal | Criterio de "Bien" | Estado esperado tras Fase 1+2 |
|---|---|---|
| Párrafo de respuesta directa | 40-60 palabras bajo un encabezado en forma de pregunta | Parcial: existe en FAQ de servicios |
| Patrón de definición | "X es…" para el tema central de la página | A revisar en home y servicios |
| Listas | Pasos numerados / viñetas aptos para *list snippet* | "Qué incluye" / "Cómo trabajo" en servicios ✅ |
| Tablas comparativas | Para "mejores plantillas de Notion…" | Falta (Fase 3, artículo) |
| `FAQPage` schema | Presente y bien formado | ✅ en 4 servicios; **falta en `/productos` y `/contacto`** |
| `HowTo` schema | Para la guía de uso de plantillas | Falta (Fase 3) |
| Encabezados-pregunta | H2/H3 en lenguaje natural de pregunta | Solo en bloques FAQ; ampliar |
| `speakable` | Marcado en secciones aptas para voz | Ausente — evaluar si conviene |
| Lenguaje conversacional / cola larga | Cubre quién/qué/cuándo/dónde/por qué/cómo | Débil fuera de las FAQ |
| Señales locales (NAP) | Nombre, zona, teléfono coherentes en texto + schema | Parcial (sin dirección, por diseño) |

---

## 8. Evaluación técnica externa (herramientas)

Ejecutar tras el deploy y registrar resultado + fecha:

| Herramienta | Qué mide | Umbral de "Bien" |
|---|---|---|
| <https://pagespeed.web.dev> | Core Web Vitals, móvil | LCP < 2.5 s, CLS < 0.1, INP < 200 ms; Performance ≥ 90 |
| <https://search.google.com/test/rich-results> | Validez de rich results | 0 errores en Organization, ProfessionalService, Service, FAQPage, Product, BreadcrumbList, VideoObject |
| <https://validator.schema.org> | Sintaxis JSON-LD | 0 errores |
| Google Search Console | Cobertura, sitemap, consultas | Sitemap "correcto", 26 URLs indexables, 0 errores de cobertura graves |
| GSC — Inspección de URL | Render e indexación de `/` y `/en/` | "La URL está en Google", HTML renderizado = contenido ES en `/` |
| Ahrefs / Ubersuggest (free) | Backlinks, dominios de referencia | Línea base registrada (para comparación futura) |
| Verificación manual | `curl -I` a `/robots.txt`, `/sitemap-index.xml`, `/404` | 200 / 200 / 404 (con página propia) |

---

## 9. Evaluación de palabras clave y posicionamiento

No es investigación nueva (ya está en la sección 10 del informe); es **medición del estado actual** para esas keywords.

### 9.1 Meta A — servicios de diseño en Bogotá

Consultas a comprobar en SERP (incógnito, Bogotá) y en GSC:

- `diseñador gráfico freelance Bogotá`
- `diseño de identidad de marca Bogotá`
- `diseñador UI/UX freelance Bogotá`
- `diseño para redes sociales Bogotá`
- `diseño editorial Bogotá`

Registrar por consulta: ¿aparece el sitio? ¿en qué posición aproximada? ¿qué URL? ¿hay features (Local Pack, PAA, AI Overview) y aparece el sitio en ellas?

### 9.2 Meta B — plantillas de Notion

- `plantillas de Notion en español`
- `plantilla Notion finanzas personales gratis`
- `plantilla Notion hábitos`
- `plantilla Notion estudiantes`
- `mejores plantillas de Notion en español`

Mismos campos. Competencia de referencia del informe: `plantillasnotion.es`, `talentodigital.com`, `estudionotion.gumroad.com`.

### 9.3 Salida

Tabla por keyword: `consulta | volumen aprox. | intención | posición hoy | feature SERP | página que rankea | brecha`.

---

## 10. Lente de conversión (`portafolio-conversion`) como criterio de evaluación

Se aplica la skill como **checklist de auditoría de contenido**, no como reescritura. Alquimia Lab es un **estudio de diseño** (no un portafolio de desarrollador), así que "proyecto" = trabajo de cliente y "demo" = pieza/entregable publicado. El objetivo declarado es **cliente/negocio**, no reclutador → la lente aplica.

| # | Criterio | Cómo se evalúa | Página(s) |
|---|---|---|---|
| C1 | El hero **no** abre con identidad/rol ("Soy diseñadora gráfica…") | Leer el primer bloque sin scroll; ¿describe lo que el cliente obtiene? | `/`, `/portafolio` |
| C2 | Bloque hero ≤ 60 palabras y con CTA de acción (no "Explorar") | Contar palabras; clasificar el CTA | `/` |
| C3 | Capacidades traducidas a **problemas de negocio** | Cada servicio: ¿"te hago un logo" o "que tu negocio se vea coherente y reconocible"? | `/servicios/*`, `/portafolio` |
| C4 | Los **6 mensajes** tienen sección asignada: (1) sabe hacerlo (2) ya resolvió casos parecidos (3) no parece improvisado (4) entiende negocios (5) se puede trabajar tranquilo (6) el cliente sabe qué hacer para contratar | Mapear cada mensaje → sección concreta; marcar los huecos | todo el sitio |
| C5 | Home destaca **3-4 proyectos**, no todos por igual | Contar proyectos destacados en `/` y `/portafolio` | `/`, `/portafolio` |
| C6 | Casos de estudio en orden: Problema → Contexto → Solución → Funcionalidades → Decisiones técnicas → Stack → Dificultades → Resultado → Demo | Revisar si existe algún caso con esta estructura; hoy los proyectos son rejillas de imágenes | `/branding`, `/ux`, `/social` + modales |
| C7 | El **stack/herramientas nunca antes que el resultado** | Buscar bloques donde se listan herramientas antes del problema/resultado | `/portafolio`, `/servicios/*` |
| C8 | Sección "Cómo trabajo" con pasos claros | Existe en `/servicios/*` (4 pasos); ¿está en la home o en `/portafolio`? | `/servicios/*` |
| C9 | **FAQ de objeciones** (¿desaparecerás tras el pago? ¿y si necesito cambios? ¿seré dueño? no sé de diseño) | Las FAQ actuales son de alcance/precio; faltan las de **miedo a contratar** | `/servicios/*`, `/contacto` |
| C10 | Testimonios específicos y verificables (nombre + negocio + situación previa + qué se hizo + qué cambió) | Hoy **no hay** → registrar como pendiente, no inventar | — |
| C11 | Jerarquía global: proyectos → experiencia → habilidades → formación; sin experiencia irrelevante | Revisar orden en `/portafolio` | `/portafolio` |
| C12 | Auditoría de valor por scroll: por cada sección, "¿qué duda del cliente resuelve?" | Recorrer `/` y `/portafolio` sección a sección | `/`, `/portafolio` |

**Restricciones al redactar recomendaciones** (de la skill): no inventar resultados numéricos, testimonios, clientes ni compromisos comerciales (precios, plazos, garantías, propiedad del código/archivos) sin confirmación de Isabel. Sustituir métrica sin fuente por resultado cualitativo factual.

**Salida:** *Diagnóstico* (defectos, cada uno con la regla que viola, críticos primero) + lista de *Pendientes* con `[PENDIENTE: dato que debe aportar Isabel]`.

---

## 11. Verificación de la Fase 1+2 implementada

Checklist de "¿de verdad quedó vivo?" — cada ítem se comprueba en `dist/` o en la URL desplegada.

| Ref. | Verificación | Método | Estado |
|---|---|---|---|
| F1-1 | Cada una de las 27 páginas tiene **exactamente un `<h1>`** | `grep -c '<h1' dist/**/*.html` | ☐ |
| F1-2 | "Bogotá"/"Colombia" aparece en `<title>` y/o `<h1>` de inicio, portafolio, productos, contacto, servicios | inspección | ☐ |
| F1-2b | `og:locale` = `es_CO` en páginas ES | inspección `BaseLayout` render | ☐ |
| F1-3 | `Organization` con `@id`, `email`, `telephone`, `founder`, `areaServed`, `logo` ImageObject | Rich Results Test | ☐ |
| F1-4 | `ProfessionalService` presente en todo el sitio, **sin** `address` | validator.schema.org | ☐ |
| F1-5 | `Person` `#isabel` emitida en **todas** las páginas (no solo portafolio), sin duplicado | grep JSON-LD en `dist/` | ☐ |
| F1-6 | `Product`+`Offer` para las 8 plantillas; anotar `priceCurrency` actual | `/productos` HTML | ☐ (USD) |
| F1-7 | `VideoObject` del lofi presente; `uploadDate` — ¿real o falta? | `/productos` HTML | ☐ |
| F1-8 | `BreadcrumbList` + migas visibles en las páginas internas | inspección + Rich Results | ☐ |
| F1-9 | OG/Twitter con `image:width/height/alt`, `meta author` | inspección `<head>` | ☐ |
| F1-10 | **No** hay script de auto-redirección por idioma (`location.replace`) | grep en `dist/` | ☐ |
| F1-11 | `/404` responde 404 con `noindex, follow` y enlaces útiles | `curl -I`, inspección | ☐ |
| F1-12 | Copy dice "8 plantillas" (no 7); CTAs con `aria-label` | grep | ☐ |
| F2-14 | 4 páginas `/servicios/*-bogota` + espejo `/en/servicios/*` con `Service` + `FAQPage` | crawl + Rich Results | ☐ |
| F2-15 | `/servicios` en el menú principal y enlazada desde el portafolio | inspección `Nav.astro` | ☐ |
| F2-16 | `Faq.astro` y `Breadcrumbs.astro` reutilizados; **aviso de borrador NO aparece en producción** | build prod + inspección | ☐ |
| Sitemap | `/sitemap-index.xml` = 200, 26 URLs, con `alternate` hreflang | `curl`, ver XML | ☐ |
| Robots | `/robots.txt` = 200, dominio correcto, apunta al sitemap | `curl` | ☐ |
| hreflang | Reciprocidad `es`/`en`/`x-default` en 3 páginas de muestra | Rich Results / manual | ☐ |

---

## 12. Rúbrica de puntuación y formato del entregable

### 12.1 Tabla de puntuación (rellenar al cerrar la evaluación)

| Dimensión | Puntuación | Estado | Evidencia clave (1 línea) |
|---|:--:|---|---|
| SEO | _/10 | | |
| GEO | _/10 | | |
| AEO | _/10 | | |
| Internacionalización / hreflang | _/10 | | |
| SEO Local (Bogotá) | _/10 | | |
| **Combinado** | _/50 | | |

### 12.2 Estructura del informe de salida (formato skill `seo-geo-aeo`)

1. **Resumen ejecutivo** — 3-5 frases: fortaleza principal, problema más urgente, oportunidad clave. Específico del sitio.
2. **Cuadro de puntuaciones** con "hoy vs objetivo" y bandas de color.
3. **Páginas evaluadas** — tabla: URL · tipo · nota (p. ej. "H1 OK", "schema válido", "contenido < 300 palabras").
4. **Análisis SEO** — subsecciones Técnico on-page / Contenido / Datos estructurados; tabla `Señal | Hallazgo | Estado`.
5. **Análisis GEO** — E-E-A-T / Contenido para IA / GEO técnico + resultado de la prueba de citación.
6. **Análisis AEO** — Fragmentos / Formatos de respuesta / Voz.
7. **Internacionalización** y **SEO Local** — igual formato.
8. **Diagnóstico de conversión** (sección 10) — defectos con la regla que violan, críticos primero.
9. **Matriz de recomendaciones priorizadas** — `Prioridad (🔴/🟠/🟡/🟢) | Problema | Dimensión | Esfuerzo | Impacto`.
10. **Lo que ya funciona bien** — con evidencia concreta.
11. **Pendientes** — `[PENDIENTE: …]` con lo que debe aportar Isabel.
12. **Verificación Fase 1+2** — el checklist de la sección 11 con estado real.

**Convención:** guardar como `informe-evaluacion-seo-<AAAA-MM-DD>.md` en la raíz del repo, junto a `informe-auditoria-seo.md`. Opcionalmente publicar como Artifact para compartir con Isabel.

---

## 13. Cadencia de evaluación

| Momento | Alcance | Entregable |
|---|---|---|
| **Ahora (post Fase 1+2, pre o post primer deploy)** | Evaluación completa según este plan: secciones 5-12 + verificación §11 | `informe-evaluacion-seo-2026-09-…md` |
| **A las 2 semanas del deploy** | GSC: indexación de las 26 URLs, sitemap, primeras impresiones; PageSpeed | Nota corta de seguimiento |
| **Mensual** | Re-puntuar solo dimensiones tocadas ese mes; prueba de citación IA; posiciones de las keywords §9 | Fila nueva en un histórico de puntuaciones |
| **Tras cada ítem de Fase 3** (dominio real, GBP, reseñas, páginas de producto COP, artículo HowTo, casos de estudio) | Re-evaluar la dimensión afectada + su schema | Actualizar tabla §12.1 |
| **Trimestral** | Re-auditoría completa (este plan entero) + comparación contra `informe-auditoria-seo.md` | Informe trimestral |

**Disparadores fuera de calendario:** cambio de dominio, cambio de estructura de rutas, publicación de blog, o caída brusca de impresiones en GSC.

---

## 14. Checklist maestro

**Preparación**
- ☐ `pnpm build` limpio (27 páginas) y `pnpm astro check` sin errores
- ☐ Confirmar URL de evaluación: `dist/` local o dominio desplegado
- ☐ Tener a mano `informe-auditoria-seo.md` y `CORRECCIONES-SEO.md`

**Recolección**
- ☐ Inspección de las 27 páginas (`<head>`, JSON-LD, encabezados, cuerpo)
- ☐ `robots.txt`, `sitemap-index.xml`, `/404` verificados por HTTP
- ☐ Rich Results Test + validator.schema.org en las 7 familias de schema
- ☐ PageSpeed en `/` y en una página de servicio
- ☐ GSC: sitemap enviado, inspección de URL de `/` y `/en/`
- ☐ SERP manual de las 10 consultas de §9
- ☐ Prueba de citación IA (4 preguntas × 3 motores) de §6.2

**Análisis**
- ☐ Tabla `Señal | Hallazgo | Estado` completa por dimensión
- ☐ Checklist de conversión C1-C12 con diagnóstico
- ☐ Verificación Fase 1+2 §11 con estado real por fila
- ☐ Puntuación 1-10 por dimensión, cada una con evidencia citada

**Entrega**
- ☐ Informe con la estructura de §12.2
- ☐ Matriz de recomendaciones priorizada (impacto/esfuerzo)
- ☐ Lista de `[PENDIENTE: …]` para Isabel
- ☐ Fila añadida al histórico de puntuaciones
- ☐ Guardado como `informe-evaluacion-seo-<fecha>.md`

---

## 15. Datos que hacen falta de Isabel para cerrar la evaluación

Ninguno bloquea la evaluación técnica; sí condicionan el techo de las dimensiones de contenido y local:

- Dominio de producción definitivo.
- Si `/en/` debe indexarse o no.
- Precios (COP), plazos y entregables reales para `src/data/servicios.ts` y para las fichas de producto.
- 3-6 testimonios reales (nombre, negocio, situación previa, qué se hizo, qué cambió).
- URLs de LinkedIn y Behance; email de dominio propio.
- Para *Illustration*, *Packaging & Editorial*, *Email Marketing*: cliente, reto, qué hizo, resultado, rol, año (para convertirlos en casos de estudio).
- Acceso a Google Search Console y a un analítico (GA4 / Plausible) tras el deploy.
