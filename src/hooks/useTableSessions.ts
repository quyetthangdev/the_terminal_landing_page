import { useState, useCallback } from 'react'
import type { OrderItem, SubmittedOrder, TableSession } from '@/types/session'

// Re-export so all existing imports from this hook continue to work
export type { OrderItem, SubmittedOrder, TableSession } from '@/types/session'

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
        [tableId]: { tableId, status: 'serving', pendingItems: [], submittedOrders: [], openedAt: new Date().toISOString() },
      }))
    },
    [update],
  )

  const addItem = useCallback(
    (tableId: string, item: Omit<OrderItem, 'quantity' | 'note'>) => {
      update(prev => {
        const session = prev[tableId]
        if (!session) return prev
        const idx = session.pendingItems.findIndex(i => i.menuItemId === item.menuItemId)
        const pendingItems =
          idx >= 0
            ? session.pendingItems.map((i, n) => (n === idx ? { ...i, quantity: i.quantity + 1 } : i))
            : [...session.pendingItems, { ...item, quantity: 1, note: '' }]
        return { ...prev, [tableId]: { ...session, pendingItems } }
      })
    },
    [update],
  )

  const updateItem = useCallback(
    (tableId: string, menuItemId: string, patch: Partial<Pick<OrderItem, 'quantity' | 'note'>>) => {
      update(prev => {
        const session = prev[tableId]
        if (!session) return prev
        const pendingItems = session.pendingItems.map(i => (i.menuItemId === menuItemId ? { ...i, ...patch } : i))
        return { ...prev, [tableId]: { ...session, pendingItems } }
      })
    },
    [update],
  )

  const removeItem = useCallback(
    (tableId: string, menuItemId: string) => {
      update(prev => {
        const session = prev[tableId]
        if (!session) return prev
        return { ...prev, [tableId]: { ...session, pendingItems: session.pendingItems.filter(i => i.menuItemId !== menuItemId) } }
      })
    },
    [update],
  )

  const submitOrder = useCallback(
    (tableId: string) => {
      update(prev => {
        const session = prev[tableId]
        if (!session || session.pendingItems.length === 0) return prev
        const order: SubmittedOrder = {
          id: `order-${Date.now()}`,
          items: session.pendingItems,
          submittedAt: new Date().toISOString(),
        }
        return {
          ...prev,
          [tableId]: {
            ...session,
            pendingItems: [],
            submittedOrders: [...session.submittedOrders, order],
          },
        }
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

  const setInvoiceRequest = useCallback(
    (tableId: string, request: InvoiceRequest) => {
      update(prev => {
        const session = prev[tableId]
        if (!session) return prev
        return { ...prev, [tableId]: { ...session, invoiceRequest: request } }
      })
    },
    [update],
  )

  return { sessions, openSession, addItem, updateItem, removeItem, submitOrder, requestPayment, closeSession, setInvoiceRequest }
}
