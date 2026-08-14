import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MenuIcon, XIcon, MoonIcon, SunIcon, UserIcon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../utils/format'
import { ButtonLink } from './ui/Button'

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
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line/50 glass">

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
          
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface-2 transition-colors">
                <UserIcon size={20} />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-3.5 py-2 rounded-lg text-sm font-medium text-ink-soft hover:text-ink hover:bg-surface-2 transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="px-3.5 py-2 rounded-lg text-sm font-medium text-accent-600 bg-accent-50 hover:bg-accent-100 transition-colors">
                  Sign up
                </Link>
              </div>
            )}
            <ButtonLink to="/book" variant="gradient">
              Book a Service
            </ButtonLink>
          </div>

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
              <div className="border-t border-line mt-2 pt-2 pb-2">
                {user ? (
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-ink-soft hover:text-ink hover:bg-surface-2 transition-colors">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-ink-soft hover:text-ink hover:bg-surface-2 transition-colors">
                      Login
                    </Link>
                    <Link to="/signup" onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-accent-600 hover:text-accent-700 hover:bg-accent-50 transition-colors">
                      Sign up
                    </Link>
                  </>
                )}
              </div>
              <div className="pt-2 px-2 pb-4 sm:hidden">
                <ButtonLink to="/book" variant="gradient" className="w-full justify-center mt-2" onClick={() => setOpen(false)}>
                  Book a Service
                </ButtonLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
