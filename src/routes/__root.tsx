import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import Header from '@/components/Header'

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  ),
})
