# Staff Order Route — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tạo route `/staff` cho nhân viên chọn bàn, gọi món, xem bill realtime, và thanh toán (tiền mặt / chuyển khoản ACB).

**Architecture:** Ba route lồng nhau (`/staff`, `/staff/table/:id`, `/staff/table/:id/payment`) dùng react-router-dom. State toàn bộ lưu localStorage qua hook `useTableSessions`. Components tách theo trách nhiệm: floor-plan, menu-panel, order-summary, payment-panel.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, react-router-dom v7, Vitest + Testing Library, localStorage.

---

## File Map

| File | Vai trò |
|---|---|
| `src/data/tables.ts` | Mock 12 bàn + `generatePresets()` |
| `src/hooks/useTableSessions.ts` | Đọc/ghi localStorage, export actions |
| `src/components/staff/table-card.tsx` | Card 1 bàn với trạng thái + màu |
| `src/components/staff/floor-plan.tsx` | Grid 4×3 + stats row |
| `src/components/staff/menu-panel.tsx` | Tab danh mục + grid món + nút `+` |
| `src/components/staff/order-summary.tsx` | Bill list: qty, note, xoá, tổng tiền |
| `src/components/staff/payment-panel.tsx` | Tab tiền mặt / chuyển khoản |
| `src/pages/staff-floor-plan.tsx` | Route `/staff` |
| `src/pages/staff-table-order.tsx` | Route `/staff/table/:id` |
| `src/pages/staff-payment.tsx` | Route `/staff/table/:id/payment` |
| `src/App.tsx` | Thêm 3 routes mới |
| `src/__tests__/useTableSessions.test.ts` | Unit tests hook |
| `src/__tests__/staff-table-card.test.tsx` | Component tests |
| `src/__tests__/staff-order-summary.test.tsx` | Component tests |
| `src/__tests__/staff-payment-panel.test.tsx` | Component tests |

---

## Task 1: Data layer — tables + preset helper

**Files:**
- Create: `src/data/tables.ts`
- Create: `src/__tests__/staff-presets.test.ts`

- [ ] **Step 1.1: Viết test cho `generatePresets`**

```ts
// src/__tests__/staff-presets.test.ts
import { describe, it, expect } from 'vitest'
import { generatePresets } from '@/data/tables'

describe('generatePresets', () => {
  it('rounds up to nearest 50k and generates 4 options (small bill)', () => {
    expect(generatePresets(180_000)).toEqual([200_000, 250_000, 300_000, 500_000])
  })

  it('rounds up to nearest 50k and generates 4 options (mid bill)', () => {
    expect(generatePresets(345_000)).toEqual([350_000, 400_000, 500_000, 1_000_000])
  })

  it('handles exact multiple of 50k', () => {
    const [first] = generatePresets(200_000)
    expect(first).toBe(200_000)
  })

  it('always returns exactly 4 values', () => {
    expect(generatePresets(99_000)).toHaveLength(4)
    expect(generatePresets(1_200_000)).toHaveLength(4)
  })
})
```

- [ ] **Step 1.2: Chạy test để xác nhận fail**

```bash
npm run test -- staff-presets
```
Expected: FAIL — "Cannot find module '@/data/tables'"

- [ ] **Step 1.3: Tạo `src/data/tables.ts`**

```ts
export interface Table {
  id: string
  label: string
  seats: number
  gridCol: number  // 1–4
  gridRow: number  // 1–3
}

export const tables: Table[] = [
  { id: '01', label: 'Bàn 01', seats: 4, gridCol: 1, gridRow: 1 },
  { id: '02', label: 'Bàn 02', seats: 2, gridCol: 2, gridRow: 1 },
  { id: '03', label: 'Bàn 03', seats: 4, gridCol: 3, gridRow: 1 },
  { id: '04', label: 'Bàn 04', seats: 6, gridCol: 4, gridRow: 1 },
  { id: '05', label: 'Bàn 05', seats: 4, gridCol: 1, gridRow: 2 },
  { id: '06', label: 'Bàn 06', seats: 2, gridCol: 2, gridRow: 2 },
  { id: '07', label: 'Bàn 07', seats: 4, gridCol: 3, gridRow: 2 },
  { id: '08', label: 'Bàn 08', seats: 4, gridCol: 4, gridRow: 2 },
  { id: '09', label: 'Bàn 09', seats: 6, gridCol: 1, gridRow: 3 },
  { id: '10', label: 'Bàn 10', seats: 4, gridCol: 2, gridRow: 3 },
  { id: '11', label: 'Bàn 11', seats: 2, gridCol: 3, gridRow: 3 },
  { id: '12', label: 'Bàn 12', seats: 8, gridCol: 4, gridRow: 3 },
]

/** Sinh 4 mệnh giá preset cho tiền mặt dựa trên tổng bill */
export function generatePresets(total: number): number[] {
  const step = 50_000
  const first = Math.ceil(total / step) * step
  const second = first + step
  const third = Math.ceil((second + 1) / 100_000) * 100_000
  const fourth = total <= 250_000 ? 500_000 : 1_000_000
  return [first, second, third, fourth]
}
```

- [ ] **Step 1.4: Chạy lại test**

```bash
npm run test -- staff-presets
```
Expected: 4 PASS

- [ ] **Step 1.5: Commit**

```bash
git add src/data/tables.ts src/__tests__/staff-presets.test.ts
git commit -m "feat: add tables data and generatePresets helper"
```

---

## Task 2: Hook `useTableSessions`

**Files:**
- Create: `src/hooks/useTableSessions.ts`
- Create: `src/__tests__/useTableSessions.test.ts`

- [ ] **Step 2.1: Viết tests**

