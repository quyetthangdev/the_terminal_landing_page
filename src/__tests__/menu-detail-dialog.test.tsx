import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MenuDetailDialog from '@/components/admin/menu-detail-dialog'
import type { MenuItem, Category } from '@/data/menu'

const cats: Category[] = [{ id: 'appetizers', label: 'Khai Vị' }]

const item: MenuItem = {
  id: 'i1',
  name: 'Gỏi cuốn',
  description: 'Fresh spring rolls',
  price: '85.000đ',
  image: 'https://example.com/img.jpg',
  category: 'appetizers',
}

function renderDialog(overrides: Partial<{
  item: MenuItem | null
  categories: Category[]
  open: boolean
  onClose: () => void
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
}> = {}) {
  const props = {
    item,
    categories: cats,
    open: true,
    onClose: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  }
  return render(<MenuDetailDialog {...props} />)
}

describe('MenuDetailDialog', () => {
  it('renders name, price, category label, description', () => {
    renderDialog()
    expect(screen.getByText('Gỏi cuốn')).toBeInTheDocument()
    expect(screen.getByText('85.000đ')).toBeInTheDocument()
    expect(screen.getByText('Khai Vị')).toBeInTheDocument()
    expect(screen.getByText('Fresh spring rolls')).toBeInTheDocument()
  })

  it('renders image when present', () => {
    renderDialog()
    const img = screen.getByRole('img', { name: 'Gỏi cuốn' })
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg')
  })

  it('renders fallback when image is empty string', () => {
    renderDialog({ item: { ...item, image: '' } })
    expect(screen.getByText(/không có ảnh/i)).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('SỬA button calls onEdit with item', () => {
    const onEdit = vi.fn()
    renderDialog({ onEdit })
    fireEvent.click(screen.getByRole('button', { name: /sửa/i }))
    expect(onEdit).toHaveBeenCalledWith(item)
  })

  it('XÓA button calls window.confirm then onDelete if confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const onDelete = vi.fn()
    renderDialog({ onDelete })
    fireEvent.click(screen.getByRole('button', { name: /xóa/i }))
    expect(window.confirm).toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalledWith(item)
    vi.restoreAllMocks()
  })

  it('XÓA button does NOT call onDelete if confirm cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const onDelete = vi.fn()
    renderDialog({ onDelete })
    fireEvent.click(screen.getByRole('button', { name: /xóa/i }))
    expect(onDelete).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })
})
