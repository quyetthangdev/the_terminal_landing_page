import { useParams, useNavigate } from 'react-router-dom'
import { useTableSessions } from '@/hooks/useTableSessions'
import { tables } from '@/data/tables'
import PaymentPanel from '@/components/staff/payment-panel'
import { formatVnd } from '@/lib/format'

export default function StaffPaymentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessions, closeSession } = useTableSessions()

  const table = tables.find(t => t.id === id)
  const session = id ? sessions[id] : undefined

  if (!table || !session) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center text-[#555]">
        Không tìm thấy phiên bàn.{' '}
        <button className="text-gold ml-2 underline" onClick={() => navigate('/staff')}>
          Quay lại
        </button>
      </div>
    )
  }

  const total = session.submittedOrders.reduce(
    (s, o) => s + o.items.reduce((ss, i) => ss + i.priceNum * i.quantity, 0),
    0,
  )

  function handleConfirm() {
    if (!id) return
    closeSession(id)
    navigate('/staff')
  }

  return (
    <div className="min-h-screen bg-brand-darker text-[#f5f0e8]">
      {/* Topbar */}
      <div className="flex items-center gap-3 bg-[#1a1a1a] border-b border-[#2a2a2a] px-5 py-3">
        <button
          onClick={() => navigate(`/staff/table/${id}`)}
          className="text-[12px] text-gold border border-[#C9A84C44] px-3 py-1 rounded tracking-[0.1em]"
        >
          ← {table.label}
        </button>
        <span className="font-display text-[#f5f0e8] text-base">Thanh toán</span>
        <span className="text-[9px] tracking-[0.2em] text-[#e07b39] bg-[#e07b3915] border border-[#e07b3933] px-2.5 py-1 rounded">
          CHỜ THANH TOÁN
        </span>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-2 min-h-[calc(100vh-53px)]">
        {/* Left: bill summary grouped by order */}
        <div className="border-r border-[#2a2a2a] p-6">
          <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-4">Tổng kết đơn hàng</p>
          <div className="space-y-4 mb-6">
            {session.submittedOrders.map((order, idx) => (
              <div key={order.id}>
                <p className="text-[9px] tracking-[0.15em] text-[#444] uppercase mb-1.5">
                  Đơn {idx + 1} · {new Date(order.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="space-y-1">
                  {order.items.map(item => (
                    <div key={item.menuItemId} className="flex justify-between items-baseline gap-3 py-1.5 border-b border-[#1a1a1a]">
                      <div>
                        <p className="text-[12px] text-[#b0a898]">{item.name}</p>
                        {item.note && <p className="text-[10px] text-[#C9A84C55] italic mt-0.5">{item.note}</p>}
                      </div>
                      <span className="text-[11px] text-[#555]">×{item.quantity}</span>
                      <span className="text-[12px] text-[#888] min-w-[80px] text-right">
                        {formatVnd(item.priceNum * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-baseline pt-4 border-t border-[#C9A84C33]">
            <span className="text-[11px] tracking-[0.2em] text-[#888] uppercase">Tổng thanh toán</span>
            <span className="font-display text-3xl text-gold font-bold">{formatVnd(total)}</span>
          </div>
        </div>

        {/* Right: payment panel */}
        <div className="p-6">
          <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-4">Phương thức thanh toán</p>
          <PaymentPanel total={total} onConfirm={handleConfirm} />
        </div>
      </div>
    </div>
  )
}
