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
