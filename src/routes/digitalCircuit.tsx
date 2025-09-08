import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/digitalCircuit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/digitalCircuit"!</div>
}
