import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppToaster } from './components/AppToaster'
import { AdminLayout } from './components/admin/AdminLayout'
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
                  <Route path="*" element={<NotFound />} />
                </Route>

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="vehicle-types" element={<AdminVehicleTypes />} />
                  <Route path="availability" element={<AdminAvailability />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="content" element={<AdminContent />} />
                  <Route path="settings" element={<AdminSettings />} />
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
