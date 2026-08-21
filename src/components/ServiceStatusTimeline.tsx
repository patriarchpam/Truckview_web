import { CheckCircle2, Clock, ShieldAlert } from 'lucide-react'

interface Stage {
  key: string
  label: string
  desc: string
}

const STAGES: Stage[] = [
  { key: 'pending', label: 'Booking Received', desc: 'We have received your service request preference.' },
  { key: 'reviewed', label: 'Request Reviewed', desc: 'Our team is reviewing your vehicle details and preferences.' },
  { key: 'confirmed', label: 'Appointment Confirmed', desc: 'Your appointment date and time have been confirmed.' },
  { key: 'inspection', label: 'Vehicle Inspection', desc: 'Your vehicle is currently undergoing physical inspection.' },
  { key: 'diagnosed', label: 'Diagnosis', desc: 'Diagnostic testing is complete or in progress.' },
  { key: 'estimate-ready', label: 'Estimate Ready', desc: 'A service cost estimate has been generated.' },
  { key: 'awaiting-approval', label: 'Awaiting Customer Approval', desc: 'Please review and approve the service estimate.' },
  { key: 'in-progress', label: 'Repair In Progress', desc: 'Our technicians are working on your vehicle.' },
  { key: 'quality-check', label: 'Quality Check', desc: 'Undergoing standard quality check and test drive.' },
  { key: 'ready', label: 'Ready', desc: 'Your vehicle is ready for collection.' },
  { key: 'completed', label: 'Completed', desc: 'Service completed. Thank you for using TruckView!' }
]

interface ServiceStatusTimelineProps {
  status: string
}

export function ServiceStatusTimeline({ status }: ServiceStatusTimelineProps) {
  const isCancelled = status === 'cancelled'
  const activeIndex = STAGES.findIndex((s) => s.key === status)

  return (
    <div className="space-y-6">
      {isCancelled ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl flex gap-3 text-sm text-red-700 dark:text-red-400">
          <ShieldAlert className="shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-semibold">Service Request Cancelled</p>
            <p className="text-xs mt-0.5 leading-relaxed">
              This service request has been cancelled. Please book a new service or contact support if you need assistance.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative border-l border-line ml-3.5 pl-6 space-y-6 py-2">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeIndex
            const isActive = idx === activeIndex

            return (
              <div key={stage.key} className="relative">
                {/* Step dot */}
                <div
                  className={`absolute -left-[35px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                    isCompleted
                      ? 'bg-success-500 border-success-500 text-white'
                      : isActive
                      ? 'bg-accent-500 border-accent-500 text-white ring-4 ring-accent-500/20 animate-pulse'
                      : 'bg-surface border-line text-muted'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : isActive ? (
                    <Clock size={14} />
                  ) : (
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Step contents */}
                <div>
                  <h4
                    className={`font-semibold text-sm transition-colors ${
                      isActive ? 'text-accent-500 font-bold' : isCompleted ? 'text-ink' : 'text-ink-soft opacity-60'
                    }`}
                  >
                    {stage.label}
                  </h4>
                  <p
                    className={`text-xs mt-0.5 transition-colors ${
                      isActive || isCompleted ? 'text-muted' : 'text-muted/60'
                    }`}
                  >
                    {stage.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
