// ...existing code...
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import LessonHeader from '@/components/LessonHeader'
import { useGetLesson } from '@/hooks/useLesson'

import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { Confetti, type ConfettiRef } from '@/components/magicui/confetti'
import bitbotRightPoint from '@/assets/bitbot/right-point.svg'
import ContentDisplay from '@/components/ContentDisplay'

// Local content types (keeps file self-contained)
interface ContentBlock {
  type: 'text' | 'inlineCode' | 'codeBlock' | 'image' | 'list' | 'table' | 'formula' | 'callout' | 'divider' | 'custom';
  text?: string;
  code?: string;
  language?: string;
  image?: string;
  alt?: string;
  list?: string[] | { text: string; subItems?: string[] }[];
  table?: {
    headers: string[];
    rows: string[][];
    caption?: string;
  };
  formula?: string;
  callout?: {
    type: 'info' | 'warning' | 'tip' | 'important';
    title?: string;
    content: string;
  };
  content?: React.ReactNode;
  className?: string;
}

export interface Topic {
  id: number
  title: string
  lessonId: number
  contentText: string
  displayContent?: ContentBlock[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  id: number
  title: string
  topics: Topic[]
  createdAt: string
  updatedAt: string
}

export const Route = createFileRoute('/lesson/$lessonId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { lessonId } = Route.useParams()
  const navigate = useNavigate()
  const lessonIdNum = lessonId ? Number(lessonId) : undefined

  // useGetLesson from useLessonQueries (react-query)
  const { data: lesson, isLoading, error } = useGetLesson(lessonIdNum)

  const [topicIdx, setTopicIdx] = useState(0)
  const [finished, setFinished] = useState(false)
  const confettiRef = useRef<ConfettiRef>(null)

  // reset progress when lesson changes
  useEffect(() => {
    setTopicIdx(0)
    setFinished(false)
  }, [lesson?.id])

  useEffect(() => {
    if (finished) {
      confettiRef.current?.fire({})
    }
  }, [finished])

  if (isLoading) {
    return (
      <div className="pt-36 max-w-4xl mx-auto flex flex-col items-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        </div>
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="pt-36 max-w-4xl mx-auto flex flex-col items-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">{error ? (error as Error).message : 'Lesson not found.'}</p>
      </div>
    )
  }

  if (topicIdx < 0 || topicIdx >= (lesson.topics?.length ?? 0)) {
    return (
      <div className="pt-36 max-w-4xl mx-auto flex flex-col items-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">Invalid topic.</p>
      </div>
    )
  }

  const topic = lesson.topics?.[topicIdx]
  
  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500 dark:text-gray-400">Topic not found.</p>
      </div>
    )
  }

  return (
    <div>
      <LessonHeader
        progress={finished ? 100 : (topicIdx / (lesson.topics?.length || 1)) * 100}
        title={lesson.title}
      />
      <div className="pt-24 max-w-4xl mx-auto flex flex-col">
        {!finished ? (
          <div className="w-full p-6 pb-20 flex flex-col relative">
            <img
              src={bitbotRightPoint}
              alt="Bitbot Right Point"
              className="fixed left-[calc(50%-600px)] top-32 w-28 z-50 opacity-90 pointer-events-none select-none animate-float"
              style={{ transition: 'top 0.3s, left 0.3s' }}
              draggable="false"
            />

            {/* Topic Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {topic.title}
              </h1>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                <span>Topic {topicIdx + 1} of {lesson.topics?.length || 0}</span>
                {(topic.tags?.length || 0) > 0 && (
                  <div className="flex space-x-1">
                    {topic.tags?.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content Display */}
            {Array.isArray(topic.displayContent) ? (
              <ContentDisplay blocks={topic.displayContent as any} />
            ) : (
              <div className="text-gray-500 dark:text-gray-400 italic">No content available</div>
            )}
          </div>
        ) : (
          <div className="w-full p-6 pt-16 flex flex-col items-center justify-between min-h-[600px] relative">
            <Confetti
              ref={confettiRef}
              className="absolute left-0 top-0 z-0 w-full h-full"
            />
            <div className="relative z-10 text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-12 h-12 text-green-600 dark:text-green-300" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Lesson Complete!
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                  You've finished the lesson on
                </p>
                <p className="text-2xl font-semibold text-blue-600 dark:text-blue-300">
                  {lesson.title}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
                <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
                  Topics completed: {lesson.topics?.length || 0}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {lesson.topics?.map((t, i) => (
                    <span
                      key={i}
                      className="text-sm bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 px-2 py-1 rounded"
                    >
                      ✓ {t.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 relative z-10">
              <Button
                variant="outline"
                className="w-40"
                onClick={() => {
                  setTopicIdx(0)
                  setFinished(false)
                }}
              >
                Restart Lesson
              </Button>
              <Button
                className="w-40"
                onClick={() => {
                  navigate({ to: '/roadmap' })
                }}
              >
                Back to Roadmap
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed pagination at bottom */}
      {!finished && (
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-center py-4 z-40 shadow-lg">
          <div className="flex w-full max-w-4xl mx-auto justify-between items-center px-6">
            <div>
              {topicIdx > 0 ? (
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => setTopicIdx((i) => Math.max(i - 1, 0))}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>
              ) : (
                <div className="w-24"></div>
              )}
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {topicIdx + 1} / {lesson.topics?.length || 0}
            </div>

            <div>
              {topicIdx < (lesson.topics?.length || 0) - 1 ? (
                <Button
                  className="flex items-center space-x-2"
                  onClick={() =>
                    setTopicIdx((i) => Math.min(i + 1, (lesson.topics?.length || 1) - 1))
                  }
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  className="flex items-center space-x-2"
                  onClick={() => setFinished(true)}
                >
                  <span>Finish</span>
                  <Check className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// ...existing code...