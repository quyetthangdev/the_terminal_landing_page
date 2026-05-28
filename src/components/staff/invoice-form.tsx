import { useState } from 'react'
import type { InvoiceRequest } from '@/types/invoice'

interface Props {
  onSubmit: (request: InvoiceRequest) => void
  onCancel: () => void
}

export default function InvoiceForm({ onSubmit, onCancel }: Props) {
  const [buyerName, setBuyerName] = useState('')
  const [buyerTaxCode, setBuyerTaxCode] = useState('')
  const [buyerAddress, setBuyerAddress] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash')

  const canSubmit = buyerName.trim() && buyerTaxCode.trim() && buyerAddress.trim() && buyerEmail.trim()

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit({ buyerName: buyerName.trim(), buyerTaxCode: buyerTaxCode.trim(), buyerAddress: buyerAddress.trim(), buyerEmail: buyerEmail.trim(), paymentMethod })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg w-full max-w-md p-6 space-y-4">
        <div>
          <p className="text-base font-semibold text-[#e8e0d0] mb-0.5">Xuất hoá đơn GTGT</p>
          <p className="text-[11px] text-[#555]">Nhập thông tin người mua để xuất hoá đơn đỏ</p>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="buyerName" className="block text-[10px] tracking-[0.15em] text-[#666] uppercase mb-1">
              Tên công ty / người mua <span className="text-[#e07b39]">*</span>
            </label>
            <input
              id="buyerName"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded text-[13px] text-[#e8e0d0] px-3 py-2 outline-none focus:border-[#C9A84C55] placeholder:text-[#444]"
              placeholder="Công ty TNHH ABC"
              value={buyerName}
              onChange={e => setBuyerName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="buyerTaxCode" className="block text-[10px] tracking-[0.15em] text-[#666] uppercase mb-1">
              Mã số thuế <span className="text-[#e07b39]">*</span>
            </label>
            <input
              id="buyerTaxCode"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded text-[13px] text-[#e8e0d0] px-3 py-2 outline-none focus:border-[#C9A84C55] placeholder:text-[#444]"
              placeholder="0123456789"
              value={buyerTaxCode}
              onChange={e => setBuyerTaxCode(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="buyerAddress" className="block text-[10px] tracking-[0.15em] text-[#666] uppercase mb-1">
              Địa chỉ <span className="text-[#e07b39]">*</span>
            </label>
            <input
              id="buyerAddress"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded text-[13px] text-[#e8e0d0] px-3 py-2 outline-none focus:border-[#C9A84C55] placeholder:text-[#444]"
              placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
              value={buyerAddress}
              onChange={e => setBuyerAddress(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="buyerEmail" className="block text-[10px] tracking-[0.15em] text-[#666] uppercase mb-1">
              Email nhận hoá đơn <span className="text-[#e07b39]">*</span>
            </label>
            <input
              id="buyerEmail"
              type="email"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded text-[13px] text-[#e8e0d0] px-3 py-2 outline-none focus:border-[#C9A84C55] placeholder:text-[#444]"
              placeholder="ke-toan@congty.com"
              value={buyerEmail}
              onChange={e => setBuyerEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.15em] text-[#666] uppercase mb-1">
              Hình thức thanh toán
            </label>
            <div className="flex border border-[#2a2a2a] rounded overflow-hidden">
              {(['cash', 'transfer'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`flex-1 py-2 text-[11px] tracking-[0.1em] transition-colors ${
                    paymentMethod === m ? 'bg-[#1e1a0e] text-gold' : 'bg-[#181818] text-[#555]'
                  }`}
                >
                  {m === 'cash' ? 'TIỀN MẶT' : 'CHUYỂN KHOẢN'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 text-[11px] tracking-[0.15em] border border-[#333] text-[#666] rounded"
          >
            HỦY
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="flex-1 py-2.5 text-[11px] tracking-[0.15em] bg-gold text-brand-dark font-bold rounded disabled:opacity-30"
          >
            XUẤT HOÁ ĐƠN →
          </button>
        </div>
      </div>
    </div>
  )
}
