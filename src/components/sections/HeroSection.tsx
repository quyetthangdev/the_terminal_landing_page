import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import TrainScene from '@/components/three/TrainScene'
import { Button } from '@/components/ui/button'

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function HeroSection() {
  return (
    <section id="hero" className="relative h-screen bg-brand-darker overflow-hidden">
      {/* Three.js Canvas — absolute background */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0.2, 8], fov: 60 }}
            gl={{ alpha: true, antialias: true }}
            dpr={[1, 1.5]}
          >
            <TrainScene />
          </Canvas>
        </Suspense>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-darker/70 via-brand-darker/20 to-brand-darker/60 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        {/* Circular badge */}
        <div className="w-[72px] h-[72px] rounded-full border border-gold/50 flex items-center justify-center mb-8">
          <div className="w-14 h-14 rounded-full border border-gold/20 flex items-center justify-center">
            <span className="text-gold text-[10px] tracking-[0.15em] leading-snug text-center font-semibold">
              EST<br />2026
            </span>
          </div>
        </div>

        {/* Title */}
        <h1
          className="font-display font-bold text-white tracking-[0.18em] mb-4"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', textShadow: '0 0 50px rgba(207,169,63,0.2)' }}
        >
          THE TERMINAL
        </h1>

        {/* Subtitle */}
        <p className="text-gold tracking-[0.45em] text-xs md:text-sm mb-12 font-light">
          CAFE & EUROPEAN KITCHEN
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={() => scrollTo('menu')}
            className="bg-gold text-brand-dark hover:bg-gold/90 tracking-[0.2em] text-xs px-10 py-5 rounded-none font-bold"
          >
            XEM MENU
          </Button>
          <Button
            variant="outline"
            onClick={() => scrollTo('reservation')}
            className="border-gold/50 text-gold hover:bg-gold/10 hover:border-gold tracking-[0.2em] text-xs px-10 py-5 rounded-none bg-transparent"
          >
            ĐẶT BÀN
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <span className="text-gold/50 text-[10px] tracking-[0.3em]">CUỘN XUỐNG</span>
        <div className="w-px h-10 bg-gradient-to-b from-gold/60 to-transparent animate-pulse" />
      </div>
    </section>
  )
}
