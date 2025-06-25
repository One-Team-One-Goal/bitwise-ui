import { routeTree } from './routeTree.gen'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from 'sonner'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return (
    <>
      <Toaster richColors />
      <RouterProvider router={router} />
      {import.meta.env.DEV && (
        <TanStackRouterDevtools router={router} position="bottom-right" />
      )}
    </>
  )
}

export default App
