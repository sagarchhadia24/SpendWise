# Smart Insights & Expense Search Design

## Feature 1: Smart Insights (Dashboard)

### Overview
A new "Insights" card on the Dashboard, below Budget Progress, showing up to 5 auto-generated insights computed client-side. Each insight has an icon, a short message, and a color-coded sentiment (green for positive, yellow for caution, red for alert).

### Insight Generators

1. **Month-over-month category comparison** — Fetches previous month's expenses alongside current month. For each category, computes % change. Surfaces the top 2-3 biggest movers (e.g., "Dining Out up 35%", "Transport down 50%"). Threshold: only show if change > 20%.

2. **Budget pace projection** — For each active budget, projects total spend by month-end based on daily average so far. If projected to exceed budget, shows the estimated date of breach. Only shows for budgets projected to exceed 90%.

3. **Unusual spending detection** — Compares current month per-category spend to the 3-month rolling average. Flags categories that are >50% above average or where spending dropped to zero unexpectedly.

4. **Top spender highlight** — If family has multiple spenders, shows the spending distribution. Only surfaces if one spender accounts for >50% of total.

### Data Flow
`useDashboard` already fetches current month expenses. We add a second fetch for previous month expenses (and optionally 2 months prior for the rolling average). A `generateInsights()` utility function takes both months' data + budgets and returns ranked insights. No new DB tables needed.

### UI
A `Card` with "Insights" header and a vertical list of insight items. Each item: colored icon (TrendingUp/TrendingDown/AlertTriangle/Users), bold headline, muted detail text. Placed between Budget Progress and the chart grid on the Dashboard.

---

## Feature 2: Expense Search & Smart Filters

### Overview
Enhance the existing `/expenses` page with a search bar and collapsible filter panel above the expense list.

### Search Bar
Text input at the top that filters expenses by description (case-insensitive). Uses Supabase `ilike` for server-side filtering. Debounced 300ms.

### Filter Panel
A collapsible row of filters below the search bar:
- **Date range** — Two date pickers (from/to), with presets: "This month", "Last month", "Last 3 months", "Custom"
- **Category** — Multi-select dropdown from user's categories
- **Spender** — Multi-select from family members
- **Payment method** — Multi-select from user's payment methods
- **Amount range** — Min/max number inputs

All filters combine with AND logic. Active filter count shown as a badge. A "Clear all" button resets everything.

### Data Flow
Move filtering to Supabase queries (server-side) so it scales with data. The `useExpenses` hook gets new parameters for search text and filter object. Results remain paginated.

### UI
Search bar is always visible. Filters toggle via a "Filters" button with active count badge. Filter panel slides down when open. Applied filters shown as removable chips below the panel.

---

## Decisions
- Insights computed client-side only (no edge functions or AI)
- Insights on Dashboard only (no dedicated page)
- Search and filters enhance existing /expenses page (no global search)
- All filters server-side via Supabase queries
