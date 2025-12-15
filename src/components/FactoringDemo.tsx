import React from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'motion/react'
import { calculatorService } from '../services/calculator.service'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import StepNarration from './calculator/StepNarration'
import ProgressTimeline from './calculator/ProgressTimeline'
import ExamplesPanel from './calculator/ExamplesPanel'
import { SymbolHelpTooltip, SymbolHelpModal } from './calculator/SymbolHelp'
import { ErrorModal } from './calculator/ErrorModal'
import { SimplifiedBanner } from './calculator/SimplifiedBanner'
import { QUICK_INSERT_SYMBOLS } from '@/constants/operatorSymbols'
import { getLawAnimation } from '@/constants/lawAnimations'
import introJs from 'intro.js'
import 'intro.js/introjs.css'
import { HelpCircle, BookOpen } from 'lucide-react'
import LeftPointSvg from '@/assets/bitbot/left-point.svg?url'

// ============================================================================
// Types
// ============================================================================
export interface ScriptToken {
  id: string
  text: string
  kind?: 'var' | 'op' | 'paren' | 'other'
  highlight?: boolean
  isNew?: boolean
}
export interface ScriptExpressionState {
  raw: string
  tokens: ScriptToken[]
}
export interface ScriptStep {
  id: string
  law: string
  description?: string
  before: ScriptExpressionState
  after: ScriptExpressionState
}
export interface FactoringDirectionScript {
  defaultExpression: string
  steps: ScriptStep[]
}

// ============================================================================
// CharMotion Component - Animated token with law-specific styling
// ============================================================================
const CharMotion = React.forwardRef(function CharMotion(
  {
    token,
    lawId,
    layoutIdOverride,
    onEnter,
    onLeave,
  }: {
    token: ScriptToken
    lawId?: string
    layoutIdOverride?: string
    onEnter?: () => void
    onLeave?: () => void
  },
  ref: React.Ref<HTMLSpanElement>
) {
  const getTokenClass = () => {
    const baseClasses =
      'inline-block px-0.5 font-mono select-none rounded leading-none transition-all duration-300'

    // State-based highlighting with law-specific colors
    if (token.isNew && lawId) {
      return `${baseClasses} font-bold`
    }
    if (token.isNew) {
      return `${baseClasses} text-emerald-600 font-bold`
    }
    if (token.highlight && lawId) {
      return `${baseClasses} font-semibold px-1`
    }
    if (token.highlight) {
      return `${baseClasses} text-amber-600 font-semibold bg-amber-100 px-1`
    }

    // Type-based coloring
    switch (token.kind) {
      case 'var':
        return `${baseClasses} text-[var(--color-darkpurple)] dark:text-[var(--color-lightpurple)] font-medium`
      case 'op':
        return `${baseClasses} text-primary font-bold`
      case 'paren':
        return `${baseClasses} text-muted-foreground`
      default:
        return `${baseClasses} text-foreground`
    }
  }

  // Get highlight styling based on law animation
  const getHighlightStyle = () => {
    if (!token.highlight || !lawId) return {}

    const animation = getLawAnimation(lawId)
    return {
      color: animation.highlightColor,
      textShadow: `0 0 8px ${animation.highlightColor}40`,
    }
  }

  // Get animation configuration for the current law
  const lawAnimation = lawId ? getLawAnimation(lawId) : null
  const animDuration = lawAnimation?.duration ?? 1.0 // Increased for better tracking of merges

  // Define exit animation - glow first, then fade out for merge effect
  const getExitAnimation = () => {
    // Glow brightly first (filter brightness), then fade to 0
    const glowEffect = {
      filter: [
        'brightness(1)',
        'brightness(1.8)',
        'brightness(1.5)',
        'brightness(1)',
      ],
      opacity: [1, 1, 0.7, 0],
    }

    if (!lawAnimation) return glowEffect

    switch (lawAnimation.type) {
      case 'slide':
        return { ...glowEffect, x: [0, 0, 0, -20] }
      case 'bounce':
        return { ...glowEffect, y: [0, 0, 0, -15] }
      default:
        return glowEffect
    }
  }

  // Define enter animation for new tokens (no scale to avoid stretch)
  const getEnterAnimation = () => {
    if (!lawAnimation) return { opacity: 0 }

    switch (lawAnimation.type) {
      case 'fade':
        return { opacity: 0 }
      case 'scale':
        return { opacity: 0 }
      case 'flip':
        return { opacity: 0 }
      case 'rotate':
        return { opacity: 0 }
      case 'slide':
        return { opacity: 0, x: 20 }
      case 'bounce':
        return { opacity: 0, y: 15 }
      case 'pulse':
        return { opacity: 0 }
      case 'glow':
        return { opacity: 0 }
      default:
        return { opacity: 0 }
    }
  }

  return (
    <motion.span
      ref={ref}
      layout
      layoutId={layoutIdOverride ?? token.id}
      initial={token.isNew ? getEnterAnimation() : false}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      exit={getExitAnimation()}
      transition={{
        layout: {
          type: 'spring',
          stiffness: 200,
          damping: 22,
        },
        opacity: { duration: animDuration * 1.5, ease: 'easeInOut' },
        filter: { duration: animDuration * 1.5, ease: 'easeInOut' },
        x: { duration: animDuration * 1.5, ease: 'easeInOut' },
        y: { duration: animDuration * 1.5, ease: 'easeInOut' },
      }}
      className={getTokenClass()}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        ...getHighlightStyle(),
        color:
          token.isNew && lawId
            ? getLawAnimation(lawId).highlightColor
            : getHighlightStyle().color,
        fontFamily:
          "'JetBrains Mono', 'Segoe UI Symbol', 'Apple Symbols', ui-monospace, monospace",
      }}
    >
      {token.text}
    </motion.span>
  )
})

