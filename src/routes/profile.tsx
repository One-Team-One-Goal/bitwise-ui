import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { useAuthContext } from '../contexts/AuthContext'
import { useBackendProfile, useSignOut } from '../hooks/useAuthQueries'

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  )
}

function ProfilePage() {
  const { user } = useAuthContext()
  const { data: backendProfile, isLoading, error } = useBackendProfile()
  const signOutMutation = useSignOut()

  const handleSignOut = () => {
    signOutMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      
      {/* Frontend user data (from Supabase session) */}
      <div className="mb-6 p-4 border rounded-lg bg-blue-50">
        <h2 className="text-lg font-semibold mb-2">Frontend Session Data</h2>
        {user && (
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {/* Backend user data (from your NestJS API) */}
      <div className="mb-6 p-4 border rounded-lg bg-green-50">
        <h2 className="text-lg font-semibold mb-2">Backend Profile Data</h2>
        {error ? (
          <p className="text-red-600">Error loading backend profile: {error.message}</p>
        ) : backendProfile ? (
          <div className="space-y-2">
            <p><strong>Backend Email:</strong> {backendProfile.email}</p>
            <p><strong>Backend ID:</strong> {backendProfile.id}</p>
            <p><strong>Metadata:</strong> {JSON.stringify(backendProfile.metadata, null, 2)}</p>
          </div>
        ) : (
          <p>No backend profile data</p>
        )}
      </div>

      <button 
        onClick={handleSignOut}
        disabled={signOutMutation.isPending}
        className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded"
      >
        {signOutMutation.isPending ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  )
}
