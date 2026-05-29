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
