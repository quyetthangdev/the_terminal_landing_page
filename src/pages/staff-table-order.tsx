import { useParams, useNavigate } from 'react-router-dom'
import { useTableSessions } from '@/hooks/useTableSessions'
import { tables } from '@/data/tables'
import MenuPanel from '@/components/staff/menu-panel'
import OrderSummary from '@/components/staff/order-summary'

export default function StaffTableOrderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessions, addItem, updateItem, removeItem, submitOrder, requestPayment } = useTableSessions()

  const table = tables.find(t => t.id === id)
  const session = id ? sessions[id] : undefined

  if (!table || !session) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center text-[#555]">
        Bàn không tồn tại.{' '}
        <button className="text-gold ml-2 underline" onClick={() => navigate('/staff')}>
          Quay lại
        </button>
      </div>
    )
  }

  const statusLabel: Record<string, string> = {
    serving: 'ĐANG PHỤC VỤ',
    waiting_payment: 'CHỜ THANH TOÁN',
  }

  function handlePay() {
    if (!id) return
    requestPayment(id)
    navigate(`/staff/table/${id}/payment`)
  }

  return (
    <div className="h-screen flex flex-col bg-brand-darker text-[#f5f0e8] overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center justify-between bg-[#1a1a1a] border-b border-[#2a2a2a] px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/staff')}
            className="text-[12px] text-gold border border-[#C9A84C44] px-3 py-1 rounded tracking-[0.1em]"
          >
            ← Sơ đồ bàn
          </button>
          <span className="font-display text-[#f5f0e8] text-base">{table.label}</span>
          <span className="text-[9px] tracking-[0.2em] text-gold bg-[#C9A84C15] border border-[#C9A84C33] px-2.5 py-1 rounded">
            {statusLabel[session.status] ?? session.status.toUpperCase()}
          </span>
        </div>
        <span className="text-[11px] text-[#666]">
          Mở lúc {new Date(session.openedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Split layout */}
      <div className="flex-1 grid grid-cols-[1fr_340px] overflow-hidden">
        <div className="border-r border-[#2a2a2a] overflow-hidden">
          <MenuPanel
            pendingItems={session.pendingItems}
            onAdd={item => id && addItem(id, item)}
          />
        </div>
        <OrderSummary
          pendingItems={session.pendingItems}
          submittedOrders={session.submittedOrders}
          onUpdateItem={(menuItemId, patch) => id && updateItem(id, menuItemId, patch)}
          onRemoveItem={menuItemId => id && removeItem(id, menuItemId)}
          onSubmitOrder={() => id && submitOrder(id)}
          onPay={handlePay}
        />
      </div>
    </div>
  )
}
