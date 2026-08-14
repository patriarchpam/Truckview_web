import { useAuth } from '../../contexts/AuthContext'
import { useStore } from '../../contexts/StoreContext'
import { Button } from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { Calendar, Car, Wrench } from 'lucide-react'
import { formatShortDate } from '../../utils/format'

export function CustomerDashboard() {
  const { user } = useAuth()
  const { bookings } = useStore()
  const navigate = useNavigate()

  if (!user) return null

  const myBookings = bookings.filter(b => b.customer.email.toLowerCase() === user.email.toLowerCase())
  const upcomingBookings = myBookings.filter(b => ['pending', 'confirmed', 'in-progress'].includes(b.status))
  
  // Parse vehicles from local storage
  let savedVehicles: any[] = []
  if (user?.profileId) {
    const stored = localStorage.getItem(`vehicles_${user.profileId}`)
    if (stored) {
      savedVehicles = JSON.parse(stored)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-navy-200 text-lg mb-6 max-w-xl">
            Keep your vehicles running smoothly. Manage your appointments and track service history all in one place.
          </p>
          <Button onClick={() => navigate('/book')} className="bg-accent-500 hover:bg-accent-600 text-white border-none">
            <Calendar size={18} className="mr-2" /> Book a New Service
          </Button>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <Wrench size={200} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Stats / Overview */}
        <div className="bg-surface p-6 rounded-2xl border border-line shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Upcoming Appointment</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/bookings')}>View All</Button>
          </div>
          {upcomingBookings.length > 0 ? (
            <div className="bg-surface-2 p-4 rounded-xl border border-line">
              <div className="font-semibold text-ink">{upcomingBookings[0].vehicleDetails}</div>
              <div className="text-sm text-muted mt-1">{formatShortDate(upcomingBookings[0].date)} at {upcomingBookings[0].time}</div>
              <div className="mt-3 flex gap-2">
                 <span className="px-2.5 py-1 bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 text-xs font-medium rounded-full">
                   {upcomingBookings[0].status}
                 </span>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 bg-surface-2 rounded-xl border border-dashed border-line">
              <p className="text-muted text-sm mb-4">No upcoming appointments scheduled.</p>
              <Button variant="outline" size="sm" onClick={() => navigate('/book')}>Schedule Now</Button>
            </div>
          )}
        </div>

        {/* My Garage Preview */}
        <div className="bg-surface p-6 rounded-2xl border border-line shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">My Garage</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/vehicles')}>Manage</Button>
          </div>
          {savedVehicles.length > 0 ? (
            <div className="space-y-3">
              {savedVehicles.slice(0, 2).map(car => (
                <div key={car.id} className="flex items-center gap-3 bg-surface-2 p-3 rounded-xl border border-line">
                  <div className="bg-surface p-2 rounded-lg shrink-0">
                    <Car size={20} className="text-muted" />
                  </div>
                  <div>
                    <div className="font-medium text-ink text-sm">{car.year} {car.make} {car.model}</div>
                  </div>
                </div>
              ))}
              {savedVehicles.length > 2 && (
                <p className="text-xs text-center text-muted pt-2">+ {savedVehicles.length - 2} more vehicles</p>
              )}
            </div>
          ) : (
            <div className="text-center p-6 bg-surface-2 rounded-xl border border-dashed border-line">
              <p className="text-muted text-sm mb-4">Your garage is empty.</p>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/vehicles')}>Add Vehicle</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
