import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, AlertCircle, Zap, ChevronDown, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculatorService } from '@/services/calculator.service';

interface BooleanExpressionInputProps {
  onGenerateCircuit: (expression: string) => void;
}

export const BooleanExpressionInput: React.FC<BooleanExpressionInputProps> = ({
  onGenerateCircuit
}) => {
  const [expression, setExpression] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [simplifiedExpression, setSimplifiedExpression] = useState('');
  const [validationState, setValidationState] = useState<{
    status: 'idle' | 'checking' | 'valid' | 'invalid' | 'simplified' | 'not-simplified';
    message: string;
    isSimplified?: boolean;
  }>({
    status: 'idle',
    message: ''
  });

  const validateExpression = async (expr: string) => {
    if (!expr.trim()) {
      setValidationState({ status: 'idle', message: '' });
      return;
    }

    setValidationState({ status: 'checking', message: 'Validating and simplifying expression...' });
    
    try {
      console.log('🔄 Calling backend API with expression:', expr);
      
      // Call backend API directly with the expression (using mathematical symbols)
      const result = await calculatorService.simplify(expr);
      
      console.log('✅ Backend response:', result);
      
      if (!result.success) {
        console.error('❌ Validation failed:', result.error);
        setValidationState({
          status: 'invalid',
          message: result.error || 'Invalid expression. Please check your syntax.',
        });
        setSimplifiedExpression('');
        return;
      }
      
      const originalExpr = result.result.originalExpression || expr;
      const simplifiedExpr = result.result.simplifiedExpression || expr;
      
      console.log('📝 Original:', originalExpr, '| Simplified:', simplifiedExpr);
      
      // Check if expression was actually simplified
      const isSimplified = originalExpr === simplifiedExpr;
      
      if (isSimplified) {
        setValidationState({
          status: 'simplified',
          message: 'Expression is already in simplified form! Ready to generate circuit.',
          isSimplified: true
        });
        setSimplifiedExpression(simplifiedExpr);
      } else {
        setValidationState({
          status: 'not-simplified',
          message: `Simplified to: ${simplifiedExpr}`,
          isSimplified: false
        });
        setSimplifiedExpression(simplifiedExpr);
      }
    } catch (error) {
      console.error('🔥 Error during validation:', error);
      setValidationState({
        status: 'invalid',
        message: 'Failed to validate expression. Please try again.'
      });
      setSimplifiedExpression('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expression.trim()) {
      validateExpression(expression);
    }
  };

  const handleGenerateCircuit = () => {
    const exprToGenerate = simplifiedExpression || expression;
    if (exprToGenerate.trim()) {
      onGenerateCircuit(exprToGenerate);
    }
  };

  const getStatusIcon = () => {
    switch (validationState.status) {
      case 'checking':
        return <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'valid':
      case 'simplified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
      case 'not-simplified':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (validationState.status) {
      case 'checking':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Checking...</Badge>;
      case 'simplified':
        return <Badge variant="outline" className="text-green-600 border-green-300">✓ Simplified</Badge>;
      case 'not-simplified':
        return <Badge variant="outline" className="text-orange-600 border-orange-300">⚠ Needs Simplification</Badge>;
      case 'invalid':
        return <Badge variant="outline" className="text-red-600 border-red-300">✗ Invalid</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Boolean Expression to Circuit
        </CardTitle>
        <CardDescription>
          Enter a simplified boolean expression to automatically generate its digital circuit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="e.g., A∧B, A∨B∨C, (A∧B)∨(C∧D), ¬(A∧B)∨C, A⊕B"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getStatusIcon()}
              </div>
            </div>
            <Button type="submit" disabled={validationState.status === 'checking'}>
              Validate
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowExamples(!showExamples)}
                className="flex items-center gap-2"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
                Examples
              </Button>
              
              {showExamples && (
                <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[200px]">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-600 mb-2">Click to use:</div>
                    {[
                      'A∧B',
                      'A∨B∨C',
                      '(A∧B)∨(C∧D)',
                      '¬(A∧B)∨C',
                      'A⊕B',
                      '¬((A∨B)∧(¬C∨D))∨(E∧(A∨¬D))'
                    ].map((example, index) => (
                      <button
                        key={index}
                        type="button"
                        className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded font-mono"
                        onClick={() => {
                          setExpression(example);
                          setShowExamples(false);
                        }}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              //onClick={() => handleRandomExpression('easy')}
              disabled={validationState.status === 'checking'}
              className="flex items-center gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Easy
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              //onClick={() => handleRandomExpression('medium')}
              disabled={validationState.status === 'checking'}
              className="flex items-center gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Medium
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              //onClick={() => handleRandomExpression('hard')}
              disabled={validationState.status === 'checking'}
              className="flex items-center gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Hard
            </Button>
          </div>
        </form>

        {/* Status Display */}
        {validationState.message && (
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50 border">
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <span className="text-sm text-gray-700">{validationState.message}</span>
            </div>
            
            {/* Generate Circuit Button - Always show if we have a valid expression */}
            {(validationState.status === 'simplified' || validationState.status === 'not-simplified') && (
              <div className="flex justify-end">
                <Button onClick={handleGenerateCircuit} size="sm" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Generate Circuit
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Helper Text */}
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          <strong>Expression Format:</strong> Use variables A, B, C... | AND: ∧ | OR: ∨ | NOT: ¬ | XOR: ⊕ | Parentheses: ( )
          <br />
          <strong>Examples:</strong> A∧B, A∨B∨C, (A∧B)∨C, ¬(A∧B), A⊕B, ¬((A∨B)∧(¬C∨D))
        </div>

        {/* Simplification Note */}
        {validationState.status === 'not-simplified' && simplifiedExpression && (
          <div className="text-xs text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
            ✨ <strong>Simplified Expression Available:</strong> The circuit will be generated using the simplified form for optimal design.
          </div>
        )}
      </CardContent>
    </Card>
  );
};