# Activity Page & UI Modernization — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an activity audit log page tracking expense/recurring expense CRUD with full diffs, and modernize the UI with a teal/emerald color scheme.

**Architecture:** Database triggers on `expenses` and `recurring_expenses` automatically write to `activity_logs` with old/new JSONB data. Frontend fetches and displays these as a timeline. UI modernization is a CSS variable swap in `index.css` plus sidebar gradient styling.

**Tech Stack:** Supabase (PostgreSQL triggers, RLS), React 18, TypeScript, Tailwind CSS v4 (OKLCH), shadcn/ui, Lucide icons, date-fns.

**Design doc:** `docs/plans/2026-02-19-activity-page-and-ui-modernization-design.md`

---

## Task 1: UI Modernization — Color Palette

Update CSS custom properties from grayscale to teal/emerald in both light and dark modes.

**Files:**
- Modify: `src/index.css:48-115`

**Step 1: Replace light mode `:root` variables**

Replace the `:root` block (lines 48-81) with the new teal/emerald palette:

```css
:root {
    --radius: 0.75rem;
    --background: oklch(0.985 0.005 180);
    --foreground: oklch(0.145 0.02 250);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.145 0.02 250);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.145 0.02 250);
    --primary: oklch(0.55 0.15 180);
    --primary-foreground: oklch(0.985 0 0);
    --secondary: oklch(0.95 0.02 180);
    --secondary-foreground: oklch(0.25 0.02 250);
    --muted: oklch(0.95 0.02 180);
    --muted-foreground: oklch(0.5 0.01 250);
    --accent: oklch(0.95 0.03 180);
    --accent-foreground: oklch(0.25 0.02 250);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.9 0.03 180);
    --input: oklch(0.9 0.03 180);
    --ring: oklch(0.6 0.12 180);
    --chart-1: oklch(0.6 0.15 180);
    --chart-2: oklch(0.65 0.17 155);
    --chart-3: oklch(0.55 0.12 220);
    --chart-4: oklch(0.75 0.15 85);
    --chart-5: oklch(0.6 0.18 300);
    --sidebar: oklch(1 0 0);
    --sidebar-foreground: oklch(0.145 0.02 250);
    --sidebar-primary: oklch(0.55 0.15 180);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.95 0.03 180);
    --sidebar-accent-foreground: oklch(0.25 0.02 250);
    --sidebar-border: oklch(0.9 0.03 180);
    --sidebar-ring: oklch(0.6 0.12 180);
}
```

**Step 2: Replace dark mode `.dark` variables**

Replace the `.dark` block (lines 83-115) with:

```css
.dark {
    --background: oklch(0.16 0.015 250);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.22 0.015 250);
    --card-foreground: oklch(0.985 0 0);
    --popover: oklch(0.22 0.015 250);
    --popover-foreground: oklch(0.985 0 0);
    --primary: oklch(0.75 0.15 175);
    --primary-foreground: oklch(0.16 0.015 250);
    --secondary: oklch(0.28 0.02 250);
    --secondary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.28 0.02 250);
    --muted-foreground: oklch(0.65 0.02 250);
    --accent: oklch(0.28 0.02 250);
    --accent-foreground: oklch(0.985 0 0);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(0.75 0.1 175 / 10%);
    --input: oklch(0.75 0.1 175 / 15%);
    --ring: oklch(0.55 0.1 180);
    --chart-1: oklch(0.7 0.15 175);
    --chart-2: oklch(0.65 0.17 155);
    --chart-3: oklch(0.75 0.15 85);
    --chart-4: oklch(0.6 0.2 300);
    --chart-5: oklch(0.65 0.2 30);
    --sidebar: oklch(0.22 0.015 250);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.75 0.15 175);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.28 0.02 250);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(0.75 0.1 175 / 10%);
    --sidebar-ring: oklch(0.55 0.1 180);
}
```

**Step 3: Verify in browser**

Run: `npm run dev`
- Open the app in both light and dark mode
- Verify all pages render with the new teal/emerald colors
- Check cards, buttons, inputs, borders, and sidebar all use new palette

**Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat: update color palette to teal/emerald theme"
```

---

## Task 2: UI Modernization — Sidebar Styling

Add gradient active state and teal logo color to sidebar.

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

**Step 1: Update logo text to teal**

Change the logo `<h1>` (line 39) from:
```tsx
<h1 className="text-xl font-bold">SpendWise</h1>
```
to:
```tsx
<h1 className="text-xl font-bold text-primary">SpendWise</h1>
```

**Step 2: Update active nav item to gradient with glow**

Change the NavLink `className` function (lines 47-53) from:
```tsx
className={({ isActive }) =>
  cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
  )
}
```
to:
```tsx
className={({ isActive }) =>
  cn(
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
    isActive
      ? 'bg-gradient-to-r from-[oklch(0.55_0.15_180)] to-[oklch(0.6_0.17_155)] text-white shadow-[0_4px_12px_oklch(0.55_0.15_180_/_0.3)]'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
  )
}
```

**Step 3: Verify in browser**

- Check sidebar logo is teal colored
- Check active nav item shows teal-to-emerald gradient with subtle glow
- Check inactive items still show hover effect
- Test in both light and dark mode

**Step 4: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat: add gradient active state and teal logo to sidebar"
```

