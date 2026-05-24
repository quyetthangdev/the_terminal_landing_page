import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
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

export default function GallerySection() {
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)
  const { ref, isVisible } = useScrollAnimation()

  function openAt(i: number) { setIdx(i); setOpen(true) }
  function prev() { setIdx((i) => (i - 1 + images.length) % images.length) }
  function next() { setIdx((i) => (i + 1) % images.length) }

  return (
    <section
      id="gallery"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-24 bg-white transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-gold text-xs tracking-[0.4em] mb-3">TRẢI NGHIỆM</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-dark tracking-wide">
            KHÔNG GIAN
          </h2>
          <div className="w-12 h-px bg-gold mx-auto mt-4" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-[160px] md:auto-rows-[200px]">
          {images.map((img, i) => (
            <div
              key={img.id}
              onClick={() => openAt(i)}
              className={`group cursor-pointer overflow-hidden rounded-sm ${i === 0 ? 'row-span-2' : ''}`}
            >
              <div className="relative w-full h-full">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/15 transition-colors duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl bg-brand-darker border-gold/20 p-0 overflow-hidden">
          <DialogTitle className="sr-only">{images[idx].alt}</DialogTitle>
          <div className="relative">
            <img
              src={images[idx].src}
              alt={images[idx].alt}
              className="w-full max-h-[80vh] object-contain"
            />
            {/* Prev */}
            <button
              onClick={prev}
              aria-label="previous"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            {/* Next */}
            <button
              onClick={next}
              aria-label="next"
              className="absolute right-14 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs tracking-widest">
              {idx + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
