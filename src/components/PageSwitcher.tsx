import { Link } from 'react-router-dom'

interface Props { current: 'museum' | 'glass' }

export default function PageSwitcher({ current }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex gap-2">
      <Link
        to="/"
        className={`px-4 py-2 text-[10px] tracking-[0.2em] border transition-all duration-200 ${
          current === 'museum'
            ? 'bg-gold text-brand-dark border-gold'
            : 'bg-transparent text-gold/60 border-gold/30 hover:border-gold/60 hover:text-gold'
        }`}
      >
        MUSEUM
      </Link>
      <Link
        to="/glass"
        className={`px-4 py-2 text-[10px] tracking-[0.2em] border transition-all duration-200 ${
          current === 'glass'
            ? 'bg-white/20 text-white border-white/40 backdrop-blur-sm'
            : 'bg-transparent text-white/40 border-white/20 hover:border-white/40 hover:text-white/70'
        }`}
      >
        GLASS
      </Link>
    </div>
  )
}
