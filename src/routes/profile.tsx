import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { useAuthContext } from '../contexts/AuthContext'
import { useBackendProfile } from '../hooks/useAuthQueries'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

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
  const { data: backendProfile, isLoading } = useBackendProfile()
  //const signOutMutation = useSignOut()

  // const handleSignOut = () => {
  //   signOutMutation.mutate()
  // }

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

  const md = backendProfile?.metadata ?? {}
  // prefer backend/provider avatar; use undefined when not available so AvatarFallback renders
  const avatar =
    md?.avatar_url ?? md?.picture ?? user?.user_metadata?.picture ?? undefined
  const displayName =
    md.full_name ??
    md.name ??
    user?.user_metadata?.full_name ??
    user?.email ??
    'Unknown'
  const providerId = md.provider_id ?? md.sub ?? backendProfile?.id ?? 'N/A'

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-3xl mx-auto bg-background dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold">Profile</p>
            <p className="text-sm text-muted-foreground mt-1">
              Account details and connected provider metadata
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-10 items-center">
          <div className="flex-shrink-0 ml-4 mb-14">
            <Avatar className="h-24 w-24">
              {avatar ? (
                <AvatarImage
                  src={avatar}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <AvatarFallback className="text-xl text-gray-500">
                  {(displayName || '?').charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          <div className="flex-1">
            <p className="text-xl font-semibold">{displayName}</p>
            <p className="text-sm text-muted-foreground">
              {backendProfile?.email ?? user?.email}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Provider</div>
                <div className="font-medium">
                  {md.iss ?? 'Supabase / Google'}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Provider ID</div>
                <div className="font-medium">{providerId}</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">
                  Email verified
                </div>
                <div className="font-medium">
                  {String(md.email_verified ?? false)}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">
                  Phone verified
                </div>
                <div className="font-medium">
                  {String(md.phone_verified ?? false)}
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              <div className="mt-1">
                <strong>Created:</strong>{' '}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
