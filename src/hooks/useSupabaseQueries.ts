import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService, dbService } from '../utils/supabaseHelpers'

// Example: Query for user profile
export function useUserProfile(userId?: string) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => dbService.getUserProfile(userId!),
    enabled: !!userId, // Only run if userId exists
    select: (data) => data.data, // Extract just the data
  })
}

// Example: Mutation for updating user profile
export function useUpdateUserProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Record<string, any> }) =>
      dbService.updateUserProfile(userId, updates),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables.userId] })
    },
  })
}

// Example: Auth mutations
export function useSignIn() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signIn(email, password),
  })
}

export function useSignUp() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signUp(email, password),
  })
}
