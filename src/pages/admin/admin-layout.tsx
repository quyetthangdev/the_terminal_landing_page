import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import PinGate from '@/components/admin/pin-gate'
import { useSettings } from '@/hooks/useSettings'
import { useAdminTheme } from '@/hooks/useAdminTheme'

export default function AdminLayout() {
  const { settings } = useSettings()
  const { isDark, toggle } = useAdminTheme()
  const [authed, setAuthed] = useState(false)
  const navigate = useNavigate()

  if (!authed) {
    return <PinGate correctPin={settings.pin} onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-darker text-gray-900 dark:text-[#f5f0e8] flex">
      <nav className="w-44 flex-shrink-0 bg-white dark:bg-[#111] border-r border-gray-200 dark:border-[#2a2a2a] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-[#2a2a2a]">
          <p className="font-display text-gold text-sm">THE TERMINAL</p>
          <p className="text-[9px] text-gray-400 dark:text-[#555] tracking-[0.15em] uppercase">Quản lý</p>
        </div>
        <div className="flex-1 py-2">
          {[
            { to: '/admin', label: 'Tổng quan', end: true },
            { to: '/admin/menu', label: 'Thực đơn', end: false },
            { to: '/admin/tables', label: 'Bàn', end: false },
            { to: '/admin/settings', label: 'Cài đặt', end: false },
          ].map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-[11px] tracking-[0.1em] transition-colors border-l-2 ${
                  isActive
                    ? 'text-gold bg-amber-50 dark:bg-[#1c1a10] border-gold'
                    : 'text-gray-400 dark:text-[#555] hover:text-gray-600 dark:hover:text-[#888] border-transparent'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-[#2a2a2a]">
          <button
            onClick={() => navigate('/staff')}
            className="text-[10px] text-gray-400 dark:text-[#555] hover:text-gray-600 dark:hover:text-[#888] tracking-[0.1em] transition-colors"
          >
            ← Nhân viên
          </button>
        </div>
      </nav>
      <main className="flex-1 overflow-auto flex flex-col">
        <div className="flex justify-end px-4 py-2 border-b border-gray-100 dark:border-[#2a2a2a]">
          <button
            onClick={toggle}
            aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            className="text-gray-400 dark:text-[#555] hover:text-gray-600 dark:hover:text-[#888] p-1.5 rounded transition-colors"
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
