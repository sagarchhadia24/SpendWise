-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.payment_methods enable row level security;
alter table public.expenses enable row level security;
alter table public.recurring_expenses enable row level security;

-- ============================================================
-- Profiles policies
-- ============================================================
create policy "Users can view their own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Users can delete their own profile"
  on public.profiles for delete
  using (id = auth.uid());

-- ============================================================
-- Categories policies
-- ============================================================
create policy "Users can view default and own categories"
  on public.categories for select
  using (user_id = auth.uid() or is_default = true);

create policy "Users can insert their own categories"
  on public.categories for insert
  with check (user_id = auth.uid());

create policy "Users can update their own categories"
  on public.categories for update
  using (user_id = auth.uid());

create policy "Users can delete their own categories"
  on public.categories for delete
  using (user_id = auth.uid());

-- ============================================================
-- Payment Methods policies
-- ============================================================
create policy "Users can view default and own payment methods"
  on public.payment_methods for select
  using (user_id = auth.uid() or is_default = true);

create policy "Users can insert their own payment methods"
  on public.payment_methods for insert
  with check (user_id = auth.uid());

create policy "Users can update their own payment methods"
  on public.payment_methods for update
  using (user_id = auth.uid());

create policy "Users can delete their own payment methods"
  on public.payment_methods for delete
  using (user_id = auth.uid());

-- ============================================================
-- Expenses policies
-- ============================================================
create policy "Users can view their own expenses"
  on public.expenses for select
  using (user_id = auth.uid());

create policy "Users can insert their own expenses"
  on public.expenses for insert
  with check (user_id = auth.uid());

create policy "Users can update their own expenses"
  on public.expenses for update
  using (user_id = auth.uid());

create policy "Users can delete their own expenses"
  on public.expenses for delete
  using (user_id = auth.uid());

-- ============================================================
-- Recurring Expenses policies
-- ============================================================
create policy "Users can view their own recurring expenses"
  on public.recurring_expenses for select
  using (user_id = auth.uid());

create policy "Users can insert their own recurring expenses"
  on public.recurring_expenses for insert
  with check (user_id = auth.uid());

create policy "Users can update their own recurring expenses"
  on public.recurring_expenses for update
  using (user_id = auth.uid());

create policy "Users can delete their own recurring expenses"
  on public.recurring_expenses for delete
  using (user_id = auth.uid());

-- ============================================================
-- Auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
