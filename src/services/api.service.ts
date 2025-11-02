import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { supabase } from '../utils/supabase'

interface RequestOptions {
  requiresAuth?: boolean
}

class ApiService {
  private api: AxiosInstance
  private baseURL: string

  constructor() {
    // Normalize baseURL: remove trailing slash to avoid duplicate slashes
    const rawBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    this.baseURL = rawBaseURL.replace(/\/+$/, '') // remove trailing slash

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Auth interceptor
    this.api.interceptors.request.use(async (config) => {
      if (config.headers['X-Requires-Auth']) {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (token) config.headers.Authorization = `Bearer ${token}`
        delete config.headers['X-Requires-Auth']
      }
      return config
    })

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
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

  private createConfig(options: RequestOptions = {}): AxiosRequestConfig {
    const config: AxiosRequestConfig = {}
    if (options.requiresAuth) {
      config.headers = { 'X-Requires-Auth': 'true' }
    }
    return config
  }

  private normalizePath(url: string) {
    // Remove leading slash if baseURL already ends with /api
    return url.replace(/^\/+/, '')
  }

  async get<T>(url: string, requiresAuth = false): Promise<T> {
    const path = this.normalizePath(url)
    const response = await this.api.get<T>(path, this.createConfig({ requiresAuth }))
    return response.data
  }

  async post<T>(url: string, data?: any, requiresAuth = false): Promise<T> {
    const path = this.normalizePath(url)
    const response = await this.api.post<T>(path, data, this.createConfig({ requiresAuth }))
    return response.data
  }

  async put<T>(url: string, data?: any, requiresAuth = false): Promise<T> {
    const path = this.normalizePath(url)
    const response = await this.api.put<T>(path, data, this.createConfig({ requiresAuth }))
    return response.data
  }

  async patch<T>(url: string, data?: any, requiresAuth = false): Promise<T> {
    const path = this.normalizePath(url)
    const response = await this.api.patch<T>(path, data, this.createConfig({ requiresAuth }))
    return response.data
  }

  async delete<T>(url: string, requiresAuth = false): Promise<T> {
    const path = this.normalizePath(url)
    const response = await this.api.delete<T>(path, this.createConfig({ requiresAuth }))
    return response.data
  }

  setAuthToken(token: string | null) {
    if (token) this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    else delete this.api.defaults.headers.common['Authorization']
  }

  getRawInstance(): AxiosInstance {
    return this.api
  }
}

export const apiService = new ApiService()
