import React, { useState } from 'react'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  X,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useSimplify } from '@/hooks/useSimplify'

// Predefined expression examples categorized by difficulty
// Limited to max 5 variables (A, B, C, D, E) for all difficulties
const EXPRESSION_EXAMPLES = {
  easy: [
    'A∧B',           // Simple AND
    'A∨B',           // Simple OR
    '¬A',            // Simple NOT
    'A∧¬B',          // AND with negation
    'A∨¬B',          // OR with negation
    '¬(A∧B)',        // NAND
    '¬(A∨B)',        // NOR
  ],
  medium: [
    '(A∧B)∨C',              // 3 variables, AND-OR
    'A∧(B∨C)',              // 3 variables, distributive
    '(A∨B)∧(C∨D)',          // 4 variables, two OR groups
    '¬A∧B∧C',               // 3 variables with negation
    '(A∧B)∨(C∧D)',          // 4 variables, two AND groups
    '¬(A∨B)∧C',             // 3 variables, NOR then AND
    '(A∧¬B)∨(¬A∧B)',        // XOR implementation (3 vars effective)
  ],
  hard: [
    '(A∧B)∨(C∧D)∨E',                    // 5 variables, three terms
    '(A∨B)∧(C∨D)∧E',                    // 5 variables, three factors
    '¬((A∧B)∨(C∧D))∧E',                 // 5 variables with outer negation
    '(A∧B∧C)∨(D∧E)',                    // 5 variables, two AND groups
    '((A∨B)∧C)∨((D∨E)∧¬A)',             // 5 variables complex
    '(¬A∧B∧C)∨(A∧¬B∧D)∨(C∧E)',          // 5 variables, three product terms
    '((A∧B)∨C)∧((D∧E)∨¬C)',             // 5 variables with shared variable
  ],
}

interface BooleanExpressionInputProps {
  onGenerateCircuit: (expression: string, options?: { clearExisting?: boolean }) => void
  hasExistingCircuit?: boolean
  onClose?: () => void
}

