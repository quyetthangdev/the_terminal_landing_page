import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import GallerySection from '@/components/sections/GallerySection'

beforeEach(() => {
  const MockIntersectionObserver = vi.fn(function (this: IntersectionObserver) {
    this.observe = vi.fn()
    this.disconnect = vi.fn()
    this.unobserve = vi.fn()
  })
  global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
})

describe('GallerySection', () => {
  it('renders gallery images', () => {
    render(<GallerySection />)
    const imgs = screen.getAllByRole('img')
    expect(imgs.length).toBeGreaterThanOrEqual(6)
  })

  it('opens lightbox dialog when image clicked', async () => {
    render(<GallerySection />)
    const imgs = screen.getAllByRole('img')
    await userEvent.click(imgs[0])
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('closes lightbox when close button clicked', async () => {
    render(<GallerySection />)
    await userEvent.click(screen.getAllByRole('img')[0])
    await screen.findByRole('dialog')
    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('navigates to next image in lightbox', async () => {
    render(<GallerySection />)
    await userEvent.click(screen.getAllByRole('img')[0])
    await screen.findByRole('dialog')
    const nextBtn = screen.getByRole('button', { name: /next/i })
    await userEvent.click(nextBtn)
    // dialog still open after navigation
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
