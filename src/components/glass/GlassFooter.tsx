import { Share2, Camera } from 'lucide-react'

export default function GlassFooter() {
  return (
    <footer className="py-12 bg-black border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-display font-bold text-white tracking-[0.3em] text-sm">THE TERMINAL</p>
            <p className="text-white/30 text-[10px] tracking-widest mt-1">CAFE & EUROPEAN KITCHEN</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.12] transition-all">
              <Share2 size={14} />
            </a>
            <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.12] transition-all">
              <Camera size={14} />
            </a>
          </div>
          <p className="text-white/20 text-[10px] tracking-widest">© 2026 THE TERMINAL. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  )
}
