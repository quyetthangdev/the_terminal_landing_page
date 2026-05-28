import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MuseumPage from '@/pages/MuseumPage'
import GlassPage from '@/pages/GlassPage'
import StaffFloorPlanPage from '@/pages/staff-floor-plan'
import StaffTableOrderPage from '@/pages/staff-table-order'
import StaffPaymentPage from '@/pages/staff-payment'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MuseumPage />} />
        <Route path="/glass" element={<GlassPage />} />
        <Route path="/staff" element={<StaffFloorPlanPage />} />
        <Route path="/staff/table/:id" element={<StaffTableOrderPage />} />
        <Route path="/staff/table/:id/payment" element={<StaffPaymentPage />} />
      </Routes>
    </BrowserRouter>
  )
}
