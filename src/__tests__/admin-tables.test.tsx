import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TableForm from '@/components/admin/table-form'

describe('TableForm', () => {
  it('calls onSave with correct data', () => {
    const onSave = vi.fn()
    render(<TableForm onSave={onSave} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/tên bàn/i), { target: { value: 'Bàn VIP' } })
    fireEvent.change(screen.getByLabelText(/số chỗ/i), { target: { value: '8' } })
    fireEvent.click(screen.getByRole('button', { name: /lưu/i }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ label: 'Bàn VIP', seats: 8 }))
  })

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = vi.fn()
    render(<TableForm onSave={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /hủy/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('pre-fills fields when editing an existing table', () => {
    const table = { id: '01', label: 'Bàn 01', seats: 4, gridCol: 1, gridRow: 1 }
    render(<TableForm initial={table} onSave={vi.fn()} onCancel={vi.fn()} />)
    expect((screen.getByLabelText(/tên bàn/i) as HTMLInputElement).value).toBe('Bàn 01')
    expect((screen.getByLabelText(/số chỗ/i) as HTMLInputElement).value).toBe('4')
  })
})

import { MemoryRouter } from 'react-router-dom'
import AdminTablesPage from '@/pages/admin/admin-tables'

const mockDeleteTable = vi.fn()
const mockAddTable = vi.fn()
const mockUpdateTable = vi.fn()

vi.mock('@/hooks/useTableData', () => ({
  useTableData: () => ({
    tables: [{ id: 't1', label: 'Bàn 01', seats: 4, gridCol: 1, gridRow: 1 }],
    addTable: mockAddTable,
    updateTable: mockUpdateTable,
    deleteTable: mockDeleteTable,
  }),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn() } }))

describe('AdminTablesPage', () => {
  it('renders table list', () => {
    render(<MemoryRouter><AdminTablesPage /></MemoryRouter>)
    expect(screen.getByText('Bàn 01')).toBeInTheDocument()
    expect(screen.getByText(/4 chỗ/)).toBeInTheDocument()
  })

  it('opens add modal when THÊM BÀN is clicked', () => {
    render(<MemoryRouter><AdminTablesPage /></MemoryRouter>)
    fireEvent.click(screen.getByText(/thêm bàn/i))
    expect(screen.getByText('Thêm bàn mới')).toBeInTheDocument()
  })

  it('calls deleteTable with confirm', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<MemoryRouter><AdminTablesPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /xóa/i }))
    expect(mockDeleteTable).toHaveBeenCalledWith('t1')
    vi.restoreAllMocks()
  })
})
