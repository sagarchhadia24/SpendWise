-- Create payment_methods table
-- user_id is nullable: NULL means system default payment method
create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  value text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique value per user (custom methods), allow duplicates across users
-- System defaults (user_id IS NULL) have globally unique values
create unique index payment_methods_user_value_idx
  on public.payment_methods (user_id, value)
  where user_id is not null;

create unique index payment_methods_default_value_idx
  on public.payment_methods (value)
  where user_id is null;

create trigger payment_methods_updated_at
  before update on public.payment_methods
  for each row execute function public.handle_updated_at();
