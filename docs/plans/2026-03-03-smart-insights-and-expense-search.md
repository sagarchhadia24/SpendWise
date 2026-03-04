# Smart Insights & Expense Search Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add auto-generated spending insights on the Dashboard and enhance the Expenses page with text search and amount range filters.

**Architecture:** Client-side insight generation from current + previous month expense data, computed in `useDashboard`. Expense search via Supabase `ilike` on description field plus amount range filters added to existing `useExpenses` hook and filter panel.

**Tech Stack:** React, TypeScript, Supabase (PostgREST queries), shadcn/ui, date-fns, lucide-react

---

## Feature 1: Smart Insights

### Task 1: Create the insight generator utility

**Files:**
- Create: `src/utils/insights.ts`

**Context:** This is a pure utility function with no React dependencies. It takes spending data and budgets and returns an array of insight objects. Each insight has a `type`, `icon` name, `color` (green/yellow/red), `title`, and `detail` string.

**Step 1: Create `src/utils/insights.ts`**

```typescript
import { format, getDaysInMonth, getDate } from 'date-fns'
import type { ExpenseWithRelations, BudgetProgress } from '@/types/database'

export type InsightColor = 'green' | 'yellow' | 'red'
export type InsightIcon = 'TrendingUp' | 'TrendingDown' | 'AlertTriangle' | 'Users' | 'Target'

export interface Insight {
  id: string
  icon: InsightIcon
  color: InsightColor
  title: string
  detail: string
}

export function generateInsights(
  currentExpenses: ExpenseWithRelations[],
  previousExpenses: ExpenseWithRelations[],
  budgetProgress: BudgetProgress[],
  currency: string,
  formatCurrencyFn: (amount: number, currency: string) => string
): Insight[] {
  const insights: Insight[] = []

  // 1. Month-over-month category comparison
  insights.push(...getCategoryComparisons(currentExpenses, previousExpenses, currency, formatCurrencyFn))

  // 2. Budget pace projection
  insights.push(...getBudgetPaceInsights(budgetProgress, currency, formatCurrencyFn))

  // 3. Unusual spending detection
  insights.push(...getUnusualSpending(currentExpenses, previousExpenses, currency, formatCurrencyFn))

  // 4. Top spender highlight
  insights.push(...getTopSpenderInsights(currentExpenses))

  // Return top 5
  return insights.slice(0, 5)
}
```

Each generator function is defined below in the same file:

**`getCategoryComparisons`** — Groups expenses by category name for current and previous month. For each category present in either month, computes % change. Returns insights for categories with >20% change, sorted by absolute change descending, limited to top 3. Uses `TrendingUp` (green) for decreases and `TrendingDown` (red) for increases.

**`getBudgetPaceInsights`** — For each budget in `budgetProgress`, computes projected month-end spend: `(spent / dayOfMonth) * daysInMonth`. If projected > budget amount and current percentage > 50%, generates an insight with the estimated overshoot date. Uses `Target` icon, yellow if projected 90-110%, red if >110%.

**`getUnusualSpending`** — Compares current month per-category totals to previous month. Flags categories where: (a) spending is >50% above previous month AND previous month had >0, or (b) previous month had spending but current month has $0. Uses `AlertTriangle` icon, yellow color.

**`getTopSpenderInsights`** — Groups current expenses by `spender` field. If the top spender accounts for >50% of total spending AND there are at least 2 spenders, generates one insight with `Users` icon, green color.

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/utils/insights.ts
git commit -m "feat: add insight generator utility for dashboard"
```

---

### Task 2: Fetch previous month data in useDashboard

**Files:**
- Modify: `src/hooks/useDashboard.ts`

**Context:** `useDashboard` currently fetches current month expenses, recent expenses, and budget data. We need to also fetch previous month expenses to feed into the insight generator.

**Step 1: Add previous month fetch**

In `useDashboard.ts`, after the existing current month fetch:

1. Import `subMonths` from `date-fns`
2. Compute `prevMonthStart` and `prevMonthEnd` using `subMonths(now, 1)`
3. Add a Supabase query for previous month expenses (same select as current month, but with prev month date range)
4. Store in a local variable `prevExpenses` (no need for state — only used for insight computation)

**Step 2: Add insights state and computation**

1. Import `generateInsights` and `Insight` from `@/utils/insights`
2. Import `formatCurrency` from `@/utils/format`
3. Add `const [insights, setInsights] = useState<Insight[]>([])`
4. After the budget progress computation, call:
   ```typescript
   const generatedInsights = generateInsights(
     expenses, prevExpenses, progress, currency, formatCurrency
   )
   setInsights(generatedInsights)
   ```
5. Note: `currency` is not available in the hook. Instead, pass raw data and let the component format. Change `generateInsights` signature to accept the format function, OR compute insights without currency formatting and format in the component. **Simpler approach:** pass `formatCurrency` into the generator.
6. Add `insights` to the return object

**Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/hooks/useDashboard.ts
git commit -m "feat: fetch previous month data and generate insights in dashboard hook"
```

