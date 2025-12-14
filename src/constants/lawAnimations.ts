/**
 * Law-specific animation configurations
 * Each Boolean law gets a unique animation style
 */

export type AnimationType =
  | 'fade'
  | 'slide'
  | 'bounce'
  | 'rotate'
  | 'scale'
  | 'flip'
  | 'shake'
  | 'pulse'
  | 'glow'

export interface LawAnimation {
  type: AnimationType
  duration: number
  highlightColor: string
  description: string
}

// Mapping from short law names (backend) to long names (animation keys)
const LAW_NAME_MAP: Record<string, string> = {
  // Short names from backend
  com: 'commutative',
  ass: 'associative',
  dist: 'distributive',
  i: 'identity',
  neg: 'negation',
  dneg: 'doublenegation',
  id: 'idempotent',
  ub: 'universalbound',
  dm: 'demorgans',
  abs: 'absorption',
  ntf: 'negationsoftf',
  xor: 'xor',
  imp: 'implication',
  bimp: 'biconditional',
  iff: 'biconditional',
  // Long names (already normalized)
  commutative: 'commutative',
  associative: 'associative',
  distributive: 'distributive',
  identity: 'identity',
  negation: 'negation',
  doublenegation: 'doublenegation',
  idempotent: 'idempotent',
  universalbound: 'universalbound',
  demorgans: 'demorgans',
  absorption: 'absorption',
  negationsoftf: 'negationsoftf',
  // XOR/Implication/Biconditional long names
  xordefinition: 'xor',
  implicationdefinition: 'implication',
  biconditionaldefinition: 'biconditional',
  simplified: 'start',
  start: 'start',
  result: 'start',
}

export const LAW_ANIMATIONS: Record<string, LawAnimation> = {
  // Identity - Simple fade (element disappears)
  identity: {
    type: 'fade',
    duration: 0.7,
    highlightColor: '#3b82f6', // blue
    description:
      'Identity elements fade away - T for AND, F for OR leave no trace',
  },

  // Negation - Rotate and flip
  negation: {
    type: 'flip',
    duration: 0.8,
    highlightColor: '#ef4444', // red
    description: 'Contradictions flip away! A∧¬A→F, tautologies emerge! A∨¬A→T',
  },

  // Double Negation - Quick shake then fade
  doublenegation: {
    type: 'shake',
    duration: 0.4,
    highlightColor: '#8b5cf6', // purple
    description: 'Double negations shake off',
  },

  // Negations of T/F - Rotate 180°
  negationsoftf: {
    type: 'rotate',
    duration: 0.5,
    highlightColor: '#ec4899', // pink
    description: 'True/False flip when negated',
  },

  // Universal Bound - Expand then consume
  universalbound: {
    type: 'scale',
    duration: 0.7,
    highlightColor: '#f59e0b', // amber
    description: 'Bound elements expand and consume others',
  },

  // Associative - Slide and regroup
  associative: {
    type: 'slide',
    duration: 0.6,
    highlightColor: '#10b981', // emerald
    description: 'Parentheses slide and regroup',
  },

  // Commutative - Swap positions with bounce
  commutative: {
    type: 'bounce',
    duration: 0.8,
    highlightColor: '#06b6d4', // cyan
    description: "Order doesn't matter! A∧B→B∧A, watch them swap places",
  },

  // Idempotent - Duplicates merge with glow
  idempotent: {
    type: 'glow',
    duration: 0.6,
    highlightColor: '#14b8a6', // teal
    description: 'Duplicate elements glow and merge',
  },

  // Absorption - One absorbs the other
  absorption: {
    type: 'scale',
    duration: 0.9,
    highlightColor: '#84cc16', // lime
    description: 'Redundancy absorbed! A∨(A∧B)→A, the larger term wins',
  },

  // De Morgan's - Distribute negation with pulse
  demorgans: {
    type: 'pulse',
    duration: 0.9,
    highlightColor: '#f97316', // orange
    description:
      'Negation distributes through! ¬(A∧B)→¬A∨¬B, operators flip too',
  },

  // Distributive - Split and distribute
  distributive: {
    type: 'slide',
    duration: 1.0,
    highlightColor: '#6366f1', // indigo
    description:
      'Distributing like algebra! A∧(B∨C)→(A∧B)∨(A∧C) - watch it expand',
  },

  // XOR conversion - Pulse to show expansion
  xor: {
    type: 'pulse',
    duration: 0.9,
    highlightColor: '#a855f7', // purple-500
    description: 'XOR expands into exclusive AND/OR form - watch it transform!',
  },

  // Implication conversion
  implication: {
    type: 'slide',
    duration: 0.8,
    highlightColor: '#0ea5e9', // sky-500
    description: 'Implication slides into OR form with negated antecedent',
  },

  // Biconditional conversion
  biconditional: {
    type: 'pulse',
    duration: 0.9,
    highlightColor: '#14b8a6', // teal-500
    description: 'Biconditional pulses and expands to show both directions',
  },

  // Start/Initial state - Already simplified
  start: {
    type: 'glow',
    duration: 0.5,
    highlightColor: '#22c55e', // green
    description: 'Expression is already in simplest form',
  },
}

