# Red Invoice (Hoá Đơn Đỏ) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a demo VAT invoice (hoá đơn GTGT) flow — buyer info form → printable invoice page — without real HĐĐT integration.

**Architecture:** Demo-only, fully frontend. Buyer info is collected via a modal on the payment page and saved to the session. A new `/staff/table/:id/invoice` route renders a standards-compliant Vietnamese VAT invoice layout with CSS print styles. Session is closed from the invoice page after printing. Invoice number is a localStorage counter. Prices are treated as VAT-inclusive (÷1.1 to derive pre-tax amount).

**Tech Stack:** React 19, TypeScript, Tailwind CSS v3 (`print:` variants), Vitest + Testing Library, react-router-dom v7. No new dependencies.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/types/invoice.ts` | Create | `InvoiceRequest`, `InvoiceData`, `InvoiceLineItem`, `SellerInfo` types |
| `src/data/seller.ts` | Create | Hardcoded restaurant seller constants |
| `src/lib/invoice.ts` | Create | `numberToWords()`, `generateInvoiceNumber()`, `buildInvoice()` |
| `src/hooks/useTableSessions.ts` | Modify | Add `invoiceRequest?: InvoiceRequest` to `TableSession`; add `setInvoiceRequest` action |
| `src/components/staff/invoice-form.tsx` | Create | Modal form — collects buyer name, tax code, address, email, payment method |
| `src/components/staff/invoice-preview.tsx` | Create | Printable Vietnamese GTGT invoice layout |
| `src/pages/staff-invoice.tsx` | Create | Invoice page: preview + print button + "Hoàn tất" (closes session) |
| `src/App.tsx` | Modify | Add `/staff/table/:id/invoice` route |
| `src/pages/staff-payment.tsx` | Modify | Add "Xuất HĐ đỏ" button that opens `InvoiceForm`; on submit navigate to invoice page |
| `src/__tests__/invoice.test.ts` | Create | Unit tests for `numberToWords`, `generateInvoiceNumber`, `buildInvoice` |
| `src/__tests__/invoice-form.test.tsx` | Create | Component tests for buyer info form |

---

### Task 1: Types + seller constants

**Files:**
- Create: `src/types/invoice.ts`
- Create: `src/data/seller.ts`

- [ ] **Step 1: Create `src/types/invoice.ts`**

```ts
export interface SellerInfo {
  name: string
  address: string
  taxCode: string
  phone: string
  invoiceSymbol: string
}

export interface InvoiceRequest {
  buyerName: string
  buyerTaxCode: string
  buyerAddress: string
  buyerEmail: string
  paymentMethod: 'cash' | 'transfer'
}

export interface InvoiceLineItem {
  no: number
  name: string
  unit: string
  quantity: number
  unitPrice: number   // pre-VAT per unit
  amount: number      // pre-VAT total for this line
}

export interface InvoiceData {
  number: string          // e.g. "0000001"
  symbol: string          // e.g. "AA/25E"
  issuedAt: string        // ISO date string
  seller: SellerInfo
  buyer: InvoiceRequest
  items: InvoiceLineItem[]
  subtotal: number        // sum of amounts (pre-VAT)
  vatRate: number         // 0.1
  vatAmount: number       // subtotal * vatRate
  total: number           // subtotal + vatAmount (= original prices)
  totalInWords: string
}
```

- [ ] **Step 2: Create `src/data/seller.ts`**

```ts
import type { SellerInfo } from '@/types/invoice'

