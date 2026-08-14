import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { EmergencyButton } from './EmergencyButton'

import { Chatbot } from './Chatbot'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col relative">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <EmergencyButton />
      <Chatbot />
    </div>
  )
}
