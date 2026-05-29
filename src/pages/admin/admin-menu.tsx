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
