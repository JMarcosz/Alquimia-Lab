/**
 * Resuelve una imagen del manifiesto a una URL absoluta.
 *
 * Se usa para los datos estructurados (JSON-LD), donde schema.org exige URLs
 * absolutas. Lee de las variantes pregeneradas por `npm run images` en vez de
 * transformar en tiempo de build, que es lo que llevaba el despliegue de
 * Vercel a ~15 minutos.
 */
import manifest from './image-manifest.json';

type Variant = { w: number; h: number; avif: string; webp: string };
type Entry = { hash: string; width: number; height: number; variants: Variant[] };

const entries = manifest as Record<string, Entry>;

/**
 * Devuelve la URL absoluta de una imagen, en el ancho más cercano por debajo
 * de `maxWidth` (o el mayor disponible si no se indica).
 *
 * Lanza si el archivo no está en el manifiesto: es preferible romper el build
 * a emitir un JSON-LD con una imagen que da 404, que es exactamente lo que
 * pasaba antes con `Organization.logo` y `Person.image`.
 */
export function imageUrl(name: string, site: URL | string, maxWidth?: number): string {
  const entry = entries[name];
  if (!entry) {
    throw new Error(
      `imageUrl(): "${name}" no está en src/image-manifest.json. ` +
        `Añádelo a src/assets/img/ y ejecuta \`npm run images\`.`,
    );
  }
  const usable = maxWidth ? entry.variants.filter((v) => v.w <= maxWidth) : entry.variants;
  const pick = (usable.length ? usable : entry.variants).at(-1)!;
  return new URL(pick.webp, site).href;
}

/** `true` si el archivo tiene variantes generadas. */
export const hasImage = (name: string): boolean => name in entries;
