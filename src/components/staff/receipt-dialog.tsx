import { useState } from 'react'
import type { SubmittedOrder } from '@/hooks/useTableSessions'
import ReceiptPreview from './receipt-preview'

interface Props {
  tableId: string
  tableLabel: string
  orders: SubmittedOrder[]
  isDraft: boolean
  onClose: () => void
  onDone?: () => void  // final only — closes session
}

export default function ReceiptDialog({ tableId, tableLabel, orders, isDraft, onClose, onDone }: Props) {
  const [issuedAt] = useState(() => new Date().toISOString())
  const receiptUrl = `/staff/table/${tableId}/receipt${isDraft ? '?draft=true' : ''}`

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full sm:max-w-sm sm:rounded-lg max-h-[90vh] flex flex-col shadow-xl">
        {/* Top bar */}
        <div className="flex items-center justify-between bg-[#1a1a1a] sm:rounded-t-lg px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-[#666] hover:text-[#aaa] text-xl leading-none"
              aria-label="Đóng"
            >
              ×
            </button>
            <span className="font-display text-[#f5f0e8] text-sm">
              {isDraft ? 'Hoá đơn tạm' : 'Hoá đơn'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(receiptUrl, '_blank')}
              className="text-[11px] tracking-[0.15em] bg-[#1e1a0e] border border-[#C9A84C44] text-gold px-3 py-1.5 rounded"
            >
              IN
            </button>
            {onDone && (
              <button
                onClick={onDone}
                className="text-[11px] tracking-[0.15em] bg-gold text-brand-dark font-bold px-3 py-1.5 rounded"
              >
                HOÀN TẤT →
              </button>
            )}
          </div>
        </div>

        {/* Receipt content */}
        <div className="overflow-y-auto flex-1 bg-gray-100 py-4 px-2">
          <ReceiptPreview
            tableLabel={tableLabel}
            issuedAt={issuedAt}
            orders={orders}
            isDraft={isDraft}
          />
        </div>
      </div>
    </div>
  )
}
