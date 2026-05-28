import type { InvoiceData, InvoiceLineItem, InvoiceRequest } from '@/types/invoice'
import type { TableSession } from '@/hooks/useTableSessions'
import { seller } from '@/data/seller'

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

export function buildInvoice(session: TableSession, request: InvoiceRequest): InvoiceData {
  const allItems = session.submittedOrders.flatMap(o => o.items)

  const merged: Record<string, InvoiceLineItem> = {}
  let seq = 1
  for (const item of allItems) {
    if (merged[item.menuItemId]) {
      merged[item.menuItemId].quantity += item.quantity
      merged[item.menuItemId].amount = Math.round(
        (merged[item.menuItemId].quantity * item.priceNum) / 1.1,
      )
    } else {
      merged[item.menuItemId] = {
        no: seq++,
        name: item.name,
        unit: 'phần',
        quantity: item.quantity,
        unitPrice: Math.round(item.priceNum / 1.1),
        amount: Math.round((item.priceNum * item.quantity) / 1.1),
      }
    }
  }

  const total = allItems.reduce((s, i) => s + i.priceNum * i.quantity, 0)
  const subtotal = Math.round(total / 1.1)
  const vatAmount = total - subtotal

  return {
    number: generateInvoiceNumber(),
    symbol: seller.invoiceSymbol,
    issuedAt: new Date().toISOString(),
    seller,
    buyer: request,
    items: Object.values(merged),
    subtotal,
    vatRate: 0.1,
    vatAmount,
    total,
    totalInWords: numberToWords(total),
  }
}
