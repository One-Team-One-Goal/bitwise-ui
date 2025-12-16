import { createFileRoute } from '@tanstack/react-router'
import { CircuitSimulator } from '../tools/simulator'

export const Route = createFileRoute('/digitalCircuit')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="pt-20 w-full">
      <div className="h-[calc(100vh-5rem)] w-full overflow-hidden">
        <CircuitSimulator />
      </div>
    </div>
  )
}
