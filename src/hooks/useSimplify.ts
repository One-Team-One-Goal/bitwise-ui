import { useState, useCallback } from 'react';
import { calculatorService } from '@/services/calculator.service';

export interface SimplificationState {
  isSimplifying: boolean;
  originalExpression: string;
  simplifiedExpression: string;
  error: string | null;
  isSimplified: boolean;
}

export const useSimplify = () => {
  const [state, setState] = useState<SimplificationState>({
    isSimplifying: false,
    originalExpression: '',
    simplifiedExpression: '',
    error: null,
    isSimplified: false,
  });

  const simplify = useCallback(async (expression: string) => {
    if (!expression.trim()) {
      setState({
        isSimplifying: false,
        originalExpression: '',
        simplifiedExpression: '',
        error: null,
        isSimplified: false,
      });
      return null;
    }

    setState(prev => ({
      ...prev,
      isSimplifying: true,
      error: null,
      originalExpression: expression,
    }));

    try {
      const result = await calculatorService.simplify(expression);

      if (!result.success) {
        setState(prev => ({
          ...prev,
          isSimplifying: false,
          error: result.error || 'Failed to simplify expression',
          simplifiedExpression: '',
          isSimplified: false,
        }));
        return null;
      }

      const originalExpr = result.result.originalExpression || expression;
      const simplifiedExpr = result.result.simplifiedExpression || expression;
      
      // Normalize expressions for comparison (remove spaces and redundant parentheses)
      const normalize = (expr: string) => {
        let normalized = expr.replace(/\s+/g, ''); // Remove all whitespace
        
        // Remove redundant outer parentheses recursively
        while (normalized.length > 2 && 
               normalized.startsWith('(') && 
               normalized.endsWith(')')) {
          // Check if these are truly outer parentheses (not needed for grouping)
          let depth = 0;
          let isOuter = true;
          for (let i = 1; i < normalized.length - 1; i++) {
            if (normalized[i] === '(') depth++;
            if (normalized[i] === ')') {
              depth--;
              if (depth < 0) {
                isOuter = false;
                break;
              }
            }
          }
          if (isOuter && depth === 0) {
            normalized = normalized.slice(1, -1);
          } else {
            break;
          }
        }
        
        return normalized;
      };
      
      const normalizedOriginal = normalize(originalExpr);
      const normalizedSimplified = normalize(simplifiedExpr);
      
      // If expressions are identical after normalization, it's already simplified
      const alreadySimplified = normalizedOriginal === normalizedSimplified;

      setState({
        isSimplifying: false,
        originalExpression: originalExpr,
        simplifiedExpression: simplifiedExpr,
        error: null,
        isSimplified: alreadySimplified,
      });

      return {
        original: originalExpr,
        simplified: simplifiedExpr,
        isSimplified: alreadySimplified,
      };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isSimplifying: false,
        error: error?.message || 'An error occurred during simplification',
        simplifiedExpression: '',
        isSimplified: false,
      }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isSimplifying: false,
      originalExpression: '',
      simplifiedExpression: '',
      error: null,
      isSimplified: false,
    });
  }, []);

  return {
    ...state,
    simplify,
    reset,
  };
};
