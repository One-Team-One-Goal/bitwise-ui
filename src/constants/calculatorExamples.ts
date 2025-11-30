/**
 * Pre-built challenge examples for the Boolean Algebra Calculator
 * Each example demonstrates multiple laws working together
 */

export interface CalculatorExample {
  id: string;
  title: string;
  expression: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  lawsUsed: string[]; // Law IDs that will be applied
  learningFocus: string;
  estimatedSteps: number;
  category: 'simplification' | 'distribution' | 'logic' | 'advanced';
  tags: string[];
}

export const CALCULATOR_EXAMPLES: CalculatorExample[] = [
  // ========== BEGINNER ==========
  {
    id: 'beginner-1',
    title: 'Double Negation Basics',
    expression: '¬¬A',
    difficulty: 'beginner',
    description: 'Learn how double negations cancel out',
    lawsUsed: ['doubleNegation'],
    learningFocus: 'Understanding double negation elimination',
    estimatedSteps: 1,
    category: 'simplification',
    tags: ['negation', 'basics'],
  },
  {
    id: 'beginner-2',
    title: 'Identity Elements',
    expression: '(A ∧ T) ∨ F',
    difficulty: 'beginner',
    description: 'See how T and F identities work',
    lawsUsed: ['identity'],
    learningFocus: 'Understanding identity law with T and F',
    estimatedSteps: 2,
    category: 'simplification',
    tags: ['identity', 'constants'],
  },
  {
    id: 'beginner-3',
    title: 'Simple Contradiction',
    expression: 'A ∧ ¬A',
    difficulty: 'beginner',
    description: 'A variable AND its negation always equals False',
    lawsUsed: ['negation'],
    learningFocus: 'Understanding contradictions',
    estimatedSteps: 1,
    category: 'logic',
    tags: ['negation', 'contradiction'],
  },
  {
    id: 'beginner-4',
    title: 'Simple Tautology',
    expression: 'B ∨ ¬B',
    difficulty: 'beginner',
    description: 'A variable OR its negation always equals True',
    lawsUsed: ['negation'],
    learningFocus: 'Understanding tautologies',
    estimatedSteps: 1,
    category: 'logic',
    tags: ['negation', 'tautology'],
  },

  // ========== INTERMEDIATE ==========
  {
    id: 'intermediate-1',
    title: 'Factoring Common Terms',
    expression: '(A ∨ B) ∧ (A ∨ ¬B)',
    difficulty: 'intermediate',
    description: 'Factor out A, then simplify the negation',
    lawsUsed: ['distributive', 'negation', 'identity'],
    learningFocus: 'Using distribution to factor common terms',
    estimatedSteps: 3,
    category: 'distribution',
    tags: ['factoring', 'distribution', 'classic'],
  },
  {
    id: 'intermediate-2',
    title: 'De Morgan\'s in Action',
    expression: '¬(A ∧ B) ∨ (A ∧ B)',
    difficulty: 'intermediate',
    description: 'Apply De Morgan\'s law then recognize a tautology',
    lawsUsed: ['deMorgans', 'negation'],
    learningFocus: 'De Morgan\'s Law transformation',
    estimatedSteps: 2,
    category: 'logic',
    tags: ['demorgans', 'negation'],
  },
  {
    id: 'intermediate-3',
    title: 'Absorption Pattern',
    expression: 'X ∨ (X ∧ Y)',
    difficulty: 'intermediate',
    description: 'See how X absorbs the redundant AND term',
    lawsUsed: ['absorption'],
    learningFocus: 'Understanding absorption law',
    estimatedSteps: 1,
    category: 'simplification',
    tags: ['absorption', 'redundancy'],
  },
  {
    id: 'intermediate-4',
    title: 'Idempotent Duplicates',
    expression: '(A ∨ B) ∨ (A ∨ B)',
    difficulty: 'intermediate',
    description: 'Remove duplicate terms using idempotent law',
    lawsUsed: ['idempotent'],
    learningFocus: 'Eliminating duplicates',
    estimatedSteps: 1,
    category: 'simplification',
    tags: ['idempotent', 'duplicates'],
  },
  {
    id: 'intermediate-5',
    title: 'Triple Negation',
    expression: '¬¬¬A ∨ B',
    difficulty: 'intermediate',
    description: 'Multiple negations simplify step by step',
    lawsUsed: ['doubleNegation'],
    learningFocus: 'Repeated negation elimination',
    estimatedSteps: 2,
    category: 'simplification',
    tags: ['negation', 'multi-step'],
  },

  // ========== ADVANCED ==========
  {
    id: 'advanced-1',
    title: 'De Morgan + Distribution',
    expression: '¬(A ∧ B) ∧ (A ∨ C)',
    difficulty: 'advanced',
    description: 'Apply De Morgan\'s, then distribute and simplify',
    lawsUsed: ['deMorgans', 'distributive', 'negation', 'identity'],
    learningFocus: 'Combining De Morgan\'s with distribution',
    estimatedSteps: 5,
    category: 'advanced',
    tags: ['demorgans', 'distribution', 'complex'],
  },
  {
    id: 'advanced-2',
    title: 'Complex Factoring',
    expression: '(A ∧ B) ∨ (A ∧ C) ∨ (A ∧ D)',
    difficulty: 'advanced',
    description: 'Factor out A from multiple terms',
    lawsUsed: ['distributive', 'associative'],
    learningFocus: 'Multi-term factoring',
    estimatedSteps: 3,
    category: 'distribution',
    tags: ['factoring', 'multi-term'],
  },
  {
    id: 'advanced-3',
    title: 'Nested De Morgan\'s',
    expression: '¬(¬A ∨ ¬B)',
    difficulty: 'advanced',
    description: 'De Morgan\'s followed by double negation',
    lawsUsed: ['deMorgans', 'doubleNegation'],
    learningFocus: 'Nested negations with De Morgan\'s',
    estimatedSteps: 3,
    category: 'logic',
    tags: ['demorgans', 'nested', 'negation'],
  },
  {
    id: 'advanced-4',
    title: 'Universal Bound Domination',
    expression: '(A ∨ B ∨ C) ∧ F',
    difficulty: 'advanced',
    description: 'See how False dominates the entire expression',
    lawsUsed: ['universalBound'],
    learningFocus: 'Understanding domination by constants',
    estimatedSteps: 1,
    category: 'simplification',
    tags: ['universal-bound', 'domination'],
  },
  {
    id: 'advanced-5',
    title: 'Distribution Expansion',
    expression: 'X ∧ (Y ∨ Z ∨ W)',
    difficulty: 'advanced',
    description: 'Distribute AND over multiple OR terms',
    lawsUsed: ['distributive', 'associative'],
    learningFocus: 'Distribution with multiple terms',
    estimatedSteps: 2,
    category: 'distribution',
    tags: ['distribution', 'expansion'],
  },
  {
    id: 'advanced-6',
    title: 'Absorption + Identity',
    expression: '(P ∨ (P ∧ Q)) ∧ T',
    difficulty: 'advanced',
    description: 'Combine absorption and identity laws',
    lawsUsed: ['absorption', 'identity'],
    learningFocus: 'Multiple law application',
    estimatedSteps: 2,
    category: 'simplification',
    tags: ['absorption', 'identity', 'combo'],
  },
];

// Helper functions
export function getExamplesByDifficulty(difficulty: CalculatorExample['difficulty']): CalculatorExample[] {
  return CALCULATOR_EXAMPLES.filter(ex => ex.difficulty === difficulty);
}

export function getExamplesByCategory(category: CalculatorExample['category']): CalculatorExample[] {
  return CALCULATOR_EXAMPLES.filter(ex => ex.category === category);
}

export function getExampleById(id: string): CalculatorExample | undefined {
  return CALCULATOR_EXAMPLES.find(ex => ex.id === id);
}

export function getRandomExample(difficulty?: CalculatorExample['difficulty']): CalculatorExample {
  const pool = difficulty ? getExamplesByDifficulty(difficulty) : CALCULATOR_EXAMPLES;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Get difficulty color
export function getDifficultyColor(difficulty: CalculatorExample['difficulty']): string {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'intermediate':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'advanced':
      return 'bg-purple-100 text-purple-800 border-purple-300';
  }
}

// Get difficulty icon
export function getDifficultyIcon(difficulty: CalculatorExample['difficulty']): string {
  switch (difficulty) {
    case 'beginner':
      return '●';
    case 'intermediate':
      return '●●';
    case 'advanced':
      return '●●●';
  }
}
