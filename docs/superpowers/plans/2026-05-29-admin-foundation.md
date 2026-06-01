# Admin Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded menu/table/seller data with localStorage-backed hooks and build a PIN-gated `/admin` panel for CRUD management of menu items, tables, and restaurant settings.

**Architecture:** Three localStorage hooks (`useMenuData`, `useTableData`, `useSettings`) seed from hardcoded defaults on first run and expose CRUD operations; staff pages are migrated to read from these hooks; a PIN-gated `/admin` nested route provides admin pages for menu, table, and settings management.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v3, Vitest + Testing Library, React Router v6 nested routes, Sonner toasts

---

## File Map

**New files:**
- `src/hooks/useMenuData.ts` — localStorage-backed menu items + categories CRUD; seeds from `src/data/menu.ts` on first run
- `src/hooks/useTableData.ts` — localStorage-backed table definitions CRUD; seeds from `src/data/tables.ts` on first run
- `src/hooks/useSettings.ts` — localStorage-backed restaurant settings (seller info, VAT rate, PIN); seeds from `src/data/seller.ts`
- `src/components/admin/pin-gate.tsx` — PIN entry screen, accepts `correctPin` and `onSuccess` props
- `src/components/admin/menu-item-form.tsx` — add/edit menu item form, used in admin-menu page
- `src/components/admin/table-form.tsx` — add/edit table form, used in admin-tables page
- `src/pages/admin/admin-layout.tsx` — admin shell with sidebar nav + renders `<PinGate>` if not authenticated
- `src/pages/admin/admin-dashboard.tsx` — stats overview (counts of tables, categories, items)
- `src/pages/admin/admin-menu.tsx` — menu CRUD with category tabs
- `src/pages/admin/admin-tables.tsx` — table CRUD grid
- `src/pages/admin/admin-settings.tsx` — restaurant info, VAT rate, PIN change
- `src/__tests__/useMenuData.test.ts`
- `src/__tests__/useTableData.test.ts`
- `src/__tests__/useSettings.test.ts`
- `src/__tests__/pin-gate.test.tsx`
- `src/__tests__/admin-menu.test.tsx`
- `src/__tests__/admin-tables.test.tsx`

**Modified files:**
- `src/data/menu.ts` — add explicit `Category` interface export; change `CategoryId` to `string` (remove `as const` and derived type)
- `src/components/staff/menu-panel.tsx` — use `useMenuData()` instead of static imports from `src/data/menu.ts`
- `src/components/staff/floor-plan.tsx` — accept `tables: Table[]` as prop instead of importing directly
- `src/pages/staff-floor-plan.tsx` — pass `tables` from `useTableData()`; add Admin nav link
- `src/pages/staff-table-order.tsx` — use `useTableData()` instead of `import { tables }`
- `src/pages/staff-payment.tsx` — use `useTableData()` instead of `import { tables }`
- `src/pages/staff-invoice.tsx` — use `useTableData()` and `useSettings()` instead of static imports
- `src/lib/invoice.ts` — accept `sellerInfo: SellerInfo` and `vatRate: number` as parameters; remove hardcoded `seller` import
- `src/App.tsx` — add `/admin/*` nested routes

**localStorage keys used (no conflicts with existing `terminal_staff_sessions`):**
- `terminal_menu_items` — menu items array
- `terminal_categories` — categories array
- `terminal_tables` — table definitions array
- `terminal_settings` — AdminSettings object

---

### Task 1: Menu data types and hook

**Files:**
- Modify: `src/data/menu.ts:1-23`
- Create: `src/hooks/useMenuData.ts`
- Create: `src/__tests__/useMenuData.test.ts`

- [ ] **Step 1: Update `src/data/menu.ts` — add `Category` type, change `CategoryId` to `string`**

Replace lines 1–23 (the interfaces, categories array, and CategoryId type) with:

```typescript
export interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  image: string
  category: string
}

export interface Category {
  id: string
  label: string
}

export type CategoryId = string

export const categories: Category[] = [
  { id: 'appetizers', label: 'Khai Vị' },
  { id: 'soups', label: 'Súp' },
  { id: 'salads', label: 'Salad' },
  { id: 'seafood', label: 'Hải Sản' },
  { id: 'steaks', label: 'Thịt & Steak' },
  { id: 'pasta', label: 'Pasta' },
  { id: 'breakfast', label: 'Ăn Sáng' },
  { id: 'desserts', label: 'Tráng Miệng' },
  { id: 'coffee', label: 'Cà Phê' },
  { id: 'cocktails', label: 'Cocktail' },
]
```

The `as const` and `(typeof categories)[number]['id']` derived type are removed. `CategoryId = string` is a backward-compatible alias — all existing imports of `CategoryId` continue to compile without changes.

- [ ] **Step 2: Write failing tests**

Create `src/__tests__/useMenuData.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react'
import { useMenuData } from '@/hooks/useMenuData'

beforeEach(() => localStorage.clear())

describe('useMenuData', () => {
  it('initializes from hardcoded defaults when localStorage is empty', () => {
    const { result } = renderHook(() => useMenuData())
    expect(result.current.items.length).toBeGreaterThan(0)
    expect(result.current.categories.length).toBeGreaterThan(0)
  })

  it('adds item and persists to localStorage', () => {
    const { result } = renderHook(() => useMenuData())
    const before = result.current.items.length
    act(() => {
      result.current.addItem({
        name: 'Test Dish',
        description: '',
        price: '100.000đ',
        image: '',
        category: 'appetizers',
      })
    })
    expect(result.current.items).toHaveLength(before + 1)
    const stored: unknown[] = JSON.parse(localStorage.getItem('terminal_menu_items') ?? '[]')
    expect(stored).toHaveLength(before + 1)
  })

  it('updates an item by id', () => {
    const { result } = renderHook(() => useMenuData())
    const id = result.current.items[0].id
    act(() => result.current.updateItem(id, { name: 'Renamed' }))
    expect(result.current.items.find(i => i.id === id)?.name).toBe('Renamed')
  })

  it('deletes an item by id', () => {
    const { result } = renderHook(() => useMenuData())
    const before = result.current.items.length
    const id = result.current.items[0].id
    act(() => result.current.deleteItem(id))
    expect(result.current.items).toHaveLength(before - 1)
    expect(result.current.items.find(i => i.id === id)).toBeUndefined()
  })

  it('reads existing data from localStorage on init', () => {
    const custom = [{ id: 'x1', name: 'Custom', description: '', price: '50.000đ', image: '', category: 'appetizers' }]
    localStorage.setItem('terminal_menu_items', JSON.stringify(custom))
    const { result } = renderHook(() => useMenuData())
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].name).toBe('Custom')
  })

  it('adds a category and persists', () => {
    const { result } = renderHook(() => useMenuData())
    const before = result.current.categories.length
    act(() => result.current.addCategory('Đặc Biệt'))
    expect(result.current.categories).toHaveLength(before + 1)
    expect(result.current.categories[before].label).toBe('Đặc Biệt')
  })
})
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
npx vitest run src/__tests__/useMenuData.test.ts
```

