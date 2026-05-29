import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSettings } from '@/hooks/useSettings'

beforeEach(() => localStorage.clear())

describe('useSettings', () => {
  it('returns defaults when localStorage is empty', () => {
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings.restaurantName).toBe('THE TERMINAL')
    expect(result.current.settings.pin).toBe('1234')
    expect(result.current.settings.vatRate).toBe(0.1)
  })

  it('updates settings and persists to localStorage', () => {
    const { result } = renderHook(() => useSettings())
    act(() => result.current.updateSettings({ restaurantName: 'New Name', pin: '9999' }))
    expect(result.current.settings.restaurantName).toBe('New Name')
    expect(result.current.settings.pin).toBe('9999')
    const stored = JSON.parse(localStorage.getItem('terminal_settings') ?? '{}') as Record<string, unknown>
    expect(stored).toMatchObject({ restaurantName: 'New Name', pin: '9999', vatRate: 0.1 })
  })

  it('merges partial localStorage data with defaults on init', () => {
    localStorage.setItem('terminal_settings', JSON.stringify({ pin: '5678' }))
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings.pin).toBe('5678')
    expect(result.current.settings.restaurantName).toBe('THE TERMINAL')
  })
})
