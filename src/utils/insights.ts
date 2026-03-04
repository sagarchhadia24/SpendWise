import { getDaysInMonth, getDate, format, addDays, startOfMonth } from 'date-fns'
import type { ExpenseWithRelations, BudgetProgress } from '@/types/database'

export type InsightColor = 'green' | 'yellow' | 'red'
export type InsightIcon =
  | 'TrendingUp'
  | 'TrendingDown'
  | 'AlertTriangle'
  | 'Users'
  | 'Target'

export interface Insight {
  id: string
  icon: InsightIcon
  color: InsightColor
  title: string
  detail: string
}

type FormatCurrencyFn = (amount: number, currency: string) => string

// ── helpers ──────────────────────────────────────────────────────────

function groupByCategory(
  expenses: ExpenseWithRelations[]
): Map<string, number> {
  const map = new Map<string, number>()
  for (const e of expenses) {
    const name = e.category.name
    map.set(name, (map.get(name) ?? 0) + e.amount)
  }
  return map
}

// ── 1. Category comparisons (current vs previous month) ─────────────

function getCategoryComparisons(
  currentExpenses: ExpenseWithRelations[],
  previousExpenses: ExpenseWithRelations[],
  fmt: FormatCurrencyFn,
  currency: string
): Insight[] {
  const currentByCategory = groupByCategory(currentExpenses)
  const previousByCategory = groupByCategory(previousExpenses)

  const allCategories = new Set([
    ...currentByCategory.keys(),
    ...previousByCategory.keys(),
  ])

  const comparisons: {
    category: string
    pctChange: number
    currentTotal: number
    previousTotal: number
  }[] = []

  for (const category of allCategories) {
    const current = currentByCategory.get(category) ?? 0
    const previous = previousByCategory.get(category) ?? 0

    // Skip if both are zero or previous is zero (can't compute meaningful %)
    if (previous === 0 && current === 0) continue
    if (previous === 0) continue

    const pctChange = ((current - previous) / previous) * 100

    if (Math.abs(pctChange) > 20) {
      comparisons.push({ category, pctChange, currentTotal: current, previousTotal: previous })
    }
  }

  comparisons.sort((a, b) => Math.abs(b.pctChange) - Math.abs(a.pctChange))

  return comparisons.slice(0, 3).map((c) => {
    const absPct = Math.abs(Math.round(c.pctChange))
    const isDecrease = c.pctChange < 0

    return {
      id: `category-cmp-${c.category}`,
      icon: isDecrease ? 'TrendingUp' as const : 'TrendingDown' as const,
      color: isDecrease ? 'green' as const : 'red' as const,
      title: isDecrease
        ? `${c.category} spending down ${absPct}%`
        : `${c.category} spending up ${absPct}%`,
      detail: `${fmt(c.currentTotal, currency)} this month vs ${fmt(c.previousTotal, currency)} last month`,
    }
  })
}

// ── 2. Budget pace insights ─────────────────────────────────────────

function getBudgetPaceInsights(
  budgetProgress: BudgetProgress[],
  fmt: FormatCurrencyFn,
  currency: string
): Insight[] {
  const now = new Date()
  const dayOfMonth = getDate(now)
  const daysInMonth = getDaysInMonth(now)
  const monthStart = startOfMonth(now)

  const insights: Insight[] = []

  for (const bp of budgetProgress) {
    if (dayOfMonth === 0 || bp.spent === 0) continue

    const dailyRate = bp.spent / dayOfMonth
    const projected = dailyRate * daysInMonth

    if (projected <= bp.budget.amount || bp.percentage <= 50) continue

    const projectedPct = (projected / bp.budget.amount) * 100

    // Estimate overshoot date: when cumulative spending at current pace
    // would exceed the budget amount
    const daysToOvershoot = Math.ceil(bp.budget.amount / dailyRate)
    const overshootDate = addDays(monthStart, daysToOvershoot - 1)
    const overshootStr = format(overshootDate, 'MMM d')

    const color: InsightColor = projectedPct > 110 ? 'red' : 'yellow'
    const categoryName = bp.budget.category.name

    insights.push({
      id: `budget-pace-${bp.budget.id}`,
      icon: 'Target',
      color,
      title: `${categoryName} budget on pace to exceed`,
      detail: `Projected ${fmt(Math.round(projected), currency)} by month end (budget: ${fmt(bp.budget.amount, currency)}). May exceed by ${overshootStr}.`,
    })
  }

  return insights
}

