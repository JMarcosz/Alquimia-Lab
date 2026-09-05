/**
 * Generador de imágenes responsive — SE EJECUTA EN LOCAL, NO EN VERCEL.
 *
 * POR QUÉ EXISTE
 * Transformar las imágenes durante el build disparaba el despliegue en Vercel
 * a ~15 minutos. Medido en este proyecto: AVIF codifica 4,2x más lento que
 * WebP (2021 ms vs 476 ms sobre una captura de 900px), y eran ~400
 * codificaciones AVIF por build. Ese trabajo es idéntico en cada despliegue
 * aunque las imágenes no cambien.
 *
 * Ahora se hace una vez en local, las variantes se commitean a
 * `public/img/opt/` y Vercel se limita a copiarlas. El build no toca sharp.
 *
 * USO
 *   npm run images          genera solo lo que falta o cambió
 *   npm run images -- --all regenera todo desde cero
 *
 * Los nombres llevan hash de contenido, así que se pueden servir con caché
 * inmutable y un cambio de imagen invalida solo esa.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const SRC_DIR = 'src/assets/img';
const OUT_DIR = 'public/img/opt';
const MANIFEST = 'src/image-manifest.json';

/** Anchos objetivo. Se descartan los mayores que la fuente. */
const WIDTHS = [480, 960, 1440, 1920];
const QUALITY = { avif: 55, webp: 78 };

const force = process.argv.includes('--all');

if (force && existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const sources = readdirSync(SRC_DIR).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));

/** Manifiesto previo, para reutilizar lo ya generado. */
const previous = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
const manifest = {};

let generated = 0;
let reused = 0;
let bytes = 0;

for (const file of sources) {
  const srcPath = join(SRC_DIR, file);
  const buf = readFileSync(srcPath);
  const hash = createHash('sha256').update(buf).digest('hex').slice(0, 8);
  const stem = basename(file, extname(file));
  const meta = await sharp(buf).metadata();

  // Si el hash coincide y los archivos siguen en disco, no se recodifica.
  const prev = previous[file];
  if (!force && prev?.hash === hash && prev.variants.every((v) => existsSync(join('public', v.avif)) && existsSync(join('public', v.webp)))) {
    manifest[file] = prev;
    reused += prev.variants.length;
    for (const v of prev.variants) {
      bytes += statSync(join('public', v.avif)).size + statSync(join('public', v.webp)).size;
    }
    continue;
  }

  const widths = WIDTHS.filter((w) => w < meta.width);
  widths.push(meta.width); // siempre el tamaño nativo como candidato mayor

  const variants = [];
  for (const w of widths) {
    const h = Math.round((meta.height * w) / meta.width);
    const stemW = `${stem}-${w}.${hash}`;
    const pipeline = () => sharp(buf).resize({ width: w, withoutEnlargement: true });

    const avifBuf = await pipeline().avif({ quality: QUALITY.avif, effort: 4 }).toBuffer();
    const webpBuf = await pipeline().webp({ quality: QUALITY.webp, effort: 5 }).toBuffer();

    writeFileSync(join(OUT_DIR, `${stemW}.avif`), avifBuf);
    writeFileSync(join(OUT_DIR, `${stemW}.webp`), webpBuf);

    variants.push({
      w,
      h,
      avif: `/img/opt/${stemW}.avif`,
      webp: `/img/opt/${stemW}.webp`,
    });
    generated += 1;
    bytes += avifBuf.length + webpBuf.length;
  }

  manifest[file] = { hash, width: meta.width, height: meta.height, variants };
  process.stdout.write(`  ${file.padEnd(32)} ${widths.length} anchos\n`);
}

// Limpieza: borra variantes de imágenes que ya no existen o cambiaron de hash.
const keep = new Set();
for (const entry of Object.values(manifest)) {
  for (const v of entry.variants) {
    keep.add(basename(v.avif));
    keep.add(basename(v.webp));
  }
}
let removed = 0;
for (const f of readdirSync(OUT_DIR)) {
  if (!keep.has(f)) {
    rmSync(join(OUT_DIR, f));
    removed += 1;
  }
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

console.log('');
console.log(`  fuentes:     ${sources.length}`);
console.log(`  generadas:   ${generated} variantes  ·  reutilizadas: ${reused}`);
if (removed) console.log(`  eliminadas:  ${removed} obsoletas`);
console.log(`  peso total:  ${(bytes / 1024 / 1024).toFixed(2)} MB en public/img/opt/`);
console.log(`  manifiesto:  ${MANIFEST}`);
