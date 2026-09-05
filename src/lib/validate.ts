/**
 * Validación de una plantilla antes de escribirla en Supabase. Se usa en
 * `/api/admin/save`. Devuelve la fila normalizada o lanza `ValidationError`
 * con la lista de problemas.
 */
import type { PlantillaLang } from '../data/plantillas';

export class ValidationError extends Error {
  issues: string[];
  constructor(issues: string[]) {
    super(issues.join(' · '));
    this.name = 'ValidationError';
    this.issues = issues;
  }
}

export interface PlantillaInput {
  slug?: string;
  name?: string;
  price?: string;
  href?: string;
  img?: string | null;
  icon?: string | null;
  image_url?: string | null;
  active?: boolean;
  sort?: number;
  es?: Partial<PlantillaLang>;
  en?: Partial<PlantillaLang>;
}

export interface PlantillaRowInput {
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
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean) : [];

function validateLang(lang: unknown, tag: string, issues: string[]): PlantillaLang {
  const l = (lang ?? {}) as Record<string, unknown>;
  const out: PlantillaLang = {
    title: str(l.title),
    metaDescription: str(l.metaDescription),
    h1: str(l.h1),
    short: str(l.short),
    intro: str(l.intro),
    forWho: strList(l.forWho),
    includes: strList(l.includes),
    faq: Array.isArray(l.faq)
      ? (l.faq as unknown[])
          .map((f) => {
            const o = (f ?? {}) as Record<string, unknown>;
            return { q: str(o.q), a: str(o.a) };
          })
          .filter((f) => f.q && f.a)
      : [],
  };

  if (!out.title) issues.push(`[${tag}] falta título`);
  else if (out.title.length > 60) issues.push(`[${tag}] título >60 (${out.title.length})`);
  if (!out.metaDescription) issues.push(`[${tag}] falta meta description`);
  else if (out.metaDescription.length < 70 || out.metaDescription.length > 160)
    issues.push(`[${tag}] meta description fuera de 70-160 (${out.metaDescription.length})`);
  if (!out.h1) issues.push(`[${tag}] falta h1`);
  if (!out.short) issues.push(`[${tag}] falta nombre corto`);
  if (!out.intro) issues.push(`[${tag}] falta intro`);
  if (out.includes.length === 0) issues.push(`[${tag}] "qué incluye" vacío`);

  return out;
}

export function validatePlantilla(input: PlantillaInput): PlantillaRowInput {
  const issues: string[] = [];

  const slug = str(input.slug);
  if (!slug) issues.push('falta slug');
  else if (!SLUG_RE.test(slug)) issues.push('slug inválido (usa minúsculas, números y guiones)');

  const name = str(input.name);
  if (!name) issues.push('falta nombre');

  const price = str(input.price);
  if (!price) issues.push('falta precio');
  else if (!/^free$/i.test(price) && !/^\$?\d/.test(price))
    issues.push('precio inválido (ej: "$9.99" o "Free")');

  const href = str(input.href);
  if (!href) issues.push('falta enlace de compra');
  else {
    try {
      const u = new URL(href);
      if (u.protocol !== 'https:' && u.protocol !== 'http:') issues.push('el enlace debe ser http(s)');
    } catch {
      issues.push('el enlace no es una URL válida');
    }
  }

  const es = validateLang(input.es, 'es', issues);
  const en = validateLang(input.en, 'en', issues);

  const icon = input.icon ? str(input.icon) : null;
  const img = input.img ? str(input.img) : null;
  const image_url = input.image_url ? str(input.image_url) : null;
  if (!img && !image_url && !icon)
    issues.push('hace falta una imagen subida, una portada legada o un icono');

  const sort = Number.isFinite(input.sort) ? Math.trunc(input.sort as number) : 0;

  if (issues.length) throw new ValidationError(issues);

  return {
    slug,
    name,
    price,
    href,
    img,
    icon,
    image_url,
    active: input.active !== false,
    sort,
    es,
    en,
  };
}
