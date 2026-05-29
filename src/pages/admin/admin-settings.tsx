import { useState } from 'react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/useSettings'

export default function AdminSettingsPage() {
  const { settings, updateSettings } = useSettings()
  const [form, setForm] = useState({ ...settings })
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  function handleInfoSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    updateSettings({
      restaurantName: form.restaurantName,
      address: form.address,
      taxCode: form.taxCode,
      phone: form.phone,
      invoiceSymbol: form.invoiceSymbol,
      vatRate: form.vatRate,
    })
    toast.success('Đã lưu cài đặt')
  }

  function handlePinSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (newPin.length < 4) {
      toast.error('PIN phải có ít nhất 4 ký tự')
      return
    }
    if (newPin !== confirmPin) {
      toast.error('PIN xác nhận không khớp')
      return
    }
    updateSettings({ pin: newPin })
    setNewPin('')
    setConfirmPin('')
    toast.success('Đã đổi PIN')
  }

  const inputCls = 'w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[13px] text-[#f5f0e8] focus:border-[#C9A84C44] outline-none'
  const labelCls = 'text-[10px] tracking-[0.15em] text-[#555] uppercase block mb-1'

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-6">Cài đặt nhà hàng</h1>

      <form onSubmit={handleInfoSubmit} className="space-y-4 mb-10">
        <div>
          <label htmlFor="s-name" className={labelCls}>Tên nhà hàng</label>
          <input id="s-name" value={form.restaurantName}
            onChange={e => setForm(f => ({ ...f, restaurantName: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label htmlFor="s-addr" className={labelCls}>Địa chỉ</label>
          <input id="s-addr" value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label htmlFor="s-tax" className={labelCls}>Mã số thuế</label>
          <input id="s-tax" value={form.taxCode}
            onChange={e => setForm(f => ({ ...f, taxCode: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label htmlFor="s-phone" className={labelCls}>Số điện thoại</label>
          <input id="s-phone" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label htmlFor="s-symbol" className={labelCls}>Ký hiệu hoá đơn</label>
          <input id="s-symbol" value={form.invoiceSymbol}
            onChange={e => setForm(f => ({ ...f, invoiceSymbol: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label htmlFor="s-vat" className={labelCls}>Thuế VAT (%)</label>
          <input id="s-vat" type="number" min={0} max={100} step={1}
            value={Math.round(form.vatRate * 100)}
            onChange={e => setForm(f => ({ ...f, vatRate: Number(e.target.value) / 100 }))}
            className={inputCls} />
        </div>
        <button type="submit" className="bg-gold text-brand-dark font-bold text-[11px] tracking-[0.2em] px-6 py-2.5 rounded">
          LƯU CÀI ĐẶT
        </button>
      </form>

      <div className="border-t border-[#2a2a2a] pt-8">
        <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-4">Đổi PIN quản lý</p>
        <form onSubmit={handlePinSubmit} className="space-y-4 max-w-xs">
          <div>
            <label htmlFor="pin-new" className={labelCls}>PIN mới</label>
            <input id="pin-new" type="password" inputMode="numeric" value={newPin}
              onChange={e => setNewPin(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="pin-confirm" className={labelCls}>Xác nhận PIN</label>
            <input id="pin-confirm" type="password" inputMode="numeric" value={confirmPin}
              onChange={e => setConfirmPin(e.target.value)} className={inputCls} />
          </div>
          <button type="submit" className="bg-gold text-brand-dark font-bold text-[11px] tracking-[0.2em] px-6 py-2.5 rounded">
            ĐỔI PIN
          </button>
        </form>
      </div>
    </div>
  )
}
