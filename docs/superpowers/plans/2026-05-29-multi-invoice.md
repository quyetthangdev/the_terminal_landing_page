# Multi-Invoice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add hoá đơn tạm (draft receipt) and hoá đơn thường (regular receipt) alongside the existing hoá đơn đỏ (VAT invoice), with correct session-clearing behaviour — only real invoices clear the session, draft never does.

**Architecture:** A new `receipt-preview.tsx` component renders a simple receipt layout (restaurant header, items, total) reused for both tạm and thường. A new `staff-receipt.tsx` page reads `?draft=true` to switch between draft mode (no session clear) and final mode (session cleared on "Hoàn tất"). The order page gets an "HĐ tạm" button; the payment page gets all three invoice type buttons. The existing VAT invoice flow is unchanged.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v3 (`print:` variants), react-router-dom v7 (`useSearchParams`). No new dependencies.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/staff/receipt-preview.tsx` | Create | Simple receipt layout (tạm + thường) |
| `src/pages/staff-receipt.tsx` | Create | Receipt page — draft vs final via `?draft=true` |
| `src/App.tsx` | Modify | Add `/staff/table/:id/receipt` route |
| `src/pages/staff-table-order.tsx` | Modify | Add "HĐ tạm" button to topbar |
| `src/pages/staff-payment.tsx` | Modify | Replace 1 invoice button with 3 |

---

### Task 1: Receipt preview component

**Files:**
- Create: `src/components/staff/receipt-preview.tsx`

No unit tests — layout-only component.

- [ ] **Step 1: Create `src/components/staff/receipt-preview.tsx`**

```tsx
import type { SubmittedOrder } from '@/hooks/useTableSessions'
import { formatVnd } from '@/lib/format'
import { seller } from '@/data/seller'

interface Props {
  tableLabel: string
  issuedAt: string   // ISO datetime string
  orders: SubmittedOrder[]
  isDraft: boolean
}

