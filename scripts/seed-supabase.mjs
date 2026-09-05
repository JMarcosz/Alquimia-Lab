/**
 * Carga db/plantillas.seed.json en la tabla `public.plantillas` de Supabase.
 * Idempotente: hace UPSERT por `slug`, se puede correr varias veces.
 *
 * Requisitos: variables en el entorno (o en .env.local, ver abajo).
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (secreta — NO la clave publicable)
 *
 * Uso:
 *   node --env-file=.env.local scripts/seed-supabase.mjs
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    'Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Corré:  node --env-file=.env.local scripts/seed-supabase.mjs',
  );
  process.exit(1);
}

const rows = JSON.parse(readFileSync(new URL('../db/plantillas.seed.json', import.meta.url), 'utf8'));

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const { data, error } = await supabase
  .from('plantillas')
  .upsert(rows, { onConflict: 'slug' })
  .select('slug');

if (error) {
  console.error('UPSERT falló:', error.message);
  process.exit(1);
}

console.log(`OK — ${data.length} filas en public.plantillas:`);
for (const r of data) console.log('  ·', r.slug);
