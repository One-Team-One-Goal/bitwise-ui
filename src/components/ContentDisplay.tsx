import React from 'react'
import { Copy, Check } from 'lucide-react'

interface ContentBlock {
  type:
    | 'text'
    | 'heading'
    | 'inlineCode'
    | 'codeBlock'
    | 'image'
    | 'list'
    | 'table'
    | 'formula'
    | 'callout'
    | 'divider'
    | 'custom'
    | 'karnaughMap'
    | 'logicGate'
    | 'truthTable'
    | 'booleanExpression'
    | 'circuitDiagram'
    | 'interactiveExample'
  text?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6 // for headings
  code?: string
  language?: string
  image?: string
  alt?: string
  caption?: string
  list?: string[] | { text: string; subItems?: string[] }[]
  ordered?: boolean // for numbered lists
  table?: {
    headers: string[]
    rows: string[][]
    caption?: string
    highlightRows?: number[] // rows to highlight
    highlightCols?: number[] // columns to highlight
  }
  karnaughMap?: {
    variables: string[] // e.g., ['A', 'B'] for 2-variable
    values: (string | number)[] // flattened array of cell values
    caption?: string
    groupings?: { cells: number[]; color?: string }[] // highlighted groups
  }
  logicGate?: {
    type: 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR'
    inputs?: string[] // input labels
    output?: string // output label
    description?: string
  }
  truthTable?: {
    inputs: string[] // variable names
    outputs: string[] // output column names
    rows: (string | number)[][] // each row is [input values..., output values...]
    caption?: string
    highlightRows?: number[]
  }
  booleanExpression?: {
    expression: string
    simplified?: string
    steps?: string[] // simplification steps
    description?: string
  }
  circuitDiagram?: {
    description: string
    imageUrl?: string
    components?: string[] // list of components
  }
  formula?: string
  callout?: {
    type: 'info' | 'warning' | 'tip' | 'important'
    title?: string
    content: string
  }
  content?: React.ReactNode
  className?: string
}

interface ContentDisplayProps {
  blocks: ContentBlock[]
  className?: string
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({
  blocks,
  className = '',
}) => {
  const [copiedBlocks, setCopiedBlocks] = React.useState<Set<number>>(new Set())

  const copyToClipboard = (text: string, blockIndex: number) => {
    navigator.clipboard.writeText(text)
    setCopiedBlocks((prev) => new Set(prev).add(blockIndex))
    setTimeout(() => {
      setCopiedBlocks((prev) => {
        const next = new Set(prev)
        next.delete(blockIndex)
        return next
      })
    }, 2000)
  }

  const renderBlock = (block: ContentBlock, index: number) => {
    const key = `block-${index}`

    switch (block.type) {
      case 'heading':
        const headingLevel = block.level || 2
        const headingTag = `h${headingLevel}`
        const headingSizes: Record<number, string> = {
          1: 'text-4xl font-extrabold',
          2: 'text-3xl font-bold',
          3: 'text-2xl font-bold',
          4: 'text-xl font-semibold',
          5: 'text-lg font-semibold',
          6: 'text-base font-semibold',
        }
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            {React.createElement(
              headingTag,
              {
                className: `${headingSizes[headingLevel]} text-gray-900 dark:text-gray-100 tracking-tight`,
              },
              block.text
            )}
          </div>
        )

      case 'text':
        const renderTextWithOverline = (text: string) => {
          const parts = text.split(/(‾\([^)]+\)|‾[A-Z]+)/g)

          return parts.map((part, idx) => {
            if (part.startsWith('‾(')) {
              const content = part.slice(2, -1)
              return (
                <span key={idx} style={{ textDecoration: 'overline' }}>
                  ({content})
                </span>
              )
            } else if (part.startsWith('‾')) {
              const content = part.slice(1)
              return (
                <span key={idx} style={{ textDecoration: 'overline' }}>
                  {content}
                </span>
              )
            }
            return <span key={idx}>{part}</span>
          })
        }

        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-100">
              {renderTextWithOverline(block.text || '')}
            </p>
          </div>
        )

