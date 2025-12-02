import { createFileRoute } from '@tanstack/react-router'
import FactoringDemo from '@/components/FactoringDemo'

export const Route = createFileRoute('/calculator')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="mt-30 flex flex-col w-full min-h-[80vh] md:gap-0">
      <div className="text-center px-4">
        <p className="font-semibold text-2xl sm:text-3xl md:text-3xl">
          Boolean Algebra Calculator
        </p>
        <p className="text-sm md:text-md text-muted-foreground">
          Simplify expressions step-by-step with visual animations
        </p>
      </div>

      <FactoringDemo />
    </div>
  )
}
