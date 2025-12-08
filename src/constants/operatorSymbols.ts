/**
 * Boolean operator symbols and their alternative representations
 * Used for quick insert buttons and symbol help tooltips
 */

export interface OperatorInfo {
  symbol: string;
  name: string;
  description: string;
  alternatives: string[];
  example: string;
  htmlEntity?: string;
}

export const OPERATOR_SYMBOLS: OperatorInfo[] = [
  {
    symbol: '∧',
    name: 'AND',
    description: 'Logical conjunction - true only when both operands are true',
    alternatives: ['^', '·', '.', '&', '&&', 'AND', 'and'],
    example: 'A ∧ B',
    htmlEntity: '&and;',
  },
  {
    symbol: '∨',
    name: 'OR',
    description: 'Logical disjunction - true when at least one operand is true',
    alternatives: ['v', '+', '|', '||', 'OR', 'or'],
    example: 'A ∨ B',
    htmlEntity: '&or;',
  },
  {
    symbol: '¬',
    name: 'NOT',
    description: 'Logical negation - inverts the truth value',
    alternatives: ['~', '!', '-', "'", 'NOT', 'not'],
    example: '¬A',
    htmlEntity: '&not;',
  },
  {
    symbol: '⊕',
    name: 'XOR',
    description: 'Exclusive OR - true when exactly one operand is true (but not both)',
    alternatives: ['xor', 'XOR', '⊻'],
    example: 'A ⊕ B',
    htmlEntity: '&oplus;',
  },
];

export const PARENTHESES = [
  { symbol: '(', name: 'Open Parenthesis' },
  { symbol: ')', name: 'Close Parenthesis' },
];

// Quick insert button order - includes XOR for circuit design
export const QUICK_INSERT_SYMBOLS = ['∧', '∨', '¬', '⊕', '(', ')'];

/**
 * Get operator info by symbol
 */
export function getOperatorInfo(symbol: string): OperatorInfo | undefined {
  return OPERATOR_SYMBOLS.find(op => op.symbol === symbol);
}

/**
 * Get all alternative symbols for a given operator
 */
export function getAlternatives(symbol: string): string[] {
  const op = getOperatorInfo(symbol);
  return op ? op.alternatives : [];
}

/**
 * Check if a string is a valid operator (including alternatives)
 */
export function isOperatorSymbol(str: string): boolean {
  const lowerStr = str.toLowerCase();
  return OPERATOR_SYMBOLS.some(
    op => op.symbol === str || op.alternatives.some(alt => alt.toLowerCase() === lowerStr)
  );
}
