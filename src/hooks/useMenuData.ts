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
    const next = [...items, { ...item, id: `item_${crypto.randomUUID()}` }]
    setItems(next)
    localStorage.setItem(ITEMS_KEY, JSON.stringify(next))
  }

  function updateItem(id: string, patch: Partial<Omit<MenuItem, 'id'>>): void {
    const next = items.map(i => (i.id === id ? { ...i, ...patch } : i))
    setItems(next)
    localStorage.setItem(ITEMS_KEY, JSON.stringify(next))
  }

  function deleteItem(id: string): void {
    const next = items.filter(i => i.id !== id)
    setItems(next)
    localStorage.setItem(ITEMS_KEY, JSON.stringify(next))
  }

  function addCategory(label: string): void {
    const next = [...categories, { id: `cat_${crypto.randomUUID()}`, label }]
    setCategories(next)
    localStorage.setItem(CATS_KEY, JSON.stringify(next))
  }

  function updateCategory(id: string, label: string): void {
    const next = categories.map(c => (c.id === id ? { ...c, label } : c))
    setCategories(next)
    localStorage.setItem(CATS_KEY, JSON.stringify(next))
  }

  function deleteCategory(id: string): void {
    const next = categories.filter(c => c.id !== id)
    setCategories(next)
    localStorage.setItem(CATS_KEY, JSON.stringify(next))
  }

  return { items, categories, addItem, updateItem, deleteItem, addCategory, updateCategory, deleteCategory }
}