/**
 * Get animation config for a law, with fallback
 * Maps both short names (from backend) and long names to the correct animation
 */
export function getLawAnimation(lawId: string): LawAnimation {
  // First normalize: lowercase, remove non-alpha chars
  const normalized = lawId.toLowerCase().replace(/[^a-z]/g, '')

  // Check if it's a short name that needs mapping
  const mappedName = LAW_NAME_MAP[normalized] || normalized

  // Return the animation or fallback
  return (
    LAW_ANIMATIONS[mappedName] || {
      type: 'fade',
      duration: 1,
      highlightColor: '#64748b', // slate
      description: 'Default transition',
    }
  )
}

/**
 * Get the full law name for display
 */
export function getLawDisplayName(lawId: string): string {
  const displayNames: Record<string, string> = {
    com: 'Commutative',
    ass: 'Associative',
    dist: 'Distributive',
    i: 'Identity',
    neg: 'Negation',
    dneg: 'Double Negation',
    id: 'Idempotent',
    ub: 'Universal Bound',
    dm: "De Morgan's",
    abs: 'Absorption',
    ntf: 'Negations of T/F',
    xor: 'XOR Expansion',
    imp: 'Implication',
    iff: 'Biconditional',
    commutative: 'Commutative',
    associative: 'Associative',
    distributive: 'Distributive',
    identity: 'Identity',
    negation: 'Negation',
    doublenegation: 'Double Negation',
    idempotent: 'Idempotent',
    universalbound: 'Universal Bound',
    demorgans: "De Morgan's",
    absorption: 'Absorption',
    negationsoftf: 'Negations of T/F',
  }

  const normalized = lawId.toLowerCase().replace(/[^a-z]/g, '')
  return displayNames[normalized] || lawId
}

/**
 * Framer Motion animation variants based on law type
 * Simplified animations for better readability - no stretch effects
 */
export function getAnimationVariants(lawId: string) {
  const animation = getLawAnimation(lawId)

  const variants = {
    fade: {
      initial: { opacity: 1 },
      animate: { opacity: 0 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { x: 0, opacity: 1 },
      animate: { x: [0, -10, 10, 0], opacity: 1 },
      exit: { x: 20, opacity: 0 },
    },
    bounce: {
      initial: { y: 0 },
      animate: {
        y: [0, -8, 0],
        transition: { duration: animation.duration, ease: 'easeOut' },
      },
      exit: { y: 10, opacity: 0 },
    },
    rotate: {
      initial: { rotate: 0, opacity: 1 },
      animate: { rotate: 360, opacity: 1 },
      exit: { opacity: 0 },
    },
    scale: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.6, 1],
        transition: { duration: animation.duration },
      },
      exit: { opacity: 0 },
    },
    flip: {
      initial: { opacity: 1 },
      animate: { opacity: [1, 0.5, 1] },
      exit: { opacity: 0 },
    },
    shake: {
      initial: { x: 0 },
      animate: {
        x: [0, -5, 5, -5, 5, 0],
        transition: { duration: 0.4 },
      },
      exit: { opacity: 0 },
    },
    pulse: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.7, 1, 0.8, 1],
      },
      exit: { opacity: 0 },
    },
    glow: {
      initial: { filter: 'brightness(1)' },
      animate: {
        filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
        transition: { duration: animation.duration, repeat: 1 },
      },
      exit: { opacity: 0 },
    },
  }

  return variants[animation.type] || variants.fade
}
