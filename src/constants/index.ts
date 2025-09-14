// Re-export all constants for clean imports
export * from './api'

// Query keys
export const QUERY_KEYS = {
  AUTH: {
    PROFILE: ['auth', 'profile'] as const,
    VERIFY: ['auth', 'verify'] as const,
  },
  CALCULATOR: {
    HISTORY: ['calculator', 'history'] as const,
    RESULT: ['calculator', 'result'] as const,
  },
  USER: {
    PROFILE: ['user', 'profile'] as const,
  },
} as const

// Cache times
export const CACHE_TIME = {
  SHORT: 1000 * 60 * 2,      // 2 minutes
  MEDIUM: 1000 * 60 * 5,     // 5 minutes
  LONG: 1000 * 60 * 15,      // 15 minutes
} as const

// App config
export const APP_CONFIG = {
  NAME: 'Bitwise Calculator',
  VERSION: '1.0.0',
} as const
