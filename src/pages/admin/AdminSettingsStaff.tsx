import { UserPlusIcon, ShieldIcon, MoreVerticalIcon } from 'lucide-react'

const MOCK_STAFF = [
  { id: '1', name: 'System Admin', email: 'admin@truckview.com', role: 'Super Admin', status: 'Active' },
  { id: '2', name: 'David Smith', email: 'david@truckview.com', role: 'Support Agent', status: 'Active' },
  { id: '3', name: 'Sarah Manager', email: 'sarah@truckview.com', role: 'Dispatcher', status: 'Inactive' },
]

export function AdminSettingsStaff() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">Staff & Roles</h2>
          <p className="text-muted text-sm mt-1">Manage administrative accounts and permissions.</p>
        </div>
        <button className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-lift shrink-0 text-sm">
          <UserPlusIcon size={16} />
          Invite Staff
        </button>
      </div>

      <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-2/50 text-muted text-sm border-b border-line">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {MOCK_STAFF.map((staff) => (
                <tr key={staff.id} className="border-b border-line last:border-0 hover:bg-surface-2/30">
                  <td className="p-4">
                    <div className="font-medium text-ink">{staff.name}</div>
                    <div className="text-muted text-xs">{staff.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-ink-soft bg-surface-2 px-2.5 py-1 rounded-lg border border-line">
                      <ShieldIcon size={14} className="text-muted" />
                      {staff.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${staff.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-surface-2 text-muted'}`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-muted hover:text-ink p-1">
                      <MoreVerticalIcon size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
