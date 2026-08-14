import { PaletteIcon, LayoutIcon } from 'lucide-react'

export function AdminSettingsAppearance() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold text-ink">Appearance</h2>
        <p className="text-muted text-sm mt-1">Customize dashboard themes, brand colors, and logos.</p>
      </div>

      <div className="space-y-6">
        {/* Theme Mode */}
        <div className="bg-surface border border-line p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <LayoutIcon size={20} className="text-accent-500" />
            <h3 className="font-semibold text-ink">Theme Preference</h3>
          </div>
          <div className="flex gap-4">
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-24 h-16 rounded-lg border-2 border-accent-500 bg-white flex flex-col p-1 shadow-sm">
                <div className="h-2 w-full bg-slate-100 rounded mb-1"></div>
                <div className="flex-1 flex gap-1">
                  <div className="w-4 h-full bg-slate-50 rounded"></div>
                  <div className="flex-1 h-full bg-slate-50 rounded"></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" name="theme" defaultChecked className="text-accent-500 focus:ring-accent-500" />
                <span className="text-sm font-medium text-ink">Light</span>
              </div>
            </label>
            <label className="flex flex-col items-center gap-2 cursor-pointer opacity-50">
              <div className="w-24 h-16 rounded-lg border-2 border-line bg-slate-900 flex flex-col p-1">
                <div className="h-2 w-full bg-slate-800 rounded mb-1"></div>
                <div className="flex-1 flex gap-1">
                  <div className="w-4 h-full bg-slate-800 rounded"></div>
                  <div className="flex-1 h-full bg-slate-800 rounded"></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" name="theme" disabled className="text-accent-500" />
                <span className="text-sm font-medium text-muted">Dark (Coming Soon)</span>
              </div>
            </label>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="bg-surface border border-line p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <PaletteIcon size={20} className="text-accent-500" />
            <h3 className="font-semibold text-ink">Brand Colors</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Primary Brand Color</label>
              <div className="flex items-center gap-3">
                <input type="color" defaultValue="#eab308" className="h-10 w-16 p-1 bg-surface border border-line rounded cursor-pointer" />
                <input type="text" defaultValue="#eab308" className="px-3 py-2 bg-surface border border-line rounded-lg text-ink font-mono text-sm" />
              </div>
              <p className="text-xs text-muted mt-1.5">Used for primary buttons, highlights, and active states.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