// ============================================================================
// Types for internal state
// ============================================================================
interface FactoringDemoProps {
  script?: FactoringDirectionScript
}
interface TimelineState {
  key: string
  phase: 'before' | 'after'
  step: ScriptStep
  tokens: ScriptToken[]
  raw: string
  law: string
}

// ============================================================================
// Main FactoringDemo Component
// ============================================================================
export const FactoringDemo: React.FC<FactoringDemoProps> = () => {
  // Expression state - Check localStorage for expression from circuit simulator
  const getInitialExpression = () => {
    if (typeof window !== 'undefined') {
      const savedExpression = localStorage.getItem('circuit_expression')
      if (savedExpression) {
        // Clear it after reading so it doesn't persist forever
        // but keep it for the session in case user navigates back
        return savedExpression
      }
    }
    return '(A ∨ B) ∧ (A ∨ ¬B)'
  }

  const [expressionInput, setExpressionInput] =
    React.useState<string>(getInitialExpression)
  const [loadingRemote, setLoadingRemote] = React.useState<boolean>(false)
  const [errorRemote, setErrorRemote] = React.useState<string | null>(null)
  const [remoteScript, setRemoteScript] =
    React.useState<FactoringDirectionScript | null>(null)

  // UI control states
  const [showRuleCard, setShowRuleCard] = React.useState<boolean>(false)
  const [showNarration, setShowNarration] = React.useState<boolean>(true)
  const [autoPlay, setAutoPlay] = React.useState<boolean>(false)
  const [showExamples, setShowExamples] = React.useState<boolean>(false)
  const [showSymbolHelp, setShowSymbolHelp] = React.useState<boolean>(false)
  const [showErrorModal, setShowErrorModal] = React.useState<boolean>(false)

  // Refs for DOM elements
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const visualizationRef = React.useRef<HTMLDivElement | null>(null)
  const tokenRefs = React.useRef<Map<string, HTMLElement>>(new Map())
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  // Animation state - track if animation is in progress
  const [isAnimating, setIsAnimating] = React.useState<boolean>(false)

  // ============================================================================
  // Helper Functions
  // ============================================================================

  // Tokenize a raw expression string into display tokens
  const tokenizeExpression = (expr: string): ScriptToken[] => {
    const tokens: ScriptToken[] = []
    // Standard Boolean operators only (AND, OR, NOT)
    const operators = ['∧', '∨', '¬']
    const parens = ['(', ')']

    // Use Array.from to properly handle multi-byte Unicode characters
    const chars = Array.from(expr)
    let i = 0
    let tokenIndex = 0

    while (i < chars.length) {
      const char = chars[i]

      // Skip whitespace
      if (char === ' ') {
        i++
        continue
      }

      // Check for operators (including multi-byte Unicode like ⊕, →, ↔)
      if (operators.includes(char)) {
        tokens.push({
          id: `op_${tokenIndex++}`,
          text: char,
          kind: 'op',
          highlight: false,
        })
        i++
        continue
      }

      // Check for parentheses
      if (parens.includes(char)) {
        tokens.push({
          id: `paren_${tokenIndex++}`,
          text: char,
          kind: 'paren',
          highlight: false,
        })
        i++
        continue
      }

      // Collect variable name (letters)
      if (/[A-Za-z]/.test(char)) {
        let varName = ''
        while (i < chars.length && /[A-Za-z0-9]/.test(chars[i])) {
          varName += chars[i]
          i++
        }
        // Handle T and F as special constants
        const kind = varName === 'T' || varName === 'F' ? 'other' : 'var'
        tokens.push({
          id: `var_${varName}_${tokenIndex++}`,
          text: varName,
          kind,
          highlight: false,
        })
        continue
      }

      // Skip unknown characters
      i++
    }

    return tokens
  }

  // ============================================================================
  // Token ID Stabilization - Match tokens between steps by text/position
  // ============================================================================
  const stabilizeTokenIds = (
    currentTokens: ScriptToken[],
    previousTokens: ScriptToken[]
  ): ScriptToken[] => {
    // Track which previous token IDs have been used
    const usedPrevIds = new Set<string>()
    // Map from text to available previous IDs with that text
    const textToAvailableIds: Record<string, string[]> = {}

    // Build a map of text -> available IDs from previous tokens
    previousTokens.forEach((tok) => {
      if (!textToAvailableIds[tok.text]) {
        textToAvailableIds[tok.text] = []
      }
      textToAvailableIds[tok.text].push(tok.id)
    })

    // Counter for generating new stable IDs
    let newIdCounter = 0

    return currentTokens.map((tok) => {
      const availableIds = textToAvailableIds[tok.text] || []
      // Find first unused ID with matching text
      const matchedId = availableIds.find((id) => !usedPrevIds.has(id))

      if (matchedId) {
        // Reuse the ID from previous step - this token persists
        usedPrevIds.add(matchedId)
        return { ...tok, id: matchedId, isNew: false }
      } else {
        // This is a new token - generate a stable ID based on text and position
        const stableId = `stable_${tok.text}_${tok.kind}_${newIdCounter++}`
        return { ...tok, id: stableId, isNew: true }
      }
    })
  }

  // ============================================================================
  // Timeline Computation with Stable IDs
  // ============================================================================
  const timeline = React.useMemo<TimelineState[]>(() => {
    const arr: TimelineState[] = []
    const steps = remoteScript?.steps ?? []

    // Handle case when there are no steps (expression is already simplified or can't be simplified)
    if (steps.length === 0 && remoteScript?.defaultExpression) {
      // Create tokens from the default expression for display
      const defaultTokens = tokenizeExpression(remoteScript.defaultExpression)
      arr.push({
        key: 'initial-0',
        phase: 'before',
        step: {
          id: '0',
          law: 'simplified',
          description: 'Expression is already in its simplest form',
          before: {
            raw: remoteScript.defaultExpression,
            tokens: defaultTokens,
          },
          after: { raw: remoteScript.defaultExpression, tokens: defaultTokens },
        },
        tokens: defaultTokens,
        raw: remoteScript.defaultExpression,
        law: 'simplified',
      })
      return arr
    }

    // First pass: collect all timeline states with original tokens
    const rawStates: {
      tokens: ScriptToken[]
      raw: string
      law: string
      step: ScriptStep
      phase: 'before' | 'after'
      key: string
    }[] = []

    steps.forEach((step, idx) => {
      if (idx === 0) {
        rawStates.push({
          key: `${step.id || idx}-before`,
          phase: 'before',
          step,
          tokens: step.before.tokens.map((t) => ({ ...t })),
          raw: step.before.raw,
          law: step.law,
        })
      }
      rawStates.push({
        key: `${step.id || idx}-after`,
        phase: 'after',
        step,
        tokens: step.after.tokens.map((t) => ({ ...t })),
        raw: step.after.raw,
        law: step.law,
      })
    })

    // Second pass: stabilize token IDs across consecutive states
    for (let i = 0; i < rawStates.length; i++) {
      const state = rawStates[i]
      const prevTokens = i > 0 ? arr[i - 1].tokens : []
      const stabilizedTokens = stabilizeTokenIds(state.tokens, prevTokens)

      arr.push({
        key: state.key,
        phase: state.phase,
        step: state.step,
        tokens: stabilizedTokens,
        raw: state.raw,
        law: state.law,
      })
    }

    // Debug: Log the timeline structure with stabilized IDs
    if (arr.length > 0) {
      console.log(
        '📊 Timeline structure (stabilized):',
        arr.map((t, i) => ({
          index: i,
          raw: t.raw,
          law: t.law,
          tokenCount: t.tokens.length,
          tokens: t.tokens
            .map(
              (tok) =>
                `${tok.text}(${tok.id.slice(0, 15)}${tok.isNew ? '*' : ''})`
            )
            .join(' '),
        }))
      )
    }

    return arr
  }, [remoteScript])

  const [index, setIndex] = React.useState(0)
  const maxIndex = timeline.length - 1

  // Calculate which actual step we're viewing (0 = original, 1+ = steps)
  const currentStepNumber = React.useMemo(() => {
    // Timeline structure: [step0-before, step0-after, step1-after, step2-after, ...]
    // index 0 = step 0 (START/original)
    // index 1 = step 1 (after first law)
    // index 2 = step 2 (after second law)
    // index N = step N (after Nth law)
    return index
  }, [index])

  // ============================================================================
  // Animation Logic - Simplified using Framer Motion's built-in capabilities
  // ============================================================================
  const animateToIndex = React.useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex > maxIndex) return
      if (isAnimating) return // Prevent rapid clicking during animation

      setIsAnimating(true)
      setIndex(Math.max(0, Math.min(maxIndex, newIndex)))

      // Get animation duration for the target step's law
      const targetState = timeline[Math.max(0, Math.min(maxIndex, newIndex))]
      const lawDuration = targetState?.law
        ? getLawAnimation(targetState.law).duration * 1000
        : 500

      // Clear animating flag after animation completes
      setTimeout(() => {
        setIsAnimating(false)
      }, lawDuration + 100)
    },
    [maxIndex, isAnimating, timeline]
  )

  // Auto-play functionality
  React.useEffect(() => {
    if (!autoPlay || !remoteScript || index >= maxIndex) return

    const timer = setTimeout(() => {
      animateToIndex(index + 1)
    }, 2500) // 2.5 seconds between steps

    return () => clearTimeout(timer)
  }, [autoPlay, index, maxIndex, remoteScript, animateToIndex])

  // ============================================================================
  // API Handlers
  // ============================================================================
  const fetchRemoteScript = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorRemote(null)
    setLoadingRemote(true)
    setRemoteScript(null)
    // Reset timeline to step 0 when starting a new solve
    setIndex(0)
    setIsAnimating(false)
    tokenRefs.current.clear()

    try {
      const res = await calculatorService.simplify(expressionInput)
      if (!res || !res.success) {
        setErrorRemote(res?.error || 'Failed to simplify expression')
        setShowErrorModal(true)
      } else {
        setRemoteScript(res.result as FactoringDirectionScript)
        // Auto-scroll to visualization area after solving
        setTimeout(() => {
          visualizationRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }, 100)
      }
    } catch (err) {
      setErrorRemote(String(err))
      setShowErrorModal(true)
    } finally {
      setLoadingRemote(false)
    }
  }

  const setTokenRef = (id: string) => (el: HTMLElement | null) => {
    if (el) tokenRefs.current.set(id, el)
    else tokenRefs.current.delete(id)
  }

  // Debug: Log what's being displayed and token IDs for animation debugging
  React.useEffect(() => {
    if (timeline[index]) {
      const currentTokenIds = timeline[index].tokens.map((t) => t.id)
      const prevTokenIds =
        index > 0 ? timeline[index - 1]?.tokens.map((t) => t.id) : []
      const sharedIds = currentTokenIds.filter((id) =>
        prevTokenIds.includes(id)
      )
      const newIds = currentTokenIds.filter((id) => !prevTokenIds.includes(id))
      const removedIds = prevTokenIds.filter(
        (id) => !currentTokenIds.includes(id)
      )

      console.log(`🎯 Step ${index} animation debug:`, {
        raw: timeline[index].raw,
        law: timeline[index].law,
        tokens: timeline[index].tokens
          .map((t) => `${t.text}(${t.id}${t.isNew ? '*' : ''})`)
          .join(' '),
        sharedWithPrev: sharedIds.length,
        newTokens: newIds.length,
        removedTokens: removedIds.length,
        sharedIds,
        newIds,
        removedIds,
      })
    }
  }, [index, timeline])

  // insert operator at caret position
  const insertOperator = (symbol: string) => {
    const input = inputRef.current
    if (!input) {
      // fallback: append to end
      setExpressionInput((prev) => prev + symbol)
      return
    }

    const start = input.selectionStart ?? expressionInput.length
    const end = input.selectionEnd ?? start
    const next =
      expressionInput.slice(0, start) + symbol + expressionInput.slice(end)
    setExpressionInput(next)

    // restore focus and caret after state updates
    requestAnimationFrame(() => {
      input.focus()
      const pos = start + symbol.length
      input.setSelectionRange(pos, pos)
    })
  }

  // Reset the input and UI state
  const handleReset = () => {
    setExpressionInput('')
    setRemoteScript(null)
    setIndex(0)
    setIsAnimating(false)
    setErrorRemote(null)
    setLoadingRemote(false)
    tokenRefs.current.clear()
  }

  const baseIntro = (content: string) => `
    <img src="${LeftPointSvg}" class="intro-bitbot-right" alt="Bitbot" />
    <div class="space-y-2">
      ${content}
    </div>
  `

  // Start the intro.js tutorial
  const startTutorial = () => {
    const intro = introJs()
    intro.setOptions({
      steps: [
        {
          title: '👋 Welcome to Boolean Simplifier!',
          intro: baseIntro(
            'This interactive tool helps you simplify Boolean algebra expressions step-by-step with beautiful animations. Let me show you around!'
          ),
        },
        {
          element: '.input-section',
          title: '📝 Input Expression',
          intro: baseIntro(
            'Type your Boolean expression here using variables (A, B, C...) and operators. You can type them directly or use the quick insert buttons below.'
          ),
          position: 'bottom',
        },
        {
          element: '.quick-insert',
          title: '⚡ Quick Insert Buttons',
          intro: baseIntro(
            '<strong>Hover over any button</strong> to see alternative ways to write that symbol! For example, AND (∧) can also be written as ^, ·, or &. Click the <strong>Symbol Guide</strong> button for a complete reference.'
          ),
          position: 'bottom',
        },
        {
          element: '.examples-button',
          title: '💡 Example Expressions',
          intro: baseIntro(
            'Not sure what to try? Click here to see example expressions you can use to get started.'
          ),
          position: 'bottom',
        },
        {
          element: '.simplify-button',
          title: '🚀 Simplify',
          intro: baseIntro(
            "Once you've entered an expression, click here to simplify it! The tool will break down each step using Boolean algebra laws."
          ),
          position: 'bottom',
        },
        {
          element: '.display-options',
          title: '⚙️ Display Options',
          intro: baseIntro(
            'Toggle these options to show/hide the Rule Card (details about each law), Explanation (step description), and Auto-play (automatic progression through steps).'
          ),
          position: 'top',
        },
        {
          element: '.expression-display',
          title: '🎨 Expression Display',
          intro: baseIntro(
            "Your expression appears here with animated transitions! Each step is color-coded by the law being applied. New tokens appear in the law's highlight color."
          ),
          position: 'bottom',
        },
        {
          element: '.progress-timeline',
          title: '📊 Timeline Navigation',
          intro: baseIntro(
            'Navigate through simplification steps here. Each dot represents a step. Click any dot to jump to that step, or use the arrow buttons to move forward/backward.'
          ),
          position: 'top',
        },
        {
          title: '✨ Law-Specific Animations',
          intro: baseIntro(
            'Each Boolean law has its own color and animation style! Watch as tokens smoothly transition between steps, making it easy to see what changed and why.'
          ),
        },
        {
          title: '🎓 Ready to Simplify!',
          intro: baseIntro(
            'You\'re all set! Try entering an expression like "A ∧ A" or "¬(A ∨ B)" and watch the magic happen. Click the help button (?) anytime to see this tutorial again.'
          ),
        },
      ],
      showProgress: false,
      showBullets: true,
      exitOnOverlayClick: false,
      doneLabel: 'Got it!',
      nextLabel: 'Next',
      prevLabel: 'Back',
      skipLabel: 'Skip',
    })
    intro.start()
  }

  return (
    <div className="w-full mx-auto relative">
      {/* Help Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          type="button"
          onClick={startTutorial}
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9"
          title="Show Tutorial"
        >
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Examples Panel */}
      <ExamplesPanel
        isOpen={showExamples}
        onClose={() => setShowExamples(false)}
        onSelectExample={(expression) => {
          setExpressionInput(expression)
          setShowExamples(false)
        }}
      />

      {/* Main Layout */}
      <div className="p-4 md:p-8 relative">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Input Section */}
          <form onSubmit={fetchRemoteScript} className="space-y-3">
            {/* Main Input Row */}
            <div className="flex gap-2 input-section">
              <input
                ref={inputRef}
                value={expressionInput}
                onChange={(e) => setExpressionInput(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-input rounded-lg text-base font-mono focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all bg-background text-foreground placeholder:text-muted-foreground"
                placeholder="e.g. A ∧ B ∨ ¬A"
                aria-label="Boolean expression"
              />
              <Button
                variant="default"
                type="submit"
                className="simplify-button px-6 cursor-pointer"
                disabled={loadingRemote}
              >
                {loadingRemote ? 'Solving...' : 'Solve'}
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => setShowExamples(true)}
                className="examples-button px-4 cursor-pointer text-muted-foreground"
              >
                Examples
              </Button>
              <Button
                variant="ghost"
                onClick={handleReset}
                className="px-3 cursor-pointer text-muted-foreground"
                title="Reset"
              >
                ↺
              </Button>
            </div>

            {/* Quick Insert - Compact */}
            <div className="flex flex-wrap items-center gap-1.5 quick-insert">
              <span className="text-xs text-muted-foreground mr-2">
                Insert:
              </span>
              {QUICK_INSERT_SYMBOLS.map((sym) => (
                <SymbolHelpTooltip key={sym} symbol={sym}>
                  <button
                    type="button"
                    onClick={() => insertOperator(sym)}
                    className="px-2.5 py-1 border border-border rounded text-sm bg-muted/30 hover:bg-muted hover:border-muted-foreground/30 transition-colors font-mono cursor-pointer"
                    aria-label={`Insert ${sym}`}
                  >
                    {sym}
                  </button>
                </SymbolHelpTooltip>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSymbolHelp(true)}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                title="Symbol Reference Guide"
              >
                <BookOpen className="h-3.5 w-3.5 mr-1" />
                Guide
              </Button>
            </div>

            {/* Display Options - Minimal */}
            <div className="flex items-center gap-6 text-sm display-options pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="rulecard-toggle"
                  checked={showRuleCard}
                  onCheckedChange={setShowRuleCard}
                  className="scale-90"
                />
                <Label
                  htmlFor="rulecard-toggle"
                  className="cursor-pointer text-xs text-muted-foreground"
                >
                  Rule Card
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="narration-toggle"
                  checked={showNarration}
                  onCheckedChange={setShowNarration}
                  className="scale-90"
                />
                <Label
                  htmlFor="narration-toggle"
                  className="cursor-pointer text-xs text-muted-foreground"
                >
                  Explanation
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="autoplay-toggle"
                  checked={autoPlay}
                  onCheckedChange={setAutoPlay}
                  className="scale-90"
                />
                <Label
                  htmlFor="autoplay-toggle"
                  className="cursor-pointer text-xs text-muted-foreground"
                >
                  Auto-play
                </Label>
              </div>
            </div>
          </form>

          {/* Symbol Help Modal */}
          <SymbolHelpModal
            isOpen={showSymbolHelp}
            onClose={() => setShowSymbolHelp(false)}
          />

          {/* Error Modal */}
          <ErrorModal
            isOpen={showErrorModal}
            onClose={() => setShowErrorModal(false)}
            onOpenExamples={() => setShowExamples(true)}
            errorMessage={errorRemote || undefined}
          />

          {/* Main Visualization Area */}
          <div
            ref={visualizationRef}
            className="rounded-lg border border-border relative min-h-[280px]"
          >
            <div ref={containerRef} className="relative">
              {remoteScript == null ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <div className="text-4xl mb-3 text-muted-foreground/30">
                    ∅
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter an expression and click Solve to begin
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {/* Simplified Banner */}
                  <SimplifiedBanner
                    expression={remoteScript.defaultExpression}
                    isVisible={remoteScript.steps.length === 0}
                  />

                  {/* Expression Display */}
                  <div className="overflow-hidden">
                    {/* Expression */}
                    <div className="p-6 md:p-8 expression-display">
                      <div className="p-6 md:p-8 min-h-20 flex items-center justify-center">
                        <LayoutGroup>
                          <motion.div
                            layout
                            className="flex flex-wrap items-center justify-center gap-1 text-2xl md:text-3xl font-mono"
                          >
                            <AnimatePresence mode="sync">
                              {/* Display current timeline state tokens */}
                              {timeline[index]?.tokens.map((tok) => (
                                <CharMotion
                                  key={tok.id}
                                  ref={setTokenRef(tok.id)}
                                  token={tok}
                                  lawId={timeline[index]?.law}
                                />
                              ))}
                            </AnimatePresence>
                          </motion.div>
                        </LayoutGroup>
                      </div>
                    </div>

                    {/* Timeline & Navigation Controls */}
                    <div className="border-t border-border progress-timeline">
                      <ProgressTimeline
                        steps={remoteScript.steps}
                        currentStepIndex={currentStepNumber}
                        onStepClick={(stepIdx) => {
                          animateToIndex(stepIdx)
                        }}
                        originalExpression={remoteScript.defaultExpression}
                        showRuleCard={showRuleCard}
                        onNavigate={(direction) => {
                          switch (direction) {
                            case 'first':
                              animateToIndex(0)
                              break
                            case 'prev':
                              animateToIndex(index - 1)
                              break
                            case 'next':
                              animateToIndex(index + 1)
                              break
                            case 'last':
                              animateToIndex(maxIndex)
                              break
                          }
                        }}
                        canGoPrev={index > 0}
                        canGoNext={index < maxIndex}
                      />
                    </div>
                  </div>

                  {/* Step Narration - Inline */}
                  {showNarration && timeline[index] && timeline[index].step && (
                    <div>
                      <StepNarration
                        step={timeline[index].step}
                        stepNumber={currentStepNumber}
                        totalSteps={remoteScript.steps.length}
                        nextStepPreview={timeline[index + 1]?.step}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FactoringDemo
