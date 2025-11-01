import { createFileRoute } from '@tanstack/react-router'
import FactoringDemo from '@/components/FactoringDemo'

export const Route = createFileRoute('/calculator')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="m-auto mt-30 flex flex-col w-full max-w-7xl min-h-[80vh] md:gap-10 p-4 md:p-6">
      <div className="text-center space-y-2 px-4">
        <h1 className='font-bold text-2xl sm:text-3xl md:text-4xl bg-linear-to-r from-primary to-accent bg-clip-text text-transparent dark:from-primary dark:to-accent'>
          Boolean Algebra Calculator
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">Simplify expressions step-by-step with visual animations</p>
      </div>

      <FactoringDemo />
    </div>
  )
}
