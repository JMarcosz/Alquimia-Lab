-- Alquimia Lab — esquema del catálogo para el panel admin.
-- Pegar y ejecutar en Supabase → SQL Editor (una sola vez).
--
-- Estado actual: aplicado vía migraciones del MCP de Supabase. Este archivo es
-- la foto consolidada. Migraciones:
--   20260905232024  create_plantillas_catalog
--   20260906013340  auth_roles_and_audit_log
--   20260906014626  audit_and_authorship_fks_on_delete_set_null
--   20260906014644  lock_down_handle_new_user_execute

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

-- ── Autoría en plantillas ───────────────────────────────────────────────────
alter table public.plantillas
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_by uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz not null default now();

-- El staff autenticado ve también las filas ocultas (lista del panel).
drop policy if exists "staff read all" on public.plantillas;
create policy "staff read all" on public.plantillas
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid()));

-- ── profiles: usuarios del panel y su rol ───────────────────────────────────
-- La sesión la gestiona Supabase Auth (email + contraseña). El rol vive también
-- en auth.users.app_metadata.role (viaja en el JWT); esta tabla es para listar
-- y para la UI. Alta automática vía trigger al crear el usuario.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text not null default 'editor' check (role in ('superadmin','editor')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "self read" on public.profiles;
create policy "self read" on public.profiles
  for select to authenticated using (id = auth.uid());
-- Escritura solo con service_role (endpoints / auth.admin).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_app_meta_data ->> 'role', 'editor')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── audit_log: registro de cambios del panel ───────────────────────────────
create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor_id    uuid references auth.users(id) on delete set null,
  actor_email text,
  actor_role  text,
  action      text not null check (action in
                ('create','update','delete','show','hide','reorder','login','user_create','user_disable')),
  entity      text not null default 'plantilla',
  entity_id   text,
  summary     text,
  diff        jsonb
);

create index if not exists audit_log_at_idx on public.audit_log (at desc);

alter table public.audit_log enable row level security;

drop policy if exists "superadmin read" on public.audit_log;
create policy "superadmin read" on public.audit_log
  for select to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = auth.uid() and p.role = 'superadmin'));
-- Escritura solo con service_role (endpoints).

-- ── Primer superadmin ──────────────────────────────────────────────────────
-- Se siembra una vez con SQL (auth.users + auth.identities, contraseña con
-- extensions.crypt('...', extensions.gen_salt('bf')) y
-- raw_app_meta_data ->> 'role' = 'superadmin'). Las cuentas siguientes se crean
-- desde /admin/usuarios (auth.admin.createUser con app_metadata.role).
