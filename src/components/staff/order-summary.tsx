import { useState } from 'react'
import type { OrderItem, SubmittedOrder } from '@/hooks/useTableSessions'
import { formatVnd } from '@/lib/format'

interface Props {
  pendingItems: OrderItem[]
  submittedOrders: SubmittedOrder[]
  onUpdateItem: (menuItemId: string, patch: Partial<Pick<OrderItem, 'quantity' | 'note'>>) => void
  onRemoveItem: (menuItemId: string) => void
  onSubmitOrder: () => void
  onPay: () => void
  onDraftReceipt: () => void
}

export default function OrderSummary({ pendingItems, submittedOrders, onUpdateItem, onRemoveItem, onSubmitOrder, onPay, onDraftReceipt }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)

  const pendingTotal = pendingItems.reduce((s, i) => s + i.priceNum * i.quantity, 0)
  const pendingCount = pendingItems.reduce((s, i) => s + i.quantity, 0)
  const submittedTotal = submittedOrders.reduce(
    (s, o) => s + o.items.reduce((ss, i) => ss + i.priceNum * i.quantity, 0),
    0,
  )
  const grandTotal = submittedTotal + pendingTotal

  function handleConfirmSubmit() {
    onSubmitOrder()
    setShowConfirm(false)
  }

  return (
    <div className="flex flex-col h-full bg-[#111] relative">
      {/* Confirm dialog overlay */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-6">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg w-full max-w-sm p-6 space-y-4">
            <div>
              <p className="text-base font-semibold text-[#e8e0d0] mb-0.5">Xác nhận đặt món</p>
              <p className="text-[11px] text-[#555]">Đợt {submittedOrders.length + 1} · {pendingItems.reduce((s, i) => s + i.quantity, 0)} món</p>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto -mx-1 px-1">
              {pendingItems.map(item => (
                <div key={item.menuItemId} className="flex justify-between items-baseline gap-3 py-1.5 border-b border-[#222]">
                  <span className="text-[13px] text-[#c8bfaf]">{item.name}</span>
                  <span className="text-[12px] text-[#666] flex-shrink-0">×{item.quantity}</span>
                  <span className="text-[13px] text-gold font-semibold flex-shrink-0">{formatVnd(item.priceNum * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-baseline pt-1 border-t border-[#2a2a2a]">
              <span className="text-[12px] text-[#888]">Tổng đợt này</span>
              <span className="text-lg text-gold font-bold">{formatVnd(pendingTotal)}</span>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 text-[11px] tracking-[0.15em] border border-[#333] text-[#666] rounded"
              >
                HỦY
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 py-2.5 text-[11px] tracking-[0.15em] bg-gold text-brand-dark font-bold rounded"
              >
                XÁC NHẬN ĐẶT MÓN
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase">
          Đang chọn{pendingCount > 0 ? ` · ${pendingCount} món` : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Submitted orders history */}
        {submittedOrders.length > 0 && (
          <div className="border-b border-[#1e1e1e]">
            {submittedOrders.map((order, orderIdx) => {
              const orderTotal = order.items.reduce((s, i) => s + i.priceNum * i.quantity, 0)
              return (
                <div key={order.id} className="px-3 pt-3 pb-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] tracking-[0.15em] text-[#444] uppercase">
                      Đơn {orderIdx + 1} · {new Date(order.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-[#666]">{formatVnd(orderTotal)}</span>
                  </div>
                  <div className="space-y-0.5">
                    {order.items.map(item => (
                      <div key={item.menuItemId} className="flex justify-between items-baseline gap-2">
                        <span className="text-[10px] text-[#4a4a4a]">{item.name} ×{item.quantity}</span>
                        <span className="text-[10px] text-[#3a3a3a]">{formatVnd(item.priceNum * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pending items */}
        <div className="p-3 space-y-2">
          {pendingItems.length === 0 && submittedOrders.length === 0 && (
            <p className="text-center text-[#444] text-xs py-10">Chưa có món nào</p>
          )}
          {pendingItems.length === 0 && submittedOrders.length > 0 && (
            <p className="text-center text-[#333] text-xs py-4">Thêm món cho đợt tiếp theo</p>
          )}
          {pendingItems.map(item => (
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
      </div>

      <div className="border-t border-[#2a2a2a] p-4 space-y-2">
        {submittedOrders.length > 0 && (
          <div className="flex justify-between items-baseline text-xs text-[#555]">
            <span>Đã đặt</span>
            <span>{formatVnd(submittedTotal)}</span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-1 border-t border-[#2a2a2a]">
          <span className="text-[11px] tracking-[0.15em] text-[#888] uppercase">Tổng cộng</span>
          <span className="font-display text-2xl text-gold font-bold">{formatVnd(grandTotal)}</span>
        </div>
        <button
          disabled={pendingItems.length === 0}
          onClick={() => setShowConfirm(true)}
          className="w-full bg-[#1a3a1a] border border-[#2a5a2a] text-[#6abf6a] text-[11px] font-bold tracking-[0.2em] py-2.5 rounded disabled:opacity-25"
        >
          ĐẶT MÓN →
        </button>
        <div className="flex gap-2">
          <button
            disabled={submittedOrders.length === 0}
            onClick={onDraftReceipt}
            className="px-3 py-2.5 border border-[#333] text-[#888] text-[11px] tracking-[0.1em] rounded disabled:opacity-30"
          >
            HĐ tạm
          </button>
          <button
            disabled={submittedOrders.length === 0}
            onClick={onPay}
            className="flex-1 bg-gold text-brand-dark text-[11px] font-bold tracking-[0.25em] py-2.5 rounded disabled:opacity-30"
          >
            THANH TOÁN →
          </button>
        </div>
      </div>
    </div>
  )
}