// ── 3. Unusual spending ─────────────────────────────────────────────

function getUnusualSpending(
  currentExpenses: ExpenseWithRelations[],
  previousExpenses: ExpenseWithRelations[],
  fmt: FormatCurrencyFn,
  currency: string
): Insight[] {
  const currentByCategory = groupByCategory(currentExpenses)
  const previousByCategory = groupByCategory(previousExpenses)

  const insights: Insight[] = []

  // Check for categories with spending >50% above previous month
  for (const [category, currentTotal] of currentByCategory) {
    const previousTotal = previousByCategory.get(category) ?? 0
    if (previousTotal === 0) continue

    if (currentTotal > previousTotal * 1.5) {
      const pctAbove = Math.round(
        ((currentTotal - previousTotal) / previousTotal) * 100
      )
      insights.push({
        id: `unusual-spike-${category}`,
        icon: 'AlertTriangle',
        color: 'yellow',
        title: `Unusual spending in ${category}`,
        detail: `${fmt(currentTotal, currency)} this month is ${pctAbove}% above last month's ${fmt(previousTotal, currency)}`,
      })
    }
  }

  // Check for categories that had spending last month but $0 this month
  for (const [category, previousTotal] of previousByCategory) {
    if (previousTotal > 0 && !currentByCategory.has(category)) {
      insights.push({
        id: `unusual-zero-${category}`,
        icon: 'AlertTriangle',
        color: 'yellow',
        title: `No ${category} spending this month`,
        detail: `You spent ${fmt(previousTotal, currency)} last month but nothing so far this month`,
      })
    }
  }

  return insights
}

// ── 4. Top spender insights ─────────────────────────────────────────

function getTopSpenderInsights(
  currentExpenses: ExpenseWithRelations[],
  fmt: FormatCurrencyFn,
  currency: string
): Insight[] {
  const bySpender = new Map<string, number>()
  let total = 0

  for (const e of currentExpenses) {
    bySpender.set(e.spender, (bySpender.get(e.spender) ?? 0) + e.amount)
    total += e.amount
  }

  if (bySpender.size < 2 || total === 0) return []

  let topSpender = ''
  let topAmount = 0
  for (const [spender, amount] of bySpender) {
    if (amount > topAmount) {
      topSpender = spender
      topAmount = amount
    }
  }

  const pct = (topAmount / total) * 100
  if (pct <= 50) return []

  return [
    {
      id: `top-spender-${topSpender}`,
      icon: 'Users',
      color: 'green',
      title: `${topSpender} is the top spender`,
      detail: `${fmt(topAmount, currency)} (${Math.round(pct)}% of total spending this month)`,
    },
  ]
}

// ── Main ─────────────────────────────────────────────────────────────

export function generateInsights(
  currentExpenses: ExpenseWithRelations[],
  previousExpenses: ExpenseWithRelations[],
  budgetProgress: BudgetProgress[],
  formatCurrencyFn: FormatCurrencyFn,
  currency: string
): Insight[] {
  const all: Insight[] = [
    ...getCategoryComparisons(currentExpenses, previousExpenses, formatCurrencyFn, currency),
    ...getBudgetPaceInsights(budgetProgress, formatCurrencyFn, currency),
    ...getUnusualSpending(currentExpenses, previousExpenses, formatCurrencyFn, currency),
    ...getTopSpenderInsights(currentExpenses, formatCurrencyFn, currency),
  ]

  return all.slice(0, 5)
}
