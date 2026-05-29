import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PinGate from '@/components/admin/pin-gate'

describe('PinGate', () => {
  it('calls onSuccess when correct PIN is entered', () => {
    const onSuccess = vi.fn()
    render(<PinGate correctPin="1234" onSuccess={onSuccess} />)
    fireEvent.change(screen.getByPlaceholderText('Nhập PIN'), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /vào trang quản lý/i }))
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('does not call onSuccess with wrong PIN and shows error', () => {
    const onSuccess = vi.fn()
    render(<PinGate correctPin="1234" onSuccess={onSuccess} />)
    fireEvent.change(screen.getByPlaceholderText('Nhập PIN'), { target: { value: '9999' } })
    fireEvent.click(screen.getByRole('button', { name: /vào trang quản lý/i }))
    expect(onSuccess).not.toHaveBeenCalled()
    expect(screen.getByText('PIN không đúng')).toBeInTheDocument()
  })

  it('clears input after wrong PIN', () => {
    render(<PinGate correctPin="1234" onSuccess={vi.fn()} />)
    const input = screen.getByPlaceholderText('Nhập PIN') as HTMLInputElement
    fireEvent.change(input, { target: { value: '9999' } })
    fireEvent.click(screen.getByRole('button', { name: /vào trang quản lý/i }))
    expect(input.value).toBe('')
  })
})
