-- Create recurring_expenses table
create table public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  amount numeric(12,2) not null,
  description text,
  spender text not null,
  payment_method_id uuid not null references public.payment_methods(id) on delete restrict,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  start_date date not null,
  end_date date,
  is_active boolean not null default true,
  next_due_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recurring_expenses_user_next_due_idx
  on public.recurring_expenses (user_id, next_due_date)
  where is_active = true;

create trigger recurring_expenses_updated_at
  before update on public.recurring_expenses
  for each row execute function public.handle_updated_at();

-- Now add the FK from expenses to recurring_expenses
alter table public.expenses
  add constraint expenses_recurring_expense_id_fkey
  foreign key (recurring_expense_id) references public.recurring_expenses(id) on delete set null;
