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

/**
 * Plantillas activas, ordenadas por `sort`. El cliente publicable solo ve filas
 * `active` (RLS), así que no hace falta filtrar aquí.
 *
 * SIN CACHÉ, a propósito. Antes había una memoria de 10 s que, sumada al
 * `s-maxage=60` del edge, hacía que un cambio del panel tardara hasta ~70 s en
 * verse. El catálogo debe reflejar la base de datos al instante, así que cada
 * render consulta. Son 8 filas y las rutas que llaman aquí ya se sirven
 * `no-store`: el coste real es una consulta por visita.
 */
export async function getPlantillas(): Promise<Plantilla[]> {
  return (await fetchRows()).map(rowToPlantilla);
}

/**
 * Huella del catálogo para que el navegador detecte cambios sin recargar a
 * ciegas: la marca de tiempo más reciente y cuántas filas visibles hay. El
 * contador es necesario porque ocultar una plantilla la saca del alcance de
 * RLS y su `updated_at` dejaría de contar para el máximo.
 */
export async function getCatalogVersion(): Promise<string> {
  const rows = await fetchRows();
  const latest = rows.reduce((max, r) => (r.updated_at > max ? r.updated_at : max), '');
  return `${rows.length}:${latest}`;
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

/** ¿Ya existe una fila con ese slug? */
export async function adminSlugExists(slug: string): Promise<boolean> {
  const { data, error } = await createAdminClient()
    .from('plantillas')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw new Error(`adminSlugExists: ${error.message}`);
  return data !== null;
}

/** Siguiente `sort` para que una plantilla nueva quede al final de la lista. */
export async function adminNextSort(): Promise<number> {
  const { data, error } = await createAdminClient()
    .from('plantillas')
    .select('sort')
    .order('sort', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`adminNextSort: ${error.message}`);
  return ((data?.sort as number | undefined) ?? 0) + 1;
}

/** `base`, `base-2`, `base-3`… hasta encontrar uno libre. */
export async function uniqueSlug(base: string): Promise<string> {
  let candidate = base || 'plantilla';
  let n = 2;
  while (await adminSlugExists(candidate)) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

/** Alta/edición completa (rol superadmin). Upsert por slug. */
export async function adminUpsertFull(
  row: PlantillaRowInput,
  actorId: string | null,
): Promise<void> {
  const { error } = await createAdminClient()
    .from('plantillas')
    .upsert({ ...row, updated_by: actorId }, { onConflict: 'slug' });
  if (error) throw new Error(`adminUpsertFull: ${error.message}`);
}

/** Alta desde el panel (cualquier rol). Insert puro: falla si el slug choca. */
export async function adminInsertRow(
  row: PlantillaRowInput,
  actorId: string | null,
): Promise<void> {
  const { error } = await createAdminClient()
    .from('plantillas')
    .insert({ ...row, created_by: actorId, updated_by: actorId });
  if (error) throw new Error(`adminInsertRow: ${error.message}`);
}

/** Actualización parcial de columnas planas (rol editor). */
export async function adminUpdateFields(
  slug: string,
  fields: Record<string, unknown>,
  actorId: string | null,
): Promise<void> {
  const { error } = await createAdminClient()
    .from('plantillas')
    .update({ ...fields, updated_by: actorId })
    .eq('slug', slug);
  if (error) throw new Error(`adminUpdateFields: ${error.message}`);
}

export async function adminSetActive(
  slug: string,
  active: boolean,
  actorId: string | null,
): Promise<void> {
  const { error } = await createAdminClient()
    .from('plantillas')
    .update({ active, updated_by: actorId })
    .eq('slug', slug);
  if (error) throw new Error(`adminSetActive: ${error.message}`);
}

/** Reordena en lote: `[{ slug, sort }]`. */
export async function adminReorder(
  items: { slug: string; sort: number }[],
  actorId: string | null,
): Promise<void> {
  const client = createAdminClient();
  for (const { slug, sort } of items) {
    const { error } = await client
      .from('plantillas')
      .update({ sort, updated_by: actorId })
      .eq('slug', slug);
    if (error) throw new Error(`adminReorder(${slug}): ${error.message}`);
  }
}

export async function adminDeleteRow(slug: string): Promise<void> {
  const { error } = await createAdminClient().from('plantillas').delete().eq('slug', slug);
  if (error) throw new Error(`adminDeleteRow: ${error.message}`);
}
