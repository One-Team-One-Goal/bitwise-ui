/**
 * Comprehensive explanations for all Boolean Algebra Laws
 * Used in the calculator's step-by-step visualization system
 */

export interface LawPattern {
  before: string;
  after: string;
  alternates?: Array<{ before: string; after: string }>;
}

export interface LawExample {
  input: string;
  output: string;
  description: string;
}

export interface LawExplanation {
  id: string;
  title: string;
  shortName: string;
  icon: string;
  category: 'simplification' | 'transformation' | 'identity' | 'structural';
  patterns: LawPattern[];
  description: string;
  intuition: string;
  realWorldAnalogy?: string;
  examples: LawExample[];
  commonMistakes?: string[];
  relatedLaws?: string[];
}

export const LAW_EXPLANATIONS: Record<string, LawExplanation> = {
  // Identity Law
  identity: {
    id: 'identity',
    title: 'Identity Law',
    shortName: 'I',
    icon: '↻',
    category: 'identity',
    patterns: [
      { before: 'A ∧ T', after: 'A' },
      { before: 'A ∨ F', after: 'A' },
      { before: 'T ∧ A', after: 'A' },
      { before: 'F ∨ A', after: 'A' },
    ],
    description: 'Removes identity elements that don\'t change the result. AND-ing with True or OR-ing with False has no effect.',
    intuition: 'True is the identity for AND (like 1 for multiplication). False is the identity for OR (like 0 for addition).',
    realWorldAnalogy: 'Like multiplying by 1 or adding 0 - they don\'t change the value.',
    examples: [
      { input: '(A ∧ B) ∧ T', output: 'A ∧ B', description: 'AND with True is removed' },
      { input: '(A ∨ B) ∨ F', output: 'A ∨ B', description: 'OR with False is removed' },
      { input: 'T ∧ X ∧ Y', output: 'X ∧ Y', description: 'True doesn\'t affect AND result' },
    ],
    commonMistakes: [
      'Confusing with Universal Bound (which replaces entire expression)',
      'Forgetting that T is identity for AND, F for OR (not vice versa)',
    ],
    relatedLaws: ['universalBound', 'negation'],
  },

  // Negation Law
  negation: {
    id: 'negation',
    title: 'Negation Law',
    shortName: 'NEG',
    icon: '⊗',
    category: 'simplification',
    patterns: [
      { before: 'A ∧ ¬A', after: 'F' },
      { before: 'A ∨ ¬A', after: 'T' },
      { before: '¬A ∧ A', after: 'F' },
      { before: '¬A ∨ A', after: 'T' },
    ],
    description: 'A variable AND its negation is always False (contradiction). A variable OR its negation is always True (tautology).',
    intuition: 'Something can\'t be both true and false at the same time. But it must be either true or false.',
    realWorldAnalogy: 'A light can\'t be both ON and OFF simultaneously, but it must be either ON or OFF.',
    examples: [
      { input: 'X ∧ ¬X', output: 'F', description: 'Contradiction is always false' },
      { input: 'Y ∨ ¬Y', output: 'T', description: 'Tautology is always true' },
      { input: '(A ∨ B) ∧ ¬(A ∨ B)', output: 'F', description: 'Works with complex expressions too' },
    ],
    commonMistakes: [
      'Confusing which gives T and which gives F',
      'Only applies when expressions are exactly opposite (A and ¬A)',
    ],
    relatedLaws: ['doubleNegation', 'deMorgans'],
  },

  // Double Negation Law
  doubleNegation: {
    id: 'doubleNegation',
    title: 'Double Negation Law',
    shortName: 'DNEG',
    icon: '⇄',
    category: 'simplification',
    patterns: [
      { before: '¬¬A', after: 'A' },
      { before: '¬¬(A ∧ B)', after: 'A ∧ B' },
    ],
    description: 'Two negations cancel each other out. NOT NOT A equals A.',
    intuition: 'Two negatives make a positive. "Not not true" means "true".',
    realWorldAnalogy: 'Like saying "I\'m not unhappy" means "I\'m happy". Double negative becomes positive.',
    examples: [
      { input: '¬¬X', output: 'X', description: 'Double NOT cancels' },
      { input: '¬¬(A ∨ B)', output: 'A ∨ B', description: 'Works on any expression' },
      { input: '¬¬¬¬A', output: 'A', description: 'Any even number of NOTs cancels' },
    ],
    commonMistakes: [
      'Forgetting to apply when deeply nested',
      'Confusing with De Morgan\'s Law',
    ],
    relatedLaws: ['negation', 'deMorgans'],
  },

  // Negations of T and F
  negationsOfTF: {
    id: 'negationsOfTF',
    title: 'Negations of True and False',
    shortName: 'NTF',
    icon: '⇌',
    category: 'identity',
    patterns: [
      { before: '¬T', after: 'F' },
      { before: '¬F', after: 'T' },
    ],
    description: 'NOT True is False. NOT False is True. Simple constant negation.',
    intuition: 'The opposite of true is false, and vice versa.',
    realWorldAnalogy: 'If "the sky is blue" is true, then "the sky is NOT blue" is false.',
    examples: [
      { input: '¬T', output: 'F', description: 'NOT True equals False' },
      { input: '¬F', output: 'T', description: 'NOT False equals True' },
      { input: 'A ∨ ¬T', output: 'A ∨ F', description: 'Can simplify further with Identity' },
    ],
    relatedLaws: ['doubleNegation', 'identity'],
  },

  // Universal Bound Law
  universalBound: {
    id: 'universalBound',
    title: 'Universal Bound Law',
    shortName: 'UB',
    icon: '◉',
    category: 'simplification',
    patterns: [
      { before: 'A ∧ F', after: 'F' },
      { before: 'A ∨ T', after: 'T' },
      { before: 'F ∧ A', after: 'F' },
      { before: 'T ∨ A', after: 'T' },
    ],
    description: 'AND with False always gives False (domination). OR with True always gives True (domination).',
    intuition: 'False "dominates" AND operations. True "dominates" OR operations. The result is determined regardless of other values.',
    realWorldAnalogy: 'Like multiplying by 0 (always 0) or checking if ANY condition is true when one already is.',
    examples: [
      { input: 'X ∧ Y ∧ F', output: 'F', description: 'Any AND with False is False' },
      { input: 'A ∨ B ∨ T', output: 'T', description: 'Any OR with True is True' },
      { input: '(A ∧ B ∧ C) ∧ F', output: 'F', description: 'Entire expression dominated' },
    ],
    commonMistakes: [
      'Confusing with Identity Law (which removes T/F, not replaces whole expression)',
      'Wrong pairing: F dominates AND, T dominates OR',
    ],
    relatedLaws: ['identity', 'negation'],
  },

  // Associative Law
  associative: {
    id: 'associative',
    title: 'Associative Law',
    shortName: 'ASS',
    icon: '⊞',
    category: 'structural',
    patterns: [
      { before: '(A ∧ B) ∧ C', after: 'A ∧ B ∧ C' },
      { before: 'A ∧ (B ∧ C)', after: 'A ∧ B ∧ C' },
      { before: '(A ∨ B) ∨ C', after: 'A ∨ B ∨ C' },
      { before: 'A ∨ (B ∨ C)', after: 'A ∨ B ∨ C' },
    ],
    description: 'Grouping doesn\'t matter for same operators. You can flatten nested ANDs or ORs.',
    intuition: 'When all operations are the same (all AND or all OR), parentheses don\'t change the result.',
    realWorldAnalogy: 'Like addition: (1+2)+3 = 1+(2+3) = 1+2+3. The grouping doesn\'t matter.',
    examples: [
      { input: '(A ∧ B) ∧ C', output: 'A ∧ B ∧ C', description: 'Flatten nested ANDs' },
      { input: 'X ∨ (Y ∨ Z)', output: 'X ∨ Y ∨ Z', description: 'Flatten nested ORs' },
      { input: '((A ∧ B) ∧ C) ∧ D', output: 'A ∧ B ∧ C ∧ D', description: 'Multiple levels flatten' },
    ],
    commonMistakes: [
      'Only works when ALL operators are the same',
      'Doesn\'t work with mixed AND/OR',
    ],
    relatedLaws: ['commutative', 'distributive'],
  },

  // Commutative Law
  commutative: {
    id: 'commutative',
    title: 'Commutative Law',
    shortName: 'COM',
    icon: '⇆',
    category: 'structural',
    patterns: [
      { before: 'A ∧ B', after: 'B ∧ A' },
      { before: 'A ∨ B', after: 'B ∨ A' },
    ],
    description: 'Order doesn\'t matter for AND or OR operations. You can reorder operands.',
    intuition: 'AND and OR are symmetric - flipping the order doesn\'t change the result.',
    realWorldAnalogy: 'Like addition: 2+3 = 3+2. The order of adding doesn\'t matter.',
    examples: [
      { input: 'B ∧ A', output: 'A ∧ B', description: 'Alphabetical ordering' },
      { input: 'Z ∨ X ∨ Y', output: 'X ∨ Y ∨ Z', description: 'Sort multiple terms' },
      { input: '(C ∧ A) ∧ B', output: 'A ∧ B ∧ C', description: 'Often used for standardization' },
    ],
    commonMistakes: [
      'Not a "mistake" but usually used for standardization, not simplification',
    ],
    relatedLaws: ['associative'],
  },

  // Idempotent Law
  idempotent: {
    id: 'idempotent',
    title: 'Idempotent Law',
    shortName: 'ID',
    icon: '≡',
    category: 'simplification',
    patterns: [
      { before: 'A ∧ A', after: 'A' },
      { before: 'A ∨ A', after: 'A' },
      { before: 'A ∧ A ∧ A', after: 'A' },
    ],
    description: 'Duplicate terms can be removed. A AND A equals just A. A OR A equals just A.',
    intuition: 'Repeating the same condition doesn\'t change anything. Once is enough.',
    realWorldAnalogy: 'Like saying "check if the door is locked AND the door is locked" - you only need to check once.',
    examples: [
      { input: 'X ∧ X', output: 'X', description: 'Remove duplicate AND' },
      { input: 'Y ∨ Y ∨ Y', output: 'Y', description: 'Remove all duplicates in OR' },
      { input: '(A ∧ B) ∨ (A ∧ B)', output: 'A ∧ B', description: 'Works with complex terms too' },
    ],
    commonMistakes: [
      'Only works with IDENTICAL terms (A ∧ A, not A ∧ B)',
    ],
    relatedLaws: ['absorption'],
  },

  // Absorption Law
  absorption: {
    id: 'absorption',
    title: 'Absorption Law',
    shortName: 'ABS',
    icon: '⊂',
    category: 'simplification',
    patterns: [
      { before: 'A ∨ (A ∧ B)', after: 'A' },
      { before: 'A ∧ (A ∨ B)', after: 'A' },
      { before: '(A ∧ B) ∨ A', after: 'A' },
      { before: '(A ∨ B) ∧ A', after: 'A' },
    ],
    description: 'If A is present, adding (A AND/OR something) is redundant. A "absorbs" the redundant term.',
    intuition: 'If A is true in "A OR (A AND B)", the (A AND B) part doesn\'t add information. If A is false in "A AND (A OR B)", then (A OR B) doesn\'t matter.',
    realWorldAnalogy: 'Like saying "I have an apple OR (I have an apple AND it\'s red)" - if you have an apple, the second part is absorbed.',
    examples: [
      { input: 'X ∨ (X ∧ Y)', output: 'X', description: 'X absorbs the AND term' },
      { input: 'A ∧ (A ∨ B)', output: 'A', description: 'A absorbs the OR term' },
      { input: '(P ∧ Q) ∨ P', output: 'P', description: 'Order doesn\'t matter' },
    ],
    commonMistakes: [
      'Only works when one term contains the other',
      'Must have A alone AND A combined with others',
    ],
    relatedLaws: ['idempotent', 'distributive'],
  },

  // De Morgan's Law
  deMorgans: {
    id: 'deMorgans',
    title: "De Morgan's Laws",
    shortName: 'DM',
    icon: '⇋',
    category: 'transformation',
    patterns: [
      { before: '¬(A ∧ B)', after: '¬A ∨ ¬B' },
      { before: '¬(A ∨ B)', after: '¬A ∧ ¬B' },
    ],
    description: 'When you negate a compound expression: AND becomes OR (and vice versa), and each term gets negated.',
    intuition: '"NOT (both A AND B)" means "either NOT A OR NOT B". The NOT distributes and flips the operator.',
    realWorldAnalogy: '"It\'s not true that (I\'m hungry AND tired)" means "Either I\'m not hungry OR I\'m not tired".',
    examples: [
      { input: '¬(X ∧ Y)', output: '¬X ∨ ¬Y', description: 'NOT AND becomes OR NOT' },
      { input: '¬(A ∨ B)', output: '¬A ∧ ¬B', description: 'NOT OR becomes AND NOT' },
      { input: '¬(P ∧ Q ∧ R)', output: '¬P ∨ ¬Q ∨ ¬R', description: 'Works with multiple terms' },
    ],
    commonMistakes: [
      'Forgetting to negate EACH term',
      'Forgetting to flip the operator (AND ↔ OR)',
      'Only applies when NOT is outside parentheses',
    ],
    relatedLaws: ['doubleNegation', 'negation'],
  },

  // Distributive Law
  distributive: {
    id: 'distributive',
    title: 'Distributive Law',
    shortName: 'DIST',
    icon: '⊕',
    category: 'transformation',
    patterns: [
      { 
        before: 'A ∧ (B ∨ C)', 
        after: '(A ∧ B) ∨ (A ∧ C)',
        alternates: [
          { before: '(B ∨ C) ∧ A', after: '(B ∧ A) ∨ (C ∧ A)' },
        ],
      },
      { 
        before: 'A ∨ (B ∧ C)', 
        after: '(A ∨ B) ∧ (A ∨ C)',
        alternates: [
          { before: '(B ∧ C) ∨ A', after: '(B ∨ A) ∧ (C ∨ A)' },
        ],
      },
      // Factoring (reverse distribution)
      {
        before: '(A ∧ B) ∨ (A ∧ C)',
        after: 'A ∧ (B ∨ C)',
      },
      {
        before: '(A ∨ B) ∧ (A ∨ C)',
        after: 'A ∨ (B ∧ C)',
      },
    ],
    description: 'Distributes one operator over another (like multiplication over addition). Can expand OR factor expressions.',
    intuition: 'Like algebra: a(b+c) = ab+ac. You can distribute AND over OR, or factor out common terms.',
    realWorldAnalogy: 'Buying "1 burger AND (fries OR salad)" means you get "(burger AND fries) OR (burger AND salad)".',
    examples: [
      { input: 'X ∧ (Y ∨ Z)', output: '(X ∧ Y) ∨ (X ∧ Z)', description: 'Distribute AND over OR' },
      { input: 'A ∨ (B ∧ C)', output: '(A ∨ B) ∧ (A ∨ C)', description: 'Distribute OR over AND' },
      { input: '(P ∧ Q) ∨ (P ∧ R)', output: 'P ∧ (Q ∨ R)', description: 'Factor out common P' },
    ],
    commonMistakes: [
      'Forgetting to apply to BOTH terms inside parentheses',
      'Confusing direction (expanding vs factoring)',
      'Wrong operator pairing',
    ],
    relatedLaws: ['absorption', 'associative'],
  },

  // XOR Definition (Expansion)
  xor: {
    id: 'xor',
    title: 'XOR Definition',
    shortName: 'XOR',
    icon: '⊕',
    category: 'transformation',
    patterns: [
      { before: 'A ⊕ B', after: '(A ∧ ¬B) ∨ (¬A ∧ B)' },
    ],
    description: 'XOR (exclusive or) means "one or the other but not both". It expands to AND/OR form.',
    intuition: 'A XOR B is true when exactly one of A or B is true, but not both. This is why it expands to (A AND NOT B) OR (NOT A AND B).',
    realWorldAnalogy: 'You can have coffee XOR tea with breakfast (one or the other, not both). Either (coffee AND no tea) OR (tea AND no coffee).',
    examples: [
      { input: 'X ⊕ Y', output: '(X ∧ ¬Y) ∨ (¬X ∧ Y)', description: 'Standard XOR expansion' },
      { input: 'A ⊕ T', output: '(A ∧ ¬T) ∨ (¬A ∧ T)', description: 'XOR with True - expands then simplifies to ¬A' },
      { input: 'P ⊕ P', output: '(P ∧ ¬P) ∨ (¬P ∧ P)', description: 'XOR with itself - simplifies to F' },
    ],
    commonMistakes: [
      'Confusing XOR with regular OR (XOR is exclusive)',
      'Forgetting the "not both" part',
    ],
    relatedLaws: ['negation', 'distributive'],
  },

  // Implication Definition
  implication: {
    id: 'implication',
    title: 'Implication Definition',
    shortName: 'IMP',
    icon: '→',
    category: 'transformation',
    patterns: [
      { before: 'A → B', after: '¬A ∨ B' },
    ],
    description: 'Implication (if-then) converts to "NOT A OR B". This is because A→B is only false when A is true and B is false.',
    intuition: 'If A implies B, then either A is false (nothing to prove) or B must be true. Hence ¬A ∨ B.',
    realWorldAnalogy: '"If it rains, I\'ll take an umbrella" is only broken when it rains AND you don\'t take an umbrella.',
    examples: [
      { input: 'P → Q', output: '¬P ∨ Q', description: 'Standard implication conversion' },
      { input: 'A → T', output: '¬A ∨ T', description: 'Anything implies True (always true)' },
      { input: 'F → B', output: '¬F ∨ B', description: 'False implies anything (vacuously true)' },
    ],
    commonMistakes: [
      'Thinking A→B means B→A (they\'re different!)',
      'Forgetting to negate the antecedent (first part)',
    ],
    relatedLaws: ['negation', 'biconditional'],
  },

  // Biconditional Definition
  biconditional: {
    id: 'biconditional',
    title: 'Biconditional Definition',
    shortName: 'BIMP',
    icon: '↔',
    category: 'transformation',
    patterns: [
      { before: 'A ↔ B', after: '(A ∧ B) ∨ (¬A ∧ ¬B)' },
    ],
    description: 'Biconditional (if and only if) means both sides have the same truth value. Expands to "(both true) OR (both false)".',
    intuition: 'A↔B is true when A and B are equal: either both true or both false.',
    realWorldAnalogy: '"I\'ll go IF AND ONLY IF you go" - we both go together, or we both stay home.',
    examples: [
      { input: 'X ↔ Y', output: '(X ∧ Y) ∨ (¬X ∧ ¬Y)', description: 'Standard biconditional expansion' },
      { input: 'A ↔ T', output: '(A ∧ T) ∨ (¬A ∧ ¬T)', description: 'Biconditional with True - simplifies to A' },
      { input: 'P ↔ P', output: '(P ∧ P) ∨ (¬P ∧ ¬P)', description: 'Biconditional with itself - always true' },
    ],
    commonMistakes: [
      'Confusing with single implication (biconditional is two-way)',
      'Forgetting both parts need to match',
    ],
    relatedLaws: ['implication', 'negation'],
  },

  // Special entries for UI display
  result: {
    id: 'result',
    title: 'Simplified Result',
    shortName: 'RESULT',
    icon: 'RES',
    category: 'simplification',
    patterns: [],
    description: 'Final simplified form - no more laws can be applied!',
    intuition: 'This is the simplest equivalent expression.',
    examples: [],
  },

  start: {
    id: 'start',
    title: 'Original Expression',
    shortName: 'START',
    icon: 'IN',
    category: 'identity',
    patterns: [],
    description: 'This is your original expression before any simplification.',
    intuition: 'The starting point of the simplification process.',
    examples: [],
  },

  simplified: {
    id: 'simplified',
    title: 'Already Simplified',
    shortName: 'SIMPLE',
    icon: 'OK',
    category: 'simplification',
    patterns: [],
    description: 'This expression is already in its simplest form. No Boolean algebra laws can simplify it further.',
    intuition: 'The expression cannot be reduced any further using standard Boolean algebra laws.',
    examples: [],
  },
};

