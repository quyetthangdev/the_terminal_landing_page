import { useState } from 'react'
import { menuItems, categories, type CategoryId } from '@/data/menu'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import OrnamentalDivider from '@/components/ui/OrnamentalDivider'
import SectionNumber from '@/components/ui/SectionNumber'

function MenuListItem({ item }: { item: (typeof menuItems)[number] }) {
  return (
    <div className="group py-4 border-b border-gold/10 hover:border-gold/30 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="font-display font-bold text-brand-dark text-base group-hover:text-gold transition-colors">
            {item.name}
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed mt-1">{item.description}</p>
        </div>
        <p className="text-gold font-semibold text-sm whitespace-nowrap shrink-0 pt-0.5">{item.price}</p>
      </div>
    </div>
  )
}

export default function MenuSection() {
  const [active, setActive] = useState<CategoryId>('appetizers')
  const { ref, isVisible } = useScrollAnimation()
  const filtered = menuItems.filter((item) => item.category === active)

  return (
    <section
      id="menu"
      ref={ref as React.RefObject<HTMLElement>}
      className={`relative py-24 bg-surface grain transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <SectionNumber n="II" />
      <div className="max-w-5xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-gold text-[10px] tracking-[0.5em] mb-3">ĐẶC SẢN</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-dark tracking-wide mb-6">
            THỰC ĐƠN
          </h2>
          <OrnamentalDivider className="max-w-xs mx-auto" />
        </div>

        {/* Category selector — text links, not tabs */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id as CategoryId)}
              aria-label={cat.label}
              className={`text-xs tracking-[0.3em] uppercase pb-1 border-b transition-all duration-200 ${
                active === cat.id
                  ? 'text-gold border-gold'
                  : 'text-gray-400 border-transparent hover:text-brand-dark hover:border-gold/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 2-column typographic list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          {filtered.map((item) => (
            <MenuListItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
