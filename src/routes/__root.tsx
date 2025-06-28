import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import HomeHeader from '@/components/HomeHeader'

function RootComponent() {
  const location = useLocation()
  const isLesson = location.pathname.startsWith('/lesson')
  return (
    <>
      {!isLesson && <HomeHeader />}
      <main>
        <Outlet />
      </main>
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
