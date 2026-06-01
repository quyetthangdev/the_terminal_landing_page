# DataTable Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a generic `DataTable<T>` component with search, filter, sort, pagination, and action dropdowns, then wire it into the admin menu page replacing category tabs.

**Architecture:** Three independent tasks: (1) the generic `DataTable` component + tests, (2) the `MenuDetailDialog` component + tests, (3) rewire `AdminMenuPage` to use both new components + update existing tests.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v3, Vitest + @testing-library/react, shadcn/ui Dialog (Radix)

---

### Task 1: DataTable component

**Files:**
- Create: `src/components/ui/data-table.tsx`
- Create: `src/__tests__/data-table.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/data-table.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DataTable } from '@/components/ui/data-table'

interface Row { id: string; name: string; value: number }

const rows: Row[] = [
  { id: '1', name: 'Alpha', value: 10 },
  { id: '2', name: 'Beta', value: 20 },
  { id: '3', name: 'Gamma', value: 30 },
]

const columns = [
  { key: 'name', header: 'Name', render: (r: Row) => r.name },
  { key: 'value', header: 'Value', render: (r: Row) => String(r.value) },
]

describe('DataTable', () => {
  it('renders all rows', () => {
    render(<DataTable data={rows} columns={columns} getRowKey={r => r.id} />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('Gamma')).toBeInTheDocument()
  })

  it('filters rows by search', () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={r => r.id}
        searchFn={(r, q) => r.name.toLowerCase().includes(q.toLowerCase())}
      />
    )
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'alp' } })
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
  })

  it('filters rows by filter dropdown', () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={r => r.id}
        filter={{
          placeholder: 'All',
          options: [{ label: 'High', value: 'high' }],
          fn: (r, v) => v === 'high' ? r.value > 15 : true,
        }}
      />
    )
    fireEvent.change(screen.getByRole('combobox', { name: /lọc/i }), { target: { value: 'high' } })
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('Gamma')).toBeInTheDocument()
  })

  it('sorts rows', () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={r => r.id}
        sorts={[
          { label: 'Name Z→A', fn: (a, b) => b.name.localeCompare(a.name) },
        ]}
      />
    )
    fireEvent.change(screen.getByRole('combobox', { name: /sắp xếp/i }), { target: { value: '0' } })
    const cells = screen.getAllByRole('cell')
    expect(cells[0].textContent).toBe('Gamma')
  })

  it('paginates: page 1 shows pageSize rows', () => {
    const manyRows: Row[] = Array.from({ length: 15 }, (_, i) => ({
      id: String(i), name: `Row${i}`, value: i,
    }))
    render(<DataTable data={manyRows} columns={columns} getRowKey={r => r.id} pageSize={5} />)
    expect(screen.getByText('Row0')).toBeInTheDocument()
    expect(screen.queryByText('Row5')).not.toBeInTheDocument()
  })

  it('paginates: next page shows remainder', () => {
    const manyRows: Row[] = Array.from({ length: 7 }, (_, i) => ({
      id: String(i), name: `Row${i}`, value: i,
    }))
    render(<DataTable data={manyRows} columns={columns} getRowKey={r => r.id} pageSize={5} />)
    fireEvent.click(screen.getByText('2'))
    expect(screen.getByText('Row5')).toBeInTheDocument()
    expect(screen.getByText('Row6')).toBeInTheDocument()
  })

  it('calls onRowClick with correct row when row clicked', () => {
    const onRowClick = vi.fn()
    render(
      <DataTable data={rows} columns={columns} getRowKey={r => r.id} onRowClick={onRowClick} />
    )
    fireEvent.click(screen.getByText('Alpha'))
    expect(onRowClick).toHaveBeenCalledWith(rows[0])
  })

  it('does not call onRowClick when action button clicked', () => {
    const onRowClick = vi.fn()
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={r => r.id}
        onRowClick={onRowClick}
        actions={r => [{ label: `Edit ${r.name}`, onClick: vi.fn() }]}
      />
    )
    const actionBtns = screen.getAllByRole('button', { name: /hành động/i })
    fireEvent.click(actionBtns[0])
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('renders action dropdown with destructive item in red', () => {
    render(
      <DataTable
        data={[rows[0]]}
        columns={columns}
        getRowKey={r => r.id}
        actions={() => [
          { label: 'Edit', onClick: vi.fn() },
          { label: 'Delete', onClick: vi.fn(), destructive: true },
        ]}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /hành động/i }))
    expect(screen.getByText('Edit')).toBeInTheDocument()
    const deleteBtn = screen.getByText('Delete')
    expect(deleteBtn).toHaveClass('text-red-400')
  })

  it('shows empty state when no rows match', () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={r => r.id}
        searchFn={(r, q) => r.name.toLowerCase().includes(q.toLowerCase())}
      />
    )
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ZZZZZ' } })
    expect(screen.getByText('Không tìm thấy kết quả')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/__tests__/data-table.test.tsx
```

