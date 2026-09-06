/**
 * Plantillas de Notion: una página indexable por producto.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO
 * Los competidores por "plantillas notion colombia" (plantillasnotion.com,
 * notionplantillas.com, notion-latam.com) tienen UNA URL POR PLANTILLA. Su hub
 * apenas tiene 150-200 palabras: la fuerza está en las URLs de producto, no en
 * la longitud del hub. Alquimia Lab tenía 11 productos y CERO páginas de
 * producto; todo el catálogo vivía en /productos, oculto además tras un
 * `display:none` accionado por un onclick en línea.
 *
 * Sigue el patrón de `servicios.ts`: `es` y `en` AMBOS obligatorios, de modo
 * que una traducción faltante es error de compilación y no inglés silencioso
 * en una URL española.
 *
 * Los precios se mantienen en USD por decisión del autor. (El competidor
 * notion-latam.com también lista en USD.)
 */

export interface PlantillaFaq {
  q: string;
  a: string;
}

export interface PlantillaLang {
  /** <title>, 50-60 caracteres. */
  title: string;
  /** <meta description>, 150-160 caracteres. */
  metaDescription: string;
  /** <h1> de la página. */
  h1: string;
  /** 2-3 frases: qué es y para quién. */
  intro: string;
  /** Para quién es. */
  forWho: string[];
  /** Qué incluye. */
  includes: string[];
  faq: PlantillaFaq[];
}

export interface Plantilla {
  /** Slug lógico con keyword en español. */
  slug: string;
  /**
   * Nombre comercial, idéntico en ambos idiomas. FUENTE ÚNICA del nombre
   * visible: tarjetas, migas de pan, enlaces y JSON-LD salen todos de aquí.
   * Antes convivía con un `short` por idioma y editar uno no movía el otro:
   * el panel mostraba un nombre y la web otro.
   */
  name: string;
  /** Portada en src/assets/img, si existe. Pipeline `<Pic>` (legado). */
  img?: string;
  /**
   * URL pública de imagen subida desde el panel (Supabase Storage).
   * Prevalece sobre `img`: si está, se renderiza con `<img>` normal.
   */
  image?: string;
  /** Nombre de icono Lucide (ver src/components/Icon.astro) cuando no hay portada. */
  icon?: string;
  /** Precio tal cual se muestra. 'Free' = gratuita. */
  price: string;
  /** Ficha externa de compra o duplicado. */
  href: string;
  /**
   * Visible en el sitio. Por defecto `true`; el panel puede ocultar una
   * plantilla sin borrarla. Las filas inactivas ni siquiera llegan al build
   * (RLS en Supabase).
   */
  active?: boolean;
  es: PlantillaLang;
  en: PlantillaLang;
}

/*
 * Los datos viven ahora en Supabase (tabla `public.plantillas`) y SOLO ahí. Se
 * leen con `getPlantillas()` de `src/lib/catalog.ts`; este archivo conserva
 * únicamente los tipos, que siguen siendo la fuente de verdad de la FORMA de
 * cada fila (no de su contenido).
 *
 * Ya no hay semilla en el repo. `db/plantillas.seed.json` y los scripts
 * `export-plantillas.mjs` / `seed-supabase.mjs` se eliminaron: cumplieron su
 * función en la migración inicial y después eran una segunda copia del
 * catálogo que solo podía divergir —cargar la semilla habría revertido la
 * tabla a su estado de septiembre—. Están en el historial de git si alguna vez
 * hace falta consultarlos.
 *
 * Migración del esquema: `db/schema.sql`.
 */
