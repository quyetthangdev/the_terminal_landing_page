# DataTable Component Design

## Goal

Build a generic, reusable `DataTable` component with search, filter, sort, and pagination built in. Wire it into the admin menu page, replacing the manual list and category tabs. Row click opens a detail dialog; action column (⋯) exposes edit and delete.

## Architecture

**New files:**
- `src/components/ui/data-table.tsx` — generic DataTable component
- `src/components/admin/menu-detail-dialog.tsx` — read-only detail dialog for a menu item
- `src/__tests__/data-table.test.tsx`
- `src/__tests__/menu-detail-dialog.test.tsx`

**Modified files:**
- `src/pages/admin/admin-menu.tsx` — replace manual list + category tabs with DataTable + MenuDetailDialog

## DataTable Component

### Props

```typescript
interface ColumnDef<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
}

interface FilterDef<T> {
  placeholder: string
  options: { label: string; value: string }[]
  fn: (row: T, value: string) => boolean
}

interface SortDef<T> {
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
  pageSize?: number          // default 10
  onRowClick?: (row: T) => void
  actions?: (row: T) => {
    label: string
    onClick: () => void
    destructive?: boolean
  }[]
}
```

### Internal state

- `search: string` — text input value
- `filterValue: string` — selected filter option value (`''` = all)
- `sortIndex: number` — index into `sorts[]` (`-1` = no sort)
- `page: number` — current page, 0-indexed

### Render pipeline

```
data
  → filtered by searchFn(row, search) if search non-empty
  → filtered by filter.fn(row, filterValue) if filterValue non-empty
  → sorted by sorts[sortIndex].fn if sortIndex >= 0
  → paginated: slice(page * pageSize, (page + 1) * pageSize)
  → rendered as table rows
```

### Toolbar layout

Single row, flex, gap-2:
- Search input (`flex-1`): filters via `searchFn`
- Filter select (min-w-[130px]): "All" option + dynamic options from `filter.options`; hidden if no `filter` prop
- Sort select (min-w-[120px]): "Sắp xếp" default option + sort options; hidden if `sorts` is empty

### Table layout

- Table header row: one `<th>` per column + one `<th>` for action column (hidden if no `actions`)
- Table rows: `cursor-pointer` if `onRowClick` provided; hover highlight `hover:bg-[#161616]`
- Action column: renders `⋯` button; click opens dropdown (absolute positioned) with action items; `destructive: true` items render red
- Row click fires `onRowClick(row)` only when the click target is NOT the action column

### Result count + Pagination

- Result count line: `"N MÓN · HIỂN THỊ X–Y"` above table
- Pagination bar below table: prev/next arrows + page number buttons; hidden if total pages ≤ 1
- Page resets to 0 when search, filter, or sort changes

### Empty state

When filtered result count is 0: centered message `"Không tìm thấy kết quả"` spanning full table width.

## MenuDetailDialog Component

Uses the existing shadcn `Dialog` from `src/components/ui/dialog.tsx`.

### Props

```typescript
interface Props {
  item: MenuItem | null
  categories: Category[]
  open: boolean
  onClose: () => void
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
}
```

### Content

- Large item image (full width, aspect-video, object-cover); fallback gray if no image
- Item name (font-display, text-gold)
- Category badge (pill)
- Price (text-gold, large)
- Description text
- Two action buttons: "SỬA" (gold) and "XÓA" (red, with `window.confirm` before calling `onDelete`)

## AdminMenuPage updates

Remove:
- Category tab row
- `activeCat` state
- Manual `filtered` list
- Inline modal for add/edit (keep `MenuItemForm` but trigger from DataTable actions)

Add:
- `selectedItem: MenuItem | null` state — for detail dialog
- `<MenuDetailDialog>` wired to `selectedItem`
- `<DataTable>` with menu-specific column defs, search, filter (categories), and sort options

```tsx
<DataTable
  data={items}
  columns={[
    { key: 'img', header: '', render: item => <img ... /> },
    { key: 'name', header: 'Tên món', render: item => item.name },
    { key: 'category', header: 'Danh mục', render: item => catLabel(item.category) },
    { key: 'price', header: 'Giá', render: item => item.price },
  ]}
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
    { label: 'Sửa món', onClick: () => setEditingItem(item) },
    { label: 'Xóa món', onClick: () => handleDelete(item), destructive: true },
  ]}
/>
```

`parsePrice` strips non-digits: `parseInt(price.replace(/\D/g, ''), 10)` — already exists in `menu-panel.tsx`.

## Styling

Consistent with existing admin pages:
- Dark background `bg-[#0e0e0e]` / `bg-[#111]` / `bg-[#1a1a1a]`
- Borders `border-[#1e1e1e]` / `border-[#2a2a2a]`
- Gold accent `text-gold` / `border-[#C9A84C44]`
- Muted text `text-[#555]` / `text-[#888]`
- Body text `text-[#f5f0e8]`
- Input/select: `bg-[#111] border border-[#2a2a2a] rounded px-3 py-2 text-[13px] text-[#f5f0e8] outline-none`

## Tests

### `data-table.test.tsx`
- Search filters rows by matching `searchFn`
- Filter dropdown filters rows
- Sort reorders rows
- Pagination: page 1 shows `pageSize` rows; next page shows remainder
- `onRowClick` called with correct row when row clicked
- `onRowClick` NOT called when action button clicked
- Actions dropdown renders; destructive item has red color class
- Empty state shown when no rows match

### `menu-detail-dialog.test.tsx`
- Renders item name, price, category label, description
- Renders image when present; fallback when image is empty string
- Sửa button calls `onEdit` with item
- Xóa button calls `window.confirm`, then `onDelete` if confirmed
- Xóa button does NOT call `onDelete` if confirm cancelled

### `admin-menu.test.tsx` (update existing)
- Row click opens `MenuDetailDialog` with correct item
- Action "Sửa" opens edit form with item pre-filled
- Action "Xóa" calls `deleteItem` after confirm
