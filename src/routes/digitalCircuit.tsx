import { createFileRoute } from '@tanstack/react-router'
import { CircuitSimulator } from '../tools/simulator'

export const Route = createFileRoute('/digitalCircuit')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="h-screen lg:h-[calc(100vh-8rem)] w-full overflow-hidden lg:overflow-visible">
      <CircuitSimulator />
    </div>
  )
}
