import type { InvoiceRequest } from '@/types/invoice'

export interface OrderItem {
  menuItemId: string
  name: string
  priceNum: number
  price: string
  quantity: number
  note: string
}

export interface SubmittedOrder {
  id: string
  items: OrderItem[]
  submittedAt: string
}

export interface TableSession {
  tableId: string
  status: 'empty' | 'serving' | 'waiting_payment' | 'done'
  pendingItems: OrderItem[]
  submittedOrders: SubmittedOrder[]
  openedAt: string
  invoiceRequest?: InvoiceRequest
}
