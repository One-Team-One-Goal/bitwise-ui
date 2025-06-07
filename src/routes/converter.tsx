import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/converter')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/converter"!</div>
}
