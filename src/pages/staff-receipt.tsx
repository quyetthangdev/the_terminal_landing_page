import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTableSessions } from '@/hooks/useTableSessions'
import { tables } from '@/data/tables'
import ReceiptPreview from '@/components/staff/receipt-preview'

export default function StaffReceiptPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isDraft = searchParams.get('draft') === 'true'
  const { sessions, closeSession } = useTableSessions()
  // Capture issuedAt once on mount so it doesn't change on re-renders
  const [issuedAt] = useState(() => new Date().toISOString())

  const table = tables.find(t => t.id === id)
  const session = id ? sessions[id] : undefined

  if (!table || !session || session.submittedOrders.length === 0) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center text-[#555]">
        Không có đơn hàng để xuất hoá đơn.{' '}
        <button className="text-gold ml-2 underline" onClick={() => navigate('/staff')}>
          Quay lại
        </button>
      </div>
    )
  }

  function handleDone() {
    if (!id) return
    closeSession(id)
    navigate('/staff')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action bar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 flex items-center justify-between bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 sm:px-6 py-3 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => isDraft ? navigate(-1) : navigate(`/staff/table/${id}/payment`)}
            className="text-[12px] text-gold border border-[#C9A84C44] px-3 py-1 rounded tracking-[0.1em]"
          >
            ← {isDraft ? 'Quay lại' : 'Thanh toán'}
          </button>
          <span className="font-display text-[#f5f0e8] text-sm">
            {isDraft ? 'Hoá đơn tạm' : 'Hoá đơn'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="text-[11px] tracking-[0.15em] bg-[#1e1a0e] border border-[#C9A84C44] text-gold px-4 py-2 rounded"
          >
            IN HOÁ ĐƠN
          </button>
          {!isDraft && (
            <button
              onClick={handleDone}
              className="text-[11px] tracking-[0.15em] bg-gold text-brand-dark font-bold px-4 py-2 rounded"
            >
              HOÀN TẤT →
            </button>
          )}
        </div>
      </div>

      {/* Receipt */}
      <div className="py-6 px-4 print:p-0 print:py-0">
        <ReceiptPreview
          tableLabel={table.label}
          issuedAt={issuedAt}
          orders={session.submittedOrders}
          isDraft={isDraft}
        />
      </div>
    </div>
  )
}
