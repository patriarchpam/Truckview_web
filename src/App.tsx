import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppToaster } from './components/AppToaster'
import { AdminLayout } from './components/admin/AdminLayout'
import { CustomerLayout } from './components/customer/CustomerLayout'
import { PublicLayout } from './components/PublicLayout'
import { AuthLayout } from './components/AuthLayout'
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
import { AdminMechanics } from './pages/admin/AdminMechanics'
import { AdminPayments } from './pages/admin/AdminPayments'
import { AdminReviews } from './pages/admin/AdminReviews'
import { AdminReports } from './pages/admin/AdminReports'
import { AdminNotifications } from './pages/admin/AdminNotifications'
import { AdminProfile } from './pages/admin/AdminProfile'
import { AdminSettingsStaff } from './pages/admin/AdminSettingsStaff'
import { AdminSettingsPayments } from './pages/admin/AdminSettingsPayments'
import { AdminSettingsAppearance } from './pages/admin/AdminSettingsAppearance'
import { AdminSettingsSecurity } from './pages/admin/AdminSettingsSecurity'
import { AdminSettingsAudit } from './pages/admin/AdminSettingsAudit'
import { AdminSettingsGeneral, AdminSettingsBooking } from './pages/admin/AdminPlaceholders'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { CustomerDashboard } from './pages/customer/CustomerDashboard'
import { CustomerBookings } from './pages/customer/CustomerBookings'
import { CustomerVehicles } from './pages/customer/CustomerVehicles'
import { CustomerProfile } from './pages/customer/CustomerProfile'
import { CustomerPayments } from './pages/customer/CustomerPayments'
import { CustomerNotifications } from './pages/customer/CustomerNotifications'
import { HelpSupport } from './pages/shared/HelpSupport'

import { HelmetProvider } from 'react-helmet-async'

import { AbujaMechanic } from './pages/service-areas/AbujaMechanic'

export function App() {
  return (
    <HelmetProvider>
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
                  <Route path="service-areas/abuja" element={<AbujaMechanic />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                <Route element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />
                </Route>

                <Route path="/dashboard" element={<CustomerLayout />}>
                  <Route index element={<CustomerDashboard />} />
                  <Route path="bookings" element={<CustomerBookings />} />
                  <Route path="vehicles" element={<CustomerVehicles />} />
                  <Route path="payments" element={<CustomerPayments />} />
                  <Route path="notifications" element={<CustomerNotifications />} />
                  <Route path="profile/*" element={<CustomerProfile />} />
                  <Route path="support" element={<HelpSupport />} />
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
                  <Route path="support" element={<HelpSupport />} />
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
    </HelmetProvider>
  )
}
