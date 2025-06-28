import LessonHeader from '@/components/LessonHeader'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lesson')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <LessonHeader progress={50} />
    </div>
  )
}
