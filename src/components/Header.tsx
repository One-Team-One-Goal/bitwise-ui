import NavLogo from '@/assets/icons/nav-bar-logo.svg'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { Link, useLocation } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

const Header = () => {
  const isVisible = useScrollDirection()
  const location = useLocation()

  if (location.pathname === '/login' || location.pathname === '/signup') {
    return (
      <header className="z-50 fixed top-0 left-0 w-full h-24 flex items-center">
        <nav
          aria-label="Back"
          className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8 w-full"
        >
          <Link to="/" className="flex items-center">
            <Button variant="ghost" size="lg">
              <ChevronLeft />
              Back
            </Button>
          </Link>
        </nav>
      </header>
    )
  }

  return (
    <header
      className={`z-50 fixed top-0 left-0 w-full h-24 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-around p-6 lg:px-8"
      >
        <div className="flex">
          <Link to="/" className="-m-1.5 p-1.5">
            <img src={NavLogo} alt="My Icon" className="h-7" />
          </Link>
        </div>
        <div className="flex gap-20 m-auto">
          <Link to="/calculator">
            <Button
              variant={'link'}
              className="flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900"
            >
              Boolean Calculator
            </Button>
          </Link>
          <Link to="/converter">
            <Button
              variant={'link'}
              className="flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900"
            >
              Logic Circuit Converter
            </Button>
          </Link>
        </div>
        <Link to="/login">
          <Button variant={'bluezOutline'} size={'lg'}>
            Learn for free <span aria-hidden="true">&rarr;</span>
          </Button>
        </Link>
      </nav>
    </header>
  )
}

export default Header
