import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppToaster } from './components/AppToaster'
import { AdminLayout } from './components/admin/AdminLayout'
import { CustomerLayout } from './components/customer/CustomerLayout'
import { PublicLayout } from './components/PublicLayout'
import { AuthProvider } from './contexts/AuthContext'
import { StoreProvider } from './contexts/StoreContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { About } from './pages/About'
import { BookService } from './pages/BookService'
import { BookingLookup } from './pages/BookingLookup'
import { Contact } from './pages/Contact'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Pricing } from './pages/Pricing'
import { Services } from './pages/Services'
import { VehicleTypes } from './pages/VehicleTypes'
import { AdminAvailability } from './pages/admin/AdminAvailability'
import { AdminBookings } from './pages/admin/AdminBookings'
import { AdminContent } from './pages/admin/AdminContent'
import { AdminCustomers } from './pages/admin/AdminCustomers'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminServices } from './pages/admin/AdminServices'
import { AdminSettings } from './pages/admin/AdminSettings'
import { AdminVehicleTypes } from './pages/admin/AdminVehicleTypes'
import { 
  AdminMechanics, AdminPayments, AdminReviews, AdminReports, AdminNotifications, AdminSupport, AdminProfile,
  AdminSettingsGeneral, AdminSettingsStaff, AdminSettingsBooking, AdminSettingsPayments, AdminSettingsAppearance, AdminSettingsSecurity, AdminSettingsAudit 
} from './pages/admin/AdminPlaceholders'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { CustomerDashboard } from './pages/customer/CustomerDashboard'
import { CustomerBookings } from './pages/customer/CustomerBookings'
import { CustomerVehicles } from './pages/customer/CustomerVehicles'
import { CustomerFindMechanic, CustomerSavedMechanics, CustomerPayments, CustomerNotifications, CustomerProfile, CustomerSupport } from './pages/customer/CustomerPlaceholders'

export function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route index element={<Home />} />
                  <Route path="services" element={<Services />} />
                  <Route path="vehicle-types" element={<VehicleTypes />} />
                  <Route path="pricing" element={<Pricing />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="book" element={<BookService />} />
                  <Route path="booking" element={<BookingLookup />} />
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                <Route path="/dashboard" element={<CustomerLayout />}>
                  <Route index element={<CustomerDashboard />} />
                  <Route path="bookings" element={<CustomerBookings />} />
                  <Route path="vehicles" element={<CustomerVehicles />} />
                  <Route path="find-mechanic" element={<CustomerFindMechanic />} />
                  <Route path="saved-mechanics" element={<CustomerSavedMechanics />} />
                  <Route path="payments" element={<CustomerPayments />} />
                  <Route path="notifications" element={<CustomerNotifications />} />
                  <Route path="profile/*" element={<CustomerProfile />} />
                  <Route path="support" element={<CustomerSupport />} />
                </Route>

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="vehicle-types" element={<AdminVehicleTypes />} />
                  <Route path="availability" element={<AdminAvailability />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="mechanics" element={<AdminMechanics />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="support" element={<AdminSupport />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="content" element={<AdminContent />} />
                  <Route path="settings" element={<AdminSettings />}>
                    <Route index element={<AdminSettingsGeneral />} />
                    <Route path="staff" element={<AdminSettingsStaff />} />
                    <Route path="booking" element={<AdminSettingsBooking />} />
                    <Route path="payments" element={<AdminSettingsPayments />} />
                    <Route path="notifications" element={<AdminSettingsGeneral />} />
                    <Route path="appearance" element={<AdminSettingsAppearance />} />
                    <Route path="security" element={<AdminSettingsSecurity />} />
                    <Route path="audit" element={<AdminSettingsAudit />} />
                  </Route>
                </Route>
              </Routes>
              <AppToaster />
            </BrowserRouter>
          </SubscriptionProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  )
}
