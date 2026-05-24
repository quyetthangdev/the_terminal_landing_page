function scrollTo(id: string) {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function GlassHeroSection() {
  return (
    <section id="glass-hero" className="relative h-screen overflow-hidden">
      {/* Panoramic background photo */}
      <img
        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&auto=format&fit=crop&q=80"
        alt="The Terminal interior"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Warm tinted overlay — lightens photo for readability while keeping ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-warm-white/30 via-transparent to-warm-white/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-warm-white/40 via-transparent to-transparent pointer-events-none" />

      {/* Title — blends into photo via mix-blend-mode overlay */}
      <div className="absolute inset-0 flex flex-col justify-center overflow-hidden">
        <div className="pl-8 md:pl-16 lg:pl-24">
          <p className="text-brand-dark/50 text-xs tracking-[0.5em] mb-4 font-light">
            CAFE & EUROPEAN KITCHEN
          </p>

          {/* The main blending title — two layered spans for the "ẩn hiện" effect */}
          <div className="relative leading-[0.85] whitespace-nowrap" style={{ fontSize: 'clamp(5rem, 16vw, 13rem)' }}>
            {/* Shadow/depth layer */}
            <h1
              className="font-display font-black text-brand-dark/10 absolute inset-0 select-none"
              aria-hidden="true"
              style={{ fontSize: 'inherit', lineHeight: 'inherit' }}
            >
              THE TERMINAL
            </h1>
            {/* Blend layer — overlays with photo */}
            <h1
              className="font-display font-black text-white/70 relative [mix-blend-mode:overlay]"
              style={{ fontSize: 'inherit', lineHeight: 'inherit', textShadow: '0 2px 40px rgba(201,168,76,0.2)' }}
            >
              THE TERMINAL
            </h1>
          </div>

          <p className="text-gold text-xs tracking-[0.6em] mt-4 font-light">EST. 2026 — THỦ ĐỨC</p>
        </div>
      </div>

      {/* Glass stats panel — bottom left */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 md:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-3xl">
          {[
            { label: 'Thành lập', value: '2026' },
            { label: 'Chỗ ngồi', value: '120+' },
            { label: 'Món ăn', value: '50+' },
            { label: 'Không gian', value: '1 Tầng' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-warm-white/75 backdrop-blur-lg border border-gold/25 rounded-sm p-4 shadow-sm"
            >
              <p className="font-display text-2xl font-bold text-brand-dark">{stat.value}</p>
              <p className="text-brand-dark/50 text-[10px] tracking-[0.2em] mt-1">{stat.label.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 right-8 md:right-16 flex flex-col items-center gap-2 pointer-events-none">
        <div className="w-px h-10 bg-gradient-to-b from-brand-dark/40 to-transparent animate-pulse" />
        <span className="text-brand-dark/30 text-[9px] tracking-[0.4em]">SCROLL</span>
      </div>

      {/* Scroll to about */}
      <button onClick={() => scrollTo('#glass-about')} className="sr-only" aria-label="Scroll to about" />
    </section>
  )
}
