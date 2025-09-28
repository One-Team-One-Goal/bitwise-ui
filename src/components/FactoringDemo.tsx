import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { calculatorService } from '../services/calculator.service'

/**
 * New "Direction Script" driven factoring demo.
 * Instead of parsing the expression automatically, we accept a fully described
 * script object that enumerates each transformation step (before/after), the
 * law applied, and stable token ids so animation can map characters across steps.
 */

// ---------------- Types for Script Driven Animation ----------------
export interface ScriptToken {
  id: string            // stable id across steps if it is the *same* logical symbol
  text: string          // display text (e.g. A')
  kind?: 'var' | 'op' | 'paren' | 'other'
  highlight?: boolean   // author-specified emphasis (yellow)
  // Computed at runtime (not required in authored script):
  isNew?: boolean       // true if this token appears first time in this timeline state (green)
}

export interface ScriptExpressionState {
  raw: string           // raw expression string
  tokens: ScriptToken[] // ordered tokens for rendering / animation
}

export interface ScriptStep {
  id: string            // e.g. "1"
  law: string           // e.g. group | factor | combine
  description?: string  // optional human description
  before: ScriptExpressionState
  after: ScriptExpressionState
}

export interface FactoringDirectionScript {
  defaultExpression: string
  steps: ScriptStep[]
}

