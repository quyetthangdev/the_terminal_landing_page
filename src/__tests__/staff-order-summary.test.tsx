import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import OrderSummary from '@/components/staff/order-summary'
import type { OrderItem, SubmittedOrder } from '@/hooks/useTableSessions'

const pendingItems: OrderItem[] = [
  { menuItemId: 'd1', name: 'Terminal Espresso', priceNum: 45000, price: '45.000đ', quantity: 2, note: 'ít đường' },
  { menuItemId: 'm1', name: 'Pasta Carbonara', priceNum: 145000, price: '145.000đ', quantity: 1, note: '' },
]

const noOrders: SubmittedOrder[] = []

const defaultProps = {
  pendingItems,
  submittedOrders: noOrders,
  onUpdateItem: vi.fn(),
  onRemoveItem: vi.fn(),
  onSubmitOrder: vi.fn(),
  onPay: vi.fn(),
  onDraftReceipt: vi.fn(),
}

describe('OrderSummary', () => {
  it('renders all pending item names', () => {
    render(<OrderSummary {...defaultProps} />)
    expect(screen.getByText('Terminal Espresso')).toBeInTheDocument()
    expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument()
  })

  it('shows grand total correctly (2×45k + 1×145k = 235k)', () => {
    render(<OrderSummary {...defaultProps} />)
    expect(screen.getByText('235.000đ')).toBeInTheDocument()
  })

  it('shows existing note value', () => {
    render(<OrderSummary {...defaultProps} />)
    expect(screen.getByDisplayValue('ít đường')).toBeInTheDocument()
  })

  it('calls onUpdateItem with new note on input change', async () => {
    const onUpdateItem = vi.fn()
    render(<OrderSummary {...defaultProps} onUpdateItem={onUpdateItem} />)
    const inputs = screen.getAllByPlaceholderText('Ghi chú cho món này…')
    const input = inputs[0] as HTMLInputElement
    fireEvent.change(input, { target: { value: 'thêm đá' } })
    expect(onUpdateItem).toHaveBeenLastCalledWith('d1', { note: 'thêm đá' })
  })

  it('calls onRemoveItem when trash button clicked', async () => {
    const onRemoveItem = vi.fn()
    render(<OrderSummary {...defaultProps} onRemoveItem={onRemoveItem} />)
    const trashBtns = screen.getAllByRole('button', { name: /xoá/i })
    await userEvent.click(trashBtns[0])
    expect(onRemoveItem).toHaveBeenCalledWith('d1')
  })

  it('shows empty state when no items and no submitted orders', () => {
    render(<OrderSummary {...defaultProps} pendingItems={[]} submittedOrders={[]} />)
    expect(screen.getByText(/chưa có món/i)).toBeInTheDocument()
  })

  it('ĐẶT MÓN button is enabled when pending items exist', () => {
    render(<OrderSummary {...defaultProps} />)
    const btn = screen.getByRole('button', { name: /đặt món/i })
    expect(btn).not.toBeDisabled()
  })

  it('ĐẶT MÓN button is disabled when no pending items', () => {
    render(<OrderSummary {...defaultProps} pendingItems={[]} />)
    const btn = screen.getByRole('button', { name: /đặt món/i })
    expect(btn).toBeDisabled()
  })

  it('opens confirm dialog on ĐẶT MÓN click and calls onSubmitOrder on confirm', async () => {
    const onSubmitOrder = vi.fn()
    render(<OrderSummary {...defaultProps} onSubmitOrder={onSubmitOrder} />)
    await userEvent.click(screen.getByRole('button', { name: /đặt món/i }))
    expect(screen.getByText('Xác nhận đặt món')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /xác nhận/i }))
    expect(onSubmitOrder).toHaveBeenCalledOnce()
  })

  it('THANH TOÁN is disabled when no submitted orders', () => {
    render(<OrderSummary {...defaultProps} submittedOrders={[]} />)
    const btn = screen.getByRole('button', { name: /thanh toán/i })
    expect(btn).toBeDisabled()
  })

  it('THANH TOÁN is enabled and calls onPay when submitted orders exist', async () => {
    const onPay = vi.fn()
    const submittedOrders: SubmittedOrder[] = [
      { id: 'o1', submittedAt: new Date().toISOString(), items: [pendingItems[0]] }
    ]
    render(<OrderSummary {...defaultProps} pendingItems={[]} submittedOrders={submittedOrders} onPay={onPay} />)
    const btn = screen.getByRole('button', { name: /thanh toán/i })
    expect(btn).not.toBeDisabled()
    await userEvent.click(btn)
    expect(onPay).toHaveBeenCalledOnce()
  })

  it('shows submitted orders history', () => {
    const submittedOrders: SubmittedOrder[] = [
      { id: 'o1', submittedAt: new Date().toISOString(), items: [
        { menuItemId: 'd1', name: 'Terminal Espresso', priceNum: 45000, price: '45.000đ', quantity: 1, note: '' }
      ]}
    ]
    render(<OrderSummary {...defaultProps} submittedOrders={submittedOrders} />)
    expect(screen.getByText(/đơn 1/i)).toBeInTheDocument()
  })
})
