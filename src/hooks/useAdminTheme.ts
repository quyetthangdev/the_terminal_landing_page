import { useState, useEffect } from 'react'

const KEY = 'terminal_admin_theme'

export function useAdminTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(KEY)
      return stored === null ? true : stored === 'dark'
    } catch {
      return true
    }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    try { localStorage.setItem(KEY, isDark ? 'dark' : 'light') } catch {}
    return () => { document.documentElement.classList.remove('dark') }
  }, [isDark])

  return { isDark, toggle: () => setIsDark(d => !d) }
}
