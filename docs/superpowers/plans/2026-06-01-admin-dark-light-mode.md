# Admin Dark/Light Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Moon/Sun toggle button to the admin panel top-right that switches between dark (current look) and light mode, persisted to localStorage.

**Architecture:** `useAdminTheme` hook sets the `.dark` class on `document.documentElement` (required so Radix Dialog portals also inherit the class). Admin layout consumes the hook and renders the toggle button in a thin header bar above `<Outlet>`. All admin components get Tailwind `dark:` variants added alongside their existing hardcoded dark colors — dark mode preserves the current look, light mode introduces a white/gray palette.

**Tech Stack:** React 19, Tailwind CSS v3 (`darkMode: ['class']`), lucide-react (already installed), Vitest + @testing-library/react

---

## Color palette reference

Every file replaces these dark values with the paired light+dark pattern:

| Dark value | Replace with |
|---|---|
| `bg-brand-darker` | `bg-gray-50 dark:bg-brand-darker` |
| `bg-[#111]` | `bg-white dark:bg-[#111]` |
| `bg-[#151515]` | `bg-gray-100 dark:bg-[#151515]` |
| `bg-[#1a1a1a]` | `bg-gray-50 dark:bg-[#1a1a1a]` |
| `bg-[#1c1a10]` | `bg-amber-50 dark:bg-[#1c1a10]` |
| `bg-[#1e1e1e]` | `bg-white dark:bg-[#1e1e1e]` |
| `text-[#f5f0e8]` | `text-gray-900 dark:text-[#f5f0e8]` |
| `text-[#888]` | `text-gray-500 dark:text-[#888]` |
| `text-[#555]` | `text-gray-400 dark:text-[#555]` |
| `text-[#444]` | `text-gray-400 dark:text-[#444]` |
| `text-[#333]` | `text-gray-300 dark:text-[#333]` |
| `border-[#1e1e1e]` | `border-gray-100 dark:border-[#1e1e1e]` |
| `border-[#2a2a2a]` | `border-gray-200 dark:border-[#2a2a2a]` |
| `border-[#333]` | `border-gray-300 dark:border-[#333]` |
| `border-[#222]` | `border-gray-200 dark:border-[#222]` |
| `hover:bg-[#161616]` | `hover:bg-gray-50 dark:hover:bg-[#161616]` |
| `hover:bg-[#2a2a2a]` | `hover:bg-gray-100 dark:hover:bg-[#2a2a2a]` |
| `hover:text-[#888]` | `hover:text-gray-500 dark:hover:text-[#888]` |
| `hover:text-[#f5f0e8]` | `hover:text-gray-900 dark:hover:text-[#f5f0e8]` |
| `focus:border-[#C9A84C44]` | `focus:border-gold/30` |
| `border-[#C9A84C44]` (active page) | `border-gold/30 dark:border-[#C9A84C44]` |
| `placeholder-[#555]` | `placeholder-gray-400 dark:placeholder-[#555]` |
| `hover:border-[#C9A84C44]` | `hover:border-gold/30` |

---

### Task 1: useAdminTheme hook + admin layout toggle

