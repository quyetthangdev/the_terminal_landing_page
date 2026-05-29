import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MenuItemForm from '@/components/admin/menu-item-form'
import type { Category } from '@/data/menu'

const cats: Category[] = [
  { id: 'appetizers', label: 'Khai Vị' },
  { id: 'desserts', label: 'Tráng Miệng' },
]

describe('MenuItemForm', () => {
  it('calls onSave with correct data on submit', () => {
    const onSave = vi.fn()
    render(<MenuItemForm categories={cats} onSave={onSave} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/tên món/i), { target: { value: 'Test Dish' } })
    fireEvent.change(screen.getByLabelText(/giá/i), { target: { value: '150.000đ' } })
    fireEvent.click(screen.getByRole('button', { name: /lưu/i }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test Dish',
      price: '150.000đ',
      category: 'appetizers',
    }))
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<MenuItemForm categories={cats} onSave={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /hủy/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('pre-fills fields when editing an existing item', () => {
    const item = { id: 'ap1', name: 'Existing', description: 'Desc', price: '200.000đ', image: '', category: 'desserts' }
    render(<MenuItemForm categories={cats} initial={item} onSave={vi.fn()} onCancel={vi.fn()} />)
    expect((screen.getByLabelText(/tên món/i) as HTMLInputElement).value).toBe('Existing')
    expect((screen.getByLabelText(/giá/i) as HTMLInputElement).value).toBe('200.000đ')
  })
})
