import React from 'react'
import { motion } from 'framer-motion'
import { calculatorService } from '../services/calculator.service'
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import RuleCard from './calculator/RuleCard';
import StepNarration from './calculator/StepNarration';
import ProgressTimeline from './calculator/ProgressTimeline';
import ExamplesPanel from './calculator/ExamplesPanel';
import { getLawAnimation } from '@/constants/lawAnimations';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import { HelpCircle } from 'lucide-react';
import LeftPointSvg from '@/assets/bitbot/left-point.svg?url'

// Types
export interface ScriptToken { id: string; text: string; kind?: 'var' | 'op' | 'paren' | 'other'; highlight?: boolean; isNew?: boolean }
export interface ScriptExpressionState { raw: string; tokens: ScriptToken[] }
export interface ScriptStep { id: string; law: string; description?: string; before: ScriptExpressionState; after: ScriptExpressionState }
export interface FactoringDirectionScript { defaultExpression: string; steps: ScriptStep[] }

// Token component with enhanced visual styling and law-specific animations
const CharMotion = React.forwardRef(function CharMotion(
  { token, lawId, layoutIdOverride, onEnter, onLeave }: { 
    token: ScriptToken; 
    lawId?: string;
    layoutIdOverride?: string; 
    onEnter?: () => void; 
    onLeave?: () => void 
  },
  ref: React.Ref<HTMLSpanElement>
) {
  // Enhanced color-coding based on token state and type
  const getTokenClass = () => {
    const baseClasses = 'inline-block px-0.5 font-mono select-none rounded leading-none transition-all duration-300';
    
    // State-based highlighting with law-specific colors
    if (token.isNew && lawId) {
      // Law-specific animation exists
      return `${baseClasses} font-bold scale-110`;
    }
    if (token.isNew) {
      return `${baseClasses} text-emerald-600 font-bold scale-110 animate-pulse`;
    }
    if (token.highlight && lawId) {
      // Law-specific highlighting
      return `${baseClasses} font-semibold px-1`;
    }
    if (token.highlight) {
      return `${baseClasses} text-amber-600 font-semibold bg-amber-100 px-1`;
    }
    
    // Type-based coloring
    switch (token.kind) {
      case 'var':
        return `${baseClasses} text-[var(--color-darkpurple)] dark:text-[var(--color-lightpurple)] font-medium`;
      case 'op':
        return `${baseClasses} text-primary font-bold`;
      case 'paren':
        return `${baseClasses} text-muted-foreground`;
      default:
        return `${baseClasses} text-foreground`;
    }
  };

  return (
    <motion.span
      ref={ref}
      layout
      layoutId={layoutIdOverride ?? token.id}
      initial={false}
      animate={false}
      transition={{ 
        layout: { duration: lawId ? getLawAnimation(lawId).duration : 0.4, ease: 'easeInOut' }
      }}
      className={getTokenClass()}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        color: token.isNew && lawId ? getLawAnimation(lawId).highlightColor : undefined
      }}
    >
      {token.text}
    </motion.span>
  )
})

interface FactoringDemoProps { script?: FactoringDirectionScript }
interface TimelineState { key: string; phase: 'before' | 'after'; step: ScriptStep; tokens: ScriptToken[]; raw: string; law: string }

