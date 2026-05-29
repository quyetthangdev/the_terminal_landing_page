import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AdminSettingsPage from '@/pages/admin/admin-settings'

const mockUpdateSettings = vi.fn()

vi.mock('@/hooks/useSettings', () => ({
  useSettings: () => ({
    settings: {
      restaurantName: 'THE TERMINAL',
      address: '123 Test St',
      taxCode: '0123456789',
      phone: '0901234567',
      invoiceSymbol: 'AA/24E',
      pin: '1234',
      vatRate: 0.1,
    },
    updateSettings: mockUpdateSettings,
  }),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

beforeEach(() => mockUpdateSettings.mockClear())

describe('AdminSettingsPage', () => {
  it('renders restaurant info form with pre-filled values', () => {
    render(<AdminSettingsPage />)
    expect((screen.getByLabelText(/tên nhà hàng/i) as HTMLInputElement).value).toBe('THE TERMINAL')
    expect((screen.getByLabelText(/thuế vat/i) as HTMLInputElement).value).toBe('10')
  })

  it('calls updateSettings on info form submit', () => {
    render(<AdminSettingsPage />)
    fireEvent.change(screen.getByLabelText(/tên nhà hàng/i), { target: { value: 'New Name' } })
    fireEvent.click(screen.getByRole('button', { name: /lưu cài đặt/i }))
    expect(mockUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({ restaurantName: 'New Name' }))
  })

  it('calls updateSettings with new PIN when PIN form is valid', () => {
    render(<AdminSettingsPage />)
    fireEvent.change(screen.getByLabelText(/pin mới/i), { target: { value: '9999' } })
    fireEvent.change(screen.getByLabelText(/xác nhận pin/i), { target: { value: '9999' } })
    fireEvent.click(screen.getByRole('button', { name: /đổi pin/i }))
    expect(mockUpdateSettings).toHaveBeenCalledWith({ pin: '9999' })
  })

  it('does not call updateSettings when PIN confirmation does not match', () => {
    render(<AdminSettingsPage />)
    fireEvent.change(screen.getByLabelText(/pin mới/i), { target: { value: '9999' } })
    fireEvent.change(screen.getByLabelText(/xác nhận pin/i), { target: { value: '1111' } })
    fireEvent.click(screen.getByRole('button', { name: /đổi pin/i }))
    expect(mockUpdateSettings).not.toHaveBeenCalled()
  })

  it('rejects PIN shorter than 4 characters without calling updateSettings', () => {
    render(<AdminSettingsPage />)
    fireEvent.change(screen.getByLabelText(/pin mới/i), { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText(/xác nhận pin/i), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: /đổi pin/i }))
    expect(mockUpdateSettings).not.toHaveBeenCalled()
  })

  it('saves vatRate as decimal when VAT percent changes', () => {
    render(<AdminSettingsPage />)
    fireEvent.change(screen.getByLabelText(/thuế vat/i), { target: { value: '15' } })
    fireEvent.click(screen.getByRole('button', { name: /lưu cài đặt/i }))
    expect(mockUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({ vatRate: 0.15 }))
  })

  it('clears PIN fields after successful PIN change', () => {
    render(<AdminSettingsPage />)
    const newPinInput = screen.getByLabelText(/pin mới/i) as HTMLInputElement
    const confirmInput = screen.getByLabelText(/xác nhận pin/i) as HTMLInputElement
    fireEvent.change(newPinInput, { target: { value: '5678' } })
    fireEvent.change(confirmInput, { target: { value: '5678' } })
    fireEvent.click(screen.getByRole('button', { name: /đổi pin/i }))
    expect(newPinInput.value).toBe('')
    expect(confirmInput.value).toBe('')
  })
})
