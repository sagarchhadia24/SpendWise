# SpendWise

A family-friendly expense tracking web application built with React, TypeScript, and Supabase.

**Live:** [spendwise-app-neon.vercel.app](https://spendwise-app-neon.vercel.app)

## Features

- **Dashboard** — Current month overview with stat cards, spending pie chart, daily bar chart, and recent expenses
- **Expenses** — Full CRUD with inline editing, filters (date range, category, spender, payment method), and sortable columns
- **Categories** — Custom categories with icon and color picker, plus system defaults
- **Payment Methods** — Custom payment methods alongside system defaults
- **Recurring Expenses** — Templates with daily/weekly/monthly/yearly frequency, dashboard notification banner for confirmation
- **Reports** — Four report tabs: Monthly Summary, Custom Date Range, By Spender, and Category Trend with CSV and PDF export
- **Activity Log** — Timeline-style audit trail tracking expense and recurring expense changes with expandable field-level diffs
- **Settings** — Profile management, family members, currency selection, password change, and account deletion (30-day soft delete)
- **Dark/Light Theme** — Teal/emerald color scheme with system preference detection and localStorage persistence
- **Responsive Design** — Desktop sidebar layout with mobile hamburger menu

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript |
| Build | Vite 7 |
| UI Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS v4 (OKLCH color space) |
| Charts | Recharts |
| Backend | Supabase (PostgreSQL + Auth + RLS + Edge Functions) |
| Hosting | Vercel (frontend), Supabase Cloud (backend) |
| Auth | Supabase Auth (email/password) |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/sagarchhadia24/SpendWise.git
   cd SpendWise
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Run the database migrations in order against your Supabase project (SQL Editor):
   - `supabase/migrations/001_create_profiles.sql`
   - `supabase/migrations/002_create_categories.sql`
   - `supabase/migrations/003_create_payment_methods.sql`
   - `supabase/migrations/004_create_expenses.sql`
   - `supabase/migrations/005_create_recurring_expenses.sql`
   - `supabase/migrations/006_rls_policies.sql`
   - `supabase/migrations/007_create_activity_logs.sql`

5. Start the development server:
   ```bash
   npm run dev
   ```

### Build for Production

```bash
npm run build
```

### Deploy

The project is configured for Vercel deployment. Push to `main` to trigger auto-deploy, or:

```bash
npx vercel --prod --yes
```

Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel environment variables. SPA routing is handled via `vercel.json`.

## Project Structure

```
src/
  components/
    activity/       Activity log timeline and diff components
    categories/     Category management (create, edit, color/icon picker)
    dashboard/      Dashboard charts and stat cards
    expenses/       Expense form, table, filters, delete dialog
    layout/         Sidebar, TopNav, AppLayout, ThemeToggle
    recurring/      Recurring expense form and table
    reports/        Report tabs (monthly, custom range, by spender, category trend)
    ui/             shadcn/ui component library
  hooks/            Custom React hooks (useAuth, useExpenses, useActivityLogs, etc.)
  lib/              Supabase client, constants, utilities
  pages/            Route page components
  types/            TypeScript interfaces (database types)
  utils/            Helpers (currency formatting, CSV/PDF export)
supabase/
  migrations/       SQL schema and RLS policies (001-007)
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User settings, family members, currency, soft-delete |
| `categories` | System defaults + custom per user |
| `payment_methods` | System defaults + custom per user |
| `expenses` | Expense records with FK to categories and payment methods |
| `recurring_expenses` | Templates with frequency, next due date, active flag |
| `activity_logs` | Audit trail with JSONB old/new data, populated by DB triggers |

All tables have Row Level Security (RLS) enabled. Users can only access their own data. Activity logs are write-protected — only PostgreSQL triggers can insert entries.

## License

MIT
