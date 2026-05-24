import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MuseumPage from '@/pages/MuseumPage'
import GlassPage from '@/pages/GlassPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MuseumPage />} />
        <Route path="/glass" element={<GlassPage />} />
      </Routes>
    </BrowserRouter>
  )
}
