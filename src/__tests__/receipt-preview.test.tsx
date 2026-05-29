import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ReceiptPreview from '@/components/staff/receipt-preview'
import type { SubmittedOrder } from '@/types/session'

const ISSUED_AT = '2026-05-29T10:00:00.000Z'

const singleOrder: SubmittedOrder[] = [
  {
    id: 'o1',
    submittedAt: ISSUED_AT,
    items: [
      { menuItemId: 'd1', name: 'Terminal Espresso', priceNum: 45000, price: '45.000đ', quantity: 2, note: '' },
      { menuItemId: 'm1', name: 'Pasta Carbonara', priceNum: 145000, price: '145.000đ', quantity: 1, note: '' },
    ],
  },
]

describe('ReceiptPreview', () => {
  it('shows restaurant name', () => {
    render(<ReceiptPreview tableLabel="Bàn 01" issuedAt={ISSUED_AT} orders={singleOrder} isDraft={false} />)
    expect(screen.getByText('THE TERMINAL')).toBeInTheDocument()
  })

  it('shows "HOÁ ĐƠN" title for final receipt', () => {
    render(<ReceiptPreview tableLabel="Bàn 01" issuedAt={ISSUED_AT} orders={singleOrder} isDraft={false} />)
    expect(screen.getByText('HOÁ ĐƠN')).toBeInTheDocument()
  })

  it('shows "HOÁ ĐƠN TẠM" title for draft', () => {
    render(<ReceiptPreview tableLabel="Bàn 01" issuedAt={ISSUED_AT} orders={singleOrder} isDraft={true} />)
    expect(screen.getByText('HOÁ ĐƠN TẠM')).toBeInTheDocument()
  })

  it('shows draft watermark only when isDraft=true', () => {
    const { rerender } = render(
      <ReceiptPreview tableLabel="Bàn 01" issuedAt={ISSUED_AT} orders={singleOrder} isDraft={true} />
    )
    expect(screen.getByText(/PHIẾU TẠM/i)).toBeInTheDocument()

    rerender(<ReceiptPreview tableLabel="Bàn 01" issuedAt={ISSUED_AT} orders={singleOrder} isDraft={false} />)
    expect(screen.queryByText(/PHIẾU TẠM/i)).not.toBeInTheDocument()
  })

  it('shows table label', () => {
    render(<ReceiptPreview tableLabel="Bàn 05" issuedAt={ISSUED_AT} orders={singleOrder} isDraft={false} />)
    expect(screen.getByText('Bàn 05')).toBeInTheDocument()
  })

  it('shows correct total (2×45000 + 1×145000 = 235000đ)', () => {
    render(<ReceiptPreview tableLabel="Bàn 01" issuedAt={ISSUED_AT} orders={singleOrder} isDraft={false} />)
    expect(screen.getByText('235.000đ')).toBeInTheDocument()
  })

  it('merges same menuItemId across two orders', () => {
    const twoOrders: SubmittedOrder[] = [
      { id: 'o1', submittedAt: '', items: [{ menuItemId: 'd1', name: 'Espresso', priceNum: 45000, price: '45.000đ', quantity: 1, note: '' }] },
      { id: 'o2', submittedAt: '', items: [{ menuItemId: 'd1', name: 'Espresso', priceNum: 45000, price: '45.000đ', quantity: 2, note: '' }] },
    ]
    render(<ReceiptPreview tableLabel="Bàn 01" issuedAt={ISSUED_AT} orders={twoOrders} isDraft={false} />)
    // Only one row rendered for Espresso
    expect(screen.getAllByText('Espresso')).toHaveLength(1)
    // Total: 3 × 45000 = 135000đ (appears in both table and summary)
    expect(screen.getAllByText('135.000đ')).toHaveLength(2)
  })
})
