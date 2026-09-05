// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // ⚠️ Cambia esto por tu dominio real de producción (afecta canónicas,
  // hreflang, sitemap y Open Graph).
  site: 'https://alquimia-lab.vercel.app',

  // Salida estática con el adaptador de Vercel adjunto: todas las páginas se
  // prerenderizan (máximo rendimiento/SEO) y el adaptador deja disponible el
  // SSR bajo demanda para cualquier ruta que lo active con
  // `export const prerender = false`.
  output: 'static',
  adapter: vercel(),

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false, // ES vive en "/", EN en "/en/"
    },
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es', en: 'en' },
      },
    }),
  ],
});
