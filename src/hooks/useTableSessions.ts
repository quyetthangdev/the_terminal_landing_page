import { useState, useCallback } from 'react'

export interface OrderItem {
  menuItemId: string
  name: string
  priceNum: number
  price: string
  quantity: number
  note: string
}

export interface TableSession {
  tableId: string
  status: 'empty' | 'serving' | 'waiting_payment' | 'done'
  items: OrderItem[]
  openedAt: string
}

const STORAGE_KEY = 'terminal_staff_sessions'

function load(): Record<string, TableSession> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function save(sessions: Record<string, TableSession>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export function useTableSessions() {
  const [sessions, setSessions] = useState<Record<string, TableSession>>(load)

  const update = useCallback(
    (fn: (prev: Record<string, TableSession>) => Record<string, TableSession>) => {
      setSessions(prev => {
        const next = fn(prev)
        save(next)
        return next
      })
    },
    [],
  )

  const openSession = useCallback(
    (tableId: string) => {
      update(prev => ({
        ...prev,
        [tableId]: { tableId, status: 'serving', items: [], openedAt: new Date().toISOString() },
      }))
    },
    [update],
  )

  const addItem = useCallback(
    (tableId: string, item: Omit<OrderItem, 'quantity' | 'note'>) => {
      update(prev => {
        const session = prev[tableId]
        if (!session) return prev
        const idx = session.items.findIndex(i => i.menuItemId === item.menuItemId)
        const items =
          idx >= 0
            ? session.items.map((i, n) => (n === idx ? { ...i, quantity: i.quantity + 1 } : i))
            : [...session.items, { ...item, quantity: 1, note: '' }]
        return { ...prev, [tableId]: { ...session, items } }
      })
    },
    [update],
  )

  const updateItem = useCallback(
    (tableId: string, menuItemId: string, patch: Partial<Pick<OrderItem, 'quantity' | 'note'>>) => {
      update(prev => {
        const session = prev[tableId]
        if (!session) return prev
        const items = session.items.map(i => (i.menuItemId === menuItemId ? { ...i, ...patch } : i))
        return { ...prev, [tableId]: { ...session, items } }
      })
    },
    [update],
  )

  const removeItem = useCallback(
    (tableId: string, menuItemId: string) => {
      update(prev => {
        const session = prev[tableId]
        if (!session) return prev
        return { ...prev, [tableId]: { ...session, items: session.items.filter(i => i.menuItemId !== menuItemId) } }
      })
    },
    [update],
  )

  const requestPayment = useCallback(
    (tableId: string) => {
      update(prev => {
        const session = prev[tableId]
        if (!session) return prev
        return { ...prev, [tableId]: { ...session, status: 'waiting_payment' } }
      })
    },
    [update],
  )

  const closeSession = useCallback(
    (tableId: string) => {
      update(prev => {
        const next = { ...prev }
        delete next[tableId]
        return next
      })
    },
    [update],
  )

  return { sessions, openSession, addItem, updateItem, removeItem, requestPayment, closeSession }
}
