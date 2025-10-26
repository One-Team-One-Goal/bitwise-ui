// ...existing code...
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { supabase } from '../utils/supabase'

interface RequestOptions {
  requiresAuth?: boolean
}

class ApiService {
  private api: AxiosInstance
  private base: string

  constructor() {
    const rawBase = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api').toString()
    this.base = rawBase.replace(/\/+$/, '') // strip trailing slashes

    this.api = axios.create({
      baseURL: this.base,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    })

    this.api.interceptors.request.use(async (config) => {
      if (config.headers && (config.headers as any)['X-Requires-Auth']) {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (token) {
          if (config.headers) {
            // set Authorization on the existing headers object without replacing it
            (config.headers as Record<string, any>)['Authorization'] = `Bearer ${token}`
          } else {
            // ensure headers exist and assign Authorization
            config.headers = { Authorization: `Bearer ${token}` } as any
          }
        }
        delete (config.headers as Record<string, any>)['X-Requires-Auth']
      }
      return config
    })
  }

  // convert given path into a normalized relative path so axios baseURL + path never duplicate /api
  private normalizePath(url: string) {
    if (!url) return '/'
    let path = url.toString().replace(/^\/+/, '') // remove leading slashes
    if (this.base.toLowerCase().endsWith('/api')) {
      path = path.replace(/^api\/?/i, '') // strip leading 'api' from path
    }
    
    return path ? `/${path}` : '/'
  }

  private createConfig(options: RequestOptions = {}): AxiosRequestConfig {
    const cfg: AxiosRequestConfig = {}
    if (options.requiresAuth) cfg.headers = { 'X-Requires-Auth': 'true' }
    return cfg
  }

  async get<T = any>(url: string, requiresAuth = false): Promise<T> {
    const normalized = this.normalizePath(url)
    const res = await this.api.get<T>(normalized, this.createConfig({ requiresAuth }))
    return res.data
  }

  async post<T = any>(url: string, data?: any, requiresAuth = false): Promise<T> {
    const normalized = this.normalizePath(url)
    const res = await this.api.post<T>(normalized, data, this.createConfig({ requiresAuth }))
    return res.data
  }

  async patch<T = any>(url: string, data?: any, requiresAuth = false): Promise<T> {
    const normalized = this.normalizePath(url)
    const res = await this.api.patch<T>(normalized, data, this.createConfig({ requiresAuth }))
    return res.data
  }

  async delete<T = any>(url: string, requiresAuth = false): Promise<T> {
    const normalized = this.normalizePath(url)
    const res = await this.api.delete<T>(normalized, this.createConfig({ requiresAuth }))
    return res.data
  }

  setAuthToken(token: string | null) {
    if (token) this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    else delete this.api.defaults.headers.common['Authorization']
  }

  getRawInstance() {
    return this.api
  }
}

export const apiService = new ApiService()
// ...existing code...