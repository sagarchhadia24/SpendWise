export const DEFAULT_PAYMENT_METHODS = [
  { name: 'Cash', value: 'cash' },
  { name: 'Credit Card', value: 'credit_card' },
  { name: 'Debit Card', value: 'debit_card' },
  { name: 'UPI', value: 'upi' },
  { name: 'Bank Transfer', value: 'bank_transfer' },
  { name: 'Other', value: 'other' },
] as const

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '\u20AC' },
  { code: 'GBP', name: 'British Pound', symbol: '\u00A3' },
  { code: 'INR', name: 'Indian Rupee', symbol: '\u20B9' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '\u00A5' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '\u00A5' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '\u20A9' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
] as const

export const CURRENCY_SYMBOLS: Record<string, string> = Object.fromEntries(
  SUPPORTED_CURRENCIES.map((c) => [c.code, c.symbol])
)
