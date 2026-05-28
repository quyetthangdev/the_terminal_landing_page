import type { Table } from '@/data/tables'
import type { TableSession, OrderItem } from '@/hooks/useTableSessions'

function totalFrom(items: OrderItem[]) {
  return items.reduce((s, i) => s + i.priceNum * i.quantity, 0)
}

function formatVnd(n: number) {
  return n.toLocaleString('vi-VN') + 'đ'
}

const statusConfig = {
  empty: {
    label: 'Trống',
    bg: 'bg-[#1c1c1c]',
    border: 'border-[#2e2e2e]',
    dot: 'bg-[#333]',
    text: 'text-[#444]',
  },
  serving: {
    label: 'Đang phục vụ',
    bg: 'bg-[#1e1a0e]',
    border: 'border-[#C9A84C55]',
    dot: 'bg-gold shadow-[0_0_6px_#C9A84C88]',
    text: 'text-gold',
  },
  waiting_payment: {
    label: 'Chờ thanh toán',
    bg: 'bg-[#1e120a]',
    border: 'border-[#e07b3955]',
    dot: 'bg-[#e07b39] shadow-[0_0_6px_#e07b3988]',
    text: 'text-[#e07b39]',
  },
  done: {
    label: 'Hoàn tất',
    bg: 'bg-[#1c1c1c]',
    border: 'border-[#2e2e2e]',
    dot: 'bg-[#333]',
    text: 'text-[#444]',
  },
}

interface Props {
  table: Table
  session: TableSession | undefined
  onClick: () => void
}

export default function TableCard({ table, session, onClick }: Props) {
  const status = session?.status ?? 'empty'
  const cfg = statusConfig[status]
  const total = session ? totalFrom(session.items) : 0
  const itemCount = session ? session.items.length : 0

  return (
    <button
      onClick={onClick}
      className={`relative rounded p-3 border text-left transition-transform hover:-translate-y-px ${cfg.bg} ${cfg.border}`}
    >
      <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${cfg.dot}`} />
      <p className={`font-display text-xl font-bold mb-1 ${cfg.text}`}>{table.label}</p>
      <p className={`text-[9px] tracking-[0.2em] uppercase ${cfg.text} opacity-70`}>{cfg.label}</p>
      <p className="text-[11px] text-[#555] mt-1">
        {status === 'empty'
          ? `${table.seats} chỗ`
          : `${itemCount} món · ${formatVnd(total)}`}
      </p>
    </button>
  )
}