```ts
// src/__tests__/useTableSessions.test.ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useTableSessions } from '@/hooks/useTableSessions'

beforeEach(() => localStorage.clear())

describe('useTableSessions', () => {
  it('starts with empty sessions', () => {
    const { result } = renderHook(() => useTableSessions())
    expect(result.current.sessions).toEqual({})
  })

  it('openSession creates a serving session', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('01'))
    expect(result.current.sessions['01'].status).toBe('serving')
    expect(result.current.sessions['01'].items).toEqual([])
  })

  it('addItem adds a new item with qty 1', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('01'))
    act(() => result.current.addItem('01', {
      menuItemId: 'd1', name: 'Espresso', priceNum: 45000, price: '45.000đ',
    }))
    const items = result.current.sessions['01'].items
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(1)
    expect(items[0].note).toBe('')
  })

  it('addItem increments quantity for existing item', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('01'))
    const item = { menuItemId: 'd1', name: 'Espresso', priceNum: 45000, price: '45.000đ' }
    act(() => result.current.addItem('01', item))
    act(() => result.current.addItem('01', item))
    expect(result.current.sessions['01'].items[0].quantity).toBe(2)
  })

  it('updateItem patches note', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('01'))
    act(() => result.current.addItem('01', {
      menuItemId: 'd1', name: 'Espresso', priceNum: 45000, price: '45.000đ',
    }))
    act(() => result.current.updateItem('01', 'd1', { note: 'ít đường' }))
    expect(result.current.sessions['01'].items[0].note).toBe('ít đường')
  })

  it('removeItem deletes the item', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('01'))
    act(() => result.current.addItem('01', {
      menuItemId: 'd1', name: 'Espresso', priceNum: 45000, price: '45.000đ',
    }))
    act(() => result.current.removeItem('01', 'd1'))
    expect(result.current.sessions['01'].items).toHaveLength(0)
  })

  it('requestPayment sets status to waiting_payment', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('01'))
    act(() => result.current.requestPayment('01'))
    expect(result.current.sessions['01'].status).toBe('waiting_payment')
  })

  it('closeSession removes the table from sessions', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('01'))
    act(() => result.current.closeSession('01'))
    expect(result.current.sessions['01']).toBeUndefined()
  })

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('02'))
    const stored = JSON.parse(localStorage.getItem('terminal_staff_sessions')!)
    expect(stored['02'].status).toBe('serving')
  })

  it('loads from localStorage on mount', () => {
    localStorage.setItem('terminal_staff_sessions', JSON.stringify({
      '03': { tableId: '03', status: 'serving', items: [], openedAt: '2026-01-01T00:00:00.000Z' }
    }))
    const { result } = renderHook(() => useTableSessions())
    expect(result.current.sessions['03'].status).toBe('serving')
  })
})
```

- [ ] **Step 2.2: Chạy test để xác nhận fail**

```bash
npm run test -- useTableSessions
```
Expected: FAIL — "Cannot find module '@/hooks/useTableSessions'"

- [ ] **Step 2.3: Tạo `src/hooks/useTableSessions.ts`**

```ts
import { useState, useCallback } from 'react'

export interface OrderItem {
  menuItemId: string
  name: string
  priceNum: number
  price: string
  quantity: number
  note: string
}

export interface TableSession {
  tableId: string
  status: 'empty' | 'serving' | 'waiting_payment' | 'done'
  items: OrderItem[]
  openedAt: string
}

const STORAGE_KEY = 'terminal_staff_sessions'

function load(): Record<string, TableSession> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function save(sessions: Record<string, TableSession>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export function useTableSessions() {
  const [sessions, setSessions] = useState<Record<string, TableSession>>(load)

  const update = useCallback(
    (fn: (prev: Record<string, TableSession>) => Record<string, TableSession>) => {
      setSessions(prev => {
        const next = fn(prev)
        save(next)
        return next
      })
    },
    [],
  )

  const openSession = useCallback(
    (tableId: string) => {
      update(prev => ({
        ...prev,
        [tableId]: { tableId, status: 'serving', items: [], openedAt: new Date().toISOString() },
      }))
    },
    [update],
  )

  const addItem = useCallback(
    (tableId: string, item: Omit<OrderItem, 'quantity' | 'note'>) => {
      update(prev => {
        const session = prev[tableId]
        if (!session) return prev
        const idx = session.items.findIndex(i => i.menuItemId === item.menuItemId)
        const items =
          idx >= 0
            ? session.items.map((i, n) => (n === idx ? { ...i, quantity: i.quantity + 1 } : i))
            : [...session.items, { ...item, quantity: 1, note: '' }]
        return { ...prev, [tableId]: { ...session, items } }
      })
    },
    [update],
  )

  const updateItem = useCallback(
    (tableId: string, menuItemId: string, patch: Partial<Pick<OrderItem, 'quantity' | 'note'>>) => {
      update(prev => {
        const session = prev[tableId]
        if (!session) return prev
        const items = session.items.map(i => (i.menuItemId === menuItemId ? { ...i, ...patch } : i))
        return { ...prev, [tableId]: { ...session, items } }
      })
    },
    [update],
  )

  const removeItem = useCallback(
    (tableId: string, menuItemId: string) => {
      update(prev => {
        const session = prev[tableId]
        if (!session) return prev
        return { ...prev, [tableId]: { ...session, items: session.items.filter(i => i.menuItemId !== menuItemId) } }
      })
    },
    [update],
  )

  const requestPayment = useCallback(
    (tableId: string) => {
      update(prev => {
        const session = prev[tableId]
        if (!session) return prev
        return { ...prev, [tableId]: { ...session, status: 'waiting_payment' } }
      })
    },
    [update],
  )

  const closeSession = useCallback(
    (tableId: string) => {
      update(prev => {
        const next = { ...prev }
        delete next[tableId]
        return next
      })
    },
    [update],
  )

  return { sessions, openSession, addItem, updateItem, removeItem, requestPayment, closeSession }
}
```

- [ ] **Step 2.4: Chạy lại test**

```bash
npm run test -- useTableSessions
```
Expected: 10 PASS

