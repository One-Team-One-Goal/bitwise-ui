import { createFileRoute } from '@tanstack/react-router'
import FactoringDemo from '../components/FactoringDemo'

export const Route = createFileRoute('/converter')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className='h-32 w-full'></div>
      <FactoringDemo />
    </div>
  )
}
