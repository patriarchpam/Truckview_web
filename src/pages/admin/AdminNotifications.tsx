import { useState } from 'react'
import { SendIcon, UsersIcon, ShieldAlertIcon, MegaphoneIcon } from 'lucide-react'

export function AdminNotifications() {
  const [message, setMessage] = useState('')

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">System Notifications</h1>
        <p className="text-muted mt-1">Manage automated alerts and send mass notifications to users.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Send Broadcast */}
        <div className="bg-surface border border-line p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <MegaphoneIcon size={20} className="text-accent-500" />
            Send Broadcast
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Audience</label>
              <select className="w-full px-4 py-2.5 bg-surface-2 border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500">
                <option>All Customers</option>
                <option>All Mechanics</option>
                <option>Active Bookings Only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Message</label>
              <textarea 
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your announcement here..."
                className="w-full px-4 py-3 bg-surface-2 border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 resize-none"
              />
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lift">
              <SendIcon size={18} />
              Send Notification
            </button>
          </div>
        </div>

        {/* Automated Alert Config */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-ink mb-4 px-1">Automated Triggers</h2>
          
          {[
            { title: 'New Booking Created', desc: 'Notify assigned mechanic', icon: UsersIcon, active: true },
            { title: 'Payment Failed', desc: 'Alert customer to retry', icon: ShieldAlertIcon, active: true },
            { title: 'Service Completed', desc: 'Ask customer for review', icon: MegaphoneIcon, active: false },
          ].map((trigger, i) => {
            const Icon = trigger.icon
            return (
              <div key={i} className="bg-surface border border-line p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${trigger.active ? 'bg-accent-50 text-accent-600' : 'bg-surface-2 text-muted'}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-ink">{trigger.title}</h4>
                    <p className="text-xs text-muted mt-0.5">{trigger.desc}</p>
                  </div>
                </div>
                
                {/* Toggle Switch Mock */}
                <button className={`w-11 h-6 rounded-full relative transition-colors ${trigger.active ? 'bg-accent-500' : 'bg-line'}`}>
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${trigger.active ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
