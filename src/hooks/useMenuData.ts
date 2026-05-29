import { useState } from 'react'
import { menuItems as defaultItems, categories as defaultCategories } from '@/data/menu'
import type { MenuItem, Category } from '@/data/menu'

const ITEMS_KEY = 'terminal_menu_items'
const CATS_KEY = 'terminal_categories'

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function useMenuData() {
  const [items, setItems] = useState<MenuItem[]>(() => readLocal(ITEMS_KEY, [...defaultItems]))
  const [categories, setCategories] = useState<Category[]>(() => readLocal(CATS_KEY, [...defaultCategories]))

  function addItem(item: Omit<MenuItem, 'id'>): void {
    setItems(prev => {
      const next = [...prev, { ...item, id: `item_${crypto.randomUUID()}` }]
      localStorage.setItem(ITEMS_KEY, JSON.stringify(next))
      return next
    })
  }

  function updateItem(id: string, patch: Partial<Omit<MenuItem, 'id'>>): void {
    setItems(prev => {
      const next = prev.map(i => (i.id === id ? { ...i, ...patch } : i))
      localStorage.setItem(ITEMS_KEY, JSON.stringify(next))
      return next
    })
  }

  function deleteItem(id: string): void {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      localStorage.setItem(ITEMS_KEY, JSON.stringify(next))
      return next
    })
  }

  function addCategory(label: string): void {
    setCategories(prev => {
      const next = [...prev, { id: `cat_${crypto.randomUUID()}`, label }]
      localStorage.setItem(CATS_KEY, JSON.stringify(next))
      return next
    })
  }

  function updateCategory(id: string, label: string): void {
    setCategories(prev => {
      const next = prev.map(c => (c.id === id ? { ...c, label } : c))
      localStorage.setItem(CATS_KEY, JSON.stringify(next))
      return next
    })
  }

  function deleteCategory(id: string): void {
    setCategories(prev => {
      const next = prev.filter(c => c.id !== id)
      localStorage.setItem(CATS_KEY, JSON.stringify(next))
      return next
    })
  }

  return { items, categories, addItem, updateItem, deleteItem, addCategory, updateCategory, deleteCategory }
}
