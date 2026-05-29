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
          <p className="text-[#555] text-[12px] text-center py-8 col-span-3">Chưa có bàn nào</p>
        )}
      </div>
    </div>
  )
}
