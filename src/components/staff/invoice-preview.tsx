import type { InvoiceData, InvoiceRequest } from '@/types/invoice'
import { formatVnd } from '@/lib/format'

const PAYMENT_LABEL = {
  cash: 'Tiền mặt',
  transfer: 'Chuyển khoản ngân hàng',
} satisfies Record<InvoiceRequest['paymentMethod'], string>

interface Props {
  invoice: InvoiceData
}

export default function InvoicePreview({ invoice }: Props) {
  const [yyyy, mm, dd] = invoice.issuedAt.slice(0, 10).split('-')

  return (
    <div className="bg-white text-black font-sans text-sm leading-relaxed max-w-[794px] mx-auto p-10 print:p-8 print:shadow-none shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-[11px] font-semibold tracking-wide">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
        <p className="text-[11px] mb-3">Độc lập - Tự do - Hạnh phúc</p>
        <p className="text-[22px] font-bold tracking-widest uppercase">Hoá đơn giá trị gia tăng</p>
        <p className="text-[11px] text-gray-500 mt-0.5">(VAT INVOICE)</p>
        <div className="flex justify-center gap-8 mt-2 text-[12px]">
          <span>Ký hiệu (Serial): <strong>{invoice.symbol}</strong></span>
          <span>Số (No.): <strong>{invoice.number}</strong></span>
        </div>
        <p className="text-[12px] mt-1">
          Ngày {dd} tháng {mm} năm {yyyy}
        </p>
      </div>

      {/* Seller */}
      <div className="border border-black p-3 mb-3 text-[12px] space-y-0.5">
        <p><strong>Đơn vị bán hàng:</strong> {invoice.seller.name}</p>
        <p><strong>Địa chỉ:</strong> {invoice.seller.address}</p>
        <p><strong>Mã số thuế:</strong> {invoice.seller.taxCode}</p>
        <p><strong>Điện thoại:</strong> {invoice.seller.phone}</p>
      </div>

      {/* Buyer */}
      <div className="border border-black p-3 mb-4 text-[12px] space-y-0.5">
        <p><strong>Tên người mua hàng / đơn vị:</strong> {invoice.buyer.buyerName}</p>
        <p><strong>Địa chỉ:</strong> {invoice.buyer.buyerAddress}</p>
        <p><strong>Mã số thuế:</strong> {invoice.buyer.buyerTaxCode || '—'}</p>
        <p><strong>Email:</strong> {invoice.buyer.buyerEmail}</p>
        <p><strong>Hình thức thanh toán:</strong> {PAYMENT_LABEL[invoice.buyer.paymentMethod]}</p>
      </div>

      {/* Items table */}
      <table className="w-full border-collapse text-[11px] mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black px-2 py-1.5 text-center w-8">STT</th>
            <th className="border border-black px-2 py-1.5 text-left">Tên hàng hoá, dịch vụ</th>
            <th className="border border-black px-2 py-1.5 text-center w-12">ĐVT</th>
            <th className="border border-black px-2 py-1.5 text-center w-14">SL</th>
            <th className="border border-black px-2 py-1.5 text-right w-24">Đơn giá</th>
            <th className="border border-black px-2 py-1.5 text-right w-28">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx}>
              <td className="border border-black px-2 py-1.5 text-center">{item.no}</td>
              <td className="border border-black px-2 py-1.5">{item.name}</td>
              <td className="border border-black px-2 py-1.5 text-center">{item.unit}</td>
              <td className="border border-black px-2 py-1.5 text-center">{item.quantity}</td>
              <td className="border border-black px-2 py-1.5 text-right">{formatVnd(item.unitPrice)}</td>
              <td className="border border-black px-2 py-1.5 text-right">{formatVnd(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-4">
        <div className="w-72 text-[12px] space-y-1">
          <div className="flex justify-between">
            <span>Cộng tiền hàng:</span>
            <span className="font-semibold">{formatVnd(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Thuế suất GTGT: {Math.round(invoice.vatRate * 100)}%</span>
            <span className="font-semibold">{formatVnd(invoice.vatAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-black pt-1 font-bold text-[13px]">
            <span>Tổng tiền thanh toán:</span>
            <span>{formatVnd(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Amount in words */}
      <div className="border border-black px-3 py-2 text-[12px] mb-6">
        <span className="font-semibold">Số tiền bằng chữ: </span>
        <span className="italic">{invoice.totalInWords}</span>
      </div>

      {/* Signature area */}
      <div className="grid grid-cols-2 text-center text-[11px] mt-4">
        <div>
          <p className="font-semibold mb-1">Người mua hàng</p>
          <p className="text-gray-400 italic">(Ký, ghi rõ họ tên)</p>
          <div className="h-16" />
        </div>
        <div>
          <p className="font-semibold mb-1">Người bán hàng</p>
          <p className="text-gray-400 italic">(Ký, đóng dấu, ghi rõ họ tên)</p>
          <div className="h-16" />
        </div>
      </div>

      {/* Demo watermark — hidden when printing */}
      <div className="print:hidden mt-6 py-2 border border-dashed border-amber-400 text-center text-[11px] text-amber-600 bg-amber-50 rounded">
        ⚠ DEMO — Hoá đơn này không có giá trị pháp lý. Cần tích hợp phần mềm HĐĐT để xuất hoá đơn thật.
      </div>
    </div>
  )
}