Expected: FAIL with "Cannot find module '@/hooks/useMenuData'"

- [ ] **Step 4: Create `src/hooks/useMenuData.ts`**

```typescript
import { useState } from 'react'
import { menuItems as defaultItems, categories as defaultCategories } from '@/data/menu'
import type { MenuItem, Category } from '@/data/menu'

const ITEMS_KEY = 'terminal_menu_items'
const CATS_KEY = 'terminal_categories'

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function useMenuData() {
  const [items, setItems] = useState<MenuItem[]>(() => readLocal(ITEMS_KEY, defaultItems))
  const [categories, setCategories] = useState<Category[]>(() => readLocal(CATS_KEY, [...defaultCategories]))

  function addItem(item: Omit<MenuItem, 'id'>): void {
    const next = [...items, { ...item, id: `item_${Date.now()}` }]
    setItems(next)
    localStorage.setItem(ITEMS_KEY, JSON.stringify(next))
  }

  function updateItem(id: string, patch: Partial<Omit<MenuItem, 'id'>>): void {
    const next = items.map(i => (i.id === id ? { ...i, ...patch } : i))
    setItems(next)
    localStorage.setItem(ITEMS_KEY, JSON.stringify(next))
  }

  function deleteItem(id: string): void {
    const next = items.filter(i => i.id !== id)
    setItems(next)
    localStorage.setItem(ITEMS_KEY, JSON.stringify(next))
  }

  function addCategory(label: string): void {
    const next = [...categories, { id: `cat_${Date.now()}`, label }]
    setCategories(next)
    localStorage.setItem(CATS_KEY, JSON.stringify(next))
  }

  function updateCategory(id: string, label: string): void {
    const next = categories.map(c => (c.id === id ? { ...c, label } : c))
    setCategories(next)
    localStorage.setItem(CATS_KEY, JSON.stringify(next))
  }

  function deleteCategory(id: string): void {
    const next = categories.filter(c => c.id !== id)
    setCategories(next)
    localStorage.setItem(CATS_KEY, JSON.stringify(next))
  }

  return { items, categories, addItem, updateItem, deleteItem, addCategory, updateCategory, deleteCategory }
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npx vitest run src/__tests__/useMenuData.test.ts
```

Expected: PASS (6 tests)

- [ ] **Step 6: Commit**

```bash
git add src/data/menu.ts src/hooks/useMenuData.ts src/__tests__/useMenuData.test.ts
git commit -m "feat: add useMenuData hook with localStorage persistence"
```

---

### Task 2: Table data hook and settings hook

**Files:**
- Create: `src/hooks/useTableData.ts`
- Create: `src/hooks/useSettings.ts`
- Create: `src/__tests__/useTableData.test.ts`
- Create: `src/__tests__/useSettings.test.ts`

- [ ] **Step 1: Write failing tests for useTableData**

Create `src/__tests__/useTableData.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react'
import { useTableData } from '@/hooks/useTableData'

beforeEach(() => localStorage.clear())

describe('useTableData', () => {
  it('loads 12 default tables when localStorage is empty', () => {
    const { result } = renderHook(() => useTableData())
    expect(result.current.tables).toHaveLength(12)
  })

  it('adds a table and persists to localStorage', () => {
    const { result } = renderHook(() => useTableData())
    act(() => {
      result.current.addTable({ label: 'Bàn VIP', seats: 8, gridCol: 1, gridRow: 4 })
    })
    expect(result.current.tables).toHaveLength(13)
    const stored: unknown[] = JSON.parse(localStorage.getItem('terminal_tables') ?? '[]')
    expect(stored).toHaveLength(13)
  })

  it('updates a table by id', () => {
    const { result } = renderHook(() => useTableData())
    const id = result.current.tables[0].id
    act(() => result.current.updateTable(id, { label: 'VIP' }))
    expect(result.current.tables[0].label).toBe('VIP')
  })

  it('deletes a table by id', () => {
    const { result } = renderHook(() => useTableData())
    const id = result.current.tables[0].id
    act(() => result.current.deleteTable(id))
    expect(result.current.tables).toHaveLength(11)
    expect(result.current.tables.find(t => t.id === id)).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run src/__tests__/useTableData.test.ts
```

Expected: FAIL with "Cannot find module '@/hooks/useTableData'"

- [ ] **Step 3: Write failing tests for useSettings**

Create `src/__tests__/useSettings.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react'
import { useSettings } from '@/hooks/useSettings'

beforeEach(() => localStorage.clear())

describe('useSettings', () => {
  it('returns defaults when localStorage is empty', () => {
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings.restaurantName).toBe('THE TERMINAL')
    expect(result.current.settings.pin).toBe('1234')
    expect(result.current.settings.vatRate).toBe(0.1)
  })

  it('updates settings and persists to localStorage', () => {
    const { result } = renderHook(() => useSettings())
    act(() => result.current.updateSettings({ restaurantName: 'New Name', pin: '9999' }))
    expect(result.current.settings.restaurantName).toBe('New Name')
    expect(result.current.settings.pin).toBe('9999')
    const stored = JSON.parse(localStorage.getItem('terminal_settings') ?? '{}') as Record<string, unknown>
    expect(stored.restaurantName).toBe('New Name')
  })

  it('merges partial localStorage data with defaults on init', () => {
    localStorage.setItem('terminal_settings', JSON.stringify({ pin: '5678' }))
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings.pin).toBe('5678')
    expect(result.current.settings.restaurantName).toBe('THE TERMINAL')
  })
})
```

- [ ] **Step 4: Run test to confirm failure**

```bash
npx vitest run src/__tests__/useSettings.test.ts
```

Expected: FAIL with "Cannot find module '@/hooks/useSettings'"

- [ ] **Step 5: Create `src/hooks/useTableData.ts`**

