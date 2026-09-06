/**
 * Puerta de build: iconos, imagen de vista previa y URLs de imagen del JSON-LD.
 *
 * Cada comprobación existe porque el fallo correspondiente estuvo meses en
 * producción sin que nadie lo viera:
 *  - favicon.ico era un PNG renombrado, y de 32px (Google exige múltiplo de 48)
 *  - og:image declaraba 1200x630 sobre un archivo de 1280x720
 *  - Organization.logo y Person.image apuntaban a rutas de public/ inexistentes
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const fail = [];
const ok = [];
const check = (cond, msg) => (cond ? ok.push(msg) : fail.push(msg));

// 1-2. favicon.ico: firma ICO real + entrada de 48x48
const ico = readFileSync('public/favicon.ico');
const sig = ico.subarray(0, 4).toString('hex');
check(sig === '00000100', `favicon.ico firma ICO válida (leído: ${sig})`);
if (sig === '00000100') {
  const n = ico.readUInt16LE(4);
  const sizes = Array.from({ length: n }, (_, i) => ico.readUInt8(6 + i * 16) || 256);
  check(sizes.includes(48), `favicon.ico contiene 48x48 (tiene: ${sizes.join(', ')})`);
}

// 3-4. PNG del set, dimensiones exactas y múltiplos de 48
for (const s of [48, 96, 192]) {
  const f = `public/favicon-${s}x${s}.png`;
  if (!existsSync(f)) { fail.push(`falta ${f}`); continue; }
  const m = await sharp(f).metadata();
  check(m.width === s && m.height === s, `${f} es ${s}x${s} (real ${m.width}x${m.height})`);
  check(s % 48 === 0, `${s}px es múltiplo de 48 (requisito de Google)`);
}

// 5. apple-touch-icon 180x180 SIN alfa (iOS pinta de negro la transparencia)
{
  const f = 'public/apple-touch-icon.png';
  if (!existsSync(f)) fail.push(`falta ${f}`);
  else {
    const m = await sharp(f).metadata();
    check(m.width === 180 && m.height === 180, `${f} es 180x180 (real ${m.width}x${m.height})`);
    check(!m.hasAlpha, `${f} sin canal alfa`);
  }
}

// 6. OG: 1200x630 JPEG por debajo de 300 KB (límite práctico de WhatsApp)
const OG = 'public/og-image.jpg';
let ogW = 0, ogH = 0;
if (!existsSync(OG)) fail.push(`falta ${OG}`);
else {
  const m = await sharp(OG).metadata();
  ogW = m.width; ogH = m.height;
  const kb = statSync(OG).size / 1024;
  check(m.width === 1200 && m.height === 630, `${OG} es 1200x630 (real ${m.width}x${m.height})`);
  check(m.format === 'jpeg', `${OG} es JPEG (real ${m.format})`);
  check(kb < 300, `${OG} pesa ${kb.toFixed(1)} KB < 300 KB`);
}

// 9. webmanifest parsea y declara 192 + 512
{
  const f = 'public/site.webmanifest';
  if (!existsSync(f)) fail.push(`falta ${f}`);
  else {
    const m = JSON.parse(readFileSync(f, 'utf8'));
    const have = (m.icons ?? []).map((i) => i.sizes);
    check(have.includes('192x192') && have.includes('512x512'),
      `site.webmanifest declara 192 y 512 (tiene: ${have.join(', ')})`);
  }
}

// --- Comprobaciones sobre la salida compilada, solo si ya se compiló ---
// Con rutas SSR (`prerender = false`) el adaptador de Vercel emite los assets
// estáticos bajo `dist/client/`; en un build 100% estático están en `dist/`.
const DIST = existsSync('dist/client') ? 'dist/client' : 'dist';
if (existsSync(DIST)) {
  const html = [];
  (function walk(dir) {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      if (statSync(p).isDirectory()) walk(p);
      else if (e.endsWith('.html')) html.push(p);
    }
  })(DIST);

  const norm = (f) => f.split(/[\\/]/).join('/');
  const page = readFileSync(
    html.find((f) => norm(f).endsWith(`${DIST}/index.html`)) ?? html[0],
    'utf8',
  );

  // 7. og:image:width/height declarados == archivo real
  const w = page.match(/property="og:image:width" content="(\d+)"/)?.[1];
  const h = page.match(/property="og:image:height" content="(\d+)"/)?.[1];
  check(Number(w) === ogW && Number(h) === ogH,
    `og:image declara ${w}x${h} y el archivo es ${ogW}x${ogH}`);

  // 8. toda URL de imagen del JSON-LD resuelve a un archivo real de dist/
  const missing = new Set();
  let refs = 0;
  for (const f of html) {
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(/"(?:url|image|logo|thumbnailUrl|contentUrl)":"(https?:\/\/[^"]+)"/g)) {
      const u = new URL(m[1]);
      if (!/\.(png|jpe?g|webp|avif|gif|svg|mp4)$/i.test(u.pathname)) continue;
      refs++;
      if (!existsSync(join(DIST, decodeURIComponent(u.pathname)))) missing.add(u.pathname);
    }
  }
  check(missing.size === 0,
    `${refs} URLs de imagen en JSON-LD resuelven${missing.size ? ` (rotas: ${[...missing].join(', ')})` : ''}`);
}

for (const m of ok) console.log(`  ✓ ${m}`);
if (fail.length) {
  console.error(`\n✗ check-assets: ${fail.length} fallo(s)\n`);
  for (const m of fail) console.error(`  ✗ ${m}`);
  process.exit(1);
}
console.log(`✓ check-assets: ${ok.length} comprobaciones en verde`);
