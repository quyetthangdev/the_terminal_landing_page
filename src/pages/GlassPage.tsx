import { Toaster } from '@/components/ui/sonner'
import GlassNavbar from '@/components/glass/GlassNavbar'
import GlassHeroSection from '@/components/glass/GlassHeroSection'
import GlassAboutSection from '@/components/glass/GlassAboutSection'
import GlassMenuSection from '@/components/glass/GlassMenuSection'
import GlassGallerySection from '@/components/glass/GlassGallerySection'
import GlassReservationSection from '@/components/glass/GlassReservationSection'
import GlassLocationSection from '@/components/glass/GlassLocationSection'
import GlassFooter from '@/components/glass/GlassFooter'
import PageSwitcher from '@/components/PageSwitcher'

export default function GlassPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a]">
      <GlassNavbar />
      <main>
        <GlassHeroSection />
        <GlassAboutSection />
        <GlassMenuSection />
        <GlassGallerySection />
        <GlassReservationSection />
        <GlassLocationSection />
      </main>
      <GlassFooter />
      <PageSwitcher current="glass" />
      <Toaster />
    </div>
  )
}
