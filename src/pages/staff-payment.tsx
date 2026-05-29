import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTableSessions } from '@/hooks/useTableSessions'
import { tables } from '@/data/tables'
import PaymentPanel from '@/components/staff/payment-panel'
import InvoiceForm from '@/components/staff/invoice-form'
import { formatVnd } from '@/lib/format'
import type { InvoiceRequest } from '@/types/invoice'

export default function StaffPaymentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessions, closeSession, setInvoiceRequest } = useTableSessions()
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)

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

  function handleInvoiceSubmit(request: InvoiceRequest) {
    if (!id) return
    setInvoiceRequest(id, request)
    navigate(`/staff/table/${id}/invoice`)
  }

  return (
    <div className="min-h-screen bg-brand-darker text-[#f5f0e8]">
      {showInvoiceForm && (
        <InvoiceForm
          onSubmit={handleInvoiceSubmit}
          onCancel={() => setShowInvoiceForm(false)}
        />
      )}

      {/* Topbar */}
      <div className="flex items-center gap-2 sm:gap-3 bg-[#1a1a1a] border-b border-[#2a2a2a] px-3 sm:px-5 py-2.5">
        <button
          onClick={() => navigate(`/staff/table/${id}`)}
          className="text-[11px] sm:text-[12px] text-gold border border-[#C9A84C44] px-2 sm:px-3 py-1 rounded tracking-[0.1em] flex-shrink-0"
        >
          ←
          <span className="hidden sm:inline"> {table.label}</span>
        </button>
        <span className="font-display text-[#f5f0e8] text-sm sm:text-base">Thanh toán</span>
        <span className="text-[9px] tracking-[0.15em] text-[#e07b39] bg-[#e07b3915] border border-[#e07b3933] px-2 py-0.5 rounded flex-shrink-0">
          CHỜ THANH TOÁN
        </span>
      </div>

      {/* Split layout — stacked on mobile, side-by-side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-49px)]">
        {/* Bill summary */}
        <div className="border-b md:border-b-0 md:border-r border-[#2a2a2a] p-4 sm:p-6">
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
                      <div className="min-w-0">
                        <p className="text-[12px] text-[#b0a898] truncate">{item.name}</p>
                        {item.note && <p className="text-[10px] text-[#C9A84C55] italic mt-0.5 truncate">{item.note}</p>}
                      </div>
                      <span className="text-[11px] text-[#555] flex-shrink-0">×{item.quantity}</span>
                      <span className="text-[12px] text-[#888] flex-shrink-0 min-w-[80px] text-right">
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
            <span className="font-display text-2xl sm:text-3xl text-gold font-bold">{formatVnd(total)}</span>
          </div>
        </div>

        {/* Payment panel */}
        <div className="p-4 sm:p-6">
          <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-4">Phương thức thanh toán</p>
          <PaymentPanel total={total} onConfirm={handleConfirm} />

          <div className="mt-6 pt-4 border-t border-[#2a2a2a]">
            <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-3">Hoá đơn</p>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/staff/table/${id}/receipt?draft=true`)}
                className="w-full border border-[#333] text-[#888] text-[11px] tracking-[0.2em] py-2.5 rounded hover:bg-[#181818] transition-colors"
              >
                XUẤT HOÁ ĐƠN TẠM
              </button>
              <button
                onClick={() => navigate(`/staff/table/${id}/receipt`)}
                className="w-full border border-[#C9A84C44] text-gold text-[11px] tracking-[0.2em] py-2.5 rounded hover:bg-[#1e1a0e] transition-colors"
              >
                XUẤT HOÁ ĐƠN THƯỜNG
              </button>
              <button
                onClick={() => setShowInvoiceForm(true)}
                className="w-full border border-[#C9A84C44] text-gold text-[11px] tracking-[0.2em] py-2.5 rounded hover:bg-[#1e1a0e] transition-colors"
              >
                XUẤT HOÁ ĐƠN GTGT →
              </button>
            </div>
            <p className="text-[9px] text-[#444] mt-2 text-center">GTGT dành cho khách hàng doanh nghiệp</p>
          </div>
        </div>
      </div>
    </div>
  )
}
