import { useEffect, useMemo, useState, useCallback } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRoadmapData } from '@/hooks/useRoadmapData'
import { apiService } from '@/services/api.service'
import { toast } from 'sonner'
import bitbotIdle from '@/assets/bitbot/idle.svg'

import {
  AdaptivePracticeCard,
  AnalyticsCard,
  LessonCard,
  LessonListItem,
  LessonDetailsDialog,
  LessonsFilter,
  lessons,
  lessonImages,
  csQuotes,
  type Lesson,
  type LessonTopicDisplay,
  type LessonProgress,
  type TopicProgress,
  type TopicMastery,
} from '@/components/roadmap'

export const Route = createFileRoute('/roadmap/refactored')({
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [loadingAssessment, setLoadingAssessment] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState<string>('All Status')
  const navigate = useNavigate()
  const { user } = useAuthContext() || {}
  
  const ALLOW_ANON = import.meta.env.VITE_ALLOW_ANON_ASSESSMENT === 'true'
  const FALLBACK_USER_ID =
    import.meta.env.VITE_FALLBACK_USER_ID ??
    '5ed45890-4804-46fd-bfa1-5695515375ea'
  const effectiveUser = user ?? (ALLOW_ANON ? { id: FALLBACK_USER_ID } : null)

  const lessonIds = useMemo(() => lessons.map((lesson) => lesson.id), [])
  const {
    lessonProgress,
    topicsProgress,
    topicMastery,
    analytics,
    statistics,
    error: roadmapError,
    refresh: refreshRoadmapData,
  } = useRoadmapData(user?.id, lessonIds)

  // Show inspirational quote on mount
  useEffect(() => {
    const showQuote = () => {
      const randomQuote = csQuotes[Math.floor(Math.random() * csQuotes.length)]
      toast.custom(
        (t) => (
          <div className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800 rounded-md shadow-md p-4 flex items-start gap-4 max-w-md pointer-events-auto">
            <img src={bitbotIdle} alt="BitBot" className="w-12 h-12 shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-amber-600 dark:text-amber-400 text-sm mb-1">
                BitBot's Travel Tip
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "{randomQuote.text}"
              </p>
              <p className="text-xs text-gray-500 mt-1">
                - {randomQuote.author}
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>
        ),
        { duration: 8000, position: 'bottom-right' }
      )
    }

    const timer = setTimeout(showQuote, 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (roadmapError) {
      toast.error(roadmapError)
    }
  }, [roadmapError])

  const handleStartAdaptiveAssessment = async () => {
    if (!effectiveUser) {
      toast.error('Please log in to start an assessment')
      return
    }
    setLoadingAssessment(true)
    try {
      const result = await apiService.post<{
        success: boolean
        data: { attemptId: number }
        error?: string
      }>(
        '/assessment/start-adaptive-practice',
        { uid: effectiveUser.id },
        true,
        { timeout: 60000 } // 60 second timeout for AI-powered endpoint
      )
      if (result.success) {
        navigate({
          to: '/assessment/$assessmentId',
          params: { assessmentId: result.data.attemptId.toString() },
        })
        refreshRoadmapData()
      } else {
        throw new Error(result.error || 'Failed to start assessment')
      }
    } catch (error) {
      console.error('Failed to start assessment:', error)
      toast.error('Failed to start assessment. Please try again.')
    } finally {
      setLoadingAssessment(false)
    }
  }

  const getLessonStatus = useCallback(
    (lessonId: number) => {
      const progress = lessonProgress.find(
        (p: LessonProgress) => p.lessonId === lessonId
      )
      const isCompleted =
        progress?.status === 'completed' || (progress?.progress || 0) >= 1
      const isStarted = (progress?.progress || 0) > 0

      const lessonMastery = topicMastery[lessonId] as TopicMastery[] | undefined
      const masteryScore = lessonMastery?.length
        ? Math.round(
            (lessonMastery.reduce((sum, topic) => sum + topic.mastery, 0) /
              lessonMastery.length) *
              100
          )
        : progress?.masteryScore
          ? Math.round(progress.masteryScore * 100)
          : null

      return {
        status: isCompleted
          ? 'completed'
          : isStarted
            ? 'in-progress'
            : 'not-started',
        progress: Math.round((progress?.progress || 0) * 100),
        masteryScore,
        isLocked: false,
      } as const
    },
    [lessonProgress, topicMastery]
  )

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const { status } = getLessonStatus(lesson.id)
      if (statusFilter === 'All Status') return true
      if (statusFilter === 'Not Started') return status === 'not-started'
      if (statusFilter === 'In Progress') return status === 'in-progress'
      if (statusFilter === 'Completed') return status === 'completed'
      return true
    })
  }, [statusFilter, getLessonStatus])

  const getTopicsForLesson = (lesson: Lesson): LessonTopicDisplay[] => {
    const dynamicTopics = topicsProgress[lesson.id] as TopicProgress[] | undefined
    if (dynamicTopics?.length) {
      return dynamicTopics.map((topic, index) => ({
        id:
          typeof topic.topicId === 'string'
            ? parseInt(topic.topicId)
            : topic.topicId,
        title:
          topic.topic?.title ||
          lesson.topics[index]?.title ||
          `Topic ${index + 1}`,
        description:
          topic.topic?.description || lesson.topics[index]?.description || '',
        status: topic.status || 'not-started',
        timeSpent: topic.timeSpent,
      }))
    }

    return lesson.topics.map((topic, index) => ({
      id: parseInt(topic.id.split('-')[1]) || index + 1,
      title: topic.title,
      description: topic.description,
      status: 'not-started',
      timeSpent: 0,
    }))
  }

  const selectedLessonTopics = selectedLesson
    ? getTopicsForLesson(selectedLesson)
    : []
  const recommendedDifficulty = analytics?.recommendedDifficulty ?? null
  const focusTopics = analytics?.focusAreas?.slice(0, 2) ?? []
  const totalAdaptiveAttempts =
    statistics?.totalAttempts ?? analytics?.totalAttempts ?? 0

  const handleStartLesson = () => {
    if (!selectedLesson) return

    if (!user) {
      navigate({ to: '/login' })
      return
    }

    navigate({
      to: '/lesson/$lessonId',
      params: { lessonId: selectedLesson.id.toString() },
      search: {
        topicId: parseInt(selectedLesson.topics[0].id.split('-')[1]),
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 mt-5">
        {/* Top Section: Adaptive & Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AdaptivePracticeCard
            recommendedDifficulty={recommendedDifficulty}
            loadingAssessment={loadingAssessment}
            onStartAssessment={handleStartAdaptiveAssessment}
          />
          <AnalyticsCard
            totalAttempts={totalAdaptiveAttempts}
            focusTopics={focusTopics}
            overallMastery={analytics?.overallMastery ?? null}
          />
        </div>

        {/* Lessons Section */}
        <div className="space-y-6">
          <LessonsFilter
            totalCount={filteredLessons.length}
            statusFilter={statusFilter}
            viewMode={viewMode}
            onStatusFilterChange={setStatusFilter}
            onViewModeChange={setViewMode}
          />

          {/* Lessons Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  lessonStatus={getLessonStatus(lesson.id)}
                  lessonImage={lessonImages[lesson.id]}
                  onSelect={setSelectedLesson}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLessons.map((lesson) => (
                <LessonListItem
                  key={lesson.id}
                  lesson={lesson}
                  lessonStatus={getLessonStatus(lesson.id)}
                  lessonImage={lessonImages[lesson.id]}
                  onSelect={setSelectedLesson}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lesson Details Dialog */}
      <LessonDetailsDialog
        selectedLesson={selectedLesson}
        topics={selectedLessonTopics}
        topicsProgress={topicsProgress as Record<number, TopicProgress[]>}
        topicMastery={topicMastery as Record<number, TopicMastery[]>}
        isLoggedIn={!!user}
        onClose={() => setSelectedLesson(null)}
        onStartLesson={handleStartLesson}
      />
    </div>
  )
}
