import React, { useState } from 'react';
import { Calculator, Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { calculatorService } from '@/services/calculator.service';

interface ExpressionEvaluatorProps {
  initialExpression?: string;
  className?: string;
}

export const ExpressionEvaluator: React.FC<ExpressionEvaluatorProps> = ({ 
  initialExpression = '', 
  className = '' 
}) => {
  const [expression, setExpression] = useState(initialExpression);
  const [variables, setVariables] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract variables from expression
  React.useEffect(() => {
    if (expression) {
      const varMatches = expression.match(/[A-Z]/g);
      if (varMatches) {
        const uniqueVars = [...new Set(varMatches)];
        const newVars: Record<string, boolean> = {};
        uniqueVars.forEach(v => {
          newVars[v] = variables[v] ?? false;
        });
        setVariables(newVars);
      }
    }
  }, [expression]);

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await calculatorService.evaluate(expression, variables);
      if (response.success) {
        setResult(response.result);
      } else {
        setError(response.error || 'Evaluation failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleVariable = (varName: string) => {
    setVariables(prev => ({ ...prev, [varName]: !prev[varName] }));
  };

  const varNames = Object.keys(variables).sort();

  return (
    <Card className={className}>
      <CardHeader className="border-b bg-linear-to-r from-purple-600 to-indigo-600 text-white">
        <div className="flex items-center gap-3">
          <Calculator className="h-5 w-5" />
          <div>
            <CardTitle>Expression Evaluator</CardTitle>
            <CardDescription className="text-purple-100">
              Set variable values and evaluate the result
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Expression Input */}
        <div className="space-y-2">
          <Label htmlFor="eval-expression">Boolean Expression</Label>
          <Input
            id="eval-expression"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="e.g., (A ∧ B) ∨ ¬C"
            className="font-mono text-lg"
          />
        </div>

        {/* Variables */}
        {varNames.length > 0 && (
          <div className="space-y-3">
            <Label>Variable Values</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {varNames.map((varName) => (
                <div 
                  key={varName}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-violet-700">{varName}</span>
                    <span className="text-xs text-gray-500">=</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`var-${varName}`}
                      checked={variables[varName]}
                      onCheckedChange={() => toggleVariable(varName)}
                    />
                    <Badge 
                      variant={variables[varName] ? "default" : "outline"}
                      className={variables[varName] ? "bg-emerald-500" : "bg-red-500 text-white"}
                    >
                      {variables[varName] ? 'T' : 'F'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evaluate Button */}
        <Button
          onClick={handleEvaluate}
          disabled={!expression || loading || varNames.length === 0}
          className="w-full"
          size="lg"
        >
          <Calculator className="h-4 w-4 mr-2" />
          {loading ? 'Evaluating...' : 'Evaluate Expression'}
        </Button>

        {/* Result Display */}
        {result !== null && (
          <div className={`p-6 rounded-lg border-2 flex items-center justify-center gap-4 ${
            result 
              ? 'bg-emerald-50 border-emerald-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            {result ? (
              <>
                <Check className="h-8 w-8 text-emerald-600" />
                <div>
                  <div className="text-2xl font-bold text-emerald-700">TRUE</div>
                  <div className="text-sm text-emerald-600">Expression evaluates to true</div>
                </div>
              </>
            ) : (
              <>
                <X className="h-8 w-8 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-700">FALSE</div>
                  <div className="text-sm text-red-600">Expression evaluates to false</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpressionEvaluator;