// Mapping from short law names (backend) to explanation keys
const LAW_ID_MAP: Record<string, string> = {
  'com': 'commutative',
  'ass': 'associative',
  'dist': 'distributive',
  'i': 'identity',
  'neg': 'negation',
  'dneg': 'doubleNegation',
  'id': 'idempotent',
  'ub': 'universalBound',
  'dm': 'deMorgans',
  'abs': 'absorption',
  'ntf': 'negationsOfTF',
  'xor': 'xor',
  'imp': 'implication',
  'bimp': 'biconditional',
  'iff': 'biconditional',
  'xordefinition': 'xor',
  'implicationdefinition': 'implication',
  'biconditionaldefinition': 'biconditional',
};

// Helper to get law by various identifiers
export function getLawExplanation(lawId: string): LawExplanation | null {
  // Normalize the lawId - remove "by " prefix, lowercase, trim
  const normalized = lawId.toLowerCase().replace(/^by\s+/i, '').trim();
  
  // Check the short name map first
  const mappedKey = LAW_ID_MAP[normalized];
  if (mappedKey && LAW_EXPLANATIONS[mappedKey]) {
    return LAW_EXPLANATIONS[mappedKey];
  }
  
  // Try direct match
  if (LAW_EXPLANATIONS[normalized]) {
    return LAW_EXPLANATIONS[normalized];
  }
  
  // Try matching by short name in the explanation objects
  const byShortName = Object.values(LAW_EXPLANATIONS).find(
    law => law.shortName.toLowerCase() === normalized
  );
  if (byShortName) return byShortName;
  
  // Try matching by title
  const byTitle = Object.values(LAW_EXPLANATIONS).find(
    law => law.title.toLowerCase() === normalized
  );
  if (byTitle) return byTitle;
  
  // Return null if nothing found
  return null;
}

// Get color for law category
export function getLawCategoryColor(category: LawExplanation['category']): string {
  switch (category) {
    case 'simplification': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'transformation': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'identity': return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'structural': return 'bg-purple-100 text-purple-800 border-purple-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}
