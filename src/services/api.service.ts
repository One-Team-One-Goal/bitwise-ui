import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { supabase } from '../utils/supabase'
import { HTTP_STATUS } from '../constants/api'

interface RequestOptions {
  requiresAuth?: boolean
}

class ApiService {
  private api: AxiosInstance

  constructor() {
    // Create axios instance with base configuration
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Setup request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        // Get fresh token on each request if auth is required
        if (config.headers['X-Requires-Auth']) {
          const { data: { session } } = await supabase.auth.getSession()
          const token = session?.access_token

          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
          
          // Remove the custom header
          delete config.headers['X-Requires-Auth']
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Setup response interceptor for global error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        // Handle common error scenarios
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          console.warn('Unauthorized request - token may be expired')
          // Optionally trigger logout or token refresh here
        }

        // Transform error to have consistent structure
        const errorMessage = error.response?.data?.message || error.message || 'Request failed'
        const customError = new Error(errorMessage)
        
        // Add status code to error for handling
        if (error.response) {
          ;(customError as any).status = error.response.status
          ;(customError as any).data = error.response.data
        }

        return Promise.reject(customError)
      }
    )
  }

  private createConfig(options: RequestOptions = {}): AxiosRequestConfig {
    const config: AxiosRequestConfig = {}

    if (options.requiresAuth) {
      // Add custom header to trigger auth interceptor
      config.headers = {
        'X-Requires-Auth': 'true',
      }
    }

    return config
  }

  async get<T>(url: string, requiresAuth = false): Promise<T> {
    const config = this.createConfig({ requiresAuth })
    const response = await this.api.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, requiresAuth = false): Promise<T> {
    const config = this.createConfig({ requiresAuth })
    const response = await this.api.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, requiresAuth = false): Promise<T> {
    const config = this.createConfig({ requiresAuth })
    const response = await this.api.put<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, requiresAuth = false): Promise<T> {
    const config = this.createConfig({ requiresAuth })
    const response = await this.api.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, requiresAuth = false): Promise<T> {
    const config = this.createConfig({ requiresAuth })
    const response = await this.api.delete<T>(url, config)
    return response.data
  }

  // Utility method to manually set auth token (if needed)
  setAuthToken(token: string | null) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete this.api.defaults.headers.common['Authorization']
    }
  }

  // Method to get the raw axios instance if needed for advanced usage
  getRawInstance(): AxiosInstance {
    return this.api
  }
}

export const apiService = new ApiService()