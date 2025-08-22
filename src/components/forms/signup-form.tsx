import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@tanstack/react-router'
import logoArrow from '@/assets/icons/outline-logo.svg'
import { useSignInWithGoogle, useSignInWithOtp } from '@/hooks/useAuthQueries'
import { FcGoogle } from 'react-icons/fc'

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const signInWithOtpMutation = useSignInWithOtp();
  const signInWithGoogleMutation = useSignInWithGoogle();

  // Handler for signup
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value
    
    if (!email) return

    signInWithOtpMutation.mutate(email)
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleSignUp}>
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
            <p className="text-3xl font-bold">Welcome to bitwise!</p>
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
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <Button variant={'bluez'} size={'lg'} type="submit">
              Sign Up
            </Button>
            <Button
              variant={'default'} 
              size={'lg'}
              onClick={() => signInWithGoogleMutation.mutate()}
            >
              <FcGoogle className="mr-2 z-10" />
              Sign up with Google
            </Button>
          </div>
        </div>
      </form>

      <div className="text-center text-sm">
        Already have an account? {''}
        <Link to="/login" className="underline underline-offset-4">
          <Button variant={'link'} className="p-0">
             Log in Instead
          </Button>
        </Link>
      </div>
    </div>
  )
}
