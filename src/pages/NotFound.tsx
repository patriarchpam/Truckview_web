import React from 'react'
import { motion } from 'framer-motion'
import { ButtonLink } from '../components/ui/Button'

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="text-center px-4"
      >
        <div className="text-8xl font-bold text-accent-500 mb-4">404</div>
        <h1 className="text-2xl font-bold text-ink mb-2">Page Not Found</h1>
        <p className="text-muted mb-8 max-w-md mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <ButtonLink to="/">Back to Home</ButtonLink>
      </motion.div>
    </div>
  )
}
