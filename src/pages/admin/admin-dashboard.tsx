import { useMenuData } from '@/hooks/useMenuData'
import { useTableData } from '@/hooks/useTableData'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { items, categories } = useMenuData()
  const { tables } = useTableData()
  const navigate = useNavigate()

  const stats = [
    { label: 'Tổng số bàn', value: tables.length, to: '/admin/tables' },
    { label: 'Danh mục', value: categories.length, to: '/admin/menu' },
    { label: 'Số món', value: items.length, to: '/admin/menu' },
  ]

  return (
    <div className="p-6">
      <p className="text-[10px] tracking-[0.2em] text-gray-400 dark:text-[#555] uppercase mb-6">Tổng quan</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <button
            key={s.label}
            onClick={() => navigate(s.to)}
            className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded p-5 text-left hover:border-gold/30 transition-colors"
          >
            <p className="font-display text-3xl font-bold text-gold mb-1">{s.value}</p>
            <p className="text-[10px] tracking-[0.15em] text-gray-400 dark:text-[#555] uppercase">{s.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