**Files:**
- Create: `src/hooks/useAdminTheme.ts`
- Modify: `src/pages/admin/admin-layout.tsx`
- Create: `src/__tests__/useAdminTheme.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/useAdminTheme.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useAdminTheme } from '@/hooks/useAdminTheme'

describe('useAdminTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to dark when no stored value', () => {
    const { result } = renderHook(() => useAdminTheme())
    expect(result.current.isDark).toBe(true)
  })

  it('reads light from localStorage', () => {
    localStorage.setItem('terminal_admin_theme', 'light')
    const { result } = renderHook(() => useAdminTheme())
    expect(result.current.isDark).toBe(false)
  })

  it('reads dark from localStorage', () => {
    localStorage.setItem('terminal_admin_theme', 'dark')
    const { result } = renderHook(() => useAdminTheme())
    expect(result.current.isDark).toBe(true)
  })

  it('toggle flips isDark from true to false', () => {
    const { result } = renderHook(() => useAdminTheme())
    expect(result.current.isDark).toBe(true)
    act(() => result.current.toggle())
    expect(result.current.isDark).toBe(false)
  })

  it('toggle flips isDark back to true', () => {
    const { result } = renderHook(() => useAdminTheme())
    act(() => result.current.toggle())
    act(() => result.current.toggle())
    expect(result.current.isDark).toBe(true)
  })

  it('persists dark to localStorage', () => {
    const { result } = renderHook(() => useAdminTheme())
    expect(localStorage.getItem('terminal_admin_theme')).toBe('dark')
  })

  it('persists light to localStorage after toggle', () => {
    const { result } = renderHook(() => useAdminTheme())
    act(() => result.current.toggle())
    expect(localStorage.getItem('terminal_admin_theme')).toBe('light')
  })

  it('adds dark class to documentElement when isDark true', () => {
    const { result } = renderHook(() => useAdminTheme())
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes dark class from documentElement when toggled to light', () => {
    const { result } = renderHook(() => useAdminTheme())
    act(() => result.current.toggle())
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/__tests__/useAdminTheme.test.ts
```

Expected: FAIL — "Cannot find module '@/hooks/useAdminTheme'"

- [ ] **Step 3: Create the hook**

Create `src/hooks/useAdminTheme.ts`:

```typescript
import { useState, useEffect } from 'react'

const KEY = 'terminal_admin_theme'

export function useAdminTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(KEY)
      return stored === null ? true : stored === 'dark'
    } catch {
      return true
    }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    try { localStorage.setItem(KEY, isDark ? 'dark' : 'light') } catch {}
    return () => { document.documentElement.classList.remove('dark') }
  }, [isDark])

  return { isDark, toggle: () => setIsDark(d => !d) }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/useAdminTheme.test.ts
```

Expected: PASS — 9 tests

- [ ] **Step 5: Update admin-layout.tsx**

Replace entire `src/pages/admin/admin-layout.tsx`:

```typescript
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import PinGate from '@/components/admin/pin-gate'
import { useSettings } from '@/hooks/useSettings'
import { useAdminTheme } from '@/hooks/useAdminTheme'

export default function AdminLayout() {
  const { settings } = useSettings()
  const { isDark, toggle } = useAdminTheme()
  const [authed, setAuthed] = useState(false)
  const navigate = useNavigate()

  if (!authed) {
    return <PinGate correctPin={settings.pin} onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-darker text-gray-900 dark:text-[#f5f0e8] flex">
      <nav className="w-44 flex-shrink-0 bg-white dark:bg-[#111] border-r border-gray-200 dark:border-[#2a2a2a] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-[#2a2a2a]">
          <p className="font-display text-gold text-sm">THE TERMINAL</p>
          <p className="text-[9px] text-gray-400 dark:text-[#555] tracking-[0.15em] uppercase">Quản lý</p>
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
                    ? 'text-gold bg-amber-50 dark:bg-[#1c1a10] border-gold'
                    : 'text-gray-400 dark:text-[#555] hover:text-gray-600 dark:hover:text-[#888] border-transparent'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-[#2a2a2a]">
          <button
            onClick={() => navigate('/staff')}
            className="text-[10px] text-gray-400 dark:text-[#555] hover:text-gray-600 dark:hover:text-[#888] tracking-[0.1em] transition-colors"
          >
            ← Nhân viên
          </button>
        </div>
      </nav>
      <main className="flex-1 overflow-auto flex flex-col">
        <div className="flex justify-end px-4 py-2 border-b border-gray-100 dark:border-[#2a2a2a]">
          <button
            onClick={toggle}
            aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            className="text-gray-400 dark:text-[#555] hover:text-gray-600 dark:hover:text-[#888] p-1.5 rounded transition-colors"
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 6: Run full suite to verify no regressions**

```bash
npm run test
```

Expected: all tests pass (prior total: 163)

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useAdminTheme.ts src/__tests__/useAdminTheme.test.ts src/pages/admin/admin-layout.tsx
git commit -m "feat: add useAdminTheme hook and dark/light toggle button to admin layout"
```

---

### Task 2: Dark/light variants for shared UI components

