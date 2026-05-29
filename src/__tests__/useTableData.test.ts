import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTableData } from '@/hooks/useTableData'

beforeEach(() => localStorage.clear())

describe('useTableData', () => {
  it('loads 12 default tables when localStorage is empty', () => {
    const { result } = renderHook(() => useTableData())
    expect(result.current.tables).toHaveLength(12)
  })

  it('adds a table and persists to localStorage', () => {
    const { result } = renderHook(() => useTableData())
    act(() => {
      result.current.addTable({ label: 'Bàn VIP', seats: 8, gridCol: 1, gridRow: 4 })
    })
    expect(result.current.tables).toHaveLength(13)
    const stored: unknown[] = JSON.parse(localStorage.getItem('terminal_tables') ?? '[]')
    expect(stored).toHaveLength(13)
  })

  it('updates a table by id', () => {
    const { result } = renderHook(() => useTableData())
    const id = result.current.tables[0].id
    act(() => result.current.updateTable(id, { label: 'VIP' }))
    expect(result.current.tables[0].label).toBe('VIP')
    const stored: Array<{ id: string; label: string }> = JSON.parse(localStorage.getItem('terminal_tables') ?? '[]')
    expect(stored.find(t => t.id === id)?.label).toBe('VIP')
  })

  it('deletes a table by id', () => {
    const { result } = renderHook(() => useTableData())
    const id = result.current.tables[0].id
    act(() => result.current.deleteTable(id))
    expect(result.current.tables).toHaveLength(11)
    expect(result.current.tables.find(t => t.id === id)).toBeUndefined()
    const stored: unknown[] = JSON.parse(localStorage.getItem('terminal_tables') ?? '[]')
    expect(stored).toHaveLength(11)
  })
})
