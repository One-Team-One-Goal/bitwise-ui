import React, { useRef, useEffect } from 'react'
import { distributivePrompt } from '../utils/data'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Step } from '../utils/data'
import gsap from 'gsap'

interface CalculatorOutputProps {
  value: string | number
}

// Map step type to human-readable name
const getStepName = (type: Step['type'], idx: number): string => {
  switch (type) {
    case 'distributive':
      return `Step ${idx + 1}: Apply the Distributive Law (Factoring)`
    case 'factoring':
      return `Step ${idx + 1}: Factoring Common Terms`
    case 'complement':
      return `Step ${idx + 1}: Apply the Complement Law (X + X' = 1)`
    case 'substitution':
      return `Step ${idx + 1}: Substitute Back`
    case 'identity':
      return `Step ${idx + 1}: Apply the Identity Law (X * 1 = X)`
    case 'final':
      return 'The simplified expression is:'
    default:
      return `Step ${idx + 1}`
  }
}

// Add this style for yellow parentheses
const style = `
.paren-animate {
  transition: color 0.2s;
  color: black;
}
.paren-animate-active {
  color: #FFD600;
}
`
if (
  typeof document !== 'undefined' &&
  !document.getElementById('paren-animate-style')
) {
  const styleTag = document.createElement('style')
  styleTag.id = 'paren-animate-style'
  styleTag.innerHTML = style
  document.head.appendChild(styleTag)
}

const animateParentheses = (container: HTMLDivElement | null) => {
  if (!container) return
  const parens = container.querySelectorAll('.paren-animate')
  gsap.fromTo(
    parens,
    { y: -30, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 1.5,
      ease: 'power2.out',
      repeat: -1,
      yoyo: true,
      repeatDelay: 2,
      onUpdate: function () {
        parens.forEach((el) => {
          const y = gsap.getProperty(el, 'y') as number
          if (y !== 0) {
            el.classList.add('paren-animate-active')
          } else {
            el.classList.remove('paren-animate-active')
          }
        })
      },
    }
  )
}

const CalculatorOutput: React.FC<CalculatorOutputProps> = () => {
  const distributiveRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ctx: gsap.Context | undefined
    if (distributiveRef.current) {
      ctx = gsap.context(() => {
        animateParentheses(distributiveRef.current)
      }, distributiveRef)
    }
    return () => ctx && ctx.revert()
  }, [])

  return (
    <Card className="calculator-output w-full border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">The expression to simplify:</CardTitle>
        <div className="text-base font-mono">
          <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem]">
            {distributivePrompt.expression}
          </code>
        </div>
      </CardHeader>
      <CardContent>
        {distributivePrompt.steps.map((step, idx) => {
          if (step.type === 'distributive') {
            // Animate parentheses for distributive step
            const result = step.result.split('').map((char, i) => {
              if (char === '(' || char === ')') {
                return (
                  <span key={i} className="paren-animate inline-block">
                    {char}
                  </span>
                )
              }
              return char
            })
            return (
              <div
                key={idx}
                ref={distributiveRef}
                className={idx !== 0 ? 'my-8' : 'mb-8'}
              >
                <div className="font-semibold mb-1">
                  {getStepName(step.type, idx)}
                </div>
                <div className="font-mono">
                  <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem]">
                    {result}
                  </code>
                </div>
              </div>
            )
          }
          return (
            <div
              key={idx}
              className={
                step.type === 'final' ? 'mt-8' : idx !== 0 ? 'my-8' : 'mb-8'
              }
            >
              <div
                className={
                  step.type === 'final' ? 'font-semibold' : 'font-semibold mb-1'
                }
              >
                {getStepName(step.type, idx)}
              </div>
              <div
                className={
                  step.type === 'final' ? 'font-mono text-lg' : 'font-mono'
                }
              >
                <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem]">
                  {step.result}
                </code>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default CalculatorOutput
