import CalculatorPanel from '@/components/CalculatorPanel'
import FactoringDemo from '@/components/FactoringDemo'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/calculator')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="m-auto mt-30 flex flex-col sm:flex-col md:flex-col lg:flex-row w-2/3 min-h-[80vh] gap-20 p-4 ">
      <CalculatorPanel />
      <FactoringDemo />
    </div>
  )
}
