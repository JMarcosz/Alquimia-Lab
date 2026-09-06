export const prerender = false;

import type { APIRoute } from 'astro';
import { getCatalogVersion } from '../../lib/catalog';

/**
 * Huella del catálogo, para el sondeo de `CatalogLive.astro`.
 *
 * Público y de solo lectura: no expone ningún dato del catálogo, únicamente
 * "cuántas plantillas visibles hay y cuándo se tocó la última". El navegador
 * compara ese texto con el que tenía y recarga si cambió.
 *
 * Es el motivo por el que el sitio público no necesita `supabase-js` ni la
 * clave anónima en el bundle: la consulta la sigue haciendo el servidor.
 */
export const GET: APIRoute = async () => {
  try {
    return new Response(JSON.stringify({ v: await getCatalogVersion() }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    // Un fallo puntual de red no debe provocar recargas: se responde 503 sin
    // huella y el cliente conserva la que ya tenía.
    return new Response(JSON.stringify({ v: null }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
};
