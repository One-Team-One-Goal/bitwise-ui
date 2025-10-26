// ...existing code...
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { supabase } from '../utils/supabase'
import { HTTP_STATUS } from '../constants/api'

interface RequestOptions {
  requiresAuth?: boolean
}

class ApiService {
  private api: AxiosInstance
  private base: string

  constructor() {
    // Normalize base URL (remove trailing slashes)
    const rawBase = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api').toString()
    this.base = rawBase.replace(/\/+$/, '')

    // Create axios instance with normalized base
    this.api = axios.create({
      baseURL: this.base,
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Setup request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        if (config.headers && (config.headers as any)['X-Requires-Auth']) {
          const { data: { session } } = await supabase.auth.getSession()
          const token = session?.access_token

          if (token) {
            if (!config.headers) config.headers = {} as any
            ;(config.headers as Record<string, any>)['Authorization'] = `Bearer ${token}`
          }

          // Remove the custom header
          const headers = config.headers as Record<string, any>
          delete headers['X-Requires-Auth']
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
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          console.warn('Unauthorized request - token may be expired')
        }

        const errorMessage = error.response?.data?.message || error.message || 'Request failed'
        const customError = new Error(errorMessage)

        if (error.response) {
          ;(customError as any).status = error.response.status
          ;(customError as any).data = error.response.data
        }

        return Promise.reject(customError)
      }
    )
  }

  // Normalize path to avoid double "/api" when base already contains "/api"
  private normalizePath(url: string) {
    if (!url) return '/'
    // remove leading slashes
    let path = url.toString().replace(/^\/+/, '')

    // if base ends with '/api' and path starts with 'api/' or 'api', strip it
    if (this.base.toLowerCase().endsWith('/api')) {
      path = path.replace(/^api\/?/i, '')
    }

    // ensure single leading slash for axios relative path
    return path ? `/${path}` : '/'
  }

  private createConfig(options: RequestOptions = {}): AxiosRequestConfig {
    const config: AxiosRequestConfig = {}

    if (options.requiresAuth) {
      config.headers = {
        'X-Requires-Auth': 'true',
      }
    }

    return config
  }

  async get<T>(url: string, requiresAuth = false): Promise<T> {
    const config = this.createConfig({ requiresAuth })
    const normalized = this.normalizePath(url)
    const response = await this.api.get<T>(normalized, config)
    return response.data
  }

  async post<T>(url: string, data?: any, requiresAuth = false): Promise<T> {
    const config = this.createConfig({ requiresAuth })
    const normalized = this.normalizePath(url)
    const response = await this.api.post<T>(normalized, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, requiresAuth = false): Promise<T> {
    const config = this.createConfig({ requiresAuth })
    const normalized = this.normalizePath(url)
    const response = await this.api.put<T>(normalized, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, requiresAuth = false): Promise<T> {
    const config = this.createConfig({ requiresAuth })
    const normalized = this.normalizePath(url)
    const response = await this.api.patch<T>(normalized, data, config)
    return response.data
  }

  async delete<T>(url: string, requiresAuth = false): Promise<T> {
    const config = this.createConfig({ requiresAuth })
    const normalized = this.normalizePath(url)
    const response = await this.api.delete<T>(normalized, config)
    return response.data
  }

  setAuthToken(token: string | null) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete this.api.defaults.headers.common['Authorization']
    }
  }

  getRawInstance(): AxiosInstance {
    return this.api
  }
}

export const apiService = new ApiService()
// ...existing code...