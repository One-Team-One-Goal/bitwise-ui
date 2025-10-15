import React from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useBackendProfile } from '@/hooks/useAuthQueries';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Link } from '@tanstack/react-router'
import CodeImg from '@/assets/icons/codeimg.jpg'
import logoArrow from '@/assets/icons/logo-arrow.svg'
import { Button } from '@/components/ui/button';

export const SimulatorToolbar: React.FC = () => {
  
    const { isAuthenticated, signOut, user } = useAuthContext()
    const { data: backendProfile } = useBackendProfile()
    const md = backendProfile?.metadata ?? {}
    const displayName = md.full_name ?? md.name ?? user?.user_metadata?.full_name ?? user?.email ?? 'Unknown'
    const avatar = md?.avatar_url ?? md?.picture ?? user?.user_metadata?.picture ?? undefined

  return (
    <div className="bg-background border-b border-border">
      <div className="px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          {/* Logo/Title and Tools */}
          <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-2 w-32 pl-2">
            {/* Logo/Title - Compact on mobile */}
            <img src={logoArrow} alt="My Icon" className="h-6 mr-2" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground truncate">
                <span className="hidden sm:inline">Digital Circuit Simulator</span>
                <span className="sm:hidden">Circuit Sim</span>
              </h1>
            </div>
          </div>

          {/* Middle: shadcn/ui NavigationMenu */}
          <div className="flex-1 flex justify-center z-10">
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
                            style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), url(${CodeImg})` }}
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

          {/* Auth Section */}
          <div className="flex justify-end w-32 mr-2">
            {isAuthenticated ? (
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent h-12">
                  <Avatar className="h-9 w-9 mr-1">
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
          </div>
        </div>
      </div>
    </div>
  );
};

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