/**
 * Boolean Expression Parser and Circuit Generator
 * Converts boolean algebraic expressions into circuit components
 */

export type Operator = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'XNOR';

export interface ExpressionNode {
  type: 'variable' | 'operator' | 'constant';
  value: string;
  operator?: Operator;
  left?: ExpressionNode;
  right?: ExpressionNode;
  negated?: boolean;
}

export interface ParseResult {
  success: boolean;
  tree?: ExpressionNode;
  error?: string;
  variables: string[];
}

/**
 * Tokenize the input expression
 */
function tokenize(expression: string): string[] {
  const tokens: string[] = [];
  let current = '';
  
  // Normalize the expression
  const normalized = expression
    .replace(/\s+/g, '') // Remove spaces
    .replace(/∧/g, '&') // AND symbols
    .replace(/\*/g, '&')
    .replace(/\./g, '&')
    .replace(/·/g, '&')
    .replace(/∨/g, '|') // OR symbols
    .replace(/\+/g, '|')
    .replace(/¬/g, '!') // NOT symbols
    .replace(/'/g, '!')
    .replace(/~/g, '!')
    .replace(/⊕/g, '^') // XOR symbol
    .replace(/⊼/g, '⊼') // NAND
    .replace(/⊽/g, '⊽'); // NOR
  
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    
    if (char === '(' || char === ')' || char === '&' || char === '|' || char === '!' || 
        char === '^' || char === '⊼' || char === '⊽') {
      if (current) {
        tokens.push(current);
        current = '';
      }
      tokens.push(char);
    } else if (/[A-Za-z0-9]/.test(char)) {
      current += char;
    } else if (char !== ' ') {
      throw new Error(`Invalid character: ${char}`);
    }
  }
  
  if (current) {
    tokens.push(current);
  }
  
  return tokens;
}

/**
 * Convert infix notation to postfix (Reverse Polish Notation)
 * for easier evaluation
 */
