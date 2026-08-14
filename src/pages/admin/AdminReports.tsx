import { BarChart3Icon, PieChartIcon, TrendingUpIcon, UsersIcon } from 'lucide-react'

export function AdminReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Analytics & Reports</h1>
        <p className="text-muted mt-1">View business performance, service metrics, and financial reports.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: '1,248', icon: BarChart3Icon, trend: '+12%' },
          { label: 'New Customers', value: '342', icon: UsersIcon, trend: '+5%' },
          { label: 'Avg Rating', value: '4.8', icon: PieChartIcon, trend: '+0.1' },
          { label: 'Conversion Rate', value: '64%', icon: TrendingUpIcon, trend: '+2%' },
        ].map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <div key={i} className="bg-surface border border-line p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 bg-surface-2 rounded-xl flex items-center justify-center text-muted">
                  <Icon size={20} />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{kpi.trend}</span>
              </div>
              <h3 className="text-3xl font-bold text-ink mb-1">{kpi.value}</h3>
              <p className="text-sm text-muted">{kpi.label}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-line p-6 rounded-2xl shadow-sm min-h-[300px] flex flex-col">
          <h3 className="font-semibold text-lg text-ink mb-6">Revenue Over Time</h3>
          <div className="flex-1 border-2 border-dashed border-line rounded-xl flex items-center justify-center text-muted">
            [ Line Chart Visualization ]
          </div>
        </div>
        <div className="bg-surface border border-line p-6 rounded-2xl shadow-sm min-h-[300px] flex flex-col">
          <h3 className="font-semibold text-lg text-ink mb-6">Bookings by Service Type</h3>
          <div className="flex-1 border-2 border-dashed border-line rounded-xl flex items-center justify-center text-muted">
            [ Bar Chart Visualization ]
          </div>
        </div>
      </div>
    </div>
  )
}
