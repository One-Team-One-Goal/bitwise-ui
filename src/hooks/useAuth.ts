import { useState } from 'react'
import { type Session, type User } from '@supabase/supabase-js'

export function useAuth() {
  const [session] = useState<Session | null>(null)
  const [user] = useState<User | null>(null)
  const [loading] = useState(false) // Set to false to prevent loading indefinitely

  const signOut = async () => {
    try {
      // Mock sign out for now
      console.log('Sign out called')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  return {
    session,
    user,
    loading,
    signOut,
    isAuthenticated: !!session
  }
}
