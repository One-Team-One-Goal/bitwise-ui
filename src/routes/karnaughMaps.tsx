import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/karnaughMaps')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/karnaughMap"!</div>
}
