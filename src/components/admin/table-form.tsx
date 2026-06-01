import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Table } from '@/data/tables'

interface Props {
  initial?: Table
  onSave: (data: Omit<Table, 'id'>) => void
  onCancel: () => void
}

const inputCls = 'w-full bg-white dark:bg-[#111] border border-gray-300 dark:border-[#333] rounded px-3 py-2 text-[13px] text-gray-900 dark:text-[#f5f0e8] focus:border-gold/30 outline-none'
const labelCls = 'text-[10px] tracking-[0.15em] text-gray-400 dark:text-[#555] uppercase block mb-1'

export default function TableForm({ initial, onSave, onCancel }: Props) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [seats, setSeats] = useState(initial?.seats ?? 4)
  const [gridCol, setGridCol] = useState(initial?.gridCol ?? 1)
  const [gridRow, setGridRow] = useState(initial?.gridRow ?? 1)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSave({ label, seats, gridCol, gridRow })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="tf-label" className={labelCls}>Tên bàn</label>
        <input id="tf-label" required value={label} onChange={e => setLabel(e.target.value)}
          className={inputCls} />
      </div>
      <div>
        <label htmlFor="tf-seats" className={labelCls}>Số chỗ ngồi</label>
        <input id="tf-seats" type="number" min={1} max={20} required value={seats}
          onChange={e => setSeats(Math.max(1, Number(e.target.value) || 1))}
          className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="tf-col" className={labelCls}>Cột (1–4)</label>
          <input id="tf-col" type="number" min={1} max={4} required value={gridCol}
            onChange={e => setGridCol(Math.min(4, Math.max(1, Number(e.target.value) || 1)))}
            className={inputCls} />
        </div>
        <div>
          <label htmlFor="tf-row" className={labelCls}>Hàng (1–3)</label>
          <input id="tf-row" type="number" min={1} max={3} required value={gridRow}
            onChange={e => setGridRow(Math.min(3, Math.max(1, Number(e.target.value) || 1)))}
            className={inputCls} />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 border border-gray-300 dark:border-[#333] text-gray-500 dark:text-[#888] text-[11px] tracking-[0.1em] py-2.5 rounded">
          HỦY
        </button>
        <button type="submit"
          className="flex-1 bg-gold text-brand-dark font-bold text-[11px] tracking-[0.1em] py-2.5 rounded">
          LƯU
        </button>
      </div>
    </form>
  )
}
