import { createFileRoute } from '@tanstack/react-router'
import RightLanding001 from '@/assets/bg-icon/right_landing001.svg'
import LeftLanding001 from '@/assets/bg-icon/left_landing001.svg'
import { SignUpForm } from '@/components/forms/signup-form'

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <img
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
        }}
        draggable="false"
        src={RightLanding001}
        alt="My Icon"
        className="flex absolute h-100 md:h-full bottom-0 md:bottom-auto right-0 z-0"
      />
      <img
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
        }}
        draggable="false"
        src={LeftLanding001}
        alt="My Icon"
        className="flex absolute h-100 md:h-full left-0 z-0"
      />
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  )
}