      case 'inlineCode':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <code className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 px-3 py-2 rounded-md text-sm font-mono text-blue-800 dark:text-blue-200 inline-block">
              {block.code}
            </code>
          </div>
        )

      case 'codeBlock':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shadow-sm">
              {block.language && (
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    {block.language}
                  </span>
                  <button
                    onClick={() => copyToClipboard(block.code || '', index)}
                    className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {copiedBlocks.has(index) ? (
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                </div>
              )}
              <pre className="m-0 p-4 text-sm font-mono text-gray-800 dark:text-gray-100 whitespace-pre-wrap overflow-x-auto">
                {block.code}
              </pre>
            </div>
          </div>
        )

      case 'image':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            {block.image && (
              <figure className="space-y-2">
                <img
                  src={block.image}
                  alt={block.alt || 'Lesson image'}
                  className="max-w-full h-auto rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                />
                {block.caption && (
                  <figcaption className="text-sm text-center text-gray-600 dark:text-gray-400 italic">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        )

      case 'list':
        const renderListWithOverline = (text: string) => {
          const parts = text.split(/(‾\([^)]+\)|‾[A-Z]+)/g)

          return parts.map((part, idx) => {
            if (part.startsWith('‾(')) {
              const content = part.slice(2, -1)
              return (
                <span key={idx} style={{ textDecoration: 'overline' }}>
                  ({content})
                </span>
              )
            } else if (part.startsWith('‾')) {
              const content = part.slice(1)
              return (
                <span key={idx} style={{ textDecoration: 'overline' }}>
                  {content}
                </span>
              )
            }
            return <span key={idx}>{part}</span>
          })
        }

        const ListTag = block.ordered ? 'ol' : 'ul'
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <ListTag
              className={`space-y-2 ${block.ordered ? 'list-decimal list-inside' : ''}`}
            >
              {block.list?.map((item, i) => {
                if (typeof item === 'string') {
                  return (
                    <li
                      key={i}
                      className="flex items-start text-lg text-gray-800 dark:text-gray-100"
                    >
                      {!block.ordered && (
                        <span className="text-blue-500 dark:text-blue-300 mr-3 mt-1">
                          •
                        </span>
                      )}
                      <span>{renderListWithOverline(item)}</span>
                    </li>
                  )
                } else {
                  return (
                    <li
                      key={i}
                      className="text-lg text-gray-800 dark:text-gray-100"
                    >
                      <div className="flex items-start">
                        {!block.ordered && (
                          <span className="text-blue-500 dark:text-blue-300 mr-3 mt-1">
                            •
                          </span>
                        )}
                        <div>
                          <span>{renderListWithOverline(item.text)}</span>
                          {item.subItems && (
                            <ul className="mt-2 ml-4 space-y-1">
                              {item.subItems.map((subItem, j) => (
                                <li
                                  key={j}
                                  className="flex items-start text-base text-gray-600 dark:text-gray-300"
                                >
                                  <span className="text-gray-400 dark:text-gray-500 mr-2 mt-1">
                                    ◦
                                  </span>
                                  <span>{renderListWithOverline(subItem)}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                }
              })}
            </ListTag>
          </div>
        )

      case 'table':
        const renderTableWithOverline = (text: string) => {
          const parts = text.split(/(‾\([^)]+\)|‾[A-Z]+)/g)

          return parts.map((part, idx) => {
            if (part.startsWith('‾(')) {
              const content = part.slice(2, -1)
              return (
                <span key={idx} style={{ textDecoration: 'overline' }}>
                  ({content})
                </span>
              )
            } else if (part.startsWith('‾')) {
              const content = part.slice(1)
              return (
                <span key={idx} style={{ textDecoration: 'overline' }}>
                  {content}
                </span>
              )
            }
            return <span key={idx}>{part}</span>
          })
        }

        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <div className="overflow-x-auto rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md">
              {block.table?.caption && (
                <div className="px-4 pt-3 pb-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-base font-semibold text-gray-900 dark:text-gray-100 text-center">
                    {renderTableWithOverline(block.table.caption)}
                  </div>
                </div>
              )}
              <table className="min-w-full text-center border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
                    {block.table?.headers.map((header, i) => (
                      <th
                        key={i}
                        className={`px-6 py-3 text-sm font-bold text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                          block.table?.highlightCols?.includes(i)
                            ? 'bg-yellow-100 dark:bg-yellow-900/30'
                            : ''
                        }`}
                      >
                        {renderTableWithOverline(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.table?.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={`border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                        rIdx % 2 === 0
                          ? 'bg-white dark:bg-gray-900'
                          : 'bg-gray-50 dark:bg-gray-800/50'
                      } ${block.table?.highlightRows?.includes(rIdx) ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`px-6 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-100 dark:border-gray-800 last:border-r-0 ${
                            block.table?.highlightCols?.includes(cIdx)
                              ? 'bg-yellow-50 dark:bg-yellow-900/20'
                              : ''
                          }`}
                        >
                          {renderTableWithOverline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'truthTable':
        const renderTruthTableWithOverline = (text: string) => {
          const parts = text.split(/(‾\([^)]+\)|‾[A-Z]+)/g)

          return parts.map((part, idx) => {
            if (part.startsWith('‾(')) {
              const content = part.slice(2, -1)
              return (
                <span key={idx} style={{ textDecoration: 'overline' }}>
                  ({content})
                </span>
              )
            } else if (part.startsWith('‾')) {
              const content = part.slice(1)
              return (
                <span key={idx} style={{ textDecoration: 'overline' }}>
                  {content}
                </span>
              )
            }
            return <span key={idx}>{part}</span>
          })
        }

        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <div className="overflow-x-auto rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
              {block.truthTable?.caption && (
                <div className="px-4 pt-3 pb-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-base font-bold text-gray-900 dark:text-gray-100 text-center">
                    📊 {renderTruthTableWithOverline(block.truthTable.caption)}
                  </div>
                </div>
              )}
              <table className="min-w-full text-center border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
                    {block.truthTable?.inputs.map((input, i) => (
                      <th
                        key={`input-${i}`}
                        className="px-6 py-3 text-sm font-bold text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700"
                      >
                        {renderTruthTableWithOverline(input)}
                      </th>
                    ))}
                    {block.truthTable?.outputs.map((output, i) => (
                      <th
                        key={`output-${i}`}
                        className="px-6 py-3 text-sm font-bold text-gray-900 dark:text-gray-100 bg-blue-50 dark:bg-blue-900/30 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                      >
                        {renderTruthTableWithOverline(output)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.truthTable?.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={`border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                        block.truthTable?.highlightRows?.includes(rIdx)
                          ? 'bg-yellow-50 dark:bg-yellow-900/20'
                          : rIdx % 2 === 0
                            ? 'bg-white dark:bg-gray-900'
                            : 'bg-gray-50 dark:bg-gray-800/50'
                      }`}
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`px-6 py-3 text-sm font-mono font-bold border-r border-gray-100 dark:border-gray-800 last:border-r-0 ${
                            cIdx >= block.truthTable!.inputs.length
                              ? 'text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/20'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {typeof cell === 'string'
                            ? renderTruthTableWithOverline(cell)
                            : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'karnaughMap':
        const variables = block.karnaughMap?.variables || []
        const values = block.karnaughMap?.values || []
        const numVars = variables.length
        const cols =
          numVars >= 2
            ? Math.pow(2, Math.floor(numVars / 2))
            : Math.pow(2, numVars)

        // Gray code generation
        const grayCode = (n: number): string[] => {
          if (n === 1) return ['0', '1']
          const prev = grayCode(n - 1)
          return [
            ...prev.map((x) => '0' + x),
            ...prev.reverse().map((x) => '1' + x),
          ]
        }

        const rowLabels = numVars >= 2 ? grayCode(Math.ceil(numVars / 2)) : ['']
        const colLabels =
          numVars >= 2 ? grayCode(Math.floor(numVars / 2)) : grayCode(numVars)

        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <div className="overflow-x-auto rounded-xl border-2 border-green-300 dark:border-green-700 bg-white dark:bg-gray-900 shadow-lg">
              {block.karnaughMap?.caption && (
                <div className="px-4 pt-3 pb-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-b border-green-200 dark:border-green-700">
                  <div className="text-base font-bold text-green-900 dark:text-green-100 text-center">
                    🗺️ {block.karnaughMap.caption}
                  </div>
                </div>
              )}
              <div className="p-4">
                <table className="mx-auto border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-xs font-semibold text-green-700 dark:text-green-300">
                        {variables.slice(0, Math.ceil(numVars / 2)).join('')} \{' '}
                        {variables.slice(Math.ceil(numVars / 2)).join('')}
                      </th>
                      {colLabels.map((label, i) => (
                        <th
                          key={i}
                          className="px-4 py-2 text-sm font-bold text-green-900 dark:text-green-100 bg-green-50 dark:bg-green-900/30"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rowLabels.map((rowLabel, rIdx) => (
                      <tr key={rIdx}>
                        <th className="px-4 py-2 text-sm font-bold text-green-900 dark:text-green-100 bg-green-50 dark:bg-green-900/30">
                          {rowLabel}
                        </th>
                        {colLabels.map((_, cIdx) => {
                          const cellIndex = rIdx * cols + cIdx
                          const cellValue = values[cellIndex] ?? '-'
                          const grouping = block.karnaughMap?.groupings?.find(
                            (g) => g.cells.includes(cellIndex)
                          )

                          return (
                            <td
                              key={cIdx}
                              className={`px-6 py-4 text-center text-lg font-mono font-bold border-2 border-green-200 dark:border-green-800 ${
                                grouping
                                  ? `bg-${grouping.color || 'blue'}-100 dark:bg-${grouping.color || 'blue'}-900/30`
                                  : 'bg-white dark:bg-gray-900'
                              } text-gray-900 dark:text-gray-100`}
                            >
                              {cellValue}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case 'logicGate':
        const renderGateShape = (type: string) => {
          const baseProps = {
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: '2',
          }

          switch (type) {
            case 'AND':
              return (
                <svg viewBox="0 0 100 60" className="w-32 h-20">
                  <path
                    d="M 20 10 L 50 10 Q 80 10 80 30 Q 80 50 50 50 L 20 50 Z"
                    {...baseProps}
                  />
                  <line x1="5" y1="20" x2="20" y2="20" {...baseProps} />
                  <line x1="5" y1="40" x2="20" y2="40" {...baseProps} />
                  <line x1="80" y1="30" x2="95" y2="30" {...baseProps} />
                  <circle cx="95" cy="30" r="2" fill="currentColor" />
                </svg>
              )
            case 'OR':
              return (
                <svg viewBox="0 0 100 60" className="w-32 h-20">
                  {/* Input lines - extended slightly to ensure they touch the body */}
                  <line x1="5" y1="20" x2="28" y2="20" {...baseProps} />
                  <line x1="5" y1="40" x2="28" y2="40" {...baseProps} />

                  {/* Main Body: Drawn as one continuous shape */}
                  {/* M: Move to Top-Left */}
                  {/* Q: Curve to Tip (Top Edge) */}
                  {/* Q: Curve to Bottom-Left (Bottom Edge) */}
                  {/* Q: Curve back to Start (Concave Back Edge) */}
                  <path
                    d="M 25 10 
           Q 60 10 80 30 
           Q 60 50 25 50 
           Q 40 30 25 10 
           Z"
                    {...baseProps}
                    fill="none" // Ensure fill is none if you only want outlines, or remove if filling
                  />

                  {/* Output line */}
                  <line x1="80" y1="30" x2="95" y2="30" {...baseProps} />

                  {/* Connection Node (Optional, kept from your code) */}
                  <circle cx="95" cy="30" r="2" fill="currentColor" />
                </svg>
              )
            case 'NOT':
              return (
                <svg viewBox="0 0 100 60" className="w-32 h-20">
                  <path d="M 20 10 L 20 50 L 70 30 Z" {...baseProps} />
                  <circle cx="75" cy="30" r="5" {...baseProps} />
                  <line x1="5" y1="30" x2="20" y2="30" {...baseProps} />
                  <line x1="80" y1="30" x2="95" y2="30" {...baseProps} />
                  <circle cx="95" cy="30" r="2" fill="currentColor" />
                </svg>
              )
            case 'NAND':
              return (
                <svg viewBox="0 0 100 60" className="w-32 h-20">
                  <path
                    d="M 20 10 L 50 10 Q 75 10 75 30 Q 75 50 50 50 L 20 50 Z"
                    {...baseProps}
                  />
                  <circle cx="80" cy="30" r="5" {...baseProps} />
                  <line x1="5" y1="20" x2="20" y2="20" {...baseProps} />
                  <line x1="5" y1="40" x2="20" y2="40" {...baseProps} />
                  <line x1="85" y1="30" x2="95" y2="30" {...baseProps} />
                  <circle cx="95" cy="30" r="2" fill="currentColor" />
                </svg>
              )
            case 'NOR':
              return (
                <svg viewBox="0 0 100 60" className="w-32 h-20">
                  {/* Input lines - extended to touch the body */}
                  <line x1="5" y1="20" x2="28" y2="20" {...baseProps} />
                  <line x1="5" y1="40" x2="28" y2="40" {...baseProps} />

                  {/* Main Body (Same as OR gate) */}
                  <path
                    d="M 25 10 
           Q 60 10 80 30 
           Q 60 50 25 50 
           Q 40 30 25 10 
           Z"
                    {...baseProps}
                    fill="none"
                  />

                  {/* The Inversion Bubble */}
                  {/* Tip is at x=80, so we place circle center at 84 (radius 4) */}
                  <circle cx="84" cy="30" r="4" {...baseProps} />

                  {/* Output line */}
                  {/* Starts after the bubble (84 + 4 = 88) */}
                  <line x1="88" y1="30" x2="95" y2="30" {...baseProps} />

                  {/* Connection Node */}
                  <circle cx="95" cy="30" r="2" fill="currentColor" />
                </svg>
              )
            case 'XOR':
              return (
                <svg viewBox="0 0 100 60" className="w-32 h-20">
                  {/* 1. The Exclusive Rail (The curved line at the back) */}
                  <path d="M 18 10 Q 26 30 18 50" {...baseProps} fill="none" />

                  {/* 2. Main Body (Shifted right to create the gap) */}
                  {/* M: Move to Top-Left of body (28, 10) */}
                  {/* Q: Curve to Tip (80, 30) */}
                  {/* Q: Curve to Bottom-Left (28, 50) */}
                  {/* Q: Curve back inward (concave) to match the rail's shape */}
                  <path
                    d="M 28 10 
           Q 60 10 80 30 
           Q 60 50 28 50 
           Q 36 30 28 10 
           Z"
                    {...baseProps}
                    fill="none"
                  />

                  {/* 3. Input Lines (Shortened to touch the rail) */}
                  <line x1="5" y1="20" x2="19" y2="20" {...baseProps} />
                  <line x1="5" y1="40" x2="19" y2="40" {...baseProps} />

                  {/* 4. Output Line */}
                  <line x1="80" y1="30" x2="95" y2="30" {...baseProps} />
                  <circle cx="95" cy="30" r="2" fill="currentColor" />
                </svg>
              )
            case 'XNOR':
              return (
                <svg viewBox="0 0 110 60" className="w-32 h-20">
                  {/* 1. The Exclusive Rail (Curved line at back) */}
                  <path d="M 18 10 Q 26 30 18 50" {...baseProps} fill="none" />

                  {/* 2. Main Body (Shifted right to create gap) */}
                  {/* M: Top-Left (28,10) */}
                  {/* Q: Curve to Tip (80,30) */}
                  {/* Q: Curve to Bottom-Left (28,50) */}
                  {/* Q: Curve back inward */}
                  <path
                    d="M 28 10 
           Q 60 10 80 30 
           Q 60 50 28 50 
           Q 36 30 28 10 
           Z"
                    {...baseProps}
                    fill="none"
                  />

                  {/* 3. Inversion Bubble */}
                  {/* Tip is at 80, so circle center is at 84 (radius 4) */}
                  <circle cx="84" cy="30" r="4" {...baseProps} />

                  {/* 4. Input Lines (Shortened to touch the rail) */}
                  <line x1="5" y1="20" x2="19" y2="20" {...baseProps} />
                  <line x1="5" y1="40" x2="19" y2="40" {...baseProps} />

                  {/* 5. Output Line */}
                  {/* Starts after the bubble (84 + 4 = 88) */}
                  <line x1="88" y1="30" x2="105" y2="30" {...baseProps} />
                  <circle cx="105" cy="30" r="2" fill="currentColor" />
                </svg>
              )
            default:
              return null
          }
        }

        const gateStyles = {
          AND: {
            color: 'blue',
            symbol: '∧',
            desc: 'Output is 1 only if all inputs are 1',
          },
          OR: {
            color: 'green',
            symbol: '∨',
            desc: 'Output is 1 if any input is 1',
          },
          NOT: { color: 'red', symbol: '¬', desc: 'Inverts the input' },
          NAND: {
            color: 'purple',
            symbol: '⊼',
            desc: 'NOT-AND: Output is 0 only if all inputs are 1',
          },
          NOR: {
            color: 'orange',
            symbol: '⊽',
            desc: 'NOT-OR: Output is 0 if any input is 1',
          },
          XOR: {
            color: 'yellow',
            symbol: '⊕',
            desc: 'Output is 1 if inputs are different',
          },
          XNOR: {
            color: 'pink',
            symbol: '⊙',
            desc: 'Output is 1 if inputs are the same',
          },
        }

        const gateStyle = gateStyles[block.logicGate?.type || 'AND']

        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <div className="rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-lg">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {block.logicGate?.type} Gate
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {block.logicGate?.description || gateStyle.desc}
                    </p>
                  </div>
                </div>

                {/* Gate Diagram */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 w-full flex justify-center">
                  <div className="text-gray-700 dark:text-gray-300">
                    {renderGateShape(block.logicGate?.type || 'AND')}
                  </div>
                </div>

                {/* Inputs and Output Labels */}
                <div className="w-full grid grid-cols-2 gap-4">
                  {block.logicGate?.inputs &&
                    block.logicGate.inputs.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Inputs:
                        </p>
                        <div className="flex flex-col gap-2">
                          {block.logicGate.inputs.map((input, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-mono"
                            >
                              {input}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {block.logicGate?.output && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Output:
                      </p>
                      <span className="inline-block px-3 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-mono font-bold">
                        {block.logicGate.output}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 'booleanExpression':
        // Helper function to parse and render formula with proper overlines (reuse from formula case)
        const renderFormulaWithOverline = (text: string) => {
          const parts = text.split(/(‾\([^)]+\)|‾[A-Z]+)/g)

          return parts.map((part, idx) => {
            if (part.startsWith('‾(')) {
              const content = part.slice(2, -1)
              return (
                <span key={idx} style={{ textDecoration: 'overline' }}>
                  ({content})
                </span>
              )
            } else if (part.startsWith('‾')) {
              const content = part.slice(1)
              return (
                <span key={idx} style={{ textDecoration: 'overline' }}>
                  {content}
                </span>
              )
            }
            return <span key={idx}>{part}</span>
          })
        }

        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <div className="rounded-xl border-2 border-indigo-300 dark:border-indigo-700 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-900 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <span className="text-2xl">𝑓</span>
                </div>
                <h4 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                  Boolean Expression
                </h4>
              </div>

              {block.booleanExpression?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {block.booleanExpression.description}
                </p>
              )}

              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                    Original Expression:
                  </p>
                  <code className="text-lg font-mono text-indigo-900 dark:text-indigo-100 font-bold">
                    {renderFormulaWithOverline(
                      block.booleanExpression?.expression || ''
                    )}
                  </code>
                </div>

                {block.booleanExpression?.simplified && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                      Simplified:
                    </p>
                    <code className="text-lg font-mono text-green-900 dark:text-green-100 font-bold">
                      {renderFormulaWithOverline(
                        block.booleanExpression.simplified
                      )}
                    </code>
                  </div>
                )}

                {block.booleanExpression?.steps &&
                  block.booleanExpression.steps.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">
                        Simplification Steps:
                      </p>
                      <ol className="space-y-2 list-decimal list-inside">
                        {block.booleanExpression.steps.map((step, i) => (
                          <li
                            key={i}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          >
                            <code className="ml-2 font-mono text-indigo-700 dark:text-indigo-300">
                              {renderFormulaWithOverline(step)}
                            </code>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )

      case 'circuitDiagram':
        // Helper: Get gate colors
        const getGateColor = (type: string) => {
          const colors: Record<string, string> = {
            AND: '#86efac', // green-300
            OR: '#93c5fd', // blue-300
            NOT: '#fde047', // yellow-300
            NAND: '#d8b4fe', // purple-300
            NOR: '#fb923c', // orange-300
            XOR: '#f87171', // red-300
            XNOR: '#67e8f9', // cyan-300
          }
          return colors[type] || '#d1d5db'
        }

        // Helper: Render gate shape
        // Helper: Render gate shape inside circuit
        const renderGateInCircuit = (gate: any, x: number, y: number) => {
          const gateWidth = 110
          const gateHeight = 60
          const fill = getGateColor(gate.type)

          // Render actual gate shape inside the box
          const renderGateShape = (
            type: string,
            centerX: number,
            centerY: number
          ) => {
            const baseProps = {
              fill: 'none',
              stroke: '#111827',
              strokeWidth: '1.8',
            }
            const scale = 0.7 // Scale down to fit inside box

            switch (type) {
              case 'AND':
                return (
                  <g
                    transform={`translate(${centerX}, ${centerY}) scale(${scale})`}
                  >
                    <path
                      d="M -25 -15 L 0 -15 Q 25 -15 25 0 Q 25 15 0 15 L -25 15 Z"
                      {...baseProps}
                      fill="white"
                    />
                  </g>
                )
              case 'OR':
                return (
                  <g
                    transform={`translate(${centerX}, ${centerY}) scale(${scale})`}
                  >
                    <path d="M -25 -15 Q -20 0 -25 15" {...baseProps} />
                    <path
                      d="M -25 -15 Q 5 -15 20 0 Q 5 15 -25 15"
                      {...baseProps}
                      fill="white"
                    />
                    <path d="M 20 0 Q 27 -7 30 0 Q 27 7 20 0" {...baseProps} />
                  </g>
                )
              case 'NOT':
                return (
                  <g
                    transform={`translate(${centerX}, ${centerY}) scale(${scale})`}
                  >
                    <path
                      d="M -20 -15 L -20 15 L 15 0 Z"
                      {...baseProps}
                      fill="white"
                    />
                    <circle cx="20" cy="0" r="5" {...baseProps} fill="white" />
                  </g>
                )
              case 'NAND':
                return (
                  <g
                    transform={`translate(${centerX}, ${centerY}) scale(${scale})`}
                  >
                    <path
                      d="M -25 -15 L 0 -15 Q 20 -15 20 0 Q 20 15 0 15 L -25 15 Z"
                      {...baseProps}
                      fill="white"
                    />
                    <circle cx="25" cy="0" r="5" {...baseProps} fill="white" />
                  </g>
                )
              case 'NOR':
                return (
                  <g
                    transform={`translate(${centerX}, ${centerY}) scale(${scale})`}
                  >
                    {/* 1. Input Lines (Left side) */}
                    {/* Drawn from far left (-40) to touch the body at (-22) */}
                    <line x1="-40" y1="-10" x2="-22" y2="-10" {...baseProps} />
                    <line x1="-40" y1="10" x2="-22" y2="10" {...baseProps} />

                    {/* 2. Main Body (Centered OR Shape) */}
                    {/* Starts at Top-Left (-25, -20) */}
                    {/* Curves to Tip (30, 0) */}
                    {/* Curves to Bottom-Left (-25, 20) */}
                    {/* Curves Back Inward to Start */}
                    <path
                      d="M -25 -20 
           Q 10 -20 30 0 
           Q 10 20 -25 20 
           Q -10 0 -25 -20 
           Z"
                      {...baseProps}
                      fill="white"
                    />

                    {/* 3. Inversion Bubble */}
                    {/* Placed at the tip (30 + radius 4 = 34) */}
                    <circle cx="34" cy="0" r="4" {...baseProps} fill="white" />

                    {/* 4. Output Line (Right side) */}
                    {/* Starts after the bubble */}
                    <line x1="38" y1="0" x2="50" y2="0" {...baseProps} />
                  </g>
                )
              case 'XOR':
                return (
                  <g
                    transform={`translate(${centerX}, ${centerY}) scale(${scale})`}
                  >
                    {/* 1. Input Lines */}
                    {/* These connect to the back "rail", not the main body */}
                    <line x1="-45" y1="-10" x2="-32" y2="-10" {...baseProps} />
                    <line x1="-45" y1="10" x2="-32" y2="10" {...baseProps} />

                    {/* 2. The "Exclusive" Rail */}
                    {/* This is the extra curved line behind the body */}
                    <path
                      d="M -35 -20 Q -20 0 -35 20"
                      {...baseProps}
                      fill="none"
                    />

                    {/* 3. Main Body (OR Shape) */}
                    {/* Placed slightly to the right to create the gap */}
                    <path
                      d="M -25 -20 
           Q 10 -20 30 0 
           Q 10 20 -25 20 
           Q -10 0 -25 -20 
           Z"
                      {...baseProps}
                      fill="white"
                    />

                    {/* 4. Output Line */}
                    {/* Connects from the tip of the body */}
                    <line x1="30" y1="0" x2="45" y2="0" {...baseProps} />
                  </g>
                )
              case 'XNOR':
                return (
                  <g
                    transform={`translate(${centerX}, ${centerY}) scale(${scale})`}
                  >
                    {/* 1. Input Lines */}
                    {/* Connect to the back rail, not the body */}
                    <line x1="-45" y1="-10" x2="-32" y2="-10" {...baseProps} />
                    <line x1="-45" y1="10" x2="-32" y2="10" {...baseProps} />

                    {/* 2. The Exclusive Rail */}
                    {/* The curved line behind the body */}
                    <path
                      d="M -35 -20 Q -20 0 -35 20"
                      {...baseProps}
                      fill="none"
                    />

                    {/* 3. Main Body (OR Shape) */}
                    {/* Shifted right to create the gap between rail and body */}
                    <path
                      d="M -25 -20 
           Q 10 -20 30 0 
           Q 10 20 -25 20 
           Q -10 0 -25 -20 
           Z"
                      {...baseProps}
                      fill="white"
                    />

                    {/* 4. Inversion Bubble */}
                    {/* Placed at the tip of the body (30) + radius (4) = 34 */}
                    <circle cx="34" cy="0" r="4" {...baseProps} fill="white" />

                    {/* 5. Output Line */}
                    {/* Starts after the bubble */}
                    <line x1="38" y1="0" x2="55" y2="0" {...baseProps} />
                  </g>
                )
              default:
                return null
            }
          }

          return (
            <g key={gate.id}>
              {/* Gate body box */}
              <rect
                x={x - gateWidth / 2}
                y={y - gateHeight / 2}
                width={gateWidth}
                height={gateHeight}
                rx={10}
                fill={fill}
                fillOpacity={0.3}
                stroke="currentColor"
                strokeWidth={2.5}
                strokeOpacity={0.6}
              />

              {/* Actual gate shape inside */}
              {renderGateShape(gate.type, x, y)}

              {/* Gate type label (moved to top) */}
              <text
                x={x}
                y={y - gateHeight / 2 - 8}
                textAnchor="middle"
                fontWeight="bold"
                fontSize={13}
                fill="currentColor"
              >
                {gate.type}
              </text>

              {/* Gate ID (moved to bottom) */}
              <text
                x={x}
                y={y + gateHeight / 2 + 18}
                textAnchor="middle"
                fontSize={11}
                fontWeight="600"
                fill="currentColor"
                fillOpacity={0.7}
              >
                {gate.id}
              </text>

              {/* Input terminal dots */}
              {gate.inputs.map((_inp: string, i: number) => {
                const spacing = 60 / (gate.inputs.length + 1)
                const terminalY = y - gateHeight / 2 + spacing * (i + 1)
                const terminalX = x - gateWidth / 2 + 10
                return (
                  <circle
                    key={i}
                    cx={terminalX}
                    cy={terminalY}
                    r={3.5}
                    fill="#111827"
                    stroke="white"
                    strokeWidth={1.5}
                  />
                )
              })}

              {/* Output terminal dot */}
              <circle
                cx={x + gateWidth / 2 - 8}
                cy={y}
                r={4}
                fill="#111827"
                stroke="white"
                strokeWidth={1.5}
              />

              {/* Output label */}
              <text
                x={x + gateWidth / 2 + 6}
                y={y + 4}
                textAnchor="start"
                fontSize={11}
                fill="currentColor"
                fontWeight={600}
                fillOpacity={0.8}
              >
                {gate.output}
              </text>
            </g>
          )
        }

        // Parse circuit data
        const circuitData = block.circuitDiagram as any
        if (!circuitData?.inputs || !circuitData?.gates) {
          return (
            <div
              key={key}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-700"
            >
              <p className="text-red-800 dark:text-red-200">
                Invalid circuit data
              </p>
            </div>
          )
        }

        const inputs = circuitData.inputs
        const gates = circuitData.gates
        const finalOutput =
          circuitData.finalOutput || gates[gates.length - 1]?.output

        // Build signal source map
        const signalSource: Record<string, string> = {}
        gates.forEach((g: any) => {
          if (g.output) signalSource[g.output] = g.id
        })

        // Calculate gate levels (depth)
        const gateLevels: Record<string, number> = {}
        const gateMap: Record<string, any> = {}
        gates.forEach((g: any) => (gateMap[g.id] = g))

        const getGateLevel = (
          gateId: string,
          visited = new Set<string>()
        ): number => {
          if (visited.has(gateId)) return 0
          if (gateLevels[gateId] !== undefined) return gateLevels[gateId]

          visited.add(gateId)
          const gate = gateMap[gateId]
          let maxInputLevel = -1

          gate.inputs.forEach((input: string) => {
            const sourceGateId = signalSource[input]
            if (sourceGateId) {
              const level = getGateLevel(sourceGateId, new Set(visited))
              maxInputLevel = Math.max(maxInputLevel, level)
            }
          })

          const level = maxInputLevel + 1
          gateLevels[gateId] = level
          return level
        }

        gates.forEach((g: any) => getGateLevel(g.id))
        const maxLevel = Math.max(0, ...Object.values(gateLevels))

        // Layout constants
        const leftX = 80
        const rightX = 650
        const levelWidth = (rightX - leftX) / (maxLevel + 2)
        const rowSpacing = 100
        const topOffset = 80

        // Position map
        const positions: Record<
          string,
          { x: number; y: number; type: string }
        > = {}

        // Position inputs
        inputs.forEach((input: string, idx: number) => {
          positions[input] = {
            x: leftX,
            y: topOffset + idx * rowSpacing,
            type: 'input',
          }
        })

        // Group gates by level and position them
        const gatesByLevel: Record<number, any[]> = {}
        gates.forEach((g: any) => {
          const level = gateLevels[g.id] || 0
          if (!gatesByLevel[level]) gatesByLevel[level] = []
          gatesByLevel[level].push(g)
        })

        Object.entries(gatesByLevel).forEach(([levelStr, levelGates]) => {
          const level = parseInt(levelStr)
          const x = leftX + (level + 1) * levelWidth

          levelGates.forEach((gate: any, idx: number) => {
            const y = topOffset + idx * rowSpacing
            positions[gate.id] = { x, y, type: 'gate' }
            if (gate.output) {
              positions[gate.output] = { x, y, type: 'gate' }
            }
          })
        })

        // Position final output
        if (finalOutput) {
          const sourceGateId = signalSource[finalOutput]
          const sourcePos = sourceGateId ? positions[sourceGateId] : null
          positions[finalOutput] = {
            x: rightX + 50,
            y: sourcePos ? sourcePos.y : topOffset,
            type: 'output',
          }
        }

        // Calculate SVG dimensions
        const svgWidth = rightX + 150
        const maxRows = Math.max(inputs.length, gates.length)
        const svgHeight = Math.max(300, topOffset + maxRows * rowSpacing)

        // Bezier curve helper
        const bezier = (x1: number, y1: number, x2: number, y2: number) => {
          const dx = Math.max(40, Math.abs(x2 - x1) * 0.5)
          const c1x = x1 + dx
          const c2x = x2 - dx
          return `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`
        }

        // Draw connection
        const drawConnection = (
          fromId: string,
          toId: string,
          inputIndex = 0,
          totalInputs = 1
        ) => {
          const from = positions[fromId]
          const to = positions[toId]
          if (!from || !to) return null

          let startX = from.x
          let startY = from.y
          let endX = to.x
          let endY = to.y

          // Adjust start position
          if (from.type === 'input') {
            startX += 20
          } else if (from.type === 'gate') {
            startX += 55
          }

          // Adjust end position
          if (to.type === 'gate') {
            endX -= 55
            const spacing = 60 / (totalInputs + 1)
            endY = endY - 30 + spacing * (inputIndex + 1)
          } else if (to.type === 'output') {
            endX -= 28
          }

          return (
            <path
              key={`${fromId}-${toId}-${inputIndex}`}
              d={bezier(startX, startY, endX, endY)}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeOpacity={0.7}
              markerEnd="url(#arrowhead)"
            />
          )
        }

        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <div className="rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {circuitData.caption || 'Circuit Diagram'}
                </h4>
              </div>

              {circuitData.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
                  {circuitData.description}
                </p>
              )}

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full text-gray-700 dark:text-gray-300"
                  style={{ minWidth: `${svgWidth}px` }}
                >
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="10"
                      refX="10"
                      refY="5"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <polygon
                        points="0 0, 10 5, 0 10"
                        fill="currentColor"
                        fillOpacity="0.7"
                      />
                    </marker>
                  </defs>

                  {/* Draw connections from inputs to gates */}
                  {gates.map((gate: any) =>
                    gate.inputs.map((inputSignal: string, inputIdx: number) =>
                      drawConnection(
                        inputSignal,
                        gate.id,
                        inputIdx,
                        gate.inputs.length
                      )
                    )
                  )}

                  {/* Draw connection from last gate to final output */}
                  {finalOutput &&
                    signalSource[finalOutput] &&
                    drawConnection(signalSource[finalOutput], finalOutput)}

                  {/* Render input nodes */}
                  {inputs.map((input: string) => {
                    const pos = positions[input]
                    if (!pos) return null
                    return (
                      <g key={input}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={20}
                          fill="#e0f2fe"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        />
                        <text
                          x={pos.x}
                          y={pos.y + 6}
                          textAnchor="middle"
                          fontWeight="bold"
                          fontSize={18}
                          fill="#0369a1"
                        >
                          {input}
                        </text>
                      </g>
                    )
                  })}

                  {/* Render gates */}
                  {gates.map((gate: any) => {
                    const pos = positions[gate.id]
                    if (!pos) return null
                    return renderGateInCircuit(gate, pos.x, pos.y)
                  })}

                  {/* Render final output */}
                  {finalOutput && positions[finalOutput] && (
                    <g key={finalOutput}>
                      <rect
                        x={positions[finalOutput].x - 28}
                        y={positions[finalOutput].y - 16}
                        width={56}
                        height={32}
                        rx={8}
                        fill="#fef3c7"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                      />
                      <text
                        x={positions[finalOutput].x}
                        y={positions[finalOutput].y + 6}
                        textAnchor="middle"
                        fontWeight="bold"
                        fontSize={16}
                        fill="#92400e"
                      >
                        {finalOutput}
                      </text>
                    </g>
                  )}
                </svg>
              </div>
            </div>
          </div>
        )

      case 'formula':
        // Helper function to parse and render formula with proper overlines
        const renderFormula = (formula: string) => {
          // Replace ‾(...) with proper overline rendering
          // Match pattern: ‾(content) or ‾content
          const parts = formula.split(/(‾\([^)]+\)|‾[A-Z]+)/g)

          return parts.map((part, idx) => {
            if (part.startsWith('‾(')) {
              // Extract content within parentheses
              const content = part.slice(2, -1) // Remove ‾( and )
              return (
                <span key={idx} style={{ textDecoration: 'overline' }}>
                  ({content})
                </span>
              )
            } else if (part.startsWith('‾')) {
              // Single variable with overline
              const content = part.slice(1)
              return (
                <span key={idx} style={{ textDecoration: 'overline' }}>
                  {content}
                </span>
              )
            }
            return <span key={idx}>{part}</span>
          })
        }

        return (
          <div
            key={key}
            className={`mb-6 text-center ${block.className || ''}`}
          >
            <div className="inline-block bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-md">
              <code className="text-xl font-mono text-gray-900 dark:text-gray-100 font-bold">
                {renderFormula(block.formula || '')}
              </code>
            </div>
          </div>
        )
      case 'callout':
        const calloutStyles: Record<string, string> = {
          info: 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-100',
          warning:
            'bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-100',
          tip: 'bg-green-50 border-green-300 text-green-900 dark:bg-green-900/20 dark:border-green-700 dark:text-green-100',
          important:
            'bg-red-50 border-red-300 text-red-900 dark:bg-red-900/20 dark:border-red-700 dark:text-red-100',
        }

        const calloutIcons: Record<string, string> = {
          info: 'ℹ️',
          warning: '⚠️',
          tip: '💡',
          important: '❗',
        }

        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <div
              className={`border-2 rounded-xl p-5 shadow-sm ${calloutStyles[block.callout?.type || 'info']}`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl flex-shrink-0">
                  {calloutIcons[block.callout?.type || 'info']}
                </span>
                <div className="flex-1">
                  {block.callout?.title && (
                    <h4 className="font-bold text-lg mb-2">
                      {block.callout.title}
                    </h4>
                  )}
                  <p className="text-sm leading-relaxed">
                    {block.callout?.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'divider':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <hr className="border-t-2 border-gray-300 dark:border-gray-700" />
          </div>
        )

      case 'custom':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            {block.content}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`prose prose-lg max-w-none dark:prose-invert ${className}`}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  )
}

export default ContentDisplay
