import React from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Button } from './ui/button'

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

// ---------------- Sample Script Data ----------------
// This is a hand‑crafted example showing how to author a direction script.
// Important rule: Reuse the SAME token.id when the *exact logical occurrence* survives
// into later steps. When duplicates are merged (factored), choose ONE of the prior ids
// to represent the merged result and simply omit the others from the new step.
// Any removed symbols vanish (AnimatePresence exit) and any new parentheses or operators
// appear (enter). This gives a clear motion mapping.

const SAMPLE_SCRIPT: FactoringDirectionScript = {
  defaultExpression: "F = A'BC' + A'BC + AB'C' + ABC'",
  steps: [
    {
      id: '1',
      law: 'group',
      description: 'Group similar pairs in parentheses',
      before: {
        raw: "F = A'BC' + A'BC + AB'C' + ABC'",
        tokens: [
          { id: 'tok_F', text: 'F', kind: 'var' },
          { id: 'tok_eq', text: '=', kind: 'op' },
          { id: 'A1p', text: "A'", kind: 'var' },
          { id: 'B1', text: 'B', kind: 'var' },
            { id: 'C1p', text: "C'", kind: 'var' },
          { id: 'plus1', text: '+', kind: 'op' },
          { id: 'A2p', text: "A'", kind: 'var' },
          { id: 'B2', text: 'B', kind: 'var' },
          { id: 'C2', text: 'C', kind: 'var' },
          { id: 'plus2', text: '+', kind: 'op' },
          { id: 'A3', text: 'A', kind: 'var' },
          { id: 'B3p', text: "B'", kind: 'var' },
          { id: 'C3p', text: "C'", kind: 'var' },
          { id: 'plus3', text: '+', kind: 'op' },
          { id: 'A4', text: 'A', kind: 'var' },
          { id: 'B4', text: 'B', kind: 'var' },
          { id: 'C4p', text: "C'", kind: 'var' },
        ],
      },
      after: {
        raw: "F = (A'BC' + A'BC) + (AB'C' + ABC')",
        tokens: [
          { id: 'tok_F', text: 'F', kind: 'var' },
          { id: 'tok_eq', text: '=', kind: 'op' },
          // Only highlight new grouping parentheses and newly introduced plus token (plus_mid)
          { id: 'gp1_l', text: '(', kind: 'paren', highlight: true },
          { id: 'A1p', text: "A'", kind: 'var' },
          { id: 'B1', text: 'B', kind: 'var' },
          { id: 'C1p', text: "C'", kind: 'var' },
          { id: 'plus1', text: '+', kind: 'op' },
          { id: 'A2p', text: "A'", kind: 'var' },
          { id: 'B2', text: 'B', kind: 'var' },
          { id: 'C2', text: 'C', kind: 'var' },
          { id: 'gp1_r', text: ')', kind: 'paren', highlight: true },
          { id: 'plus_mid', text: '+', kind: 'op', highlight: true }, // replaces plus2
          { id: 'gp2_l', text: '(', kind: 'paren', highlight: true },
          { id: 'A3', text: 'A', kind: 'var' },
          { id: 'B3p', text: "B'", kind: 'var' },
          { id: 'C3p', text: "C'", kind: 'var' },
          { id: 'plus3', text: '+', kind: 'op' },
          { id: 'A4', text: 'A', kind: 'var' },
          { id: 'B4', text: 'B', kind: 'var' },
          { id: 'C4p', text: "C'", kind: 'var' },
          { id: 'gp2_r', text: ')', kind: 'paren', highlight: true },
        ],
      },
    },
    {
      id: '2',
      law: 'factor',
      description: 'Factor common variables out of each group',
      before: {
        raw: "F = (A'BC' + A'BC) + (AB'C' + ABC')",
        tokens: [
          { id: 'tok_F', text: 'F', kind: 'var' },
          { id: 'tok_eq', text: '=', kind: 'op' },
          { id: 'gp1_l', text: '(', kind: 'paren' },
          { id: 'A1p', text: "A'", kind: 'var' },
          { id: 'B1', text: 'B', kind: 'var' },
          { id: 'C1p', text: "C'", kind: 'var' },
          { id: 'plus1', text: '+', kind: 'op' },
          { id: 'A2p', text: "A'", kind: 'var' },
          { id: 'B2', text: 'B', kind: 'var' },
          { id: 'C2', text: 'C', kind: 'var' },
          { id: 'gp1_r', text: ')', kind: 'paren' },
          { id: 'plus_mid', text: '+', kind: 'op' },
          { id: 'gp2_l', text: '(', kind: 'paren' },
          { id: 'A3', text: 'A', kind: 'var' },
          { id: 'B3p', text: "B'", kind: 'var' },
          { id: 'C3p', text: "C'", kind: 'var' },
          { id: 'plus3', text: '+', kind: 'op' },
          { id: 'A4', text: 'A', kind: 'var' },
          { id: 'B4', text: 'B', kind: 'var' },
          { id: 'C4p', text: "C'", kind: 'var' },
          { id: 'gp2_r', text: ')', kind: 'paren' },
        ],
      },
      after: {
        raw: "F = A'B(C'+C) + AC'(B'+B)",
        tokens: [
          { id: 'tok_F', text: 'F', kind: 'var' },
          { id: 'tok_eq', text: '=', kind: 'op' },
          { id: 'A1p', text: "A'", kind: 'var', highlight: true }, // merged (A1p + A2p)
          { id: 'B1', text: 'B', kind: 'var', highlight: true },     // merged (B1 + B2)
          { id: 'fac1_l', text: '(', kind: 'paren', highlight: true },
          { id: 'C1p', text: "C'", kind: 'var' },
          { id: 'plus_c', text: '+', kind: 'op' },
          { id: 'C2', text: 'C', kind: 'var' },
          { id: 'fac1_r', text: ')', kind: 'paren', highlight: true },
          { id: 'plus_mid', text: '+', kind: 'op' },
          { id: 'A3', text: 'A', kind: 'var', highlight: true },
          { id: 'C3p', text: "C'", kind: 'var', highlight: true },
          { id: 'fac2_l', text: '(', kind: 'paren', highlight: true },
          { id: 'B3p', text: "B'", kind: 'var' },
          { id: 'plus_b', text: '+', kind: 'op' },
          { id: 'B4', text: 'B', kind: 'var' },
          { id: 'fac2_r', text: ')', kind: 'paren', highlight: true },
        ],
      },
    },
    {
      id: '3',
      law: 'combine',
      description: "Use complement law (X'+X=1) then identity (X*1=X) to simplify",
      before: {
        raw: "F = A'B(C'+C) + AC'(B'+B)",
        tokens: [
          { id: 'tok_F', text: 'F', kind: 'var' },
          { id: 'tok_eq', text: '=', kind: 'op' },
          { id: 'A1p', text: "A'", kind: 'var' },
          { id: 'B1', text: 'B', kind: 'var' },
          { id: 'fac1_l', text: '(', kind: 'paren' },
          { id: 'C1p', text: "C'", kind: 'var' },
          { id: 'plus_c', text: '+', kind: 'op' },
          { id: 'C2', text: 'C', kind: 'var' },
          { id: 'fac1_r', text: ')', kind: 'paren' },
          { id: 'plus_mid', text: '+', kind: 'op' },
          { id: 'A3', text: 'A', kind: 'var' },
          { id: 'C3p', text: "C'", kind: 'var' },
          { id: 'fac2_l', text: '(', kind: 'paren' },
          { id: 'B3p', text: "B'", kind: 'var' },
          { id: 'plus_b', text: '+', kind: 'op' },
          { id: 'B4', text: 'B', kind: 'var' },
          { id: 'fac2_r', text: ')', kind: 'paren' },
        ],
      },
      after: {
        raw: "F = A'B + AC'",
        tokens: [
          { id: 'tok_F', text: 'F', kind: 'var' },
          { id: 'tok_eq', text: '=', kind: 'op' },
          { id: 'A1p', text: "A'", kind: 'var', highlight: true },
          { id: 'B1', text: 'B', kind: 'var', highlight: true },
          { id: 'plus_final', text: '+', kind: 'op' },
          { id: 'A3', text: 'A', kind: 'var', highlight: true },
          { id: 'C3p', text: "C'", kind: 'var', highlight: true },
        ],
      },
    },
  ],
}