```typescript
import { useState } from 'react'
import { tables as defaultTables } from '@/data/tables'
import type { Table } from '@/data/tables'

const TABLES_KEY = 'terminal_tables'

export function useTableData() {
  const [tables, setTables] = useState<Table[]>(() => {
    try {
      const raw = localStorage.getItem(TABLES_KEY)
      return raw ? (JSON.parse(raw) as Table[]) : defaultTables
    } catch {
      return defaultTables
    }
  })

  function addTable(table: Omit<Table, 'id'>): void {
    const next = [...tables, { ...table, id: `t${Date.now()}` }]
    setTables(next)
    localStorage.setItem(TABLES_KEY, JSON.stringify(next))
  }

  function updateTable(id: string, patch: Partial<Omit<Table, 'id'>>): void {
    const next = tables.map(t => (t.id === id ? { ...t, ...patch } : t))
    setTables(next)
    localStorage.setItem(TABLES_KEY, JSON.stringify(next))
  }

  function deleteTable(id: string): void {
    const next = tables.filter(t => t.id !== id)
    setTables(next)
    localStorage.setItem(TABLES_KEY, JSON.stringify(next))
  }

  return { tables, addTable, updateTable, deleteTable }
}
```

- [ ] **Step 6: Create `src/hooks/useSettings.ts`**

`AdminSettings` is defined here (not in a separate types file — YAGNI). The default PIN is `'1234'`.

```typescript
import { useState } from 'react'
import { seller } from '@/data/seller'

const SETTINGS_KEY = 'terminal_settings'

export interface AdminSettings {
  restaurantName: string
  address: string
  taxCode: string
  phone: string
  invoiceSymbol: string
  pin: string
  vatRate: number
}

const defaults: AdminSettings = {
  restaurantName: seller.name,
  address: seller.address,
  taxCode: seller.taxCode,
  phone: seller.phone,
  invoiceSymbol: seller.invoiceSymbol,
  pin: '1234',
  vatRate: 0.1,
}

export function useSettings() {
  const [settings, setSettings] = useState<AdminSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<AdminSettings>) } : defaults
    } catch {
      return defaults
    }
  })

  function updateSettings(patch: Partial<AdminSettings>): void {
    const next = { ...settings, ...patch }
    setSettings(next)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  }

  return { settings, updateSettings }
}
```

- [ ] **Step 7: Run all new hook tests**

```bash
npx vitest run src/__tests__/useTableData.test.ts src/__tests__/useSettings.test.ts
```

Expected: PASS (7 tests total)

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useTableData.ts src/hooks/useSettings.ts src/__tests__/useTableData.test.ts src/__tests__/useSettings.test.ts
git commit -m "feat: add useTableData and useSettings hooks with localStorage persistence"
```

---

### Task 3: Migrate staff pages to use data hooks

**Files:**
- Modify: `src/components/staff/menu-panel.tsx`
- Modify: `src/components/staff/floor-plan.tsx`
- Modify: `src/pages/staff-floor-plan.tsx`
- Modify: `src/pages/staff-table-order.tsx`
- Modify: `src/pages/staff-payment.tsx`
- Modify: `src/lib/invoice.ts`
- Modify: `src/pages/staff-invoice.tsx`

No new tests — staff flow is covered by existing tests + build check.

- [ ] **Step 1: Replace `src/components/staff/menu-panel.tsx`**

Full replacement (uses `useMenuData()` internally; no prop interface change):

```typescript
import { useState } from 'react'
import { toast } from 'sonner'
import { useMenuData } from '@/hooks/useMenuData'
import type { OrderItem } from '@/types/session'
import { ToastAddIcon } from '@/components/ui/toast-icons'

interface Props {
  pendingItems: OrderItem[]
  onAdd: (item: Omit<OrderItem, 'quantity' | 'note'>) => void
}

function parsePrice(price: string): number {
  return parseInt(price.replace(/\D/g, ''), 10)
}

