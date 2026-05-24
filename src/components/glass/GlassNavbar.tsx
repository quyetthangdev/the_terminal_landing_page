import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

const navLinks = [
  { label: 'Câu Chuyện', href: '#glass-about' },
  { label: 'Thực Đơn', href: '#glass-menu' },
  { label: 'Đặt Bàn', href: '#glass-reservation' },
  { label: 'Không Gian', href: '#glass-gallery' },
]

function scrollTo(id: string) {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function GlassNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
      scrolled
        ? 'bg-warm-white/90 backdrop-blur-xl border-gold/20 shadow-sm shadow-gold/[0.05]'
        : 'bg-white/30 backdrop-blur-md border-white/10'
    }`}>
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <a href="#" className="font-display font-bold text-brand-dark text-sm tracking-[0.2em]">
          THE TERMINAL
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              className="text-brand-dark/70 hover:text-brand-dark text-xs tracking-[0.2em] transition-colors duration-200"
            >
              {link.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => scrollTo('#glass-reservation')}
          className="hidden md:flex items-center gap-2 px-5 py-2 bg-gold/90 hover:bg-gold border border-gold text-brand-dark text-xs tracking-[0.15em] transition-all duration-200"
        >
          ĐẶT BÀN
        </button>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden text-brand-dark/70 hover:text-brand-dark">
              <Menu size={20} />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-warm-white/95 backdrop-blur-2xl border-gold/10 text-brand-dark w-72">
            <SheetTitle className="sr-only">Điều hướng</SheetTitle>
            <div className="flex flex-col gap-6 mt-12 px-2">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => { scrollTo(link.href); setOpen(false) }}
                  className="text-brand-dark/70 hover:text-brand-dark text-sm tracking-[0.25em] text-left transition-colors"
                >
                  {link.label.toUpperCase()}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>

  )
}
