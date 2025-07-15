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

interface LessonHeaderProps {
  progress: number
}

const LessonHeader = ({ progress }: LessonHeaderProps) => {
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-background h-24 flex flex-col items-center justify-start px-4">
      <div className="relative w-full flex items-center justify-between m-auto">
        <div>
          <Button
            variant="ghost"
            className="absolute left-4 top-1/2 -translate-y-1/2"
          >
            <ChevronLeft /> Back
          </Button>
        </div>
        <div className="w-1/2 mx-auto">
          <Progress value={progress} className="w-full" />
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="bluezOutline">
                <Menu /> Mars
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-42" align="end">
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
