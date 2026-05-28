# Staff Order Route — Design Spec

**Date:** 2026-05-28  
**Status:** Approved  
**Scope:** MVP — nhân viên đặt món dùm cho khách, xem bill, thanh toán

---

## 1. Mục tiêu

Tạo route `/staff` dành riêng cho nhân viên The Terminal. Nhân viên ra bàn, dùng tablet/điện thoại để:
1. Chọn bàn từ sơ đồ
2. Gọi món cho khách, thêm ghi chú từng món
3. Xem bill realtime
4. Xử lý thanh toán (tiền mặt hoặc chuyển khoản ACB)
5. Đóng phiên bàn

Khách **không tự order** trong MVP này — đó là tính năng tương lai.

---

## 2. Routes

| Route | Component | Mô tả |
|---|---|---|
| `/staff` | `staff-floor-plan.tsx` | Sơ đồ bàn, tổng quan trạng thái |
| `/staff/table/:id` | `staff-table-order.tsx` | POS — menu + bill |
| `/staff/table/:id/payment` | `staff-payment.tsx` | Thanh toán |

> **Auth:** Chưa làm trong MVP. Route không được bảo vệ. TODO: thêm PIN 4 số trước khi vào `/staff`.

---

## 3. State & Persistence

Toàn bộ state được lưu vào `localStorage` với key `terminal_staff_sessions`.

### Data shape

```typescript
interface OrderItem {
  menuItemId: string
  name: string
  priceNum: number      // số nguyên VND, dùng để tính toán
  price: string         // "45.000đ", dùng để hiển thị
  quantity: number
  note: string          // ghi chú của nhân viên, mặc định ""
}

interface TableSession {
  tableId: string
  status: 'empty' | 'serving' | 'waiting_payment' | 'done'
  items: OrderItem[]
  openedAt: string      // ISO timestamp
}

// localStorage value: Record<tableId, TableSession>
```

### Hook

`src/hooks/useTableSessions.ts` — quản lý đọc/ghi localStorage, export:
- `sessions: Record<string, TableSession>`
- `openSession(tableId)` — chuyển bàn sang `serving`
- `addItem(tableId, item)` — thêm hoặc tăng qty nếu đã có
- `updateItem(tableId, menuItemId, patch: Partial<Pick<OrderItem, 'quantity' | 'note'>>)` — sửa qty hoặc note
- `removeItem(tableId, menuItemId)` — xoá món
- `requestPayment(tableId)` — chuyển sang `waiting_payment`
- `closeSession(tableId)` — chuyển sang `done`, xoá khỏi localStorage sau 1s

---

## 4. Mock data

`src/data/tables.ts` — 12 bàn:

```typescript
export interface Table {
  id: string          // "01" → "12"
  label: string       // "Bàn 01"
  seats: number       // số chỗ ngồi
  // vị trí trên sơ đồ (grid 4×3)
  gridCol: number     // 1–4
  gridRow: number     // 1–3
}
```

Menu tái sử dụng `src/data/menu.ts` hiện có.

---

## 5. Màn hình chi tiết

### 5.1 Floor Plan (`/staff`)

**Layout:**
- Topbar: logo, giờ hiện tại, badge "NHÂN VIÊN"
- Stats row: tổng bàn / đang phục vụ / chờ thanh toán / trống
- Grid 4×3 bàn, mỗi card hiển thị số bàn + trạng thái + tóm tắt (số món, tổng tiền nếu có)

**Màu trạng thái:**
| Trạng thái | Màu | Border |
|---|---|---|
| `empty` | `#1c1c1c` | `#2e2e2e` |
| `serving` | `#1e1a0e` | `#C9A84C55` (gold) |
| `waiting_payment` | `#1e120a` | `#e07b3955` (orange) |

**Hành động khi click bàn:**
- `empty` → gọi `openSession()` rồi navigate `/staff/table/:id`
- `serving` → navigate `/staff/table/:id`
- `waiting_payment` → navigate `/staff/table/:id/payment`

