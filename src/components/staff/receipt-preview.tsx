import type { SubmittedOrder } from '@/types/session'
import { mergeOrderItems } from '@/lib/orders'
import { formatVnd } from '@/lib/format'
import { useSettings } from '@/hooks/useSettings'

interface Props {
  tableLabel: string
  issuedAt: string   // ISO datetime string
  orders: SubmittedOrder[]
  isDraft: boolean
}

export default function ReceiptPreview({ tableLabel, issuedAt, orders, isDraft }: Props) {
  const { settings } = useSettings()
  const d = new Date(issuedAt)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  const lines = mergeOrderItems(orders)
  const total = lines.reduce((s, l) => s + l.priceNum * l.quantity, 0)

  return (
    <div className="bg-white text-black font-sans text-sm leading-relaxed max-w-sm mx-auto p-6 print:p-4 print:shadow-none shadow-lg">
      {/* Restaurant header */}
      <div className="text-center mb-4">
        <p className="text-[16px] font-bold tracking-widest">{settings.restaurantName}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">{settings.address}</p>
        <p className="text-[10px] text-gray-500">{settings.phone}</p>
      </div>

      {/* Title */}
      <div className="text-center border-t border-b border-black py-1.5 mb-3">
        <p className="text-[14px] font-bold tracking-wider">
          {isDraft ? 'HOÁ ĐƠN TẠM' : 'HOÁ ĐƠN'}
        </p>
      </div>

      {/* Meta */}
      <div className="flex justify-between text-[11px] mb-3">
        <span>Bàn: <strong>{tableLabel}</strong></span>
        <span>{dd}/{mm}/{yyyy} {time}</span>
      </div>

      {/* Items */}
      <table className="w-full text-[11px] mb-3">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left py-1 font-semibold">Tên món</th>
            <th className="text-center py-1 font-semibold w-8">SL</th>
            <th className="text-right py-1 font-semibold w-24">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {lines.map(line => (
            <tr key={line.menuItemId} className="border-b border-gray-100">
              <td className="py-1">{line.name}</td>
              <td className="text-center py-1">{line.quantity}</td>
              <td className="text-right py-1">{formatVnd(line.priceNum * line.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className="flex justify-between font-bold text-[13px] border-t border-black pt-2 mb-1">
        <span>Tổng:</span>
        <span>{formatVnd(total)}</span>
      </div>
      <p className="text-[10px] text-gray-400 text-right mb-4">(Đã bao gồm VAT 10%)</p>

      {/* Footer */}
      <p className="text-center text-[11px] text-gray-500">Cảm ơn quý khách!</p>

      {/* Draft watermark — hidden when printing */}
      {isDraft && (
        <div className="print:hidden mt-4 py-1.5 border border-dashed border-gray-400 text-center text-[10px] text-gray-400 rounded">
          PHIẾU TẠM — chưa thanh toán
        </div>
      )}
    </div>
  )
}
