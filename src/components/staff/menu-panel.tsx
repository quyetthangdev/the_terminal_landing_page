import { useState } from 'react'
import { menuItems, categories, type CategoryId } from '@/data/menu'
import type { OrderItem } from '@/hooks/useTableSessions'

interface Props {
  items: OrderItem[]
  onAdd: (item: Omit<OrderItem, 'quantity' | 'note'>) => void
}

function parsePrice(price: string): number {
  return parseInt(price.replace(/\D/g, ''), 10)
}

export default function MenuPanel({ items, onAdd }: Props) {
  const [active, setActive] = useState<CategoryId>('drinks')
  const filtered = menuItems.filter(m => m.category === active)

  function qtyOf(menuItemId: string) {
    return items.find(i => i.menuItemId === menuItemId)?.quantity ?? 0
  }

  return (
    <div className="flex flex-col h-full">
      {/* Category tabs */}
      <div className="flex border-b border-[#2a2a2a] bg-[#181818]">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id as CategoryId)}
            className={`flex-1 py-2.5 text-[10px] tracking-[0.15em] border-b-2 transition-colors ${
              active === cat.id
                ? 'text-gold border-gold bg-[#1c1c1c]'
                : 'text-[#555] border-transparent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Item grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 content-start">
        {filtered.map(item => {
          const qty = qtyOf(item.id)
          return (
            <div
              key={item.id}
              className="relative bg-[#1c1c1c] border border-[#2a2a2a] rounded p-3 hover:border-[#C9A84C55] hover:bg-[#1e1a0e] transition-colors"
            >
              {qty > 0 && (
                <span className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-gold text-brand-dark text-[10px] font-bold flex items-center justify-center">
                  {qty}
                </span>
              )}
              <p className="text-[12px] font-semibold text-[#e8e0d0] mb-1 leading-snug pr-5">{item.name}</p>
              <p className="text-[10px] text-[#555] leading-relaxed mb-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-gold font-semibold">{item.price}</span>
                <button
                  aria-label={`Thêm ${item.name}`}
                  onClick={() => onAdd({ menuItemId: item.id, name: item.name, priceNum: parsePrice(item.price), price: item.price })}
                  className="w-[22px] h-[22px] rounded bg-gold text-brand-dark text-base font-bold flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
