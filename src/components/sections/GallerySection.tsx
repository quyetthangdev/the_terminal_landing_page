import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import OrnamentalDivider from '@/components/ui/OrnamentalDivider'
import SectionNumber from '@/components/ui/SectionNumber'

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
      className={`relative py-24 bg-white transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <SectionNumber n="III" />
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-gold text-xs tracking-[0.4em] mb-3">TRẢI NGHIỆM</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-dark tracking-wide">
            KHÔNG GIAN
          </h2>
          <OrnamentalDivider className="max-w-xs mx-auto mt-4" />
        </div>

        {/* Asymmetric masonry grid */}
        <div className="grid grid-cols-3 grid-rows-3 gap-2 md:gap-3" style={{ gridTemplateRows: 'repeat(3, 200px)' }}>
          {/* Large feature image — spans 2 cols, 2 rows */}
          <button onClick={() => openAt(0)} aria-label={`Xem ảnh: ${images[0].alt}`}
            className="col-span-2 row-span-2 group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <img src={images[0].src} alt={images[0].alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white/80 text-[10px] tracking-widest">{images[0].alt.toUpperCase()}</p>
              <div className="w-6 h-px bg-gold mt-1" />
            </div>
          </button>
          {/* Right column — image 1 (1 col, 1 row) */}
          <button onClick={() => openAt(1)} aria-label={`Xem ảnh: ${images[1].alt}`}
            className="col-span-1 row-span-1 group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <img src={images[1].src} alt={images[1].alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          {/* Right column — image 2 (1 col, 1 row) */}
          <button onClick={() => openAt(2)} aria-label={`Xem ảnh: ${images[2].alt}`}
            className="col-span-1 row-span-1 group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <img src={images[2].src} alt={images[2].alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          {/* Bottom row — images 3, 4, 5 — each 1 col, 1 row */}
          {[3, 4, 5].map((i) => (
            <button key={images[i].id} onClick={() => openAt(i)} aria-label={`Xem ảnh: ${images[i].alt}`}
              className="col-span-1 row-span-1 group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gold">
              <img src={images[i].src} alt={images[i].alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
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
