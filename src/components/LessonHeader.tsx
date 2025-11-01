import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronLeft,
  Menu,
  User,
  Settings,
  Github,
  LifeBuoy,
  LogOut,
} from 'lucide-react'
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

interface LessonHeaderProps {
  progress: number
  title: string
}

const LessonHeader = ({ progress }: LessonHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
                <div className="px-3 py-2 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Mars Benitez</p>
                </div>
                <Separator />
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" /> Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </Button>
                </div>
                <Separator />
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Github className="w-4 h-4 mr-2" /> GitHub
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LifeBuoy className="w-4 h-4 mr-2" /> Support
                  </Button>
                </div>
                <Separator />
                <Button
                  variant="ghost"
                  className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between h-20 px-6">
        <div className="shrink-0">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="h-5 w-5 mr-1" /> Back
          </Button>
        </div>
        
        <div className="flex-1 max-w-2xl mx-8">
          <Progress value={progress} className="w-full" />
        </div>

        <div className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <Menu className="h-5 w-5 mr-2" /> Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuLabel>
                <p className="py-1">Mars Benitez</p>
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Github className="w-4 h-4 mr-2" /> GitHub
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LifeBuoy className="w-4 h-4 mr-2" /> Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="w-4 h-4 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export type { LessonHeaderProps }
export default LessonHeader
