import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from '@tanstack/react-router'
import logoArrow from '@/assets/icons/outline-logo.svg'
import { useSignIn, useSignInWithGoogle } from '@/hooks/useAuthQueries'
import { FcGoogle } from 'react-icons/fc'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const signInMutation = useSignIn();
  const logInWithGoogleMutation = useSignInWithGoogle();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
  });

  useEffect(() => {
    if (signInMutation.isSuccess || logInWithGoogleMutation.isSuccess) {
      navigate({ to: '/profile' });
    }
  }, [signInMutation.isSuccess, logInWithGoogleMutation.isSuccess, navigate]);

  const onSubmit = (data: z.infer<typeof signInSchema>) => {
    signInMutation.mutate({ email: data.email, password: data.password });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
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
                placeholder="m@example.com"
                {...register('email')}
                disabled={signInMutation.isPending}
              />
              {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={signInMutation.isPending}
              />
              {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
            </div>
            <Button variant={'bluez'} size={'lg'} type="submit" disabled={signInMutation.isPending}>
              {signInMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Logging in...
                </span>
              ) : 'Login'}
            </Button>
            <Button
              variant={'default'}
              size={'lg'}
              type="button"
              onClick={() => logInWithGoogleMutation.mutate()}
              disabled={signInMutation.isPending}
            >
              <FcGoogle className="mr-2 z-10" />
              Log in with Google
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
  );
}
