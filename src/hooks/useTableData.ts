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
    const next = [...tables, { ...table, id: `t${crypto.randomUUID()}` }]
    setTables(next)
    localStorage.setItem(TABLES_KEY, JSON.stringify(next))
  }

  function updateTable(id: string, patch: Partial<Omit<Table, 'id'>>): void {
    const next = tables.map(t => (t.id === id ? { ...t, ...patch } : t))
    setTables(next)
    localStorage.setItem(TABLES_KEY, JSON.stringify(next))
  }

  function deleteTable(id: string): void {
    const next = tables.filter(t => t.id !== id)
    setTables(next)
    localStorage.setItem(TABLES_KEY, JSON.stringify(next))
  }

  return { tables, addTable, updateTable, deleteTable }
}
