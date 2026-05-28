import type { OrderItem } from '@/hooks/useTableSessions'

function formatVnd(n: number) {
  return n.toLocaleString('vi-VN') + 'đ'
}

interface Props {
  items: OrderItem[]
  onUpdateItem: (menuItemId: string, patch: Partial<Pick<OrderItem, 'quantity' | 'note'>>) => void
  onRemoveItem: (menuItemId: string) => void
  onPay: () => void
}

export default function OrderSummary({ items, onUpdateItem, onRemoveItem, onPay }: Props) {
  const total = items.reduce((s, i) => s + i.priceNum * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="flex flex-col h-full bg-[#111]">
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase">
          Order hiện tại{count > 0 ? ` · ${count} món` : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 && (
          <p className="text-center text-[#444] text-xs py-10">Chưa có món nào</p>
        )}
        {items.map(item => (
          <div key={item.menuItemId} className="bg-[#181818] border border-[#222] rounded p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex-1 text-[12px] text-[#c8bfaf]">{item.name}</span>
              <div className="flex items-center gap-1">
                <button
                  className="w-5 h-5 rounded bg-[#2a2a2a] text-[#888] text-sm flex items-center justify-center"
                  onClick={() => onUpdateItem(item.menuItemId, { quantity: Math.max(1, item.quantity - 1) })}
                >−</button>
                <span className="text-[13px] font-semibold text-[#e8e0d0] min-w-[16px] text-center">{item.quantity}</span>
                <button
                  className="w-5 h-5 rounded bg-[#2a2a2a] text-[#888] text-sm flex items-center justify-center"
                  onClick={() => onUpdateItem(item.menuItemId, { quantity: item.quantity + 1 })}
                >+</button>
              </div>
              <span className="text-[12px] text-gold font-semibold min-w-[70px] text-right">
                {formatVnd(item.priceNum * item.quantity)}
              </span>
              <button
                aria-label="Xoá món"
                className="text-[#444] hover:text-[#e07b39] transition-colors"
                onClick={() => onRemoveItem(item.menuItemId)}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2,4 14,4"/><path d="M6 4V2h4v2"/>
                  <rect x="3" y="4" width="10" height="10" rx="1"/>
                  <line x1="6" y1="7" x2="6" y2="11"/><line x1="10" y1="7" x2="10" y2="11"/>
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 9.5l1-3L8.5 1 11 3.5 5.5 9l-3 1z"/><line x1="7" y1="2.5" x2="9.5" y2="5"/>
              </svg>
              <input
                className={`flex-1 bg-transparent border-b text-[11px] pb-0.5 outline-none transition-colors placeholder:text-[#333] ${
                  item.note ? 'border-[#C9A84C33] text-[#C9A84C88]' : 'border-[#2a2a2a] text-[#888]'
                } focus:border-[#C9A84C55] focus:text-[#b0a898]`}
                placeholder="Ghi chú cho món này…"
                value={item.note}
                onChange={e => onUpdateItem(item.menuItemId, { note: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#2a2a2a] p-4 space-y-3">
        <div className="flex justify-between text-xs text-[#555]">
          <span>{count} món</span>
        </div>
        <div className="flex justify-between items-baseline pt-2 border-t border-[#2a2a2a]">
          <span className="text-[11px] tracking-[0.15em] text-[#888] uppercase">Tổng cộng</span>
          <span className="font-display text-2xl text-gold font-bold">{formatVnd(total)}</span>
        </div>
        <button
          disabled={items.length === 0}
          onClick={onPay}
          className="w-full bg-gold text-brand-dark text-[11px] font-bold tracking-[0.25em] py-3 rounded disabled:opacity-30"
        >
          THANH TOÁN →
        </button>
      </div>
    </div>
  )
}
