-- Enum de roles de la aplicación
create type public.app_role as enum ('admin', 'teacher', 'student');

-- Tabla profiles: datos comunes a todos los usuarios (1:1 con auth.users)
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null default '',
  avatar_url   text,
  last_seen_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Tabla students: atributos específicos del rol estudiante (1:1 opcional con profiles)
create table public.students (
  profile_id  uuid primary key references public.profiles(id) on delete cascade,
  career      text,
  semester    smallint check (semester between 1 and 20),
  enrolled_at timestamptz not null default now()
);

-- Tabla user_roles: relación N:M usuario-rol
create table public.user_roles (
  user_id     uuid references auth.users(id) on delete cascade,
  role        public.app_role not null,
  assigned_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- Índices
create index on public.profiles (id);
create index on public.user_roles (user_id);

-- Trigger para actualizar updated_at en profiles
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();
