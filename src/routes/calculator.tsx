import FactoringDemo from '@/components/FactoringDemo'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/calculator')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="m-auto mt-10 flex flex-col w-2/3 min-h-[80vh] gap-10 p-4 ">
        <p className='font-semibold text-center text-3xl'>Boolean Algebra Calculator </p>
        <FactoringDemo />
    </div>
  )
}
