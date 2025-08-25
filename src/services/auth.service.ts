import { supabase } from '../utils/supabase'
import { apiService } from './api.service'

export interface AuthCredentials {
  email: string
  password?: string
}

export interface AuthResponse {
  user: any
  session: any
  message?: string
}

export interface BackendUser {
  id: string
  email: string
  metadata: any
  created_at: string
}

export const authService = {
  async signUp(credentials: AuthCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password!,
    })

    if (error) throw new Error(error.message)
    return { user: data.user, session: data.session }
  },

  async signIn(credentials: AuthCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password!,
    })

    if (error) throw new Error(error.message)
    return { user: data.user, session: data.session }
  },

  async signInWithOtp(email: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/profile`,
      },
    })

    if (error) throw new Error(error.message)
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
    
    apiService.setAuthToken(null)
  },

  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) throw new Error(error.message);
  },

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw new Error(error.message)
  },

  async getProfile(): Promise<BackendUser> {
    try {
      return await apiService.get<BackendUser>('/auth/profile', true)
    } catch (error) {
      throw new Error(`Failed to get profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  async verifyToken(): Promise<{ valid: boolean; user: BackendUser }> {
    try {
      return await apiService.post('/auth/verify', {}, true)
    } catch (error) {
      throw new Error(`Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    try {
      return await apiService.post<AuthResponse>('/auth/refresh', {}, true)
    } catch (error) {
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw new Error(error.message)
    return session
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw new Error(error.message)
    return user
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession()
      return !!session
    } catch {
      return false
    }
  },
}
