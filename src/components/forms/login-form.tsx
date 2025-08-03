import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@tanstack/react-router'
import logoArrow from '@/assets/icons/outline-logo.svg'
import { toast } from 'sonner'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  // Handler for login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    toast.info('Logging in...') // Show informative toast
    // Add your login logic here
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleLogin}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-12 items-center justify-center rounded-md mb-4">
                <img src={logoArrow} alt="bitwise logo" />
              </div>
              <span className="sr-only">Bitwise Inc,</span>
            </a>
            <p className="text-3xl font-bold">Welcome back!</p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@bitwise.com"
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <Button variant={'default'} size={'lg'} type="submit">
              Login
            </Button>
          </div>
        </div>
      </form>

      <div className="text-center text-sm">
        Didn&apos;t have an account yet?{' '}
        <Link to="/signup" className="underline underline-offset-4">
          <Button variant={'link'} className="p-0">
            Sign up now
          </Button>
        </Link>
      </div>
    </div>
  )
}
