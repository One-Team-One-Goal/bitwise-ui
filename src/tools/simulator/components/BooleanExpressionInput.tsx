import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Zap, X, Sparkles, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSimplify } from '@/hooks/useSimplify';
import { useNavigate } from '@tanstack/react-router';

// Predefined expression examples categorized by difficulty
const EXPRESSION_EXAMPLES = {
  easy: [
    'A∧B',
    'A∨B',
    '¬A',
    'A∧¬B',
    'A∨¬B',
    '¬(A∧B)',
    'A⊕B',
  ],
  medium: [
    '(A∧B)∨C',
    'A∧(B∨C)',
    '(A∨B)∧(C∨D)',
    '¬(A∨B)∧C',
    '(A⊕B)∧C',
    'A∧B∧C',
    '(¬A∨B)∧(A∨¬B)',
  ],
  hard: [
    '¬((A∨B)∧(¬C∨D))',
    '(A∧B)∨(C∧D)∨(E∧F)',
    '¬((A∨B)∧(¬C∨D))∨(E∧(A∨¬D))',
    '((A∧B)∨(C∧¬D))∧(¬E∨(F∧G))',
    '(A⊕B)∧(C⊕D)∨(E∧F)',
    '¬(((A∨B)∧C)∨((¬D∧E)∨F))',
    '(A∧(B∨C))∨(¬D∧(E∨(F∧G)))',
  ],
};

interface BooleanExpressionInputProps {
  onGenerateCircuit: (expression: string) => void;
  hasExistingCircuit?: boolean;
  onClose?: () => void;
}

export const BooleanExpressionInput: React.FC<BooleanExpressionInputProps> = ({
  onGenerateCircuit,
  hasExistingCircuit = false,
  onClose
}) => {
  const [expression, setExpression] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { simplify, isSimplifying, simplifiedExpression, error, isSimplified } = useSimplify();
  const navigate = useNavigate();

  const handleRandomExpression = (difficulty: 'easy' | 'medium' | 'hard') => {
    const examples = EXPRESSION_EXAMPLES[difficulty];
    const randomIndex = Math.floor(Math.random() * examples.length);
    const randomExpression = examples[randomIndex];
    setExpression(randomExpression);
    // Auto-validate the random expression
    setTimeout(() => simplify(randomExpression), 100);
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (expression.trim()) {
      await simplify(expression);
    }
  };

  const handleGenerateCircuit = () => {
    const exprToGenerate = simplifiedExpression || expression;
    if (exprToGenerate.trim()) {
      // If there's an existing circuit, show confirmation dialog
      if (hasExistingCircuit) {
        setShowConfirmDialog(true);
      } else {
        // No existing circuit, generate directly
        onGenerateCircuit(exprToGenerate);
        onClose?.();
      }
    }
  };

  const confirmGenerate = () => {
    const exprToGenerate = simplifiedExpression || expression;
    onGenerateCircuit(exprToGenerate);
    setShowConfirmDialog(false);
    onClose?.();
  };

  const getStatusIcon = () => {
    if (isSimplifying) {
      return <AlertCircle className="h-4 w-4 text-yellow-500 animate-spin" />;
    }
    if (error) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (simplifiedExpression) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  const getStatusBadge = () => {
    if (isSimplifying) {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Validating...</Badge>;
    }
    if (error) {
      return <Badge variant="outline" className="text-red-600 border-red-300">✗ Invalid</Badge>;
    }
    if (isSimplified) {
      return <Badge variant="outline" className="text-green-600 border-green-300">✓ Simplified</Badge>;
    }
    if (simplifiedExpression && !isSimplified) {
      return <Badge variant="outline" className="text-blue-600 border-blue-300">Can be simplified</Badge>;
    }
    return null;
  };

  return (
    <>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Existing Circuit?</AlertDialogTitle>
            <AlertDialogDescription>
              The canvas already contains components. Generating a new circuit will remove all existing components and connections. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmGenerate}>Yes, Generate New Circuit</AlertDialogAction>
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
            Enter a boolean expression to automatically generate its digital circuit
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleValidate} className="space-y-4">
            {/* Expression Input */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="e.g., A∧B, (A∨B)∧C, ¬(A∧B)∨C"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getStatusIcon()}
                </div>
              </div>
              <Button type="submit" disabled={isSimplifying || !expression.trim()}>
                Validate
              </Button>
            </div>

            {/* Random Expression Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 font-medium">Quick start:</span>
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
                    Simplified: <span className="font-mono text-blue-600">{simplifiedExpression}</span>
                  </span>
                )}
                {!error && isSimplified && (
                  <span className="text-sm text-green-700">Expression is already in simplified form!</span>
                )}
              </div>
              
              {/* Action Buttons */}
              {!error && simplifiedExpression && (
                <div className="flex flex-col gap-2">
                  {/* Expression Choice - Only show if can be simplified */}
                  {!isSimplified && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Generate from:</span>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7"
                          onClick={() => setExpression(expression)}
                        >
                          Original
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7"
                          onClick={() => setExpression(simplifiedExpression)}
                        >
                          Simplified
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center gap-2">
                    {/* Simplify Button - Only show if can be simplified */}
                    {!isSimplified && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-2"
                              onClick={() => {
                                navigate({ to: '/calculator' });
                                onClose?.();
                              }}
                            >
                              <Calculator className="h-4 w-4" />
                              View Simplification Steps
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Open Boolean Calculator to see step-by-step simplification</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {/* Generate Circuit Button */}
                    <Button onClick={handleGenerateCircuit} size="sm" className="flex items-center gap-2 ml-auto">
                      <Zap className="h-4 w-4" />
                      Generate Circuit
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Helper Text */}
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <strong>Syntax:</strong> Variables: A, B, C... | AND: ∧ | OR: ∨ | NOT: ¬ | XOR: ⊕ | Parentheses: ( )
          </div>
        </CardContent>
      </Card>
    </>
  );
};