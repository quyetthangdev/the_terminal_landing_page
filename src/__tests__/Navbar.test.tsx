import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Navbar from '@/components/layout/Navbar'

describe('Navbar', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
  })

  it('renders THE TERMINAL logo', () => {
    render(<Navbar />)
    expect(screen.getByText('THE TERMINAL')).toBeInTheDocument()
  })

  it('renders all nav links', () => {
    render(<Navbar />)
    expect(screen.getByText('GIỚI THIỆU')).toBeInTheDocument()
    expect(screen.getByText('MENU')).toBeInTheDocument()
    expect(screen.getByText('ĐẶT BÀN')).toBeInTheDocument()
    expect(screen.getByText('LIÊN HỆ')).toBeInTheDocument()
  })

  it('applies scrolled class when window.scrollY > 80', () => {
    render(<Navbar />)
    const nav = screen.getByRole('navigation')
    expect(nav).not.toHaveClass('bg-brand-darker')
    Object.defineProperty(window, 'scrollY', { value: 100 })
    fireEvent.scroll(window)
    expect(nav).toHaveClass('bg-brand-darker')
  })

  it('opens mobile menu when hamburger clicked', async () => {
    render(<Navbar />)
    const hamburger = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(hamburger)
    expect(await screen.findByText('GIỚI THIỆU')).toBeVisible()
  })
})
