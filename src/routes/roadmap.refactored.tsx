import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/roadmap/refactored')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/roadmap/refactored"!</div>
}
