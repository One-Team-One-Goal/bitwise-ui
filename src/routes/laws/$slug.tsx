import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/laws/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/laws/$slug"!</div>
}
