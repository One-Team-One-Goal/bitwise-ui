# Supabase + TanStack Setup

## Structure

```
src/
├── utils/
│   ├── supabase.ts           # Supabase client configuration
│   └── supabaseHelpers.ts    # Helper functions for auth and database operations
├── hooks/
│   ├── useAuth.ts            # Custom auth hook
│   └── useSupabaseQueries.ts # TanStack Query hooks for Supabase
├── contexts/
│   └── AuthContext.tsx       # Auth context provider
└── components/
    └── ProtectedRoute.tsx    # Route guard component
```

## Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage Examples

### Public Routes (No Auth Required)
Routes like `/login`, `/signup`, `/`, `/about` etc. don't need any special setup. They work normally:

```tsx
// routes/index.tsx
export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return <div>Welcome! This is accessible to everyone.</div>
}
```

### Protected Routes (Auth Required)
Wrap your route component with `ProtectedRoute`:

```tsx
// routes/profile.tsx
import { ProtectedRoute } from '../components/ProtectedRoute'

export const Route = createFileRoute('/profile')({
  component: () => (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  ),
})
```

### Using Auth in Components
```tsx
import { useAuthContext } from '../contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, signOut } = useAuthContext()
  
  if (!isAuthenticated) {
    return <div>Please log in</div>
  }
  
  return (
    <div>
      <p>Welcome, {user?.email}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Using Supabase with TanStack Query
```tsx
import { useUserProfile, useUpdateUserProfile } from '../hooks/useSupabaseQueries'

function UserProfile() {
  const { user } = useAuthContext()
  const { data: profile, isLoading } = useUserProfile(user?.id)
  const updateProfile = useUpdateUserProfile()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      <h1>Profile</h1>
      <p>{profile?.name}</p>
      <button 
        onClick={() => updateProfile.mutate({ 
          userId: user!.id, 
          updates: { name: 'New Name' } 
        })}
      >
        Update Name
      </button>
    </div>
  )
}
```

### Manual Supabase Operations
```tsx
import { authService, dbService } from '../utils/supabaseHelpers'

// Sign in
const { data, error } = await authService.signIn(email, password)

// Get user profile
const { data: profile, error } = await dbService.getUserProfile(userId)
```

## Route Types

1. **Public Routes**: Accessible without authentication
   - `/login`, `/signup`, `/`, `/about`, etc.

2. **Protected Routes**: Require authentication, redirect to login if not authenticated
   - `/profile`, `/dashboard`, `/settings`, etc.

3. **Conditional Routes**: Show different content based on auth status
   ```tsx
   function HomePage() {
     const { isAuthenticated } = useAuthContext()
     
     return isAuthenticated ? <DashboardView /> : <LandingPageView />
   }
   ```
