import { useState } from 'react'
import { tables as defaultTables } from '@/data/tables'
import type { Table } from '@/data/tables'

const TABLES_KEY = 'terminal_tables'

export function useTableData() {
  const [tables, setTables] = useState<Table[]>(() => {
    try {
      const raw = localStorage.getItem(TABLES_KEY)
      return raw ? (JSON.parse(raw) as Table[]) : [...defaultTables]
    } catch {
      return [...defaultTables]
    }
  })

  function addTable(table: Omit<Table, 'id'>): void {
    setTables(prev => {
      const next = [...prev, { ...table, id: `t${crypto.randomUUID()}` }]
      localStorage.setItem(TABLES_KEY, JSON.stringify(next))
      return next
    })
  }

  function updateTable(id: string, patch: Partial<Omit<Table, 'id'>>): void {
    setTables(prev => {
      const next = prev.map(t => (t.id === id ? { ...t, ...patch } : t))
      localStorage.setItem(TABLES_KEY, JSON.stringify(next))
      return next
    })
  }

  function deleteTable(id: string): void {
    setTables(prev => {
      const next = prev.filter(t => t.id !== id)
      localStorage.setItem(TABLES_KEY, JSON.stringify(next))
      return next
    })
  }

  return { tables, addTable, updateTable, deleteTable }
}
