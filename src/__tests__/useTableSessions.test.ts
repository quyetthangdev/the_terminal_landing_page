import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useTableSessions } from '@/hooks/useTableSessions'

beforeEach(() => localStorage.clear())

describe('useTableSessions', () => {
  it('starts with empty sessions', () => {
    const { result } = renderHook(() => useTableSessions())
    expect(result.current.sessions).toEqual({})
  })

  it('openSession creates a serving session', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('01'))
    expect(result.current.sessions['01'].status).toBe('serving')
    expect(result.current.sessions['01'].pendingItems).toEqual([])
    expect(result.current.sessions['01'].submittedOrders).toEqual([])
  })

  it('addItem adds a new item with qty 1 to pendingItems', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('01'))
    act(() => result.current.addItem('01', {
      menuItemId: 'd1', name: 'Espresso', priceNum: 45000, price: '45.000đ',
    }))
    const items = result.current.sessions['01'].pendingItems
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(1)
    expect(items[0].note).toBe('')
  })

  it('addItem increments quantity for existing pending item', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('01'))
    const item = { menuItemId: 'd1', name: 'Espresso', priceNum: 45000, price: '45.000đ' }
    act(() => result.current.addItem('01', item))
    act(() => result.current.addItem('01', item))
    expect(result.current.sessions['01'].pendingItems[0].quantity).toBe(2)
  })

  it('updateItem patches note in pendingItems', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('01'))
    act(() => result.current.addItem('01', {
      menuItemId: 'd1', name: 'Espresso', priceNum: 45000, price: '45.000đ',
    }))
    act(() => result.current.updateItem('01', 'd1', { note: 'ít đường' }))
    expect(result.current.sessions['01'].pendingItems[0].note).toBe('ít đường')
  })

  it('removeItem deletes the item from pendingItems', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('01'))
    act(() => result.current.addItem('01', {
      menuItemId: 'd1', name: 'Espresso', priceNum: 45000, price: '45.000đ',
    }))
    act(() => result.current.removeItem('01', 'd1'))
    expect(result.current.sessions['01'].pendingItems).toHaveLength(0)
  })

  it('submitOrder moves pendingItems to submittedOrders and clears pending', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('01'))
    act(() => result.current.addItem('01', {
      menuItemId: 'd1', name: 'Espresso', priceNum: 45000, price: '45.000đ',
    }))
    act(() => result.current.submitOrder('01'))
    expect(result.current.sessions['01'].pendingItems).toHaveLength(0)
    expect(result.current.sessions['01'].submittedOrders).toHaveLength(1)
    expect(result.current.sessions['01'].submittedOrders[0].items[0].menuItemId).toBe('d1')
  })

  it('submitOrder does nothing when pendingItems is empty', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('01'))
    act(() => result.current.submitOrder('01'))
    expect(result.current.sessions['01'].submittedOrders).toHaveLength(0)
  })

  it('requestPayment sets status to waiting_payment', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('01'))
    act(() => result.current.requestPayment('01'))
    expect(result.current.sessions['01'].status).toBe('waiting_payment')
  })

  it('closeSession removes the table from sessions', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('01'))
    act(() => result.current.closeSession('01'))
    expect(result.current.sessions['01']).toBeUndefined()
  })

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useTableSessions())
    act(() => result.current.openSession('02'))
    const stored = JSON.parse(localStorage.getItem('terminal_staff_sessions')!)
    expect(stored['02'].status).toBe('serving')
  })

  it('loads from localStorage on mount', () => {
    localStorage.setItem('terminal_staff_sessions', JSON.stringify({
      '03': { tableId: '03', status: 'serving', pendingItems: [], submittedOrders: [], openedAt: '2026-01-01T00:00:00.000Z' }
    }))
    const { result } = renderHook(() => useTableSessions())
    expect(result.current.sessions['03'].status).toBe('serving')
  })
})
