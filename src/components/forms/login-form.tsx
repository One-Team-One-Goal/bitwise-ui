import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@tanstack/react-router'
import logoArrow from '@/assets/icons/outline-logo.svg'
import { toast } from 'sonner'
import { supabase } from '@/utils/supabase'
import { authService } from '@/utils/supabaseHelpers'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  // Handler for login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    toast.info('Logging in...')
    
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value
    
    
    try {
      await authService.signInWithOtp(email)
      toast.success('Check your email for the login link!');
    } catch (error) {
      toast.error('Login failed. Please try again.')
      console.error('Login error:', error)
      return
    }
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
                name='email'
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                //required
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
