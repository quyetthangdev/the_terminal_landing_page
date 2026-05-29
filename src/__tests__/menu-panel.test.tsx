import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import MenuPanel from '@/components/staff/menu-panel'
import { menuItems, categories } from '@/data/menu'
import type { OrderItem } from '@/hooks/useTableSessions'

const defaultProps = {
  pendingItems: [] as OrderItem[],
  onAdd: vi.fn(),
}

describe('MenuPanel', () => {
  it('renders all category buttons', () => {
    render(<MenuPanel {...defaultProps} />)
    for (const cat of categories) {
      expect(screen.getByText(cat.label)).toBeInTheDocument()
    }
  })

  it('shows items for the default active category', () => {
    render(<MenuPanel {...defaultProps} />)
    const firstCat = categories[0]
    const firstItem = menuItems.find(m => m.category === firstCat.id)!
    expect(screen.getAllByText(firstItem.name).length).toBeGreaterThan(0)
  })

  it('calls onAdd with correct item data when "+" clicked', async () => {
    const onAdd = vi.fn()
    render(<MenuPanel {...defaultProps} onAdd={onAdd} />)
    const firstCat = categories[0]
    const firstItem = menuItems.find(m => m.category === firstCat.id)!
    const addBtns = screen.getAllByRole('button', { name: `Thêm ${firstItem.name}` })
    await userEvent.click(addBtns[0])
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ menuItemId: firstItem.id, name: firstItem.name })
    )
  })

  it('shows quantity badge when item is in pendingItems', () => {
    const firstCat = categories[0]
    const firstItem = menuItems.find(m => m.category === firstCat.id)!
    const pendingItems: OrderItem[] = [
      { menuItemId: firstItem.id, name: firstItem.name, priceNum: 0, price: '', quantity: 3, note: '' },
    ]
    render(<MenuPanel pendingItems={pendingItems} onAdd={vi.fn()} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('switches to second category on tab click and shows its items', async () => {
    render(<MenuPanel {...defaultProps} />)
    const secondCat = categories[1]
    await userEvent.click(screen.getByText(secondCat.label))
    const firstItemInSecondCat = menuItems.find(m => m.category === secondCat.id)!
    expect(screen.getAllByText(firstItemInSecondCat.name).length).toBeGreaterThan(0)
  })
})
