# Multi-Invoice Design

**Goal:** Support three invoice types — tạm (provisional), thường (regular receipt), đỏ (VAT/GTGT) — with independent print flows and correct session-clearing behaviour.

**Architecture:** A new `receipt-preview.tsx` component handles the simple receipt layout shared by tạm and thường. A new `staff-receipt.tsx` page uses a `?draft=true` query param to switch between draft (no session clear) and final (session clears on "Hoàn tất"). The existing VAT invoice flow (`staff-invoice.tsx`) is unchanged.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v3 (`print:` variants), react-router-dom v7 (`useSearchParams`). No new dependencies.

---

## Invoice Types

| Type | Label | Buyer info | Session clear | Available from |
|------|-------|-----------|--------------|----------------|
| Tạm | HOÁ ĐƠN TẠM | None | No | Order page + Payment page |
| Thường | HOÁ ĐƠN | None | Yes — "Hoàn tất" button | Payment page |
| Đỏ (existing) | Hoá đơn GTGT | Tax code, address, email | Yes — "Hoàn tất" button (unchanged) | Payment page |

---

## Routes

| Route | Page | Notes |
|-------|------|-------|
| `/staff/table/:id/receipt?draft=true` | `StaffReceiptPage` | Draft mode — no "Hoàn tất" |
| `/staff/table/:id/receipt` | `StaffReceiptPage` | Final mode — "Hoàn tất" closes session |
| `/staff/table/:id/invoice` | `StaffInvoicePage` | Unchanged |

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/staff/receipt-preview.tsx` | Create | Simple receipt layout — restaurant info, table, items, total |
| `src/pages/staff-receipt.tsx` | Create | Receipt page — reads `?draft` param, handles print + optional session close |
| `src/App.tsx` | Modify | Add `/staff/table/:id/receipt` route |
| `src/pages/staff-table-order.tsx` | Modify | Add "HĐ tạm" button (enabled when `submittedOrders.length > 0`) |
| `src/pages/staff-payment.tsx` | Modify | Replace single invoice button with 3-button invoice section |

---

## Component Design

### `receipt-preview.tsx`

Props:
```ts
interface Props {
  tableLabel: string
  issuedAt: string       // ISO datetime string
  orders: SubmittedOrder[]
  isDraft: boolean
}
```

Layout (white background, black text, max-w-sm receipt-sized):
- Header: THE TERMINAL name + address + phone, centred
- Divider
- Title: "HOÁ ĐƠN TẠM" (draft) or "HOÁ ĐƠN" (final)
- Divider
- Meta row: Bàn + date/time
- Items: STT, tên món, SL, thành tiền (no pre-VAT calculation — show full price)
- Divider + Tổng + "(Đã bao gồm VAT 10%)"
- Footer: "Cảm ơn quý khách!"
- Draft only: `print:hidden` watermark "PHIẾU TẠM — chưa thanh toán"

No signature area. No buyer info. No VAT breakdown. No `formatVnd` for unit prices column (only total per line + grand total).

### `staff-receipt.tsx`

- Reads `id` from `useParams`, `draft` from `useSearchParams` (`searchParams.get('draft') === 'true'`)
- Guards: no session or no submittedOrders → error with back link
- Action bar (`print:hidden`):
  - Draft: `← Quay lại` + `IN HOÁ ĐƠN`
  - Final: `← Thanh toán` + `IN HOÁ ĐƠN` + `HOÀN TẤT →`
- "HOÀN TẤT →" calls `closeSession(id)` then navigates to `/staff`
- Navigate back: draft → `-1` (back), final → `/staff/table/:id/payment`

---

## UI Changes

### Order page (`staff-table-order.tsx`)

Add "HĐ tạm" button to the existing action bar (topbar area). Placement: after existing buttons, before/near the "Thanh toán" button.

- Enabled only when `session.submittedOrders.length > 0`
- Disabled state: `opacity-50 cursor-not-allowed`
- Navigates to `/staff/table/${id}/receipt?draft=true`

### Payment page (`staff-payment.tsx`)

Replace the current single "XUẤT HOÁ ĐƠN GTGT →" button section with three buttons stacked vertically:

```
XUẤT HOÁ ĐƠN TẠM        (no session clear, back = payment page)
XUẤT HOÁ ĐƠN THƯỜNG     (session clear on "Hoàn tất")
XUẤT HOÁ ĐƠN GTGT →     (opens InvoiceForm modal — unchanged)
```

All three under the same "Hoá đơn đỏ" section header, renamed to "Hoá đơn".

---

## Session Clearing

| Action | Clears session? |
|--------|----------------|
| Print tạm (order page or payment page) | No |
| Print thường → "HOÀN TẤT" | Yes |
| Print đỏ → "HOÀN TẤT" | Yes (unchanged) |
| Payment page "Xác nhận thanh toán" | Yes (unchanged) |

User can export both thường and đỏ before confirming. Neither invoice page auto-clears — only the "HOÀN TẤT" button does.

---

## Testing

No unit tests for layout components (`receipt-preview.tsx`, `staff-receipt.tsx` are visual pages).

Test for `staff-table-order.tsx` changes: the "HĐ tạm" button is already tested indirectly via existing order page tests. No new tests required — the button is a simple nav link conditional on `submittedOrders.length`.
