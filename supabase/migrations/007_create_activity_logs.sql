-- ============================================================
-- Activity Logs table
-- ============================================================
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('expense', 'recurring_expense')),
  entity_id uuid not null,
  action text not null check (action in ('created', 'updated', 'deleted')),
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz default now()
);

create index idx_activity_logs_user_created
  on public.activity_logs(user_id, created_at desc);

-- ============================================================
-- Trigger function for expenses
-- ============================================================
create or replace function public.log_expense_activity()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.activity_logs (user_id, entity_type, entity_id, action, new_data)
    values (new.user_id, 'expense', new.id, 'created', row_to_json(new)::jsonb);
    return new;
  elsif (tg_op = 'UPDATE') then
    insert into public.activity_logs (user_id, entity_type, entity_id, action, old_data, new_data)
    values (new.user_id, 'expense', new.id, 'updated', row_to_json(old)::jsonb, row_to_json(new)::jsonb);
    return new;
  elsif (tg_op = 'DELETE') then
    insert into public.activity_logs (user_id, entity_type, entity_id, action, old_data)
    values (old.user_id, 'expense', old.id, 'deleted', row_to_json(old)::jsonb);
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- ============================================================
-- Trigger function for recurring expenses
-- ============================================================
create or replace function public.log_recurring_expense_activity()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.activity_logs (user_id, entity_type, entity_id, action, new_data)
    values (new.user_id, 'recurring_expense', new.id, 'created', row_to_json(new)::jsonb);
    return new;
  elsif (tg_op = 'UPDATE') then
    insert into public.activity_logs (user_id, entity_type, entity_id, action, old_data, new_data)
    values (new.user_id, 'recurring_expense', new.id, 'updated', row_to_json(old)::jsonb, row_to_json(new)::jsonb);
    return new;
  elsif (tg_op = 'DELETE') then
    insert into public.activity_logs (user_id, entity_type, entity_id, action, old_data)
    values (old.user_id, 'recurring_expense', old.id, 'deleted', row_to_json(old)::jsonb);
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- ============================================================
-- Attach triggers
-- ============================================================
create trigger expense_activity_trigger
  after insert or update or delete on public.expenses
  for each row execute function public.log_expense_activity();

create trigger recurring_expense_activity_trigger
  after insert or update or delete on public.recurring_expenses
  for each row execute function public.log_recurring_expense_activity();

-- ============================================================
-- RLS: users can only read their own activity logs
-- Triggers bypass RLS via security definer, so no insert policy needed
-- ============================================================
alter table public.activity_logs enable row level security;

create policy "Users can view their own activity logs"
  on public.activity_logs for select
  using (user_id = auth.uid());

-- ============================================================
-- Cleanup: delete entries older than 90 days
-- Run this via Supabase cron (pg_cron) or call manually
-- ============================================================
create or replace function public.cleanup_old_activity_logs()
returns void as $$
begin
  delete from public.activity_logs
  where created_at < now() - interval '90 days';
end;
$$ language plpgsql security definer;