export default function MenuPanel({ pendingItems, onAdd }: Props) {
  const { items, categories } = useMenuData()
  const [active, setActive] = useState(categories[0]?.id ?? 'appetizers')
  const filtered = items.filter(m => m.category === active)

  function qtyOf(menuItemId: string) {
    return pendingItems.find(i => i.menuItemId === menuItemId)?.quantity ?? 0
  }

  return (
    <div className="flex h-full">
      {/* Left: vertical category sidebar */}
      <div className="w-20 sm:w-28 flex-shrink-0 flex flex-col border-r border-[#2a2a2a] bg-[#111] overflow-y-auto">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={`px-2 py-3 text-[10px] tracking-[0.1em] text-left leading-tight border-l-2 transition-colors ${
              active === cat.id
                ? 'text-gold border-gold bg-[#1c1a10]'
                : 'text-[#555] border-transparent hover:text-[#888] hover:bg-[#181818]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Right: item grid */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 grid grid-cols-2 gap-2 sm:gap-2.5 content-start">
        {filtered.map(item => {
          const qty = qtyOf(item.id)
          const handleAdd = () => {
            onAdd({ menuItemId: item.id, name: item.name, priceNum: parsePrice(item.price), price: item.price })
            toast(`Đã thêm ${item.name} vào đơn`, { icon: <ToastAddIcon />, duration: 1500 })
          }
          return (
            <div
              key={item.id}
              className="relative bg-[#1c1c1c] border border-[#2a2a2a] rounded overflow-hidden hover:border-[#C9A84C55] hover:bg-[#1e1a0e] transition-colors"
            >
              {qty > 0 && (
                <span className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-gold text-brand-dark text-[10px] font-bold flex items-center justify-center">
                  {qty}
                </span>
              )}
              {/* Mobile layout: square card */}
              <div className="sm:hidden">
                <img src={item.image} alt={item.name} className="w-full aspect-square object-cover" loading="lazy" />
                <div className="p-1.5">
                  <p className="text-[10px] font-semibold text-[#e8e0d0] leading-snug mb-1.5 pr-4 line-clamp-2">{item.name}</p>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] text-gold font-semibold leading-none">{item.price}</span>
                    <button
                      aria-label={`Thêm ${item.name}`}
                      onClick={handleAdd}
                      className="w-6 h-6 flex-shrink-0 rounded bg-gold text-brand-dark text-sm font-bold flex items-center justify-center"
                    >+</button>
                  </div>
                </div>
              </div>
              {/* sm+ layout: horizontal card */}
              <div className="hidden sm:block p-2.5">
                <div className="flex gap-2 mb-2">
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded flex-shrink-0" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-[#e8e0d0] leading-snug mb-0.5 pr-4">{item.name}</p>
                    <p className="text-[9px] text-[#555] leading-relaxed line-clamp-3">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gold font-semibold">{item.price}</span>
                  <button
                    aria-label={`Thêm ${item.name}`}
                    onClick={handleAdd}
                    className="w-6 h-6 rounded bg-gold text-brand-dark text-sm font-bold flex items-center justify-center"
                  >+</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace `src/components/staff/floor-plan.tsx`**

Add `tables: Table[]` as a prop (remove the direct import):

```typescript
import type { Table } from '@/data/tables'
import type { TableSession } from '@/hooks/useTableSessions'
import TableCard from '@/components/staff/table-card'

interface Props {
  tables: Table[]
  sessions: Record<string, TableSession>
  onTableClick: (tableId: string) => void
}

export default function FloorPlan({ tables, sessions, onTableClick }: Props) {
  const serving = tables.filter(t => sessions[t.id]?.status === 'serving').length
  const waiting = tables.filter(t => sessions[t.id]?.status === 'waiting_payment').length
  const empty = tables.length - serving - waiting

  return (
    <div className="p-3 sm:p-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {[
          { val: tables.length, label: 'Tổng bàn', cls: 'text-[#f5f0e8]' },
          { val: serving, label: 'Đang phục vụ', cls: 'text-gold' },
          { val: waiting, label: 'Chờ thanh toán', cls: 'text-[#e07b39]' },
          { val: empty, label: 'Trống', cls: 'text-[#f5f0e8]' },
        ].map(s => (
          <div key={s.label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-2.5 sm:p-3">
            <p className={`text-xl font-bold ${s.cls}`}>{s.val}</p>
            <p className="text-[9px] sm:text-[10px] text-[#666] tracking-[0.1em] uppercase mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-2 sm:mb-3">SƠ ĐỒ BÀN</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {tables.map(t => (
          <TableCard key={t.id} table={t} session={sessions[t.id]} onClick={() => onTableClick(t.id)} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Replace `src/pages/staff-floor-plan.tsx`**

Adds `useTableData()` and passes `tables` to `FloorPlan`. Also adds an Admin nav link in the topbar.

```typescript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTableSessions } from '@/hooks/useTableSessions'
import { useTableData } from '@/hooks/useTableData'
import FloorPlan from '@/components/staff/floor-plan'

export default function StaffFloorPlanPage() {
  const navigate = useNavigate()
  const { sessions, openSession } = useTableSessions()
  const { tables } = useTableData()

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
      <div className="flex items-center justify-between bg-[#1a1a1a] border-b border-[#2a2a2a] px-3 sm:px-5 py-2.5 sm:py-3">
        <span className="font-display text-gold tracking-[0.15em] text-base">THE TERMINAL</span>
        <div className="flex items-center gap-3">
          <Clock />
          <button
            onClick={() => navigate('/admin')}
            className="text-[10px] tracking-[0.1em] text-[#555] hover:text-[#888] transition-colors"
          >
            QUẢN LÝ
          </button>
          <span className="text-[10px] tracking-[0.15em] text-gold bg-[#C9A84C15] border border-[#C9A84C33] px-3 py-1 rounded">
            NHÂN VIÊN
          </span>
        </div>
      </div>
      <FloorPlan tables={tables} sessions={sessions} onTableClick={handleTableClick} />
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

- [ ] **Step 4: Update `src/pages/staff-table-order.tsx`**

Replace line:
```typescript
import { tables } from '@/data/tables'
```
with:
```typescript
import { useTableData } from '@/hooks/useTableData'
```

Inside the component function, after the existing hook calls (`useTableSessions`, etc.), add:
```typescript
const { tables } = useTableData()
```

The rest of the file is unchanged — `const table = tables.find(t => t.id === id)` works without modification.

- [ ] **Step 5: Update `src/pages/staff-payment.tsx`**

Replace line:
```typescript
import { tables } from '@/data/tables'
```
with:
```typescript
import { useTableData } from '@/hooks/useTableData'
```

Inside the component function, after the existing hook calls, add:
```typescript
const { tables } = useTableData()
```

The rest of the file is unchanged.

- [ ] **Step 6: Update `src/lib/invoice.ts` — accept `sellerInfo` and `vatRate` as parameters**

Remove line 4:
```typescript
import { seller } from '@/data/seller'
```

Remove line 6:
```typescript
const VAT_INCLUSIVE = 1.1
```

Replace the entire `buildInvoice` function (lines 64–93 of the original) with:

```typescript
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
```

- [ ] **Step 7: Replace `src/pages/staff-invoice.tsx`**

Adds `useTableData()` and `useSettings()`, constructs `SellerInfo` from settings, passes to `buildInvoice`:

```typescript
import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTableSessions } from '@/hooks/useTableSessions'
import { useTableData } from '@/hooks/useTableData'
import { useSettings } from '@/hooks/useSettings'
import { buildInvoice } from '@/lib/invoice'
import type { SellerInfo } from '@/types/invoice'
import InvoicePreview from '@/components/staff/invoice-preview'

export default function StaffInvoicePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessions, closeSession } = useTableSessions()
  const { tables } = useTableData()
  const { settings } = useSettings()

  const table = tables.find(t => t.id === id)
  const session = id ? sessions[id] : undefined

  const invoice = useMemo(() => {
    if (!session?.invoiceRequest) return null
    const sellerInfo: SellerInfo = {
      name: settings.restaurantName,
      address: settings.address,
      taxCode: settings.taxCode,
      phone: settings.phone,
      invoiceSymbol: settings.invoiceSymbol,
    }
    return buildInvoice(session, session.invoiceRequest, sellerInfo, settings.vatRate)
  }, [session, settings])

  if (!table || !session || !session.invoiceRequest || !invoice) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center text-[#555]">
        Không tìm thấy dữ liệu hoá đơn.{' '}
        <button className="text-gold ml-2 underline" onClick={() => navigate('/staff')}>
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
            IN HOÁ ĐƠN
          </button>
          <button
            onClick={handleDone}
            className="text-[11px] tracking-[0.15em] bg-gold text-brand-dark font-bold px-4 py-2 rounded"
          >
            HOÀN TẤT →
          </button>
        </div>
      </div>
      <div className="py-6 px-4 print:p-0 print:py-0">
        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Run full check**

```bash
npm run check
```

Expected: TypeScript ✅, ESLint ✅, Vitest ✅, build ✅

- [ ] **Step 9: Commit**

```bash
git add src/components/staff/menu-panel.tsx src/components/staff/floor-plan.tsx src/pages/staff-floor-plan.tsx src/pages/staff-table-order.tsx src/pages/staff-payment.tsx src/lib/invoice.ts src/pages/staff-invoice.tsx
git commit -m "refactor: migrate staff pages from hardcoded data to localStorage hooks"
```

---

### Task 4: Admin routes, layout, and PIN gate

**Files:**
- Create: `src/components/admin/pin-gate.tsx`
- Create: `src/pages/admin/admin-layout.tsx`
- Create: `src/pages/admin/admin-dashboard.tsx`
- Create placeholder: `src/pages/admin/admin-menu.tsx`
- Create placeholder: `src/pages/admin/admin-tables.tsx`
- Create placeholder: `src/pages/admin/admin-settings.tsx`
- Modify: `src/App.tsx`
- Create: `src/__tests__/pin-gate.test.tsx`

- [ ] **Step 1: Write failing tests for PinGate**

Create `src/__tests__/pin-gate.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import PinGate from '@/components/admin/pin-gate'

describe('PinGate', () => {
  it('calls onSuccess when correct PIN is entered', () => {
    const onSuccess = vi.fn()
    render(<PinGate correctPin="1234" onSuccess={onSuccess} />)
    fireEvent.change(screen.getByPlaceholderText('Nhập PIN'), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /vào trang quản lý/i }))
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('does not call onSuccess with wrong PIN and shows error', () => {
    const onSuccess = vi.fn()
    render(<PinGate correctPin="1234" onSuccess={onSuccess} />)
    fireEvent.change(screen.getByPlaceholderText('Nhập PIN'), { target: { value: '9999' } })
    fireEvent.click(screen.getByRole('button', { name: /vào trang quản lý/i }))
    expect(onSuccess).not.toHaveBeenCalled()
    expect(screen.getByText('PIN không đúng')).toBeInTheDocument()
  })

  it('clears input after wrong PIN', () => {
    render(<PinGate correctPin="1234" onSuccess={vi.fn()} />)
    const input = screen.getByPlaceholderText('Nhập PIN') as HTMLInputElement
    fireEvent.change(input, { target: { value: '9999' } })
    fireEvent.click(screen.getByRole('button', { name: /vào trang quản lý/i }))
    expect(input.value).toBe('')
  })
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run src/__tests__/pin-gate.test.tsx
```

Expected: FAIL with "Cannot find module '@/components/admin/pin-gate'"

- [ ] **Step 3: Create `src/components/admin/pin-gate.tsx`**

```typescript
import { useState } from 'react'

interface Props {
  correctPin: string
  onSuccess: () => void
}

export default function PinGate({ correctPin, onSuccess }: Props) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input === correctPin) {
      onSuccess()
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="min-h-screen bg-brand-darker flex items-center justify-center">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 w-full max-w-sm">
        <p className="font-display text-gold text-center text-xl mb-2">THE TERMINAL</p>
        <p className="text-[10px] tracking-[0.2em] text-[#555] text-center uppercase mb-8">Quản lý</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            placeholder="Nhập PIN"
            className="w-full bg-[#111] border border-[#333] rounded px-4 py-3 text-center text-[#f5f0e8] text-lg tracking-[0.3em] outline-none focus:border-[#C9A84C44]"
          />
          {error && <p className="text-red-400 text-[11px] text-center">PIN không đúng</p>}
          <button
            type="submit"
            className="w-full bg-gold text-brand-dark font-bold text-[12px] tracking-[0.2em] py-3 rounded"
          >
            VÀO TRANG QUẢN LÝ
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/__tests__/pin-gate.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 5: Create `src/pages/admin/admin-layout.tsx`**

```typescript
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import PinGate from '@/components/admin/pin-gate'
import { useSettings } from '@/hooks/useSettings'

export default function AdminLayout() {
  const { settings } = useSettings()
  const [authed, setAuthed] = useState(false)
  const navigate = useNavigate()

  if (!authed) {
    return <PinGate correctPin={settings.pin} onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen bg-brand-darker text-[#f5f0e8] flex">
      <nav className="w-44 flex-shrink-0 bg-[#111] border-r border-[#2a2a2a] flex flex-col">
        <div className="p-4 border-b border-[#2a2a2a]">
          <p className="font-display text-gold text-sm">THE TERMINAL</p>
          <p className="text-[9px] text-[#555] tracking-[0.15em] uppercase">Quản lý</p>
        </div>
        <div className="flex-1 py-2">
          {[
            { to: '/admin', label: 'Tổng quan', end: true },
            { to: '/admin/menu', label: 'Thực đơn', end: false },
            { to: '/admin/tables', label: 'Bàn', end: false },
            { to: '/admin/settings', label: 'Cài đặt', end: false },
          ].map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-[11px] tracking-[0.1em] transition-colors border-l-2 ${
                  isActive
                    ? 'text-gold bg-[#1c1a10] border-gold'
                    : 'text-[#555] hover:text-[#888] border-transparent'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="p-4 border-t border-[#2a2a2a]">
          <button
            onClick={() => navigate('/staff')}
            className="text-[10px] text-[#555] hover:text-[#888] tracking-[0.1em] transition-colors"
          >
            ← Nhân viên
          </button>
        </div>
      </nav>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 6: Create `src/pages/admin/admin-dashboard.tsx`**

```typescript
import { useMenuData } from '@/hooks/useMenuData'
import { useTableData } from '@/hooks/useTableData'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { items, categories } = useMenuData()
  const { tables } = useTableData()
  const navigate = useNavigate()

  const stats = [
    { label: 'Tổng số bàn', value: tables.length, to: '/admin/tables' },
    { label: 'Danh mục', value: categories.length, to: '/admin/menu' },
    { label: 'Số món', value: items.length, to: '/admin/menu' },
  ]

  return (
    <div className="p-6">
      <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-6">Tổng quan</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <button
            key={s.label}
            onClick={() => navigate(s.to)}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-5 text-left hover:border-[#C9A84C44] transition-colors"
          >
            <p className="font-display text-3xl font-bold text-gold mb-1">{s.value}</p>
            <p className="text-[10px] tracking-[0.15em] text-[#555] uppercase">{s.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create placeholder admin page files**

These placeholders allow `App.tsx` to compile before Tasks 5–7 fill them in.

Create `src/pages/admin/admin-menu.tsx`:
```typescript
export default function AdminMenuPage() {
  return <div className="p-6 text-[#555] text-[12px]">Thực đơn</div>
}
```

Create `src/pages/admin/admin-tables.tsx`:
```typescript
export default function AdminTablesPage() {
  return <div className="p-6 text-[#555] text-[12px]">Bàn</div>
}
```

Create `src/pages/admin/admin-settings.tsx`:
```typescript
export default function AdminSettingsPage() {
  return <div className="p-6 text-[#555] text-[12px]">Cài đặt</div>
}
```

- [ ] **Step 8: Add admin routes to `src/App.tsx`**

Add these imports after the existing page imports:

```typescript
import AdminLayout from '@/pages/admin/admin-layout'
import AdminDashboard from '@/pages/admin/admin-dashboard'
import AdminMenuPage from '@/pages/admin/admin-menu'
import AdminTablesPage from '@/pages/admin/admin-tables'
import AdminSettingsPage from '@/pages/admin/admin-settings'
```

Inside `<Routes>`, add after the existing `<Route path="/staff/table/:id/receipt" ...>`:

```tsx
<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<AdminDashboard />} />
  <Route path="menu" element={<AdminMenuPage />} />
  <Route path="tables" element={<AdminTablesPage />} />
  <Route path="settings" element={<AdminSettingsPage />} />
</Route>
```

- [ ] **Step 9: Run full check**

```bash
npm run check
```

Expected: TypeScript ✅, ESLint ✅, Vitest ✅, build ✅

- [ ] **Step 10: Commit**

```bash
git add src/components/admin/pin-gate.tsx src/pages/admin/ src/App.tsx src/__tests__/pin-gate.test.tsx
git commit -m "feat: add admin layout with PIN gate and nested routes"
```

---

### Task 5: Admin menu management

**Files:**
- Create: `src/components/admin/menu-item-form.tsx`
- Replace: `src/pages/admin/admin-menu.tsx` (full implementation)
- Create: `src/__tests__/admin-menu.test.tsx`

- [ ] **Step 1: Write failing tests for MenuItemForm**

Create `src/__tests__/admin-menu.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import MenuItemForm from '@/components/admin/menu-item-form'
import type { Category } from '@/data/menu'

const cats: Category[] = [
  { id: 'appetizers', label: 'Khai Vị' },
  { id: 'desserts', label: 'Tráng Miệng' },
]

describe('MenuItemForm', () => {
  it('calls onSave with correct data on submit', () => {
    const onSave = vi.fn()
    render(<MenuItemForm categories={cats} onSave={onSave} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/tên món/i), { target: { value: 'Test Dish' } })
    fireEvent.change(screen.getByLabelText(/giá/i), { target: { value: '150.000đ' } })
    fireEvent.click(screen.getByRole('button', { name: /lưu/i }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test Dish',
      price: '150.000đ',
      category: 'appetizers',
    }))
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<MenuItemForm categories={cats} onSave={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /hủy/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('pre-fills fields when editing an existing item', () => {
    const item = { id: 'ap1', name: 'Existing', description: 'Desc', price: '200.000đ', image: '', category: 'desserts' }
    render(<MenuItemForm categories={cats} initial={item} onSave={vi.fn()} onCancel={vi.fn()} />)
    expect((screen.getByLabelText(/tên món/i) as HTMLInputElement).value).toBe('Existing')
    expect((screen.getByLabelText(/giá/i) as HTMLInputElement).value).toBe('200.000đ')
  })
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run src/__tests__/admin-menu.test.tsx
```

Expected: FAIL with "Cannot find module '@/components/admin/menu-item-form'"

- [ ] **Step 3: Create `src/components/admin/menu-item-form.tsx`**

Note: every input has an `htmlFor`/`id` pair so `getByLabelText` works in tests.

```typescript
import { useState } from 'react'
import type { MenuItem, Category } from '@/data/menu'

interface Props {
  categories: Category[]
  initial?: MenuItem
  onSave: (data: Omit<MenuItem, 'id'>) => void
  onCancel: () => void
}

export default function MenuItemForm({ categories, initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial?.price ?? '')
  const [image, setImage] = useState(initial?.image ?? '')
  const [category, setCategory] = useState(initial?.category ?? categories[0]?.id ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({ name, description, price, image, category })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="mf-name" className="text-[10px] tracking-[0.15em] text-[#555] uppercase block mb-1">Tên món</label>
        <input id="mf-name" required value={name} onChange={e => setName(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[13px] text-[#f5f0e8] focus:border-[#C9A84C44] outline-none" />
      </div>
      <div>
        <label htmlFor="mf-desc" className="text-[10px] tracking-[0.15em] text-[#555] uppercase block mb-1">Mô tả</label>
        <textarea id="mf-desc" value={description} onChange={e => setDescription(e.target.value)} rows={2}
          className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[13px] text-[#f5f0e8] focus:border-[#C9A84C44] outline-none resize-none" />
      </div>
      <div>
        <label htmlFor="mf-price" className="text-[10px] tracking-[0.15em] text-[#555] uppercase block mb-1">Giá (vd: 185.000đ)</label>
        <input id="mf-price" required value={price} onChange={e => setPrice(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[13px] text-[#f5f0e8] focus:border-[#C9A84C44] outline-none" />
      </div>
      <div>
        <label htmlFor="mf-image" className="text-[10px] tracking-[0.15em] text-[#555] uppercase block mb-1">URL ảnh</label>
        <input id="mf-image" value={image} onChange={e => setImage(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[13px] text-[#f5f0e8] focus:border-[#C9A84C44] outline-none" />
      </div>
      <div>
        <label htmlFor="mf-cat" className="text-[10px] tracking-[0.15em] text-[#555] uppercase block mb-1">Danh mục</label>
        <select id="mf-cat" value={category} onChange={e => setCategory(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[13px] text-[#f5f0e8] focus:border-[#C9A84C44] outline-none">
          {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 border border-[#333] text-[#888] text-[11px] tracking-[0.1em] py-2.5 rounded">
          HỦY
        </button>
        <button type="submit"
          className="flex-1 bg-gold text-brand-dark font-bold text-[11px] tracking-[0.1em] py-2.5 rounded">
          LƯU
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/__tests__/admin-menu.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 5: Replace `src/pages/admin/admin-menu.tsx` with full implementation**

```typescript
import { useState } from 'react'
import { toast } from 'sonner'
import { useMenuData } from '@/hooks/useMenuData'
import MenuItemForm from '@/components/admin/menu-item-form'
import type { MenuItem } from '@/data/menu'

export default function AdminMenuPage() {
  const { items, categories, addItem, updateItem, deleteItem } = useMenuData()
  const [activeCat, setActiveCat] = useState(categories[0]?.id ?? '')
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [adding, setAdding] = useState(false)

  const filtered = items.filter(i => i.category === activeCat)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[10px] tracking-[0.2em] text-[#555] uppercase">Quản lý thực đơn</h1>
        <button
          onClick={() => setAdding(true)}
          className="bg-gold text-brand-dark text-[11px] tracking-[0.15em] font-bold px-4 py-2 rounded"
        >
          + THÊM MÓN
        </button>
      </div>

      {(adding || editing) && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => { setAdding(false); setEditing(null) }}
        >
          <div
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-4">
              {editing ? 'Sửa món' : 'Thêm món mới'}
            </p>
            <MenuItemForm
              categories={categories}
              initial={editing ?? undefined}
              onSave={data => {
                if (editing) {
                  updateItem(editing.id, data)
                  toast.success('Đã cập nhật món')
                } else {
                  addItem(data)
                  toast.success('Đã thêm món mới')
                }
                setEditing(null)
                setAdding(false)
              }}
              onCancel={() => { setEditing(null); setAdding(false) }}
            />
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded text-[10px] tracking-[0.1em] transition-colors ${
              activeCat === cat.id
                ? 'bg-gold text-brand-dark font-bold'
                : 'border border-[#333] text-[#555] hover:text-[#888]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {filtered.map(item => (
          <div key={item.id} className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded p-3">
            {item.image && (
              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[#f5f0e8] font-medium truncate">{item.name}</p>
              <p className="text-[11px] text-gold">{item.price}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setEditing(item)}
                className="text-[10px] tracking-[0.1em] text-[#888] border border-[#333] px-3 py-1.5 rounded hover:text-[#f5f0e8]"
              >
                SỬA
              </button>
              <button
                onClick={() => { deleteItem(item.id); toast.success('Đã xóa món') }}
                className="text-[10px] tracking-[0.1em] text-red-400 border border-red-900/30 px-3 py-1.5 rounded hover:bg-red-900/10"
              >
                XÓA
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-[#555] text-[12px] text-center py-8">Chưa có món trong danh mục này</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/menu-item-form.tsx src/pages/admin/admin-menu.tsx src/__tests__/admin-menu.test.tsx
git commit -m "feat: admin menu management — CRUD for items with category tabs"
```

---

### Task 6: Admin table management

**Files:**
- Create: `src/components/admin/table-form.tsx`
- Replace: `src/pages/admin/admin-tables.tsx` (full implementation)
- Create: `src/__tests__/admin-tables.test.tsx`

- [ ] **Step 1: Write failing tests for TableForm**

Create `src/__tests__/admin-tables.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import TableForm from '@/components/admin/table-form'

describe('TableForm', () => {
  it('calls onSave with correct data', () => {
    const onSave = vi.fn()
    render(<TableForm onSave={onSave} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/tên bàn/i), { target: { value: 'Bàn VIP' } })
    fireEvent.change(screen.getByLabelText(/số chỗ/i), { target: { value: '8' } })
    fireEvent.click(screen.getByRole('button', { name: /lưu/i }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ label: 'Bàn VIP', seats: 8 }))
  })

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = vi.fn()
    render(<TableForm onSave={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /hủy/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('pre-fills fields when editing an existing table', () => {
    const table = { id: '01', label: 'Bàn 01', seats: 4, gridCol: 1, gridRow: 1 }
    render(<TableForm initial={table} onSave={vi.fn()} onCancel={vi.fn()} />)
    expect((screen.getByLabelText(/tên bàn/i) as HTMLInputElement).value).toBe('Bàn 01')
    expect((screen.getByLabelText(/số chỗ/i) as HTMLInputElement).value).toBe('4')
  })
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run src/__tests__/admin-tables.test.tsx
```

Expected: FAIL with "Cannot find module '@/components/admin/table-form'"

- [ ] **Step 3: Create `src/components/admin/table-form.tsx`**

```typescript
import { useState } from 'react'
import type { Table } from '@/data/tables'

interface Props {
  initial?: Table
  onSave: (data: Omit<Table, 'id'>) => void
  onCancel: () => void
}

export default function TableForm({ initial, onSave, onCancel }: Props) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [seats, setSeats] = useState(initial?.seats ?? 4)
  const [gridCol, setGridCol] = useState(initial?.gridCol ?? 1)
  const [gridRow, setGridRow] = useState(initial?.gridRow ?? 1)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({ label, seats, gridCol, gridRow })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="tf-label" className="text-[10px] tracking-[0.15em] text-[#555] uppercase block mb-1">Tên bàn</label>
        <input id="tf-label" required value={label} onChange={e => setLabel(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[13px] text-[#f5f0e8] focus:border-[#C9A84C44] outline-none" />
      </div>
      <div>
        <label htmlFor="tf-seats" className="text-[10px] tracking-[0.15em] text-[#555] uppercase block mb-1">Số chỗ ngồi</label>
        <input id="tf-seats" type="number" min={1} max={20} required value={seats}
          onChange={e => setSeats(Number(e.target.value))}
          className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[13px] text-[#f5f0e8] focus:border-[#C9A84C44] outline-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="tf-col" className="text-[10px] tracking-[0.15em] text-[#555] uppercase block mb-1">Cột (1–4)</label>
          <input id="tf-col" type="number" min={1} max={4} required value={gridCol}
            onChange={e => setGridCol(Number(e.target.value))}
            className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[13px] text-[#f5f0e8] focus:border-[#C9A84C44] outline-none" />
        </div>
        <div>
          <label htmlFor="tf-row" className="text-[10px] tracking-[0.15em] text-[#555] uppercase block mb-1">Hàng (1–3)</label>
          <input id="tf-row" type="number" min={1} max={3} required value={gridRow}
            onChange={e => setGridRow(Number(e.target.value))}
            className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[13px] text-[#f5f0e8] focus:border-[#C9A84C44] outline-none" />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 border border-[#333] text-[#888] text-[11px] tracking-[0.1em] py-2.5 rounded">
          HỦY
        </button>
        <button type="submit"
          className="flex-1 bg-gold text-brand-dark font-bold text-[11px] tracking-[0.1em] py-2.5 rounded">
          LƯU
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/__tests__/admin-tables.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 5: Replace `src/pages/admin/admin-tables.tsx` with full implementation**

```typescript
import { useState } from 'react'
import { toast } from 'sonner'
import { useTableData } from '@/hooks/useTableData'
import TableForm from '@/components/admin/table-form'
import type { Table } from '@/data/tables'

export default function AdminTablesPage() {
  const { tables, addTable, updateTable, deleteTable } = useTableData()
  const [editing, setEditing] = useState<Table | null>(null)
  const [adding, setAdding] = useState(false)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[10px] tracking-[0.2em] text-[#555] uppercase">Quản lý bàn</h1>
        <button
          onClick={() => setAdding(true)}
          className="bg-gold text-brand-dark text-[11px] tracking-[0.15em] font-bold px-4 py-2 rounded"
        >
          + THÊM BÀN
        </button>
      </div>

      {(adding || editing) && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => { setAdding(false); setEditing(null) }}
        >
          <div
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-4">
              {editing ? 'Sửa bàn' : 'Thêm bàn mới'}
            </p>
            <TableForm
              initial={editing ?? undefined}
              onSave={data => {
                if (editing) {
                  updateTable(editing.id, data)
                  toast.success('Đã cập nhật bàn')
                } else {
                  addTable(data)
                  toast.success('Đã thêm bàn mới')
                }
                setEditing(null)
                setAdding(false)
              }}
              onCancel={() => { setEditing(null); setAdding(false) }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tables.map(table => (
          <div key={table.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-4">
            <p className="text-[14px] text-[#f5f0e8] font-medium mb-1">{table.label}</p>
            <p className="text-[10px] text-[#555] mb-3">
              {table.seats} chỗ · Cột {table.gridCol}, Hàng {table.gridRow}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(table)}
                className="flex-1 text-[10px] tracking-[0.1em] text-[#888] border border-[#333] py-1.5 rounded hover:text-[#f5f0e8]"
              >
                SỬA
              </button>
              <button
                onClick={() => { deleteTable(table.id); toast.success('Đã xóa bàn') }}
                className="flex-1 text-[10px] tracking-[0.1em] text-red-400 border border-red-900/30 py-1.5 rounded hover:bg-red-900/10"
              >
                XÓA
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/table-form.tsx src/pages/admin/admin-tables.tsx src/__tests__/admin-tables.test.tsx
git commit -m "feat: admin table management — CRUD for table definitions"
```

---

### Task 7: Admin settings page

**Files:**
- Replace: `src/pages/admin/admin-settings.tsx` (full implementation)

- [ ] **Step 1: Replace `src/pages/admin/admin-settings.tsx`**

```typescript
import { useState } from 'react'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/useSettings'

export default function AdminSettingsPage() {
  const { settings, updateSettings } = useSettings()
  const [form, setForm] = useState({ ...settings })
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateSettings({
      restaurantName: form.restaurantName,
      address: form.address,
      taxCode: form.taxCode,
      phone: form.phone,
      invoiceSymbol: form.invoiceSymbol,
      vatRate: form.vatRate,
    })
    toast.success('Đã lưu cài đặt')
  }

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPin.length < 4) {
      toast.error('PIN phải có ít nhất 4 ký tự')
      return
    }
    if (newPin !== confirmPin) {
      toast.error('PIN xác nhận không khớp')
      return
    }
    updateSettings({ pin: newPin })
    setNewPin('')
    setConfirmPin('')
    toast.success('Đã đổi PIN')
  }

  const inputCls = 'w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[13px] text-[#f5f0e8] focus:border-[#C9A84C44] outline-none'
  const labelCls = 'text-[10px] tracking-[0.15em] text-[#555] uppercase block mb-1'

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-6">Cài đặt nhà hàng</h1>

      <form onSubmit={handleInfoSubmit} className="space-y-4 mb-10">
        <div>
          <label htmlFor="s-name" className={labelCls}>Tên nhà hàng</label>
          <input id="s-name" value={form.restaurantName}
            onChange={e => setForm(f => ({ ...f, restaurantName: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label htmlFor="s-addr" className={labelCls}>Địa chỉ</label>
          <input id="s-addr" value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label htmlFor="s-tax" className={labelCls}>Mã số thuế</label>
          <input id="s-tax" value={form.taxCode}
            onChange={e => setForm(f => ({ ...f, taxCode: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label htmlFor="s-phone" className={labelCls}>Số điện thoại</label>
          <input id="s-phone" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label htmlFor="s-symbol" className={labelCls}>Ký hiệu hoá đơn</label>
          <input id="s-symbol" value={form.invoiceSymbol}
            onChange={e => setForm(f => ({ ...f, invoiceSymbol: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label htmlFor="s-vat" className={labelCls}>Thuế VAT (%)</label>
          <input id="s-vat" type="number" min={0} max={100} step={1}
            value={Math.round(form.vatRate * 100)}
            onChange={e => setForm(f => ({ ...f, vatRate: Number(e.target.value) / 100 }))}
            className={inputCls} />
        </div>
        <button type="submit" className="bg-gold text-brand-dark font-bold text-[11px] tracking-[0.2em] px-6 py-2.5 rounded">
          LƯU CÀI ĐẶT
        </button>
      </form>

      <div className="border-t border-[#2a2a2a] pt-8">
        <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-4">Đổi PIN quản lý</p>
        <form onSubmit={handlePinSubmit} className="space-y-4 max-w-xs">
          <div>
            <label htmlFor="pin-new" className={labelCls}>PIN mới</label>
            <input id="pin-new" type="password" inputMode="numeric" value={newPin}
              onChange={e => setNewPin(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="pin-confirm" className={labelCls}>Xác nhận PIN</label>
            <input id="pin-confirm" type="password" inputMode="numeric" value={confirmPin}
              onChange={e => setConfirmPin(e.target.value)} className={inputCls} />
          </div>
          <button type="submit" className="bg-gold text-brand-dark font-bold text-[11px] tracking-[0.2em] px-6 py-2.5 rounded">
            ĐỔI PIN
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run full check**

```bash
npm run check
```

Expected: TypeScript ✅, ESLint ✅, Vitest ✅, build ✅

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/admin-settings.tsx
git commit -m "feat: admin settings — restaurant info, VAT rate, and PIN management"
```
