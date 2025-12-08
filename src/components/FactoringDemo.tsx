import React from 'react'
import { motion } from 'motion/react'
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
      return `${baseClasses} font-bold scale-110`
    }
    if (token.isNew) {
      return `${baseClasses} text-emerald-600 font-bold scale-110 animate-pulse`
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

  return (
    <motion.span
      ref={ref}
      layout
      layoutId={layoutIdOverride ?? token.id}
      initial={{ opacity: token.isNew ? 0 : 1, scale: token.isNew ? 0.8 : 1 }}
      animate={{ 
        opacity: 1, 
        scale: token.highlight ? 1.1 : 1,
      }}
      transition={{
        layout: {
          duration: lawId ? getLawAnimation(lawId).duration : 0.4,
          ease: 'easeInOut',
        },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3, ease: 'easeOut' },
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
type DOMRectLike = { left: number; top: number; width: number; height: number }

// ============================================================================
// Main FactoringDemo Component
// ============================================================================
export const FactoringDemo: React.FC<FactoringDemoProps> = () => {
  // Expression state
  const [expressionInput, setExpressionInput] =
    React.useState<string>('(A ∨ B) ∧ (A ∨ ¬B)')
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

  // Animation state
  const [clones, setClones] = React.useState<
    Array<{
      key: string
      text: string
      from: DOMRectLike
      to: DOMRectLike
      lawId?: string
    }>
  >([])
  const pendingFromRects = React.useRef<Map<string, DOMRectLike>>(new Map())
  const pendingMappings = React.useRef<Map<string, string>>(new Map())

  // ============================================================================
  // Helper Functions
  // ============================================================================
  const getRelativeRect = (el: HTMLElement | null): DOMRectLike | null => {
    if (!el || !containerRef.current) return null
    const c = containerRef.current.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    return {
      left: r.left - c.left,
      top: r.top - c.top,
      width: r.width,
      height: r.height,
    }
  }

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
  // Timeline Computation
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

    steps.forEach((step, idx) => {
      const beforeIds = new Set(step.before.tokens.map((t) => t.id))
      const beforeTokens = step.before.tokens.map((t) => ({ ...t }))
      const afterTokens = step.after.tokens.map((t) => ({
        ...t,
        isNew: !beforeIds.has(t.id),
      }))
      // Only add 'before' state for the very first step (original expression)
      if (idx === 0) {
        arr.push({
          key: `${step.id || idx}-before`,
          phase: 'before',
          step,
          tokens: beforeTokens,
          raw: step.before.raw,
          law: step.law,
        })
      }
      // Always add 'after' state (the result after applying the law)
      arr.push({
        key: `${step.id || idx}-after`,
        phase: 'after',
        step,
        tokens: afterTokens,
        raw: step.after.raw,
        law: step.law,
      })
    })

    // Debug: Log the timeline structure
    if (arr.length > 0) {
      console.log(
        '📊 Timeline structure:',
        arr.map((t, i) => ({
          index: i,
          raw: t.raw,
          law: t.law,
          tokenCount: t.tokens.length,
          tokens: t.tokens.map((tok) => tok.text).join(' '),
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

  // Auto-play functionality
  React.useEffect(() => {
    if (!autoPlay || !remoteScript || index >= maxIndex) return

    const timer = setTimeout(() => {
      animateToIndex(index + 1)
    }, 2500) // 2.5 seconds between steps

    return () => clearTimeout(timer)
  }, [autoPlay, index, maxIndex, remoteScript])

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
    setClones([])
    tokenRefs.current.clear()
    pendingFromRects.current = new Map()
    pendingMappings.current = new Map()

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

  // ============================================================================
  // Animation Logic
  // ============================================================================
  const animateToIndex = (newIndex: number) => {
    if (newIndex < 0 || newIndex > maxIndex) return
    const prev = timeline[index]
    if (!prev) {
      setIndex(Math.max(0, Math.min(maxIndex, newIndex)))
      return
    }

    const from = new Map<string, DOMRectLike>()
    prev.tokens.forEach((t) => {
      const el = tokenRefs.current.get(t.id) || null
      const r = getRelativeRect(el)
      if (r) from.set(t.id, r)
    })

    const target = timeline[Math.max(0, Math.min(maxIndex, newIndex))]
    const mappings = new Map<string, string>()
    const destUsed = new Set<string>()

    // exact id match
    prev.tokens.forEach((s) => {
      if (target.tokens.find((d) => d.id === s.id)) {
        mappings.set(s.id, s.id)
        destUsed.add(s.id)
      }
    })
    // match by text remaining
    prev.tokens.forEach((s) => {
      if (mappings.has(s.id)) return
      const m = target.tokens.find(
        (d) => !destUsed.has(d.id) && d.text === s.text
      )
      if (m) {
        mappings.set(s.id, m.id)
        destUsed.add(m.id)
      }
    })

    pendingFromRects.current = from
    pendingMappings.current = mappings
    setIndex(Math.max(0, Math.min(maxIndex, newIndex)))
  }

  React.useLayoutEffect(() => {
    const state = timeline[index]
    if (!state) return
    const to = new Map<string, DOMRectLike>()
    state.tokens.forEach((t) => {
      const r = getRelativeRect(tokenRefs.current.get(t.id) || null)
      if (r) to.set(t.id, r)
    })

    const from = pendingFromRects.current
    const mappings = pendingMappings.current
    if (!from || from.size === 0) {
      pendingFromRects.current = new Map()
      pendingMappings.current = new Map()
      return
    }

    const toSpawn: typeof clones = []
    for (const [srcId, fromRect] of from.entries()) {
      const destId = mappings.get(srcId) ?? srcId
      const toRect = to.get(destId)
      if (!toRect) continue
      // determine text from previous state or current
      const prevState = timeline[Math.max(0, index - 1)]
      const text =
        prevState?.tokens.find((t) => t.id === srcId)?.text ??
        state.tokens.find((t) => t.id === destId)?.text ??
        ''
      toSpawn.push({
        key: `${srcId}-${Date.now()}`,
        text,
        from: fromRect,
        to: toRect,
        lawId: state.law, // Include law for animation styling
      })
    }

    if (toSpawn.length > 0) {
      setClones((prev) => prev.concat(toSpawn))
      pendingFromRects.current = new Map()
      pendingMappings.current = new Map()
      // Adjust timeout based on law animation duration
      const lawDuration = state.law
        ? getLawAnimation(state.law).duration * 1000
        : 450
      setTimeout(() => {
        setClones((prev) => prev.slice(toSpawn.length))
      }, lawDuration + 100)
    } else {
      pendingFromRects.current = new Map()
      pendingMappings.current = new Map()
    }
  }, [index, timeline])

  const setTokenRef = (id: string) => (el: HTMLElement | null) => {
    if (el) tokenRefs.current.set(id, el)
    else tokenRefs.current.delete(id)
  }

  // Debug: Log what's being displayed
  React.useEffect(() => {
    if (timeline[index]) {
      console.log(`🎯 Displaying step ${index}:`, {
        raw: timeline[index].raw,
        law: timeline[index].law,
        tokenCount: timeline[index].tokens.length,
        tokens: timeline[index].tokens
          .map((t) => `${t.text}(${t.id})`)
          .join(' '),
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
    setClones([])
    setErrorRemote(null)
    setLoadingRemote(false)
    tokenRefs.current.clear()
    pendingFromRects.current = new Map()
    pendingMappings.current = new Map()
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
                        <div className="flex flex-wrap items-center justify-center gap-1 text-2xl md:text-3xl font-mono">
                          {/* Display current timeline state tokens */}
                          {timeline[index]?.tokens.map((tok, tokIdx) => (
                            <CharMotion
                              key={`${index}-${tok.id}-${tokIdx}`}
                              ref={setTokenRef(tok.id)}
                              token={tok}
                              lawId={timeline[index]?.law}
                            />
                          ))}
                        </div>
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
