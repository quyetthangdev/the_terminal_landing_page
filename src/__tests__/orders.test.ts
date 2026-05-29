import { describe, it, expect } from 'vitest'
import { mergeOrderItems } from '@/lib/orders'
import type { SubmittedOrder } from '@/types/session'

describe('mergeOrderItems', () => {
  it('returns empty array for empty input', () => {
    expect(mergeOrderItems([])).toEqual([])
  })

  it('returns items from a single order', () => {
    const orders: SubmittedOrder[] = [{
      id: 'o1',
      submittedAt: '',
      items: [{ menuItemId: 'a', name: 'Item A', priceNum: 100, price: '100đ', quantity: 2, note: '' }],
    }]
    expect(mergeOrderItems(orders)).toEqual([
      { menuItemId: 'a', name: 'Item A', priceNum: 100, quantity: 2 },
    ])
  })

  it('merges duplicate menuItemId across multiple orders', () => {
    const orders: SubmittedOrder[] = [
      { id: 'o1', submittedAt: '', items: [{ menuItemId: 'a', name: 'A', priceNum: 100, price: '100đ', quantity: 1, note: '' }] },
      { id: 'o2', submittedAt: '', items: [{ menuItemId: 'a', name: 'A', priceNum: 100, price: '100đ', quantity: 2, note: '' }] },
    ]
    const result = mergeOrderItems(orders)
    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(3)
    expect(result[0].priceNum).toBe(100)
  })

  it('keeps distinct items with different menuItemIds', () => {
    const orders: SubmittedOrder[] = [{
      id: 'o1',
      submittedAt: '',
      items: [
        { menuItemId: 'a', name: 'A', priceNum: 100, price: '100đ', quantity: 1, note: '' },
        { menuItemId: 'b', name: 'B', priceNum: 200, price: '200đ', quantity: 1, note: '' },
      ],
    }]
    expect(mergeOrderItems(orders)).toHaveLength(2)
  })
})