**Files:**
- Modify: `src/components/ui/data-table.tsx`
- Modify: `src/components/admin/menu-detail-dialog.tsx`
- Modify: `src/components/admin/menu-item-form.tsx`
- Modify: `src/components/admin/table-form.tsx`
- Modify: `src/components/admin/pin-gate.tsx`

No new tests — these are visual class additions. Verify via existing test suite.

- [ ] **Step 1: Update data-table.tsx**

Replace entire `src/components/ui/data-table.tsx`:

```typescript
import { useState, type ReactNode } from 'react'

export interface ColumnDef<T> {
  key: string
  header: string
  width?: string
  render: (row: T) => ReactNode
}

export interface FilterDef<T> {
  placeholder: string
  options: { label: string; value: string }[]
  fn: (row: T, value: string) => boolean
}

export interface SortDef<T> {
  label: string
  fn: (a: T, b: T) => number
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  getRowKey: (row: T) => string
  searchPlaceholder?: string
  searchFn?: (row: T, query: string) => boolean
  filter?: FilterDef<T>
  sorts?: SortDef<T>[]
  pageSize?: number
  onRowClick?: (row: T) => void
  actions?: (row: T) => { label: string; onClick: () => void; destructive?: boolean }[]
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  searchPlaceholder = 'Tìm kiếm...',
  searchFn,
  filter,
  sorts = [],
  pageSize = 10,
  onRowClick,
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const [sortIndex, setSortIndex] = useState(-1)
  const [page, setPage] = useState(0)
  const [openActionKey, setOpenActionKey] = useState<string | null>(null)

  function resetPage() { setPage(0) }

  let rows = data
  if (search && searchFn) rows = rows.filter(row => searchFn(row, search))
  if (filterValue && filter) rows = rows.filter(row => filter.fn(row, filterValue))
  if (sortIndex >= 0 && sorts[sortIndex]) rows = [...rows].sort(sorts[sortIndex].fn)

  const totalCount = rows.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const start = page * pageSize
  const end = start + pageSize
  const pageRows = rows.slice(start, end)

  return (
    <div>
      {openActionKey !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenActionKey(null)} />
      )}

      <div className="flex gap-2 mb-2 items-center">
        <input
          className="flex-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] rounded px-3 py-2 text-[13px] text-gray-900 dark:text-[#f5f0e8] outline-none placeholder-gray-400 dark:placeholder-[#555]"
          placeholder={searchPlaceholder}
          value={search}
          onChange={e => { setSearch(e.target.value); resetPage() }}
        />
        {filter && (
          <select
            aria-label="Lọc danh mục"
            className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] rounded px-3 py-2 text-[13px] text-gray-900 dark:text-[#f5f0e8] outline-none min-w-[130px]"
            value={filterValue}
            onChange={e => { setFilterValue(e.target.value); resetPage() }}
          >
            <option value="">{filter.placeholder}</option>
            {filter.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
        {sorts.length > 0 && (
          <select
            aria-label="Sắp xếp"
            className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] rounded px-3 py-2 text-[13px] text-gray-900 dark:text-[#f5f0e8] outline-none min-w-[120px]"
            value={sortIndex}
            onChange={e => { setSortIndex(Number(e.target.value)); resetPage() }}
          >
            <option value={-1}>Sắp xếp</option>
            {sorts.map((s, i) => (
              <option key={i} value={i}>{s.label}</option>
            ))}
          </select>
        )}
      </div>

      <div className="text-[9px] text-gray-400 dark:text-[#444] tracking-[0.1em] mb-2">
        {totalCount} MÓN · HIỂN THỊ {totalCount === 0 ? '0' : start + 1}–{Math.min(end, totalCount)}
      </div>

      <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-[#1e1e1e] bg-gray-100 dark:bg-[#151515]">
              {columns.map(col => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className="text-left text-[9px] text-gray-400 dark:text-[#444] tracking-[0.1em] uppercase px-3 py-2 font-normal"
                >
                  {col.header}
                </th>
              ))}
              {actions && <th className="px-3 py-2 w-10" />}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center text-gray-400 dark:text-[#555] text-[12px] py-8"
                >
                  Không tìm thấy kết quả
                </td>
              </tr>
            ) : pageRows.map(row => {
              const key = getRowKey(row)
              const rowActions = actions ? actions(row) : []
              return (
                <tr
                  key={key}
                  className={`border-b border-gray-100 dark:border-[#161616] last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[#161616]' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-3 py-2 text-[13px] text-gray-900 dark:text-[#f5f0e8]">
                      {col.render(row)}
                    </td>
                  ))}
                  {actions && (
                    <td
                      className="px-3 py-2 relative"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        aria-label="Hành động"
                        className="text-gray-400 dark:text-[#555] hover:text-gray-500 dark:hover:text-[#888] text-[14px] w-8 h-8 flex items-center justify-center"
                        onClick={() => setOpenActionKey(openActionKey === key ? null : key)}
                      >
                        ⋯
                      </button>
                      {openActionKey === key && (
                        <div className="absolute right-0 top-full z-20 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded shadow-lg min-w-[120px] overflow-hidden">
                          {rowActions.map((action, i) => (
                            <button
                              key={i}
                              className={`w-full text-left px-3 py-2 text-[11px] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] ${action.destructive ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-[#888]'}`}
                              onClick={() => { action.onClick(); setOpenActionKey(null) }}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3">
          <span className="text-[9px] text-gray-400 dark:text-[#444]">Trang {page + 1} / {totalPages}</span>
          <div className="flex gap-1">
            <button
              className="text-[10px] text-gray-400 dark:text-[#555] border border-gray-200 dark:border-[#222] px-2 py-1 rounded disabled:opacity-40"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
            >←</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`text-[10px] border px-2 py-1 rounded ${
                  i === page
                    ? 'text-gold border-gold/30 dark:border-[#C9A84C44] bg-amber-50 dark:bg-[#1c1a10]'
                    : 'text-gray-400 dark:text-[#555] border-gray-200 dark:border-[#222]'
                }`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="text-[10px] text-gray-400 dark:text-[#555] border border-gray-200 dark:border-[#222] px-2 py-1 rounded disabled:opacity-40"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
            >→</button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update menu-detail-dialog.tsx**

Replace entire `src/components/admin/menu-detail-dialog.tsx`:

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import type { MenuItem, Category } from '@/data/menu'

interface Props {
  item: MenuItem | null
  categories: Category[]
  open: boolean
  onClose: () => void
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
}

export default function MenuDetailDialog({ item, categories, open, onClose, onEdit, onDelete }: Props) {
  if (!item) return null
  const menuItem = item

  const catLabel = categories.find(c => c.id === menuItem.category)?.label ?? menuItem.category

  function handleDelete() {
    if (!window.confirm(`Xóa "${menuItem.name}"?`)) return
    onDelete(menuItem)
  }

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a] text-gray-900 dark:text-[#f5f0e8] p-0 max-w-sm overflow-hidden">
        {menuItem.image ? (
          <img
            src={menuItem.image}
            alt={menuItem.name}
            className="w-full aspect-video object-cover"
          />
        ) : (
          <div className="w-full aspect-video bg-gray-100 dark:bg-[#111] flex items-center justify-center text-gray-300 dark:text-[#333] text-[11px] tracking-widest uppercase">
            Không có ảnh
          </div>
        )}
        <div className="p-4">
          <DialogTitle className="font-display text-gold text-[18px] font-semibold mb-1">{menuItem.name}</DialogTitle>
          <DialogDescription className="sr-only">Chi tiết món ăn</DialogDescription>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-gray-400 dark:text-[#555] border border-gray-200 dark:border-[#2a2a2a] px-2 py-0.5 rounded-full">
              {catLabel}
            </span>
            <span className="text-gold text-[16px] font-medium">{menuItem.price}</span>
          </div>
          {menuItem.description && (
            <p className="text-[12px] text-gray-500 dark:text-[#888] leading-relaxed mb-4">{menuItem.description}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(menuItem)}
              className="flex-1 bg-gold text-brand-dark text-[10px] font-bold tracking-[0.1em] py-2 rounded"
            >
              SỬA
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 border border-red-900/30 text-red-400 text-[10px] tracking-[0.1em] py-2 rounded hover:bg-red-900/10"
            >
              XÓA
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Update menu-item-form.tsx**

Replace entire `src/components/admin/menu-item-form.tsx`:

```typescript
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { MenuItem, Category } from '@/data/menu'

interface Props {
  categories: Category[]
  initial?: MenuItem
  onSave: (data: Omit<MenuItem, 'id'>) => void
  onCancel: () => void
}

const inputCls = 'w-full bg-white dark:bg-[#111] border border-gray-300 dark:border-[#333] rounded px-3 py-2 text-[13px] text-gray-900 dark:text-[#f5f0e8] focus:border-gold/30 outline-none'
const labelCls = 'text-[10px] tracking-[0.15em] text-gray-400 dark:text-[#555] uppercase block mb-1'

export default function MenuItemForm({ categories, initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial?.price ?? '')
  const [image, setImage] = useState(initial?.image ?? '')
  const [category, setCategory] = useState(initial?.category ?? categories[0]?.id ?? '')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSave({ name, description, price, image, category })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="mf-name" className={labelCls}>Tên món</label>
        <input id="mf-name" required value={name} onChange={e => setName(e.target.value)}
          className={inputCls} />
      </div>
      <div>
        <label htmlFor="mf-desc" className={labelCls}>Mô tả</label>
        <textarea id="mf-desc" value={description} onChange={e => setDescription(e.target.value)} rows={2}
          className={`${inputCls} resize-none`} />
      </div>
      <div>
        <label htmlFor="mf-price" className={labelCls}>Giá (vd: 185.000đ)</label>
        <input id="mf-price" required value={price} onChange={e => setPrice(e.target.value)}
          className={inputCls} />
      </div>
      <div>
        <label htmlFor="mf-image" className={labelCls}>URL ảnh</label>
        <input id="mf-image" value={image} onChange={e => setImage(e.target.value)}
          className={inputCls} />
      </div>
      <div>
        <label htmlFor="mf-cat" className={labelCls}>Danh mục</label>
        <select id="mf-cat" value={category} onChange={e => setCategory(e.target.value)}
          className={inputCls}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 border border-gray-300 dark:border-[#333] text-gray-500 dark:text-[#888] text-[11px] tracking-[0.1em] py-2.5 rounded">
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

- [ ] **Step 4: Update table-form.tsx**

Replace entire `src/components/admin/table-form.tsx`:

```typescript
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Table } from '@/data/tables'

interface Props {
  initial?: Table
  onSave: (data: Omit<Table, 'id'>) => void
  onCancel: () => void
}

const inputCls = 'w-full bg-white dark:bg-[#111] border border-gray-300 dark:border-[#333] rounded px-3 py-2 text-[13px] text-gray-900 dark:text-[#f5f0e8] focus:border-gold/30 outline-none'
const labelCls = 'text-[10px] tracking-[0.15em] text-gray-400 dark:text-[#555] uppercase block mb-1'

export default function TableForm({ initial, onSave, onCancel }: Props) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [seats, setSeats] = useState(initial?.seats ?? 4)
  const [gridCol, setGridCol] = useState(initial?.gridCol ?? 1)
  const [gridRow, setGridRow] = useState(initial?.gridRow ?? 1)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSave({ label, seats, gridCol, gridRow })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="tf-label" className={labelCls}>Tên bàn</label>
        <input id="tf-label" required value={label} onChange={e => setLabel(e.target.value)}
          className={inputCls} />
      </div>
      <div>
        <label htmlFor="tf-seats" className={labelCls}>Số chỗ ngồi</label>
        <input id="tf-seats" type="number" min={1} max={20} required value={seats}
          onChange={e => setSeats(Math.max(1, Number(e.target.value) || 1))}
          className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="tf-col" className={labelCls}>Cột (1–4)</label>
          <input id="tf-col" type="number" min={1} max={4} required value={gridCol}
            onChange={e => setGridCol(Math.min(4, Math.max(1, Number(e.target.value) || 1)))}
            className={inputCls} />
        </div>
        <div>
          <label htmlFor="tf-row" className={labelCls}>Hàng (1–3)</label>
          <input id="tf-row" type="number" min={1} max={3} required value={gridRow}
            onChange={e => setGridRow(Math.min(3, Math.max(1, Number(e.target.value) || 1)))}
            className={inputCls} />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 border border-gray-300 dark:border-[#333] text-gray-500 dark:text-[#888] text-[11px] tracking-[0.1em] py-2.5 rounded">
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

- [ ] **Step 5: Update pin-gate.tsx**

Replace entire `src/components/admin/pin-gate.tsx`:

```typescript
import { useState } from 'react'
import type { FormEvent } from 'react'

interface Props {
  correctPin: string
  onSuccess: () => void
}

export default function PinGate({ correctPin, onSuccess }: Props) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (input === correctPin) {
      onSuccess()
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-darker flex items-center justify-center">
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-8 w-full max-w-sm">
        <p className="font-display text-gold text-center text-xl mb-2">THE TERMINAL</p>
        <p className="text-[10px] tracking-[0.2em] text-gray-400 dark:text-[#555] text-center uppercase mb-8">Quản lý</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            placeholder="Nhập PIN"
            autoFocus
            className="w-full bg-white dark:bg-[#111] border border-gray-300 dark:border-[#333] rounded px-4 py-3 text-center text-gray-900 dark:text-[#f5f0e8] text-lg tracking-[0.3em] outline-none focus:border-gold/30"
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

- [ ] **Step 6: Run full test suite**

```bash
npm run test
```

Expected: all tests pass, no regressions

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/data-table.tsx src/components/admin/menu-detail-dialog.tsx src/components/admin/menu-item-form.tsx src/components/admin/table-form.tsx src/components/admin/pin-gate.tsx
git commit -m "feat: add dark/light variants to shared admin components"
```

---

### Task 3: Dark/light variants for admin pages

**Files:**
- Modify: `src/pages/admin/admin-dashboard.tsx`
- Modify: `src/pages/admin/admin-menu.tsx`
- Modify: `src/pages/admin/admin-tables.tsx`
- Modify: `src/pages/admin/admin-settings.tsx`

No new tests — color class additions only. Verify via existing suite.

- [ ] **Step 1: Update admin-dashboard.tsx**

Replace entire `src/pages/admin/admin-dashboard.tsx`:

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
      <p className="text-[10px] tracking-[0.2em] text-gray-400 dark:text-[#555] uppercase mb-6">Tổng quan</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <button
            key={s.label}
            onClick={() => navigate(s.to)}
            className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded p-5 text-left hover:border-gold/30 transition-colors"
          >
            <p className="font-display text-3xl font-bold text-gold mb-1">{s.value}</p>
            <p className="text-[10px] tracking-[0.15em] text-gray-400 dark:text-[#555] uppercase">{s.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update admin-menu.tsx**

The `DataTable` and `MenuDetailDialog` inside get their colors from their own files (updated in Task 2). Only the page header and the add/edit modal overlay need updates.

Replace entire `src/pages/admin/admin-menu.tsx`:

```typescript
import { useState } from 'react'
import { toast } from 'sonner'
import { useMenuData } from '@/hooks/useMenuData'
import MenuItemForm from '@/components/admin/menu-item-form'
import MenuDetailDialog from '@/components/admin/menu-detail-dialog'
import { DataTable } from '@/components/ui/data-table'
import type { ColumnDef } from '@/components/ui/data-table'
import type { MenuItem } from '@/data/menu'

function parsePrice(price: string): number {
  return parseInt(price.replace(/\D/g, ''), 10) || 0
}

export default function AdminMenuPage() {
  const { items, categories, addItem, updateItem, deleteItem } = useMenuData()
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [adding, setAdding] = useState(false)

  function handleEdit(item: MenuItem) {
    setSelectedItem(null)
    setEditingItem(item)
  }

  function handleDelete(item: MenuItem) {
    deleteItem(item.id)
    setSelectedItem(null)
    toast.success('Đã xóa món')
  }

  const columns: ColumnDef<MenuItem>[] = [
    {
      key: 'img',
      header: '',
      width: '48px',
      render: item =>
        item.image ? (
          <img src={item.image} alt={item.name} className="w-9 h-9 object-cover rounded" />
        ) : (
          <div className="w-9 h-9 bg-gray-100 dark:bg-[#1a1a1a] rounded" />
        ),
    },
    {
      key: 'name',
      header: 'Tên món',
      render: item => <span className="text-gray-900 dark:text-[#f5f0e8]">{item.name}</span>,
    },
    {
      key: 'category',
      header: 'Danh mục',
      render: item => {
        const cat = categories.find(c => c.id === item.category)
        return <span className="text-gray-400 dark:text-[#555]">{cat?.label ?? item.category}</span>
      },
    },
    {
      key: 'price',
      header: 'Giá',
      render: item => <span className="text-gold">{item.price}</span>,
    },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[10px] tracking-[0.2em] text-gray-400 dark:text-[#555] uppercase">Quản lý thực đơn</h1>
        <button
          onClick={() => setAdding(true)}
          disabled={categories.length === 0}
          className="bg-gold text-brand-dark text-[11px] tracking-[0.15em] font-bold px-4 py-2 rounded disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + THÊM MÓN
        </button>
      </div>

      {(adding || editingItem) && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => { setAdding(false); setEditingItem(null) }}
        >
          <div
            className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-[10px] tracking-[0.2em] text-gray-400 dark:text-[#555] uppercase mb-4">
              {editingItem ? 'Sửa món' : 'Thêm món mới'}
            </p>
            <MenuItemForm
              categories={categories}
              initial={editingItem ?? undefined}
              onSave={data => {
                if (editingItem) {
                  updateItem(editingItem.id, data)
                  toast.success('Đã cập nhật món')
                } else {
                  addItem(data)
                  toast.success('Đã thêm món mới')
                }
                setEditingItem(null)
                setAdding(false)
              }}
              onCancel={() => { setEditingItem(null); setAdding(false) }}
            />
          </div>
        </div>
      )}

      {categories.length === 0 && (
        <p className="text-gray-400 dark:text-[#555] text-[12px] text-center py-8">
          Chưa có danh mục. Hãy thêm danh mục trước khi thêm món.
        </p>
      )}

      <DataTable
        data={items}
        columns={columns}
        getRowKey={item => item.id}
        searchPlaceholder="Tìm kiếm món ăn..."
        searchFn={(item, q) => item.name.toLowerCase().includes(q.toLowerCase())}
        filter={{
          placeholder: 'Tất cả danh mục',
          options: categories.map(c => ({ label: c.label, value: c.id })),
          fn: (item, val) => item.category === val,
        }}
        sorts={[
          { label: 'Tên A→Z', fn: (a, b) => a.name.localeCompare(b.name) },
          { label: 'Tên Z→A', fn: (a, b) => b.name.localeCompare(a.name) },
          { label: 'Giá tăng dần', fn: (a, b) => parsePrice(a.price) - parsePrice(b.price) },
          { label: 'Giá giảm dần', fn: (a, b) => parsePrice(b.price) - parsePrice(a.price) },
        ]}
        onRowClick={item => setSelectedItem(item)}
        actions={item => [
          { label: 'Sửa món', onClick: () => handleEdit(item) },
          {
            label: 'Xóa món',
            destructive: true,
            onClick: () => {
              if (!window.confirm(`Xóa "${item.name}"?`)) return
              handleDelete(item)
            },
          },
        ]}
      />

      <MenuDetailDialog
        item={selectedItem}
        categories={categories}
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
```

- [ ] **Step 3: Update admin-tables.tsx**

Replace entire `src/pages/admin/admin-tables.tsx`:

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
        <h1 className="text-[10px] tracking-[0.2em] text-gray-400 dark:text-[#555] uppercase">Quản lý bàn</h1>
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
            className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-[10px] tracking-[0.2em] text-gray-400 dark:text-[#555] uppercase mb-4">
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
          <div key={table.id} className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded p-4">
            <p className="text-[14px] text-gray-900 dark:text-[#f5f0e8] font-medium mb-1">{table.label}</p>
            <p className="text-[10px] text-gray-400 dark:text-[#555] mb-3">
              {table.seats} chỗ · Cột {table.gridCol}, Hàng {table.gridRow}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(table)}
                className="flex-1 text-[10px] tracking-[0.1em] text-gray-500 dark:text-[#888] border border-gray-300 dark:border-[#333] py-1.5 rounded hover:text-gray-900 dark:hover:text-[#f5f0e8]"
              >
                SỬA
              </button>
              <button
                onClick={() => {
                  if (!window.confirm(`Xóa "${table.label}"?`)) return
                  deleteTable(table.id)
                  toast.success('Đã xóa bàn')
                }}
                className="flex-1 text-[10px] tracking-[0.1em] text-red-400 border border-red-900/30 py-1.5 rounded hover:bg-red-900/10"
              >
                XÓA
              </button>
            </div>
          </div>
        ))}
        {tables.length === 0 && (
          <p className="text-gray-400 dark:text-[#555] text-[12px] text-center py-8 col-span-1 sm:col-span-2 lg:col-span-3">Chưa có bàn nào</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Update admin-settings.tsx**

Replace entire `src/pages/admin/admin-settings.tsx`:

```typescript
import { useState } from 'react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/useSettings'

export default function AdminSettingsPage() {
  const { settings, updateSettings } = useSettings()
  const [form, setForm] = useState({ ...settings })
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  function handleInfoSubmit(e: FormEvent<HTMLFormElement>) {
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

  function handlePinSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (newPin.length < 4) {
      toast.error('PIN phải có ít nhất 4 ký tự')
      return
    }
    if (!/^\d+$/.test(newPin)) {
      toast.error('PIN chỉ được chứa chữ số')
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

  const inputCls = 'w-full bg-white dark:bg-[#111] border border-gray-300 dark:border-[#333] rounded px-3 py-2 text-[13px] text-gray-900 dark:text-[#f5f0e8] focus:border-gold/30 outline-none'
  const labelCls = 'text-[10px] tracking-[0.15em] text-gray-400 dark:text-[#555] uppercase block mb-1'

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-[10px] tracking-[0.2em] text-gray-400 dark:text-[#555] uppercase mb-6">Cài đặt nhà hàng</h1>

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
            onChange={e => {
              const pct = Math.max(0, Math.min(100, Number(e.target.value) || 0))
              setForm(f => ({ ...f, vatRate: pct / 100 }))
            }}
            className={inputCls} />
        </div>
        <button type="submit" className="bg-gold text-brand-dark font-bold text-[11px] tracking-[0.2em] px-6 py-2.5 rounded">
          LƯU CÀI ĐẶT
        </button>
      </form>

      <div className="border-t border-gray-200 dark:border-[#2a2a2a] pt-8">
        <p className="text-[10px] tracking-[0.2em] text-gray-400 dark:text-[#555] uppercase mb-4">Đổi PIN quản lý</p>
        <form onSubmit={handlePinSubmit} className="space-y-4 max-w-xs">
          <div>
            <label htmlFor="pin-new" className={labelCls}>PIN mới</label>
            <input id="pin-new" type="password" inputMode="numeric" value={newPin}
              autoComplete="new-password" maxLength={8} pattern="\d*"
              onChange={e => setNewPin(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="pin-confirm" className={labelCls}>Xác nhận PIN</label>
            <input id="pin-confirm" type="password" inputMode="numeric" value={confirmPin}
              autoComplete="new-password" maxLength={8} pattern="\d*"
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

- [ ] **Step 5: Run full test suite**

```bash
npm run test
```

Expected: all tests pass

- [ ] **Step 6: Confirm build passes**

```bash
npm run build
```

Expected: no TypeScript errors

- [ ] **Step 7: Commit**

```bash
git add src/pages/admin/admin-dashboard.tsx src/pages/admin/admin-menu.tsx src/pages/admin/admin-tables.tsx src/pages/admin/admin-settings.tsx
git commit -m "feat: add dark/light variants to admin pages"
```
