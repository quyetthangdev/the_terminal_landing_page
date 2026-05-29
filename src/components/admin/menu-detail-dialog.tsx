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
          <DialogTitle className="font-display text-gold text-[18px] font-semibold mb-1">{item.name}</DialogTitle>
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
