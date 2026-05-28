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
  it('shows Khai Vị items by default', () => {
    render(<MenuSection />)
    expect(screen.getByText('Foie Gras Terrine')).toBeInTheDocument()
    expect(screen.getByText('Burrata & Tomato')).toBeInTheDocument()
  })

  it('shows Ăn Sáng items when breakfast button clicked', async () => {
    render(<MenuSection />)
    await userEvent.click(screen.getByRole('button', { name: 'Ăn Sáng' }))
    expect(await screen.findByText('Eggs Benedict')).toBeInTheDocument()
    expect(screen.queryByText('Foie Gras Terrine')).not.toBeInTheDocument()
  })

  it('shows Pasta items when pasta button clicked', async () => {
    render(<MenuSection />)
    await userEvent.click(screen.getByRole('button', { name: 'Pasta' }))
    expect(await screen.findByText('Pasta Carbonara')).toBeInTheDocument()
  })

  it('shows Tráng Miệng items when desserts button clicked', async () => {
    render(<MenuSection />)
    await userEvent.click(screen.getByRole('button', { name: 'Tráng Miệng' }))
    expect(await screen.findByText('Crème Brûlée')).toBeInTheDocument()
  })

  it('displays price for each item', () => {
    render(<MenuSection />)
    expect(screen.getByText('245.000đ')).toBeInTheDocument()
  })
})
