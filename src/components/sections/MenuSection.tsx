import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { menuItems, categories, type CategoryId } from '@/data/menu'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

function MenuCard({ item, index }: { item: (typeof menuItems)[number]; index: number }) {
  return (
    <div
      className="group bg-white border border-gray-100 rounded-sm overflow-hidden hover:border-gold hover:shadow-md transition-all duration-300 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-brand-dark text-base mb-1">{item.name}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-3">{item.description}</p>
        <p className="text-gold font-semibold text-sm">{item.price}</p>
      </div>
    </div>
  )
}

export default function MenuSection() {
  const [active, setActive] = useState<CategoryId>('drinks')
  const { ref, isVisible } = useScrollAnimation()

  const filtered = menuItems.filter((item) => item.category === active)

  return (
    <section
      id="menu"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-24 bg-surface transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-gold text-xs tracking-[0.4em] mb-3">ĐẶC SẢN</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-dark tracking-wide">
            THỰC ĐƠN
          </h2>
          <div className="w-12 h-px bg-gold mx-auto mt-4" />
        </div>

        {/* Tabs */}
        <Tabs value={active} onValueChange={(v) => setActive(v as CategoryId)}>
          <TabsList className="flex flex-wrap justify-center gap-1 bg-transparent mb-10 h-auto">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="text-xs tracking-widest px-6 py-2 rounded-none border border-gold/30 data-[state=active]:bg-gold data-[state=active]:text-brand-dark data-[state=active]:border-gold text-brand-dark/60 hover:text-brand-dark transition-colors"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((item, index) => (
                  <MenuCard key={`${active}-${item.id}`} item={item} index={index} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
