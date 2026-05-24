import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

const images = [
  { id: 1, src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop', alt: 'Không gian quán' },
  { id: 2, src: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&auto=format&fit=crop', alt: 'Góc cà phê' },
  { id: 3, src: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop', alt: 'Cà phê đặc biệt' },
  { id: 4, src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop', alt: 'Ẩm thực Âu' },
  { id: 5, src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop', alt: 'Barista' },
  { id: 6, src: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800&auto=format&fit=crop', alt: 'Không gian industrial' },
]

export default function GlassGallerySection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { ref, isVisible } = useScrollAnimation()

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' })
  }

  return (
    <section
      id="glass-gallery"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-28 bg-pearl overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {/* Heading */}
      <div className="max-w-6xl mx-auto px-6 mb-12 flex items-end justify-between">
        <div>
          <p className="text-gold text-[10px] tracking-[0.5em] mb-3">TRẢI NGHIỆM</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-dark tracking-wide">KHÔNG GIAN</h2>
        </div>
        {/* Nav arrows */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full bg-white/85 backdrop-blur-md border border-gold/20 flex items-center justify-center text-brand-dark/70 hover:bg-white/90 hover:text-brand-dark transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full bg-white/85 backdrop-blur-md border border-gold/20 flex items-center justify-center text-brand-dark/70 hover:bg-white/90 hover:text-brand-dark transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Film strip */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pl-6 md:pl-[calc((100vw-72rem)/2+1.5rem)] pr-6 pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        {images.map((img, i) => (
          <div
            key={img.id}
            className={`flex-none group relative overflow-hidden rounded-sm ${
              i === 0 ? 'w-[480px] h-[320px]' : i % 3 === 0 ? 'w-[300px] h-[320px]' : 'w-[360px] h-[320px]'
            }`}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white/70 text-[10px] tracking-widest">{img.alt.toUpperCase()}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