export default function ReceiptPreview({ tableLabel, issuedAt, orders, isDraft }: Props) {
  const [yyyy, mm, dd] = issuedAt.slice(0, 10).split('-')
  const time = new Date(issuedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

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
  const lines = Object.values(merged)
  const total = lines.reduce((s, l) => s + l.priceNum * l.quantity, 0)

  return (
    <div className="bg-white text-black font-sans text-sm leading-relaxed max-w-sm mx-auto p-6 print:p-4 print:shadow-none shadow-lg">
      {/* Restaurant header */}
      <div className="text-center mb-4">
        <p className="text-[16px] font-bold tracking-widest">{seller.name}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">{seller.address}</p>
        <p className="text-[10px] text-gray-500">{seller.phone}</p>
      </div>

      {/* Title */}
      <div className="text-center border-t border-b border-black py-1.5 mb-3">
        <p className="text-[14px] font-bold tracking-wider">
          {isDraft ? 'HOÁ ĐƠN TẠM' : 'HOÁ ĐƠN'}
        </p>
      </div>

      {/* Meta */}
      <div className="flex justify-between text-[11px] mb-3">
        <span>Bàn: <strong>{tableLabel}</strong></span>
        <span>{dd}/{mm}/{yyyy} {time}</span>
      </div>

      {/* Items */}
      <table className="w-full text-[11px] mb-3">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left py-1 font-semibold">Tên món</th>
            <th className="text-center py-1 font-semibold w-8">SL</th>
            <th className="text-right py-1 font-semibold w-24">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="py-1">{line.name}</td>
              <td className="text-center py-1">{line.quantity}</td>
              <td className="text-right py-1">{formatVnd(line.priceNum * line.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className="flex justify-between font-bold text-[13px] border-t border-black pt-2 mb-1">
        <span>Tổng:</span>
        <span>{formatVnd(total)}</span>
      </div>
      <p className="text-[10px] text-gray-400 text-right mb-4">(Đã bao gồm VAT 10%)</p>

      {/* Footer */}
      <p className="text-center text-[11px] text-gray-500">Cảm ơn quý khách!</p>

      {/* Draft watermark — hidden when printing */}
      {isDraft && (
        <div className="print:hidden mt-4 py-1.5 border border-dashed border-gray-400 text-center text-[10px] text-gray-400 rounded">
          PHIẾU TẠM — chưa thanh toán
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/staff/receipt-preview.tsx
git commit -m "feat: receipt preview component for draft and regular receipts"
```

---

### Task 2: Receipt page + route

**Files:**
- Create: `src/pages/staff-receipt.tsx`
- Modify: `src/App.tsx`

No unit tests — page component.

- [ ] **Step 1: Create `src/pages/staff-receipt.tsx`**

```tsx
import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTableSessions } from '@/hooks/useTableSessions'
import { tables } from '@/data/tables'
import ReceiptPreview from '@/components/staff/receipt-preview'

export default function StaffReceiptPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isDraft = searchParams.get('draft') === 'true'
  const { sessions, closeSession } = useTableSessions()
  // Capture issuedAt once on mount so it doesn't change on re-renders
  const [issuedAt] = useState(() => new Date().toISOString())

  const table = tables.find(t => t.id === id)
  const session = id ? sessions[id] : undefined

  if (!table || !session || session.submittedOrders.length === 0) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center text-[#555]">
        Không có đơn hàng để xuất hoá đơn.{' '}
        <button className="text-gold ml-2 underline" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    )
  }

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
            onClick={() => isDraft ? navigate(-1) : navigate(`/staff/table/${id}/payment`)}
            className="text-[12px] text-gold border border-[#C9A84C44] px-3 py-1 rounded tracking-[0.1em]"
          >
            ← {isDraft ? 'Quay lại' : 'Thanh toán'}
          </button>
          <span className="font-display text-[#f5f0e8] text-sm">
            {isDraft ? 'Hoá đơn tạm' : 'Hoá đơn'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="text-[11px] tracking-[0.15em] bg-[#1e1a0e] border border-[#C9A84C44] text-gold px-4 py-2 rounded"
          >
            IN HOÁ ĐƠN
          </button>
          {!isDraft && (
            <button
              onClick={handleDone}
              className="text-[11px] tracking-[0.15em] bg-gold text-brand-dark font-bold px-4 py-2 rounded"
            >
              HOÀN TẤT →
            </button>
          )}
        </div>
      </div>

      {/* Receipt */}
      <div className="py-6 px-4 print:p-0 print:py-0">
        <ReceiptPreview
          tableLabel={table.label}
          issuedAt={issuedAt}
          orders={session.submittedOrders}
          isDraft={isDraft}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add route to `src/App.tsx`**

Add import after `StaffInvoicePage`:
```ts
import StaffReceiptPage from '@/pages/staff-receipt'
```

Add route after the invoice route inside `<Routes>`:
```tsx
<Route path="/staff/table/:id/receipt" element={<StaffReceiptPage />} />
```

The full updated `src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MuseumPage from '@/pages/MuseumPage'
import GlassPage from '@/pages/GlassPage'
import StaffFloorPlanPage from '@/pages/staff-floor-plan'
import StaffTableOrderPage from '@/pages/staff-table-order'
import StaffPaymentPage from '@/pages/staff-payment'
import StaffInvoicePage from '@/pages/staff-invoice'
import StaffReceiptPage from '@/pages/staff-receipt'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/staff" replace />} />
        <Route path="/museum" element={<MuseumPage />} />
        <Route path="/glass" element={<GlassPage />} />
        <Route path="/staff" element={<StaffFloorPlanPage />} />
        <Route path="/staff/table/:id" element={<StaffTableOrderPage />} />
        <Route path="/staff/table/:id/payment" element={<StaffPaymentPage />} />
        <Route path="/staff/table/:id/invoice" element={<StaffInvoicePage />} />
        <Route path="/staff/table/:id/receipt" element={<StaffReceiptPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Run full check**

Run: `npm run check`
Expected: all pass (typecheck + lint + tests + build)

- [ ] **Step 4: Commit**

```bash
git add src/pages/staff-receipt.tsx src/App.tsx
git commit -m "feat: receipt page and route for draft/final receipts"
```

---

### Task 3: Order page — "HĐ tạm" button

**Files:**
- Modify: `src/pages/staff-table-order.tsx`

No new tests required — button is a conditional navigation link, existing test coverage for the page is sufficient.

- [ ] **Step 1: Update `src/pages/staff-table-order.tsx`**

The current topbar right side is:
```tsx
<span className="text-[11px] text-[#666] flex-shrink-0 hidden sm:block">
  {new Date(session.openedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
</span>
```

Replace it with a `<div>` that includes both the "HĐ tạm" button and the time:
```tsx
<div className="flex items-center gap-2 flex-shrink-0">
  <button
    onClick={() => navigate(`/staff/table/${id}/receipt?draft=true`)}
    disabled={session.submittedOrders.length === 0}
    className="text-[10px] sm:text-[11px] text-[#888] border border-[#333] px-2 sm:px-3 py-1 rounded tracking-[0.1em] disabled:opacity-40 disabled:cursor-not-allowed"
  >
    HĐ tạm
  </button>
  <span className="text-[11px] text-[#666] hidden sm:block">
    {new Date(session.openedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
  </span>
</div>
```

The full updated topbar section (replace only the topbar `<div>` in `StaffTableOrderPage`):
```tsx
{/* Topbar */}
<div className="flex items-center justify-between bg-[#1a1a1a] border-b border-[#2a2a2a] px-3 sm:px-5 py-2.5 flex-shrink-0 gap-2">
  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
    <button
      onClick={() => navigate('/staff')}
      className="text-[11px] sm:text-[12px] text-gold border border-[#C9A84C44] px-2 sm:px-3 py-1 rounded tracking-[0.1em] flex-shrink-0"
    >
      ←
      <span className="hidden sm:inline"> Sơ đồ bàn</span>
    </button>
    <span className="font-display text-[#f5f0e8] text-sm sm:text-base truncate">{table.label}</span>
    <span className="text-[9px] tracking-[0.15em] text-gold bg-[#C9A84C15] border border-[#C9A84C33] px-2 py-0.5 rounded flex-shrink-0">
      {statusLabel[session.status] ?? session.status.toUpperCase()}
    </span>
  </div>
  <div className="flex items-center gap-2 flex-shrink-0">
    <button
      onClick={() => navigate(`/staff/table/${id}/receipt?draft=true`)}
      disabled={session.submittedOrders.length === 0}
      className="text-[10px] sm:text-[11px] text-[#888] border border-[#333] px-2 sm:px-3 py-1 rounded tracking-[0.1em] disabled:opacity-40 disabled:cursor-not-allowed"
    >
      HĐ tạm
    </button>
    <span className="text-[11px] text-[#666] hidden sm:block">
      {new Date(session.openedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
    </span>
  </div>
</div>
```

- [ ] **Step 2: Run full check**

Run: `npm run check`
Expected: all pass

- [ ] **Step 3: Commit**

```bash
git add src/pages/staff-table-order.tsx
git commit -m "feat: add draft receipt button to order page topbar"
```

---

### Task 4: Payment page — 3-button invoice section

**Files:**
- Modify: `src/pages/staff-payment.tsx`

No new tests required — UI change only, existing tests cover hook behavior.

- [ ] **Step 1: Update the invoice section in `src/pages/staff-payment.tsx`**

Find the existing invoice section (currently the last block inside the payment panel `<div className="p-4 sm:p-6">`):

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

Replace with:
```tsx
<div className="mt-6 pt-4 border-t border-[#2a2a2a]">
  <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-3">Hoá đơn</p>
  <div className="space-y-2">
    <button
      onClick={() => navigate(`/staff/table/${id}/receipt?draft=true`)}
      className="w-full border border-[#333] text-[#888] text-[11px] tracking-[0.2em] py-2.5 rounded hover:bg-[#181818] transition-colors"
    >
      XUẤT HOÁ ĐƠN TẠM
    </button>
    <button
      onClick={() => navigate(`/staff/table/${id}/receipt`)}
      className="w-full border border-[#C9A84C44] text-gold text-[11px] tracking-[0.2em] py-2.5 rounded hover:bg-[#1e1a0e] transition-colors"
    >
      XUẤT HOÁ ĐƠN THƯỜNG
    </button>
    <button
      onClick={() => setShowInvoiceForm(true)}
      className="w-full border border-[#C9A84C44] text-gold text-[11px] tracking-[0.2em] py-2.5 rounded hover:bg-[#1e1a0e] transition-colors"
    >
      XUẤT HOÁ ĐƠN GTGT →
    </button>
  </div>
  <p className="text-[9px] text-[#444] mt-2 text-center">GTGT dành cho khách hàng doanh nghiệp</p>
</div>
```

- [ ] **Step 2: Run full check**

Run: `npm run check`
Expected: all pass (typecheck + lint + 82 tests + build)

- [ ] **Step 3: Commit**

```bash
git add src/pages/staff-payment.tsx
git commit -m "feat: 3-button invoice section on payment page (tạm / thường / GTGT)"
```

---

## Self-Review

**Spec coverage:**
- ✅ `receipt-preview.tsx` — simple receipt layout, shared by tạm + thường
- ✅ `staff-receipt.tsx` — reads `?draft=true`, draft has no "Hoàn tất", final closes session
- ✅ Route `/staff/table/:id/receipt` added to `App.tsx`
- ✅ Order page: "HĐ tạm" button, disabled when `submittedOrders.length === 0`
- ✅ Payment page: 3 buttons — tạm, thường, GTGT
- ✅ Session clearing: only "Hoàn tất" on receipt final or invoice page; tạm never clears
- ✅ Existing VAT invoice flow unchanged

**Placeholder scan:** None found.

**Type consistency:**
- `ReceiptPreview` receives `SubmittedOrder[]` from `@/hooks/useTableSessions` — type already exported
- `StaffReceiptPage` passes `session.submittedOrders` (same type) — consistent
- `isDraft: boolean` used identically in page and preview component
