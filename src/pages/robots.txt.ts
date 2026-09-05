/**
 * robots.txt generado desde `SITE_URL`.
 *
 * Antes era un archivo estático en `public/` con el dominio escrito a mano,
 * que quedó apuntando a `alquimia-lab.vercel.app` (HTTP 404) mientras el sitio
 * vivía en otro host: Google no encontraba el sitemap. Generándolo aquí, el
 * dominio no puede volver a divergir de `astro.config.mjs` ni de `consts.ts`.
 */
import type { APIRoute } from 'astro';
import { SITE_URL } from '../consts';

/**
 * Rastreadores de IA permitidos de forma EXPLÍCITA. El objetivo del proyecto
 * incluye aparecer en respuestas de Perplexity / ChatGPT / Gemini (GEO), así
 * que se les da acceso a propósito en vez de dejarlo al comportamiento por
 * defecto. Para revocarlo, cambia `Allow` por `Disallow` en este bloque.
 */
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'PerplexityBot',
  'Google-Extended',
];

// `Allow: /` debe conservarse: Google exige que el favicon sea rastreable
// para poder mostrarlo en los resultados de búsqueda.
const aiBlock = AI_BOTS.map((bot) => `User-agent: ${bot}\nAllow: /`).join('\n\n');

const body = [
  'User-agent: *',
  'Allow: /',
  '',
  aiBlock,
  '',
  `Sitemap: ${SITE_URL}/sitemap-index.xml`,
  '',
].join('\n');

export const GET: APIRoute = () =>
  new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
