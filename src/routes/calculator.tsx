import CalculatorOutput from '@/components/CalculatorOutput'
import CalculatorPanel from '@/components/CalculatorPanel'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/calculator')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="m-auto mt-30 flex flex-col md:flex-row w-2/3 min-h-[80vh] gap-4 p-4">
      <CalculatorPanel />
      <CalculatorOutput value="0" />
    </div>
  )
}
