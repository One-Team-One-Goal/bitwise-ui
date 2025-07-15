import LessonHeader from '@/components/LessonHeader'
import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { lessons } from '@/utils/data'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { Confetti, type ConfettiRef } from '@/components/magicui/confetti'
import bitbotRightPoint from '@/assets/bitbot/right-point.svg'

export const Route = createFileRoute('/lesson')({
  component: RouteComponent,
})

function RouteComponent() {
  // For demo, use the first lesson
  const lesson = lessons[0]
  const [pageIdx, setPageIdx] = useState(0)
  const [finished, setFinished] = useState(false)
  const page = lesson.pages[pageIdx]
  const confettiRef = useRef<ConfettiRef>(null)

  useEffect(() => {
    if (finished) {
      confettiRef.current?.fire({})
    }
  }, [finished])

  return (
    <div>
      <LessonHeader
        progress={finished ? 100 : (pageIdx / lesson.pages.length) * 100}
      />
      <div className="pt-36 max-w-2xl mx-auto flex flex-col items-center">
        {!finished ? (
          <div className="w-full p-6 pb-20 flex flex-col relative">
            <img
              src={bitbotRightPoint}
              alt="Bitbot Right Point"
              className="absolute left-[-120px] bottom-[-20px] w-30 z-50 opacity-90 pointer-events-none select-none"
              draggable="false"
            />
            <p className="text-2xl font-semibold mb-2">{page.title}</p>
            {page.blocks?.map((block, idx) => {
              switch (block.type) {
                case 'text':
                  return (
                    <p key={idx} className="text-lg mb-6">
                      {block.text}
                    </p>
                  )
                case 'inlineCode':
                  return (
                    <div key={idx} className="mb-6">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {block.code}
                      </code>
                    </div>
                  )
                case 'image':
                  return (
                    block.image && (
                      <img
                        key={idx}
                        src={block.image}
                        alt="Lesson"
                        className="mb-4 max-h-48 rounded"
                      />
                    )
                  )
                case 'list':
                  return (
                    <ul key={idx} className="list-disc pl-6 mb-6">
                      {block.list?.map((item, i) => (
                        <li key={i} className="mb-1 text-lg">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )
                case 'table':
                  return (
                    <div key={idx} className="overflow-x-auto mb-6">
                      <table className="min-w-full border border-gray-300 rounded">
                        <thead className="bg-gray-100">
                          <tr>
                            {block.table?.headers.map((header, i) => (
                              <th
                                key={i}
                                className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.table?.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className="px-4 py-2 border-b text-sm text-gray-600"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                case 'custom':
                  return block.content
                default:
                  return null
              }
            })}
          </div>
        ) : (
          <div className="w-full p-6 pt-36 flex flex-col items-center justify-between min-h-[600px] relative">
            <Confetti
              ref={confettiRef}
              className="absolute left-0 top-0 z-0 w-full h-full"
            />
            <div className="relative z-10">
              <p className="text-4xl font-bold mb-4 text-center">
                Lesson Complete!
              </p>
              <p className="text-lg mb-6 text-center">
                You've finished the lesson on {lesson.name}.
              </p>
            </div>
            <div className="flex gap-4 relative z-10">
              <Button
                variant={'bluezOutline'}
                className="bg-gray-700 w-40 text-white px-6 py-2 rounded"
                onClick={() => {
                  if (lessons.length > 1) {
                    setPageIdx(0)
                    setFinished(false)
                    // For demo, just alert. You can implement navigation to next lesson here.
                    alert('Go to next lesson!')
                  }
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Fixed pagination at bottom */}
      {!finished && (
        <div className="fixed bottom-0 left-0 w-full bg-white flex justify-center py-4 z-40">
          <div className="flex w-full max-w-2xl mx-auto justify-between items-center py-4">
            <div>
              {pageIdx > 0 && (
                <Button
                  variant="ghost"
                  className="px-4 py-2 rounded text-gray-700"
                  onClick={() => setPageIdx((i) => Math.max(i - 1, 0))}
                >
                  <ChevronLeft />
                  Previous
                </Button>
              )}
            </div>
            <div>
              {pageIdx < lesson.pages.length - 1 ? (
                <Button
                  variant="ghost"
                  className="px-4 py-2 rounded text-gray-700"
                  onClick={() =>
                    setPageIdx((i) => Math.min(i + 1, lesson.pages.length - 1))
                  }
                >
                  Next <ChevronRight />
                </Button>
              ) : (
                <Button
                  variant={'ghost'}
                  className="px-4 py-2 rounded"
                  onClick={() => setFinished(true)}
                >
                  Finish
                  <Check />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
