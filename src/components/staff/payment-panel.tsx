import { useState } from 'react'
import { generatePresets } from '@/data/tables'
import { formatAmount, formatVnd } from '@/lib/format'

interface Props {
  total: number
  onConfirm: () => void
}

export default function PaymentPanel({ total, onConfirm }: Props) {
  const [tab, setTab] = useState<'cash' | 'transfer'>('cash')
  const [received, setReceived] = useState<number | ''>('')
  const presets = generatePresets(total)
  const change = typeof received === 'number' ? received - total : null

  function selectPreset(val: number) {
    setReceived(val)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex border border-[#2a2a2a] rounded overflow-hidden">
        {(['cash', 'transfer'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[11px] tracking-[0.12em] transition-colors ${
              tab === t ? 'bg-[#1e1a0e] text-gold' : 'bg-[#181818] text-[#555]'
            }`}
          >
            {t === 'cash' ? 'TIỀN MẶT' : 'CHUYỂN KHOẢN'}
          </button>
        ))}
      </div>

      {tab === 'cash' && (
        <div className="bg-[#181818] border border-[#2a2a2a] rounded p-4 space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] tracking-[0.15em] text-[#555] uppercase">Cần thu</span>
            <span className="font-display text-2xl text-gold font-bold">{formatVnd(total)}</span>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.15em] text-[#555] uppercase mb-2">Tiền khách đưa</p>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => selectPreset(p)}
                  className={`py-2 text-[11px] rounded border transition-all ${
                    received === p
                      ? 'bg-[#1e1a0e] border-[#C9A84C66] text-gold'
                      : 'bg-[#222] border-[#2e2e2e] text-[#888] hover:border-[#C9A84C44] hover:text-gold'
                  }`}
                >
                  {p >= 1_000_000 ? `${p / 1_000_000}M` : `${p / 1_000}k`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 bg-[#111] border border-[#2a2a2a] rounded text-[14px] font-semibold text-[#e8e0d0] px-3 py-2 outline-none focus:border-[#C9A84C55]"
                placeholder="Nhập số tiền khác…"
                value={received === '' ? '' : formatAmount(received)}
                onChange={e => {
                  const v = parseInt(e.target.value.replace(/\./g, '').replace(/\D/g, ''), 10)
                  setReceived(isNaN(v) ? '' : v)
                }}
              />
              <span className="text-[12px] text-[#555]">đ</span>
            </div>
          </div>

          <div className="flex justify-between items-center bg-[#111] border border-[#2a2a2a] rounded px-3 py-2.5">
            <span className="text-[10px] tracking-[0.15em] text-[#555] uppercase">Tiền thừa trả khách</span>
            <span className={`text-[15px] font-bold ${change !== null && change >= 0 ? 'text-[#6fcf8a]' : 'text-[#888]'}`}>
              {change !== null && change >= 0 ? formatVnd(change) : '—'}
            </span>
          </div>

          <button
            onClick={onConfirm}
            className="w-full bg-gold text-brand-dark text-[11px] font-bold tracking-[0.25em] py-3 rounded"
          >
            XÁC NHẬN ĐÃ THU TIỀN
          </button>
        </div>
      )}

      {tab === 'transfer' && (
        <div className="bg-[#181818] border border-[#2a2a2a] rounded p-4 space-y-4">
          {/* QR — full width */}
          <div className="bg-white rounded-lg p-4 flex items-center justify-center">
            <svg width="200" height="200" viewBox="0 0 80 80" fill="#0d0d0d">
              <rect x="5" y="5" width="30" height="30" rx="2" fill="none" stroke="#0d0d0d" strokeWidth="4"/>
              <rect x="13" y="13" width="14" height="14" rx="1"/>
              <rect x="45" y="5" width="30" height="30" rx="2" fill="none" stroke="#0d0d0d" strokeWidth="4"/>
              <rect x="53" y="13" width="14" height="14" rx="1"/>
              <rect x="5" y="45" width="30" height="30" rx="2" fill="none" stroke="#0d0d0d" strokeWidth="4"/>
              <rect x="13" y="53" width="14" height="14" rx="1"/>
              <rect x="45" y="45" width="8" height="8"/><rect x="57" y="45" width="8" height="8"/>
              <rect x="45" y="57" width="8" height="8"/><rect x="57" y="57" width="8" height="8"/>
              <rect x="68" y="45" width="8" height="8"/><rect x="68" y="57" width="8" height="8"/>
            </svg>
          </div>

          {/* Thông tin tài khoản */}
          <div className="bg-[#111] border border-[#2a2a2a] rounded px-4 py-3 space-y-1">
            <p className="text-[10px] text-[#555] tracking-[0.15em] uppercase">Tài khoản nhận</p>
            <p className="text-base font-semibold text-[#e8e0d0] tracking-widest">1234 5678 90</p>
            <p className="text-[11px] text-[#666]">ACB · The Terminal</p>
          </div>

          {/* Số tiền */}
          <div className="bg-[#111] border border-[#C9A84C22] rounded px-4 py-3 flex justify-between items-baseline">
            <p className="text-[10px] text-[#555] tracking-[0.15em] uppercase">Số tiền</p>
            <p className="font-display text-2xl text-gold font-bold">{formatVnd(total)}</p>
          </div>

          <button
            onClick={onConfirm}
            className="w-full bg-[#2a2a2a] border border-[#C9A84C44] text-gold text-[11px] font-semibold tracking-[0.2em] py-3 rounded"
          >
            XÁC NHẬN ĐÃ NHẬN TIỀN
          </button>
          {/* TODO: replace with ACB webhook when backend is available */}
          <p className="text-[10px] text-[#3a3a3a] text-center">Nhân viên xác nhận sau khi kiểm tra app ngân hàng</p>
        </div>
      )}
    </div>
  )
}
