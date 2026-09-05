// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './src/consts.ts';

// https://astro.build/config
export default defineConfig({
  // Dominio canónico. NO se escribe literal aquí: se importa de `src/consts.ts`
  // para que exista una sola fuente de verdad (afecta canónicas, hreflang,
  // sitemap, Open Graph y robots.txt).
  site: SITE_URL,

  // Salida estática con el adaptador de Vercel adjunto: todas las páginas se
  // prerenderizan (máximo rendimiento/SEO) y el adaptador deja disponible el
  // SSR bajo demanda para cualquier ruta que lo active con
  // `export const prerender = false`.
  output: 'static',
  adapter: vercel(),

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
      filter: (page) => !page.includes('/404'),

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
