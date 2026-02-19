# SpendWise - Expense Tracker Design Document

**Date:** 2026-02-19
**Status:** Approved

## Overview

SpendWise is a modern, family-friendly expense tracking web application. Users can sign up, log expenses with categories and dates, tag expenses to family members, manage recurring expenses, and generate reports with export capabilities.

The app is always-online (no offline support), uses client-side data loading (expected < 1,000 expenses per user), and targets a single user-selectable currency per account (display formatting only, no conversion).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| UI Components | shadcn/ui + Tailwind CSS |
| Charts | Recharts |
| Backend / DB / Auth | Supabase (PostgreSQL + Auth + REST API + Edge Functions) |
| Frontend Hosting | Vercel |
| Backend Hosting | Supabase Cloud |

## Architecture

Single React application that communicates directly with Supabase. No custom backend server. Both Supabase and Vercel accounts are already provisioned.

```
SpendWise/
├── src/
│   ├── components/          # UI components (shadcn/ui based)
│   ├── pages/               # Route pages
│   ├── lib/
│   │   └── supabase.ts      # Supabase client initialization
│   ├── hooks/               # Custom React hooks for data fetching
│   ├── types/               # TypeScript interfaces
│   └── utils/               # Helpers (formatting, date utils)
├── supabase/
│   ├── migrations/          # SQL migration files
│   ├── functions/           # Edge Functions (reports, exports)
│   └── seed.sql             # Default categories + payment methods seed data
├── tailwind.config.ts
├── package.json
└── .env.local               # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

### Data Access Patterns

- **Simple CRUD** — Supabase JS client directly from React, protected by Row Level Security (RLS). All expenses loaded client-side (no server-side pagination).
- **Complex queries** (reports, aggregations) — Supabase database functions (RPC) or Edge Functions
- **Recurring expense processing** — No server-side cron. Recurring expenses surface as pending confirmations on the dashboard when the user logs in. The app checks `next_due_date` against today and shows a banner for items needing confirmation.
- **Exports** (CSV/PDF) — Edge Functions that query data and return formatted files. PDF includes charts and summary layout.

### Authentication

- Email/password only — no OAuth/social login providers
- Supabase Auth handles signup, login, password reset
- Session managed automatically by Supabase JS client
- RLS policies use `auth.uid()` to restrict all data access per user
- No custom JWT implementation needed

### Error Handling

- **Network/server errors** — Non-blocking toast notifications (e.g., "Failed to save expense. Please try again.")
- **Auth token expiry** — Redirect to login page with a toast message
- **Form validation failures** — Inline error messages on the form (validated on submit only)

## Data Model

### User (managed by Supabase Auth)

Supabase Auth handles the core user record. We extend it with a `profiles` table:

```sql
profiles
├── id (UUID, FK → auth.users.id, PK)
├── name (text, NOT NULL)
├── family_members (text[], default '{}')  -- simple labels, not real user accounts
├── currency (text, NOT NULL, default 'USD')  -- ISO 4217 code, display only
├── deleted_at (timestamptz, nullable)  -- soft delete: set when user requests deletion
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

**Family members** are simple text labels for tagging expenses. They do not have their own accounts, logins, or permissions. Only the account owner manages everything.

**Account deletion** is a soft delete with a 30-day grace period. Setting `deleted_at` marks the account for deletion. If the user logs in during the grace period, `deleted_at` is cleared and the account is reactivated. After 30 days, a cleanup process permanently removes all user data.

### Category

```sql
categories
├── id (UUID, PK, default gen_random_uuid())
├── user_id (UUID, FK → auth.users.id, nullable — null for system defaults)
├── name (text, NOT NULL)
├── icon (text — Lucide icon identifier, user-selected for custom categories)
├── color (text — hex color for charts, user-selected for custom categories)
├── is_default (boolean, default false)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

**Deletion rule:** Categories with linked expenses cannot be deleted. The user must reassign expenses to another category first. Enforced at both the database level (FK constraint) and the UI level (disable delete button with explanatory tooltip).

### Payment Method

```sql
payment_methods
├── id (UUID, PK, default gen_random_uuid())
├── user_id (UUID, FK → auth.users.id, nullable — null for system defaults)
├── name (text, NOT NULL)  -- display name (e.g., 'Cash', 'Credit Card', 'Venmo')
├── value (text, NOT NULL, UNIQUE per user)  -- internal key (e.g., 'cash', 'credit_card', 'venmo')
├── is_default (boolean, default false)  -- true for system-provided methods
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

