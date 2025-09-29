import React from 'react'
import { motion } from 'framer-motion'
import { calculatorService } from '../services/calculator.service'
import { Button } from './ui/button';

// Types
export interface ScriptToken { id: string; text: string; kind?: 'var' | 'op' | 'paren' | 'other'; highlight?: boolean; isNew?: boolean }
export interface ScriptExpressionState { raw: string; tokens: ScriptToken[] }
export interface ScriptStep { id: string; law: string; description?: string; before: ScriptExpressionState; after: ScriptExpressionState }
export interface FactoringDirectionScript { defaultExpression: string; steps: ScriptStep[] }

// Token component (forwardRef to capture DOM nodes)
const CharMotion = React.forwardRef(function CharMotion(
  { token, layoutIdOverride, onEnter, onLeave }: { token: ScriptToken; layoutIdOverride?: string; onEnter?: () => void; onLeave?: () => void },
  ref: React.Ref<HTMLSpanElement>
) {
  const base = 'inline-block px-0 font-mono select-none rounded leading-none'
  return (
    <motion.span
      ref={ref}
      layout
      layoutId={layoutIdOverride ?? token.id}
      initial={false}
      transition={{ duration: 0.28 }}
      className={base}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
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

  // ref to the text input so we can insert symbols at the caret
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const tokenRefs = React.useRef<Map<string, HTMLElement>>(new Map())
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const [clones, setClones] = React.useState<Array<{ key: string; text: string; from: DOMRectLike; to: DOMRectLike }>>([])
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
      if (idx === 0) arr.push({ key: `${step.id || idx}-before`, phase: 'before', step, tokens: beforeTokens, raw: step.before.raw, law: step.law })
      arr.push({ key: `${step.id || idx}-after`, phase: 'after', step, tokens: afterTokens, raw: step.after.raw, law: step.law })
    })
    return arr
  }, [remoteScript])

  const [index, setIndex] = React.useState(0)
  const maxIndex = timeline.length - 1

  // fetch
  const fetchRemoteScript = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorRemote(null)
    setLoadingRemote(true)
    setRemoteScript(null)
    try {
      const res = await calculatorService.simplify(expressionInput)
      if (!res || !res.success) setErrorRemote(res?.error || 'failed')
      else setRemoteScript(res.result as FactoringDirectionScript)
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
      toSpawn.push({ key: `${srcId}-${Date.now()}`, text, from: fromRect, to: toRect })
    }

    if (toSpawn.length > 0) {
      setClones(prev => prev.concat(toSpawn))
      pendingFromRects.current = new Map()
      pendingMappings.current = new Map()
      setTimeout(() => { setClones(prev => prev.slice(toSpawn.length)) }, 450)
    } else {
      pendingFromRects.current = new Map()
      pendingMappings.current = new Map()
    }
  }, [index, timeline])

  const setTokenRef = (id: string) => (el: HTMLElement | null) => { if (el) tokenRefs.current.set(id, el); else tokenRefs.current.delete(id) }

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

  return (
    <div className="p-6 rounded-xl w-full max-w-5xl mx-auto">
      <div className="mb-6 space-y-2">
        <form onSubmit={fetchRemoteScript} className="flex flex-col gap-2">
          <div className="flex gap-1 items-center">
            <input
              ref={inputRef}
              value={expressionInput}
              onChange={(e) => setExpressionInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter boolean expression (e.g. A ∧ B ∨ ¬A)"
                aria-label="Boolean expression"
              />
            <Button variant={"default"} type="submit" className="px-4 py-2 h-10" disabled={loadingRemote}>
              {loadingRemote ? 'Loading...' : 'Solve'}
            </Button>
            <Button variant={"outline"} onClick={handleReset} className="px-4 py-2 h-10 border rounded-md text-sm hover:bg-gray-50">
              Reset
            </Button>
          </div>

          {/* quick operator buttons */}
          <div className="flex flex-wrap gap-2 mt-1">
            {['∧','∨','¬','⊕','→','↔','(',')'].map(sym => (
              <button
                key={sym}
                type="button"
                onClick={() => insertOperator(sym)}
                className="px-2 py-1 border border-gray-300 h-8 w-8 rounded text-sm bg-white hover:bg-gray-50"
                aria-label={`Insert ${sym}`}>
                {sym}
              </button>
            ))}
          </div>
        </form>
        {errorRemote && <div className="text-sm text-red-600 mt-2">{errorRemote}</div>}
      </div>

      <div className=" rounded-lg border p-4 relative" ref={containerRef}>
        {remoteScript == null ? (
          <div className="text-sm text-gray-600">No steps loaded. Enter an expression and click Simplify.</div>
        ) : (
          <div>
            <div className="mb-3 text-sm text-gray-700">Expression: <span className="font-mono">{remoteScript.defaultExpression}</span></div>

            <div className="mb-4">
              <button onClick={() => animateToIndex(index - 1)} disabled={index <= 0} className="px-3 py-1 mr-2 border rounded disabled:opacity-50">Prev</button>
              <button onClick={() => animateToIndex(index + 1)} disabled={index >= maxIndex} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
              <span className="ml-4 text-sm text-gray-600">Step {Math.max(1, index + 1)} / {Math.max(1, timeline.length)}</span>
            </div>

            <div className="space-y-4">
              {timeline.slice(0, index + 1).map((tstate) => (
                <div key={tstate.key} className="border rounded p-3">
                  <div className="text-xs text-gray-500 mb-2">{tstate.law}</div>
                  <div className="flex flex-wrap items-center gap-0">
                    {tstate.tokens.map((tok) => (
                      <CharMotion key={tok.id} ref={setTokenRef(tok.id)} token={tok} />
                    ))}
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
