/**
 * Puerta de build: longitudes de <title> y <meta name="description">.
 *
 * Recorre el HTML COMPILADO, no las fuentes, porque el proyecto produce
 * metadatos por tres caminos distintos (los mapas de i18n.ts, los archivos de
 * datos y literales dentro de los componentes). Revisar dist/ los cubre los
 * tres a la vez.
 *
 * Contexto: 5 de 8 títulos en español superaban los 60 caracteres y la
 * descripción de la home tenía 186. El español se expande ~5-7 caracteres
 * sobre el inglés y nadie lo había presupuestado.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const TITLE_MAX = 60;
const DESC_MAX = 160;
const DESC_MIN = 70;

const html = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith('.html')) html.push(full);
  }
})('dist');

/** Deshace las entidades que Astro escapa al serializar los atributos. */
const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");

const toRoute = (file) => {
  const rel = file.split(/[\\/]/).join('/').replace(/^dist/, '');
  return rel.replace(/\/index\.html$/, '').replace(/\.html$/, '') || '/';
};

const problems = [];

for (const file of html) {
  const src = readFileSync(file, 'utf8');
  // Las páginas con noindex (404) no compiten en resultados.
  if (/<meta name="robots" content="noindex/.test(src)) continue;
  // El token de verificación de Search Console es un archivo suelto, no una
  // página: no tiene ni debe tener <title> ni descripción.
  if (/google[0-9a-f]{16}\.html$/.test(file)) continue;

  const route = toRoute(file);
  const title = src.match(/<title>([^<]*)<\/title>/);
  const desc = src.match(/<meta name="description" content="([^"]*)"/);

  if (!title) {
    problems.push([route, 'falta <title>', '']);
  } else {
    const value = decode(title[1]);
    if (value.length > TITLE_MAX) {
      problems.push([route, `title ${value.length} > ${TITLE_MAX}`, value]);
    }
  }

  if (!desc) {
    problems.push([route, 'falta meta description', '']);
  } else {
    const value = decode(desc[1]);
    if (value.length > DESC_MAX) {
      problems.push([route, `description ${value.length} > ${DESC_MAX}`, value]);
    } else if (value.length < DESC_MIN) {
      problems.push([route, `description ${value.length} < ${DESC_MIN}`, value]);
    }
  }
}

if (problems.length) {
  console.error(`\n✗ check-meta: ${problems.length} problema(s) en ${html.length} páginas\n`);
  for (const [route, what, value] of problems) {
    console.error(`  ${route}`);
    console.error(`    ${what}`);
    if (value) console.error(`    ${value}`);
    console.error('');
  }
  process.exit(1);
}

console.log(
  `✓ check-meta: ${html.length} páginas · títulos ≤${TITLE_MAX} · descripciones ${DESC_MIN}-${DESC_MAX}`,
);
