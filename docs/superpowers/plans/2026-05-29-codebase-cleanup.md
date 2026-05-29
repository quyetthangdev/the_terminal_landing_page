# Codebase Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all structural issues from the audit: extract shared utilities, remove dead code, move types to the right location, standardize file naming, and add missing component tests.

**Architecture:** Seven sequential tasks ordered by dependency — types move first (later tasks import from the new location), then shared logic extraction, dead code removal, naming, and finally new tests. Each task is self-contained and safe to roll back independently.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v3, Vitest + Testing Library

---

### Task 1: Move session types to `src/types/session.ts`

`OrderItem`, `SubmittedOrder`, `TableSession` are defined inside a hook file. Types belong in `src/types/`. The hook will re-export them so all 15 existing importers keep working without changes.

**Files:**
- Create: `src/types/session.ts`
- Modify: `src/hooks/useTableSessions.ts:1-26`

- [ ] **Step 1: Create `src/types/session.ts`**

```typescript
import type { InvoiceRequest } from '@/types/invoice'

export interface OrderItem {
  menuItemId: string
  name: string
  priceNum: number
  price: string
  quantity: number
  note: string
}

export interface SubmittedOrder {
  id: string
  items: OrderItem[]
  submittedAt: string
}

export interface TableSession {
  tableId: string
  status: 'empty' | 'serving' | 'waiting_payment' | 'done'
  pendingItems: OrderItem[]
  submittedOrders: SubmittedOrder[]
  openedAt: string
  invoiceRequest?: InvoiceRequest
}
```

- [ ] **Step 2: Update top of `src/hooks/useTableSessions.ts`**

Replace lines 1–26 (the import + three interface definitions) with:

```typescript
import { useState, useCallback } from 'react'
import type { OrderItem, SubmittedOrder, TableSession } from '@/types/session'

// Re-export so all existing imports from this hook continue to work
export type { OrderItem, SubmittedOrder, TableSession } from '@/types/session'
```

Keep all hook function code (`STORAGE_KEY`, `load`, `save`, `useTableSessions`, etc.) unchanged below this block.

- [ ] **Step 3: Run type check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run tests**

```bash
npm run test
```

Expected: all passing.

- [ ] **Step 5: Commit**

```bash
git add src/types/session.ts src/hooks/useTableSessions.ts
git commit -m "refactor: move session types to src/types/session.ts, re-export from hook"
```

---

### Task 2: Extract `mergeOrderItems` utility

The logic merging `SubmittedOrder[]` items by `menuItemId` (accumulating quantity) is duplicated between `receipt-preview.tsx` (lines 19–30) and `invoice.ts` (lines 63–84). Extract to `src/lib/orders.ts`.

**Files:**
- Create: `src/lib/orders.ts`
- Create: `src/__tests__/orders.test.ts`
- Modify: `src/components/staff/receipt-preview.tsx`
- Modify: `src/lib/invoice.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/orders.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { mergeOrderItems } from '@/lib/orders'
import type { SubmittedOrder } from '@/types/session'

describe('mergeOrderItems', () => {
  it('returns empty array for empty input', () => {
    expect(mergeOrderItems([])).toEqual([])
  })

  it('returns items from a single order', () => {
    const orders: SubmittedOrder[] = [{
      id: 'o1',
      submittedAt: '',
      items: [{ menuItemId: 'a', name: 'Item A', priceNum: 100, price: '100đ', quantity: 2, note: '' }],
    }]
    expect(mergeOrderItems(orders)).toEqual([
      { menuItemId: 'a', name: 'Item A', priceNum: 100, quantity: 2 },
    ])
  })

  it('merges duplicate menuItemId across multiple orders', () => {
    const orders: SubmittedOrder[] = [
      { id: 'o1', submittedAt: '', items: [{ menuItemId: 'a', name: 'A', priceNum: 100, price: '100đ', quantity: 1, note: '' }] },
      { id: 'o2', submittedAt: '', items: [{ menuItemId: 'a', name: 'A', priceNum: 100, price: '100đ', quantity: 2, note: '' }] },
    ]
    const result = mergeOrderItems(orders)
    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(3)
    expect(result[0].priceNum).toBe(100)
  })

  it('keeps distinct items with different menuItemIds', () => {
    const orders: SubmittedOrder[] = [{
      id: 'o1',
      submittedAt: '',
      items: [
        { menuItemId: 'a', name: 'A', priceNum: 100, price: '100đ', quantity: 1, note: '' },
        { menuItemId: 'b', name: 'B', priceNum: 200, price: '200đ', quantity: 1, note: '' },
      ],
    }]
    expect(mergeOrderItems(orders)).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/orders.test.ts
```

