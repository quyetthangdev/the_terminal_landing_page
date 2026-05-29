import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import MenuItemForm from '@/components/admin/menu-item-form'
import AdminMenuPage from '@/pages/admin/admin-menu'
import type { Category } from '@/data/menu'

const cats: Category[] = [
  { id: 'appetizers', label: 'Khai Vị' },
  { id: 'desserts', label: 'Tráng Miệng' },
]

describe('MenuItemForm', () => {
  it('calls onSave with correct data on submit', () => {
    const onSave = vi.fn()
    render(<MenuItemForm categories={cats} onSave={onSave} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/tên món/i), { target: { value: 'Test Dish' } })
    fireEvent.change(screen.getByLabelText(/giá/i), { target: { value: '150.000đ' } })
    fireEvent.click(screen.getByRole('button', { name: /lưu/i }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test Dish',
      price: '150.000đ',
      category: 'appetizers',
    }))
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<MenuItemForm categories={cats} onSave={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /hủy/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('pre-fills fields when editing an existing item', () => {
    const item = { id: 'ap1', name: 'Existing', description: 'Desc', price: '200.000đ', image: '', category: 'desserts' }
    render(<MenuItemForm categories={cats} initial={item} onSave={vi.fn()} onCancel={vi.fn()} />)
    expect((screen.getByLabelText(/tên món/i) as HTMLInputElement).value).toBe('Existing')
    expect((screen.getByLabelText(/giá/i) as HTMLInputElement).value).toBe('200.000đ')
  })
})

const mockDeleteItem = vi.fn()
const mockAddItem = vi.fn()
const mockUpdateItem = vi.fn()

vi.mock('@/hooks/useMenuData', () => ({
  useMenuData: () => ({
    items: [
      { id: 'item1', name: 'Gỏi cuốn', description: 'Fresh rolls', price: '85.000đ', image: '', category: 'appetizers' },
    ],
    categories: [{ id: 'appetizers', label: 'Khai Vị' }],
    addItem: mockAddItem,
    updateItem: mockUpdateItem,
    deleteItem: mockDeleteItem,
  }),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn() } }))

describe('AdminMenuPage', () => {
  beforeEach(() => {
    mockDeleteItem.mockClear()
    mockAddItem.mockClear()
    mockUpdateItem.mockClear()
  })

  it('renders item in DataTable', () => {
    render(<MemoryRouter><AdminMenuPage /></MemoryRouter>)
    expect(screen.getByText('Gỏi cuốn')).toBeInTheDocument()
  })

  it('opens add modal when THÊM MÓN is clicked', () => {
    render(<MemoryRouter><AdminMenuPage /></MemoryRouter>)
    fireEvent.click(screen.getByText(/thêm món/i))
    expect(screen.getByText('Thêm món mới')).toBeInTheDocument()
  })

  it('row click opens MenuDetailDialog with correct item', () => {
    render(<MemoryRouter><AdminMenuPage /></MemoryRouter>)
    fireEvent.click(screen.getByText('Gỏi cuốn'))
    expect(screen.getByText('Fresh rolls')).toBeInTheDocument()
  })

  it('action Sửa món opens edit form', () => {
    render(<MemoryRouter><AdminMenuPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /hành động/i }))
    fireEvent.click(screen.getByText('Sửa món'))
    expect(screen.getByText('Sửa món')).toBeInTheDocument()
  })

  it('action Xóa món calls deleteItem after confirm', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<MemoryRouter><AdminMenuPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /hành động/i }))
    fireEvent.click(screen.getByText('Xóa món'))
    expect(mockDeleteItem).toHaveBeenCalledWith('item1')
    vi.restoreAllMocks()
  })
})
