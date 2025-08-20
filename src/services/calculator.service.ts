import { apiService } from './api.service';

export interface SimplificationStep {
  expression: string;
  law: string;
  lawName: string;
}

export interface SimplificationResult {
  originalExpression: string;
  simplifiedExpression: string;
  steps: SimplificationStep[];
  isValid: boolean;
}

export interface TruthTableRow {
  variables: Record<string, boolean>;
  result: boolean;
}

export interface TruthTableResult {
  expression: string;
  variables: string[];
  rows: TruthTableRow[];
}

export interface CalculationResponse<T = any> {
  success: boolean;
  result: T;
  error?: string;
}

export const CalculationOperation = {
  SIMPLIFY: 'simplify',
  EVALUATE: 'evaluate',
  TRUTH_TABLE: 'truthTable',
} as const;

export type CalculationOperationType = typeof CalculationOperation[keyof typeof CalculationOperation];

class CalculatorService {
  /**
   * Simplify a boolean expression and get step-by-step explanation
   */
  async simplify(expression: string): Promise<CalculationResponse<SimplificationResult>> {
    try {
      const response = await apiService.post('/calculator/simplify', { expression }) as any;
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        result: null as any,
        error: error.response?.data?.message || error.message || 'Failed to simplify expression',
      };
    }
  }

  /**
   * Evaluate a boolean expression with given variable values
   */
  async evaluate(
    expression: string,
    variables: Record<string, boolean>
  ): Promise<CalculationResponse<boolean>> {
    try {
      const response = await apiService.post('/calculator/evaluate', {
        expression,
        variables,
      }) as any;
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        result: null as any,
        error: error.response?.data?.message || error.message || 'Failed to evaluate expression',
      };
    }
  }

  /**
   * Generate truth table for a boolean expression
   */
  async generateTruthTable(expression: string): Promise<CalculationResponse<TruthTableResult>> {
    try {
      const response = await apiService.post('/calculator/truth-table', { expression }) as any;
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        result: null as any,
        error: error.response?.data?.message || error.message || 'Failed to generate truth table',
      };
    }
  }

  /**
   * General calculation method
   */
  async calculate(
    expression: string,
    operation: CalculationOperationType,
    variables?: Record<string, boolean>
  ): Promise<CalculationResponse> {
    try {
      const response = await apiService.post('/calculator/calculate', {
        expression,
        operation,
        variables,
      }) as any;
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        result: null,
        error: error.response?.data?.message || error.message || 'Calculation failed',
      };
    }
  }

  /**
   * Validate if an expression is syntactically correct
   */
  async validateExpression(expression: string): Promise<boolean> {
    try {
      const result = await this.simplify(expression);
      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * Get supported operators information
   */
  getSupportedOperators() {
    return {
      AND: ['∧', 'and', '^'],
      OR: ['∨', 'or', 'v'],
      NOT: ['¬', '~', '-', '!', 'not'],
      XOR: ['⊕', 'xor'],
      IMPLICATION: ['→', '->', 'then'],
      BICONDITIONAL: ['↔', '<->'],
    };
  }

  /**
   * Convert common operator representations to standard symbols
   */
  normalizeExpression(expression: string): string {
    return expression
      .replace(/\band\b/gi, '∧')
      .replace(/\bor\b/gi, '∨')
      .replace(/\bnot\b/gi, '¬')
      .replace(/\bxor\b/gi, '⊕')
      .replace(/\bthen\b/gi, '→')
      .replace(/->/g, '→')
      .replace(/<->/g, '↔')
      .replace(/~/g, '¬')
      .replace(/!/g, '¬')
      .replace(/\^/g, '∧')
      .replace(/v/g, '∨')
      .trim();
  }
}

export const calculatorService = new CalculatorService();