import { createFileRoute } from '@tanstack/react-router'
import { CircuitSimulator } from '../simulator'

export const Route = createFileRoute('/digitalCircuit')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <CircuitSimulator />
    </div>
  )
}
