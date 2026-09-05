// Exporta el array actual de src/data/plantillas.ts a db/plantillas.seed.json
// para cargarlo en Supabase una sola vez. Node 22 quita los tipos al vuelo.
import { writeFileSync } from 'node:fs';
import { plantillas } from '../src/data/plantillas.ts';

const rows = plantillas.map((p, i) => ({
  slug: p.slug,
  name: p.name,
  price: p.price,
  href: p.href,
  img: p.img ?? null,
  icon: p.icon ?? null,
  image_url: null,
  active: true,
  sort: i,
  es: p.es,
  en: p.en,
}));

writeFileSync('db/plantillas.seed.json', JSON.stringify(rows, null, 2) + '\n');
console.log(`db/plantillas.seed.json — ${rows.length} filas`);
