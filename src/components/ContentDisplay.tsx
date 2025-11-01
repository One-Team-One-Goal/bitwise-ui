// ...existing code...
import React from 'react'

interface ContentBlock {
  type:
    | 'text'
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
  text?: string
  code?: string
  language?: string
  image?: string
  alt?: string
  list?: string[] | { text: string; subItems?: string[] }[]
  table?: {
    headers: string[]
    rows: string[][]
    caption?: string
  }
  karnaughMap?: {
    headers: string[]
    rows: string[][]
    caption?: string
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
  const renderBlock = (block: ContentBlock, index: number) => {
    const key = `block-${index}`

    switch (block.type) {
      case 'text':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-100">
              {block.text}
            </p>
          </div>
        )

      case 'inlineCode':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <code className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-md text-sm font-mono text-gray-800 dark:text-gray-100 inline-block">
              {block.code}
            </code>
          </div>
        )

      case 'codeBlock':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              {/* Syntax highlighter can be plugged here later */}
              <pre className="m-0 p-4 text-sm font-mono text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                {block.code}
              </pre>
            </div>
          </div>
        )

      case 'image':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            {block.image && (
              <img
                src={block.image}
                alt={block.alt || 'Lesson image'}
                className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              />
            )}
          </div>
        )

      case 'list':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <ul className="space-y-2">
              {block.list?.map((item, i) => {
                if (typeof item === 'string') {
                  return (
                    <li
                      key={i}
                      className="flex items-start text-lg text-gray-800 dark:text-gray-100"
                    >
                      <span className="text-blue-500 dark:text-blue-300 mr-3 mt-1">•</span>
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  )
                } else {
                  return (
                    <li key={i} className="text-lg text-gray-800 dark:text-gray-100">
                      <div className="flex items-start">
                        <span className="text-blue-500 dark:text-blue-300 mr-3 mt-1">•</span>
                        <div>
                          <span
                            dangerouslySetInnerHTML={{ __html: item.text }}
                          />
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
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: subItem,
                                    }}
                                  />
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
            </ul>
          </div>
        )

      case 'table':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
              {block.table?.caption && (
                <div className="px-4 pt-3">
                  <caption className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {block.table.caption}
                  </caption>
                </div>
              )}
              <table className="min-w-full text-center border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    {block.table?.headers.map((header, i) => (
                      <th
                        key={i}
                        className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.table?.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={rIdx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="px-6 py-3 text-sm text-gray-900 dark:text-gray-100"
                        >
                          {cell}
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
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
              {block.karnaughMap?.caption && (
                <div className="px-4 pt-3">
                  <caption className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {block.karnaughMap.caption}
                  </caption>
                </div>
              )}
              <table className="min-w-full text-center border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100"></th>
                    {block.karnaughMap?.headers.map((header, i) => (
                      <th
                        key={i}
                        className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.karnaughMap?.rows.map((row, rIdx) => (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                      <th className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800">
                        {`Row ${rIdx + 1}`}
                      </th>
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="px-6 py-3 text-sm font-mono text-gray-900 dark:text-gray-100"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'formula':
        return (
          <div
            key={key}
            className={`mb-6 text-center ${block.className || ''}`}
          >
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 inline-block">
              <code className="text-lg font-mono text-gray-800 dark:text-gray-100">
                {block.formula}
              </code>
            </div>
          </div>
        )

      case 'callout':
        const calloutStyles: Record<string, string> = {
          info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-200',
          warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-800 dark:text-yellow-200',
          tip: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-800 dark:text-green-200',
          important: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-800 dark:text-red-200',
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
              className={`border rounded-lg p-4 ${calloutStyles[block.callout?.type || 'info']}`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-xl">{calloutIcons[block.callout?.type || 'info']}</span>
                <div className="flex-1">
                  {block.callout?.title && (
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
                      {block.callout.title}
                    </h4>
                  )}
                  <p className="text-sm text-gray-800 dark:text-gray-100">{block.callout?.content}</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'divider':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <hr className="border-gray-200 dark:border-gray-700" />
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
// ...existing code...