import { HistoryIcon, FilterIcon } from 'lucide-react'

const MOCK_AUDIT_LOGS = [
  { id: 'log-1', admin: 'System Admin', action: 'Modified Booking TV-2026-0089', date: 'Oct 14, 2026, 14:32:00', ip: '192.168.1.1' },
  { id: 'log-2', admin: 'System Admin', action: 'Approved Review #1', date: 'Oct 14, 2026, 10:15:22', ip: '192.168.1.1' },
  { id: 'log-3', admin: 'David Smith', action: 'Created Mechanic Profile (John Doe)', date: 'Oct 13, 2026, 16:45:10', ip: '10.0.0.45' },
  { id: 'log-4', admin: 'Sarah Manager', action: 'Updated Payment Settings', date: 'Oct 12, 2026, 09:12:05', ip: '10.0.0.52' },
]

export function AdminSettingsAudit() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">Audit Logs</h2>
          <p className="text-muted text-sm mt-1">View a chronological record of administrative actions.</p>
        </div>
        <button className="flex items-center gap-2 bg-surface border border-line text-ink px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors text-sm font-medium">
          <FilterIcon size={16} />
          Filter Logs
        </button>
      </div>

      <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-2/50 text-muted text-xs uppercase tracking-wider border-b border-line">
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Admin User</th>
                <th className="p-4 font-medium">Action</th>
                <th className="p-4 font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {MOCK_AUDIT_LOGS.map((log) => (
                <tr key={log.id} className="border-b border-line last:border-0 hover:bg-surface-2/30">
                  <td className="p-4 text-muted flex items-center gap-2">
                    <HistoryIcon size={14} />
                    {log.date}
                  </td>
                  <td className="p-4 font-medium text-ink">{log.admin}</td>
                  <td className="p-4 text-ink-soft">{log.action}</td>
                  <td className="p-4 font-mono text-xs text-muted">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
