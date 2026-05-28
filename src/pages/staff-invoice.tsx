import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTableSessions } from '@/hooks/useTableSessions'
import { tables } from '@/data/tables'
import { buildInvoice } from '@/lib/invoice'
import InvoicePreview from '@/components/staff/invoice-preview'

export default function StaffInvoicePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessions, closeSession } = useTableSessions()

  const table = tables.find(t => t.id === id)
  const session = id ? sessions[id] : undefined

  // Call hook unconditionally before any early return
  const invoice = useMemo(() => {
    // Guard inside the callback to ensure we have valid data
    if (!session || !session.invoiceRequest) {
      return null
    }
    return buildInvoice(session, session.invoiceRequest)
  }, [session])

  if (!table || !session || !session.invoiceRequest || !invoice) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center text-[#555]">
        Không tìm thấy dữ liệu hoá đơn.{' '}
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
            onClick={() => navigate(`/staff/table/${id}/payment`)}
            className="text-[12px] text-gold border border-[#C9A84C44] px-3 py-1 rounded tracking-[0.1em]"
          >
            ← Thanh toán
          </button>
          <span className="font-display text-[#f5f0e8] text-sm">Hoá đơn GTGT</span>
          <span className="text-[10px] text-[#555]">
            {invoice.symbol} · {invoice.number}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="text-[11px] tracking-[0.15em] bg-[#1e1a0e] border border-[#C9A84C44] text-gold px-4 py-2 rounded"
          >
            IN HOÁ ĐƠN
          </button>
          <button
            onClick={handleDone}
            className="text-[11px] tracking-[0.15em] bg-gold text-brand-dark font-bold px-4 py-2 rounded"
          >
            HOÀN TẤT →
          </button>
        </div>
      </div>

      {/* Invoice */}
      <div className="py-6 px-4 print:p-0 print:py-0">
        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  )
}
