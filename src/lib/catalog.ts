/**
 * Acceso al catálogo de plantillas desde Supabase.
 *
 * Reemplaza el array estático que antes vivía en `src/data/plantillas.ts`. La
 * `interface Plantilla` sigue en ese archivo: acá solo se lee y se mapea la fila
 * de Postgres a esa forma, para que los componentes que consumen `plantillas`
 * no cambien.
 */
import { supabase, createAdminClient } from './supabase';
import type { Plantilla, PlantillaLang } from '../data/plantillas';
import type { PlantillaRowInput } from './validate';

export interface PlantillaRow {
  slug: string;
  name: string;
  price: string;
  href: string;
  img: string | null;
  icon: string | null;
  image_url: string | null;
  active: boolean;
  sort: number;
  es: PlantillaLang;
  en: PlantillaLang;
  updated_at: string;
}

export function rowToPlantilla(row: PlantillaRow): Plantilla {
  return {
    slug: row.slug,
    name: row.name,
    price: row.price,
    href: row.href,
    img: row.img ?? undefined,
    icon: row.icon ?? undefined,
    image: row.image_url ?? undefined,
    active: row.active,
    es: row.es,
    en: row.en,
  };
}

const RETRIES = 2;

async function fetchRows(): Promise<PlantillaRow[]> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const { data, error } = await supabase
      .from('plantillas')
      .select('*')
      .order('sort', { ascending: true });
    if (!error) return (data ?? []) as PlantillaRow[];
    lastError = error;
    if (attempt < RETRIES) await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
  }
  throw new Error(
    `Supabase no respondió al leer el catálogo: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

let cache: Promise<PlantillaRow[]> | null = null;

/**
 * Plantillas activas, ordenadas por `sort`. El cliente publicable solo ve filas
 * `active` (RLS), así que no hace falta filtrar aquí.
 *
 * El resultado se memoiza durante la vida del proceso: en un build estático
 * (`getStaticPaths` + `Footer` en 45 páginas) Supabase se consulta UNA vez.
 */
export async function getPlantillas(): Promise<Plantilla[]> {
  if (!cache) cache = fetchRows();
  try {
    return (await cache).map(rowToPlantilla);
  } catch (err) {
    cache = null; // permitir reintento en la siguiente llamada
    throw err;
  }
}

export async function getPlantilla(slug: string): Promise<Plantilla | undefined> {
  return (await getPlantillas()).find((p) => p.slug === slug);
}

// ── Panel admin (service_role, ignora RLS, solo servidor) ────────────────────

/** Todas las filas, incluidas las inactivas. Para la lista del panel. */
export async function adminListRows(): Promise<PlantillaRow[]> {
  const { data, error } = await createAdminClient()
    .from('plantillas')
    .select('*')
    .order('sort', { ascending: true });
  if (error) throw new Error(`adminListRows: ${error.message}`);
  return (data ?? []) as PlantillaRow[];
}

export async function adminGetRow(slug: string): Promise<PlantillaRow | null> {
  const { data, error } = await createAdminClient()
    .from('plantillas')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw new Error(`adminGetRow: ${error.message}`);
  return (data as PlantillaRow) ?? null;
}

export async function adminUpsertRow(row: PlantillaRowInput): Promise<void> {
  const { error } = await createAdminClient()
    .from('plantillas')
    .upsert(row, { onConflict: 'slug' });
  if (error) throw new Error(`adminUpsertRow: ${error.message}`);
}

export async function adminSetActive(slug: string, active: boolean): Promise<void> {
  const { error } = await createAdminClient()
    .from('plantillas')
    .update({ active })
    .eq('slug', slug);
  if (error) throw new Error(`adminSetActive: ${error.message}`);
}

export async function adminDeleteRow(slug: string): Promise<void> {
  const { error } = await createAdminClient().from('plantillas').delete().eq('slug', slug);
  if (error) throw new Error(`adminDeleteRow: ${error.message}`);
}