Expected: FAIL — "Cannot find module '@/components/ui/data-table'"

- [ ] **Step 3: Write the DataTable component**

Create `src/components/ui/data-table.tsx`:

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
          className="flex-1 bg-[#111] border border-[#2a2a2a] rounded px-3 py-2 text-[13px] text-[#f5f0e8] outline-none placeholder-[#555]"
          placeholder={searchPlaceholder}
          value={search}
          onChange={e => { setSearch(e.target.value); resetPage() }}
        />
        {filter && (
          <select
            aria-label="Lọc danh mục"
            className="bg-[#111] border border-[#2a2a2a] rounded px-3 py-2 text-[13px] text-[#f5f0e8] outline-none min-w-[130px]"
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
            className="bg-[#111] border border-[#2a2a2a] rounded px-3 py-2 text-[13px] text-[#f5f0e8] outline-none min-w-[120px]"
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

      <div className="text-[9px] text-[#444] tracking-[0.1em] mb-2">
        {totalCount} MÓN · HIỂN THỊ {totalCount === 0 ? '0' : start + 1}–{Math.min(end, totalCount)}
      </div>

      <div className="bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e1e] bg-[#151515]">
              {columns.map(col => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className="text-left text-[9px] text-[#444] tracking-[0.1em] uppercase px-3 py-2 font-normal"
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
                  className="text-center text-[#555] text-[12px] py-8"
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
                  className={`border-b border-[#161616] last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-[#161616]' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-3 py-2 text-[13px] text-[#f5f0e8]">
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
                        className="text-[#555] hover:text-[#888] text-[14px] w-8 h-8 flex items-center justify-center"
                        onClick={() => setOpenActionKey(openActionKey === key ? null : key)}
                      >
                        ⋯
                      </button>
                      {openActionKey === key && (
                        <div className="absolute right-0 top-full z-20 bg-[#1e1e1e] border border-[#2a2a2a] rounded shadow-lg min-w-[120px] overflow-hidden">
                          {rowActions.map((action, i) => (
                            <button
                              key={i}
                              className={`w-full text-left px-3 py-2 text-[11px] hover:bg-[#2a2a2a] ${action.destructive ? 'text-red-400' : 'text-[#888]'}`}
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
          <span className="text-[9px] text-[#444]">Trang {page + 1} / {totalPages}</span>
          <div className="flex gap-1">
            <button
              className="text-[10px] text-[#555] border border-[#222] px-2 py-1 rounded disabled:opacity-40"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
            >←</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`text-[10px] border px-2 py-1 rounded ${
                  i === page ? 'text-gold border-[#C9A84C44] bg-[#1c1a10]' : 'text-[#555] border-[#222]'
                }`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="text-[10px] text-[#555] border border-[#222] px-2 py-1 rounded disabled:opacity-40"
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

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/data-table.test.tsx
```

Expected: PASS — 9 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/data-table.tsx src/__tests__/data-table.test.tsx
git commit -m "feat: add generic DataTable component with search, filter, sort, pagination, actions"
```

---

### Task 2: MenuDetailDialog component

**Files:**
- Create: `src/components/admin/menu-detail-dialog.tsx`
- Create: `src/__tests__/menu-detail-dialog.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/menu-detail-dialog.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MenuDetailDialog from '@/components/admin/menu-detail-dialog'
import type { MenuItem, Category } from '@/data/menu'

const cats: Category[] = [{ id: 'appetizers', label: 'Khai Vị' }]

const item: MenuItem = {
  id: 'i1',
  name: 'Gỏi cuốn',
  description: 'Fresh spring rolls',
  price: '85.000đ',
  image: 'https://example.com/img.jpg',
  category: 'appetizers',
}

function renderDialog(overrides: Partial<{
  item: MenuItem | null
  categories: Category[]
  open: boolean
  onClose: () => void
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
}> = {}) {
  const props = {
    item,
    categories: cats,
    open: true,
    onClose: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  }
  return render(<MenuDetailDialog {...props} />)
}

describe('MenuDetailDialog', () => {
  it('renders name, price, category label, description', () => {
    renderDialog()
    expect(screen.getByText('Gỏi cuốn')).toBeInTheDocument()
    expect(screen.getByText('85.000đ')).toBeInTheDocument()
    expect(screen.getByText('Khai Vị')).toBeInTheDocument()
    expect(screen.getByText('Fresh spring rolls')).toBeInTheDocument()
  })

  it('renders image when present', () => {
    renderDialog()
    const img = screen.getByRole('img', { name: 'Gỏi cuốn' })
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg')
  })

  it('renders fallback when image is empty string', () => {
    renderDialog({ item: { ...item, image: '' } })
    expect(screen.getByText(/không có ảnh/i)).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('SỬA button calls onEdit with item', () => {
    const onEdit = vi.fn()
    renderDialog({ onEdit })
    fireEvent.click(screen.getByRole('button', { name: /sửa/i }))
    expect(onEdit).toHaveBeenCalledWith(item)
  })

  it('XÓA button calls window.confirm then onDelete if confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const onDelete = vi.fn()
    renderDialog({ onDelete })
    fireEvent.click(screen.getByRole('button', { name: /xóa/i }))
    expect(window.confirm).toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalledWith(item)
    vi.restoreAllMocks()
  })

  it('XÓA button does NOT call onDelete if confirm cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const onDelete = vi.fn()
    renderDialog({ onDelete })
    fireEvent.click(screen.getByRole('button', { name: /xóa/i }))
    expect(onDelete).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/__tests__/menu-detail-dialog.test.tsx
```

Expected: FAIL — "Cannot find module '@/components/admin/menu-detail-dialog'"

- [ ] **Step 3: Write the MenuDetailDialog component**

Create `src/components/admin/menu-detail-dialog.tsx`:

```typescript
import {
  Dialog,
  DialogContent,
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

  const catLabel = categories.find(c => c.id === item.category)?.label ?? item.category

  function handleDelete() {
    if (!window.confirm(`Xóa "${item!.name}"?`)) return
    onDelete(item!)
  }

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#f5f0e8] p-0 max-w-sm overflow-hidden">
        <DialogTitle className="sr-only">{item.name}</DialogTitle>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full aspect-video object-cover"
          />
        ) : (
          <div className="w-full aspect-video bg-[#111] flex items-center justify-center text-[#333] text-[11px] tracking-widest uppercase">
            Không có ảnh
          </div>
        )}
        <div className="p-4">
          <h2 className="font-display text-gold text-[18px] font-semibold mb-1">{item.name}</h2>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-[#555] border border-[#2a2a2a] px-2 py-0.5 rounded-full">
              {catLabel}
            </span>
            <span className="text-gold text-[16px] font-medium">{item.price}</span>
          </div>
          {item.description && (
            <p className="text-[12px] text-[#888] leading-relaxed mb-4">{item.description}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
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

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/menu-detail-dialog.test.tsx
```

Expected: PASS — 6 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/menu-detail-dialog.tsx src/__tests__/menu-detail-dialog.test.tsx
git commit -m "feat: add MenuDetailDialog with image, category badge, SỬA/XÓA actions"
```

---

### Task 3: Update AdminMenuPage

**Files:**
- Modify: `src/pages/admin/admin-menu.tsx`
- Modify: `src/__tests__/admin-menu.test.tsx`

- [ ] **Step 1: Write updated tests**

Replace the entire `src/__tests__/admin-menu.test.tsx` with:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import MenuItemForm from '@/components/admin/menu-item-form'
import AdminMenuPage from '@/pages/admin/admin-menu'
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

const mockDeleteItem = vi.fn()
const mockAddItem = vi.fn()
const mockUpdateItem = vi.fn()

vi.mock('@/hooks/useMenuData', () => ({
  useMenuData: () => ({
    items: [
      { id: 'item1', name: 'Gỏi cuốn', description: 'Fresh rolls', price: '85.000đ', image: '', category: 'appetizers' },
    ],
    categories: [{ id: 'appetizers', label: 'Khai Vị' }],
    addItem: mockAddItem,
    updateItem: mockUpdateItem,
    deleteItem: mockDeleteItem,
  }),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn() } }))

describe('AdminMenuPage', () => {
  beforeEach(() => {
    mockDeleteItem.mockClear()
    mockAddItem.mockClear()
    mockUpdateItem.mockClear()
  })

  it('renders item in DataTable', () => {
    render(<MemoryRouter><AdminMenuPage /></MemoryRouter>)
    expect(screen.getByText('Gỏi cuốn')).toBeInTheDocument()
  })

  it('opens add modal when THÊM MÓN is clicked', () => {
    render(<MemoryRouter><AdminMenuPage /></MemoryRouter>)
    fireEvent.click(screen.getByText(/thêm món/i))
    expect(screen.getByText('Thêm món mới')).toBeInTheDocument()
  })

  it('row click opens MenuDetailDialog with correct item', () => {
    render(<MemoryRouter><AdminMenuPage /></MemoryRouter>)
    fireEvent.click(screen.getByText('Gỏi cuốn'))
    expect(screen.getByText('Fresh rolls')).toBeInTheDocument()
  })

  it('action Sửa món opens edit form', () => {
    render(<MemoryRouter><AdminMenuPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /hành động/i }))
    fireEvent.click(screen.getByText('Sửa món'))
    expect(screen.getByText('Sửa món')).toBeInTheDocument()
  })

  it('action Xóa món calls deleteItem after confirm', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<MemoryRouter><AdminMenuPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /hành động/i }))
    fireEvent.click(screen.getByText('Xóa món'))
    expect(mockDeleteItem).toHaveBeenCalledWith('item1')
    vi.restoreAllMocks()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/__tests__/admin-menu.test.tsx
```

Expected: The new AdminMenuPage tests that reference DataTable behavior fail because the page still uses the old category-tabs layout.

- [ ] **Step 3: Update AdminMenuPage**

Replace entire `src/pages/admin/admin-menu.tsx` with:

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
          <div className="w-9 h-9 bg-[#1a1a1a] rounded" />
        ),
    },
    {
      key: 'name',
      header: 'Tên món',
      render: item => <span className="text-[#f5f0e8]">{item.name}</span>,
    },
    {
      key: 'category',
      header: 'Danh mục',
      render: item => {
        const cat = categories.find(c => c.id === item.category)
        return <span className="text-[#555]">{cat?.label ?? item.category}</span>
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
        <h1 className="text-[10px] tracking-[0.2em] text-[#555] uppercase">Quản lý thực đơn</h1>
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
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-4">
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
        <p className="text-[#555] text-[12px] text-center py-8">
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

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/admin-menu.test.tsx
```

Expected: PASS — 8 tests passing (3 MenuItemForm + 5 AdminMenuPage)

- [ ] **Step 5: Run full test suite to confirm no regressions**

```bash
npm run test
```

Expected: all tests pass (prior total was 145; expect ~160+ after adding new tests)

- [ ] **Step 6: Confirm TypeScript and lint pass**

```bash
npm run build
```

Expected: no TypeScript errors, clean build

- [ ] **Step 7: Commit**

```bash
git add src/pages/admin/admin-menu.tsx src/__tests__/admin-menu.test.tsx
git commit -m "feat: replace AdminMenuPage category tabs with DataTable + MenuDetailDialog"
```