**Default payment methods (seeded):** cash, credit_card, debit_card, upi, bank_transfer, other.

Users can add custom payment methods via the Settings page. Custom methods appear alongside defaults in the expense form dropdown.

### Expense

```sql
expenses
├── id (UUID, PK, default gen_random_uuid())
├── user_id (UUID, FK → auth.users.id, NOT NULL)
├── category_id (UUID, FK → categories.id, NOT NULL)
├── amount (numeric(12,2), NOT NULL)
├── description (text)
├── date (date, NOT NULL)  -- single date only, no date ranges
├── spender (text, NOT NULL — user's name or family member label)
├── payment_method_id (UUID, FK → payment_methods.id, NOT NULL)
├── recurring_expense_id (UUID, FK → recurring_expenses.id, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

**Default sort order:** Newest first (date descending).

### Recurring Expense

```sql
recurring_expenses
├── id (UUID, PK, default gen_random_uuid())
├── user_id (UUID, FK → auth.users.id, NOT NULL)
├── category_id (UUID, FK → categories.id, NOT NULL)
├── amount (numeric(12,2), NOT NULL)
├── description (text)
├── spender (text, NOT NULL)
├── payment_method_id (UUID, FK → payment_methods.id, NOT NULL)
├── frequency (text, NOT NULL — enum: 'daily', 'weekly', 'monthly', 'yearly')
├── start_date (date, NOT NULL)
├── end_date (date, nullable)
├── is_active (boolean, default true)
├── next_due_date (date, NOT NULL)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

**Confirmation flow:** Recurring expenses are not auto-generated. When `next_due_date <= today`, the dashboard shows a notification banner ("You have N pending recurring expenses"). The user clicks through to confirm or skip each one. Confirming creates a real expense record and advances `next_due_date`. Skipping advances `next_due_date` without creating an expense.

### Row Level Security Policies

All tables enforce RLS:
- Users can only SELECT/INSERT/UPDATE/DELETE their own rows (`user_id = auth.uid()`)
- Categories: users see system defaults (`is_default = true`) + their own custom categories
- Payment methods: users see system defaults (`is_default = true`) + their own custom methods
- No cross-user data access is possible at the database level
- Soft-deleted users (`deleted_at IS NOT NULL`) are blocked from data access (handled at auth middleware level)

## Default Categories (Seeded)

| Category | Icon | Color |
|----------|------|-------|
| Groceries | cart | #4CAF50 |
| Rent/Mortgage | home | #2196F3 |
| Utilities | zap | #FF9800 |
| Transportation | car | #9C27B0 |
| Dining Out | utensils | #E91E63 |
| Entertainment | film | #00BCD4 |
| Healthcare | heart-pulse | #F44336 |
| Shopping | shopping-bag | #795548 |
| Education | graduation-cap | #3F51B5 |
| Subscriptions | repeat | #607D8B |
| Insurance | shield | #FF5722 |
| Personal Care | sparkles | #8BC34A |
| Gifts/Donations | gift | #673AB7 |
| Travel | plane | #009688 |
| Miscellaneous | ellipsis | #9E9E9E |

## Default Payment Methods (Seeded)

| Payment Method | Value |
|----------------|-------|
| Cash | cash |
| Credit Card | credit_card |
| Debit Card | debit_card |
| UPI | upi |
| Bank Transfer | bank_transfer |
| Other | other |

## Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Marketing/hero page with signup CTA |
| Login | `/login` | Email/password login form |
| Register | `/register` | Signup form (email/password only) |
| Dashboard | `/dashboard` | Current month overview — monthly total, recent expenses, spending charts, recurring expense confirmation banner |
| Expenses | `/expenses` | Full expense list with filters (reset on each visit), inline row editing, add/delete |
| Add Expense | `/expenses/new` | Dedicated form page — date, amount, category, spender dropdown, payment method select |
| Categories | `/categories` | Manage custom categories with icon picker (Lucide) and color picker |
| Reports | `/reports` | Single page with tabs: monthly summary, custom date range, by spender, category trend. Export (CSV/PDF) |
| Recurring | `/recurring` | Manage recurring expense definitions |
| Settings | `/settings` | Profile name, family members, currency selection, custom payment methods, password change, account deletion |

## Key UI Components

