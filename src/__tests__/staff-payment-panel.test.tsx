import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import PaymentPanel from '@/components/staff/payment-panel'

describe('PaymentPanel', () => {
  it('shows total amount', () => {
    render(<PaymentPanel total={345000} onConfirm={vi.fn()} />)
    expect(screen.getByText('345.000đ')).toBeInTheDocument()
  })

  it('renders 4 cash preset buttons', () => {
    render(<PaymentPanel total={345000} onConfirm={vi.fn()} />)
    expect(screen.getByRole('button', { name: '350k' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '400k' })).toBeInTheDocument()
  })

  it('clicking preset fills input and shows change', async () => {
    render(<PaymentPanel total={345000} onConfirm={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: '400k' }))
    expect(screen.getByDisplayValue('400000')).toBeInTheDocument()
    expect(screen.getByText('55.000đ')).toBeInTheDocument()
  })

  it('typing in input updates change', async () => {
    render(<PaymentPanel total={345000} onConfirm={vi.fn()} />)
    const input = screen.getByPlaceholderText('Nhập số tiền khác…')
    await userEvent.clear(input)
    await userEvent.type(input, '500000')
    expect(screen.getByText('155.000đ')).toBeInTheDocument()
  })

  it('calls onConfirm when cash confirm button clicked', async () => {
    const onConfirm = vi.fn()
    render(<PaymentPanel total={345000} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: '400k' }))
    await userEvent.click(screen.getByRole('button', { name: /xác nhận đã thu tiền/i }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('switches to transfer tab', async () => {
    render(<PaymentPanel total={345000} onConfirm={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /chuyển khoản/i }))
    expect(screen.getByRole('button', { name: /xác nhận đã nhận tiền/i })).toBeInTheDocument()
  })

  it('calls onConfirm from transfer tab', async () => {
    const onConfirm = vi.fn()
    render(<PaymentPanel total={345000} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: /chuyển khoản/i }))
    await userEvent.click(screen.getByRole('button', { name: /xác nhận đã nhận tiền/i }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