Expected: FAIL — `mergeOrderItems` not found.

- [ ] **Step 3: Create `src/lib/orders.ts`**

```typescript
import type { SubmittedOrder } from '@/types/session'

export interface MergedItem {
  menuItemId: string
  name: string
  priceNum: number
  quantity: number
}

export function mergeOrderItems(orders: SubmittedOrder[]): MergedItem[] {
  const merged: Record<string, MergedItem> = {}
  for (const order of orders) {
    for (const item of order.items) {
      if (merged[item.menuItemId]) {
        merged[item.menuItemId].quantity += item.quantity
      } else {
        merged[item.menuItemId] = {
          menuItemId: item.menuItemId,
          name: item.name,
          priceNum: item.priceNum,
          quantity: item.quantity,
        }
      }
    }
  }
  return Object.values(merged)
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/orders.test.ts
```

Expected: 4 tests PASS.

- [ ] **Step 5: Update `src/components/staff/receipt-preview.tsx`**

Add import after existing imports at top of file:
```typescript
import { mergeOrderItems } from '@/lib/orders'
```

Replace the merge block (lines 19–31 — the comment through the `total` calculation):

Old:
```typescript
  // Merge same menuItemId across all orders
  const merged: Record<string, { name: string; quantity: number; priceNum: number }> = {}
  for (const order of orders) {
    for (const item of order.items) {
      if (merged[item.menuItemId]) {
        merged[item.menuItemId].quantity += item.quantity
      } else {
        merged[item.menuItemId] = { name: item.name, quantity: item.quantity, priceNum: item.priceNum }
      }
    }
  }
  const lines = Object.entries(merged).map(([menuItemId, v]) => ({ menuItemId, ...v }))
  const total = lines.reduce((s, l) => s + l.priceNum * l.quantity, 0)
```

New:
```typescript
  const lines = mergeOrderItems(orders)
  const total = lines.reduce((s, l) => s + l.priceNum * l.quantity, 0)
```

- [ ] **Step 6: Update `src/lib/invoice.ts`**

Add import after existing imports at top of file:
```typescript
import { mergeOrderItems } from '@/lib/orders'
```

In `buildInvoice`, replace lines 63–96 (from `const allItems` through `const total`):

Old:
```typescript
export function buildInvoice(session: TableSession, request: InvoiceRequest): InvoiceData {
  const allItems = session.submittedOrders.flatMap(o => o.items)

  const merged: Record<string, InvoiceLineItem> = {}
  let seq = 1
  for (const item of allItems) {
    if (merged[item.menuItemId]) {
      merged[item.menuItemId].quantity += item.quantity
      merged[item.menuItemId].amount = Math.round(
        (merged[item.menuItemId].quantity * item.priceNum) / VAT_INCLUSIVE,
      )
    } else {
      merged[item.menuItemId] = {
        no: seq++,
        name: item.name,
        unit: 'phần',
        quantity: item.quantity,
        unitPrice: Math.round(item.priceNum / VAT_INCLUSIVE),
        amount: Math.round((item.priceNum * item.quantity) / VAT_INCLUSIVE),
      }
    }
  }

  const total = allItems.reduce((s, i) => s + i.priceNum * i.quantity, 0)
```

New:
```typescript
export function buildInvoice(session: TableSession, request: InvoiceRequest): InvoiceData {
  const merged = mergeOrderItems(session.submittedOrders)

  const items: InvoiceLineItem[] = merged.map((item, i) => ({
    no: i + 1,
    name: item.name,
    unit: 'phần',
    quantity: item.quantity,
    unitPrice: Math.round(item.priceNum / VAT_INCLUSIVE),
    amount: Math.round((item.priceNum * item.quantity) / VAT_INCLUSIVE),
  }))

  const total = merged.reduce((s, i) => s + i.priceNum * i.quantity, 0)
```

Also replace `items: Object.values(merged)` in the return statement with `items`:
```typescript
  return {
    number: generateInvoiceNumber(),
    symbol: seller.invoiceSymbol,
    issuedAt: new Date().toISOString(),
    seller,
    buyer: request,
    items,
    subtotal,
    vatRate: 0.1,
    vatAmount,
    total,
    totalInWords: numberToWords(total),
  }
```

- [ ] **Step 7: Run full test suite**

```bash
npm run test
```

Expected: all passing. The existing `invoice.test.ts` covers `buildInvoice` behavior end-to-end.

