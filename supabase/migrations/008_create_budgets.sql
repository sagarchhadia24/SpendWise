-- Create budgets table
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  amount numeric(12,2) not null,
  month date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique index: one budget per user per category per month
create unique index budgets_user_category_month_idx on public.budgets (user_id, category_id, month);

-- Index for fetching budgets by user and month
create index budgets_user_month_idx on public.budgets (user_id, month);

create trigger budgets_updated_at
  before update on public.budgets
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.budgets enable row level security;

create policy "Users can view their own budgets"
  on public.budgets for select
  using (user_id = auth.uid());

create policy "Users can insert their own budgets"
  on public.budgets for insert
  with check (user_id = auth.uid());

create policy "Users can update their own budgets"
  on public.budgets for update
  using (user_id = auth.uid());

create policy "Users can delete their own budgets"
  on public.budgets for delete
  using (user_id = auth.uid());
