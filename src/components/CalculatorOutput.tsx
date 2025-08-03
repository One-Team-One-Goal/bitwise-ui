import React, { useRef, useEffect } from 'react'
import { distributivePrompt } from '../utils/data'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Step } from '../utils/data'
import gsap from 'gsap'
import { BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

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
  color: #9000FD;
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

const toKatex = (expr: string, animateParens = false) => {
  let out = expr
    .replace(/([A-Za-z0-9]+)'/g, '\\overline{$1}')
    .replace(/\*/g, ' \\cdot ')
    .replace(/\bAND\b/gi, ' \\cdot ')
    .replace(/\bOR\b/gi, ' + ')
    .replace(/F\([A-Za-z, ]+\)\s*=\s*/g, '')
    .replace(/F\s*=\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (animateParens) {
    // Use unique Unicode markers for ( and )
    out = out.replace(/\(/g, '\u2985').replace(/\)/g, '\u2986')
  }
  return out
}

const CalculatorOutput: React.FC<CalculatorOutputProps> = () => {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    stepRefs.current.forEach((ref) => {
      if (ref) {
        ref.querySelectorAll('.katex').forEach((katexEl) => {
          katexEl.innerHTML = katexEl.innerHTML
            .replace(/\u2985/g, '<span class="paren-animate inline-block">(</span>')
            .replace(/\u2986/g, '<span class="paren-animate inline-block">)</span>')
        })
        animateParentheses(ref)
      }
    })
  }, [])

  return (
    <Card className="calculator-output w-full border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">The expression to simplify:</CardTitle>
        <div className="text-base font-mono">
          <div className="px-[0.3rem] py-[0.2rem]">
            <BlockMath math={toKatex(distributivePrompt.expression, true)} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {distributivePrompt.steps.map((step, idx) => (
          <div
            key={idx}
            ref={el => stepRefs.current[idx] = el}
            className={
              step.type === 'final'
                ? 'mt-8'
                : idx !== 0
                ? 'my-8'
                : 'mb-8'
            }
          >
            <div className={step.type === 'final' ? 'font-semibold' : 'font-semibold mb-1'}>
              {getStepName(step.type, idx)}
            </div>
            <div className={step.type === 'final' ? 'font-mono text-lg' : 'font-mono'}>
              <div className="px-[0.3rem] py-[0.2rem]">
                <BlockMath math={toKatex(step.result, step.type === 'distributive')} />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default CalculatorOutput