---

## Task 3: Activity Log — Database Migration

Create the `activity_logs` table, trigger functions, triggers, and RLS policies.

**Files:**
- Create: `supabase/migrations/007_create_activity_logs.sql`

**Step 1: Write the migration file**

Create `supabase/migrations/007_create_activity_logs.sql` with this content:

```sql
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
```

**Step 2: Run the migration against Supabase**

Go to the Supabase dashboard (SQL Editor) for project `twbdracytavkpaftekns` and run the migration SQL.

Alternatively, if Supabase CLI is configured:
```bash
supabase db push
```

**Step 3: Verify triggers work**

In the Supabase SQL Editor, test by inserting/updating/deleting a test expense and checking `activity_logs`:
```sql
select * from public.activity_logs order by created_at desc limit 5;
```

**Step 4: Commit**

```bash
git add supabase/migrations/007_create_activity_logs.sql
git commit -m "feat: add activity_logs table with triggers and RLS"
```

---

## Task 4: Activity Log — TypeScript Types

Add the ActivityLog type to the project's type definitions.

**Files:**
- Modify: `src/types/database.ts`

**Step 1: Add types at the end of the file**

Append to `src/types/database.ts` (after line 73, before the final blank line):

```typescript
export type ActivityAction = 'created' | 'updated' | 'deleted'
export type ActivityEntityType = 'expense' | 'recurring_expense'

export interface ActivityLog {
  id: string
  user_id: string
  entity_type: ActivityEntityType
  entity_id: string
  action: ActivityAction
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
}
```

**Step 2: Commit**

```bash
git add src/types/database.ts
git commit -m "feat: add ActivityLog TypeScript types"
```

---

## Task 5: Activity Log — useActivityLogs Hook

Create the data-fetching hook with filtering and pagination.

**Files:**
- Create: `src/hooks/useActivityLogs.ts`

**Step 1: Create the hook**

Create `src/hooks/useActivityLogs.ts`:

```typescript
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { ActivityLog, ActivityAction, ActivityEntityType } from '@/types/database'

export interface ActivityFilters {
  entityType?: ActivityEntityType
  action?: ActivityAction
}

const PAGE_SIZE = 20

export function useActivityLogs(filters?: ActivityFilters) {
  const { user } = useAuth()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const fetchLogs = useCallback(async (pageNum: number, append: boolean) => {
    if (!user) return
    if (pageNum === 0) setLoading(true)
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType)
      }
      if (filters?.action) {
        query = query.eq('action', filters.action)
      }

      const { data, error } = await query
      if (error) throw error

      const results = data as ActivityLog[]
      setHasMore(results.length === PAGE_SIZE)

      if (append) {
        setLogs((prev) => [...prev, ...results])
      } else {
        setLogs(results)
      }
    } catch (error) {
      toast.error('Failed to load activity logs')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [user, filters?.entityType, filters?.action])

  useEffect(() => {
    setPage(0)
    fetchLogs(0, false)
  }, [fetchLogs])

  function loadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchLogs(nextPage, true)
  }

  return {
    logs,
    loading,
    hasMore,
    loadMore,
  }
}
```

**Step 2: Commit**

```bash
git add src/hooks/useActivityLogs.ts
git commit -m "feat: add useActivityLogs hook with filters and pagination"
```

---

## Task 6: Activity Log — Activity Page Components

Create the Activity page with timeline, filters, and diff display.

**Files:**
- Create: `src/pages/Activity.tsx`
- Create: `src/components/activity/ActivityTimeline.tsx`
- Create: `src/components/activity/ActivityEntry.tsx`
- Create: `src/components/activity/ActivityFilters.tsx`

**Step 1: Create ActivityFilters component**

Create `src/components/activity/ActivityFilters.tsx`:

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ActivityAction, ActivityEntityType } from '@/types/database'

interface ActivityFiltersProps {
  entityType?: ActivityEntityType
  action?: ActivityAction
  onEntityTypeChange: (value: ActivityEntityType | undefined) => void
  onActionChange: (value: ActivityAction | undefined) => void
}

