import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MenuIcon, XIcon, MoonIcon, SunIcon, PhoneIcon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '../utils/format'

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/vehicle-types', label: 'Vehicles' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-xl">
      {/* Top bar */}
      <div className="bg-navy-900 text-white text-xs py-1.5">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <PhoneIcon size={12} />
            0803 679 8700
          </span>
          <span className="hidden sm:block">Behind Games Village, Deck One Apartments, Karu District, Abuja</span>
          <a href="mailto:truckviewent@gmail.com" className="hover:text-accent-400 transition-colors">
            truckviewent@gmail.com
          </a>
        </div>
      </div>

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="Truck-View" className="h-12 w-auto dark:invert dark:mix-blend-screen" />
          <div className="hidden sm:block">
            <span className="block text-lg font-bold text-ink leading-tight group-hover:text-accent-500 transition-colors">
              Truck-View
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-muted font-medium">Global Ent.</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                cn(
                  'px-3.5 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'text-accent-500 bg-accent-50 dark:bg-accent-900/20' : 'text-ink-soft hover:text-ink hover:bg-surface-2',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface-2 transition-colors">
            {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
          <Link
            to="/book"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-600 shadow-[0_6px_20px_-10px_rgba(249,115,22,0.9)] transition-all active:scale-[0.98]"
          >
            Book a Service
          </Link>
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-lg text-muted hover:text-ink hover:bg-surface-2">
            {open ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden border-t border-line bg-surface"
          >
            <div className="px-4 py-4 space-y-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive ? 'text-accent-500 bg-accent-50 dark:bg-accent-900/20' : 'text-ink-soft hover:text-ink hover:bg-surface-2',
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <Link
                to="/book"
                onClick={() => setOpen(false)}
                className="block mt-3 text-center rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
              >
                Book a Service
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
