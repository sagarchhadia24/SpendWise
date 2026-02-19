-- Create expenses table
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  amount numeric(12,2) not null,
  description text,
  date date not null,
  spender text not null,
  payment_method_id uuid not null references public.payment_methods(id) on delete restrict,
  recurring_expense_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for common query patterns
create index expenses_user_date_idx on public.expenses (user_id, date desc);
create index expenses_category_idx on public.expenses (category_id);
create index expenses_payment_method_idx on public.expenses (payment_method_id);

create trigger expenses_updated_at
  before update on public.expenses
  for each row execute function public.handle_updated_at();