- [ ] **Step 8: Commit**

```bash
git add src/lib/orders.ts src/__tests__/orders.test.ts src/components/staff/receipt-preview.tsx src/lib/invoice.ts
git commit -m "refactor: extract mergeOrderItems utility, eliminate duplicate merge logic"
```

---

### Task 3: Remove unused `parseAmount` export

`parseAmount` is exported from `src/lib/format.ts` but imported nowhere in the codebase.

**Files:**
- Modify: `src/lib/format.ts`

- [ ] **Step 1: Confirm it is unused**

```bash
grep -r "parseAmount" src/ --include="*.ts" --include="*.tsx"
```

Expected: only one result — the definition in `src/lib/format.ts`. No imports elsewhere.

- [ ] **Step 2: Delete the function**

Final content of `src/lib/format.ts`:
```typescript
/** 300000 → "300.000" */
export function formatAmount(n: number): string {
  return n.toLocaleString('vi-VN')
}

/** 300000 → "300.000đ" */
export function formatVnd(n: number): string {
  return formatAmount(n) + 'đ'
}
```

- [ ] **Step 3: Run type check + tests**

```bash
npx tsc --noEmit && npm run test
```

Expected: no errors, all tests passing.

- [ ] **Step 4: Commit**

```bash
git add src/lib/format.ts
git commit -m "refactor: remove unused parseAmount export"
```

---

### Task 4: Rename `MuseumPage.tsx` and `GlassPage.tsx` to kebab-case

All staff page files use kebab-case. `MuseumPage.tsx` and `GlassPage.tsx` are outliers. Rename them and update the `App.tsx` import.

**Files:**
- Rename: `src/pages/MuseumPage.tsx` → `src/pages/museum-page.tsx`
- Rename: `src/pages/GlassPage.tsx` → `src/pages/glass-page.tsx`
- Modify: `src/App.tsx:2-3`

- [ ] **Step 1: Rename via `git mv`**

```bash
git mv src/pages/MuseumPage.tsx src/pages/museum-page.tsx
git mv src/pages/GlassPage.tsx src/pages/glass-page.tsx
```

- [ ] **Step 2: Update imports in `src/App.tsx`**

Change:
```typescript
import MuseumPage from '@/pages/MuseumPage'
import GlassPage from '@/pages/GlassPage'
```

To:
```typescript
import MuseumPage from '@/pages/museum-page'
import GlassPage from '@/pages/glass-page'
```

- [ ] **Step 3: Run type check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: rename MuseumPage.tsx and GlassPage.tsx to kebab-case"
```

---

### Task 5: Tests for `ReceiptPreview`

`ReceiptPreview` has no tests. It is the core receipt rendering component used in both the dialog overlay and the print page.

**Files:**
- Create: `src/__tests__/receipt-preview.test.tsx`

- [ ] **Step 1: Write the tests**

Create `src/__tests__/receipt-preview.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ReceiptPreview from '@/components/staff/receipt-preview'
import type { SubmittedOrder } from '@/types/session'

const ISSUED_AT = '2026-05-29T10:00:00.000Z'

const singleOrder: SubmittedOrder[] = [
  {
    id: 'o1',
    submittedAt: ISSUED_AT,
    items: [
      { menuItemId: 'd1', name: 'Terminal Espresso', priceNum: 45000, price: '45.000đ', quantity: 2, note: '' },
      { menuItemId: 'm1', name: 'Pasta Carbonara', priceNum: 145000, price: '145.000đ', quantity: 1, note: '' },
    ],
  },
]

