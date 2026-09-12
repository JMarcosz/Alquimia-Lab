/**
 * `llms.txt` generado desde `consts.ts` y `data/servicios.ts` — mismo motivo
 * que `robots.txt.ts`: una sola fuente de verdad para dominio, contacto y
 * redes, así este archivo no puede quedar desactualizado a mano.
 *
 * Se sirve como ruta (no como archivo en `public/`) para que Astro lo
 * prerenderice a un asset estático real en el build, con el `Content-Type`
 * correcto — igual que ya pasa con `robots.txt`. Un `public/llms.txt` corría
 * el riesgo de quedar sin tocar mientras el copy real vive en `servicios.ts`.
 */
import type { APIRoute } from 'astro';
import {
  SITE_URL,
  SITE_NAME,
  AUTHOR_NAME,
  BUSINESS_CITY,
  BUSINESS_COUNTRY,
  BUSINESS_DESCRIPTION_ES,
  CONTACT_EMAIL,
  WHATSAPP_URL,
  SOCIAL_LINKS,
} from '../consts';
import { servicios } from '../data/servicios';

const serviceLines = servicios
  .map((s) => `- [${s.es.short}](${SITE_URL}/servicios/${s.slug}): ${s.es.intro}`)
  .join('\n');

const socialLines = SOCIAL_LINKS.map((url) => `- ${url}`).join('\n');

const body = `# ${SITE_NAME}

> ${BUSINESS_DESCRIPTION_ES}

Estudio de diseño de ${AUTHOR_NAME} en ${BUSINESS_CITY}, ${BUSINESS_COUNTRY}. Trabajo con clientes locales y remotos en identidad de marca, diseño UI/UX, diseño para redes sociales y diseño visual y editorial, además de un catálogo de plantillas de Notion listas para usar.

## Servicios

${serviceLines}

## Plantillas de Notion

- [Catálogo de plantillas](${SITE_URL}/plantillas-notion): plantillas de Notion listas para usar, para organizar proyectos, contenido y trabajo personal.

## Portafolio

- [Portafolio](${SITE_URL}/portafolio): casos de trabajo en identidad de marca, UI/UX, redes sociales y diseño editorial.

## Contacto

- [Formulario de contacto](${SITE_URL}/contacto)
- WhatsApp: ${WHATSAPP_URL}
- Email: ${CONTACT_EMAIL}

## Redes sociales

${socialLines}
`;

export const GET: APIRoute = () =>
  new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
