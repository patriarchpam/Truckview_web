import React from 'react'
import { useStore } from '../../contexts/StoreContext'

export function AdminContent() {
  const { content, loading } = useStore()
  if (loading || !content) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Site Content</h1>
      <div className="space-y-6">
        <div className="rounded-xl border border-line bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink mb-4">Hero Section</h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-muted">Eyebrow:</span> <span className="text-ink ml-2">{content.hero.eyebrow}</span></div>
            <div><span className="text-muted">Heading:</span> <span className="text-ink ml-2">{content.hero.heading}</span></div>
            <div><span className="text-muted">Description:</span> <span className="text-ink-soft ml-2">{content.hero.description}</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink mb-4">About</h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-muted">Heading:</span> <span className="text-ink ml-2">{content.about.heading}</span></div>
            <div><span className="text-muted">Mission:</span> <span className="text-ink-soft ml-2">{content.about.mission}</span></div>
            <div><span className="text-muted">Vision:</span> <span className="text-ink-soft ml-2">{content.about.vision}</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink mb-4">Contact Info</h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-muted">Phone:</span> <span className="text-ink ml-2">{content.contact.phone}</span></div>
            <div><span className="text-muted">Email:</span> <span className="text-ink ml-2">{content.contact.email}</span></div>
            <div><span className="text-muted">Address:</span> <span className="text-ink ml-2">{content.contact.address}</span></div>
            <div><span className="text-muted">Hours:</span> <span className="text-ink ml-2">{content.contact.hours}</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink mb-4">Testimonials ({content.testimonials.length})</h2>
          <div className="space-y-3">
            {content.testimonials.map((t) => (
              <div key={t.id} className="rounded-lg bg-surface-2 p-3">
                <div className="text-sm font-medium text-ink">{t.name} — {t.role}</div>
                <div className="text-xs text-muted mt-1 italic">"{t.quote}"</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
