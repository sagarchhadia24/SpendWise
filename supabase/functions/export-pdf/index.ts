// @ts-nocheck — Deno edge function, not compiled by project tsc
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get filters from request body
    const { startDate, endDate, categoryId, spender } = await req.json()

    if (!startDate || !endDate) {
      return new Response(JSON.stringify({ error: 'startDate and endDate are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch user profile for currency
    const { data: profile } = await supabase
      .from('profiles')
      .select('currency')
      .eq('id', user.id)
      .single()

    const currency = profile?.currency || 'USD'

    // Fetch expenses
    let query = supabase
      .from('expenses')
      .select('*, category:categories(name, color), payment_method:payment_methods(name)')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (categoryId) query = query.eq('category_id', categoryId)
    if (spender) query = query.eq('spender', spender)

    const { data: expenses, error: expError } = await query
    if (expError) throw expError

    // Calculate summary
    const total = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0)
    const count = expenses.length
    const avg = count > 0 ? total / count : 0

    // Category breakdown
    const catMap = new Map<string, { name: string; total: number }>()
    for (const e of expenses) {
      const name = e.category?.name || 'Unknown'
      const existing = catMap.get(name)
      if (existing) {
        existing.total += Number(e.amount)
      } else {
        catMap.set(name, { name, total: Number(e.amount) })
      }
    }
    const categoryBreakdown = Array.from(catMap.values()).sort((a, b) => b.total - a.total)

    // Generate a simple text-based PDF using basic PDF structure
    // For a production app, you'd use a proper PDF library; this creates a minimal valid PDF
    const pdfContent = generateSimplePdf({
      title: 'SpendWise Report',
      dateRange: `${startDate} to ${endDate}`,
      currency,
      total,
      count,
      avg,
      categoryBreakdown,
      expenses: expenses.map((e: any) => ({
        date: e.date,
        description: e.description || '',
        category: e.category?.name || 'Unknown',
        spender: e.spender,
        paymentMethod: e.payment_method?.name || 'Unknown',
        amount: Number(e.amount),
      })),
    })

    return new Response(pdfContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="spendwise-report-${startDate}-to-${endDate}.pdf"`,
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

interface PdfData {
  title: string
  dateRange: string
  currency: string
  total: number
  count: number
  avg: number
  categoryBreakdown: { name: string; total: number }[]
  expenses: {
    date: string
    description: string
    category: string
    spender: string
    paymentMethod: string
    amount: number
  }[]
}

function formatAmount(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥',
    CAD: 'CA$', AUD: 'A$', CHF: 'CHF', CNY: '¥', SGD: 'S$',
  }
  return `${symbols[currency] || currency}${amount.toFixed(2)}`
}

// Generates a minimal but valid PDF document
function generateSimplePdf(data: PdfData): Uint8Array {
  const lines: string[] = []

  lines.push(data.title)
  lines.push(`Period: ${data.dateRange}`)
  lines.push('')
  lines.push('SUMMARY')
  lines.push(`Total Spending: ${formatAmount(data.total, data.currency)}`)
  lines.push(`Number of Expenses: ${data.count}`)
  lines.push(`Average per Expense: ${formatAmount(data.avg, data.currency)}`)
  lines.push('')
  lines.push('CATEGORY BREAKDOWN')

  for (const cat of data.categoryBreakdown) {
    const pct = data.total > 0 ? ((cat.total / data.total) * 100).toFixed(1) : '0.0'
    lines.push(`  ${cat.name}: ${formatAmount(cat.total, data.currency)} (${pct}%)`)
  }

  lines.push('')
  lines.push('EXPENSE DETAILS')
  lines.push('Date | Description | Category | Spender | Payment | Amount')
  lines.push('-'.repeat(80))

  for (const e of data.expenses) {
    const desc = e.description.length > 20 ? e.description.substring(0, 20) + '...' : e.description || '-'
    lines.push(`${e.date} | ${desc} | ${e.category} | ${e.spender} | ${e.paymentMethod} | ${formatAmount(e.amount, data.currency)}`)
  }

  const text = lines.join('\n')

  // Build a minimal PDF with the text content
  const textBytes = new TextEncoder().encode(text)

  // Minimal PDF structure
  const pdfParts: string[] = []
  const offsets: number[] = []
  let pos = 0

  function addPart(s: string) {
    pdfParts.push(s)
    pos += new TextEncoder().encode(s).length
  }

  function recordOffset() {
    offsets.push(pos)
  }

  addPart('%PDF-1.4\n')

  // Object 1: Catalog
  recordOffset()
  addPart('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')

  // Object 2: Pages
  recordOffset()
  addPart('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')

  // Object 3: Page
  recordOffset()
  addPart('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n')

  // Build page content stream — render lines of text
  const contentLines: string[] = []
  contentLines.push('BT')
  contentLines.push('/F1 10 Tf')
  let y = 750
  for (const line of lines) {
    if (y < 40) break // stop if page is full
    // Escape special PDF characters
    const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
    contentLines.push(`50 ${y} Td`)
    contentLines.push(`(${escaped}) Tj`)
    contentLines.push(`-50 -${y} Td`) // reset position
    y -= 14
  }
  contentLines.push('ET')
  const streamContent = contentLines.join('\n')
  const streamBytes = new TextEncoder().encode(streamContent)

  // Object 4: Content stream
  recordOffset()
  addPart(`4 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`)

  // Object 5: Font
  recordOffset()
  addPart('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n')

  // Cross-reference table
  const xrefOffset = pos
  addPart('xref\n')
  addPart(`0 ${offsets.length + 1}\n`)
  addPart('0000000000 65535 f \n')
  for (const off of offsets) {
    addPart(`${off.toString().padStart(10, '0')} 00000 n \n`)
  }

  addPart('trailer\n')
  addPart(`<< /Size ${offsets.length + 1} /Root 1 0 R >>\n`)
  addPart('startxref\n')
  addPart(`${xrefOffset}\n`)
  addPart('%%EOF\n')

  return new TextEncoder().encode(pdfParts.join(''))
}
