import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useAdminTheme } from '@/hooks/useAdminTheme'

describe('useAdminTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to dark when no stored value', () => {
    const { result } = renderHook(() => useAdminTheme())
    expect(result.current.isDark).toBe(true)
  })

  it('reads light from localStorage', () => {
    localStorage.setItem('terminal_admin_theme', 'light')
    const { result } = renderHook(() => useAdminTheme())
    expect(result.current.isDark).toBe(false)
  })

  it('reads dark from localStorage', () => {
    localStorage.setItem('terminal_admin_theme', 'dark')
    const { result } = renderHook(() => useAdminTheme())
    expect(result.current.isDark).toBe(true)
  })

  it('toggle flips isDark from true to false', () => {
    const { result } = renderHook(() => useAdminTheme())
    expect(result.current.isDark).toBe(true)
    act(() => result.current.toggle())
    expect(result.current.isDark).toBe(false)
  })

  it('toggle flips isDark back to true', () => {
    const { result } = renderHook(() => useAdminTheme())
    act(() => result.current.toggle())
    act(() => result.current.toggle())
    expect(result.current.isDark).toBe(true)
  })

  it('persists dark to localStorage', () => {
    const { result } = renderHook(() => useAdminTheme())
    expect(localStorage.getItem('terminal_admin_theme')).toBe('dark')
  })

  it('persists light to localStorage after toggle', () => {
    const { result } = renderHook(() => useAdminTheme())
    act(() => result.current.toggle())
    expect(localStorage.getItem('terminal_admin_theme')).toBe('light')
  })

  it('adds dark class to documentElement when isDark true', () => {
    const { result } = renderHook(() => useAdminTheme())
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes dark class from documentElement when toggled to light', () => {
    const { result } = renderHook(() => useAdminTheme())
    act(() => result.current.toggle())
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