// ---------------- Animation Token Component ----------------
function CharMotion({ token, appearDelay = 0, isHovered, onEnter, onLeave }: { token: ScriptToken; appearDelay?: number; isHovered?: boolean; onEnter?: () => void; onLeave?: () => void }) {
  const { id, text, highlight, isNew } = token
  const base = 'inline-block px-0.5 font-mono select-none rounded transition-colors duration-150'
  const style = isHovered
    ? ' bg-amber-200 outline outline-2 outline-amber-400'
    : isNew
      ? ' bg-green-300'
      : highlight
        ? ' bg-yellow-200'
        : ''
  return (
    <motion.span
      layout
      layoutId={id}
      key={id}
      initial={{ opacity: 0, y: -18, x: -10 }}
      animate={{ opacity: 1, y: 0, x: 0, transition: { delay: appearDelay, duration: 0.35, ease: 'easeOut' } }}
      exit={{ opacity: 0, y: 20, x: 16, transition: { duration: 0.25 } }}
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

const FactoringDemo: React.FC<FactoringDemoProps> = ({ script = SAMPLE_SCRIPT }) => {
  // Build linear timeline:
  // Desired sequence now:
  //   Step1.before -> Step1.after -> Step2.after -> Step3.after -> ...
  const timeline = React.useMemo<TimelineState[]>(() => {
    const arr: TimelineState[] = []
    const steps = script?.steps ?? []
    steps.forEach((step, idx) => {
      const beforeIds = new Set(step.before.tokens.map(t => t.id))
      const afterTokens = step.after.tokens.map(t => {
        const isNew = !beforeIds.has(t.id)
        return {
          ...t,
          isNew,
          // keep original highlight only (do NOT auto-highlight new; we style via isNew)
          highlight: t.highlight,
        }
      })

      if (idx === 0) {
        arr.push({
          key: `${step.id}-before`,
          phase: 'before',
          step,
          tokens: step.before.tokens,
          raw: step.before.raw,
          law: step.law,
        })
        arr.push({
          key: `${step.id}-after`,
          phase: 'after',
          step,
          tokens: afterTokens,
          raw: step.after.raw,
          law: step.law,
        })
      } else {
        arr.push({
          key: `${step.id}-after`,
          phase: 'after',
          step,
          tokens: afterTokens,
          raw: step.after.raw,
          law: step.law,
        })
      }
    })
    return arr
  }, [script])

  const [index, setIndex] = React.useState(0) // index of LAST revealed timeline state
  const maxIndex = timeline.length - 1

  // Hover linking across rows (must be before any early return for hooks order)
  const [hoverId, setHoverId] = React.useState<string | null>(null)
  const handleEnter = (id: string) => () => setHoverId(id)
  const handleLeave = (id: string) => () => setHoverId(prev => (prev === id ? null : prev))

  // Keep index in range when script changes
  React.useEffect(() => {
    if (maxIndex >= 0 && index > maxIndex) {
      setIndex(maxIndex)
    }
    if (maxIndex === -1 && index !== 0) {
      setIndex(0)
    }
  }, [maxIndex, index])

  if (timeline.length === 0) {
    return (
      <div className="p-6 rounded-xl w-full max-w-5xl mx-auto border border-border bg-background/40 backdrop-blur-sm">
        <p className="text-xl font-semibold font-mono mb-2">Scripted Factoring Walkthrough</p>
        <div className="text-sm font-mono opacity-70">No steps available.</div>
      </div>
    )
  }

  const canNext = index < maxIndex
  const canPrev = index > 0

  function handleNext() {
    if (canNext) setIndex(i => i + 1)
  }
  function handlePrev() {
    if (canPrev) setIndex(i => i - 1)
  }

  const visible = timeline.slice(0, index + 1)
  const current = timeline[index]
  const lawTheme = LAW_THEME[current.law] || { color: 'bg-gray-200', label: current.law }

  return (
    <div className="p-6 rounded-xl w-full max-w-5xl mx-auto bg-background/40 backdrop-blur-sm">
      <div className="mb-6 space-y-2">
        <p className="text-xl font-semibold font-mono">Scripted Factoring Walkthrough</p>
        <div className="text-sm font-mono opacity-70">Default: {script.defaultExpression}</div>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-mono ${lawTheme.color}`}>
          <span className="font-semibold">Law:</span> {lawTheme.label}
          <span className="opacity-60">• {current.phase}</span>
          <span className="opacity-60">• State {index + 1}/{timeline.length}</span>
        </div>
        {current.step.description && (
          <div className="text-xs font-mono opacity-70 leading-relaxed">{current.step.description}</div>
        )}
      </div>

      <LayoutGroup>
        <div className="flex flex-col gap-5">
          {/* Timeline rows */}
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {visible.map((state, rowIndex) => (
                <motion.div
                  key={state.key}
                  layout
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
                  exit={{ opacity: 0, y: 30, transition: { duration: 0.25 } }}
                  className={`relative rounded border p-3 bg-card overflow-hidden`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-24 shrink-0 text-[10px] font-mono uppercase tracking-wide text-muted-foreground flex flex-col">
                      <span>{LAW_THEME[state.law]?.label || state.law}</span>
                    </div>
                    <div className={`flex flex-wrap items-center text-lg font-mono min-h-[40px] ${rowIndex === visible.length - 1 ? '' : 'opacity-70'}`}>
                      {rowIndex === visible.length - 1 ? (
                        <AnimatePresence mode="popLayout" initial={false}>
                          {state.tokens.map((t, i) => (
                            <CharMotion
                              key={t.id}
                              token={t}
                              appearDelay={i * 0.02}
                              isHovered={hoverId === t.id}
                              onEnter={handleEnter(t.id)}
                              onLeave={handleLeave(t.id)}
                            />
                          ))}
                        </AnimatePresence>
                      ) : (
                        state.tokens.map(t => {
                          const base = 'inline-block px-0.5 font-mono rounded transition-colors duration-150'
                          const style = hoverId === t.id
                            ? ' bg-amber-200 outline outline-2 outline-amber-400'
                            : t.isNew
                              ? ' bg-green-300'
                              : t.highlight
                                ? ' bg-yellow-200'
                                : ''
                          return (
                            <span
                              key={t.id}
                              onMouseEnter={handleEnter(t.id)}
                              onMouseLeave={handleLeave(t.id)}
                              className={base + style}
                            >
                              {t.text}
                            </span>
                          )
                        })
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="secondary" onClick={handlePrev} disabled={!canPrev}>Prev</Button>
            <Button variant="secondary" onClick={handleNext} disabled={!canNext}>Next</Button>
            <div className="text-[10px] font-mono opacity-60">State {index + 1}/{timeline.length}</div>
          </div>
        </div>
      </LayoutGroup>
    </div>
  )
}

export default FactoringDemo
