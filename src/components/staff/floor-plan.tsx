import { tables } from '@/data/tables'
import type { TableSession } from '@/hooks/useTableSessions'
import TableCard from '@/components/staff/table-card'

interface Props {
  sessions: Record<string, TableSession>
  onTableClick: (tableId: string) => void
}

export default function FloorPlan({ sessions, onTableClick }: Props) {
  const serving = tables.filter(t => sessions[t.id]?.status === 'serving').length
  const waiting = tables.filter(t => sessions[t.id]?.status === 'waiting_payment').length
  const empty = tables.length - serving - waiting

  return (
    <div className="p-3 sm:p-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {[
          { val: tables.length, label: 'Tổng bàn', cls: 'text-[#f5f0e8]' },
          { val: serving, label: 'Đang phục vụ', cls: 'text-gold' },
          { val: waiting, label: 'Chờ thanh toán', cls: 'text-[#e07b39]' },
          { val: empty, label: 'Trống', cls: 'text-[#f5f0e8]' },
        ].map(s => (
          <div key={s.label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-2.5 sm:p-3">
            <p className={`text-xl font-bold ${s.cls}`}>{s.val}</p>
            <p className="text-[9px] sm:text-[10px] text-[#666] tracking-[0.1em] uppercase mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table grid */}
      <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-2 sm:mb-3">SƠ ĐỒ BÀN</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {tables.map(t => (
          <TableCard
            key={t.id}
            table={t}
            session={sessions[t.id]}
            onClick={() => onTableClick(t.id)}
          />
        ))}
      </div>
    </div>
  )
}