export const BooleanExpressionInput: React.FC<BooleanExpressionInputProps> = ({
  onGenerateCircuit,
  hasExistingCircuit = false,
  onClose,
}) => {
  const [expression, setExpression] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { simplify, isSimplifying, simplifiedExpression, error, isSimplified } =
    useSimplify()

  const handleRandomExpression = (difficulty: 'easy' | 'medium' | 'hard') => {
    const examples = EXPRESSION_EXAMPLES[difficulty]
    const randomIndex = Math.floor(Math.random() * examples.length)
    const randomExpression = examples[randomIndex]
    setExpression(randomExpression)
    // Auto-validate the random expression
    setTimeout(() => simplify(randomExpression), 100)
  }

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (expression.trim()) {
      await simplify(expression)
    }
  }

  const handleGenerateCircuit = () => {
    const exprToGenerate = simplifiedExpression || expression
    if (exprToGenerate.trim()) {
      // If there's an existing circuit, show confirmation dialog
      if (hasExistingCircuit) {
        setShowConfirmDialog(true)
      } else {
        // No existing circuit, generate directly
        onGenerateCircuit(exprToGenerate)
        onClose?.()
      }
    }
  }

  const confirmGenerate = () => {
    const exprToGenerate = simplifiedExpression || expression
    onGenerateCircuit(exprToGenerate, { clearExisting: true })
    setShowConfirmDialog(false)
    onClose?.()
  }

  const getStatusIcon = () => {
    if (isSimplifying) {
      return <AlertCircle className="h-4 w-4 text-yellow-500 animate-spin" />
    }
    if (error) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    if (simplifiedExpression) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return null
  }

  const getStatusBadge = () => {
    if (isSimplifying) {
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
          Validating...
        </Badge>
      )
    }
    if (error) {
      return (
        <Badge variant="outline" className="text-red-600 border-red-300">
          ✗ Invalid
        </Badge>
      )
    }
    if (isSimplified) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-300">
          ✓ Simplified
        </Badge>
      )
    }
    if (simplifiedExpression && !isSimplified) {
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-300">
          Can be simplified
        </Badge>
      )
    }
    return null
  }

  return (
    <>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Circuit</AlertDialogTitle>
            <AlertDialogDescription>
              The canvas already contains components. Choose how you want to proceed:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const exprToGenerate = simplifiedExpression || expression
                // Pass clearExisting = false to keep existing circuit
                onGenerateCircuit(exprToGenerate, { clearExisting: false })
                setShowConfirmDialog(false)
                onClose?.()
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add to Existing
            </AlertDialogAction>
            <AlertDialogAction onClick={confirmGenerate} className="bg-destructive hover:bg-destructive/90">
              Replace Circuit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="w-full border-0 shadow-none relative">
        {/* Close Button */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Zap className="h-5 w-5 text-yellow-500" />
            Boolean Expression to Circuit
          </CardTitle>
          <CardDescription>
            Enter a boolean expression to automatically generate its digital
            circuit. Click symbols below to insert them.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Symbol Palette */}
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-xs font-semibold text-gray-600 w-full mb-1">
              Quick Insert:
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 min-w-[3.5rem] font-mono text-base"
              onClick={() => setExpression((prev) => prev + '∧')}
              title="AND operator (∧)"
            >
              ∧ <span className="ml-1 text-xs text-gray-500">AND</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 min-w-[3.5rem] font-mono text-base"
              onClick={() => setExpression((prev) => prev + '∨')}
              title="OR operator (∨)"
            >
              ∨ <span className="ml-1 text-xs text-gray-500">OR</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 min-w-[3.5rem] font-mono text-base"
              onClick={() => setExpression((prev) => prev + '¬')}
              title="NOT operator (¬)"
            >
              ¬ <span className="ml-1 text-xs text-gray-500">NOT</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 min-w-[3.5rem] font-mono text-base"
              onClick={() => setExpression((prev) => prev + '⊕')}
              title="XOR operator (⊕)"
            >
              ⊕ <span className="ml-1 text-xs text-gray-500">XOR</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 min-w-[2rem] font-mono text-base"
              onClick={() => setExpression((prev) => prev + '(')}
              title="Left parenthesis"
            >
              (
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 min-w-[2rem] font-mono text-base"
              onClick={() => setExpression((prev) => prev + ')')}
              title="Right parenthesis"
            >
              )
            </Button>
          </div>

          <form onSubmit={handleValidate} className="space-y-4">
            {/* Expression Input */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="e.g., A∧B, (A∨B)∧C, ¬(A∧B)∨C"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  className="pr-10 font-mono text-base"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getStatusIcon()}
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSimplifying || !expression.trim()}
              >
                Validate
              </Button>
            </div>

            {/* Random Expression Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 font-medium">
                Quick start:
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRandomExpression('easy')}
                disabled={isSimplifying}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-3 w-3" />
                Easy
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRandomExpression('medium')}
                disabled={isSimplifying}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-3 w-3" />
                Medium
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRandomExpression('hard')}
                disabled={isSimplifying}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-3 w-3" />
                Hard
              </Button>
            </div>
          </form>

          {/* Status Display */}
          {(error || simplifiedExpression) && (
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50 border">
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                {error && <span className="text-sm text-red-700">{error}</span>}
                {!error && simplifiedExpression && !isSimplified && (
                  <span className="text-sm text-gray-700">
                    Simplified:{' '}
                    <span className="font-mono text-blue-600">
                      {simplifiedExpression}
                    </span>
                  </span>
                )}
                {!error && isSimplified && (
                  <span className="text-sm text-green-700">
                    Expression is already in simplified form!
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              {!error && simplifiedExpression && (
                <div className="flex flex-col gap-2">
                  {/* Generate Circuit Button */}
                  <div className="flex justify-end items-center gap-2">
                    <Button
                      onClick={handleGenerateCircuit}
                      size="sm"
                      className="flex items-center gap-2"
                      variant={isSimplified ? 'default' : 'secondary'}
                    >
                      <Zap className="h-4 w-4" />
                      {isSimplified
                        ? 'Generate Circuit'
                        : 'Generate Simplified Circuit'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Symbol to Circuit Gate Legend */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2">
              <span className="text-gray-400 group-open:rotate-90 transition-transform">
                ▶
              </span>
              Symbol Reference & Circuit Gates
            </summary>
            <div className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 space-y-3">
              {/* AND Gate */}
              <div className="flex items-center gap-3 p-2 bg-background rounded-md shadow-sm">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <span className="font-mono text-2xl text-blue-600">∧</span>
                  <span className="text-sm font-semibold">AND</span>
                </div>
                <div className="flex-1 text-xs text-gray-600">
                  Output is HIGH only when <strong>all</strong> inputs are HIGH
                </div>
                <div className="px-3 py-1 bg-blue-100 rounded text-xs font-mono">
                  A∧B
                </div>
              </div>

              {/* OR Gate */}
              <div className="flex items-center gap-3 p-2 bg-background rounded-md shadow-sm">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <span className="font-mono text-2xl text-green-600">∨</span>
                  <span className="text-sm font-semibold">OR</span>
                </div>
                <div className="flex-1 text-xs text-gray-600">
                  Output is HIGH when <strong>any</strong> input is HIGH
                </div>
                <div className="px-3 py-1 bg-green-100 rounded text-xs font-mono">
                  A∨B
                </div>
              </div>

              {/* NOT Gate */}
              <div className="flex items-center gap-3 p-2 bg-background rounded-md shadow-sm">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <span className="font-mono text-2xl text-red-600">¬</span>
                  <span className="text-sm font-semibold">NOT</span>
                </div>
                <div className="flex-1 text-xs text-gray-600">
                  Output is the <strong>inverse</strong> of the input
                </div>
                <div className="px-3 py-1 bg-red-100 rounded text-xs font-mono">
                  ¬A
                </div>
              </div>

              {/* XOR Gate */}
              <div className="flex items-center gap-3 p-2 bg-background rounded-md shadow-sm">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <span className="font-mono text-2xl text-purple-600">⊕</span>
                  <span className="text-sm font-semibold">XOR</span>
                </div>
                <div className="flex-1 text-xs text-gray-600">
                  Output is HIGH when inputs are <strong>different</strong>
                </div>
                <div className="px-3 py-1 bg-purple-100 rounded text-xs font-mono">
                  A⊕B
                </div>
              </div>

              <div className="pt-2 border-t border-blue-200 text-xs text-gray-600">
                <strong>💡 Tip:</strong> Combine these symbols with parentheses
                to create complex logic circuits!
                <br />
                <strong>Example:</strong>{' '}
                <span className="font-mono bg-background px-2 py-1 rounded">
                  (A∧B)∨(¬C∧D)
                </span>{' '}
                creates a circuit with AND, OR, and NOT gates.
              </div>
            </div>
          </details>

          {/* Helper Text */}
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <strong>Syntax:</strong> Variables: A, B, C... | AND: ∧ | OR: ∨ |
            NOT: ¬ | XOR: ⊕ | Parentheses: ( )
          </div>
        </CardContent>
      </Card>
    </>
  )
}
