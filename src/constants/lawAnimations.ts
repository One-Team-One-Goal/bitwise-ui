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
  | 'glow';

export interface LawAnimation {
  type: AnimationType;
  duration: number;
  highlightColor: string;
  description: string;
}

export const LAW_ANIMATIONS: Record<string, LawAnimation> = {
  // Identity - Simple fade (element disappears)
  identity: {
    type: 'fade',
    duration: 0.5,
    highlightColor: '#3b82f6', // blue
    description: 'Elements fade away as they become identity',
  },

  // Negation - Rotate and flip
  negation: {
    type: 'flip',
    duration: 0.6,
    highlightColor: '#ef4444', // red
    description: 'Negated pairs flip and cancel out',
  },

  // Double Negation - Quick shake then fade
  doubleNegation: {
    type: 'shake',
    duration: 0.4,
    highlightColor: '#8b5cf6', // purple
    description: 'Double negations shake off',
  },

  // Negations of T/F - Rotate 180°
  negationsOfTF: {
    type: 'rotate',
    duration: 0.5,
    highlightColor: '#ec4899', // pink
    description: 'True/False flip when negated',
  },

  // Universal Bound - Expand then consume
  universalBound: {
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
    duration: 0.7,
    highlightColor: '#06b6d4', // cyan
    description: 'Elements bounce and swap positions',
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
    duration: 0.8,
    highlightColor: '#84cc16', // lime
    description: 'Larger term absorbs smaller one',
  },

  // De Morgan's - Distribute negation with pulse
  deMorgans: {
    type: 'pulse',
    duration: 0.7,
    highlightColor: '#f97316', // orange
    description: 'Negation pulses through expression',
  },

  // Distributive - Split and distribute
  distributive: {
    type: 'slide',
    duration: 0.8,
    highlightColor: '#6366f1', // indigo
    description: 'Term slides and distributes across others',
  },
};

/**
 * Get animation config for a law, with fallback
 */
export function getLawAnimation(lawId: string): LawAnimation {
  const normalized = lawId.toLowerCase().replace(/[^a-z]/g, '');
  return LAW_ANIMATIONS[normalized] || {
    type: 'fade',
    duration: 0.5,
    highlightColor: '#64748b', // slate
    description: 'Default transition',
  };
}

/**
 * Framer Motion animation variants based on law type
 */
export function getAnimationVariants(lawId: string) {
  const animation = getLawAnimation(lawId);
  
  const variants = {
    fade: {
      initial: { opacity: 1 },
      animate: { opacity: 0 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { x: 0, opacity: 1 },
      animate: { x: [0, -20, 20, 0], opacity: [1, 0.7, 0.7, 1] },
      exit: { x: 50, opacity: 0 },
    },
    bounce: {
      initial: { y: 0 },
      animate: { 
        y: [0, -15, 0, -10, 0],
        transition: { duration: animation.duration, ease: "easeOut" }
      },
      exit: { y: 20, opacity: 0 },
    },
    rotate: {
      initial: { rotate: 0 },
      animate: { rotate: [0, 180, 360] },
      exit: { rotate: 180, opacity: 0 },
    },
    scale: {
      initial: { scale: 1 },
      animate: { 
        scale: [1, 1.3, 0.8, 1.1, 1],
        transition: { duration: animation.duration }
      },
      exit: { scale: 0 },
    },
    flip: {
      initial: { rotateY: 0 },
      animate: { rotateY: [0, 90, 180] },
      exit: { rotateY: 180, opacity: 0 },
    },
    shake: {
      initial: { x: 0 },
      animate: { 
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      },
      exit: { opacity: 0 },
    },
    pulse: {
      initial: { scale: 1, opacity: 1 },
      animate: { 
        scale: [1, 1.1, 1, 1.05, 1],
        opacity: [1, 0.8, 1, 0.9, 1]
      },
      exit: { scale: 0.8, opacity: 0 },
    },
    glow: {
      initial: { filter: 'brightness(1)' },
      animate: { 
        filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'],
        transition: { duration: animation.duration, repeat: 1 }
      },
      exit: { opacity: 0 },
    },
  };

  return variants[animation.type] || variants.fade;
}
