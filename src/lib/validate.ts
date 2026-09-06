/**
 * Validación de una plantilla antes de escribirla en Supabase.
 *
 * Dos caminos según el rol:
 *  - `validateFullPlantilla`  → superadmin. Exige ES y EN completos, SEO, etc.
 *    (es la validación de siempre; la usa el formulario completo).
 *  - `validateEditorCreate` / `pickEditorFields` → editor (la clienta). Solo
 *    campos comerciales; los bloques `es`/`en` se derivan del nombre.
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

/** Campos planos que puede tocar el rol `editor`. */
export interface EditorFields {
  name: string;
  price: string;
  href: string;
  icon: string | null;
  image_url: string | null;
  sort: number;
  active: boolean;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean) : [];

/** Nombre comercial → slug kebab-case. La unicidad la resuelve el endpoint. */
export function slugify(name: string): string {
  return str(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos y diacríticos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

function priceIssue(price: string): string | null {
  if (!price) return 'falta precio';
  if (!/^free$/i.test(price) && !/^\$?\d/.test(price)) return 'precio inválido (ej: "$9.99" o "Free")';
  return null;
}

function hrefIssue(href: string): string | null {
  if (!href) return 'falta enlace de compra';
  try {
    const u = new URL(href);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return 'el enlace debe ser http(s)';
  } catch {
    return 'el enlace no es una URL válida';
  }
  return null;
}

function clamp(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + '…';
}

/** Bloque `es`/`en` derivado del nombre para una plantilla creada por la clienta. */
export function deriveLang(name: string, price: string, lang: 'es' | 'en'): PlantillaLang {
  const free = /^free$/i.test(price);
  const priceBit =
    lang === 'es'
      ? free
        ? ' gratuita'
        : ` por ${price}`
      : free
        ? ' (free)'
        : ` for ${price}`;
  const intro =
    lang === 'es'
      ? `${name} es una plantilla de Notion${priceBit} para organizar tu trabajo con un sistema listo para usar.`
      : `${name} is a Notion template${priceBit} to organize your work with a ready-to-use system.`;
  const meta =
    lang === 'es'
      ? `${name} — plantilla de Notion en español${priceBit}. Descárgala y organiza tu trabajo con un sistema listo para usar.`
      : `${name} — Notion template${priceBit}. Download it and organize your work with a ready-to-use system.`;
  return {
    title: clamp(name, 60),
    metaDescription: clamp(meta, 160),
    h1: name,
    short: clamp(name, 60),
    intro,
    forWho: [],
    includes: [],
    faq: [],
  };
}

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

/** Validación completa (rol superadmin). */
export function validateFullPlantilla(input: PlantillaInput): PlantillaRowInput {
  const issues: string[] = [];

  const slug = str(input.slug);
  if (!slug) issues.push('falta slug');
  else if (!SLUG_RE.test(slug)) issues.push('slug inválido (usa minúsculas, números y guiones)');

  const name = str(input.name);
  if (!name) issues.push('falta nombre');

  const price = str(input.price);
  const pIssue = priceIssue(price);
  if (pIssue) issues.push(pIssue);

  const href = str(input.href);
  const hIssue = hrefIssue(href);
  if (hIssue) issues.push(hIssue);

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

/**
 * Validación de alta para el rol `editor`. Solo campos comerciales; el resto se
 * deriva. La plantilla entra OCULTA (`active: false`) hasta que el superadmin
 * complete el copy y la publique.
 */
export function validateEditorCreate(input: PlantillaInput): Omit<PlantillaRowInput, 'slug'> {
  const issues: string[] = [];

  const name = str(input.name);
  if (!name) issues.push('falta nombre');
  if (name && !slugify(name)) issues.push('el nombre no produce una URL válida (usa letras o números)');

  const price = str(input.price);
  const pIssue = priceIssue(price);
  if (pIssue) issues.push(pIssue);

  const href = str(input.href);
  const hIssue = hrefIssue(href);
  if (hIssue) issues.push(hIssue);

  const icon = input.icon ? str(input.icon) : null;
  const image_url = input.image_url ? str(input.image_url) : null;
  if (!image_url && !icon) issues.push('sube una imagen o indica un icono');

  const sort = Number.isFinite(input.sort) ? Math.trunc(input.sort as number) : 0;

  if (issues.length) throw new ValidationError(issues);

  return {
    name,
    price,
    href,
    img: null,
    icon,
    image_url,
    active: false,
    sort,
    es: deriveLang(name, price, 'es'),
    en: deriveLang(name, price, 'en'),
  };
}

/**
 * Extrae y valida SOLO los campos que el rol `editor` puede modificar de una
 * plantilla existente. Si el cuerpo trae `slug`, `es`, `en` o `img`, lanza:
 * el endpoint lo traduce a 403.
 */
export class ForbiddenFieldError extends Error {
  constructor(public field: string) {
    super(`El rol editor no puede modificar "${field}".`);
    this.name = 'ForbiddenFieldError';
  }
}

const EDITOR_FORBIDDEN = ['slug', 'es', 'en', 'img'] as const;

export function pickEditorFields(input: PlantillaInput): Partial<EditorFields> {
  for (const f of EDITOR_FORBIDDEN) {
    if (input[f] !== undefined) throw new ForbiddenFieldError(f);
  }

  const issues: string[] = [];
  const out: Partial<EditorFields> = {};

  if (input.name !== undefined) {
    const name = str(input.name);
    if (!name) issues.push('el nombre no puede quedar vacío');
    else out.name = name;
  }
  if (input.price !== undefined) {
    const price = str(input.price);
    const pIssue = priceIssue(price);
    if (pIssue) issues.push(pIssue);
    else out.price = price;
  }
  if (input.href !== undefined) {
    const href = str(input.href);
    const hIssue = hrefIssue(href);
    if (hIssue) issues.push(hIssue);
    else out.href = href;
  }
  if (input.icon !== undefined) out.icon = input.icon ? str(input.icon) : null;
  if (input.image_url !== undefined) out.image_url = input.image_url ? str(input.image_url) : null;
  if (input.sort !== undefined) {
    if (!Number.isFinite(input.sort)) issues.push('orden inválido');
    else out.sort = Math.trunc(input.sort as number);
  }
  if (input.active !== undefined) out.active = input.active === true;

  if (issues.length) throw new ValidationError(issues);
  if (Object.keys(out).length === 0) throw new ValidationError(['nada que actualizar']);
  return out;
}