export function ActivityFilters({
  entityType,
  action,
  onEntityTypeChange,
  onActionChange,
}: ActivityFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={entityType ?? 'all'}
        onValueChange={(v) => onEntityTypeChange(v === 'all' ? undefined : v as ActivityEntityType)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="expense">Expenses</SelectItem>
          <SelectItem value="recurring_expense">Recurring</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={action ?? 'all'}
        onValueChange={(v) => onActionChange(v === 'all' ? undefined : v as ActivityAction)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All actions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All actions</SelectItem>
          <SelectItem value="created">Created</SelectItem>
          <SelectItem value="updated">Updated</SelectItem>
          <SelectItem value="deleted">Deleted</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
```

**Step 2: Create ActivityEntry component**

Create `src/components/activity/ActivityEntry.tsx`:

```tsx
import { useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActivityLog } from '@/types/database'

const actionConfig = {
  created: { icon: Plus, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'created' },
  updated: { icon: Pencil, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'updated' },
  deleted: { icon: Trash2, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', label: 'deleted' },
}

const DISPLAY_FIELDS: Record<string, string> = {
  amount: 'Amount',
  description: 'Description',
  date: 'Date',
  spender: 'Spender',
  category_id: 'Category',
  payment_method_id: 'Payment Method',
  frequency: 'Frequency',
  is_active: 'Active',
  start_date: 'Start Date',
  end_date: 'End Date',
  next_due_date: 'Next Due Date',
}

const IGNORED_FIELDS = ['id', 'user_id', 'created_at', 'updated_at', 'recurring_expense_id']

function getEntityLabel(log: ActivityLog): string {
  const data = log.new_data || log.old_data
  const desc = data?.description as string
  const amount = data?.amount
  const type = log.entity_type === 'expense' ? 'Expense' : 'Recurring expense'

  if (desc) return `${type} "${desc}"`
  if (amount != null) return `${type} ($${Number(amount).toFixed(2)})`
  return type
}

function getChangedFields(oldData: Record<string, unknown>, newData: Record<string, unknown>) {
  const changes: { field: string; label: string; oldVal: unknown; newVal: unknown }[] = []
  for (const key of Object.keys(newData)) {
    if (IGNORED_FIELDS.includes(key)) continue
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes.push({
        field: key,
        label: DISPLAY_FIELDS[key] || key,
        oldVal: oldData[key],
        newVal: newData[key],
      })
    }
  }
  return changes
}

function formatValue(val: unknown): string {
  if (val == null) return '—'
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (typeof val === 'number') return `$${val.toFixed(2)}`
  return String(val)
}

interface ActivityEntryProps {
  log: ActivityLog
}

export function ActivityEntry({ log }: ActivityEntryProps) {
  const [expanded, setExpanded] = useState(false)
  const config = actionConfig[log.action]
  const Icon = config.icon
  const hasDetails = log.action === 'updated' && log.old_data && log.new_data
  const changes = hasDetails ? getChangedFields(log.old_data!, log.new_data!) : []

  return (
    <div className="flex gap-3 py-3">
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', config.bg)}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm">
            <span className="font-medium">{getEntityLabel(log)}</span>
            {' '}was{' '}
            <span className={cn('font-medium', config.color)}>{config.label}</span>
          </p>
          <time
            className="shrink-0 text-xs text-muted-foreground"
            title={format(new Date(log.created_at), 'PPpp')}
          >
            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
          </time>
        </div>

        {log.action === 'created' && log.new_data && (
          <div className="mt-1.5 text-xs text-muted-foreground">
            {log.new_data.amount != null && <span>Amount: ${Number(log.new_data.amount).toFixed(2)}</span>}
            {log.new_data.date && <span> · Date: {String(log.new_data.date)}</span>}
            {log.new_data.spender && <span> · By: {String(log.new_data.spender)}</span>}
          </div>
        )}

        {log.action === 'deleted' && log.old_data && (
          <div className="mt-1.5 text-xs text-muted-foreground">
            {log.old_data.amount != null && <span>Amount: ${Number(log.old_data.amount).toFixed(2)}</span>}
            {log.old_data.description && <span> · {String(log.old_data.description)}</span>}
          </div>
        )}

        {hasDetails && changes.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1.5 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {changes.length} field{changes.length !== 1 ? 's' : ''} changed
          </button>
        )}

        {expanded && changes.length > 0 && (
          <div className="mt-2 rounded-lg border bg-muted/50 p-3 text-xs space-y-1.5">
            {changes.map((c) => (
              <div key={c.field} className="flex flex-wrap gap-1">
                <span className="font-medium">{c.label}:</span>
                <span className="text-red-600 line-through dark:text-red-400">{formatValue(c.oldVal)}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-emerald-600 dark:text-emerald-400">{formatValue(c.newVal)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 3: Create ActivityTimeline component**

Create `src/components/activity/ActivityTimeline.tsx`:

```tsx
import { format, isToday, isYesterday } from 'date-fns'
import { ActivityEntry } from '@/components/activity/ActivityEntry'
import type { ActivityLog } from '@/types/database'

function formatDateGroup(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEEE, MMMM d, yyyy')
}

function groupByDate(logs: ActivityLog[]): Map<string, ActivityLog[]> {
  const groups = new Map<string, ActivityLog[]>()
  for (const log of logs) {
    const dateKey = log.created_at.split('T')[0]
    const existing = groups.get(dateKey) || []
    existing.push(log)
    groups.set(dateKey, existing)
  }
  return groups
}

interface ActivityTimelineProps {
  logs: ActivityLog[]
}

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No activity found
      </div>
    )
  }

  const groups = groupByDate(logs)

  return (
    <div className="space-y-6">
      {Array.from(groups.entries()).map(([dateKey, dateLogs]) => (
        <div key={dateKey}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {formatDateGroup(dateKey)}
          </h3>
          <div className="divide-y divide-border rounded-lg border bg-card p-2">
            {dateLogs.map((log) => (
              <ActivityEntry key={log.id} log={log} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

**Step 4: Create the Activity page**

Create `src/pages/Activity.tsx`:

```tsx
import { useState } from 'react'
import { useActivityLogs, type ActivityFilters as Filters } from '@/hooks/useActivityLogs'
import { ActivityTimeline } from '@/components/activity/ActivityTimeline'
import { ActivityFilters } from '@/components/activity/ActivityFilters'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function Activity() {
  const [filters, setFilters] = useState<Filters>({})
  const { logs, loading, hasMore, loadMore } = useActivityLogs(filters)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Activity</h2>
        <ActivityFilters
          entityType={filters.entityType}
          action={filters.action}
          onEntityTypeChange={(entityType) => setFilters((f) => ({ ...f, entityType }))}
          onActionChange={(action) => setFilters((f) => ({ ...f, action }))}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <ActivityTimeline logs={logs} />
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={loadMore}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add src/pages/Activity.tsx src/components/activity/
git commit -m "feat: add Activity page with timeline, filters, and diff display"
```

---

## Task 7: Activity Log — Route and Navigation

Wire up the Activity page route and add it to the sidebar.

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

**Step 1: Add route to App.tsx**

In `src/App.tsx`:
- Add import at line 17 (after the Reports import):
  ```tsx
  import Activity from '@/pages/Activity'
  ```
- Add route after the Reports route (after line 36):
  ```tsx
  <Route path="/activity" element={<Activity />} />
  ```

**Step 2: Add Activity to sidebar navigation**

In `src/components/layout/Sidebar.tsx`:
- Add `Activity` to the lucide-react import (line 2-9). Add `Activity as ActivityIcon` to the imports:
  ```tsx
  import {
    LayoutDashboard,
    Receipt,
    Tags,
    Repeat,
    BarChart3,
    Activity as ActivityIcon,
    Settings,
    LogOut,
  } from 'lucide-react'
  ```
- Add the Activity nav item to the `navItems` array, between Reports and Settings:
  ```tsx
  { to: '/activity', label: 'Activity', icon: ActivityIcon },
  ```

**Step 3: Verify in browser**

- Check Activity appears in sidebar between Reports and Settings
- Click Activity link — page should load with filters and empty state (or timeline if triggers are running)
- Verify active state shows the teal gradient from Task 2
- Test in both light and dark mode

**Step 4: Commit**

```bash
git add src/App.tsx src/components/layout/Sidebar.tsx
git commit -m "feat: add Activity route and sidebar navigation item"
```

---

## Task 8: Final Verification

End-to-end testing of both features together.

**Step 1: Test Activity logging end-to-end**

1. Add a new expense via the Expenses page
2. Go to Activity page — verify "created" entry appears with green icon and details
3. Edit the expense (inline edit) — verify "updated" entry appears with amber icon
4. Expand the diff — verify old → new values display correctly
5. Delete the expense — verify "deleted" entry appears with red icon
6. Repeat steps 1-5 for a recurring expense

**Step 2: Test Activity filters**

1. Filter by "Expenses" entity type — only expense entries shown
2. Filter by "Updated" action — only update entries shown
3. Clear filters — all entries return

**Step 3: Test UI theme end-to-end**

1. Verify Dashboard: stat cards, charts, recent expenses all use teal theme
2. Verify Expenses page: table headers, buttons, badges
3. Verify Categories page: cards, color pickers
4. Verify Reports page: tabs, chart colors
5. Verify Settings page: form inputs, buttons
6. Toggle dark mode — verify all pages look correct
7. Check mobile responsive view — sidebar drawer, all pages

**Step 4: Clean up mockup files**

```bash
rm -rf .playwright-mcp/mockup-*.html
```

**Step 5: Final commit**

If any small fixes were needed during verification, commit them:
```bash
git add -A
git commit -m "fix: polish activity page and theme adjustments"
```
