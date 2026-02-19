-- Create profiles table (extends Supabase Auth users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  family_members text[] not null default '{}',
  currency text not null default 'USD',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at on row change
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
