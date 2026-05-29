import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DataTable } from '@/components/ui/data-table'

interface Row { id: string; name: string; value: number }

const rows: Row[] = [
  { id: '1', name: 'Alpha', value: 10 },
  { id: '2', name: 'Beta', value: 20 },
  { id: '3', name: 'Gamma', value: 30 },
]

const columns = [
  { key: 'name', header: 'Name', render: (r: Row) => r.name },
  { key: 'value', header: 'Value', render: (r: Row) => String(r.value) },
]

describe('DataTable', () => {
  it('renders all rows', () => {
    render(<DataTable data={rows} columns={columns} getRowKey={r => r.id} />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('Gamma')).toBeInTheDocument()
  })

  it('filters rows by search', () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={r => r.id}
        searchFn={(r, q) => r.name.toLowerCase().includes(q.toLowerCase())}
      />
    )
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'alp' } })
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
  })

  it('filters rows by filter dropdown', () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={r => r.id}
        filter={{
          placeholder: 'All',
          options: [{ label: 'High', value: 'high' }],
          fn: (r, v) => v === 'high' ? r.value > 15 : true,
        }}
      />
    )
    fireEvent.change(screen.getByRole('combobox', { name: /lọc/i }), { target: { value: 'high' } })
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('Gamma')).toBeInTheDocument()
  })

  it('sorts rows', () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={r => r.id}
        sorts={[
          { label: 'Name Z→A', fn: (a, b) => b.name.localeCompare(a.name) },
        ]}
      />
    )
    fireEvent.change(screen.getByRole('combobox', { name: /sắp xếp/i }), { target: { value: '0' } })
    const cells = screen.getAllByRole('cell')
    expect(cells[0].textContent).toBe('Gamma')
  })

  it('paginates: page 1 shows pageSize rows', () => {
    const manyRows: Row[] = Array.from({ length: 15 }, (_, i) => ({
      id: String(i), name: `Row${i}`, value: i,
    }))
    render(<DataTable data={manyRows} columns={columns} getRowKey={r => r.id} pageSize={5} />)
    expect(screen.getByText('Row0')).toBeInTheDocument()
    expect(screen.queryByText('Row5')).not.toBeInTheDocument()
  })

  it('paginates: next page shows remainder', () => {
    const manyRows: Row[] = Array.from({ length: 7 }, (_, i) => ({
      id: String(i), name: `Row${i}`, value: (i + 1) * 100,
    }))
    render(<DataTable data={manyRows} columns={columns} getRowKey={r => r.id} pageSize={5} />)
    fireEvent.click(screen.getByText('2'))
    expect(screen.getByText('Row5')).toBeInTheDocument()
    expect(screen.getByText('Row6')).toBeInTheDocument()
  })

  it('calls onRowClick with correct row when row clicked', () => {
    const onRowClick = vi.fn()
    render(
      <DataTable data={rows} columns={columns} getRowKey={r => r.id} onRowClick={onRowClick} />
    )
    fireEvent.click(screen.getByText('Alpha'))
    expect(onRowClick).toHaveBeenCalledWith(rows[0])
  })

  it('does not call onRowClick when action button clicked', () => {
    const onRowClick = vi.fn()
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={r => r.id}
        onRowClick={onRowClick}
        actions={r => [{ label: `Edit ${r.name}`, onClick: vi.fn() }]}
      />
    )
    const actionBtns = screen.getAllByRole('button', { name: /hành động/i })
    fireEvent.click(actionBtns[0])
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('renders action dropdown with destructive item in red', () => {
    render(
      <DataTable
        data={[rows[0]]}
        columns={columns}
        getRowKey={r => r.id}
        actions={() => [
          { label: 'Edit', onClick: vi.fn() },
          { label: 'Delete', onClick: vi.fn(), destructive: true },
        ]}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /hành động/i }))
    expect(screen.getByText('Edit')).toBeInTheDocument()
    const deleteBtn = screen.getByText('Delete')
    expect(deleteBtn).toHaveClass('text-red-400')
  })

  it('shows empty state when no rows match', () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={r => r.id}
        searchFn={(r, q) => r.name.toLowerCase().includes(q.toLowerCase())}
      />
    )
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ZZZZZ' } })
    expect(screen.getByText('Không tìm thấy kết quả')).toBeInTheDocument()
  })
})
