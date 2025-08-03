import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import HomeHeader from '@/components/HomeHeader'
import LawsHeader from '@/components/LawsHeader'

function RootComponent() {
  const location = useLocation()
  const isLesson = location.pathname.startsWith('/lesson')
  const isLaws = location.pathname.startsWith('/laws')
  return (
    <>
      {!isLesson && !isLaws && <HomeHeader />}
      {isLaws && <LawsHeader />}
      <main>
        <Outlet />
      </main>
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
