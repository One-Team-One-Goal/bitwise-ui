import React from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useBackendProfile } from '@/hooks/useAuthQueries'
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Link } from '@tanstack/react-router'
import logoArrow from '@/assets/icons/logo-arrow.svg'
import logoArrowDark from '@/assets/icons/logo-arrow-dark.svg'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import ThemeToggle from '@/components/ui/theme-toggle'
import { Separator } from '@/components/ui/separator'
import { Menu } from 'lucide-react'

function useTheme(): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      // Try to match ThemeToggle logic: check localStorage, then prefers-color-scheme, then class
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

export const SimulatorToolbar: React.FC = () => {
  const theme = useTheme()
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

  return (
    <div className="bg-background border-b border-border w-full relative z-40">
      <div className="px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo/Title */}
          <div className="flex items-center gap-2 shrink-0">
            <img
              src={theme === 'dark' ? logoArrowDark : logoArrow}
              alt="Bitwise Logo"
              className="h-6"
            />
            <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground truncate">
              <span className="hidden sm:inline">Digital Circuit Simulator</span>
              <span className="sm:hidden">Circuit Sim</span>
            </h1>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 justify-center">
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    Learn
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full flex-col justify-end rounded-md bg-cover bg-center p-6 no-underline outline-hidden select-none focus:shadow-md"
                            href="/roadmap"
                          >
                            <div className="mt-4 mb-2 text-lg font-medium">
                              bitwise
                            </div>
                            <p className="text-muted-foreground text-sm leading-tight">
                              Learn Boolean algebra from basics to real-world
                              uses.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/roadmap" title="Basics">
                        Grasp variables, constants, and logic operations.
                      </ListItem>
                      <ListItem href="/roadmap" title="Laws">
                        Key rules behind Boolean expressions.
                      </ListItem>
                      <ListItem href="/roadmap" title="Uses">
                        Real-world logic design and computing examples.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    Tools
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/calculator">
                            <div className="font-medium">Calculator</div>
                            <div className="text-muted-foreground">
                              Perform Boolean calculations with our interactive
                              tool.
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/karnaughMaps">
                            <div className="font-medium">Karnaugh Maps</div>
                            <div className="text-muted-foreground">
                              Learn to visualize how karnaugh maps simplify
                              logic expressions.
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/digitalCircuit">
                            <div className="font-medium">Digital Circuit</div>
                            <div className="text-muted-foreground">
                              Learn to design and analyze digital circuits.
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    More
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/profile"
                            className="flex-row items-center gap-2"
                          >
                            Profile
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/" className="flex-row items-center gap-2">
                            Contact us
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop Auth Section - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <NavigationMenu>
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
                        <div className="px-3 pb-0 pt-2 text-sm text-primary">
                          {displayName || 'User'}
                        </div>
                        <div className="px-3 pt-0 pb-2 text-xs text-muted-foreground border-b">
                          {user?.email || 'User'}
                        </div>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/profile"
                            className="flex items-start w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                          >
                            Profile
                          </Link>
                        </NavigationMenuLink>
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
                <ThemeToggle />
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

          {/* Mobile Menu Button - Visible on mobile only */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>
                    <img
                      src={theme === 'dark' ? logoArrowDark : logoArrow}
                      alt="Bitwise"
                      className="h-6"
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

                  {/* Learn Section */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="learn" className="border-none">
                      <AccordionTrigger className="text-base font-semibold hover:no-underline py-2">
                        Learn
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 pl-4">
                        <Link
                          to="/roadmap"
                          className="block py-2 text-sm hover:text-primary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="font-medium">Basics</div>
                          <div className="text-xs text-muted-foreground">
                            Grasp variables, constants, and logic operations.
                          </div>
                        </Link>
                        <Link
                          to="/roadmap"
                          className="block py-2 text-sm hover:text-primary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="font-medium">Laws</div>
                          <div className="text-xs text-muted-foreground">
                            Key rules behind Boolean expressions.
                          </div>
                        </Link>
                        <Link
                          to="/roadmap"
                          className="block py-2 text-sm hover:text-primary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="font-medium">Uses</div>
                          <div className="text-xs text-muted-foreground">
                            Real-world logic design and computing examples.
                          </div>
                        </Link>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Tools Section */}
                    <AccordionItem value="tools" className="border-none">
                      <AccordionTrigger className="text-base font-semibold hover:no-underline py-2">
                        Tools
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 pl-4">
                        <Link
                          to="/calculator"
                          className="block py-2 text-sm hover:text-primary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="font-medium">Calculator</div>
                          <div className="text-xs text-muted-foreground">
                            Perform Boolean calculations with our interactive
                            tool.
                          </div>
                        </Link>
                        <Link
                          to="/karnaughMaps"
                          className="block py-2 text-sm hover:text-primary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="font-medium">Karnaugh Maps</div>
                          <div className="text-xs text-muted-foreground">
                            Learn to visualize how karnaugh maps simplify logic
                            expressions.
                          </div>
                        </Link>
                        <Link
                          to="/digitalCircuit"
                          className="block py-2 text-sm hover:text-primary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="font-medium">Digital Circuit</div>
                          <div className="text-xs text-muted-foreground">
                            Learn to design and analyze digital circuits.
                          </div>
                        </Link>
                      </AccordionContent>
                    </AccordionItem>

                    {/* More Section */}
                    <AccordionItem value="more" className="border-none">
                      <AccordionTrigger className="text-base font-semibold hover:no-underline py-2">
                        More
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 pl-4">
                        {isAuthenticated && (
                          <Link
                            to="/profile"
                            className="block py-2 text-sm hover:text-primary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Profile
                          </Link>
                        )}
                        <Link
                          to="/"
                          className="block py-2 text-sm hover:text-primary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Contact us
                        </Link>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

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
        </div>
      </div>
    </div>
  )
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & { href: string; title: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link to={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
