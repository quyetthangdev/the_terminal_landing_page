import { useState } from 'react'
import { menuItems, categories, type CategoryId } from '@/data/menu'
import type { OrderItem } from '@/hooks/useTableSessions'

interface Props {
  pendingItems: OrderItem[]
  onAdd: (item: Omit<OrderItem, 'quantity' | 'note'>) => void
}

function parsePrice(price: string): number {
  return parseInt(price.replace(/\D/g, ''), 10)
}

export default function MenuPanel({ pendingItems, onAdd }: Props) {
  const [active, setActive] = useState<CategoryId>('appetizers')
  const filtered = menuItems.filter(m => m.category === active)

  function qtyOf(menuItemId: string) {
    return pendingItems.find(i => i.menuItemId === menuItemId)?.quantity ?? 0
  }

  return (
    <div className="flex h-full">
      {/* Left: vertical category sidebar */}
      <div className="w-28 flex-shrink-0 flex flex-col border-r border-[#2a2a2a] bg-[#111] overflow-y-auto">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id as CategoryId)}
            className={`px-2 py-3 text-[10px] tracking-[0.1em] text-left leading-tight border-l-2 transition-colors ${
              active === cat.id
                ? 'text-gold border-gold bg-[#1c1a10]'
                : 'text-[#555] border-transparent hover:text-[#888] hover:bg-[#181818]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Right: item grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 content-start">
        {filtered.map(item => {
          const qty = qtyOf(item.id)
          return (
            <div
              key={item.id}
              className="relative bg-[#1c1c1c] border border-[#2a2a2a] rounded overflow-hidden hover:border-[#C9A84C55] hover:bg-[#1e1a0e] transition-colors"
            >
              {qty > 0 && (
                <span className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-gold text-brand-dark text-[10px] font-bold flex items-center justify-center">
                  {qty}
                </span>
              )}
              {/* Item image */}
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-20 object-cover"
                loading="lazy"
              />
              <div className="p-2.5">
                <p className="text-[11px] font-semibold text-[#e8e0d0] mb-0.5 leading-snug pr-4">{item.name}</p>
                <p className="text-[9px] text-[#555] leading-relaxed mb-2 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gold font-semibold">{item.price}</span>
                  <button
                    aria-label={`Thêm ${item.name}`}
                    onClick={() => onAdd({ menuItemId: item.id, name: item.name, priceNum: parsePrice(item.price), price: item.price })}
                    className="w-[20px] h-[20px] rounded bg-gold text-brand-dark text-sm font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
