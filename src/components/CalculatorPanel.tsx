import React, { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { MathfieldElement } from 'mathlive'

const CalculatorPanel: React.FC = () => {
  const [input, setInput] = useState('')
  const mathfieldRef = useRef<MathfieldElement>(null)

  // Convert Boolean symbols to LaTeX for MathLive
  const toLatex = (expr: string) =>
    expr
      // NOT for parenthesis or group: !(...) or ¬(...)
      .replace(
        /(!|¬)\(([^)]+)\)/g,
        (_match, _not, group) => `\\overline{(${group})}`
      )
      // NOT for multiple letters: !AB or ¬AB
      .replace(
        /(!|¬)([A-Za-z]+)/g,
        (_match, _not, group) => `\\overline{${group}}`
      )
      // Boolean operators
      .replace(/∧/g, '\\land ')
      .replace(/∨/g, '\\lor ')
      .replace(/⊕/g, '\\oplus ')
      .replace(/⊼/g, '\\barwedge ')
      .replace(/⊽/g, '\\veebar ')
      .replace(/↔/g, '\\leftrightarrow ')
      .replace(/T/g, 'T')
      .replace(/F/g, 'F')

  // Convert LaTeX back to plain input for evaluation
  const fromLatex = (latex: string) =>
    latex
      .replace(/\\overline\{([A-Za-z])\}/g, '¬$1')
      .replace(/\\land/g, '∧')
      .replace(/\\lor/g, '∨')
      .replace(/\\oplus/g, '⊕')
      .replace(/\\barwedge/g, '⊼')
      .replace(/\\veebar/g, '⊽')
      .replace(/\\leftrightarrow/g, '↔')

  useEffect(() => {
    if (mathfieldRef.current) {
      mathfieldRef.current.value = toLatex(input)
    }
  }, [input])

  const handleButtonClick = (value: string) => {
    if (value === 'CLEAR') {
      setInput('')
    } else if (value === 'DEL') {
      setInput(input.slice(0, -1))
    } else if (value === 'RESULT') {
      try {
        toast.info('Result calculated!') // <-- Add this line
      } catch {
        toast.warning('Invalid expression!')
      }
    } else {
      setInput(input + value)
    }
  }

  const buttons = [
    { label: 'DEL', value: 'DEL', span: false },
    { label: '¬', value: '¬', span: false },
    { label: '(', value: '(', span: false },
    { label: ')', value: ')', span: false },
    { label: 'T', value: 'T', span: false },
    { label: 'F', value: 'F', span: false },
    { label: '∧', value: '∧', span: false },
    { label: '∨', value: '∨', span: false },
    { label: '⊕', value: '⊕', span: false },
    { label: '⊼', value: '⊼', span: false },
    { label: '⊽', value: '⊽', span: false },
    { label: '↔', value: '↔', span: false },
    { label: 'A', value: 'A', span: false },
    { label: 'B', value: 'B', span: false },
    { label: 'C', value: 'C', span: false },
    { label: 'CLR', value: 'CLEAR', span: false },
    { label: 'RESULT', value: 'RESULT', span: true },
    { label: 'X', value: 'X', span: false },
    { label: 'Y', value: 'Y', span: false },
  ]

  // Handle MathLive input change
  const handleMathfieldInput = (
    evt: React.ChangeEvent<HTMLInputElement> | Event
  ) => {
    const target = evt.target as MathfieldElement
    const latex = target.value
    setInput(fromLatex(latex))
  }

  return (
    <Card className="w-80 border-2 border-black rounded-lg box-shadow py-0">
      {/* Display */}
      <div className="rounded-lg py-10 px-8">
        <div className="text-right">
          <math-field
            ref={mathfieldRef}
            defaultValue={toLatex(input)}
            onInput={handleMathfieldInput}
            class="text-3xl font-bold text-gray-800 mb-1 min-h-[40px] bg-transparent outline-none border-none w-full"
            style={{ background: 'transparent', border: 'none' }}
            virtualKeyboardMode="off"
            toolbar="false"
          ></math-field>
        </div>
      </div>

      {/* Button Grid */}
      <div className="bg-gray-200 w-full h-full p-5 pt-15 rounded-lg rounded-t-2xl">
        <div className="grid grid-cols-4 gap-3">
          {buttons.map((button, index) => (
            <Button
              key={index}
              onClick={() => handleButtonClick(button.value)}
              className={`
                h-15 text-sm font-semibold rounded-md border-black
                text-gray-800 transition-all joinclass-shadow
                ${button.span ? 'col-span-2' : ''}
              `}
              variant="outline"
            >
              {button.label}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default CalculatorPanel
