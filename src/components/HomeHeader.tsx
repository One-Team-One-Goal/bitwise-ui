import NavLogo from '@/assets/icons/std-logo-black.svg'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { Link, useLocation } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { useBackendProfile } from '@/hooks/useAuthQueries'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const HomeHeader = () => {
  const isVisible = useScrollDirection()
  const location = useLocation()
  const { isAuthenticated, signOut, user } = useAuthContext()
  const { data: backendProfile } = useBackendProfile()
  const md = backendProfile?.metadata ?? {}
  const displayName = md.full_name ?? md.name ?? user?.user_metadata?.full_name ?? user?.email ?? 'Unknown'
  const avatar = md?.avatar_url ?? md?.picture ?? user?.user_metadata?.picture ?? undefined

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
      className={`z-50 w-full h-24 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-around p-6 lg:px-8"
      >
        {/* Logo (left) */}
        <div className="flex">
          <Link to="/" className="-m-1.5 p-1.5">
            <img src={NavLogo} alt="My Icon" className="h-7" />
          </Link>
        </div>

        {/* Middle: shadcn/ui NavigationMenu */}
        <div className="flex-1 flex justify-center">
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
                          className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
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
                            Learn to visualize how karnaugh maps simplify logic
                            expressions.
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
                        <Link to="/profile" className="flex-row items-center gap-2">
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
        
        {/* Right: Conditional User Menu or Login Button */}
        {isAuthenticated ? (
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent h-12">
                  <Avatar className="h-8 w-8 mr-1">
                    {avatar ? (
                      <AvatarImage src={avatar} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      <AvatarFallback className="text-xl text-gray-500">{(displayName || '?').charAt(0)}</AvatarFallback>
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
          <Link to="/login">
            <Button
              variant={'outlinez'}
              size={'lg'}
              className="hover:bg-transparent hover:text-black"
            >
              Learn for free <span aria-hidden="true">&rarr;</span>
            </Button>
          </Link>
        )}
      </nav>
    </header>
  )
}

// ListItem helper for NavigationMenu
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

export default HomeHeader
