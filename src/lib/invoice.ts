import type { InvoiceData, InvoiceLineItem, InvoiceRequest, SellerInfo } from '@/types/invoice'
import type { TableSession } from '@/types/session'
import { mergeOrderItems } from '@/lib/orders'
const ONES = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
const ONES_AFTER_TEN = ['', 'mốt', 'hai', 'ba', 'bốn', 'lăm', 'sáu', 'bảy', 'tám', 'chín']

function threeDigits(n: number, isLeading: boolean): string {
  const h = Math.floor(n / 100)
  const t = Math.floor((n % 100) / 10)
  const o = n % 10
  const parts: string[] = []

  if (h > 0) {
    parts.push(ONES[h] + ' trăm')
  } else if (!isLeading) {
    parts.push('không trăm')
  }

  const hasHundreds = h > 0 || !isLeading

  if (t === 0 && o > 0) {
    if (hasHundreds) parts.push('linh')
    parts.push(ONES[o])
  } else if (t === 1) {
    parts.push('mười')
    if (o > 0) parts.push(ONES[o])
  } else if (t > 1) {
    parts.push(ONES[t] + ' mươi')
    if (o > 0) parts.push(ONES_AFTER_TEN[o])
  }

  return parts.join(' ')
}

export function numberToWords(n: number): string {
  if (n === 0) return 'Không đồng'

  const billion = Math.floor(n / 1_000_000_000)
  const million = Math.floor((n % 1_000_000_000) / 1_000_000)
  const thousand = Math.floor((n % 1_000_000) / 1_000)
  const remainder = n % 1_000

  const parts: string[] = []
  if (billion > 0) parts.push(threeDigits(billion, true) + ' tỷ')
  if (million > 0) parts.push(threeDigits(million, parts.length === 0) + ' triệu')
  if (thousand > 0) parts.push(threeDigits(thousand, parts.length === 0) + ' nghìn')
  if (remainder > 0) parts.push(threeDigits(remainder, parts.length === 0))

  const raw = parts.join(' ')
  return raw.charAt(0).toUpperCase() + raw.slice(1) + ' đồng'
}

const COUNTER_KEY = 'terminal_invoice_counter'

export function generateInvoiceNumber(): string {
  const n = parseInt(localStorage.getItem(COUNTER_KEY) ?? '0', 10) + 1
  localStorage.setItem(COUNTER_KEY, String(n))
  return String(n).padStart(7, '0')
}

export function buildInvoice(
  session: TableSession,
  request: InvoiceRequest,
  sellerInfo: SellerInfo,
  vatRate = 0.1,
): InvoiceData {
  const vatInclusive = 1 + vatRate
  const merged = mergeOrderItems(session.submittedOrders)

  const items: InvoiceLineItem[] = merged.map((item, i) => ({
    no: i + 1,
    name: item.name,
    unit: 'phần',
    quantity: item.quantity,
    unitPrice: Math.round(item.priceNum / vatInclusive),
    amount: Math.round((item.priceNum * item.quantity) / vatInclusive),
  }))

  const total = merged.reduce((s, i) => s + i.priceNum * i.quantity, 0)
  const subtotal = Math.round(total / vatInclusive)
  const vatAmount = total - subtotal

  return {
    number: generateInvoiceNumber(),
    symbol: sellerInfo.invoiceSymbol,
    issuedAt: new Date().toISOString(),
    seller: sellerInfo,
    buyer: request,
    items,
    subtotal,
    vatRate,
    vatAmount,
    total,
    totalInWords: numberToWords(total),
  }
}
