-- hedefe.net — kendi Supabase projenizde SQL Editor'de çalıştırın
-- Sıra: enumlar → tablolar → GRANT → RLS → fonksiyonlar → trigger

-- 1) Enum tipleri
create type public.app_role as enum ('student', 'coach');
create type public.yks_track as enum ('sayisal', 'sozel', 'esit');

-- 2) Tablolar
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  target text not null default '',
  track public.yks_track not null default 'sayisal',
  title text not null default '',
  coach_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

-- 3) Data API izinleri
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

-- 4) RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "Coaches can read their own students"
  on public.profiles for select to authenticated
  using (coach_id = auth.uid());

create policy "Signed in users can read roles"
  on public.user_roles for select to authenticated
  using (true);

-- 5) Rol kontrol fonksiyonu (RLS içinde recursion olmadan)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Koç profilleri herkes tarafından okunabilsin (öğrenci koç seçimi için)
create policy "Everyone signed in can read coach profiles"
  on public.profiles for select to authenticated
  using (public.has_role(id, 'coach'));

-- 6) Yeni kullanıcı kaydında profil + rol oluşturan trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  meta_role public.app_role;
  meta_track public.yks_track;
begin
  meta_role := coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'student')::public.app_role;
  meta_track := coalesce(nullif(new.raw_user_meta_data ->> 'track', ''), 'sayisal')::public.yks_track;

  insert into public.profiles (id, full_name, email, target, track, title)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'target', ''),
    meta_track,
    coalesce(new.raw_user_meta_data ->> 'title', '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, meta_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
