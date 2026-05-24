function scrollTo(id: string) {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
}

const stats = [
  { label: 'Thành lập', value: '2026' },
  { label: 'Không gian', value: '1 Tầng' },
  { label: 'Chỗ ngồi', value: '120+' },
  { label: 'Thực đơn', value: '50+ Món' },
]

export default function GlassHeroSection() {
  return (
    <section id="glass-hero" className="h-screen flex flex-col overflow-hidden">

      {/* ── TOP ZONE: photo + title ── */}
      <div className="relative flex-1 overflow-hidden">
        {/* Background photo */}
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&auto=format&fit=crop&q=80"
          alt="The Terminal interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55 pointer-events-none" />
        {/* Subtle vignette bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Oversized title — left-anchored, bleeds off right */}
        <div className="absolute left-0 right-0 overflow-hidden" style={{ top: '50%', transform: 'translateY(-60%)' }}>
          <h1
            className="font-display font-black text-white whitespace-nowrap pl-6 md:pl-12 lg:pl-20 leading-none"
            style={{
              fontSize: 'clamp(5.5rem, 17vw, 14rem)',
              letterSpacing: '-0.02em',
              textShadow: '0 4px 40px rgba(0,0,0,0.4)',
            }}
          >
            THE TERMINAL
          </h1>
        </div>

        {/* Subtitle — bottom left of photo zone */}
        <div className="absolute bottom-8 left-6 md:left-12 max-w-[280px]">
          <p className="text-white/55 text-xs leading-relaxed">
            Điểm dừng chân giữa lòng thành phố —<br />
            nơi cà phê rang mộc Việt gặp gỡ ẩm thực<br />
            châu Âu tinh tế trong không gian industrial.
          </p>
        </div>
      </div>

      {/* ── BOTTOM ZONE: thumbnail + stats ── */}
      <div className="bg-surface/95 backdrop-blur-sm border-t border-gold/20 flex" style={{ height: '38%', minHeight: '180px', maxHeight: '260px' }}>

        {/* Left: thumbnail image + arrows */}
        <div className="relative w-44 md:w-52 shrink-0 overflow-hidden border-r border-gold/15">
          <img
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&fit=crop&q=80"
            alt="The Terminal space"
            className="w-full h-full object-cover opacity-80"
          />
          {/* Arrow controls */}
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            <button
              className="w-7 h-7 bg-warm-white/80 backdrop-blur-sm border border-gold/20 flex items-center justify-center text-brand-dark/60 hover:bg-warm-white hover:text-brand-dark transition-all"
              aria-label="previous"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L4 6l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button
              className="w-7 h-7 bg-warm-white/80 backdrop-blur-sm border border-gold/20 flex items-center justify-center text-brand-dark/60 hover:bg-warm-white hover:text-brand-dark transition-all"
              aria-label="next"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 2L8 6l-3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>

        {/* Right: stats grid */}
        <div className="flex-1 flex items-center px-6 md:px-10 lg:px-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 w-full">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`${i < stats.length - 1 ? 'md:border-r md:border-gold/15 md:pr-8' : ''}`}>
                <p className="text-brand-dark/45 text-[10px] tracking-[0.3em] mb-1.5 uppercase flex items-center gap-1.5">
                  <span className="w-3 h-px bg-gold/40 inline-block" />
                  {stat.label}
                </p>
                <p className="font-display font-bold text-brand-dark" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Hidden scroll button */}
      <button onClick={() => scrollTo('#glass-about')} className="sr-only" aria-label="Scroll to about" />
    </section>
  )
}
