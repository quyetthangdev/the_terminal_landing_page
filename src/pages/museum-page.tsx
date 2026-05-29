import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/sections/HeroSection'
import AboutSection from '@/components/sections/AboutSection'
import MenuSection from '@/components/sections/MenuSection'
import ReservationSection from '@/components/sections/ReservationSection'
import GallerySection from '@/components/sections/GallerySection'
import LocationSection from '@/components/sections/LocationSection'
import PageSwitcher from '@/components/PageSwitcher'

export default function MuseumPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
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
      <PageSwitcher current="museum" />
    </div>
  )
}
