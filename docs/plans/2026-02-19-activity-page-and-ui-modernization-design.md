# Activity Page & UI Modernization — Design Document

**Date:** 2026-02-19
**Status:** Approved

## Overview

Two features for SpendWise v1.1:

1. **Activity Page** — Timeline-style audit log tracking expense and recurring expense CRUD operations with full diffs
2. **UI Modernization** — Teal/Emerald color scheme with modern styling enhancements (gradients, shadows, rounded corners)

## Feature 1: Activity Log

### Scope

Track all CRUD operations on `expenses` and `recurring_expenses` tables. Each log entry stores:
- What entity was affected (expense or recurring expense)
- What action occurred (created, updated, deleted)
- Full old and new data as JSONB (enables field-level diff display)
- 90-day rolling retention with automatic cleanup

### Database Schema

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('expense', 'recurring_expense')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activity_logs_user_created
  ON activity_logs(user_id, created_at DESC);
```

### Trigger Strategy

PostgreSQL AFTER triggers on `expenses` and `recurring_expenses`:

- **INSERT:** Log action='created', old_data=NULL, new_data=NEW row
- **UPDATE:** Log action='updated', old_data=OLD row, new_data=NEW row
- **DELETE:** Log action='deleted', old_data=OLD row, new_data=NULL

Trigger functions use `row_to_json()` to serialize rows to JSONB.

### RLS Policy

- Users can SELECT only their own activity logs (`user_id = auth.uid()`)
- No INSERT/UPDATE/DELETE from client — only triggers write to this table

### Retention

- Supabase pg_cron job or Edge Function runs daily to DELETE entries older than 90 days
- Fallback: client-side query filters to `created_at > now() - interval '90 days'`

### Frontend — Activity Page

**Route:** `/activity`

**Components:**
- `ActivityPage` — page component with filters and timeline
- `ActivityTimeline` — renders grouped-by-date list of activity entries
- `ActivityEntry` — individual entry with icon, summary, timestamp, expandable diff
- `ActivityFilters` — entity type and action type dropdowns

**Layout:**
- Page title "Activity" with filter bar
- Filters: entity type (All / Expenses / Recurring), action type (All / Created / Updated / Deleted)
- Timeline entries grouped by date, newest first
- Each entry shows:
  - Action icon with color coding (green=created, amber=updated, red=deleted)
  - Summary line: "Expense 'Description' was [created/updated/deleted]"
  - Relative timestamp ("2 hours ago") with full date on hover
  - For updates: expandable diff showing changed fields (old -> new values)
  - For creates: key details (amount, category, date, spender)
  - For deletes: summary of what was removed
- Pagination: 20 entries per page, "Load more" button

**Hook:** `useActivityLogs(filters)` — fetches from `activity_logs` with filters and pagination

### TypeScript Types

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

## Feature 2: UI Modernization

### Color Palette

Replace current grayscale (0-chroma OKLCH) with teal/emerald palette.

**Light Mode:**

| Token | Current | New |
|-------|---------|-----|
| `--primary` | `oklch(0.205 0 0)` (black) | `oklch(0.55 0.15 180)` (teal) |
| `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` (white, unchanged) |
| `--background` | `oklch(1 0 0)` (white) | `oklch(0.985 0.005 180)` (soft mint) |
| `--card` | `oklch(1 0 0)` | `oklch(1 0 0)` (white, unchanged) |
| `--secondary` | `oklch(0.97 0 0)` | `oklch(0.95 0.02 180)` (teal tint) |
| `--accent` | `oklch(0.97 0 0)` | `oklch(0.95 0.03 180)` (light teal) |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.5 0.01 250)` (cool gray) |
| `--border` | `oklch(0.922 0 0)` | `oklch(0.9 0.03 180)` (teal border) |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.6 0.12 180)` (teal ring) |
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(1 0 0)` (white) |
| `--sidebar-primary` | `oklch(0.205 0 0)` | `oklch(0.55 0.15 180)` (teal) |

**Dark Mode:**

| Token | Current | New |
|-------|---------|-----|
| `--primary` | `oklch(0.922 0 0)` | `oklch(0.75 0.15 175)` (lighter teal) |
| `--background` | `oklch(0.145 0 0)` | `oklch(0.16 0.015 250)` (deep slate) |
| `--card` | `oklch(0.205 0 0)` | `oklch(0.22 0.015 250)` (dark slate) |
| `--secondary` | `oklch(0.269 0 0)` | `oklch(0.28 0.02 250)` (slate) |
| `--accent` | `oklch(0.269 0 0)` | `oklch(0.28 0.02 250)` |
| `--border` | `oklch(1 0 0 / 10%)` | `oklch(0.75 0.1 175 / 10%)` (teal tint) |
| `--sidebar` | `oklch(0.205 0 0)` | `oklch(0.22 0.015 250)` |
| `--sidebar-primary` | `oklch(0.488 0.243 264.376)` | `oklch(0.75 0.15 175)` |

**Chart colors:** 5 coordinated hues spanning teal, emerald, sky, amber, and violet for both modes.

### Styling Enhancements

1. **Border radius:** Increase `--radius` from `0.625rem` to `0.75rem`
2. **Sidebar active state:** Gradient background (teal to emerald) with subtle glow shadow
3. **Sidebar logo:** Teal-colored text
4. **Primary buttons:** Subtle gradient and box shadow on hover
5. **Cards:** Soft teal-tinted box shadows
6. **Table headers:** Teal-colored text, uppercase with letter spacing
7. **Focus rings:** Teal instead of gray
8. **Category badges:** Semi-transparent colored backgrounds

### Files Changed

- `src/index.css` — All CSS custom property values
- `src/components/layout/Sidebar.tsx` — Active item gradient, logo color
- No structural layout changes to any existing page

## Out of Scope

- No changes to page layouts or component structure (beyond Sidebar styling)
- No new dependencies
- No changes to authentication or data flow
- No changes to existing expense/recurring CRUD logic
