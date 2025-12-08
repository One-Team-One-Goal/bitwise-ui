/**
 * Boolean Expression Evaluator for K-map Integration
 * Parses and evaluates Boolean expressions to generate truth table values
 */

import type { CellValue } from './karnaugh.utils';

export interface EvaluationResult {
  success: boolean;
  truthTable?: CellValue[];
  variables?: string[];
  error?: string;
}

/**
 * Tokenize the input expression
 */
function tokenize(expression: string): string[] {
  const tokens: string[] = [];
  let current = '';
  
  // Normalize the expression - convert various operator notations to standard form
  const normalized = expression
    .replace(/\s+/g, '') // Remove spaces
    // AND operators
    .replace(/∧/g, '&')
    .replace(/\*/g, '&')
    .replace(/\./g, '&')
    .replace(/·/g, '&')
    .replace(/\bAND\b/gi, '&')
    // OR operators
    .replace(/∨/g, '|')
    .replace(/\+/g, '|')
    .replace(/\bOR\b/gi, '|')
    // NOT operators
    .replace(/¬/g, '!')
    .replace(/'/g, '!')
    .replace(/~/g, '!')
    .replace(/\bNOT\b/gi, '!');
  
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    
    if (char === '(' || char === ')' || char === '&' || char === '|' || char === '!') {
      if (current) {
        tokens.push(current);
        current = '';
      }
      tokens.push(char);
    } else if (/[A-Za-z0-9]/.test(char)) {
      current += char;
    }
  }
  
  if (current) {
    tokens.push(current);
  }
  
  return tokens;
}

/**
 * Extract variables from tokens (sorted alphabetically)
 */
function extractVariables(tokens: string[]): string[] {
  const variables = new Set<string>();
  
  for (const token of tokens) {
    // Match single uppercase letters as variables
    if (/^[A-Z]$/i.test(token)) {
      variables.add(token.toUpperCase());
    }
  }
  
  // Sort alphabetically and return as array
  return Array.from(variables).sort();
}

/**
 * Convert infix to postfix notation (Shunting-yard algorithm)
 */
function infixToPostfix(tokens: string[]): string[] {
  const output: string[] = [];
  const operators: string[] = [];
  
  const precedence: Record<string, number> = {
    '!': 3, // NOT has highest precedence
    '&': 2, // AND
    '|': 1, // OR
  };
  
  const isOperator = (token: string) => token in precedence;
  const isVariable = (token: string) => /^[A-Za-z]$/.test(token);
  const isConstant = (token: string) => token === '0' || token === '1' || token === 'T' || token === 'F';
  
  for (const token of tokens) {
    if (isVariable(token) || isConstant(token)) {
      output.push(token);
    } else if (token === '(') {
      operators.push(token);
    } else if (token === ')') {
      while (operators.length > 0 && operators[operators.length - 1] !== '(') {
        output.push(operators.pop()!);
      }
      if (operators.length === 0) {
        throw new Error('Mismatched parentheses');
      }
      operators.pop(); // Remove '('
    } else if (isOperator(token)) {
      // Handle right-associativity for NOT
      if (token === '!') {
        operators.push(token);
      } else {
        while (
          operators.length > 0 &&
          operators[operators.length - 1] !== '(' &&
          precedence[operators[operators.length - 1]] >= precedence[token]
        ) {
          output.push(operators.pop()!);
        }
        operators.push(token);
      }
    }
  }
  
  while (operators.length > 0) {
    const op = operators.pop()!;
    if (op === '(' || op === ')') {
      throw new Error('Mismatched parentheses');
    }
    output.push(op);
  }
  
  return output;
}

/**
 * Evaluate postfix expression with given variable values
 */
function evaluatePostfix(postfix: string[], values: Record<string, boolean>): boolean {
  const stack: boolean[] = [];
  
  for (const token of postfix) {
    if (/^[A-Za-z]$/.test(token)) {
      // Variable
      const value = values[token.toUpperCase()];
      if (value === undefined) {
        throw new Error(`Undefined variable: ${token}`);
      }
      stack.push(value);
    } else if (token === '0' || token === 'F') {
      stack.push(false);
    } else if (token === '1' || token === 'T') {
      stack.push(true);
    } else if (token === '!') {
      // NOT
      if (stack.length < 1) throw new Error('Invalid expression');
      const operand = stack.pop()!;
      stack.push(!operand);
    } else if (token === '&') {
      // AND
      if (stack.length < 2) throw new Error('Invalid expression');
      const right = stack.pop()!;
      const left = stack.pop()!;
      stack.push(left && right);
    } else if (token === '|') {
      // OR
      if (stack.length < 2) throw new Error('Invalid expression');
      const right = stack.pop()!;
      const left = stack.pop()!;
      stack.push(left || right);
    }
  }
  
  if (stack.length !== 1) {
    throw new Error('Invalid expression');
  }
  
  return stack[0];
}