describe('ReceiptPreview', () => {
  it('shows restaurant name', () => {
    render(<ReceiptPreview tableLabel="Bàn 01" issuedAt={ISSUED_AT} orders={singleOrder} isDraft={false} />)
    expect(screen.getByText('THE TERMINAL')).toBeInTheDocument()
  })

  it('shows "HOÁ ĐƠN" title for final receipt', () => {
    render(<ReceiptPreview tableLabel="Bàn 01" issuedAt={ISSUED_AT} orders={singleOrder} isDraft={false} />)
    expect(screen.getByText('HOÁ ĐƠN')).toBeInTheDocument()
  })

  it('shows "HOÁ ĐƠN TẠM" title for draft', () => {
    render(<ReceiptPreview tableLabel="Bàn 01" issuedAt={ISSUED_AT} orders={singleOrder} isDraft={true} />)
    expect(screen.getByText('HOÁ ĐƠN TẠM')).toBeInTheDocument()
  })

  it('shows draft watermark only when isDraft=true', () => {
    const { rerender } = render(
      <ReceiptPreview tableLabel="Bàn 01" issuedAt={ISSUED_AT} orders={singleOrder} isDraft={true} />
    )
    expect(screen.getByText(/PHIẾU TẠM/i)).toBeInTheDocument()

    rerender(<ReceiptPreview tableLabel="Bàn 01" issuedAt={ISSUED_AT} orders={singleOrder} isDraft={false} />)
    expect(screen.queryByText(/PHIẾU TẠM/i)).not.toBeInTheDocument()
  })

  it('shows table label', () => {
    render(<ReceiptPreview tableLabel="Bàn 05" issuedAt={ISSUED_AT} orders={singleOrder} isDraft={false} />)
    expect(screen.getByText('Bàn 05')).toBeInTheDocument()
  })

  it('shows correct total (2×45000 + 1×145000 = 235000đ)', () => {
    render(<ReceiptPreview tableLabel="Bàn 01" issuedAt={ISSUED_AT} orders={singleOrder} isDraft={false} />)
    expect(screen.getByText('235.000đ')).toBeInTheDocument()
  })

  it('merges same menuItemId across two orders', () => {
    const twoOrders: SubmittedOrder[] = [
      { id: 'o1', submittedAt: '', items: [{ menuItemId: 'd1', name: 'Espresso', priceNum: 45000, price: '45.000đ', quantity: 1, note: '' }] },
      { id: 'o2', submittedAt: '', items: [{ menuItemId: 'd1', name: 'Espresso', priceNum: 45000, price: '45.000đ', quantity: 2, note: '' }] },
    ]
    render(<ReceiptPreview tableLabel="Bàn 01" issuedAt={ISSUED_AT} orders={twoOrders} isDraft={false} />)
    // Only one row rendered for Espresso
    expect(screen.getAllByText('Espresso')).toHaveLength(1)
    // Total: 3 × 45000 = 135000đ
    expect(screen.getByText('135.000đ')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run src/__tests__/receipt-preview.test.tsx
```

Expected: 7 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/receipt-preview.test.tsx
git commit -m "test: add ReceiptPreview unit tests"
```

---

### Task 6: Tests for `MenuPanel`

`MenuPanel` has no tests. It handles category filtering and add-item behavior, including showing a quantity badge for items already in the pending order.

**Files:**
- Create: `src/__tests__/menu-panel.test.tsx`

- [ ] **Step 1: Write the tests**

Create `src/__tests__/menu-panel.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import MenuPanel from '@/components/staff/menu-panel'
import { menuItems, categories } from '@/data/menu'
import type { OrderItem } from '@/types/session'

const defaultProps = {
  pendingItems: [] as OrderItem[],
  onAdd: vi.fn(),
}

describe('MenuPanel', () => {
  it('renders all category buttons', () => {
    render(<MenuPanel {...defaultProps} />)
    for (const cat of categories) {
      expect(screen.getByText(cat.label)).toBeInTheDocument()
    }
  })

  it('shows items for the default active category', () => {
    render(<MenuPanel {...defaultProps} />)
    const firstCat = categories[0]
    const firstItem = menuItems.find(m => m.category === firstCat.id)!
    expect(screen.getAllByText(firstItem.name).length).toBeGreaterThan(0)
  })

  it('calls onAdd with correct item data when "+" clicked', async () => {
    const onAdd = vi.fn()
    render(<MenuPanel {...defaultProps} onAdd={onAdd} />)
    const firstCat = categories[0]
    const firstItem = menuItems.find(m => m.category === firstCat.id)!
    const addBtns = screen.getAllByRole('button', { name: `Thêm ${firstItem.name}` })
    await userEvent.click(addBtns[0])
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ menuItemId: firstItem.id, name: firstItem.name })
    )
  })

  it('shows quantity badge when item is in pendingItems', () => {
    const firstCat = categories[0]
    const firstItem = menuItems.find(m => m.category === firstCat.id)!
    const pendingItems: OrderItem[] = [
      { menuItemId: firstItem.id, name: firstItem.name, priceNum: 0, price: '', quantity: 3, note: '' },
    ]
    render(<MenuPanel pendingItems={pendingItems} onAdd={vi.fn()} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('switches to second category on tab click and shows its items', async () => {
    render(<MenuPanel {...defaultProps} />)
    const secondCat = categories[1]
    await userEvent.click(screen.getByText(secondCat.label))
    const firstItemInSecondCat = menuItems.find(m => m.category === secondCat.id)!
    expect(screen.getAllByText(firstItemInSecondCat.name).length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run src/__tests__/menu-panel.test.tsx
```

Expected: 5 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/menu-panel.test.tsx
git commit -m "test: add MenuPanel unit tests"
```

---

### Task 7: Tests for `ReceiptDialog`

`ReceiptDialog` has no tests. Key behaviors: renders receipt content, closes on backdrop and × button click, does not close when clicking inside, shows "HOÀN TẤT" only when `onDone` is provided, opens correct URL on "IN".

**Files:**
- Create: `src/__tests__/receipt-dialog.test.tsx`

- [ ] **Step 1: Write the tests**

Create `src/__tests__/receipt-dialog.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ReceiptDialog from '@/components/staff/receipt-dialog'
import type { SubmittedOrder } from '@/types/session'

const orders: SubmittedOrder[] = [
  {
    id: 'o1',
    submittedAt: new Date().toISOString(),
    items: [{ menuItemId: 'd1', name: 'Terminal Espresso', priceNum: 45000, price: '45.000đ', quantity: 1, note: '' }],
  },
]

const defaultProps = {
  tableId: '01',
  tableLabel: 'Bàn 01',
  orders,
  isDraft: false,
  onClose: vi.fn(),
}

describe('ReceiptDialog', () => {
  it('renders receipt content inside the dialog', () => {
    render(<ReceiptDialog {...defaultProps} />)
    expect(screen.getByText('THE TERMINAL')).toBeInTheDocument()
  })

  it('shows "Hoá đơn" in topbar for final receipt', () => {
    render(<ReceiptDialog {...defaultProps} isDraft={false} />)
    expect(screen.getByText('Hoá đơn')).toBeInTheDocument()
  })

  it('shows "Hoá đơn tạm" in topbar for draft', () => {
    render(<ReceiptDialog {...defaultProps} isDraft={true} />)
    expect(screen.getByText('Hoá đơn tạm')).toBeInTheDocument()
  })

  it('calls onClose when × button clicked', async () => {
    const onClose = vi.fn()
    render(<ReceiptDialog {...defaultProps} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop clicked', async () => {
    const onClose = vi.fn()
    const { container } = render(<ReceiptDialog {...defaultProps} onClose={onClose} />)
    // The backdrop is the outermost fixed div
    await userEvent.click(container.firstChild as HTMLElement)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does NOT call onClose when clicking inside dialog panel', async () => {
    const onClose = vi.fn()
    render(<ReceiptDialog {...defaultProps} onClose={onClose} />)
    await userEvent.click(screen.getByText('THE TERMINAL'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('shows "HOÀN TẤT" button only when onDone is provided', () => {
    const { rerender } = render(<ReceiptDialog {...defaultProps} />)
    expect(screen.queryByRole('button', { name: /HOÀN TẤT/i })).not.toBeInTheDocument()

    rerender(<ReceiptDialog {...defaultProps} onDone={vi.fn()} />)
    expect(screen.getByRole('button', { name: /HOÀN TẤT/i })).toBeInTheDocument()
  })

  it('calls onDone when "HOÀN TẤT" clicked', async () => {
    const onDone = vi.fn()
    render(<ReceiptDialog {...defaultProps} onDone={onDone} />)
    await userEvent.click(screen.getByRole('button', { name: /HOÀN TẤT/i }))
    expect(onDone).toHaveBeenCalledOnce()
  })

  it('opens receipt URL in new tab when "IN" clicked', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<ReceiptDialog {...defaultProps} tableId="01" isDraft={false} />)
    await userEvent.click(screen.getByRole('button', { name: 'IN' }))
    expect(openSpy).toHaveBeenCalledWith('/staff/table/01/receipt', '_blank')
    openSpy.mockRestore()
  })

  it('appends ?draft=true to receipt URL when isDraft=true', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<ReceiptDialog {...defaultProps} tableId="01" isDraft={true} />)
    await userEvent.click(screen.getByRole('button', { name: 'IN' }))
    expect(openSpy).toHaveBeenCalledWith('/staff/table/01/receipt?draft=true', '_blank')
    openSpy.mockRestore()
  })
})
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run src/__tests__/receipt-dialog.test.tsx
```

Expected: 10 tests PASS.

- [ ] **Step 3: Run full suite one final time**

```bash
npm run test
```

Expected: all tests across all files passing.

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/receipt-dialog.test.tsx
git commit -m "test: add ReceiptDialog unit tests"
```
