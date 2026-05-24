import { Share2, Camera } from 'lucide-react'

const navLinks = [
  { label: 'Giới thiệu', id: 'about' },
  { label: 'Menu', id: 'menu' },
  { label: 'Đặt bàn', id: 'reservation' },
  { label: 'Gallery', id: 'gallery' },
  { label: 'Liên hệ', id: 'location' },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Footer() {
  return (
    <footer className="bg-brand-darker border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand */}
        <div>
          <p className="font-display text-gold text-lg tracking-[0.3em] font-bold mb-2">
            THE TERMINAL
          </p>
          <p className="text-white/40 text-xs tracking-widest mb-6">
            CAFE & EUROPEAN KITCHEN
          </p>
          <p className="text-white/30 text-sm leading-relaxed">
            Điểm dừng chân sang trọng giữa lòng thành phố, nơi hương cà phê gặp gỡ ẩm thực Âu tinh tế.
          </p>
        </div>

        {/* Nav */}
        <div>
          <p className="text-gold text-xs tracking-widest mb-6">ĐIỀU HƯỚNG</p>
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="text-white/50 hover:text-gold text-sm transition-colors text-left"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Social + Contact */}
        <div>
          <p className="text-gold text-xs tracking-widest mb-6">KẾT NỐI</p>
          <div className="flex gap-3 mb-6">
            <a
              href="#"
              className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
              aria-label="Facebook"
            >
              <Share2 size={15} />
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
              aria-label="Instagram"
            >
              <Camera size={15} />
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors text-xs font-bold"
              aria-label="TikTok"
            >
              TT
            </a>
          </div>
          <p className="text-white/40 text-sm">hello@theterminal.vn</p>
          <p className="text-white/40 text-sm mt-1">0900 123 456</p>
        </div>
      </div>

      <div className="border-t border-gold/10 py-4 text-center">
        <p className="text-white/25 text-xs tracking-widest">
          © 2026 THE TERMINAL. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  )
}
