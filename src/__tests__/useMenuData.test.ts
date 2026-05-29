import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMenuData } from '@/hooks/useMenuData'

beforeEach(() => localStorage.clear())

describe('useMenuData', () => {
  it('initializes from hardcoded defaults when localStorage is empty', () => {
    const { result } = renderHook(() => useMenuData())
    expect(result.current.items.length).toBeGreaterThan(0)
    expect(result.current.categories.length).toBeGreaterThan(0)
  })

  it('adds item and persists to localStorage', () => {
    const { result } = renderHook(() => useMenuData())
    const before = result.current.items.length
    act(() => {
      result.current.addItem({
        name: 'Test Dish',
        description: '',
        price: '100.000đ',
        image: '',
        category: 'appetizers',
      })
    })
    expect(result.current.items).toHaveLength(before + 1)
    const stored: unknown[] = JSON.parse(localStorage.getItem('terminal_menu_items') ?? '[]')
    expect(stored).toHaveLength(before + 1)
  })

  it('updates an item by id', () => {
    const { result } = renderHook(() => useMenuData())
    const id = result.current.items[0].id
    act(() => result.current.updateItem(id, { name: 'Renamed' }))
    expect(result.current.items.find(i => i.id === id)?.name).toBe('Renamed')
    const stored: Array<{ id: string; name: string }> = JSON.parse(localStorage.getItem('terminal_menu_items') ?? '[]')
    expect(stored.find(i => i.id === id)?.name).toBe('Renamed')
  })

  it('deletes an item by id', () => {
    const { result } = renderHook(() => useMenuData())
    const before = result.current.items.length
    const id = result.current.items[0].id
    act(() => result.current.deleteItem(id))
    expect(result.current.items).toHaveLength(before - 1)
    expect(result.current.items.find(i => i.id === id)).toBeUndefined()
  })

  it('reads existing data from localStorage on init', () => {
    const custom = [{ id: 'x1', name: 'Custom', description: '', price: '50.000đ', image: '', category: 'appetizers' }]
    localStorage.setItem('terminal_menu_items', JSON.stringify(custom))
    const { result } = renderHook(() => useMenuData())
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].name).toBe('Custom')
  })

  it('adds a category and persists', () => {
    const { result } = renderHook(() => useMenuData())
    const before = result.current.categories.length
    act(() => result.current.addCategory('Đặc Biệt'))
    expect(result.current.categories).toHaveLength(before + 1)
    expect(result.current.categories[before].label).toBe('Đặc Biệt')
  })
})
