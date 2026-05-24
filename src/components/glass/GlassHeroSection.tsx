import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import TrainScene from '@/components/three/TrainScene'

function scrollTo(id: string) {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function GlassHeroSection() {
  return (
    <section id="glass-hero" className="relative h-screen overflow-hidden bg-brand-darker">
      {/* Three.js train as background */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 0.2, 8], fov: 60 }} gl={{ alpha: true, antialias: true }} dpr={[1, 1.5]}>
            <TrainScene />
          </Canvas>
        </Suspense>
      </div>

      {/* Deep gradient overlay — darker at edges */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/30 to-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

      {/* Oversized bleeding title — anchored left, overflows right */}
      <div className="absolute inset-0 flex flex-col justify-center overflow-hidden">
        <div className="pl-8 md:pl-16 lg:pl-24">
          <p className="text-white/40 text-xs tracking-[0.5em] mb-4 font-light">CAFE & EUROPEAN KITCHEN</p>
          <h1
            className="font-display font-black text-white leading-[0.85] whitespace-nowrap"
            style={{ fontSize: 'clamp(5rem, 16vw, 13rem)', textShadow: '0 0 80px rgba(201,168,76,0.15)' }}
          >
            THE TERMINAL
          </h1>
          <p className="text-gold/70 text-xs tracking-[0.6em] mt-4 font-light">EST. 2026 — THỦ ĐỨC</p>
        </div>
      </div>

      {/* Glass stats panel — bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 md:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-3xl">
          {[
            { label: 'Thành lập', value: '2026' },
            { label: 'Chỗ ngồi', value: '120+' },
            { label: 'Món ăn', value: '50+' },
            { label: 'Không gian', value: '1 Tầng' },
          ].map((stat) => (
            <div key={stat.label} className="bg-warm-white/80 backdrop-blur-lg border border-gold/20 rounded-sm p-4">
              <p className="font-display text-2xl font-bold text-brand-dark">{stat.value}</p>
              <p className="text-brand-dark/50 text-[10px] tracking-[0.2em] mt-1">{stat.label.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 right-8 md:right-16 flex flex-col items-center gap-2 pointer-events-none">
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/30 to-transparent animate-pulse" />
        <span className="text-white/25 text-[9px] tracking-[0.4em] rotate-90 origin-center mt-2">SCROLL</span>
      </div>

      {/* Unused scrollTo reference to suppress lint warning */}
      <button
        onClick={() => scrollTo('#glass-about')}
        className="sr-only"
        aria-label="Scroll to about"
      />
    </section>
  )
}
