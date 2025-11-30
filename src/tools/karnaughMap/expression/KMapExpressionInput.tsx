import React, { useState, useEffect } from 'react';
import { Zap, Shuffle, CheckCircle, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { validateExpression, generateRandomExpression } from '@/utils/expressionEvaluator';

interface KMapExpressionInputProps {
  variableCount: number;
  onApplyExpression: (expression: string) => void;
  isProcessing?: boolean;
}

/**
 * Expression input component for K-map
 * Allows users to enter a Boolean expression or generate a random one
 */
export const KMapExpressionInput: React.FC<KMapExpressionInputProps> = ({
  variableCount,
  onApplyExpression,
  isProcessing = false,
}) => {
  const [expression, setExpression] = useState('');
  const [validation, setValidation] = useState<{
    valid: boolean;
    error?: string;
    variables?: string[];
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Validate expression when it changes (debounced)
  useEffect(() => {
    if (!expression.trim()) {
      setValidation(null);
      return;
    }

    setIsValidating(true);
    const timer = setTimeout(() => {
      const result = validateExpression(expression);
      
      // Check if expression variables exceed the current variable count
      if (result.valid && result.variables) {
        const maxVar = result.variables[result.variables.length - 1];
        const maxVarIndex = ['A', 'B', 'C', 'D', 'E'].indexOf(maxVar);
        if (maxVarIndex >= variableCount) {
          setValidation({
            valid: false,
            error: `Expression uses variable "${maxVar}" but K-map only has ${variableCount} variables (A-${['A', 'B', 'C', 'D', 'E'][variableCount - 1]})`,
          });
        } else {
          setValidation(result);
        }
      } else {
        setValidation(result);
      }
      setIsValidating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [expression, variableCount]);

  const handleRandomExpression = () => {
    const randomExpr = generateRandomExpression(variableCount);
    setExpression(randomExpr);
  };

  const handleApply = () => {
    if (validation?.valid && expression.trim()) {
      onApplyExpression(expression);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApply();
  };

  const insertSymbol = (symbol: string) => {
    setExpression(prev => prev + symbol);
  };

  const getStatusIcon = () => {
    if (isValidating) {
      return <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
    if (validation?.valid === false) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (validation?.valid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  const getStatusBadge = () => {
    if (isValidating) {
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
          Validating...
        </Badge>
      );
    }
    if (validation?.valid === false) {
      return (
        <Badge variant="outline" className="text-red-600 border-red-300">
          Invalid
        </Badge>
      );
    }
    if (validation?.valid) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-300">
          Valid ({validation.variables?.join(', ')})
        </Badge>
      );
    }
    return null;
  };

  const variables = ['A', 'B', 'C', 'D', 'E'].slice(0, variableCount);

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-yellow-500" />
          Expression Input
        </CardTitle>
        <CardDescription className="text-sm">
          Enter a Boolean expression to automatically fill the K-map, or generate a random one.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Available Variables */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Available variables:</span>
          <div className="flex gap-1">
            {variables.map((v) => (
              <Badge key={v} variant="secondary" className="font-mono">
                {v}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quick Insert Symbols */}
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
          <span className="text-xs font-medium text-muted-foreground w-full mb-1">
            Quick Insert:
          </span>
          {variables.map((v) => (
            <Button
              key={v}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 font-mono text-base p-0"
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
            className="h-8 px-2 font-mono"
            onClick={() => insertSymbol('∧')}
            title="AND"
          >
            ∧
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2 font-mono"
            onClick={() => insertSymbol('∨')}
            title="OR"
          >
            ∨
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2 font-mono"
            onClick={() => insertSymbol('¬')}
            title="NOT"
          >
            ¬
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2 font-mono"
            onClick={() => insertSymbol('(')}
          >
            (
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2 font-mono"
            onClick={() => insertSymbol(')')}
          >
            )
          </Button>
        </div>

        {/* Expression Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder={`e.g., ${variables[0]}∧${variables[1]}, (${variables[0]}∨${variables[1]})∧¬${variables[2] || variables[0]}`}
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                className="pr-10 font-mono text-base"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getStatusIcon()}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <div>{getStatusBadge()}</div>
            {validation?.error && (
              <span className="text-xs text-red-500">{validation.error}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleRandomExpression}
              className="flex-1"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Random
            </Button>
            <Button
              type="submit"
              disabled={!validation?.valid || isProcessing}
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isProcessing ? 'Applying...' : 'Apply to K-map'}
            </Button>
          </div>
        </form>

        {/* Helper Text */}
        <p className="text-xs text-muted-foreground">
          Supported operators: ∧ (AND), ∨ (OR), ¬ (NOT), or use: &amp;, |, !, *, +, ~
        </p>
      </CardContent>
    </Card>
  );
};

export default KMapExpressionInput;
