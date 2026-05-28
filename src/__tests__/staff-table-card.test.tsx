import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import TableCard from '@/components/staff/table-card'
import type { Table } from '@/data/tables'
import type { TableSession } from '@/hooks/useTableSessions'

const table: Table = { id: '01', label: 'Bàn 01', seats: 4, gridCol: 1, gridRow: 1 }

describe('TableCard', () => {
  it('renders table label', () => {
    render(<TableCard table={table} session={undefined} onClick={vi.fn()} />)
    expect(screen.getByText('Bàn 01')).toBeInTheDocument()
  })

  it('shows "Trống" and seats when no session', () => {
    render(<TableCard table={table} session={undefined} onClick={vi.fn()} />)
    expect(screen.getByText('Trống')).toBeInTheDocument()
    expect(screen.getByText('4 chỗ')).toBeInTheDocument()
  })

  it('shows "Đang phục vụ" for serving session', () => {
    const session: TableSession = {
      tableId: '01', status: 'serving', items: [
        { menuItemId: 'd1', name: 'Espresso', priceNum: 45000, price: '45.000đ', quantity: 2, note: '' }
      ], openedAt: '',
    }
    render(<TableCard table={table} session={session} onClick={vi.fn()} />)
    expect(screen.getByText('Đang phục vụ')).toBeInTheDocument()
    expect(screen.getByText('1 món · 90.000đ')).toBeInTheDocument()
  })

  it('shows "Chờ thanh toán" for waiting_payment session', () => {
    const session: TableSession = {
      tableId: '01', status: 'waiting_payment', items: [], openedAt: '',
    }
    render(<TableCard table={table} session={session} onClick={vi.fn()} />)
    expect(screen.getByText('Chờ thanh toán')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<TableCard table={table} session={undefined} onClick={onClick} />)
    await userEvent.click(screen.getByText('Bàn 01'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
