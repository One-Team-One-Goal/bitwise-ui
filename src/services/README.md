# Axios-Based API Service Setup

## Overview

Your frontend now uses **Axios** instead of fetch for all API communications with your NestJS backend. This provides better error handling, interceptors, and a more robust HTTP client.

## Key Features

✅ **Automatic Token Management**: Tokens are automatically added to requests that require auth  
✅ **Request/Response Interceptors**: Global error handling and request modification  
✅ **Type Safety**: Full TypeScript support with proper error types  
✅ **Clean Service Layer**: Organized services for different features  
✅ **React Query Integration**: Optimized caching and state management  

## Architecture

```
React Components
       ↓
React Query Hooks (useAuthQueries, useCalculatorQueries)
       ↓
Service Layer (auth.service.ts, calculator.service.ts)
       ↓
API Service (api.service.ts with Axios)
       ↓
NestJS Backend
```

## Usage Examples

### 1. Basic API Call (No Auth)
```typescript
const result = await apiService.post('/calculator/basic', {
  operation: 'add',
  values: [2, 3]
}, false) // false = no auth required
```

### 2. Authenticated API Call
```typescript
const profile = await apiService.get('/auth/profile', true) // true = auth required
```

### 3. Using React Query Hooks
```typescript
function MyComponent() {
  const { data, isLoading } = useCalculationHistory() // Automatically handles auth
  const basicCalc = useBasicCalculation()
  
  const handleCalculate = () => {
    basicCalc.mutate({ operation: 'add', values: [5, 10] })
  }
  
  return (
    <div>
      {isLoading ? 'Loading...' : data?.map(calc => <div key={calc.id}>{calc.result}</div>)}
      <button onClick={handleCalculate}>Calculate</button>
    </div>
  )
}
```

### 4. Error Handling
```typescript
// Automatic error handling with toast notifications
const signIn = useSignIn()

signIn.mutate({ email, password }) // Errors automatically show toast
```

## Service Organization

### `services/api.service.ts`
- Axios instance configuration
- Request/response interceptors
- Automatic token management
- Global error handling

### `services/auth.service.ts`
- Authentication operations
- Frontend: Direct Supabase (login/signup)
- Backend: API calls through Axios

### `services/calculator.service.ts`
- Calculator-specific operations
- Example of how to create feature services

### `hooks/useAuthQueries.ts`
- React Query hooks for auth operations
- Automatic error handling with toasts

### `hooks/useCalculatorQueries.ts`
- React Query hooks for calculator operations
- Cache management and invalidation

## Configuration

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Axios Configuration
```typescript
// Base URL and timeout are set in api.service.ts
const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  timeout: 10000,
})
```

## Error Handling

### Frontend Errors
- Automatic toast notifications
- Type-safe error objects
- Consistent error structure

### Backend Errors
- HTTP status code handling
- Custom error messages
- Automatic retry logic (configurable)

## Best Practices

1. **Use service functions**: Don't call `apiService` directly from components
2. **Use React Query hooks**: Let hooks handle caching and error states
3. **Handle loading states**: Always show loading indicators
4. **Toast notifications**: Already built into mutation hooks
5. **Type everything**: Use TypeScript interfaces for all data

## Testing

Mock the services for testing:
```typescript
// Mock auth service
jest.mock('../services/auth.service', () => ({
  authService: {
    signIn: jest.fn(),
    getProfile: jest.fn(),
  }
}))
```

This setup gives you a production-ready, scalable frontend architecture! 🚀
