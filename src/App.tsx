import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ToastSuccessIcon, ToastWarningIcon, ToastErrorIcon, ToastInfoIcon } from '@/components/ui/toast-icons'
import MuseumPage from '@/pages/museum-page'
import GlassPage from '@/pages/glass-page'
import StaffFloorPlanPage from '@/pages/staff-floor-plan'
import StaffTableOrderPage from '@/pages/staff-table-order'
import StaffPaymentPage from '@/pages/staff-payment'
import StaffInvoicePage from '@/pages/staff-invoice'
import StaffReceiptPage from '@/pages/staff-receipt'
import AdminLayout from '@/pages/admin/admin-layout'
import AdminDashboard from '@/pages/admin/admin-dashboard'
import AdminMenuPage from '@/pages/admin/admin-menu'
import AdminTablesPage from '@/pages/admin/admin-tables'
import AdminSettingsPage from '@/pages/admin/admin-settings'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        theme="dark"
        icons={{
          success: <ToastSuccessIcon />,
          warning: <ToastWarningIcon />,
          error: <ToastErrorIcon />,
          info: <ToastInfoIcon />,
        }}
        toastOptions={{
          style: {
            borderRadius: '9999px',
            border: 'none',
            padding: '10px 16px',
          },
          classNames: {
            toast: '!shadow-[0_8px_28px_rgba(0,0,0,0.5)] !gap-2.5',
            title: '!text-[13px] !font-medium',
            description: '!text-[11px] !opacity-60',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/staff" replace />} />
        <Route path="/museum" element={<MuseumPage />} />
        <Route path="/glass" element={<GlassPage />} />
        <Route path="/staff" element={<StaffFloorPlanPage />} />
        <Route path="/staff/table/:id" element={<StaffTableOrderPage />} />
        <Route path="/staff/table/:id/payment" element={<StaffPaymentPage />} />
        <Route path="/staff/table/:id/invoice" element={<StaffInvoicePage />} />
        <Route path="/staff/table/:id/receipt" element={<StaffReceiptPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="menu" element={<AdminMenuPage />} />
          <Route path="tables" element={<AdminTablesPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
