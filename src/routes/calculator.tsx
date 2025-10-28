import { createFileRoute } from '@tanstack/react-router'
import FactoringDemo from '@/components/FactoringDemo'

export const Route = createFileRoute('/calculator')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="m-auto mt-10 flex flex-col w-full max-w-7xl min-h-[80vh] gap-10 p-4 px-6">
      <div className="text-center space-y-2">
        <h1 className='font-bold text-4xl bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
          Boolean Algebra Calculator
        </h1>
        <p className="text-gray-600">Simplify expressions step-by-step with visual animations</p>
      </div>

      <FactoringDemo />
    </div>
  )
}
