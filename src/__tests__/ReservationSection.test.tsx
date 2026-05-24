import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ReservationSection from '@/components/sections/ReservationSection'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: vi.fn(),
}))

beforeEach(() => {
  const MockIntersectionObserver = vi.fn(function (this: IntersectionObserver) {
    this.observe = vi.fn()
    this.disconnect = vi.fn()
    this.unobserve = vi.fn()
  })
  window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
})

describe('ReservationSection', () => {
  it('renders all required form fields', () => {
    render(<ReservationSection />)
    expect(screen.getByLabelText(/họ & tên/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/số điện thoại/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ngày/i)).toBeInTheDocument()
    expect(screen.getByText('GỬI YÊU CẦU ĐẶT BÀN')).toBeInTheDocument()
  })

  it('shows validation error when required fields are empty on submit', async () => {
    render(<ReservationSection />)
    await userEvent.click(screen.getByText('GỬI YÊU CẦU ĐẶT BÀN'))
    expect(await screen.findByText(/vui lòng điền họ tên/i)).toBeInTheDocument()
  })

  it('calls toast on valid submit', async () => {
    const { toast } = await import('sonner')
    render(<ReservationSection />)
    await userEvent.type(screen.getByLabelText(/họ & tên/i), 'Nguyen Van A')
    await userEvent.type(screen.getByLabelText(/số điện thoại/i), '0900123456')
    await userEvent.type(screen.getByLabelText(/ngày/i), '2026-06-01')
    await userEvent.click(screen.getByText('GỬI YÊU CẦU ĐẶT BÀN'))
    expect(toast).toHaveBeenCalled()
  })
})
