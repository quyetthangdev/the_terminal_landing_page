import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const links = [
  { label: 'GIỚI THIỆU', id: 'about' },
  { label: 'MENU', id: 'menu' },
  { label: 'ĐẶT BÀN', id: 'reservation' },
  { label: 'LIÊN HỆ', id: 'location' },
]

const navLinks = links.filter((l) => l.id !== 'reservation')

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      role="navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-brand-darker shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-display text-gold text-sm tracking-[0.3em] font-bold hover:opacity-80 transition-opacity"
        >
          THE TERMINAL
        </button>

        {/* Desktop links — omitted from DOM when mobile sheet is open to avoid duplicate text nodes */}
        {!open && (
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => { e.preventDefault(); scrollTo(l.id) }}
                className="text-xs tracking-widest text-white/70 hover:text-gold transition-colors"
              >
                {l.label}
              </a>
            ))}
            <Button
              onClick={() => scrollTo('reservation')}
              size="sm"
              className="bg-gold text-brand-dark hover:bg-gold/90 tracking-widest text-xs rounded-none px-6"
            >
              ĐẶT BÀN
            </Button>
          </div>
        )}

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle menu"
              className="md:hidden text-gold hover:text-gold hover:bg-gold/10"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-brand-darker border-gold/20 w-64">
            <SheetTitle className="sr-only">Điều hướng</SheetTitle>
            <div className="flex flex-col gap-6 mt-12">
              {navLinks.map((l) => (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  onClick={(e) => { e.preventDefault(); scrollTo(l.id); setOpen(false) }}
                  className="text-sm tracking-widest text-white/70 hover:text-gold transition-colors text-left"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#reservation"
                onClick={(e) => { e.preventDefault(); scrollTo('reservation'); setOpen(false) }}
                className="text-sm tracking-widest text-white/70 hover:text-gold transition-colors text-left"
              >
                ĐẶT BÀN
              </a>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