/**
 * Generate all possible variable combinations for n variables
 */
function generateCombinations(variables: string[]): Record<string, boolean>[] {
  const n = variables.length;
  const count = Math.pow(2, n);
  const combinations: Record<string, boolean>[] = [];
  
  for (let i = 0; i < count; i++) {
    const combo: Record<string, boolean> = {};
    for (let j = 0; j < n; j++) {
      // MSB first (A is most significant)
      combo[variables[j]] = Boolean((i >> (n - 1 - j)) & 1);
    }
    combinations.push(combo);
  }
  
  return combinations;
}

/**
 * Evaluate a Boolean expression and return truth table values
 * @param expression The Boolean expression to evaluate
 * @param targetVariables Optional: specific variables to use (must be >= expression variables)
 * @returns Evaluation result with truth table values
 */
export function evaluateExpression(
  expression: string,
  targetVariables?: string[]
): EvaluationResult {
  try {
    if (!expression.trim()) {
      return { success: false, error: 'Expression cannot be empty' };
    }
    
    // Tokenize and extract variables
    const tokens = tokenize(expression);
    const exprVariables = extractVariables(tokens);
    
    if (exprVariables.length === 0) {
      return { success: false, error: 'No variables found in expression' };
    }
    
    // Use target variables if provided, otherwise use expression variables
    const variables = targetVariables || exprVariables;
    
    // Validate that all expression variables are in target variables
    for (const v of exprVariables) {
      if (!variables.includes(v)) {
        return { 
          success: false, 
          error: `Variable "${v}" not in target variables [${variables.join(', ')}]` 
        };
      }
    }
    
    // Convert to postfix
    const postfix = infixToPostfix(tokens);
    
    // Generate all combinations for the variables
    const combinations = generateCombinations(variables);
    
    // Evaluate for each combination
    const truthTable: CellValue[] = combinations.map(combo => {
      const result = evaluatePostfix(postfix, combo);
      return result ? 1 : 0;
    });
    
    return {
      success: true,
      truthTable,
      variables,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to evaluate expression',
    };
  }
}

/**
 * Validate a Boolean expression without full evaluation
 */
export function validateExpression(expression: string): { valid: boolean; error?: string; variables?: string[] } {
  try {
    if (!expression.trim()) {
      return { valid: false, error: 'Expression cannot be empty' };
    }
    
    const tokens = tokenize(expression);
    const variables = extractVariables(tokens);
    
    if (variables.length === 0) {
      return { valid: false, error: 'No variables found in expression' };
    }
    
    if (variables.length > 5) {
      return { valid: false, error: 'Maximum 5 variables supported (A-E)' };
    }
    
    // Try to convert to postfix (validates syntax)
    infixToPostfix(tokens);
    
    return { valid: true, variables };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid expression syntax',
    };
  }
}

/**
 * Random expression generator for K-map
 */
export function generateRandomExpression(variableCount: number): string {
  const variables = ['A', 'B', 'C', 'D', 'E'].slice(0, variableCount);
  
  const easyExpressions = [
    () => `${variables[0]}∧${variables[1]}`,
    () => `${variables[0]}∨${variables[1]}`,
    () => `¬${variables[0]}`,
    () => `${variables[0]}∧¬${variables[1]}`,
    () => `¬(${variables[0]}∧${variables[1]})`,
  ];
  
  const mediumExpressions = [
    () => `(${variables[0]}∧${variables[1]})∨${variables[2] || variables[0]}`,
    () => `${variables[0]}∧(${variables[1]}∨${variables[2] || '¬' + variables[1]})`,
    () => `(${variables[0]}∨${variables[1]})∧(${variables[2] || variables[0]}∨${variables[1]})`,
    () => `¬(${variables[0]}∨${variables[1]})∧${variables[2] || variables[0]}`,
  ];
  
  const hardExpressions = [
    () => `¬((${variables[0]}∨${variables[1]})∧(¬${variables[2] || variables[0]}∨${variables[3] || variables[1]}))`,
    () => `(${variables[0]}∧${variables[1]})∨(${variables[2] || variables[0]}∧${variables[3] || '¬' + variables[1]})`,
    () => `(${variables[0]}∧${variables[1]})∨(¬${variables[0]}∧¬${variables[1]})`,
  ];
  
  // Choose complexity based on variable count
  let pool: (() => string)[];
  if (variableCount <= 2) {
    pool = easyExpressions;
  } else if (variableCount <= 3) {
    pool = [...easyExpressions, ...mediumExpressions];
  } else {
    pool = [...mediumExpressions, ...hardExpressions];
  }
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex]();
}
