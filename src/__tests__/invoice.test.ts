import { describe, it, expect, beforeEach } from 'vitest'
import { numberToWords, generateInvoiceNumber, buildInvoice } from '@/lib/invoice'
import type { InvoiceRequest } from '@/types/invoice'
import type { TableSession } from '@/hooks/useTableSessions'

beforeEach(() => localStorage.clear())

const mockRequest: InvoiceRequest = {
  buyerName: 'Công ty TNHH ABC',
  buyerTaxCode: '0987654321',
  buyerAddress: '456 Nguyễn Huệ, Q1, TP.HCM',
  buyerEmail: 'ke-toan@abc.com',
  paymentMethod: 'cash',
}

const mockSession: TableSession = {
  tableId: '01',
  status: 'waiting_payment',
  pendingItems: [],
  submittedOrders: [
    {
      id: 'o1',
      submittedAt: '2026-05-28T10:00:00.000Z',
      items: [
        { menuItemId: 'ap1', name: 'Foie Gras Terrine', priceNum: 245000, price: '245.000đ', quantity: 2, note: '' },
        { menuItemId: 'cf1', name: 'Terminal Espresso', priceNum: 55000, price: '55.000đ', quantity: 1, note: '' },
      ],
    },
  ],
  openedAt: '2026-05-28T09:00:00.000Z',
}

describe('numberToWords', () => {
  it('converts 0', () => {
    expect(numberToWords(0)).toBe('Không đồng')
  })
  it('converts 45000', () => {
    expect(numberToWords(45000)).toBe('Bốn mươi lăm nghìn đồng')
  })
  it('converts 545000', () => {
    expect(numberToWords(545000)).toBe('Năm trăm bốn mươi lăm nghìn đồng')
  })
  it('converts 1000000', () => {
    expect(numberToWords(1000000)).toBe('Một triệu đồng')
  })
  it('converts 1234000', () => {
    expect(numberToWords(1234000)).toBe('Một triệu hai trăm ba mươi bốn nghìn đồng')
  })
  it('handles 11000 (mười một nghìn)', () => {
    expect(numberToWords(11000)).toBe('Mười một nghìn đồng')
  })
  it('handles 100000 (một trăm nghìn)', () => {
    expect(numberToWords(100000)).toBe('Một trăm nghìn đồng')
  })
})

describe('generateInvoiceNumber', () => {
  it('returns 7-digit padded string starting from 0000001', () => {
    expect(generateInvoiceNumber()).toBe('0000001')
  })
  it('increments on each call', () => {
    generateInvoiceNumber()
    expect(generateInvoiceNumber()).toBe('0000002')
  })
})

describe('buildInvoice', () => {
  it('merges items from all submitted orders', () => {
    const inv = buildInvoice(mockSession, mockRequest)
    expect(inv.items).toHaveLength(2)
  })

  it('calculates total as sum of all submitted order items', () => {
    // 2 × 245000 + 1 × 55000 = 545000
    const inv = buildInvoice(mockSession, mockRequest)
    expect(inv.total).toBe(545000)
  })

  it('derives subtotal as total / 1.1 (rounded)', () => {
    const inv = buildInvoice(mockSession, mockRequest)
    expect(inv.subtotal).toBe(Math.round(545000 / 1.1))
  })

  it('vatAmount = total - subtotal', () => {
    const inv = buildInvoice(mockSession, mockRequest)
    expect(inv.vatAmount).toBe(inv.total - inv.subtotal)
  })

  it('assigns correct invoice number and symbol', () => {
    const inv = buildInvoice(mockSession, mockRequest)
    expect(inv.number).toBe('0000001')
    expect(inv.symbol).toBe('AA/25E')
  })

  it('merges duplicate menuItemIds across orders', () => {
    const sessionWithDupe: TableSession = {
      ...mockSession,
      submittedOrders: [
        { id: 'o1', submittedAt: '', items: [
          { menuItemId: 'ap1', name: 'Foie Gras', priceNum: 245000, price: '245.000đ', quantity: 1, note: '' },
        ]},
        { id: 'o2', submittedAt: '', items: [
          { menuItemId: 'ap1', name: 'Foie Gras', priceNum: 245000, price: '245.000đ', quantity: 2, note: '' },
        ]},
      ],
    }
    const inv = buildInvoice(sessionWithDupe, mockRequest)
    expect(inv.items).toHaveLength(1)
    expect(inv.items[0].quantity).toBe(3)
  })
})
