import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

/**
 * ThemeToggle
 * - toggles the `dark` class on document.documentElement
 * - persists preference to localStorage (key: 'theme')
 * - respects system preference by default
 */
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark') return true
      if (stored === 'light') return false
    } catch {
      /* ignore */
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) root.classList.add('dark')
    else root.classList.remove('dark')

    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
    } catch {
      /* ignore */
    }
  }, [isDark])

  useEffect(() => {
    // Listen for system theme changes if user hasn't explicitly set a preference
    let mql: MediaQueryList | null = null
    try {
      mql = window.matchMedia('(prefers-color-scheme: dark)')
      type CompatMql = MediaQueryList & {
        addListener?: (handler: (e: MediaQueryListEvent) => void) => void
        removeListener?: (handler: (e: MediaQueryListEvent) => void) => void
      }
      const cmql = mql as CompatMql
      const handler = (e: MediaQueryListEvent) => {
        try {
          const stored = localStorage.getItem('theme')
          if (stored) return // user override
        } catch {
          /* ignore */
        }
        setIsDark(e.matches)
      }
      if (cmql && cmql.addEventListener)
        cmql.addEventListener('change', handler)
      else if (cmql && cmql.addListener) cmql.addListener(handler)
      return () => {
        if (cmql && cmql.removeEventListener)
          cmql.removeEventListener('change', handler)
        else if (cmql && cmql.removeListener) cmql.removeListener(handler)
      }
    } catch {
      // ignore
    }
  }, [])

  return (
    <button
      aria-label="Toggle theme"
      title="Toggle dark mode"
      onClick={() => setIsDark((s) => !s)}
      className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent/10 transition-colors"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-muted-foreground" />
      )}
    </button>
  )
}