export const seller: SellerInfo = {
  name: 'THE TERMINAL',
  address: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  taxCode: '0312345678',
  phone: '028 3824 5678',
  invoiceSymbol: 'AA/25E',
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/types/invoice.ts src/data/seller.ts
git commit -m "feat: invoice types and seller constants"
```

---

### Task 2: Invoice logic — numberToWords + buildInvoice

**Files:**
- Create: `src/lib/invoice.ts`
- Create: `src/__tests__/invoice.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/__tests__/invoice.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { numberToWords, generateInvoiceNumber, buildInvoice } from '@/lib/invoice'
import type { InvoiceRequest } from '@/types/invoice'
import type { TableSession } from '@/hooks/useTableSessions'

beforeEach(() => localStorage.clear())

const mockRequest: InvoiceRequest = {
  buyerName: 'Công ty TNHH ABC',
  buyerTaxCode: '0987654321',
  buyerAddress: '456 Nguyễn Huệ, Q1, TP.HCM',
  buyerEmail: 'ke-toan@abc.com',
  paymentMethod: 'cash',
}

const mockSession: TableSession = {
  tableId: '01',
  status: 'waiting_payment',
  pendingItems: [],
  submittedOrders: [
    {
      id: 'o1',
      submittedAt: '2026-05-28T10:00:00.000Z',
      items: [
        { menuItemId: 'ap1', name: 'Foie Gras Terrine', priceNum: 245000, price: '245.000đ', quantity: 2, note: '' },
        { menuItemId: 'cf1', name: 'Terminal Espresso', priceNum: 55000, price: '55.000đ', quantity: 1, note: '' },
      ],
    },
  ],
  openedAt: '2026-05-28T09:00:00.000Z',
}

describe('numberToWords', () => {
  it('converts 0', () => {
    expect(numberToWords(0)).toBe('Không đồng')
  })
  it('converts 45000', () => {
    expect(numberToWords(45000)).toBe('Bốn mươi lăm nghìn đồng')
  })
  it('converts 545000', () => {
    expect(numberToWords(545000)).toBe('Năm trăm bốn mươi lăm nghìn đồng')
  })
  it('converts 1000000', () => {
    expect(numberToWords(1000000)).toBe('Một triệu đồng')
  })
  it('converts 1234000', () => {
    expect(numberToWords(1234000)).toBe('Một triệu hai trăm ba mươi bốn nghìn đồng')
  })
  it('handles 11000 (mười một nghìn)', () => {
    expect(numberToWords(11000)).toBe('Mười một nghìn đồng')
  })
  it('handles 100000 (một trăm nghìn)', () => {
    expect(numberToWords(100000)).toBe('Một trăm nghìn đồng')
  })
})

describe('generateInvoiceNumber', () => {
  it('returns 7-digit padded string starting from 0000001', () => {
    expect(generateInvoiceNumber()).toBe('0000001')
  })
  it('increments on each call', () => {
    generateInvoiceNumber()
    expect(generateInvoiceNumber()).toBe('0000002')
  })
})

describe('buildInvoice', () => {
  it('merges items from all submitted orders', () => {
    const inv = buildInvoice(mockSession, mockRequest)
    expect(inv.items).toHaveLength(2)
  })

  it('calculates total as sum of all submitted order items', () => {
    // 2 × 245000 + 1 × 55000 = 545000
    const inv = buildInvoice(mockSession, mockRequest)
    expect(inv.total).toBe(545000)
  })

  it('derives subtotal as total / 1.1 (rounded)', () => {
    const inv = buildInvoice(mockSession, mockRequest)
    expect(inv.subtotal).toBe(Math.round(545000 / 1.1))
  })

  it('vatAmount = total - subtotal', () => {
    const inv = buildInvoice(mockSession, mockRequest)
    expect(inv.vatAmount).toBe(inv.total - inv.subtotal)
  })

  it('assigns correct invoice number and symbol', () => {
    const inv = buildInvoice(mockSession, mockRequest)
    expect(inv.number).toBe('0000001')
    expect(inv.symbol).toBe('AA/25E')
  })

  it('merges duplicate menuItemIds across orders', () => {
    const sessionWithDupe: TableSession = {
      ...mockSession,
      submittedOrders: [
        { id: 'o1', submittedAt: '', items: [
          { menuItemId: 'ap1', name: 'Foie Gras', priceNum: 245000, price: '245.000đ', quantity: 1, note: '' },
        ]},
        { id: 'o2', submittedAt: '', items: [
          { menuItemId: 'ap1', name: 'Foie Gras', priceNum: 245000, price: '245.000đ', quantity: 2, note: '' },
        ]},
      ],
    }
    const inv = buildInvoice(sessionWithDupe, mockRequest)
    expect(inv.items).toHaveLength(1)
    expect(inv.items[0].quantity).toBe(3)
  })
})
```

- [ ] **Step 2: Run tests — expect all to fail**

Run: `npx vitest run src/__tests__/invoice.test.ts`
Expected: FAIL — "Cannot find module '@/lib/invoice'"

- [ ] **Step 3: Create `src/lib/invoice.ts`**

```ts
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

  if (t === 0 && o > 0) {
    parts.push('linh')
    parts.push(ONES[o])
  } else if (t === 1) {
    parts.push('mười')
    if (o > 0) parts.push(ONES_AFTER_TEN[o])
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

  // Merge same menuItemId across all orders
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
```

- [ ] **Step 4: Run tests — expect all to pass**

Run: `npx vitest run src/__tests__/invoice.test.ts`
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/invoice.ts src/__tests__/invoice.test.ts
git commit -m "feat: invoice logic — numberToWords, generateInvoiceNumber, buildInvoice"
```

---

### Task 3: Session hook — add invoiceRequest

**Files:**
- Modify: `src/hooks/useTableSessions.ts`
- Modify: `src/__tests__/useTableSessions.test.ts`

- [ ] **Step 1: Add failing test**

Append to the `describe` block in `src/__tests__/useTableSessions.test.ts`:

```ts
it('setInvoiceRequest stores buyer info on the session', () => {
  const { result } = renderHook(() => useTableSessions())
  act(() => result.current.openSession('01'))
  act(() => result.current.setInvoiceRequest('01', {
    buyerName: 'Công ty ABC',
    buyerTaxCode: '0987654321',
    buyerAddress: '456 Nguyễn Huệ',
    buyerEmail: 'abc@abc.com',
    paymentMethod: 'cash',
  }))
  expect(result.current.sessions['01'].invoiceRequest?.buyerName).toBe('Công ty ABC')
})
```

- [ ] **Step 2: Run — expect FAIL**

Run: `npx vitest run src/__tests__/useTableSessions.test.ts`
Expected: FAIL — "result.current.setInvoiceRequest is not a function"

- [ ] **Step 3: Update `src/hooks/useTableSessions.ts`**

Add `InvoiceRequest` import at the top:
```ts
import type { InvoiceRequest } from '@/types/invoice'
```

Add `invoiceRequest?: InvoiceRequest` to `TableSession` interface:
```ts
export interface TableSession {
  tableId: string
  status: 'empty' | 'serving' | 'waiting_payment' | 'done'
  pendingItems: OrderItem[]
  submittedOrders: SubmittedOrder[]
  openedAt: string
  invoiceRequest?: InvoiceRequest
}
```

Add `setInvoiceRequest` action before the `return` statement:
```ts
const setInvoiceRequest = useCallback(
  (tableId: string, request: InvoiceRequest) => {
    update(prev => {
      const session = prev[tableId]
      if (!session) return prev
      return { ...prev, [tableId]: { ...session, invoiceRequest: request } }
    })
  },
  [update],
)
```

Update the return value:
```ts
return { sessions, openSession, addItem, updateItem, removeItem, submitOrder, requestPayment, closeSession, setInvoiceRequest }
```

- [ ] **Step 4: Run — expect all pass**

Run: `npx vitest run src/__tests__/useTableSessions.test.ts`
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTableSessions.ts src/__tests__/useTableSessions.test.ts
git commit -m "feat: add invoiceRequest field and setInvoiceRequest action to session hook"
```

---

### Task 4: Buyer info form modal

**Files:**
- Create: `src/components/staff/invoice-form.tsx`
- Create: `src/__tests__/invoice-form.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/__tests__/invoice-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import InvoiceForm from '@/components/staff/invoice-form'

describe('InvoiceForm', () => {
  it('renders all required fields', () => {
    render(<InvoiceForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/tên công ty/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mã số thuế/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/địa chỉ/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('disables submit when required fields are empty', () => {
    render(<InvoiceForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /xuất hoá đơn/i })).toBeDisabled()
  })

  it('enables submit when all required fields filled', async () => {
    render(<InvoiceForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/tên công ty/i), { target: { value: 'Cty ABC' } })
    fireEvent.change(screen.getByLabelText(/mã số thuế/i), { target: { value: '0123456789' } })
    fireEvent.change(screen.getByLabelText(/địa chỉ/i), { target: { value: '123 ABC' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } })
    expect(screen.getByRole('button', { name: /xuất hoá đơn/i })).not.toBeDisabled()
  })

  it('calls onSubmit with correct InvoiceRequest data', async () => {
    const onSubmit = vi.fn()
    render(<InvoiceForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/tên công ty/i), { target: { value: 'Cty ABC' } })
    fireEvent.change(screen.getByLabelText(/mã số thuế/i), { target: { value: '0123456789' } })
    fireEvent.change(screen.getByLabelText(/địa chỉ/i), { target: { value: '123 ABC' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } })
    await userEvent.click(screen.getByRole('button', { name: /xuất hoá đơn/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      buyerName: 'Cty ABC',
      buyerTaxCode: '0123456789',
      buyerAddress: '123 ABC',
      buyerEmail: 'a@b.com',
      paymentMethod: 'cash',
    })
  })

  it('calls onCancel when cancel button clicked', async () => {
    const onCancel = vi.fn()
    render(<InvoiceForm onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /hủy/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

Run: `npx vitest run src/__tests__/invoice-form.test.tsx`
Expected: FAIL — "Cannot find module '@/components/staff/invoice-form'"

- [ ] **Step 3: Create `src/components/staff/invoice-form.tsx`**

```tsx
import { useState } from 'react'
import type { InvoiceRequest } from '@/types/invoice'

interface Props {
  onSubmit: (request: InvoiceRequest) => void
  onCancel: () => void
}

export default function InvoiceForm({ onSubmit, onCancel }: Props) {
  const [buyerName, setBuyerName] = useState('')
  const [buyerTaxCode, setBuyerTaxCode] = useState('')
  const [buyerAddress, setBuyerAddress] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash')

  const canSubmit = buyerName.trim() && buyerTaxCode.trim() && buyerAddress.trim() && buyerEmail.trim()

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit({ buyerName: buyerName.trim(), buyerTaxCode: buyerTaxCode.trim(), buyerAddress: buyerAddress.trim(), buyerEmail: buyerEmail.trim(), paymentMethod })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg w-full max-w-md p-6 space-y-4">
        <div>
          <p className="text-base font-semibold text-[#e8e0d0] mb-0.5">Xuất hoá đơn GTGT</p>
          <p className="text-[11px] text-[#555]">Nhập thông tin người mua để xuất hoá đơn đỏ</p>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="buyerName" className="block text-[10px] tracking-[0.15em] text-[#666] uppercase mb-1">
              Tên công ty / người mua <span className="text-[#e07b39]">*</span>
            </label>
            <input
              id="buyerName"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded text-[13px] text-[#e8e0d0] px-3 py-2 outline-none focus:border-[#C9A84C55] placeholder:text-[#444]"
              placeholder="Công ty TNHH ABC"
              value={buyerName}
              onChange={e => setBuyerName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="buyerTaxCode" className="block text-[10px] tracking-[0.15em] text-[#666] uppercase mb-1">
              Mã số thuế <span className="text-[#e07b39]">*</span>
            </label>
            <input
              id="buyerTaxCode"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded text-[13px] text-[#e8e0d0] px-3 py-2 outline-none focus:border-[#C9A84C55] placeholder:text-[#444]"
              placeholder="0123456789"
              value={buyerTaxCode}
              onChange={e => setBuyerTaxCode(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="buyerAddress" className="block text-[10px] tracking-[0.15em] text-[#666] uppercase mb-1">
              Địa chỉ <span className="text-[#e07b39]">*</span>
            </label>
            <input
              id="buyerAddress"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded text-[13px] text-[#e8e0d0] px-3 py-2 outline-none focus:border-[#C9A84C55] placeholder:text-[#444]"
              placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
              value={buyerAddress}
              onChange={e => setBuyerAddress(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="buyerEmail" className="block text-[10px] tracking-[0.15em] text-[#666] uppercase mb-1">
              Email nhận hoá đơn <span className="text-[#e07b39]">*</span>
            </label>
            <input
              id="buyerEmail"
              type="email"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded text-[13px] text-[#e8e0d0] px-3 py-2 outline-none focus:border-[#C9A84C55] placeholder:text-[#444]"
              placeholder="ke-toan@congty.com"
              value={buyerEmail}
              onChange={e => setBuyerEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.15em] text-[#666] uppercase mb-1">
              Hình thức thanh toán
            </label>
            <div className="flex border border-[#2a2a2a] rounded overflow-hidden">
              {(['cash', 'transfer'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`flex-1 py-2 text-[11px] tracking-[0.1em] transition-colors ${
                    paymentMethod === m ? 'bg-[#1e1a0e] text-gold' : 'bg-[#181818] text-[#555]'
                  }`}
                >
                  {m === 'cash' ? 'TIỀN MẶT' : 'CHUYỂN KHOẢN'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 text-[11px] tracking-[0.15em] border border-[#333] text-[#666] rounded"
          >
            HỦY
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="flex-1 py-2.5 text-[11px] tracking-[0.15em] bg-gold text-brand-dark font-bold rounded disabled:opacity-30"
          >
            XUẤT HOÁ ĐƠN →
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run — expect all pass**

Run: `npx vitest run src/__tests__/invoice-form.test.tsx`
Expected: all 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/components/staff/invoice-form.tsx src/__tests__/invoice-form.test.tsx
git commit -m "feat: buyer info form modal for VAT invoice"
```

---

### Task 5: Printable invoice preview component

**Files:**
- Create: `src/components/staff/invoice-preview.tsx`

No unit tests — layout-only component. Verified visually.

- [ ] **Step 1: Create `src/components/staff/invoice-preview.tsx`**

```tsx
import type { InvoiceData } from '@/types/invoice'
import { formatVnd } from '@/lib/format'

const PAYMENT_LABEL = { cash: 'Tiền mặt', transfer: 'Chuyển khoản ngân hàng' }

interface Props {
  invoice: InvoiceData
}

export default function InvoicePreview({ invoice }: Props) {
  const date = new Date(invoice.issuedAt)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()

  return (
    <div className="bg-white text-black font-sans text-sm leading-relaxed max-w-[794px] mx-auto p-10 print:p-8 print:shadow-none shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-[11px] font-semibold tracking-wide">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
        <p className="text-[11px] mb-3">Độc lập - Tự do - Hạnh phúc</p>
        <p className="text-[22px] font-bold tracking-widest uppercase">Hoá đơn giá trị gia tăng</p>
        <p className="text-[11px] text-gray-500 mt-0.5">(VAT INVOICE)</p>
        <div className="flex justify-center gap-8 mt-2 text-[12px]">
          <span>Ký hiệu (Serial): <strong>{invoice.symbol}</strong></span>
          <span>Số (No.): <strong>{invoice.number}</strong></span>
        </div>
        <p className="text-[12px] mt-1">
          Ngày {dd} tháng {mm} năm {yyyy}
        </p>
      </div>

      {/* Seller */}
      <div className="border border-black p-3 mb-3 text-[12px] space-y-0.5">
        <p><strong>Đơn vị bán hàng:</strong> {invoice.seller.name}</p>
        <p><strong>Địa chỉ:</strong> {invoice.seller.address}</p>
        <p><strong>Mã số thuế:</strong> {invoice.seller.taxCode}</p>
        <p><strong>Điện thoại:</strong> {invoice.seller.phone}</p>
      </div>

      {/* Buyer */}
      <div className="border border-black p-3 mb-4 text-[12px] space-y-0.5">
        <p><strong>Tên người mua hàng / đơn vị:</strong> {invoice.buyer.buyerName}</p>
        <p><strong>Địa chỉ:</strong> {invoice.buyer.buyerAddress}</p>
        <p><strong>Mã số thuế:</strong> {invoice.buyer.buyerTaxCode || '—'}</p>
        <p><strong>Email:</strong> {invoice.buyer.buyerEmail}</p>
        <p><strong>Hình thức thanh toán:</strong> {PAYMENT_LABEL[invoice.buyer.paymentMethod]}</p>
      </div>

      {/* Items table */}
      <table className="w-full border-collapse text-[11px] mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black px-2 py-1.5 text-center w-8">STT</th>
            <th className="border border-black px-2 py-1.5 text-left">Tên hàng hoá, dịch vụ</th>
            <th className="border border-black px-2 py-1.5 text-center w-12">ĐVT</th>
            <th className="border border-black px-2 py-1.5 text-center w-14">SL</th>
            <th className="border border-black px-2 py-1.5 text-right w-24">Đơn giá</th>
            <th className="border border-black px-2 py-1.5 text-right w-28">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map(item => (
            <tr key={item.no}>
              <td className="border border-black px-2 py-1.5 text-center">{item.no}</td>
              <td className="border border-black px-2 py-1.5">{item.name}</td>
              <td className="border border-black px-2 py-1.5 text-center">{item.unit}</td>
              <td className="border border-black px-2 py-1.5 text-center">{item.quantity}</td>
              <td className="border border-black px-2 py-1.5 text-right">{formatVnd(item.unitPrice)}</td>
              <td className="border border-black px-2 py-1.5 text-right">{formatVnd(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-4">
        <div className="w-72 text-[12px] space-y-1">
          <div className="flex justify-between">
            <span>Cộng tiền hàng:</span>
            <span className="font-semibold">{formatVnd(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Thuế suất GTGT: {invoice.vatRate * 100}%</span>
            <span className="font-semibold">{formatVnd(invoice.vatAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-black pt-1 font-bold text-[13px]">
            <span>Tổng tiền thanh toán:</span>
            <span>{formatVnd(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Amount in words */}
      <div className="border border-black px-3 py-2 text-[12px] mb-6">
        <span className="font-semibold">Số tiền bằng chữ: </span>
        <span className="italic">{invoice.totalInWords}</span>
      </div>

      {/* Signature area */}
      <div className="grid grid-cols-2 text-center text-[11px] mt-4">
        <div>
          <p className="font-semibold mb-1">Người mua hàng</p>
          <p className="text-gray-400 italic">(Ký, ghi rõ họ tên)</p>
          <div className="h-16" />
        </div>
        <div>
          <p className="font-semibold mb-1">Người bán hàng</p>
          <p className="text-gray-400 italic">(Ký, đóng dấu, ghi rõ họ tên)</p>
          <div className="h-16" />
        </div>
      </div>

      {/* Demo watermark — hidden when printing */}
      <div className="print:hidden mt-6 py-2 border border-dashed border-amber-400 text-center text-[11px] text-amber-600 bg-amber-50 rounded">
        ⚠ DEMO — Hoá đơn này không có giá trị pháp lý. Cần tích hợp phần mềm HĐĐT để xuất hoá đơn thật.
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/staff/invoice-preview.tsx
git commit -m "feat: printable Vietnamese GTGT invoice preview component"
```

---

### Task 6: Invoice page + route + payment page integration

**Files:**
- Create: `src/pages/staff-invoice.tsx`
- Modify: `src/App.tsx`
- Modify: `src/pages/staff-payment.tsx`

- [ ] **Step 1: Create `src/pages/staff-invoice.tsx`**

```tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useTableSessions } from '@/hooks/useTableSessions'
import { tables } from '@/data/tables'
import { buildInvoice } from '@/lib/invoice'
import InvoicePreview from '@/components/staff/invoice-preview'

export default function StaffInvoicePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessions, closeSession } = useTableSessions()

  const table = tables.find(t => t.id === id)
  const session = id ? sessions[id] : undefined

  if (!table || !session || !session.invoiceRequest) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center text-[#555]">
        Không tìm thấy dữ liệu hoá đơn.{' '}
        <button className="text-gold ml-2 underline" onClick={() => navigate('/staff')}>
          Quay lại
        </button>
      </div>
    )
  }

  const invoice = buildInvoice(session, session.invoiceRequest)

  function handleDone() {
    if (!id) return
    closeSession(id)
    navigate('/staff')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action bar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 flex items-center justify-between bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 sm:px-6 py-3 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/staff/table/${id}/payment`)}
            className="text-[12px] text-gold border border-[#C9A84C44] px-3 py-1 rounded tracking-[0.1em]"
          >
            ← Thanh toán
          </button>
          <span className="font-display text-[#f5f0e8] text-sm">Hoá đơn GTGT</span>
          <span className="text-[10px] text-[#555]">
            {invoice.symbol} · {invoice.number}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="text-[11px] tracking-[0.15em] bg-[#1e1a0e] border border-[#C9A84C44] text-gold px-4 py-2 rounded"
          >
            🖨 IN HOÁ ĐƠN
          </button>
          <button
            onClick={handleDone}
            className="text-[11px] tracking-[0.15em] bg-gold text-brand-dark font-bold px-4 py-2 rounded"
          >
            HOÀN TẤT →
          </button>
        </div>
      </div>

      {/* Invoice */}
      <div className="py-6 px-4 print:p-0 print:py-0">
        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add route to `src/App.tsx`**

Add import:
```ts
import StaffInvoicePage from '@/pages/staff-invoice'
```

Add route inside `<Routes>` after the payment route:
```tsx
<Route path="/staff/table/:id/invoice" element={<StaffInvoicePage />} />
```

- [ ] **Step 3: Update `src/pages/staff-payment.tsx`**

Add imports at the top:
```ts
import { useState } from 'react'
import InvoiceForm from '@/components/staff/invoice-form'
import { useTableSessions } from '@/hooks/useTableSessions'  // already imported — add setInvoiceRequest
```

The file already imports `useTableSessions`. Destructure `setInvoiceRequest` from the hook:
```ts
const { sessions, closeSession, setInvoiceRequest } = useTableSessions()
```

Add state for showing the invoice form:
```ts
const [showInvoiceForm, setShowInvoiceForm] = useState(false)
```

Update `handleConfirm` (current behaviour — no invoice):
```ts
function handleConfirm() {
  if (!id) return
  closeSession(id)
  navigate('/staff')
}
```

Add `handleInvoiceSubmit`:
```ts
function handleInvoiceSubmit(request: InvoiceRequest) {
  if (!id) return
  setInvoiceRequest(id, request)
  navigate(`/staff/table/${id}/invoice`)
}
```

Add `InvoiceForm` overlay and the "Xuất HĐ đỏ" button to the JSX.

Add `InvoiceForm` overlay just before `</div>` of the outer container:
```tsx
{showInvoiceForm && (
  <InvoiceForm
    onSubmit={handleInvoiceSubmit}
    onCancel={() => setShowInvoiceForm(false)}
  />
)}
```

Add the "Xuất HĐ đỏ" button in the payment panel column, below `<PaymentPanel ... />`:
```tsx
<div className="mt-6 pt-4 border-t border-[#2a2a2a]">
  <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-3">Hoá đơn đỏ</p>
  <button
    onClick={() => setShowInvoiceForm(true)}
    className="w-full border border-[#C9A84C44] text-gold text-[11px] tracking-[0.2em] py-2.5 rounded hover:bg-[#1e1a0e] transition-colors"
  >
    XUẤT HOÁ ĐƠN GTGT →
  </button>
  <p className="text-[9px] text-[#444] mt-2 text-center">Dành cho khách hàng doanh nghiệp</p>
</div>
```

The full updated `src/pages/staff-payment.tsx` incorporating all changes:

```tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTableSessions } from '@/hooks/useTableSessions'
import { tables } from '@/data/tables'
import PaymentPanel from '@/components/staff/payment-panel'
import InvoiceForm from '@/components/staff/invoice-form'
import { formatVnd } from '@/lib/format'
import type { InvoiceRequest } from '@/types/invoice'

export default function StaffPaymentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessions, closeSession, setInvoiceRequest } = useTableSessions()
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)

  const table = tables.find(t => t.id === id)
  const session = id ? sessions[id] : undefined

  if (!table || !session) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center text-[#555]">
        Không tìm thấy phiên bàn.{' '}
        <button className="text-gold ml-2 underline" onClick={() => navigate('/staff')}>
          Quay lại
        </button>
      </div>
    )
  }

  const total = session.submittedOrders.reduce(
    (s, o) => s + o.items.reduce((ss, i) => ss + i.priceNum * i.quantity, 0),
    0,
  )

  function handleConfirm() {
    if (!id) return
    closeSession(id)
    navigate('/staff')
  }

  function handleInvoiceSubmit(request: InvoiceRequest) {
    if (!id) return
    setInvoiceRequest(id, request)
    navigate(`/staff/table/${id}/invoice`)
  }

  return (
    <div className="min-h-screen bg-brand-darker text-[#f5f0e8]">
      {showInvoiceForm && (
        <InvoiceForm
          onSubmit={handleInvoiceSubmit}
          onCancel={() => setShowInvoiceForm(false)}
        />
      )}

      {/* Topbar */}
      <div className="flex items-center gap-2 sm:gap-3 bg-[#1a1a1a] border-b border-[#2a2a2a] px-3 sm:px-5 py-2.5">
        <button
          onClick={() => navigate(`/staff/table/${id}`)}
          className="text-[11px] sm:text-[12px] text-gold border border-[#C9A84C44] px-2 sm:px-3 py-1 rounded tracking-[0.1em] flex-shrink-0"
        >
          ←<span className="hidden sm:inline"> {table.label}</span>
        </button>
        <span className="font-display text-[#f5f0e8] text-sm sm:text-base">Thanh toán</span>
        <span className="text-[9px] tracking-[0.15em] text-[#e07b39] bg-[#e07b3915] border border-[#e07b3933] px-2 py-0.5 rounded flex-shrink-0">
          CHỜ THANH TOÁN
        </span>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-49px)]">
        {/* Bill summary */}
        <div className="border-b md:border-b-0 md:border-r border-[#2a2a2a] p-4 sm:p-6">
          <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-4">Tổng kết đơn hàng</p>
          <div className="space-y-4 mb-6">
            {session.submittedOrders.map((order, idx) => (
              <div key={order.id}>
                <p className="text-[9px] tracking-[0.15em] text-[#444] uppercase mb-1.5">
                  Đơn {idx + 1} · {new Date(order.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="space-y-1">
                  {order.items.map(item => (
                    <div key={item.menuItemId} className="flex justify-between items-baseline gap-3 py-1.5 border-b border-[#1a1a1a]">
                      <div className="min-w-0">
                        <p className="text-[12px] text-[#b0a898] truncate">{item.name}</p>
                        {item.note && <p className="text-[10px] text-[#C9A84C55] italic mt-0.5 truncate">{item.note}</p>}
                      </div>
                      <span className="text-[11px] text-[#555] flex-shrink-0">×{item.quantity}</span>
                      <span className="text-[12px] text-[#888] flex-shrink-0 min-w-[80px] text-right">
                        {formatVnd(item.priceNum * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-baseline pt-4 border-t border-[#C9A84C33]">
            <span className="text-[11px] tracking-[0.2em] text-[#888] uppercase">Tổng thanh toán</span>
            <span className="font-display text-2xl sm:text-3xl text-gold font-bold">{formatVnd(total)}</span>
          </div>
        </div>

        {/* Payment panel */}
        <div className="p-4 sm:p-6">
          <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-4">Phương thức thanh toán</p>
          <PaymentPanel total={total} onConfirm={handleConfirm} />

          <div className="mt-6 pt-4 border-t border-[#2a2a2a]">
            <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-3">Hoá đơn đỏ</p>
            <button
              onClick={() => setShowInvoiceForm(true)}
              className="w-full border border-[#C9A84C44] text-gold text-[11px] tracking-[0.2em] py-2.5 rounded hover:bg-[#1e1a0e] transition-colors"
            >
              XUẤT HOÁ ĐƠN GTGT →
            </button>
            <p className="text-[9px] text-[#444] mt-2 text-center">Dành cho khách hàng doanh nghiệp</p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run full check**

Run: `npm run check`
Expected: all pass (typecheck + lint + tests + build)

- [ ] **Step 5: Commit**

```bash
git add src/pages/staff-invoice.tsx src/App.tsx src/pages/staff-payment.tsx
git commit -m "feat: VAT invoice page, route, and payment page integration"
```

---

## Self-Review

**Spec coverage:**
- ✅ Buyer info collection (name, tax code, address, email, payment method)
- ✅ Invoice number generation (localStorage counter, 7-digit padded)
- ✅ Pre-VAT calculation (÷1.1 from inclusive price)
- ✅ Item merging across multiple submitted orders
- ✅ Number-to-words in Vietnamese
- ✅ Standard Vietnamese GTGT layout (ký hiệu, số, buyer/seller blocks, item table, totals, signatures)
- ✅ Print via `window.print()` with `print:hidden` for non-invoice elements
- ✅ Demo watermark visible on screen, hidden when printing
- ✅ Session closed from invoice page ("Hoàn tất"), not from payment confirm
- ✅ Responsive — form and page work on mobile

**Placeholder scan:** None found.

**Type consistency:**
- `InvoiceRequest` used consistently across hook, form, page, and lib
- `InvoiceData` returned by `buildInvoice`, consumed by `InvoicePreview`
- `TableSession.invoiceRequest?: InvoiceRequest` — optional, guarded in invoice page
