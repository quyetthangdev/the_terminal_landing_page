import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/sections/HeroSection'
import AboutSection from '@/components/sections/AboutSection'
import MenuSection from '@/components/sections/MenuSection'
import ReservationSection from '@/components/sections/ReservationSection'
import GallerySection from '@/components/sections/GallerySection'
import LocationSection from '@/components/sections/LocationSection'
import { Toaster } from '@/components/ui/sonner'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <MenuSection />
        <ReservationSection />
        <GallerySection />
        <LocationSection />
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
