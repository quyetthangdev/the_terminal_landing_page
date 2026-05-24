import { Share2, Camera } from 'lucide-react'

export default function GlassFooter() {
  return (
    <footer className="py-12 bg-pearl border-t border-gold/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-display font-bold text-brand-dark tracking-[0.3em] text-sm">THE TERMINAL</p>
            <p className="text-brand-dark/55 text-[10px] tracking-widest mt-1">CAFE & EUROPEAN KITCHEN</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white/70 border border-gold/15 flex items-center justify-center text-brand-dark/40 hover:text-brand-dark/70 hover:bg-white/90 transition-all">
              <Share2 size={14} />
            </a>
            <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white/70 border border-gold/15 flex items-center justify-center text-brand-dark/40 hover:text-brand-dark/70 hover:bg-white/90 transition-all">
              <Camera size={14} />
            </a>
          </div>
          <p className="text-brand-dark/45 text-[10px] tracking-widest">© 2026 THE TERMINAL. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  )
}
