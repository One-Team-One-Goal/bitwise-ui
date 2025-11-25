import React from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Calculator, Binary, Cpu, Grid3X3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ToolSpotlightProps {
  tool: 'calculator' | 'converter' | 'circuit' | 'kmap'
  title?: string
  description?: string
}

const TOOLS = {
  calculator: {
    icon: Calculator,
    defaultTitle: 'Boolean Calculator',
    defaultDesc:
      'Simplify expressions instantly with step-by-step boolean algebra.',
    path: '/calculator',
    color: 'text-blue-600 dark:text-blue-400',
  },
  converter: {
    icon: Binary,
    defaultTitle: 'Number Converter',
    defaultDesc: 'Convert between Binary, Decimal, and Hexadecimal systems.',
    path: '/converter',
    color: 'text-green-600 dark:text-green-400',
  },
  circuit: {
    icon: Cpu,
    defaultTitle: 'Circuit Designer',
    defaultDesc:
      'Build and simulate digital logic circuits in a visual editor.',
    path: '/digitalCircuit',
    color: 'text-purple-600 dark:text-purple-400',
  },
  kmap: {
    icon: Grid3X3,
    defaultTitle: 'K-Map Solver',
    defaultDesc: 'Solve Karnaugh Maps visually to get simplified expressions.',
    path: '/karnaughMaps',
    color: 'text-orange-600 dark:text-orange-400',
  },
}

const ToolSpotlight: React.FC<ToolSpotlightProps> = ({
  tool,
  title,
  description,
}) => {
  const config = TOOLS[tool]
  const Icon = config.icon

  return (
    <Card className="group relative overflow-hidden border bg-card transition-all hover:shadow-md">
      <CardContent className="">
        <div className="flex items-start gap-4">
          <div
            className={`rounded-xl p-3 bg-background border shadow-sm ${config.color}`}
          >
            <Icon className="w-6 h-6" />
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-lg tracking-tight text-foreground">
              {title || config.defaultTitle}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description || config.defaultDesc}
            </p>

            <div className="pt-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="-ml-2 h-8 text-primary hover:bg-transparent hover:underline"
              >
                <Link to={config.path} className="flex items-center gap-2">
                  Try it now
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ToolSpotlight