---

### 5.2 Table Order (`/staff/table/:id`)

**Layout chia đôi (desktop/tablet landscape):**

**Cột trái — Menu:**
- Tab danh mục: THỨC UỐNG / ĂN SÁNG / MÓN CHÍNH / TRÁNG MIỆNG
- Grid 2 cột item card
- Mỗi card: tên, mô tả, giá, nút `+`
- Badge số lượng vàng góc trên phải nếu món đã có trong order

**Cột phải — Bill:**
- Header: "Order hiện tại · N món"
- Danh sách `OrderItem`:
  - Tên món
  - Điều chỉnh số lượng: nút `−` / số / nút `+`
  - Giá dòng
  - Icon thùng rác (xoá món) — hover đổi cam
  - Input ghi chú: luôn hiển thị dạng `<input>` có thể sửa trực tiếp; khi có nội dung, chữ đổi vàng nhạt
- Footer: đếm món, tổng tiền, nút **THANH TOÁN →**

**Topbar:** Back về floor plan, tên bàn, trạng thái, giờ mở bàn.

---

### 5.3 Payment (`/staff/table/:id/payment`)

**Layout chia đôi:**

**Cột trái — Tổng kết:**
- Danh sách món (tên, ghi chú nếu có, qty, giá)
- Tổng tiền lớn (Playfair Display, gold)

**Cột phải — Thanh toán:**

**Tab TIỀN MẶT:**
- Hiển thị số tiền cần thu
- 4 preset nhanh — **tính động từ tổng bill**: preset đầu = số tròn gần nhất trên tổng (ví dụ bill 345k → [350k, 400k, 500k, 1.000k]; bill 180k → [200k, 250k, 300k, 500k]) — click để chọn (highlight vàng)
- Input nhập tay đồng bộ với preset: chọn preset → input điền theo; sửa input → preset bỏ active
- Dòng "Tiền thừa trả khách" — tự tính, hiển thị xanh lá khi dương
- Nút **XÁC NHẬN ĐÃ THU TIỀN**

**Tab CHUYỂN KHOẢN:**
- QR ACB tĩnh + số tài khoản + số tiền + mã bàn
- Nút **XÁC NHẬN ĐÃ NHẬN TIỀN** (nhân viên bấm sau khi kiểm tra app ngân hàng)
- TODO: thay bằng ACB webhook khi có backend

**Sau khi xác nhận (cả 2 tab):**
- Gọi `closeSession(tableId)`
- Redirect về `/staff`
- Bàn về trạng thái `empty`

---

## 6. Files sẽ tạo

```
src/pages/staff-floor-plan.tsx
src/pages/staff-table-order.tsx
src/pages/staff-payment.tsx
src/components/staff/floor-plan.tsx
src/components/staff/table-card.tsx
src/components/staff/menu-panel.tsx
src/components/staff/order-summary.tsx
src/components/staff/payment-panel.tsx
src/hooks/useTableSessions.ts
src/data/tables.ts
```

**Tái sử dụng:** `src/data/menu.ts`, `tailwind.config.ts` (gold/brand-dark/brand-darker/warm-white), `react-router-dom` (đã có).

---

## 7. Visual design

- Nền: `brand-darker` (`#0d0d0d`) / `brand-dark` (`#1a1a1a`)
- Accent chính: `gold` (`#C9A84C`)
- Trạng thái chờ thanh toán: `#e07b39` (orange)
- Font heading: Playfair Display (`font-display`)
- Font UI: Inter (`font-sans`)
- Không có border-radius lớn — dùng `rounded` (4px) tối đa, consistent với Museum page

---

## 8. Ngoài phạm vi MVP

- Auth / PIN bảo vệ route
- QR động theo phiên bàn
- Khách tự order qua QR
- Tích hợp ACB webhook tự động
- Voucher, điểm tích lũy
- In phiếu bếp / hóa đơn
- Sơ đồ bàn có thể kéo thả / chỉnh vị trí
- Báo cáo doanh thu
