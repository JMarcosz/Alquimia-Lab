/** Site-wide constants shared across pages and structured data. */

// ⚠️ Cambia esto por tu dominio real de producción (debe coincidir con `site` en astro.config.mjs).
export const SITE_URL = 'https://alquimia-lab.vercel.app';
export const SITE_NAME = 'Alquimia Lab';
export const AUTHOR_NAME = 'Isabel Correa Boder';

// Contacto
export const WHATSAPP_URL = 'https://wa.me/573104108483';
/** Teléfono en formato E.164 para schema y enlaces `tel:`. */
export const PHONE_E164 = '+573104108483';
/** Teléfono legible para mostrar en pantalla. */
export const PHONE_DISPLAY = '+57 310 410 8483';
// TODO: reemplazar por un correo de dominio propio (ej. hola@alquimialab.com).
export const CONTACT_EMAIL = 'alquimialab88@gmail.com';

// Negocio (negocio de área de servicio, sin dirección pública)
export const BUSINESS_CITY = 'Bogotá';
export const BUSINESS_COUNTRY = 'Colombia';
export const BUSINESS_COUNTRY_CODE = 'CO';
/** Coordenadas aproximadas de Bogotá (para `geo` en schema; ajústalas si quieres). */
export const BUSINESS_GEO = { lat: 4.711, lon: -74.0721 };
export const BUSINESS_PRICE_RANGE = '$$';

export const BUSINESS_DESCRIPTION_ES =
  'Estudio de diseño de Isabel Correa Boder en Bogotá, Colombia: identidad de marca, UI/UX, diseño para redes sociales y plantillas de Notion para organizar el trabajo.';
export const BUSINESS_DESCRIPTION_EN =
  'Design studio by Isabel Correa Boder in Bogotá, Colombia: brand identity, UI/UX, social media design and Notion templates to organize your work.';

export const SOCIAL_LINKS = [
  'https://www.instagram.com/alquimia.lab8/',
  'https://www.youtube.com/channel/UCWb7zKnOw5k_XDgfUcBn9eQ',
  'https://www.facebook.com/profile.php?id=61592768576548',
  // TODO: añadir cuando existan / se personalicen:
  // 'https://www.linkedin.com/in/…',
  // 'https://www.behance.net/…',
];
