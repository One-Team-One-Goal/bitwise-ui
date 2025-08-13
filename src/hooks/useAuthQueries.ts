import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService, type AuthCredentials } from '../services/auth.service'
import { useAuthContext } from '../contexts/AuthContext'
import { toast } from 'sonner'

export const AUTH_QUERY_KEYS = {
  profile: ['auth', 'profile'] as const,
  verify: ['auth', 'verify'] as const,
} as const

export function useSignUp() {
  return useMutation({
    mutationFn: (credentials: AuthCredentials) => authService.signUp(credentials),
    onSuccess: () => {
      toast.success('Account created! Check your email for verification.')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Signup failed')
    },
  })
}

export function useSignIn() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (credentials: AuthCredentials) => authService.signIn(credentials),
    onSuccess: () => {
      toast.success('Welcome back!')
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed')
    },
  })
}

export function useSignInWithOtp() {
  return useMutation({
    mutationFn: (email: string) => authService.signInWithOtp(email),
    onSuccess: () => {
      toast.success('Check your email for the login link!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send email')
    },
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      toast.success('Logged out successfully')
      queryClient.clear()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Logout failed')
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.resetPassword(email),
    onSuccess: () => {
      toast.success('Password reset email sent!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send reset email')
    },
  })
}

// Backend queries (through your NestJS API)
export function useBackendProfile() {
  const { isAuthenticated } = useAuthContext()
  
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.profile,
    queryFn: () => authService.getProfile(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

export function useVerifyToken() {
  const { session } = useAuthContext()
  
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.verify,
    queryFn: () => authService.verifyToken(),
    enabled: !!session,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Verify every 5 minutes
    retry: false,
  })
}
