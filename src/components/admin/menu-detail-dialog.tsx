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
