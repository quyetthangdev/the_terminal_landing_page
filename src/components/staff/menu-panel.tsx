import { useState } from 'react'
import { menuItems, categories, type CategoryId } from '@/data/menu'
import type { OrderItem } from '@/types/session'

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
      <div className="w-20 sm:w-28 flex-shrink-0 flex flex-col border-r border-[#2a2a2a] bg-[#111] overflow-y-auto">
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

      {/* Right: item grid — 2 cols on mobile (square cards), 2 cols on sm+ (wide cards) */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 grid grid-cols-2 gap-2 sm:gap-2.5 content-start">
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

              {/* Mobile layout: square card — image top, info bottom */}
              <div className="sm:hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
                <div className="p-1.5">
                  <p className="text-[10px] font-semibold text-[#e8e0d0] leading-snug mb-1.5 pr-4 line-clamp-2">{item.name}</p>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] text-gold font-semibold leading-none">{item.price}</span>
                    <button
                      aria-label={`Thêm ${item.name}`}
                      onClick={() => onAdd({ menuItemId: item.id, name: item.name, priceNum: parsePrice(item.price), price: item.price })}
                      className="w-6 h-6 flex-shrink-0 rounded bg-gold text-brand-dark text-sm font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* sm+ layout: horizontal card — image left, info right */}
              <div className="hidden sm:block p-2.5">
                <div className="flex gap-2 mb-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-[#e8e0d0] leading-snug mb-0.5 pr-4">{item.name}</p>
                    <p className="text-[9px] text-[#555] leading-relaxed line-clamp-3">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gold font-semibold">{item.price}</span>
                  <button
                    aria-label={`Thêm ${item.name}`}
                    onClick={() => onAdd({ menuItemId: item.id, name: item.name, priceNum: parsePrice(item.price), price: item.price })}
                    className="w-6 h-6 rounded bg-gold text-brand-dark text-sm font-bold flex items-center justify-center"
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
