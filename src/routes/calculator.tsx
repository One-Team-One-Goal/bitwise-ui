import { createFileRoute } from '@tanstack/react-router'
import FactoringDemo from '@/components/FactoringDemo'

export const Route = createFileRoute('/calculator')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="m-auto mt-20 flex flex-col w-full max-w-7xl min-h-[80vh] gap-10 p-4 px-6">
      <div className="text-center space-y-2">
        <h1 className='font-bold text-4xl text-primary dark:text-primary'>
          Boolean Algebra Calculator
        </h1>
        <p className="text-muted-foreground">Simplify expressions step-by-step with visual animations</p>
      </div>

      <FactoringDemo />
    </div>
  )
}
