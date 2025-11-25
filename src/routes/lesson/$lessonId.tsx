import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import LessonHeader from '@/components/LessonHeader'
import { useGetLesson } from '@/hooks/useLesson'
import {
  useMarkTopicViewed,
  useMarkTopicCompleted,
  useTopicsForLesson,
} from '@/hooks/useUserProgress'
import { useAuthContext } from '@/contexts/AuthContext'

import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { Confetti, type ConfettiRef } from '@/components/magicui/confetti'
import BitBotGuide from '@/components/BitBotGuide'
import ToolSpotlight from '@/components/ToolSpotlight'
import ContentDisplay from '@/components/ContentDisplay'

// Local content types (keeps file self-contained)
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
  formula?: string
  callout?: {
    type: 'info' | 'warning' | 'tip' | 'important'
    title?: string
    content: string
  }
  content?: React.ReactNode
  className?: string
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
  validateSearch: (search) => {
    const topicParam = search.topicId
    const parsed =
      typeof topicParam === 'string'
        ? Number(topicParam)
        : typeof topicParam === 'number'
          ? topicParam
          : undefined

    return {
      topicId:
        typeof parsed === 'number' && !Number.isNaN(parsed)
          ? parsed
          : undefined,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { lessonId } = Route.useParams()
  const { topicId: initialTopicId } = Route.useSearch()
  const navigate = useNavigate()
  const lessonIdNum = lessonId ? Number(lessonId) : undefined
  const { user } = useAuthContext() || {}

  // useGetLesson from useLessonQueries (react-query)
  const { data: lesson, isLoading, error } = useGetLesson(lessonIdNum)

  const { data: lessonTopicsProgress } = useTopicsForLesson(lessonIdNum, !!user)

  const [topicIdx, setTopicIdx] = useState(0)
  const [finished, setFinished] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [completionError, setCompletionError] = useState<string | null>(null)
  const confettiRef = useRef<ConfettiRef>(null)

  // Progress tracking mutations
  const markViewedMutation = useMarkTopicViewed()
  const markCompletedMutation = useMarkTopicCompleted()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToTopic = (nextIndex: number) => {
    if (!lesson?.topics?.length) return
    const clampedIndex = Math.max(
      0,
      Math.min(nextIndex, lesson.topics.length - 1)
    )
    setTopicIdx(clampedIndex)
    setFinished(false)
    setCompletionError(null)

    const nextTopic = lesson.topics[clampedIndex]
    if (nextTopic) {
      navigate({
        to: '/lesson/$lessonId',
        params: { lessonId },
        search: { topicId: nextTopic.id },
        replace: true,
      })
    }
  }

  const completeTopic = async (topicId: number, onSuccess: () => void) => {
    if (!user) {
      onSuccess()
      return
    }

    try {
      setCompletionError(null)
      setIsCompleting(true)
      await markCompletedMutation.mutateAsync(topicId)
      onSuccess()
    } catch (error) {
      console.error('❌ Error marking topic as completed:', error)
      setCompletionError(
        'Failed to mark this topic as completed. Please try again.'
      )
    } finally {
      setIsCompleting(false)
    }
  }

  // reset progress when lesson changes
  useEffect(() => {
    if (!lesson?.topics) {
      return
    }

    if (typeof initialTopicId === 'number') {
      const matchingIndex = lesson.topics.findIndex(
        (t) => t.id === initialTopicId
      )
      if (matchingIndex >= 0) {
        setTopicIdx(matchingIndex)
        setFinished(false)
        return
      }
    }

    setTopicIdx(0)
    setFinished(false)
  }, [lesson?.id, lesson?.topics, initialTopicId])

  // Auto-mark topic as viewed when user lands on it
  useEffect(() => {
    const topic = lesson?.topics?.[topicIdx]
    if (user && topic) {
      console.log(`👁️ Setting up timer to mark topic ${topic.id} as viewed...`)
      // Mark as viewed after 2 seconds of viewing
      const timer = setTimeout(() => {
        console.log(`👁️ Marking topic ${topic.id} as viewed now`)
        markViewedMutation.mutate(topic.id, {
          onSuccess: (data) => {
            console.log('✅ Topic marked as viewed:', data)
          },
          onError: (error) => {
            console.error('❌ Error marking topic as viewed:', error)
          },
        })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [topicIdx, lesson, user, markViewedMutation])

  useEffect(() => {
    if (finished) {
      console.log('🎉 Firing confetti!', confettiRef.current)
      // Fire confetti multiple times for better effect
      confettiRef.current?.fire({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      // Fire again after a short delay
      setTimeout(() => {
        confettiRef.current?.fire({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        })
      }, 250)

      setTimeout(() => {
        confettiRef.current?.fire({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        })
      }, 400)
    }
  }, [finished])

  useEffect(() => {
    scrollToTop()
  }, [topicIdx])

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
        <p className="text-lg text-gray-500 dark:text-gray-400">
          {error ? (error as Error).message : 'Lesson not found.'}
        </p>
      </div>
    )
  }

  if (topicIdx < 0 || topicIdx >= (lesson.topics?.length ?? 0)) {
    return (
      <div className="pt-36 max-w-4xl mx-auto flex flex-col items-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Invalid topic.
        </p>
      </div>
    )
  }

  const topic = lesson.topics?.[topicIdx]

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Topic not found.
        </p>
      </div>
    )
  }

  const currentTopicProgress = lessonTopicsProgress?.find(
    (topicEntry: any) => topicEntry.id === topic.id
  )?.userProgress
  const isCurrentTopicCompleted = currentTopicProgress?.status === 'completed'

  const handleMarkTopicComplete = () => {
    if (!topic || isCurrentTopicCompleted || isCompleting) return
    void completeTopic(topic.id, () => {})
  }

  const handleNextTopic = async () => {
    if (isCompleting) return
    if (!lesson?.topics?.length) return

    const current = lesson.topics[topicIdx]
    if (!current) return

    if (!user || isCurrentTopicCompleted) {
      goToTopic(topicIdx + 1)
      return
    }

    await completeTopic(current.id, () => {
      goToTopic(topicIdx + 1)
    })
  }

  const handleFinishLesson = async () => {
    if (isCompleting) return
    if (!lesson?.topics?.length) {
      setFinished(true)
      return
    }

    const current = lesson.topics[topicIdx]
    if (!current) {
      setFinished(true)
      return
    }

    if (!user || isCurrentTopicCompleted) {
      setFinished(true)
      return
    }

    await completeTopic(current.id, () => {
      setFinished(true)
    })
  }

  const calculateProgress = () => {
    if (finished) return 100

    const totalTopics =
      lessonTopicsProgress?.length ?? lesson.topics?.length ?? 0
    if (totalTopics === 0) return 0

    if (user && lessonTopicsProgress) {
      const completedTopics = lessonTopicsProgress.filter(
        (topicProgress: any) =>
          topicProgress.userProgress?.status === 'completed'
      ).length
      return Math.round((completedTopics / totalTopics) * 100)
    }

    const fallbackProgress = ((topicIdx + 1) / totalTopics) * 100
    return Math.round(fallbackProgress)
  }

  const getToolForLesson = (lessonId: number) => {
    switch (lessonId) {
      case 1:
        return 'calculator'
      case 2:
        return 'circuit'
      case 3:
        return 'kmap'
      default:
        return null
    }
  }

  const toolToSpotlight = lesson ? getToolForLesson(lesson.id) : null

  return (
    <div>
      <LessonHeader progress={calculateProgress()} title={lesson.title} />
      <div className="pt-24 max-w-4xl mx-auto flex flex-col">
        {!finished ? (
          <div className="w-full p-6 pb-20 flex flex-col relative">
            <BitBotGuide
              message={`Let's learn about ${topic.title}!`}
              emotion="pointing-left"
              position="bottom-right"
              className="fixed bottom-8 right-8 z-50"
            />

            {/* Topic Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {topic.title}
              </h1>
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                {/* Show topic counter for all topics */}
                <div className="flex space-x-4">
                  <span>
                    Topic {topicIdx + 1} of {lesson.topics?.length || 0}
                  </span>
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
                {user && (
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleMarkTopicComplete}
                      disabled={isCompleting || isCurrentTopicCompleted}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {isCurrentTopicCompleted
                        ? 'Topic Completed'
                        : 'Mark Topic Complete'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {completionError && (
              <div className="mb-4 text-sm text-red-500">{completionError}</div>
            )}

            {/* Content Display */}
            {Array.isArray(topic.displayContent) ? (
              <ContentDisplay blocks={topic.displayContent as any} />
            ) : (
              <div className="text-gray-500 dark:text-gray-400 italic">
                No content available
              </div>
            )}

            {toolToSpotlight && <ToolSpotlight tool={toolToSpotlight as any} />}
          </div>
        ) : (
          <div className="w-full p-6 pt-16 flex flex-col items-center justify-between min-h-[600px] relative">
            <Confetti
              ref={confettiRef}
              manualstart={true}
              className="absolute left-0 top-0 z-0 w-full h-full pointer-events-none"
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
                Back to Dashboard
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
                  onClick={() => goToTopic(topicIdx - 1)}
                  disabled={isCompleting}
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
                  onClick={() => {
                    void handleNextTopic()
                  }}
                  disabled={isCompleting}
                >
                  <span>{isCompleting ? 'Saving...' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  className="flex items-center space-x-2"
                  onClick={() => {
                    void handleFinishLesson()
                  }}
                  disabled={isCompleting}
                >
                  <span>{isCompleting ? 'Saving...' : 'Finish'}</span>
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
