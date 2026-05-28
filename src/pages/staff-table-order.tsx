import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTableSessions } from '@/hooks/useTableSessions'
import { tables } from '@/data/tables'
import MenuPanel from '@/components/staff/menu-panel'
import OrderSummary from '@/components/staff/order-summary'

export default function StaffTableOrderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessions, addItem, updateItem, removeItem, submitOrder, requestPayment } = useTableSessions()
  const [mobilePane, setMobilePane] = useState<'menu' | 'order'>('menu')

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

  const pendingCount = session.pendingItems.reduce((s, i) => s + i.quantity, 0)

  function handlePay() {
    if (!id) return
    requestPayment(id)
    navigate(`/staff/table/${id}/payment`)
  }

  return (
    <div className="h-screen flex flex-col bg-brand-darker text-[#f5f0e8] overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center justify-between bg-[#1a1a1a] border-b border-[#2a2a2a] px-3 sm:px-5 py-2.5 flex-shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate('/staff')}
            className="text-[11px] sm:text-[12px] text-gold border border-[#C9A84C44] px-2 sm:px-3 py-1 rounded tracking-[0.1em] flex-shrink-0"
          >
            ←
            <span className="hidden sm:inline"> Sơ đồ bàn</span>
          </button>
          <span className="font-display text-[#f5f0e8] text-sm sm:text-base truncate">{table.label}</span>
          <span className="text-[9px] tracking-[0.15em] text-gold bg-[#C9A84C15] border border-[#C9A84C33] px-2 py-0.5 rounded flex-shrink-0">
            {statusLabel[session.status] ?? session.status.toUpperCase()}
          </span>
        </div>
        <span className="text-[11px] text-[#666] flex-shrink-0 hidden sm:block">
          {new Date(session.openedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Mobile tab bar — hidden on lg+ */}
      <div className="flex lg:hidden border-b border-[#2a2a2a] bg-[#161616] flex-shrink-0">
        <button
          onClick={() => setMobilePane('menu')}
          className={`flex-1 py-2.5 text-[11px] tracking-[0.15em] border-b-2 transition-colors ${
            mobilePane === 'menu' ? 'text-gold border-gold' : 'text-[#555] border-transparent'
          }`}
        >
          THỰC ĐƠN
        </button>
        <button
          onClick={() => setMobilePane('order')}
          className={`flex-1 py-2.5 text-[11px] tracking-[0.15em] border-b-2 transition-colors relative ${
            mobilePane === 'order' ? 'text-gold border-gold' : 'text-[#555] border-transparent'
          }`}
        >
          ĐƠN HÀNG
          {pendingCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-gold text-brand-dark text-[9px] font-bold">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Content — mobile: single pane toggled, lg+: side by side */}
      <div className="flex-1 flex overflow-hidden">
        {/* Menu panel */}
        <div className={`${mobilePane === 'menu' ? 'flex' : 'hidden'} lg:flex flex-col flex-1 border-r border-[#2a2a2a] overflow-hidden`}>
          <MenuPanel
            pendingItems={session.pendingItems}
            onAdd={item => id && addItem(id, item)}
          />
        </div>
        {/* Order summary */}
        <div className={`${mobilePane === 'order' ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-[340px] flex-shrink-0 overflow-hidden`}>
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
    </div>
  )
}