---

### Task 3: Create the Insights dashboard component

**Files:**
- Create: `src/components/dashboard/InsightsCard.tsx`

**Context:** A Card component that renders a list of insights. Each insight shows a colored icon, bold title, and muted detail text. Sits between BudgetProgress and the chart grid on the Dashboard.

**Step 1: Create `src/components/dashboard/InsightsCard.tsx`**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, AlertTriangle, Users, Target } from 'lucide-react'
import type { Insight, InsightIcon } from '@/utils/insights'

interface InsightsCardProps {
  insights: Insight[]
}

const iconMap: Record<InsightIcon, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Target,
}

const colorMap = {
  green: 'text-green-500',
  yellow: 'text-yellow-500',
  red: 'text-red-500',
} as const
```

- If `insights` is empty, return `null` (don't render anything — no empty state needed since insights are auto-generated)
- Render a Card with "Insights" header
- Map over insights, rendering each as a flex row: icon (colored via `colorMap`), then a div with bold title and muted detail text

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/dashboard/InsightsCard.tsx
git commit -m "feat: add InsightsCard component for dashboard"
```

---

### Task 4: Wire insights into the Dashboard page

**Files:**
- Modify: `src/pages/Dashboard.tsx`

**Step 1: Update Dashboard.tsx**

1. Import `InsightsCard` from `@/components/dashboard/InsightsCard`
2. Destructure `insights` from `useDashboard()`
3. Render `<InsightsCard insights={insights} />` between `<BudgetProgress>` and the chart grid div

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Manual test**

1. Open app, go to Dashboard
2. If you have expenses in current and previous months, insights should appear
3. Verify icons are colored correctly
4. Verify insight text makes sense (e.g., category comparisons, budget projections)

**Step 4: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: display spending insights on dashboard"
```

---

## Feature 2: Expense Search & Enhanced Filters

### Task 5: Add search and amount range to useExpenses hook

**Files:**
- Modify: `src/hooks/useExpenses.ts`

**Context:** The `ExpenseFilters` interface and `useExpenses` hook already support date range, category, spender, and payment method filters. We need to add `search` (text) and `amountMin`/`amountMax` (numbers).

**Step 1: Extend ExpenseFilters interface**

Add to the existing interface in `src/hooks/useExpenses.ts`:
```typescript
export interface ExpenseFilters {
  startDate?: string
  endDate?: string
  categoryId?: string
  spender?: string
  paymentMethodId?: string
  search?: string        // NEW: ilike on description
  amountMin?: number     // NEW: gte on amount
  amountMax?: number     // NEW: lte on amount
}
```

**Step 2: Add query filters in fetchExpenses**

After the existing filter conditions, add:
```typescript
if (filters?.search) {
  query = query.ilike('description', `%${filters.search}%`)
}
if (filters?.amountMin !== undefined) {
  query = query.gte('amount', filters.amountMin)
}
if (filters?.amountMax !== undefined) {
  query = query.lte('amount', filters.amountMax)
}
```

**Step 3: Update useCallback dependencies**

Add `filters?.search`, `filters?.amountMin`, `filters?.amountMax` to the dependency array.

**Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/hooks/useExpenses.ts
git commit -m "feat: add search and amount range to expense filters"
```

---

### Task 6: Add search bar and amount filters to ExpenseFilters component

**Files:**
- Modify: `src/components/expenses/ExpenseFilters.tsx`

**Context:** The existing component renders a row of filter controls. We need to add: (1) a text search input at the top, and (2) min/max amount inputs in the filter row. Also add a "Last 3 months" preset button.

**Step 1: Add search input**

Add a `Search` icon import from lucide-react. Before the existing filter row div, add:
```tsx
<div className="relative">
  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
  <Input
    type="text"
    placeholder="Search descriptions..."
    className="pl-9"
    value={filters.search || ''}
    onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
  />
</div>
```

Note: The `onChange` fires on every keystroke. The Supabase query is debounced naturally by the `useCallback` + `useEffect` pattern — each filter change triggers a new fetch. For better UX, consider a 300ms debounce. **Implementation:** Use a local state for the search input value, and `useEffect` with `setTimeout` to debounce the `onChange` call. This keeps the input responsive while limiting API calls.

**Step 2: Add "Last 3 months" preset**

In the `setPreset` function and buttons section, add a third button:
```tsx
<Button variant="outline" size="sm" onClick={() => setPreset('last-3-months')}>
  Last 3 months
</Button>
```