- [ ] **Step 2.5: Commit**

```bash
git add src/hooks/useTableSessions.ts src/__tests__/useTableSessions.test.ts
git commit -m "feat: add useTableSessions hook with localStorage persistence"
```

---

## Task 3: Component `table-card`

**Files:**
- Create: `src/components/staff/table-card.tsx`
- Create: `src/__tests__/staff-table-card.test.tsx`

- [ ] **Step 3.1: Viết tests**

```tsx
// src/__tests__/staff-table-card.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import TableCard from '@/components/staff/table-card'
import type { Table } from '@/data/tables'
import type { TableSession } from '@/hooks/useTableSessions'

const table: Table = { id: '01', label: 'Bàn 01', seats: 4, gridCol: 1, gridRow: 1 }

describe('TableCard', () => {
  it('renders table label', () => {
    render(<TableCard table={table} session={undefined} onClick={vi.fn()} />)
    expect(screen.getByText('Bàn 01')).toBeInTheDocument()
  })

  it('shows "Trống" and seats when no session', () => {
    render(<TableCard table={table} session={undefined} onClick={vi.fn()} />)
    expect(screen.getByText('Trống')).toBeInTheDocument()
    expect(screen.getByText('4 chỗ')).toBeInTheDocument()
  })

  it('shows "Đang phục vụ" for serving session', () => {
    const session: TableSession = {
      tableId: '01', status: 'serving', items: [
        { menuItemId: 'd1', name: 'Espresso', priceNum: 45000, price: '45.000đ', quantity: 2, note: '' }
      ], openedAt: '',
    }
    render(<TableCard table={table} session={session} onClick={vi.fn()} />)
    expect(screen.getByText('Đang phục vụ')).toBeInTheDocument()
    expect(screen.getByText('1 món · 90.000đ')).toBeInTheDocument()
  })

  it('shows "Chờ thanh toán" for waiting_payment session', () => {
    const session: TableSession = {
      tableId: '01', status: 'waiting_payment', items: [], openedAt: '',
    }
    render(<TableCard table={table} session={session} onClick={vi.fn()} />)
    expect(screen.getByText('Chờ thanh toán')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<TableCard table={table} session={undefined} onClick={onClick} />)
    await userEvent.click(screen.getByText('Bàn 01'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 3.2: Chạy test để xác nhận fail**

```bash
npm run test -- staff-table-card
```
Expected: FAIL

- [ ] **Step 3.3: Tạo `src/components/staff/table-card.tsx`**

```tsx
import type { Table } from '@/data/tables'
import type { TableSession, OrderItem } from '@/hooks/useTableSessions'

function totalFrom(items: OrderItem[]) {
  return items.reduce((s, i) => s + i.priceNum * i.quantity, 0)
}

function formatVnd(n: number) {
  return n.toLocaleString('vi-VN') + 'đ'
}

const statusConfig = {
  empty: {
    label: 'Trống',
    bg: 'bg-[#1c1c1c]',
    border: 'border-[#2e2e2e]',
    dot: 'bg-[#333]',
    text: 'text-[#444]',
  },
  serving: {
    label: 'Đang phục vụ',
    bg: 'bg-[#1e1a0e]',
    border: 'border-[#C9A84C55]',
    dot: 'bg-gold shadow-[0_0_6px_#C9A84C88]',
    text: 'text-gold',
  },
  waiting_payment: {
    label: 'Chờ thanh toán',
    bg: 'bg-[#1e120a]',
    border: 'border-[#e07b3955]',
    dot: 'bg-[#e07b39] shadow-[0_0_6px_#e07b3988]',
    text: 'text-[#e07b39]',
  },
  done: {
    label: 'Hoàn tất',
    bg: 'bg-[#1c1c1c]',
    border: 'border-[#2e2e2e]',
    dot: 'bg-[#333]',
    text: 'text-[#444]',
  },
}

interface Props {
  table: Table
  session: TableSession | undefined
  onClick: () => void
}

