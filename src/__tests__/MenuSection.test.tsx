import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MenuSection from '@/components/sections/MenuSection'

beforeEach(() => {
  const MockIntersectionObserver = vi.fn(function (this: IntersectionObserver) {
    this.observe = vi.fn()
    this.disconnect = vi.fn()
    this.unobserve = vi.fn()
  })
  window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
})

describe('MenuSection', () => {
  it('shows THỨC UỐNG items by default', () => {
    render(<MenuSection />)
    expect(screen.getByText('Terminal Espresso')).toBeInTheDocument()
    expect(screen.getByText('Signature Latte')).toBeInTheDocument()
  })

  it('shows ĂN SÁNG items when breakfast button clicked', async () => {
    render(<MenuSection />)
    await userEvent.click(screen.getByRole('button', { name: 'ĂN SÁNG' }))
    expect(await screen.findByText('Eggs Benedict')).toBeInTheDocument()
    expect(screen.queryByText('Terminal Espresso')).not.toBeInTheDocument()
  })

  it('shows MÓN CHÍNH items when mains button clicked', async () => {
    render(<MenuSection />)
    await userEvent.click(screen.getByRole('button', { name: 'MÓN CHÍNH' }))
    expect(await screen.findByText('Pasta Carbonara')).toBeInTheDocument()
  })

  it('shows TRÁNG MIỆNG items when desserts button clicked', async () => {
    render(<MenuSection />)
    await userEvent.click(screen.getByRole('button', { name: 'TRÁNG MIỆNG' }))
    expect(await screen.findByText('Crème Brûlée')).toBeInTheDocument()
  })

  it('displays price for each item', () => {
    render(<MenuSection />)
    expect(screen.getByText('45.000đ')).toBeInTheDocument()
  })
})