// ---------------- Animation Token Component ----------------
function CharMotion({ token, appearDelay = 0, isHovered, onEnter, onLeave }: { token: ScriptToken; appearDelay?: number; isHovered?: boolean; onEnter?: () => void; onLeave?: () => void }) {
  const { id, text, highlight, isNew } = token
  // tighter base padding so tokens sit closer together
  const base = 'inline-block px-0 font-mono select-none rounded leading-none'
  const style = isHovered ? ' bg-amber-200 outline outline-2 outline-amber-400' : ''
  return (
    <motion.span
      layout
      layoutId={id}
      key={id}
      initial={false}
      // no enter/fade/translate animation — movement handled by layoutId only
      transition={{ duration: 0.28 }}
      className={`${base}${style}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {text}
    </motion.span>
  )
}

// Law -> theme strategy (can expand per law for custom animation styling)
const LAW_THEME: Record<string, { color: string; label: string }> = {
  group: { color: 'bg-blue-100', label: 'Grouping' },
  factor: { color: 'bg-purple-100', label: 'Factoring' },
  combine: { color: 'bg-green-100', label: 'Combination' },
}

// ---------------- Main Component ----------------
interface FactoringDemoProps {
  script?: FactoringDirectionScript
}

// Timeline state representing either a before or after snapshot
interface TimelineState {
  key: string
  phase: 'before' | 'after'
  step: ScriptStep
  tokens: ScriptToken[]
  raw: string
  law: string
}

const FactoringDemo: React.FC<FactoringDemoProps> = () => {
  // UI and remote script state
  const [expressionInput, setExpressionInput] = React.useState<string>('(A ∨ B) ∧ (A ∨ ¬B)')
  const [loadingRemote, setLoadingRemote] = React.useState<boolean>(false)
  const [errorRemote, setErrorRemote] = React.useState<string | null>(null)
  const [remoteScript, setRemoteScript] = React.useState<FactoringDirectionScript | null>(null)

  // Build linear timeline:
  // Desired sequence now:
  //   Step1.before -> Step1.after -> Step2.after -> Step3.after -> ...
  const timeline = React.useMemo<TimelineState[]>(() => {
    const arr: TimelineState[] = []
    const steps = remoteScript?.steps ?? []
    steps.forEach((step, idx) => {
      const beforeIds = new Set(step.before.tokens.map(t => t.id))
      const beforeTokens = step.before.tokens.map(t => ({ ...t, highlight: !!t.highlight }))
      const afterTokens = step.after.tokens.map(t => ({ ...t, isNew: !beforeIds.has(t.id), highlight: !!t.highlight }))

      // push first step's before snapshot once
      if (idx === 0) {
        arr.push({ key: `${step.id || idx}-before`, phase: 'before', step, tokens: beforeTokens, raw: step.before.raw, law: step.law })
      }

      // push after for every step
      arr.push({ key: `${step.id || idx}-after`, phase: 'after', step, tokens: afterTokens, raw: step.after.raw, law: step.law })
    })
    return arr
  }, [remoteScript])

  const [index, setIndex] = React.useState(0) // index of LAST revealed timeline state
  const maxIndex = timeline.length - 1

  // Hover linking across rows (must be before any early return for hooks order)
  const [hoverId, setHoverId] = React.useState<string | null>(null)
  const handleEnter = (id: string) => () => setHoverId(id)
  const handleLeave = (id: string) => () => setHoverId(prev => (prev === id ? null : prev))

  // Keep index in range when script changes
  React.useEffect(() => {
    if (index > maxIndex) setIndex(Math.max(0, maxIndex))
  }, [maxIndex, index])

  // reset index when a new script loads
  React.useEffect(() => {
    setIndex(0)
  }, [remoteScript])

  const visible = React.useMemo(() => timeline.slice(0, index + 1), [timeline, index])

  // Remote fetching
  const fetchRemoteScript = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorRemote(null)
    setLoadingRemote(true)
    setRemoteScript(null)

    try {
      const response = await calculatorService.simplify(expressionInput)
      if (!response || !response.success) {
        setErrorRemote(response?.error || 'Failed to fetch simplification script')
      } else {
        // backend now returns a tokenized script in result — accept as-is
        setRemoteScript(response.result as any)
      }
    } catch (err: any) {
      setErrorRemote(err?.message || 'Network error')
    } finally {
      setLoadingRemote(false)
    }
  }

  const handlePrev = () => setIndex(i => Math.max(0, i - 1))
  const handleNext = () => setIndex(i => Math.min(maxIndex, i + 1))

  // Render
  return (
    <div className="p-6 rounded-xl w-full max-w-5xl mx-auto bg-background/40 backdrop-blur-sm">
      <div className="mb-6 space-y-2">
        <p className="text-xl font-semibold font-mono">Boolean Algebra Simplifier</p>
        <form onSubmit={fetchRemoteScript} className="flex gap-2 items-center">
          <input
            value={expressionInput}
            onChange={(e) => setExpressionInput(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter boolean expression (e.g. A ∧ B ∨ ¬A)"
          />
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md" disabled={loadingRemote}>
            {loadingRemote ? 'Loading...' : 'Simplify'}
          </button>
        </form>
        {errorRemote && <div className="text-sm text-red-600 mt-2">{errorRemote}</div>}
      </div>

      {/* Timeline viewer */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {remoteScript == null ? (
          <div className="text-sm text-gray-600">No script loaded. Enter an expression and click Simplify.</div>
        ) : (
          <div>
            <div className="mb-3 text-sm text-gray-700">Expression: <span className="font-mono">{remoteScript.defaultExpression}</span></div>

            <div className="mb-4">
              {/* controls */}
              <button onClick={handlePrev} disabled={index <= 0} className="px-3 py-1 mr-2 border rounded disabled:opacity-50">Prev</button>
              <button onClick={handleNext} disabled={index >= maxIndex} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
              <span className="ml-4 text-sm text-gray-600">Step {Math.max(1, index + 1)} / {Math.max(1, timeline.length)}</span>
            </div>

            {/* visible timeline states (render last revealed) */}
            <div className="space-y-4">
              {visible.map((tstate, sidx) => (
                <div key={tstate.key} className="border rounded p-3">
                  <div className="text-xs text-gray-500 mb-2">{tstate.phase.toUpperCase()} — {tstate.law}</div>
                  <div className="flex flex-wrap items-center gap-0">
                    <AnimatePresence mode="popLayout">
                      {tstate.tokens.map((tok, i) => {
                        const isHover = hoverId === tok.id
                        return (
                          <CharMotion
                            key={tok.id}
                            token={tok}
                            appearDelay={i * 0.02}
                            isHovered={isHover}
                            onEnter={handleEnter(tok.id)}
                            onLeave={handleLeave(tok.id)}
                          />
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FactoringDemo
