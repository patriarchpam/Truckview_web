import { Toaster } from 'sonner'
import { useTheme } from '../contexts/ThemeContext'

export function AppToaster() {
  const { theme } = useTheme()
  return <Toaster theme={theme} position="top-right" richColors closeButton />
}
