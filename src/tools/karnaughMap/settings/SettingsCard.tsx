import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Settings,
  Shuffle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  validateExpression,
  generateRandomExpression,
} from '@/utils/expressionEvaluator'
import { Separator } from '@/components/ui/separator'

interface SettingsCardProps {
  variableCount: number
  formType: string
  onVariableCountChange: (count: number) => void
  onFormTypeChange: (type: string) => void
  onSetAllCells: (value: number | string) => void
  onApplyExpression: (expression: string) => void
  isProcessing?: boolean
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  variableCount,
  formType,
  onVariableCountChange,
  onFormTypeChange,
  onSetAllCells,
  onApplyExpression,
  isProcessing = false,
}) => {
  const [expression, setExpression] = useState('')
  const [validation, setValidation] = useState<{
    valid: boolean
    error?: string
    variables?: string[]
  } | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Validate expression when it changes (debounced)
  useEffect(() => {
    if (!expression.trim()) {
      setValidation(null)
      return
    }

    setIsValidating(true)
    const timer = setTimeout(() => {
      const result = validateExpression(expression)

      // Check if expression variables exceed the current variable count
      if (result.valid && result.variables) {
        const maxVar = result.variables[result.variables.length - 1]
        const maxVarIndex = ['A', 'B', 'C', 'D', 'E'].indexOf(maxVar)
        if (maxVarIndex >= variableCount) {
          setValidation({
            valid: false,
            error: `Expression uses variable "${maxVar}" but K-map only has ${variableCount} variables (A-${['A', 'B', 'C', 'D', 'E'][variableCount - 1]})`,
          })
        } else {
          setValidation(result)
        }
      } else {
        setValidation(result)
      }
      setIsValidating(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [expression, variableCount])

  const handleRandomExpression = () => {
    const randomExpr = generateRandomExpression(variableCount)
    setExpression(randomExpr)
  }

  const handleApply = () => {
    if (validation?.valid && expression.trim()) {
      onApplyExpression(expression)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleApply()
  }

  const insertSymbol = (symbol: string) => {
    setExpression((prev) => prev + symbol)
  }

  const getStatusIcon = () => {
    if (isValidating) {
      return <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />
    }
    if (validation?.valid === false) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    if (validation?.valid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return null
  }

  const getStatusBadge = () => {
    if (isValidating) {
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
          Validating...
        </Badge>
      )
    }
    if (validation?.valid === false) {
      return (
        <Badge variant="outline" className="text-red-600 border-red-300">
          Invalid
        </Badge>
      )
    }
    if (validation?.valid) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-300">
          Valid ({validation.variables?.join(', ')})
        </Badge>
      )
    }
    return null
  }

  const variables = ['A', 'B', 'C', 'D', 'E'].slice(0, variableCount)
  return (
    <Card className="w-full max-w-md border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Karnaugh Map Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Variable Count Selection (Tabs) */}
        <div className="space-y-3" data-tour="variable-count">
          <p className="text-sm font-medium text-muted-foreground">
            Choose number of variables:
          </p>
          <Tabs
            value={String(variableCount)}
            onValueChange={(val) => onVariableCountChange(Number(val))}
          >
            <TabsList className="w-full">
              {['2', '3', '4', '5'].map((v) => (
                <TabsTrigger key={v} value={v} className="px-3 py-1">
                  {v}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Form Type Selection (Tabs) */}
        <div className="space-y-3" data-tour="form-type">
          <p className="text-sm font-medium text-muted-foreground">
            Form: {formType}
          </p>
          <Tabs value={formType} onValueChange={(val) => onFormTypeChange(val)}>
            <TabsList className="w-full">
              {['SOP', 'POS'].map((type) => (
                <TabsTrigger key={type} value={type} className="px-3 py-1">
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Set All Cells */}
        <div className="space-y-3" data-tour="set-all">
          <p className="text-sm font-medium text-muted-foreground">
            Set all cells to:
          </p>
          <div className="flex gap-2">
            {[0, 1, 'X'].map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                onClick={() => onSetAllCells(value)}
                className="flex-1"
              >
                {value}
              </Button>
            ))}
          </div>
        </div>

        <Separator className="mt-5" />

        {/* Expression Input Section */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Boolean Expression to K-Map:
          </p>
          {/* Expression Input Form */}
          <form onSubmit={handleSubmit} className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder={`e.g., ${variables[0]}∧${variables[1]}, (${variables[0]}∨${variables[1]})∧¬${variables[2] || variables[0]}`}
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  className="pr-10 text-sm"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getStatusIcon()}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="mr-2">{getStatusBadge()}</div>
              {validation?.error && (
                <span className="text-xs text-red-500">{validation.error}</span>
              )}
            </div>

            {/* Quick Insert Symbols */}
            <div className="flex flex-wrap gap-2 mb-6">
              {variables.map((v) => (
                <Button
                  key={v}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 text-sm p-3 font-mono"
                  onClick={() => insertSymbol(v)}
                >
                  {v}
                </Button>
              ))}
              <div className="w-px bg-border mx-1" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-sm p-3 font-mono"
                onClick={() => insertSymbol('∧')}
                title="AND"
              >
                ∧
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-sm p-3 font-mono"
                onClick={() => insertSymbol('∨')}
                title="OR"
              >
                ∨
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-sm p-3 font-mono"
                onClick={() => insertSymbol('¬')}
                title="NOT"
              >
                ¬
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-sm p-3 font-mono"
                onClick={() => insertSymbol('(')}
              >
                (
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-sm p-3 font-mono"
                onClick={() => insertSymbol(')')}
              >
                )
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleRandomExpression}
                size="sm"
                className="flex-1"
              >
                <Shuffle className="h-3 w-3 mr-2" />
                Random
              </Button>
              <Button
                type="submit"
                disabled={!validation?.valid || isProcessing}
                size="sm"
                className="flex-1"
              >
                <Sparkles className="h-3 w-3 mr-2" />
                {isProcessing ? 'Applying...' : 'Apply'}
              </Button>
            </div>
          </form>

          {/* Helper Text */}
          <p className="text-xs text-muted-foreground">
            Operators: ∧ (AND), ∨ (OR), ¬ (NOT), or: &amp;, |, !, *, +, ~
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default SettingsCard
