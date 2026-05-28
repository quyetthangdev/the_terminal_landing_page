import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import InvoiceForm from '@/components/staff/invoice-form'

describe('InvoiceForm', () => {
  it('renders all required fields', () => {
    render(<InvoiceForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/tên công ty/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mã số thuế/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/địa chỉ/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('disables submit when required fields are empty', () => {
    render(<InvoiceForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /xuất hoá đơn/i })).toBeDisabled()
  })

  it('enables submit when all required fields filled', async () => {
    render(<InvoiceForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/tên công ty/i), { target: { value: 'Cty ABC' } })
    fireEvent.change(screen.getByLabelText(/mã số thuế/i), { target: { value: '0123456789' } })
    fireEvent.change(screen.getByLabelText(/địa chỉ/i), { target: { value: '123 ABC' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } })
    expect(screen.getByRole('button', { name: /xuất hoá đơn/i })).not.toBeDisabled()
  })

  it('calls onSubmit with correct InvoiceRequest data', async () => {
    const onSubmit = vi.fn()
    render(<InvoiceForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/tên công ty/i), { target: { value: 'Cty ABC' } })
    fireEvent.change(screen.getByLabelText(/mã số thuế/i), { target: { value: '0123456789' } })
    fireEvent.change(screen.getByLabelText(/địa chỉ/i), { target: { value: '123 ABC' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } })
    await userEvent.click(screen.getByRole('button', { name: /xuất hoá đơn/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      buyerName: 'Cty ABC',
      buyerTaxCode: '0123456789',
      buyerAddress: '123 ABC',
      buyerEmail: 'a@b.com',
      paymentMethod: 'cash',
    })
  })

  it('calls onCancel when cancel button clicked', async () => {
    const onCancel = vi.fn()
    render(<InvoiceForm onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /hủy/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
