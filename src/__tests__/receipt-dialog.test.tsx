import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ReceiptDialog from '@/components/staff/receipt-dialog'
import type { SubmittedOrder } from '@/hooks/useTableSessions'

const orders: SubmittedOrder[] = [
  {
    id: 'o1',
    submittedAt: new Date().toISOString(),
    items: [{ menuItemId: 'd1', name: 'Terminal Espresso', priceNum: 45000, price: '45.000đ', quantity: 1, note: '' }],
  },
]

const defaultProps = {
  tableId: '01',
  tableLabel: 'Bàn 01',
  orders,
  isDraft: false,
  onClose: vi.fn(),
}

describe('ReceiptDialog', () => {
  it('renders receipt content inside the dialog', () => {
    render(<ReceiptDialog {...defaultProps} />)
    expect(screen.getByText('THE TERMINAL')).toBeInTheDocument()
  })

  it('shows "Hoá đơn" in topbar for final receipt', () => {
    render(<ReceiptDialog {...defaultProps} isDraft={false} />)
    expect(screen.getByText('Hoá đơn')).toBeInTheDocument()
  })

  it('shows "Hoá đơn tạm" in topbar for draft', () => {
    render(<ReceiptDialog {...defaultProps} isDraft={true} />)
    expect(screen.getByText('Hoá đơn tạm')).toBeInTheDocument()
  })

  it('calls onClose when × button clicked', async () => {
    const onClose = vi.fn()
    render(<ReceiptDialog {...defaultProps} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop clicked', async () => {
    const onClose = vi.fn()
    const { container } = render(<ReceiptDialog {...defaultProps} onClose={onClose} />)
    // The backdrop is the outermost fixed div
    await userEvent.click(container.firstChild as HTMLElement)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does NOT call onClose when clicking inside dialog panel', async () => {
    const onClose = vi.fn()
    render(<ReceiptDialog {...defaultProps} onClose={onClose} />)
    await userEvent.click(screen.getByText('THE TERMINAL'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('shows "HOÀN TẤT" button only when onDone is provided', () => {
    const { rerender } = render(<ReceiptDialog {...defaultProps} />)
    expect(screen.queryByRole('button', { name: /HOÀN TẤT/i })).not.toBeInTheDocument()

    rerender(<ReceiptDialog {...defaultProps} onDone={vi.fn()} />)
    expect(screen.getByRole('button', { name: /HOÀN TẤT/i })).toBeInTheDocument()
  })

  it('calls onDone when "HOÀN TẤT" clicked', async () => {
    const onDone = vi.fn()
    render(<ReceiptDialog {...defaultProps} onDone={onDone} />)
    await userEvent.click(screen.getByRole('button', { name: /HOÀN TẤT/i }))
    expect(onDone).toHaveBeenCalledOnce()
  })

  it('opens receipt URL in new tab when "IN" clicked', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<ReceiptDialog {...defaultProps} tableId="01" isDraft={false} />)
    await userEvent.click(screen.getByRole('button', { name: 'IN' }))
    expect(openSpy).toHaveBeenCalledWith('/staff/table/01/receipt', '_blank')
    openSpy.mockRestore()
  })

  it('appends ?draft=true to receipt URL when isDraft=true', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<ReceiptDialog {...defaultProps} tableId="01" isDraft={true} />)
    await userEvent.click(screen.getByRole('button', { name: 'IN' }))
    expect(openSpy).toHaveBeenCalledWith('/staff/table/01/receipt?draft=true', '_blank')
    openSpy.mockRestore()
  })
})
