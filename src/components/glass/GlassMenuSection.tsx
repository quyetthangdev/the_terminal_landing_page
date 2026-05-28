import { useState } from 'react'
import { menuItems, categories, type CategoryId } from '@/data/menu'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

function GlassMenuCard({ item, index }: { item: (typeof menuItems)[number]; index: number }) {
  return (
    <div
      className="group bg-white/85 backdrop-blur-md border border-gold/20 rounded-sm overflow-hidden hover:border-gold/40 hover:shadow-md transition-all duration-300 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-brand-dark text-base mb-1">{item.name}</h3>
        <p className="text-gray-600 text-xs leading-relaxed mb-3">{item.description}</p>
        <p className="text-gold font-semibold text-sm">{item.price}</p>
      </div>
    </div>
  )
}

export default function GlassMenuSection() {
  const [active, setActive] = useState<CategoryId>('appetizers')
  const { ref, isVisible } = useScrollAnimation()
  const filtered = menuItems.filter((item) => item.category === active)

  return (
    <section
      id="glass-menu"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-28 bg-warm-white transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-gold text-[10px] tracking-[0.5em] mb-3">ĐẶC SẢN</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-dark tracking-wide mb-6">THỰC ĐƠN</h2>
          <div className="w-12 h-px bg-gold/60 mx-auto" />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id as CategoryId)}
              className={`px-5 py-2 text-[10px] tracking-[0.25em] rounded-full border transition-all duration-200 ${
                active === cat.id
                  ? 'bg-gold/20 border-gold/50 text-gold backdrop-blur-sm'
                  : 'bg-white/60 border-gold/15 text-brand-dark/60 hover:text-brand-dark/70 hover:border-gold/30'
              }`}
            >
              {cat.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, index) => (
            <GlassMenuCard key={`${active}-${item.id}`} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