Update `setPreset` to handle `'last-3-months'`:
```typescript
function setPreset(preset: 'this-month' | 'last-month' | 'last-3-months') {
  const now = new Date()
  let start: Date, end: Date
  if (preset === 'last-3-months') {
    start = startOfMonth(subMonths(now, 2))
    end = endOfMonth(now)
  } else {
    const target = preset === 'last-month' ? subMonths(now, 1) : now
    start = startOfMonth(target)
    end = endOfMonth(target)
  }
  onChange({ ...filters, startDate: format(start, 'yyyy-MM-dd'), endDate: format(end, 'yyyy-MM-dd') })
}
```

**Step 3: Add amount range inputs**

After the Payment Method select, add two inputs:
```tsx
<div className="space-y-1">
  <Label className="text-xs text-muted-foreground">Min amount</Label>
  <Input
    type="number"
    min="0"
    step="0.01"
    placeholder="0"
    className="w-28"
    value={filters.amountMin ?? ''}
    onChange={(e) => onChange({ ...filters, amountMin: e.target.value ? Number(e.target.value) : undefined })}
  />
</div>
<div className="space-y-1">
  <Label className="text-xs text-muted-foreground">Max amount</Label>
  <Input
    type="number"
    min="0"
    step="0.01"
    placeholder="Any"
    className="w-28"
    value={filters.amountMax ?? ''}
    onChange={(e) => onChange({ ...filters, amountMax: e.target.value ? Number(e.target.value) : undefined })}
  />
</div>
```

**Step 4: Update hasFilters check**

```typescript
const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== '')
```

**Step 5: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 6: Manual test**

1. Go to /expenses
2. Type in search bar — list should filter by description text
3. Set min/max amounts — list should filter by amount range
4. Click "Last 3 months" — date range should update
5. Click "Clear" — all filters including search reset
6. Combine search + date range + category — all should work together

**Step 7: Commit**

```bash
git add src/components/expenses/ExpenseFilters.tsx
git commit -m "feat: add search bar, amount range, and last 3 months preset to expense filters"
```

---

### Task 7: Add search debounce for better UX

**Files:**
- Modify: `src/components/expenses/ExpenseFilters.tsx`

**Context:** Without debounce, every keystroke in the search box fires a Supabase query. Add a 300ms debounce.

**Step 1: Add debounced search**

1. Import `useState, useEffect` from React
2. Add `const [searchInput, setSearchInput] = useState(filters.search || '')`
3. Add a `useEffect` that debounces:
   ```typescript
   useEffect(() => {
     const timer = setTimeout(() => {
       onChange({ ...filters, search: searchInput || undefined })
     }, 300)
     return () => clearTimeout(timer)
   }, [searchInput])
   ```
4. Update the search Input to use `searchInput` and `setSearchInput` instead of directly calling `onChange`
5. Sync `searchInput` when filters are cleared externally (when `filters.search` becomes undefined but `searchInput` is not empty)

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Manual test**

1. Type quickly in the search box — should only trigger one fetch after typing stops
2. Clear filters — search input should also clear

**Step 4: Commit**

```bash
git add src/components/expenses/ExpenseFilters.tsx
git commit -m "feat: add 300ms debounce to expense search input"
```

---

### Task 8: Final integration test and cleanup

**Files:** All modified files

**Step 1: Full TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Production build**

Run: `npx vite build`
Expected: Builds successfully

**Step 3: End-to-end manual verification**

Dashboard:
1. Insights appear between budget progress and charts
2. Insights reflect actual spending patterns
3. Empty state (no insights) shows nothing (no broken card)

Expenses:
1. Search filters by description text
2. Amount min/max filters work
3. "Last 3 months" preset works
4. All filters combine correctly
5. "Clear" resets everything including search
6. Search is debounced (no rapid-fire requests)

**Step 4: Commit all remaining changes**

If any fixes were needed:
```bash
git add -A
git commit -m "fix: address integration issues"
```

---

## Key Files Summary

| File | Action | Feature |
|---|---|---|
| `src/utils/insights.ts` | Create | Insight generators |
| `src/hooks/useDashboard.ts` | Modify | Fetch prev month + generate insights |
| `src/components/dashboard/InsightsCard.tsx` | Create | Insights UI |
| `src/pages/Dashboard.tsx` | Modify | Wire in insights |
| `src/hooks/useExpenses.ts` | Modify | Add search + amount filters |
| `src/components/expenses/ExpenseFilters.tsx` | Modify | Search bar + amount inputs + debounce |

## Verification Checklist
- [ ] `npx tsc --noEmit` passes
- [ ] `npx vite build` succeeds
- [ ] Dashboard insights render with correct icons and colors
- [ ] Insights reflect real spending data
- [ ] Expense search filters by description
- [ ] Amount range filters work
- [ ] Last 3 months preset works
- [ ] All filters combine with AND logic
- [ ] Search is debounced
- [ ] Clear button resets everything