function infixToPostfix(tokens: string[]): string[] {
  const output: string[] = [];
  const operators: string[] = [];
  
  const precedence: Record<string, number> = {
    '!': 4,
    '&': 3,
    '⊼': 3, // NAND
    '^': 2, // XOR
    '|': 1,
    '⊽': 1, // NOR
  };
  
  const isOperator = (token: string) => token in precedence;
  const isVariable = (token: string) => /^[A-Za-z][A-Za-z0-9]*$/.test(token);
  const isConstant = (token: string) => token === '0' || token === '1';
  
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
      while (
        operators.length > 0 &&
        operators[operators.length - 1] !== '(' &&
        precedence[operators[operators.length - 1]] >= precedence[token]
      ) {
        output.push(operators.pop()!);
      }
      operators.push(token);
    } else {
      throw new Error(`Invalid token: ${token}`);
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
 * Build expression tree from postfix notation
 */
function buildExpressionTree(postfix: string[]): ExpressionNode {
  const stack: ExpressionNode[] = [];
  
  const operatorMap: Record<string, Operator> = {
    '&': 'AND',
    '|': 'OR',
    '!': 'NOT',
    '^': 'XOR',
    '⊼': 'NAND',
    '⊽': 'NOR',
  };
  
  for (const token of postfix) {
    if (/^[A-Za-z][A-Za-z0-9]*$/.test(token)) {
      // Variable
      stack.push({
        type: 'variable',
        value: token,
      });
    } else if (token === '0' || token === '1') {
      // Constant
      stack.push({
        type: 'constant',
        value: token,
      });
    } else if (token in operatorMap) {
      // Operator
      const operator = operatorMap[token];
      
      if (operator === 'NOT') {
        if (stack.length < 1) {
          throw new Error('Invalid expression: NOT requires one operand');
        }
        const operand = stack.pop()!;
        stack.push({
          type: 'operator',
          value: token,
          operator,
          left: operand,
        });
      } else {
        if (stack.length < 2) {
          throw new Error(`Invalid expression: ${operator} requires two operands`);
        }
        const right = stack.pop()!;
        const left = stack.pop()!;
        stack.push({
          type: 'operator',
          value: token,
          operator,
          left,
          right,
        });
      }
    }
  }
  
  if (stack.length !== 1) {
    throw new Error('Invalid expression: malformed');
  }
  
  return stack[0];
}

/**
 * Extract all variables from the expression tree
 */
function extractVariables(node: ExpressionNode): Set<string> {
  const variables = new Set<string>();
  
  function traverse(n: ExpressionNode) {
    if (n.type === 'variable') {
      variables.add(n.value);
    }
    if (n.left) traverse(n.left);
    if (n.right) traverse(n.right);
  }
  
  traverse(node);
  return variables;
}

/**
 * Main parsing function
 */
export function parseExpression(expression: string): ParseResult {
  try {
    // Tokenize
    const tokens = tokenize(expression);
    
    if (tokens.length === 0) {
      return {
        success: false,
        error: 'Empty expression',
        variables: [],
      };
    }
    
    // Convert to postfix
    const postfix = infixToPostfix(tokens);
    
    // Build tree
    const tree = buildExpressionTree(postfix);
    
    // Extract variables
    const variablesSet = extractVariables(tree);
    const variables = Array.from(variablesSet).sort();
    
    return {
      success: true,
      tree,
      variables,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      variables: [],
    };
  }
}

/**
 * Validate expression syntax
 */
export function validateExpression(expression: string): {
  isValid: boolean;
  message: string;
  suggestions?: string[];
} {
  if (!expression || expression.trim().length === 0) {
    return {
      isValid: false,
      message: 'Expression cannot be empty',
    };
  }
  
  const result = parseExpression(expression);
  
  if (!result.success) {
    const suggestions: string[] = [];
    
    if (result.error?.includes('character')) {
      suggestions.push('Use only letters, numbers, and operators: & (AND), | (OR), ! (NOT), ^ (XOR)');
    }
    if (result.error?.includes('parentheses')) {
      suggestions.push('Check that all parentheses are matched');
    }
    if (result.error?.includes('operand')) {
      suggestions.push('Ensure operators have the correct number of operands');
    }
    
    return {
      isValid: false,
      message: result.error || 'Invalid expression',
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }
  
  return {
    isValid: true,
    message: `Valid expression with ${result.variables.length} variable(s): ${result.variables.join(', ')}`,
  };
}

/**
 * Get expression examples for the user
 */
export const EXPRESSION_EXAMPLES = {
  basic: [
    { expr: 'A & B', desc: 'Simple AND operation' },
    { expr: 'A | B', desc: 'Simple OR operation' },
    { expr: '!A', desc: 'NOT operation (negation)' },
    { expr: 'A ^ B', desc: 'XOR operation' },
  ],
  intermediate: [
    { expr: 'A & B | C', desc: 'AND-OR combination' },
    { expr: '(A | B) & C', desc: 'OR-AND with parentheses' },
    { expr: '!A & B | A & !B', desc: 'XOR implementation' },
    { expr: 'A & (B | C)', desc: 'Distributive form' },
  ],
  advanced: [
    { expr: '!(A | B) & (C | D)', desc: "De Morgan's law application" },
    { expr: '(A & B) | (!A & !B)', desc: 'XNOR implementation' },
    { expr: '!((A | B) & (!C | D)) | (E & (A | !D))', desc: 'Complex nested expression' },
    { expr: '(A & B & C) | (A & !B & !C) | (!A & B & !C)', desc: 'Sum of Products (SOP)' },
  ],
};

/**
 * Convert expression to human-readable string
 */
export function expressionToString(node: ExpressionNode): string {
  if (node.type === 'variable' || node.type === 'constant') {
    return node.value;
  }
  
  if (node.operator === 'NOT' && node.left) {
    return `¬${expressionToString(node.left)}`;
  }
  
  if (node.left && node.right) {
    const leftStr = expressionToString(node.left);
    const rightStr = expressionToString(node.right);
    const opSymbols: Record<Operator, string> = {
      'AND': '∧',
      'OR': '∨',
      'XOR': '⊕',
      'NAND': '⊼',
      'NOR': '⊽',
      'XNOR': '⊙',
      'NOT': '¬',
    };
    const opSymbol = opSymbols[node.operator!] || node.operator;
    
    return `(${leftStr} ${opSymbol} ${rightStr})`;
  }
  
  return node.value;
}
