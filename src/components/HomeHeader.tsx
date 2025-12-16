import { useEffect, useState } from 'react'

function useTheme(): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('theme')
        if (stored === 'dark') return 'dark'
        if (stored === 'light') return 'light'
      } catch {}
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        return 'dark'
      }
      if (document.documentElement.classList.contains('dark')) return 'dark'
      return 'light'
    }
    return 'light'
  })
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      )
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])
  return theme
}

import NavLogo from '@/assets/icons/std-logo-black.svg'
import NavLogoDark from '@/assets/icons/nav-bar-logo.svg'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { Link, useLocation } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Menu } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useBackendProfile } from '@/hooks/useAuthQueries'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import ThemeToggle from '@/components/ui/theme-toggle'
import { Separator } from '@/components/ui/separator'
import { Calculator, Grid3x3, Cpu, Book } from 'lucide-react'

type NavItem = {
  key: string
  label: string
  to: string
  icon: React.ElementType
  description?: string
  group?: 'primary' | 'tools'
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'learn',
    label: 'Learn',
    to: '/roadmap',
    icon: Book,
    group: 'primary',
  },
  {
    key: 'calculator',
    label: 'Calculator',
    to: '/calculator',
    icon: Calculator,
    description: 'Perform Boolean calculations with our interactive tool.',
    group: 'tools',
  },
  {
    key: 'karnaugh',
    label: 'Karnaugh Maps',
    to: '/karnaughMaps',
    icon: Grid3x3,
    description:
      'Learn to visualize how karnaugh maps simplify logic expressions.',
    group: 'tools',
  },
  {
    key: 'digital',
    label: 'Digital Circuit',
    to: '/digitalCircuit',
    icon: Cpu,
    description: 'Learn to design and analyze digital circuits.',
    group: 'tools',
  },
]


const HomeHeader = () => {
  const theme = useTheme()
  const isVisible = useScrollDirection()
  const location = useLocation()
  const { isAuthenticated, signOut, user } = useAuthContext()
  const { data: backendProfile } = useBackendProfile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const md = backendProfile?.metadata ?? {}
  const displayName =
    md.full_name ??
    md.name ??
    user?.user_metadata?.full_name ??
    user?.email ??
    'Unknown'
  const avatar =
    md?.avatar_url ?? md?.picture ?? user?.user_metadata?.picture ?? undefined

  // derive nav groups from the dynamic nav items
  const primaryItems = NAV_ITEMS.filter((i) => i.group === 'primary')
  const toolItems = NAV_ITEMS.filter((i) => i.group === 'tools')

  if (location.pathname === '/login' || location.pathname === '/signup') {
    return (
      <header className="z-50 fixed top-0 left-0 w-full h-24 flex items-center">
        <nav
          aria-label="Back"
          className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8 w-full"
        >
          <Link to="/" className="flex items-center">
            <Button variant="ghost" size="lg">
              <ChevronLeft />
              Back
            </Button>
          </Link>
        </nav>
      </header>
    )
  }

  return (
    <header
      className={`fixed top-0 left-0 z-40 w-full h-20 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-5 lg:px-8"
      >
        {/* Logo (left) */}
        <div className="flex">
          <Link to="/" className="-m-1.5 p-1.5">
            <img
              src={theme === 'dark' ? NavLogoDark : NavLogo}
              alt="My Icon"
              className={theme === 'dark' ? 'h-8' : 'h-6'}
            />
          </Link>
        </div>

        {/* Desktop Navigation - Hidden on small screens */}
        <div className="hidden md:flex flex-1 justify-center items-center">
          <nav aria-label="Primary" className="flex items-center gap-6">
            {primaryItems.map((item) => {
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className="group relative flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                >
                  <span className="relative">
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              )
            })}

            {toolItems.map((item) => {
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className="group relative flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                >
                  <span className="relative">
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Desktop Right Side - Hidden on small screens */}
        <div className="hidden md:flex">
          {isAuthenticated ? (
            <NavigationMenu>
              <div className="hover:bg-muted rounded-full">
                <ThemeToggle />
              </div>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent h-12">
                    <Avatar className="h-9 w-9 mr-1">
                      {avatar ? (
                        <AvatarImage
                          src={avatar}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="text-xl text-muted-foreground">
                          {(displayName || '?').charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="min-w-[150px] p-0">
                    <div className="p-2 space-y-1">
                      {/* User Info Header */}
                      <div className="px-3 pb-0 pt-2 text-sm text-primary">
                        {displayName || 'User'}
                      </div>
                      <div className="px-3 pt-0 pb-2 text-xs text-muted-foreground border-b">
                        {user?.email || 'User'}
                      </div>

                      {/* Profile Link */}
                      <NavigationMenuLink asChild>
                        <Link
                          to="/profile"
                          className="flex items-start w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                        >
                          Profile
                        </Link>
                      </NavigationMenuLink>

                      {/* Sign Out Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 font-normal"
                        onClick={signOut}
                      >
                        Sign Out
                      </Button>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hover:bg-muted rounded-full">
                <ThemeToggle />
              </div>
              <Link to="/login">
                <Button
                  variant={'outlinez'}
                  className="hover:bg-transparent text-foreground"
                >
                  Learn for free <span aria-hidden="true">&rarr;</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button - Visible on small screens only */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>
                  <img
                    src={theme === 'dark' ? NavLogoDark : NavLogo}
                    alt="Bitwise"
                    className={theme === 'dark' ? 'h-8' : 'h-6'}
                  />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col space-y-4">
                {/* User Section */}
                {isAuthenticated && (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                      <Avatar className="h-12 w-12">
                        {avatar ? (
                          <AvatarImage
                            src={avatar}
                            alt={displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <AvatarFallback className="text-xl">
                            {(displayName || '?').charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {displayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Primary nav (mobile) */}
                <div className="w-full">
                  <Link
                    to="/roadmap"
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-base font-semibold hover:bg-accent/30 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Learn
                  </Link>
                </div>

                {/* Tools (mobile) */}
                <div className="w-full px-2">
                  <div className="px-1 text-base font-semibold pb-2">Tools</div>
                  <div className="flex flex-col space-y-2">
                    {toolItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.key}
                          to={item.to}
                          className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-accent/30 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon className="h-5 w-5 mt-0.5" />
                          <div>
                            <div className="font-medium">{item.label}</div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Auth Actions */}
                {isAuthenticated ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                  >
                    Sign Out
                  </Button>
                ) : (
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full">
                      Learn for free <span aria-hidden="true">&rarr;</span>
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}

export default HomeHeader
