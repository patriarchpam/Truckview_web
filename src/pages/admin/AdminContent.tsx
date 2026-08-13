import React, { useState, useEffect } from 'react'
import { useStore } from '../../contexts/StoreContext'
import { Field, Input, Textarea } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { toast } from 'sonner'
import type { SiteContent } from '../../types'

export function AdminContent() {
  const { content, loading, updateContent } = useStore()
  
  const [formData, setFormData] = useState<SiteContent | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (content && !formData) {
      setFormData(JSON.parse(JSON.stringify(content)))
    }
  }, [content, formData])

  if (loading || !formData) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateContent(formData)
      toast.success("Site content updated successfully!")
    } catch (err) {
      console.error(err)
      toast.error("Failed to update site content")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Site Content</h1>
          <p className="text-sm text-muted">Update the text and contact info displayed on your website.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-line bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink mb-4">Hero Section</h2>
          <div className="space-y-4">
            <Field label="Eyebrow">
              <Input value={formData.hero.eyebrow} onChange={e => setFormData({ ...formData, hero: { ...formData.hero, eyebrow: e.target.value } })} />
            </Field>
            <Field label="Heading">
              <Input value={formData.hero.heading} onChange={e => setFormData({ ...formData, hero: { ...formData.hero, heading: e.target.value } })} />
            </Field>
            <Field label="Description">
              <Textarea rows={2} value={formData.hero.description} onChange={e => setFormData({ ...formData, hero: { ...formData.hero, description: e.target.value } })} />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink mb-4">About Section</h2>
          <div className="space-y-4">
            <Field label="Heading">
              <Input value={formData.about.heading} onChange={e => setFormData({ ...formData, about: { ...formData.about, heading: e.target.value } })} />
            </Field>
            <Field label="Mission">
              <Textarea rows={2} value={formData.about.mission} onChange={e => setFormData({ ...formData, about: { ...formData.about, mission: e.target.value } })} />
            </Field>
            <Field label="Vision">
              <Textarea rows={2} value={formData.about.vision} onChange={e => setFormData({ ...formData, about: { ...formData.about, vision: e.target.value } })} />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink mb-4">Contact Info</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone">
              <Input value={formData.contact.phone} onChange={e => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })} />
            </Field>
            <Field label="Email">
              <Input value={formData.contact.email} onChange={e => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })} />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Input value={formData.contact.address} onChange={e => setFormData({ ...formData, contact: { ...formData.contact, address: e.target.value } })} />
            </Field>
            <Field label="Business Hours" className="sm:col-span-2">
              <Input value={formData.contact.hours} onChange={e => setFormData({ ...formData, contact: { ...formData.contact, hours: e.target.value } })} />
            </Field>
          </div>
        </div>
      </div>
    </div>
  )
}
