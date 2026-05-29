import type { SubmittedOrder } from '@/types/session'

export interface MergedItem {
  menuItemId: string
  name: string
  priceNum: number
  quantity: number
}

export function mergeOrderItems(orders: SubmittedOrder[]): MergedItem[] {
  const merged: Record<string, MergedItem> = {}
  for (const order of orders) {
    for (const item of order.items) {
      if (merged[item.menuItemId]) {
        merged[item.menuItemId].quantity += item.quantity
      } else {
        merged[item.menuItemId] = {
          menuItemId: item.menuItemId,
          name: item.name,
          priceNum: item.priceNum,
          quantity: item.quantity,
        }
      }
    }
  }
  return Object.values(merged)
}
