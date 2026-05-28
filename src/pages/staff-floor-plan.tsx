import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTableSessions } from '@/hooks/useTableSessions'
import FloorPlan from '@/components/staff/floor-plan'

export default function StaffFloorPlanPage() {
  const navigate = useNavigate()
  const { sessions, openSession } = useTableSessions()

  function handleTableClick(tableId: string) {
    const session = sessions[tableId]
    if (!session || session.status === 'empty' || session.status === 'done') {
      openSession(tableId)
      navigate(`/staff/table/${tableId}`)
    } else if (session.status === 'serving') {
      navigate(`/staff/table/${tableId}`)
    } else {
      navigate(`/staff/table/${tableId}/payment`)
    }
  }

  return (
    <div className="min-h-screen bg-brand-darker text-[#f5f0e8]">
      {/* Topbar */}
      <div className="flex items-center justify-between bg-[#1a1a1a] border-b border-[#2a2a2a] px-5 py-3">
        <span className="font-display text-gold tracking-[0.15em] text-base">THE TERMINAL</span>
        <div className="flex items-center gap-3">
          <Clock />
          <span className="text-[10px] tracking-[0.15em] text-gold bg-[#C9A84C15] border border-[#C9A84C33] px-3 py-1 rounded">
            NHÂN VIÊN
          </span>
        </div>
      </div>
      {/* TODO: Add PIN auth guard here */}
      <FloorPlan sessions={sessions} onTableClick={handleTableClick} />
    </div>
  )
}

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="text-[12px] text-[#666]">
      {time.toLocaleDateString('vi-VN')} · {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
    </span>
  )
}
