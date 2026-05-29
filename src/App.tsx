import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MuseumPage from '@/pages/museum-page'
import GlassPage from '@/pages/glass-page'
import StaffFloorPlanPage from '@/pages/staff-floor-plan'
import StaffTableOrderPage from '@/pages/staff-table-order'
import StaffPaymentPage from '@/pages/staff-payment'
import StaffInvoicePage from '@/pages/staff-invoice'
import StaffReceiptPage from '@/pages/staff-receipt'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/staff" replace />} />
        <Route path="/museum" element={<MuseumPage />} />
        <Route path="/glass" element={<GlassPage />} />
        <Route path="/staff" element={<StaffFloorPlanPage />} />
        <Route path="/staff/table/:id" element={<StaffTableOrderPage />} />
        <Route path="/staff/table/:id/payment" element={<StaffPaymentPage />} />
        <Route path="/staff/table/:id/invoice" element={<StaffInvoicePage />} />
        <Route path="/staff/table/:id/receipt" element={<StaffReceiptPage />} />
      </Routes>
    </BrowserRouter>
  )
}