export default function TableCard({ table, session, onClick }: Props) {
  const status = session?.status ?? 'empty'
  const cfg = statusConfig[status]
  const total = session ? totalFrom(session.items) : 0
  const itemCount = session ? session.items.reduce((s, i) => s + i.quantity, 0) : 0

  return (
    <button
      onClick={onClick}
      className={`relative rounded p-3 border text-left transition-transform hover:-translate-y-px ${cfg.bg} ${cfg.border}`}
    >
      <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${cfg.dot}`} />
      <p className={`font-display text-xl font-bold mb-1 ${cfg.text}`}>{table.label}</p>
      <p className={`text-[9px] tracking-[0.2em] uppercase ${cfg.text} opacity-70`}>{cfg.label}</p>
      <p className="text-[11px] text-[#555] mt-1">
        {status === 'empty'
          ? `${table.seats} chỗ`
          : `${itemCount} món · ${formatVnd(total)}`}
      </p>
    </button>
  )
}
```

- [ ] **Step 3.4: Chạy lại test**

```bash
npm run test -- staff-table-card
```
Expected: 5 PASS

- [ ] **Step 3.5: Commit**

```bash
git add src/components/staff/table-card.tsx src/__tests__/staff-table-card.test.tsx
git commit -m "feat: add TableCard component with status colours"
```

---

## Task 4: Component `order-summary`

**Files:**
- Create: `src/components/staff/order-summary.tsx`
- Create: `src/__tests__/staff-order-summary.test.tsx`

- [ ] **Step 4.1: Viết tests**

```tsx
// src/__tests__/staff-order-summary.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import OrderSummary from '@/components/staff/order-summary'
import type { OrderItem } from '@/hooks/useTableSessions'

const items: OrderItem[] = [
  { menuItemId: 'd1', name: 'Terminal Espresso', priceNum: 45000, price: '45.000đ', quantity: 2, note: 'ít đường' },
  { menuItemId: 'm1', name: 'Pasta Carbonara', priceNum: 145000, price: '145.000đ', quantity: 1, note: '' },
]

describe('OrderSummary', () => {
  it('renders all item names', () => {
    render(<OrderSummary items={items} onUpdateItem={vi.fn()} onRemoveItem={vi.fn()} onPay={vi.fn()} />)
    expect(screen.getByText('Terminal Espresso')).toBeInTheDocument()
    expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument()
  })

  it('shows total correctly (2×45k + 1×145k = 235k)', () => {
    render(<OrderSummary items={items} onUpdateItem={vi.fn()} onRemoveItem={vi.fn()} onPay={vi.fn()} />)
    expect(screen.getByText('235.000đ')).toBeInTheDocument()
  })

  it('shows existing note value', () => {
    render(<OrderSummary items={items} onUpdateItem={vi.fn()} onRemoveItem={vi.fn()} onPay={vi.fn()} />)
    expect(screen.getByDisplayValue('ít đường')).toBeInTheDocument()
  })

  it('calls onUpdateItem with new note on input change', async () => {
    const onUpdateItem = vi.fn()
    render(<OrderSummary items={items} onUpdateItem={onUpdateItem} onRemoveItem={vi.fn()} onPay={vi.fn()} />)
    const inputs = screen.getAllByPlaceholderText('Ghi chú cho món này…')
    await userEvent.clear(inputs[0])
    await userEvent.type(inputs[0], 'thêm đá')
    expect(onUpdateItem).toHaveBeenLastCalledWith('d1', { note: 'thêm đá' })
  })

  it('calls onRemoveItem when trash button clicked', async () => {
    const onRemoveItem = vi.fn()
    render(<OrderSummary items={items} onUpdateItem={vi.fn()} onRemoveItem={onRemoveItem} onPay={vi.fn()} />)
    const trashBtns = screen.getAllByRole('button', { name: /xoá/i })
    await userEvent.click(trashBtns[0])
    expect(onRemoveItem).toHaveBeenCalledWith('d1')
  })

  it('calls onPay when THANH TOÁN button clicked', async () => {
    const onPay = vi.fn()
    render(<OrderSummary items={items} onUpdateItem={vi.fn()} onRemoveItem={vi.fn()} onPay={onPay} />)
    await userEvent.click(screen.getByRole('button', { name: /thanh toán/i }))
    expect(onPay).toHaveBeenCalledOnce()
  })

  it('shows empty state when no items', () => {
    render(<OrderSummary items={[]} onUpdateItem={vi.fn()} onRemoveItem={vi.fn()} onPay={vi.fn()} />)
    expect(screen.getByText(/chưa có món/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 4.2: Chạy test để xác nhận fail**

```bash
npm run test -- staff-order-summary
```
Expected: FAIL

- [ ] **Step 4.3: Tạo `src/components/staff/order-summary.tsx`**

```tsx
import type { OrderItem } from '@/hooks/useTableSessions'

function formatVnd(n: number) {
  return n.toLocaleString('vi-VN') + 'đ'
}

interface Props {
  items: OrderItem[]
  onUpdateItem: (menuItemId: string, patch: Partial<Pick<OrderItem, 'quantity' | 'note'>>) => void
  onRemoveItem: (menuItemId: string) => void
  onPay: () => void
}

export default function OrderSummary({ items, onUpdateItem, onRemoveItem, onPay }: Props) {
  const total = items.reduce((s, i) => s + i.priceNum * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="flex flex-col h-full bg-[#111]">
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase">
          Order hiện tại{count > 0 ? ` · ${count} món` : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 && (
          <p className="text-center text-[#444] text-xs py-10">Chưa có món nào</p>
        )}
        {items.map(item => (
          <div key={item.menuItemId} className="bg-[#181818] border border-[#222] rounded p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex-1 text-[12px] text-[#c8bfaf]">{item.name}</span>
              <div className="flex items-center gap-1">
                <button
                  className="w-5 h-5 rounded bg-[#2a2a2a] text-[#888] text-sm flex items-center justify-center"
                  onClick={() => onUpdateItem(item.menuItemId, { quantity: Math.max(1, item.quantity - 1) })}
                >−</button>
                <span className="text-[13px] font-semibold text-[#e8e0d0] min-w-[16px] text-center">{item.quantity}</span>
                <button
                  className="w-5 h-5 rounded bg-[#2a2a2a] text-[#888] text-sm flex items-center justify-center"
                  onClick={() => onUpdateItem(item.menuItemId, { quantity: item.quantity + 1 })}
                >+</button>
              </div>
              <span className="text-[12px] text-gold font-semibold min-w-[70px] text-right">
                {formatVnd(item.priceNum * item.quantity)}
              </span>
              <button
                aria-label="Xoá món"
                className="text-[#444] hover:text-[#e07b39] transition-colors"
                onClick={() => onRemoveItem(item.menuItemId)}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2,4 14,4"/><path d="M6 4V2h4v2"/>
                  <rect x="3" y="4" width="10" height="10" rx="1"/>
                  <line x1="6" y1="7" x2="6" y2="11"/><line x1="10" y1="7" x2="10" y2="11"/>
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 9.5l1-3L8.5 1 11 3.5 5.5 9l-3 1z"/><line x1="7" y1="2.5" x2="9.5" y2="5"/>
              </svg>
              <input
                className={`flex-1 bg-transparent border-b text-[11px] pb-0.5 outline-none transition-colors placeholder:text-[#333] ${
                  item.note ? 'border-[#C9A84C33] text-[#C9A84C88]' : 'border-[#2a2a2a] text-[#888]'
                } focus:border-[#C9A84C55] focus:text-[#b0a898]`}
                placeholder="Ghi chú cho món này…"
                value={item.note}
                onChange={e => onUpdateItem(item.menuItemId, { note: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#2a2a2a] p-4 space-y-3">
        <div className="flex justify-between text-xs text-[#555]">
          <span>{count} món</span>
          <span>{formatVnd(total)}</span>
        </div>
        <div className="flex justify-between items-baseline pt-2 border-t border-[#2a2a2a]">
          <span className="text-[11px] tracking-[0.15em] text-[#888] uppercase">Tổng cộng</span>
          <span className="font-display text-2xl text-gold font-bold">{formatVnd(total)}</span>
        </div>
        <button
          disabled={items.length === 0}
          onClick={onPay}
          className="w-full bg-gold text-brand-dark text-[11px] font-bold tracking-[0.25em] py-3 rounded disabled:opacity-30"
        >
          THANH TOÁN →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4.4: Chạy lại test**

```bash
npm run test -- staff-order-summary
```
Expected: 6 PASS

- [ ] **Step 4.5: Commit**

```bash
git add src/components/staff/order-summary.tsx src/__tests__/staff-order-summary.test.tsx
git commit -m "feat: add OrderSummary component with note editing and trash delete"
```

---

## Task 5: Component `payment-panel`

**Files:**
- Create: `src/components/staff/payment-panel.tsx`
- Create: `src/__tests__/staff-payment-panel.test.tsx`

- [ ] **Step 5.1: Viết tests**

```tsx
// src/__tests__/staff-payment-panel.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import PaymentPanel from '@/components/staff/payment-panel'

describe('PaymentPanel', () => {
  it('shows total amount', () => {
    render(<PaymentPanel total={345000} onConfirm={vi.fn()} />)
    expect(screen.getByText('345.000đ')).toBeInTheDocument()
  })

  it('renders 4 cash preset buttons', () => {
    render(<PaymentPanel total={345000} onConfirm={vi.fn()} />)
    expect(screen.getByRole('button', { name: '350k' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '400k' })).toBeInTheDocument()
  })

  it('clicking preset fills input and shows change', async () => {
    render(<PaymentPanel total={345000} onConfirm={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: '400k' }))
    expect(screen.getByDisplayValue('400000')).toBeInTheDocument()
    expect(screen.getByText('55.000đ')).toBeInTheDocument()
  })

  it('typing in input updates change', async () => {
    render(<PaymentPanel total={345000} onConfirm={vi.fn()} />)
    const input = screen.getByPlaceholderText('Nhập số tiền khác…')
    await userEvent.clear(input)
    await userEvent.type(input, '500000')
    expect(screen.getByText('155.000đ')).toBeInTheDocument()
  })

  it('calls onConfirm when cash confirm button clicked', async () => {
    const onConfirm = vi.fn()
    render(<PaymentPanel total={345000} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: '400k' }))
    await userEvent.click(screen.getByRole('button', { name: /xác nhận đã thu tiền/i }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('switches to transfer tab', async () => {
    render(<PaymentPanel total={345000} onConfirm={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /chuyển khoản/i }))
    expect(screen.getByRole('button', { name: /xác nhận đã nhận tiền/i })).toBeInTheDocument()
  })

  it('calls onConfirm from transfer tab', async () => {
    const onConfirm = vi.fn()
    render(<PaymentPanel total={345000} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: /chuyển khoản/i }))
    await userEvent.click(screen.getByRole('button', { name: /xác nhận đã nhận tiền/i }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 5.2: Chạy test để xác nhận fail**

```bash
npm run test -- staff-payment-panel
```
Expected: FAIL

- [ ] **Step 5.3: Tạo `src/components/staff/payment-panel.tsx`**

```tsx
import { useState } from 'react'
import { generatePresets } from '@/data/tables'

function formatVnd(n: number) {
  return n.toLocaleString('vi-VN') + 'đ'
}

interface Props {
  total: number
  onConfirm: () => void
}

export default function PaymentPanel({ total, onConfirm }: Props) {
  const [tab, setTab] = useState<'cash' | 'transfer'>('cash')
  const [received, setReceived] = useState<number | ''>('')
  const presets = generatePresets(total)
  const change = typeof received === 'number' ? received - total : null

  function selectPreset(val: number) {
    setReceived(val)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex border border-[#2a2a2a] rounded overflow-hidden">
        {(['cash', 'transfer'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[11px] tracking-[0.12em] transition-colors ${
              tab === t ? 'bg-[#1e1a0e] text-gold' : 'bg-[#181818] text-[#555]'
            }`}
          >
            {t === 'cash' ? 'TIỀN MẶT' : 'CHUYỂN KHOẢN'}
          </button>
        ))}
      </div>

      {tab === 'cash' && (
        <div className="bg-[#181818] border border-[#2a2a2a] rounded p-4 space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] tracking-[0.15em] text-[#555] uppercase">Cần thu</span>
            <span className="font-display text-2xl text-gold font-bold">{formatVnd(total)}</span>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.15em] text-[#555] uppercase mb-2">Tiền khách đưa</p>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => selectPreset(p)}
                  className={`py-2 text-[11px] rounded border transition-all ${
                    received === p
                      ? 'bg-[#1e1a0e] border-[#C9A84C66] text-gold'
                      : 'bg-[#222] border-[#2e2e2e] text-[#888] hover:border-[#C9A84C44] hover:text-gold'
                  }`}
                >
                  {p >= 1_000_000 ? `${p / 1_000_000}M` : `${p / 1_000}k`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 bg-[#111] border border-[#2a2a2a] rounded text-[14px] font-semibold text-[#e8e0d0] px-3 py-2 outline-none focus:border-[#C9A84C55]"
                placeholder="Nhập số tiền khác…"
                value={received}
                onChange={e => {
                  const v = parseInt(e.target.value.replace(/\D/g, ''), 10)
                  setReceived(isNaN(v) ? '' : v)
                }}
              />
              <span className="text-[12px] text-[#555]">đ</span>
            </div>
          </div>

          <div className="flex justify-between items-center bg-[#111] border border-[#2a2a2a] rounded px-3 py-2.5">
            <span className="text-[10px] tracking-[0.15em] text-[#555] uppercase">Tiền thừa trả khách</span>
            <span className={`text-[15px] font-bold ${change !== null && change >= 0 ? 'text-[#6fcf8a]' : 'text-[#888]'}`}>
              {change !== null && change >= 0 ? formatVnd(change) : '—'}
            </span>
          </div>

          <button
            onClick={onConfirm}
            className="w-full bg-gold text-brand-dark text-[11px] font-bold tracking-[0.25em] py-3 rounded"
          >
            XÁC NHẬN ĐÃ THU TIỀN
          </button>
        </div>
      )}

      {tab === 'transfer' && (
        <div className="bg-[#181818] border border-[#2a2a2a] rounded p-4 space-y-4">
          <div className="flex gap-4 items-start">
            {/* QR placeholder */}
            <div className="w-24 h-24 bg-white rounded flex items-center justify-center flex-shrink-0">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="#0d0d0d">
                <rect x="5" y="5" width="30" height="30" rx="2" fill="none" stroke="#0d0d0d" strokeWidth="4"/>
                <rect x="13" y="13" width="14" height="14" rx="1"/>
                <rect x="45" y="5" width="30" height="30" rx="2" fill="none" stroke="#0d0d0d" strokeWidth="4"/>
                <rect x="53" y="13" width="14" height="14" rx="1"/>
                <rect x="5" y="45" width="30" height="30" rx="2" fill="none" stroke="#0d0d0d" strokeWidth="4"/>
                <rect x="13" y="53" width="14" height="14" rx="1"/>
                <rect x="45" y="45" width="8" height="8"/><rect x="57" y="45" width="8" height="8"/>
                <rect x="45" y="57" width="8" height="8"/><rect x="57" y="57" width="8" height="8"/>
                <rect x="68" y="45" width="8" height="8"/><rect x="68" y="57" width="8" height="8"/>
              </svg>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[10px] text-[#555] tracking-[0.1em]">ACB · The Terminal</p>
              <p className="text-sm font-semibold text-[#e8e0d0]">1234 5678 90</p>
              <p className="text-[12px] text-gold">{formatVnd(total)}</p>
            </div>
          </div>
          <button
            onClick={onConfirm}
            className="w-full bg-[#2a2a2a] border border-[#C9A84C44] text-gold text-[11px] font-semibold tracking-[0.2em] py-3 rounded"
          >
            XÁC NHẬN ĐÃ NHẬN TIỀN
          </button>
          {/* TODO: replace with ACB webhook when backend is available */}
          <p className="text-[10px] text-[#3a3a3a] text-center">Nhân viên xác nhận sau khi kiểm tra app ngân hàng</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5.4: Chạy lại test**

```bash
npm run test -- staff-payment-panel
```
Expected: 6 PASS

- [ ] **Step 5.5: Commit**

```bash
git add src/components/staff/payment-panel.tsx src/__tests__/staff-payment-panel.test.tsx
git commit -m "feat: add PaymentPanel with cash presets and transfer tab"
```

---

## Task 6: Component `menu-panel`

**Files:**
- Create: `src/components/staff/menu-panel.tsx`

(Menu panel là UI thuần — reuse `menuItems` đã test ở `MenuSection.test.tsx`, không cần test riêng)

- [ ] **Step 6.1: Tạo `src/components/staff/menu-panel.tsx`**

```tsx
import { useState } from 'react'
import { menuItems, categories, type CategoryId } from '@/data/menu'
import type { OrderItem } from '@/hooks/useTableSessions'

interface Props {
  items: OrderItem[]
  onAdd: (item: Omit<OrderItem, 'quantity' | 'note'>) => void
}

function parsePrice(price: string): number {
  return parseInt(price.replace(/\D/g, ''), 10)
}

export default function MenuPanel({ items, onAdd }: Props) {
  const [active, setActive] = useState<CategoryId>('drinks')
  const filtered = menuItems.filter(m => m.category === active)

  function qtyOf(menuItemId: string) {
    return items.find(i => i.menuItemId === menuItemId)?.quantity ?? 0
  }

  return (
    <div className="flex flex-col h-full">
      {/* Category tabs */}
      <div className="flex border-b border-[#2a2a2a] bg-[#181818]">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id as CategoryId)}
            className={`flex-1 py-2.5 text-[10px] tracking-[0.15em] border-b-2 transition-colors ${
              active === cat.id
                ? 'text-gold border-gold bg-[#1c1c1c]'
                : 'text-[#555] border-transparent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Item grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 content-start">
        {filtered.map(item => {
          const qty = qtyOf(item.id)
          return (
            <div
              key={item.id}
              className="relative bg-[#1c1c1c] border border-[#2a2a2a] rounded p-3 hover:border-[#C9A84C55] hover:bg-[#1e1a0e] transition-colors"
            >
              {qty > 0 && (
                <span className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-gold text-brand-dark text-[10px] font-bold flex items-center justify-center">
                  {qty}
                </span>
              )}
              <p className="text-[12px] font-semibold text-[#e8e0d0] mb-1 leading-snug pr-5">{item.name}</p>
              <p className="text-[10px] text-[#555] leading-relaxed mb-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-gold font-semibold">{item.price}</span>
                <button
                  aria-label={`Thêm ${item.name}`}
                  onClick={() => onAdd({ menuItemId: item.id, name: item.name, priceNum: parsePrice(item.price), price: item.price })}
                  className="w-[22px] h-[22px] rounded bg-gold text-brand-dark text-base font-bold flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 6.2: Commit**

```bash
git add src/components/staff/menu-panel.tsx
git commit -m "feat: add MenuPanel component"
```

---

## Task 7: Component `floor-plan` + Page `staff-floor-plan`

**Files:**
- Create: `src/components/staff/floor-plan.tsx`
- Create: `src/pages/staff-floor-plan.tsx`

- [ ] **Step 7.1: Tạo `src/components/staff/floor-plan.tsx`**

```tsx
import { tables } from '@/data/tables'
import type { TableSession } from '@/hooks/useTableSessions'
import TableCard from '@/components/staff/table-card'

interface Props {
  sessions: Record<string, TableSession>
  onTableClick: (tableId: string) => void
}

export default function FloorPlan({ sessions, onTableClick }: Props) {
  const serving = tables.filter(t => sessions[t.id]?.status === 'serving').length
  const waiting = tables.filter(t => sessions[t.id]?.status === 'waiting_payment').length
  const empty = tables.length - serving - waiting

  return (
    <div className="p-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { val: tables.length, label: 'Tổng bàn', cls: 'text-[#f5f0e8]' },
          { val: serving, label: 'Đang phục vụ', cls: 'text-gold' },
          { val: waiting, label: 'Chờ thanh toán', cls: 'text-[#e07b39]' },
          { val: empty, label: 'Trống', cls: 'text-[#f5f0e8]' },
        ].map(s => (
          <div key={s.label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-3">
            <p className={`text-xl font-bold ${s.cls}`}>{s.val}</p>
            <p className="text-[10px] text-[#666] tracking-[0.1em] uppercase mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Grid 4×3 */}
      <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-3">SƠ ĐỒ BÀN</p>
      <div className="grid grid-cols-4 gap-3">
        {tables.map(t => (
          <TableCard
            key={t.id}
            table={t}
            session={sessions[t.id]}
            onClick={() => onTableClick(t.id)}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7.2: Tạo `src/pages/staff-floor-plan.tsx`**

```tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTableSessions } from '@/hooks/useTableSessions'
import FloorPlan from '@/components/staff/floor-plan'

export default function StaffFloorPlanPage() {
  const navigate = useNavigate()
  const { sessions, openSession } = useTableSessions()

  function handleTableClick(tableId: string) {
    const session = sessions[tableId]
    if (!session || session.status === 'empty' || session.status === 'done') {
      openSession(tableId)
      navigate(`/staff/table/${tableId}`)
    } else if (session.status === 'serving') {
      navigate(`/staff/table/${tableId}`)
    } else {
      navigate(`/staff/table/${tableId}/payment`)
    }
  }

  return (
    <div className="min-h-screen bg-brand-darker text-[#f5f0e8]">
      {/* Topbar */}
      <div className="flex items-center justify-between bg-[#1a1a1a] border-b border-[#2a2a2a] px-5 py-3">
        <span className="font-display text-gold tracking-[0.15em] text-base">THE TERMINAL</span>
        <div className="flex items-center gap-3">
          <Clock />
          <span className="text-[10px] tracking-[0.15em] text-gold bg-[#C9A84C15] border border-[#C9A84C33] px-3 py-1 rounded">
            NHÂN VIÊN
          </span>
        </div>
      </div>
      {/* TODO: Add PIN auth guard here */}
      <FloorPlan sessions={sessions} onTableClick={handleTableClick} />
    </div>
  )
}

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="text-[12px] text-[#666]">
      {time.toLocaleDateString('vi-VN')} · {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
    </span>
  )
}
```

- [ ] **Step 7.3: Commit**

```bash
git add src/components/staff/floor-plan.tsx src/pages/staff-floor-plan.tsx
git commit -m "feat: add FloorPlan component and StaffFloorPlanPage"
```

---

## Task 8: Page `staff-table-order`

**Files:**
- Create: `src/pages/staff-table-order.tsx`

- [ ] **Step 8.1: Tạo `src/pages/staff-table-order.tsx`**

```tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useTableSessions } from '@/hooks/useTableSessions'
import { tables } from '@/data/tables'
import MenuPanel from '@/components/staff/menu-panel'
import OrderSummary from '@/components/staff/order-summary'

export default function StaffTableOrderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessions, addItem, updateItem, removeItem, requestPayment } = useTableSessions()

  const table = tables.find(t => t.id === id)
  const session = id ? sessions[id] : undefined

  if (!table || !session) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center text-[#555]">
        Bàn không tồn tại.{' '}
        <button className="text-gold ml-2 underline" onClick={() => navigate('/staff')}>
          Quay lại
        </button>
      </div>
    )
  }

  const statusLabel: Record<string, string> = {
    serving: 'ĐANG PHỤC VỤ',
    waiting_payment: 'CHỜ THANH TOÁN',
  }

  function handlePay() {
    if (!id) return
    requestPayment(id)
    navigate(`/staff/table/${id}/payment`)
  }

  return (
    <div className="h-screen flex flex-col bg-brand-darker text-[#f5f0e8] overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center justify-between bg-[#1a1a1a] border-b border-[#2a2a2a] px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/staff')}
            className="text-[12px] text-gold border border-[#C9A84C44] px-3 py-1 rounded tracking-[0.1em]"
          >
            ← Sơ đồ bàn
          </button>
          <span className="font-display text-[#f5f0e8] text-base">{table.label}</span>
          <span className="text-[9px] tracking-[0.2em] text-gold bg-[#C9A84C15] border border-[#C9A84C33] px-2.5 py-1 rounded">
            {statusLabel[session.status] ?? session.status.toUpperCase()}
          </span>
        </div>
        <span className="text-[11px] text-[#666]">
          Mở lúc {new Date(session.openedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Split layout */}
      <div className="flex-1 grid grid-cols-[1fr_340px] overflow-hidden">
        <div className="border-r border-[#2a2a2a] overflow-hidden">
          <MenuPanel
            items={session.items}
            onAdd={item => id && addItem(id, item)}
          />
        </div>
        <OrderSummary
          items={session.items}
          onUpdateItem={(menuItemId, patch) => id && updateItem(id, menuItemId, patch)}
          onRemoveItem={menuItemId => id && removeItem(id, menuItemId)}
          onPay={handlePay}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 8.2: Commit**

```bash
git add src/pages/staff-table-order.tsx
git commit -m "feat: add StaffTableOrderPage (split menu + bill)"
```

---

## Task 9: Page `staff-payment`

**Files:**
- Create: `src/pages/staff-payment.tsx`

- [ ] **Step 9.1: Tạo `src/pages/staff-payment.tsx`**

```tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useTableSessions } from '@/hooks/useTableSessions'
import { tables } from '@/data/tables'
import PaymentPanel from '@/components/staff/payment-panel'

function formatVnd(n: number) {
  return n.toLocaleString('vi-VN') + 'đ'
}

export default function StaffPaymentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessions, closeSession } = useTableSessions()

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

  const total = session.items.reduce((s, i) => s + i.priceNum * i.quantity, 0)

  function handleConfirm() {
    if (!id) return
    closeSession(id)
    navigate('/staff')
  }

  return (
    <div className="min-h-screen bg-brand-darker text-[#f5f0e8]">
      {/* Topbar */}
      <div className="flex items-center gap-3 bg-[#1a1a1a] border-b border-[#2a2a2a] px-5 py-3">
        <button
          onClick={() => navigate(`/staff/table/${id}`)}
          className="text-[12px] text-gold border border-[#C9A84C44] px-3 py-1 rounded tracking-[0.1em]"
        >
          ← {table.label}
        </button>
        <span className="font-display text-[#f5f0e8] text-base">Thanh toán</span>
        <span className="text-[9px] tracking-[0.2em] text-[#e07b39] bg-[#e07b3915] border border-[#e07b3933] px-2.5 py-1 rounded">
          CHỜ THANH TOÁN
        </span>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-2 min-h-[calc(100vh-53px)]">
        {/* Left: bill summary */}
        <div className="border-r border-[#2a2a2a] p-6">
          <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-4">Tổng kết đơn hàng</p>
          <div className="space-y-1 mb-6">
            {session.items.map(item => (
              <div key={item.menuItemId} className="flex justify-between items-baseline gap-3 py-2 border-b border-[#1e1e1e]">
                <div>
                  <p className="text-[12px] text-[#b0a898]">{item.name}</p>
                  {item.note && <p className="text-[10px] text-[#C9A84C55] italic mt-0.5">{item.note}</p>}
                </div>
                <span className="text-[11px] text-[#555]">×{item.quantity}</span>
                <span className="text-[12px] text-[#888] min-w-[80px] text-right">
                  {formatVnd(item.priceNum * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-baseline pt-4 border-t border-[#C9A84C33]">
            <span className="text-[11px] tracking-[0.2em] text-[#888] uppercase">Tổng thanh toán</span>
            <span className="font-display text-3xl text-gold font-bold">{formatVnd(total)}</span>
          </div>
        </div>

        {/* Right: payment panel */}
        <div className="p-6">
          <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-4">Phương thức thanh toán</p>
          <PaymentPanel total={total} onConfirm={handleConfirm} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 9.2: Commit**

```bash
git add src/pages/staff-payment.tsx
git commit -m "feat: add StaffPaymentPage"
```

---

## Task 10: Wire routes vào App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 10.1: Cập nhật `src/App.tsx`**

Thêm 3 routes mới vào BrowserRouter. File hiện tại:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MuseumPage from '@/pages/MuseumPage'
import GlassPage from '@/pages/GlassPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MuseumPage />} />
        <Route path="/glass" element={<GlassPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

Sửa thành:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MuseumPage from '@/pages/MuseumPage'
import GlassPage from '@/pages/GlassPage'
import StaffFloorPlanPage from '@/pages/staff-floor-plan'
import StaffTableOrderPage from '@/pages/staff-table-order'
import StaffPaymentPage from '@/pages/staff-payment'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MuseumPage />} />
        <Route path="/glass" element={<GlassPage />} />
        <Route path="/staff" element={<StaffFloorPlanPage />} />
        <Route path="/staff/table/:id" element={<StaffTableOrderPage />} />
        <Route path="/staff/table/:id/payment" element={<StaffPaymentPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 10.2: Chạy toàn bộ test suite**

```bash
npm run test
```
Expected: tất cả pass (không có regression)

- [ ] **Step 10.3: Build để kiểm tra TypeScript**

```bash
npm run build
```
Expected: build thành công, không có lỗi type

- [ ] **Step 10.4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire /staff routes into App"
```

---

## Task 11: Manual smoke test

- [ ] **Step 11.1: Chạy dev server**

```bash
npm run dev
```

- [ ] **Step 11.2: Kiểm tra các luồng sau trên http://localhost:5173/staff**

1. **Mở bàn mới**: Click bàn trống → bàn chuyển sang serving → vào trang order
2. **Thêm món**: Tab "THỨC UỐNG" → click `+` trên "Terminal Espresso" × 2 → badge `2` xuất hiện trên card → bill panel cập nhật
3. **Ghi chú**: Nhập "ít đường" vào ghi chú Espresso → text đổi vàng nhạt
4. **Xoá món**: Click thùng rác → món biến khỏi bill
5. **Thanh toán tiền mặt**: Click THANH TOÁN → trang payment → click preset 400k → tiền thừa 55k → XÁC NHẬN → redirect về floor plan → bàn trống
6. **Thanh toán chuyển khoản**: Mở bàn mới → order món → THANH TOÁN → tab CHUYỂN KHOẢN → XÁC NHẬN ĐÃ NHẬN TIỀN → redirect về floor plan
7. **Reload kiểm tra persistence**: Order bàn mới → reload trang → bàn vẫn hiện màu vàng (serving) và data còn nguyên

- [ ] **Step 11.3: Commit final**

```bash
git add -A
git commit -m "feat: staff order route — floor plan, POS, payment (MVP)"
```
