import { routeTree } from './routeTree.gen'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return (
    <>
      <RouterProvider router={router} />
      {import.meta.env.DEV && (
        <TanStackRouterDevtools router={router} position="bottom-right" />
      )}
    </>
  )
}

export default App
