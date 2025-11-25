import { Button } from '@/components/ui/button'
import { ChevronLeft, Menu } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useBackendProfile } from '@/hooks/useAuthQueries'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import ThemeToggle from '@/components/ui/theme-toggle'
import { Link } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LessonHeaderProps {
  progress: number
  title: string
}

const LessonHeader = ({ progress }: LessonHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, signOut, user } = useAuthContext()
  const { data: backendProfile } = useBackendProfile()

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
    <div className="fixed top-0 left-0 w-full z-40 bg-background border-b border-border">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-3 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Back</span>
          </Button>

          <div className="flex-1 px-2">
            <Progress value={progress} className="w-full h-2" />
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="shrink-0">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
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

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
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
                      Log In
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between h-20 px-6">
        <div className="shrink-0">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ChevronLeft className="h-5 w-5 mr-1" /> Back
          </Button>
        </div>

        <div className="flex-1 max-w-2xl mx-8">
          <Progress value={progress} className="w-full" />
        </div>

        <div className="shrink-0 flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hover:bg-muted rounded-full">
                <ThemeToggle />
              </div>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
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
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {displayName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={signOut}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hover:bg-muted rounded-full">
                <ThemeToggle />
              </div>
              <Link to="/login">
                <Button variant="default">Log In</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export type { LessonHeaderProps }
export default LessonHeader
