// @ts-check
import { statSync } from 'node:fs';
import { defineConfig, passthroughImageService } from 'astro/config';
import { loadEnv } from 'vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './src/consts.ts';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const SUPABASE_URL = env.SUPABASE_URL ?? process.env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_KEY ?? process.env.SUPABASE_KEY;

/**
 * Fecha de subida del video lofi para el `VideoObject` de `/productos`. Se
 * resuelve del mtime real del archivo EN EL BUILD y se inyecta como constante:
 * `/productos` es SSR y `public/` NO existe en el filesystem de la función
 * serverless de Vercel, así que un `statSync` en tiempo de request tiraba
 * `ENOENT`, el render fallaba y la página quedaba en blanco (con la respuesta
 * vacía cacheada en el edge). Si el archivo no está (p. ej. en un check parcial),
 * cae a la fecha de hoy.
 */
const LOFI_VIDEO_DATE = (() => {
  try {
    return statSync('public/video/lofi-video.mp4').mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
})();

/**
 * URLs que el sitemap ya no puede descubrir solo porque sus páginas son SSR
 * (`/plantillas-notion/*` y `/productos` leen de Supabase en cada request para
 * que altas y bajas se vean sin desplegar). Se listan aquí, resueltas desde la
 * base en el build. Un producto nuevo entra al sitemap en el siguiente build;
 * mientras tanto Google lo alcanza por los enlaces internos del hub (que es
 * SSR y siempre está al día). Las páginas emiten su `hreflang` en el `<head>`,
 * así que el emparejado ES/EN no depende del `<xhtml:link>` del sitemap.
 */
async function ssrSitemapUrls() {
  const fixed = [
    // La home también es SSR (su carrusel lee el catálogo), así que el crawler
    // del build ya no la descubre. Sin esto desaparece del sitemap.
    `${SITE_URL}/`,
    `${SITE_URL}/en`,
    `${SITE_URL}/plantillas-notion`,
    `${SITE_URL}/en/plantillas-notion`,
    `${SITE_URL}/productos`,
    `${SITE_URL}/en/productos`,
  ];
  if (!SUPABASE_URL || !SUPABASE_KEY) return fixed;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/plantillas?select=slug&active=eq.true`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
    );
    if (!res.ok) return fixed;
    /** @type {{ slug: string }[]} */
    const rows = await res.json();
    return [
      ...fixed,
      ...rows.flatMap((r) => [
        `${SITE_URL}/plantillas-notion/${r.slug}`,
        `${SITE_URL}/en/plantillas-notion/${r.slug}`,
      ]),
    ];
  } catch {
    return fixed;
  }
}

const customPages = await ssrSitemapUrls();

// https://astro.build/config
export default defineConfig({
  // Dominio canónico. NO se escribe literal aquí: se importa de `src/consts.ts`
  // para que exista una sola fuente de verdad (afecta canónicas, hreflang,
  // sitemap, Open Graph y robots.txt).
  site: SITE_URL,

  // Salida estática con el adaptador de Vercel adjunto: la mayoría de páginas se
  // prerenderizan (máximo rendimiento/SEO) y las que activan
  // `export const prerender = false` (`/admin`, `/api/admin`, catálogo de
  // plantillas) se sirven SSR bajo demanda.
  output: 'static',
  adapter: vercel(),

  // El sitio no usa `astro:assets`: `<Pic>` sirve variantes pregeneradas desde
  // `src/image-manifest.json`. Con rutas SSR (`/admin`, `/api/admin`) el
  // adaptador arrastraba `sharp` al bundle de la función y fallaba al symlinkear
  // en Windows/OneDrive. El servicio passthrough quita esa dependencia del
  // runtime; `sharp` sigue disponible para los scripts de build.
  image: { service: passthroughImageService() },

  vite: {
    define: {
      // Ver LOFI_VIDEO_DATE arriba: dato de build, no de request.
      'import.meta.env.LOFI_VIDEO_DATE': JSON.stringify(LOFI_VIDEO_DATE),
    },
  },

  redirects: {
    // @astrojs/sitemap genera `/sitemap-index.xml`. Search Console y muchas
    // herramientas asumen `/sitemap.xml`: se redirige (301) para cubrir ese
    // caso. `robots.txt` ya apunta al -index directamente.
    '/sitemap.xml': '/sitemap-index.xml',
  },


  // El sitemap emitía `/ai-characters/` con barra final mientras el canonical
  // decía `/servicios` sin ella. Se fija una sola convención.
  trailingSlash: 'never',

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false, // ES vive en "/", EN en "/en/"
    },
  },

  integrations: [
    sitemap({
      // `/404` lleva `noindex`: enviarlo en el sitemap es contradictorio.
      filter: (page) => !page.includes('/404') && !page.includes('/admin'),

      // Páginas SSR del catálogo que el crawler del build ya no ve.
      customPages,

      // ⚠️ Esta opción SOLO funciona mientras ES y EN compartan slug.
      // `createGetI18nLinks` empareja URLs cuyo path coincide tras quitar el
      // prefijo de locale; en cuanto los slugs difieran por idioma dejará de
      // emitir <xhtml:link> SIN AVISAR. Ver Fase 3.3 del plan.
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es', en: 'en' },
      },
    }),
  ],
});
