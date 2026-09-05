-- Alquimia Lab — esquema del catálogo para el panel admin.
-- Pegar y ejecutar en Supabase → SQL Editor (una sola vez).

-- ── Tabla ────────────────────────────────────────────────────────────────────
create table if not exists public.plantillas (
  slug        text        primary key,
  name        text        not null,
  price       text        not null,              -- "$9.99" | "Free"
  href        text        not null,              -- enlace externo de compra
  img         text,                              -- legado <Pic>: nombre en src/assets/img
  icon        text,                              -- nombre de icono Lucide
  image_url   text,                              -- subidas nuevas: URL pública de Storage
  active      boolean     not null default true,
  sort        integer     not null default 0,
  es          jsonb       not null,              -- {title, metaDescription, h1, short, intro, forWho[], includes[], faq[]}
  en          jsonb       not null,
  updated_at  timestamptz not null default now()
);

-- updated_at automático
create extension if not exists moddatetime schema extensions;

drop trigger if exists plantillas_set_updated_at on public.plantillas;
create trigger plantillas_set_updated_at
  before update on public.plantillas
  for each row execute function extensions.moddatetime(updated_at);

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Lectura pública SOLO de filas activas (clave publicable / anon).
-- No se crea ninguna policy de insert/update/delete: escribir solo es posible
-- con la clave service_role, que ignora RLS y solo se usa en el servidor.
alter table public.plantillas enable row level security;

drop policy if exists "public read active" on public.plantillas;
create policy "public read active"
  on public.plantillas for select
  to anon, authenticated
  using (active = true);

-- ── Storage ──────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('productos', 'productos', true)
  on conflict (id) do nothing;

drop policy if exists "public read productos" on storage.objects;
create policy "public read productos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'productos');
-- La subida se hace desde /api/admin/upload con service_role (ignora RLS).
