import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import OrderSummary from '@/components/staff/order-summary'
import type { OrderItem } from '@/hooks/useTableSessions'

const items: OrderItem[] = [
  { menuItemId: 'd1', name: 'Terminal Espresso', priceNum: 45000, price: '45.000đ', quantity: 2, note: 'ít đường' },
  { menuItemId: 'm1', name: 'Pasta Carbonara', priceNum: 145000, price: '145.000đ', quantity: 1, note: '' },
]

describe('OrderSummary', () => {
  it('renders all item names', () => {
    render(<OrderSummary items={items} onUpdateItem={vi.fn()} onRemoveItem={vi.fn()} onPay={vi.fn()} />)
    expect(screen.getByText('Terminal Espresso')).toBeInTheDocument()
    expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument()
  })

  it('shows total correctly (2×45k + 1×145k = 235k)', () => {
    render(<OrderSummary items={items} onUpdateItem={vi.fn()} onRemoveItem={vi.fn()} onPay={vi.fn()} />)
    expect(screen.getByText('235.000đ')).toBeInTheDocument()
  })

  it('shows existing note value', () => {
    render(<OrderSummary items={items} onUpdateItem={vi.fn()} onRemoveItem={vi.fn()} onPay={vi.fn()} />)
    expect(screen.getByDisplayValue('ít đường')).toBeInTheDocument()
  })

  it('calls onUpdateItem with new note on input change', async () => {
    const onUpdateItem = vi.fn()
    render(<OrderSummary items={items} onUpdateItem={onUpdateItem} onRemoveItem={vi.fn()} onPay={vi.fn()} />)
    const inputs = screen.getAllByPlaceholderText('Ghi chú cho món này…')
    const input = inputs[0] as HTMLInputElement
    // Use fireEvent to bypass userEvent Vietnamese character issues
    const newNote = 'thêm đá'
    fireEvent.change(input, { target: { value: newNote } })
    expect(onUpdateItem).toHaveBeenLastCalledWith('d1', { note: newNote })
  })

  it('calls onRemoveItem when trash button clicked', async () => {
    const onRemoveItem = vi.fn()
    render(<OrderSummary items={items} onUpdateItem={vi.fn()} onRemoveItem={onRemoveItem} onPay={vi.fn()} />)
    const trashBtns = screen.getAllByRole('button', { name: /xoá/i })
    await userEvent.click(trashBtns[0])
    expect(onRemoveItem).toHaveBeenCalledWith('d1')
  })

  it('calls onPay when THANH TOÁN button clicked', async () => {
    const onPay = vi.fn()
    render(<OrderSummary items={items} onUpdateItem={vi.fn()} onRemoveItem={vi.fn()} onPay={onPay} />)
    await userEvent.click(screen.getByRole('button', { name: /thanh toán/i }))
    expect(onPay).toHaveBeenCalledOnce()
  })

  it('shows empty state when no items', () => {
    render(<OrderSummary items={[]} onUpdateItem={vi.fn()} onRemoveItem={vi.fn()} onPay={vi.fn()} />)
    expect(screen.getByText(/chưa có món/i)).toBeInTheDocument()
  })
})