- **ExpenseForm** — date picker (defaults to today), amount input, category dropdown, spender dropdown (account owner name + family members, defaulting to owner), payment method dropdown. Validation on submit only.
- **ExpenseTable** — sortable data table (default: newest first) with filterable columns. Inline row editing: clicking edit makes fields editable in-place with save/cancel buttons. Delete action triggers a confirmation dialog.
- **SpendingChart** — interactive pie chart (by category) and bar chart (monthly trend) via Recharts. Hover shows tooltips with exact amounts/percentages. Clicking a pie slice or bar filters the data table below.
- **DateRangePicker** — custom date range selection for reports
- **SpenderFilter** — dropdown to filter by family member name
- **StatCards** — summary cards showing current month data: total spent, average daily spending
- **RecurringBanner** — dashboard notification banner showing count of pending recurring expenses with confirm/skip actions
- **Sidebar + TopNav** — responsive app navigation shell. Desktop: persistent sidebar. Mobile: hamburger menu with slide-out drawer.
- **ThemeToggle** — light/dark mode switcher. Defaults to OS system preference on first visit. User override saved to localStorage.
- **DeleteConfirmDialog** — modal confirmation dialog for all destructive actions (delete expense, delete category, delete account)
- **CategoryForm** — name input, Lucide icon picker, and color picker for creating/editing custom categories
- **PaymentMethodManager** — settings section for adding/removing custom payment methods

## Reports & Exports

### Report Types

All 4 report types live on a single `/reports` page with tab navigation:

1. **Monthly Summary** — total spending, breakdown by category (pie chart), breakdown by spender (bar chart)
2. **Custom Date Range** — same breakdowns for any user-selected period
3. **By Spender** — per-family-member spending with category breakdown
4. **Category Trend** — line chart showing category spending over multiple months

All charts are interactive: hover for tooltips, click to filter underlying data.

### Export Formats

- **CSV** — tabular expense data with currently applied filters
- **PDF** — formatted report with summary statistics, category breakdown pie chart, and expense table. Generated via Edge Function with server-side chart rendering. Designed to look like a proper financial report.

## Theme & Styling

- **Visual style:** Clean and minimal — white/gray backgrounds, subtle borders, ample whitespace. Similar aesthetic to Notion or Linear.
- **Dark mode:** Follows OS system preference by default. User can override via ThemeToggle. Preference persisted in localStorage.
- **Component library:** shadcn/ui with default neutral theme (no heavy customization). Tailwind CSS for utility styling.

## Deployment

### Frontend (Vercel)
- React app built with Vite
- Auto-deploy on push to `main` branch
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Backend (Supabase Cloud)
- PostgreSQL database with RLS
- Supabase Auth for user management (email/password only)
- Edge Functions for reports/exports and PDF generation
- Database migrations managed via Supabase CLI

### Environment Variables
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous/public key

### Testing

No automated tests for v1. Manual testing only. Schema and data model designed to support automated testing if added later.

## Explicitly Out of Scope (v1)

- OAuth/social login (Google, Apple, etc.)
- Budget tracking or spending limits
- Offline support or service workers
- Data import (CSV/bank statement import)
- Multi-currency per expense or currency conversion
- Family members as real user accounts with their own logins
- Server-side pagination (client-side loading sufficient for expected data volume)
- Date ranges on expenses (single date only)

## Features Summary

- [x] Email/password signup and login (Supabase Auth)
- [x] Add/edit/delete expenses with date, category, amount, payment method
- [x] Inline row editing in the expense table
- [x] 15 default expense categories + custom user categories (with icon and color picker)
- [x] Family member name labels — tag expenses to any household member via dropdown
- [x] Default + custom payment methods (managed in settings)
- [x] User-selectable currency (account-level, display formatting only)
- [x] Recurring expenses (daily/weekly/monthly/yearly) with manual confirmation via dashboard banner
- [x] Dashboard with current month spending overview and interactive charts
- [x] Reports: monthly, custom date range, by spender, category trend (single tabbed page)
- [x] Interactive charts — hover tooltips, click-to-filter
- [x] Export reports as CSV or PDF (PDF includes charts and formatted layout)
- [x] Filter expenses by date, category, spender, payment method (filters reset each visit)
- [x] Dark mode / light mode toggle (follows system preference by default)
- [x] Clean, minimal UI with shadcn/ui + Tailwind CSS
- [x] Confirmation dialogs for destructive actions
- [x] Toast notifications for server/network errors
- [x] Form validation on submit
- [x] Soft-delete account with 30-day grace period (login reactivates)
- [x] Category deletion prevented when expenses are linked
- [x] Responsive layout — sidebar on desktop, hamburger menu on mobile
- [x] Deployed to Vercel (frontend) + Supabase Cloud (backend)
- [x] GitHub repository for version control