export const FactoringDemo: React.FC<FactoringDemoProps> = () => {
  const [expressionInput, setExpressionInput] = React.useState<string>('(A ∨ B) ∧ (A ∨ ¬B)')
  const [loadingRemote, setLoadingRemote] = React.useState<boolean>(false)
  const [errorRemote, setErrorRemote] = React.useState<string | null>(null)
  const [remoteScript, setRemoteScript] = React.useState<FactoringDirectionScript | null>(null)
  
  // UI control states
  const [showRuleCard, setShowRuleCard] = React.useState<boolean>(true)
  const [showNarration, setShowNarration] = React.useState<boolean>(true)
  const [autoPlay, setAutoPlay] = React.useState<boolean>(false)
  const [showExamples, setShowExamples] = React.useState<boolean>(false)

  // ref to the text input so we can insert symbols at the caret
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const visualizationRef = React.useRef<HTMLDivElement | null>(null)

  const tokenRefs = React.useRef<Map<string, HTMLElement>>(new Map())
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const [clones, setClones] = React.useState<Array<{ key: string; text: string; from: DOMRectLike; to: DOMRectLike; lawId?: string }>>([])
  type DOMRectLike = { left: number; top: number; width: number; height: number }

  const pendingFromRects = React.useRef<Map<string, DOMRectLike>>(new Map())
  const pendingMappings = React.useRef<Map<string, string>>(new Map())

  const getRelativeRect = (el: HTMLElement | null): DOMRectLike | null => {
    if (!el || !containerRef.current) return null
    const c = containerRef.current.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    return { left: r.left - c.left, top: r.top - c.top, width: r.width, height: r.height }
  }

  const timeline = React.useMemo<TimelineState[]>(() => {
    const arr: TimelineState[] = []
    const steps = remoteScript?.steps ?? []
    steps.forEach((step, idx) => {
      const beforeIds = new Set(step.before.tokens.map(t => t.id))
      const beforeTokens = step.before.tokens.map(t => ({ ...t }))
      const afterTokens = step.after.tokens.map(t => ({ ...t, isNew: !beforeIds.has(t.id) }))
      // Only add 'before' state for the very first step (original expression)
      if (idx === 0) {
        arr.push({ 
          key: `${step.id || idx}-before`, 
          phase: 'before', 
          step, 
          tokens: beforeTokens, 
          raw: step.before.raw, 
          law: step.law 
        })
      }
      // Always add 'after' state (the result after applying the law)
      arr.push({ 
        key: `${step.id || idx}-after`, 
        phase: 'after', 
        step, 
        tokens: afterTokens, 
        raw: step.after.raw, 
        law: step.law 
      })
    })
    
    // Debug: Log the timeline structure
    if (arr.length > 0) {
      console.log('📊 Timeline structure:', arr.map((t, i) => ({
        index: i,
        raw: t.raw,
        law: t.law,
        tokenCount: t.tokens.length,
        tokens: t.tokens.map(tok => tok.text).join(' ')
      })));
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
    return index;
  }, [index]);

  // Auto-play functionality
  React.useEffect(() => {
    if (!autoPlay || !remoteScript || index >= maxIndex) return;
    
    const timer = setTimeout(() => {
      animateToIndex(index + 1);
    }, 2500); // 2.5 seconds between steps
    
    return () => clearTimeout(timer);
  }, [autoPlay, index, maxIndex, remoteScript]);

  // fetch
  const fetchRemoteScript = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorRemote(null)
    setLoadingRemote(true)
    setRemoteScript(null)
    try {
      const res = await calculatorService.simplify(expressionInput)
      if (!res || !res.success) setErrorRemote(res?.error || 'failed')
      else {
        setRemoteScript(res.result as FactoringDirectionScript)
        // Auto-scroll to visualization area after solving
        setTimeout(() => {
          visualizationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    } catch (err) {
      setErrorRemote(String(err))
    } finally { setLoadingRemote(false) }
  }

  // animate: capture from rects, compute mappings by id or text, update index, then spawn clones
  const animateToIndex = (newIndex: number) => {
    if (newIndex < 0 || newIndex > maxIndex) return
    const prev = timeline[index]
    if (!prev) { setIndex(Math.max(0, Math.min(maxIndex, newIndex))); return }

    const from = new Map<string, DOMRectLike>()
    prev.tokens.forEach(t => {
      const el = tokenRefs.current.get(t.id) || null
      const r = getRelativeRect(el)
      if (r) from.set(t.id, r)
    })

    const target = timeline[Math.max(0, Math.min(maxIndex, newIndex))]
    const mappings = new Map<string, string>()
    const destUsed = new Set<string>()

    // exact id match
    prev.tokens.forEach(s => { if (target.tokens.find(d => d.id === s.id)) { mappings.set(s.id, s.id); destUsed.add(s.id) } })
    // match by text remaining
    prev.tokens.forEach(s => {
      if (mappings.has(s.id)) return
      const m = target.tokens.find(d => !destUsed.has(d.id) && d.text === s.text)
      if (m) { mappings.set(s.id, m.id); destUsed.add(m.id) }
    })

    pendingFromRects.current = from
    pendingMappings.current = mappings
    setIndex(Math.max(0, Math.min(maxIndex, newIndex)))
  }

  React.useLayoutEffect(() => {
    const state = timeline[index]
    if (!state) return
    const to = new Map<string, DOMRectLike>()
    state.tokens.forEach(t => { const r = getRelativeRect(tokenRefs.current.get(t.id) || null); if (r) to.set(t.id, r) })

    const from = pendingFromRects.current
    const mappings = pendingMappings.current
    if (!from || from.size === 0) { pendingFromRects.current = new Map(); pendingMappings.current = new Map(); return }

    const toSpawn: typeof clones = []
    for (const [srcId, fromRect] of from.entries()) {
      const destId = mappings.get(srcId) ?? srcId
      const toRect = to.get(destId)
      if (!toRect) continue
      // determine text from previous state or current
      const prevState = timeline[Math.max(0, index - 1)]
      const text = (prevState?.tokens.find(t => t.id === srcId)?.text) ?? state.tokens.find(t => t.id === destId)?.text ?? ''
      toSpawn.push({ 
        key: `${srcId}-${Date.now()}`, 
        text, 
        from: fromRect, 
        to: toRect,
        lawId: state.law  // Include law for animation styling
      })
    }

    if (toSpawn.length > 0) {
      setClones(prev => prev.concat(toSpawn))
      pendingFromRects.current = new Map()
      pendingMappings.current = new Map()
      // Adjust timeout based on law animation duration
      const lawDuration = state.law ? getLawAnimation(state.law).duration * 1000 : 450
      setTimeout(() => { setClones(prev => prev.slice(toSpawn.length)) }, lawDuration + 100)
    } else {
      pendingFromRects.current = new Map()
      pendingMappings.current = new Map()
    }
  }, [index, timeline])

  const setTokenRef = (id: string) => (el: HTMLElement | null) => { if (el) tokenRefs.current.set(id, el); else tokenRefs.current.delete(id) }

  // Debug: Log what's being displayed
  React.useEffect(() => {
    if (timeline[index]) {
      console.log(`🎯 Displaying step ${index}:`, {
        raw: timeline[index].raw,
        law: timeline[index].law,
        tokenCount: timeline[index].tokens.length,
        tokens: timeline[index].tokens.map(t => `${t.text}(${t.id})`).join(' ')
      });
    }
  }, [index, timeline]);

  // insert operator at caret position
  const insertOperator = (symbol: string) => {
    const input = inputRef.current
    if (!input) {
      // fallback: append to end
      setExpressionInput(prev => prev + symbol)
      return
    }

    const start = input.selectionStart ?? expressionInput.length
    const end = input.selectionEnd ?? start
    const next = expressionInput.slice(0, start) + symbol + expressionInput.slice(end)
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
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          title: '👋 Welcome to Boolean Simplifier!',
          intro: baseIntro('This interactive tool helps you simplify Boolean algebra expressions step-by-step with beautiful animations. Let me show you around!'),
        },
        {
          element: '.input-section',
          title: '📝 Input Expression',
          intro: baseIntro('Type your Boolean expression here using variables (A, B, C...) and operators. You can type them directly or use the quick insert buttons below.'),
          position: 'bottom'
        },
        {
          element: '.quick-insert',
          title: '⚡ Quick Insert Buttons',
          intro: baseIntro('Click these buttons to quickly insert Boolean operators: ∧ (AND), ∨ (OR), ¬ (NOT), ⊕ (XOR), → (IMPLIES), ↔ (IFF), and parentheses.'),
          position: 'bottom'
        },
        {
          element: '.examples-button',
          title: '💡 Example Expressions',
          intro: baseIntro('Not sure what to try? Click here to see example expressions you can use to get started.'),
          position: 'bottom'
        },
        {
          element: '.simplify-button',
          title: '🚀 Simplify',
          intro: baseIntro('Once you\'ve entered an expression, click here to simplify it! The tool will break down each step using Boolean algebra laws.'),
          position: 'bottom'
        },
        {
          element: '.display-options',
          title: '⚙️ Display Options',
          intro: baseIntro('Toggle these options to show/hide the Rule Card (details about each law), Explanation (step description), and Auto-play (automatic progression through steps).'),
          position: 'top'
        },
        {
          element: '.expression-display',
          title: '🎨 Expression Display',
          intro: baseIntro('Your expression appears here with animated transitions! Each step is color-coded by the law being applied. New tokens appear in the law\'s highlight color.'),
          position: 'bottom'
        },
        {
          element: '.progress-timeline',
          title: '📊 Timeline Navigation',
          intro: baseIntro('Navigate through simplification steps here. Each dot represents a step. Click any dot to jump to that step, or use the arrow buttons to move forward/backward.'),
          position: 'top'
        },
        {
          title: '✨ Law-Specific Animations',
          intro: baseIntro('Each Boolean law has its own color and animation style! Watch as tokens smoothly transition between steps, making it easy to see what changed and why.')
        },
        {
          title: '🎓 Ready to Simplify!',
          intro: baseIntro('You\'re all set! Try entering an expression like "A ∧ A" or "¬(A ∨ B)" and watch the magic happen. Click the help button (?) anytime to see this tutorial again.')
        }
      ],
      showProgress: false,
      showBullets: true,
      exitOnOverlayClick: false,
      doneLabel: 'Got it!',
      nextLabel: 'Next',
      prevLabel: 'Back',
      skipLabel: 'Skip'
    });
    intro.start();
  };

  return (
    <div className="p-3 md:p-6 rounded-xl w-full max-w-7xl mx-auto space-y-4 md:space-y-6 mt-0 pt-0">
      {/* Header with Help Button */}
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={startTutorial}
          variant="outline"
          size="icon"
          className="rounded-full w-9 h-9 md:w-10 md:h-10 shadow-sm hover:shadow-md hover:bg-primary/10 hover:border-primary transition-all"
          title="Show Tutorial"
        >
          <HelpCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
        </Button>
      </div>

      {/* Examples Panel */}
      <ExamplesPanel
        isOpen={showExamples}
        onClose={() => setShowExamples(false)}
        onSelectExample={(expression) => {
          setExpressionInput(expression);
          setShowExamples(false);
        }}
      />

      {/* Input Section */}
      <div className="space-y-3">
        <form onSubmit={fetchRemoteScript} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center input-section">
            <input
              ref={inputRef}
              value={expressionInput}
              onChange={(e) => setExpressionInput(e.target.value)}
              className="flex-1 px-3 md:px-4 py-2 md:py-3 border-2 border-input rounded-lg text-base md:text-lg font-mono focus:border-primary focus:outline-none transition-colors bg-background text-foreground"
              placeholder="Enter expression (e.g. A ∧ B ∨ ¬A)"
              aria-label="Boolean expression"
            />
            <div className="flex gap-2">
              <Button variant={"default"} type="submit" className="simplify-button flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 h-auto text-sm md:text-base" disabled={loadingRemote}>
                {loadingRemote ? 'Solving...' : 'Solve'}
              </Button>
              <Button 
                variant={"secondary"} 
                type="button"
                onClick={() => setShowExamples(true)} 
                className="examples-button flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 h-auto text-sm md:text-base"
              >
                Examples
              </Button>
              <Button variant={"outline"} onClick={handleReset} className="px-3 md:px-6 py-2 md:py-3 h-auto border-2 text-sm md:text-base hover:bg-muted/50">
                ↺
              </Button>
            </div>
          </div>

          {/* Quick operator buttons */}
          <div className="flex flex-wrap gap-2 quick-insert">
            <span className="text-xs md:text-sm text-muted-foreground font-medium self-center mr-1 md:mr-2 w-full sm:w-auto">Quick insert:</span>
            {['∧','∨','¬','⊕','→','↔','(',')'].map(sym => (
              <button
                key={sym}
                type="button"
                onClick={() => insertOperator(sym)}
                className="px-2 md:px-3 py-1 md:py-1.5 border-2 border-border rounded-md text-sm md:text-base bg-background hover:bg-primary/10 hover:border-primary dark:hover:bg-primary/20 transition-colors font-mono font-bold text-foreground flex-1 sm:flex-none min-w-10"
                aria-label={`Insert ${sym}`}>
                {sym}
              </button>
            ))}
          </div>

          {/* Display Options - Compact */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm bg-muted/30 dark:bg-muted/20 rounded-lg p-2 md:p-3 border border-border display-options">
            <span className="text-xs font-semibold text-muted-foreground uppercase w-full sm:w-auto">Display:</span>
            <div className="flex items-center gap-2">
              <Switch
                id="rulecard-toggle"
                checked={showRuleCard}
                onCheckedChange={setShowRuleCard}
              />
              <Label htmlFor="rulecard-toggle" className="cursor-pointer text-xs md:text-sm">Rule Card</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="narration-toggle"
                checked={showNarration}
                onCheckedChange={setShowNarration}
              />
              <Label htmlFor="narration-toggle" className="cursor-pointer text-xs md:text-sm">Explanation</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="autoplay-toggle"
                checked={autoPlay}
                onCheckedChange={setAutoPlay}
              />
              <Label htmlFor="autoplay-toggle" className="cursor-pointer text-xs md:text-sm">Auto-play</Label>
            </div>
          </div>
        </form>
        {errorRemote && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-3 text-sm md:text-base text-red-700 dark:text-red-400">
            <span className="font-semibold">Error:</span> {errorRemote}
          </div>
        )}
      </div>


      {/* Main Visualization Area */}
      <div ref={visualizationRef} className="bg-card dark:bg-card rounded-lg border-2 border-border p-3 md:p-6 relative min-h-[300px] md:min-h-[400px]">
        <div ref={containerRef} className="relative">
        {remoteScript == null ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center px-4">
            <div className="text-5xl md:text-6xl mb-4 font-bold text-muted dark:text-muted">∅</div>
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">Ready to Simplify!</h3>
            <p className="text-sm md:text-base text-muted-foreground">Enter a Boolean expression above and click Solve to see step-by-step simplification.</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {/* Rule Card */}
            {showRuleCard && timeline[index] && (
              <RuleCard
                lawId={timeline[index].law}
                isVisible={true}
                beforeExpression={timeline[index].step?.before?.raw}
                afterExpression={timeline[index].step?.after?.raw}
                compact={false}
              />
            )}

            {/* Expression Display with Timeline & Controls - All in One */}
            <div className="bg-card rounded-lg border-2 border-border overflow-hidden">
              {/* Header */}
              <div className="bg-linear-to-r from-primary to-accent text-primary-foreground px-3 md:px-4 py-2">
                <h4 className="text-xs md:text-sm font-semibold uppercase tracking-wide">Current Expression</h4>
              </div>
              
              {/* Expression */}
              <div className="p-4 md:p-8 expression-display">
                <div className="bg-linear-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 rounded-lg p-4 md:p-8 border-2 min-h-16 md:min-h-24 flex items-center justify-center relative overflow-hidden"
                  style={{
                    borderColor: timeline[index]?.law && index > 0 
                      ? getLawAnimation(timeline[index].law).highlightColor 
                      : 'var(--border)'
                  }}
                >
                  {/* Law color indicator bar */}
                  {timeline[index]?.law && index > 0 && (
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: getLawAnimation(timeline[index].law).highlightColor }}
                    />
                  )}
                  
                  <div className="flex flex-wrap items-center justify-center gap-0.5 md:gap-1 text-xl md:text-3xl font-mono relative z-10">
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
                
                {/* Law animation description */}
                {timeline[index]?.law && index > 0 && (
                  <div className="mt-3 text-center text-xs md:text-sm italic"
                    style={{ color: getLawAnimation(timeline[index].law).highlightColor }}
                  >
                    {getLawAnimation(timeline[index].law).description}
                  </div>
                )}
              </div>

              {/* Timeline & Navigation Controls */}
              <div className="border-t progress-timeline">
                <ProgressTimeline
                  steps={remoteScript.steps}
                  currentStepIndex={currentStepNumber}
                  onStepClick={(stepIdx) => {
                    // Direct 1:1 mapping between step index and timeline index
                    animateToIndex(stepIdx);
                  }}
                  originalExpression={remoteScript.defaultExpression}
                  onNavigate={(direction) => {
                    switch (direction) {
                      case 'first':
                        animateToIndex(0);
                        break;
                      case 'prev':
                        animateToIndex(index - 1);
                        break;
                      case 'next':
                        animateToIndex(index + 1);
                        break;
                      case 'last':
                        animateToIndex(maxIndex);
                        break;
                    }
                  }}
                  canGoPrev={index > 0}
                  canGoNext={index < maxIndex}
                />
              </div>
            </div>

            {/* Step Narration */}
            {showNarration && timeline[index] && timeline[index].step && (
              <StepNarration
                step={timeline[index].step}
                stepNumber={currentStepNumber}
                totalSteps={remoteScript.steps.length}
                nextStepPreview={timeline[index + 1]?.step}
              />
            )}

            {/* History View */}
            <details className="group">
              <summary className="cursor-pointer text-xs md:text-sm font-semibold text-foreground hover:text-primary dark:hover:text-primary flex items-center gap-2">
                <span className="group-open:rotate-90 transition-transform">▶</span>
                View Full Simplification History ({remoteScript.steps.length} steps)
              </summary>
              <div className="mt-4 space-y-3 pl-4 md:pl-6 border-l-2 md:border-l-4 border-border dark:border-border">
                {timeline.slice(0, index + 1).map((tstate, idx) => (
                  <div key={tstate.key} className="relative">
                    <button
                      onClick={() => animateToIndex(idx)}
                      className={`w-full text-left rounded-lg p-3 md:p-4 border-2 transition-all ${
                        idx === index
                          ? 'bg-primary/10 dark:bg-primary/20 border-primary shadow-md'
                          : 'bg-muted/30 dark:bg-muted/20 border-border hover:bg-muted/50 dark:hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {idx === 0 ? 'Original' : `Step ${idx}`}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-background dark:bg-muted/30 rounded border border-border">
                          {tstate.law}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-0.5 md:gap-1 font-mono text-xs md:text-sm">
                        {tstate.tokens.map((tok) => (
                          <span key={tok.id} className="text-foreground">
                            {tok.text}
                          </span>
                        ))}
                      </div>
                    </button>
                    {idx < index && (
                      <div className="absolute left-0 top-1/2 w-0.5 md:w-1 h-full bg-linear-to-b from-primary/30 to-transparent -ml-4 md:-ml-6"></div>
                    )}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default FactoringDemo
