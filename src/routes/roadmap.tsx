import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
} from '@mui/lab'
import AnimatedAssessmentButton from '@/components/buttons/AnimatedAssessmentButton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DataAnalyticsCard from '@/components/DataAnalyticsCard'
import { useAuthContext } from '@/contexts/AuthContext'
import { useAllUserProgress } from '@/hooks/useUserProgress'
import { userProgressService } from '@/services/user-progress.service'
import { Loader2, Brain, AlertCircle, ChevronDown, BookOpen, CheckCircle2, Clock } from 'lucide-react'
import bitbotIdle from '@/assets/bitbot/idle.svg'

// Define types for better TypeScript support
interface RoadmapTopic {
  id: string
  title: string
  description: string
}

interface Lesson {
  id: number
  title: string
  description: string
  details: string
  topics: RoadmapTopic[]
}

// Lessons with topics
const lessons: Lesson[] = [
  {
    id: 1,
    title: 'Intro to Boolean Algebra',
    description: 'Basics, history, and importance in logic.',
    details:
      "Boolean Algebra deals with true/false values. It's key in computer science and circuit design.",
  topics: [
      {
        id: '1-1',
        title: 'What is Boolean Algebra?',
        description: 'Definition and origins.',
      },
      {
        id: '1-2',
        title: 'Boolean Values',
        description: 'True/False, 1/0, and their meaning.',
      },
      {
        id: '1-3',
        title: 'Applications',
        description: 'Where Boolean Algebra is used.',
      },
    ],
  },
  {
    id: 2,
    title: 'Logic Gates',
    description: 'Learn AND, OR, NOT, and more.',
    details:
      'Logic gates are digital circuit components that execute Boolean functions.',
  topics: [
      {
        id: '2-1',
        title: 'AND, OR, NOT',
        description: 'Basic gates and their symbols.',
      },
      {
        id: '2-2',
        title: 'NAND, NOR',
        description: 'Universal gates and their uses.',
      },
      {
        id: '2-3',
        title: 'XOR, XNOR',
        description: 'Exclusive gates and applications.',
      },
    ],
  },
  {
    id: 3,
    title: 'Truth Tables',
    description: 'Make and read truth tables.',
    details:
      'Truth tables show all possible input/output combinations for logical expressions.',
  topics: [
      {
        id: '3-1',
        title: 'Constructing Truth Tables',
        description: 'Step-by-step process.',
      },
      {
        id: '3-2',
        title: 'Reading Truth Tables',
        description: 'How to interpret results.',
      },
      {
        id: '3-3',
        title: 'Truth Tables for Gates',
        description: 'Examples for each gate.',
      },
    ],
  },
  {
    id: 4,
    title: 'Simplification',
    description: 'Reduce logic expressions efficiently.',
    details:
      'Simplifying logic reduces circuit complexity and improves performance.',
  topics: [
      {
        id: '4-1',
        title: 'Boolean Laws',
        description: 'Commutative, Associative, Distributive.',
      },
      {
        id: '4-2',
        title: 'Karnaugh Maps',
        description: 'Visual simplification method.',
      },
      {
        id: '4-3',
        title: 'Practical Examples',
        description: 'Simplifying real expressions.',
      },
    ],
  },
]

export const Route = createFileRoute('/roadmap')({
  component: RouteComponent,
})

function RouteComponent() {
  const [selected, setSelected] = useState<typeof timelineItems[0] | null>(null)
  const [loadingAssessment, setLoadingAssessment] = useState(false)
  const [assessmentError, setAssessmentError] = useState<string | null>(null)
  const [showScrollHint, setShowScrollHint] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuthContext() || { }
  const ALLOW_ANON = import.meta.env.VITE_ALLOW_ANON_ASSESSMENT === 'true'
  const FALLBACK_USER_ID = import.meta.env.VITE_FALLBACK_USER_ID ?? '5ed45890-4804-46fd-bfa1-5695515375ea'
  const effectiveUser = user ?? (ALLOW_ANON ? { id: FALLBACK_USER_ID } : null)

  // Fetch user progress
  const { data: userProgress = [] } = useAllUserProgress(!!user)

  const [topicsProgress, setTopicsProgress] = useState<Record<number, any[]>>({})

  const userProgressKey = useMemo(
    () =>
      userProgress
        .map((lesson) => `${lesson.lessonId}:${lesson.status}:${Math.round(lesson.progress * 100)}`)
        .join('|'),
    [userProgress]
  )

  useEffect(() => {
    if (!user) {
      setTopicsProgress({})
      return
    }

    let cancelled = false

    const fetchAllLessonTopics = async () => {
      try {
        const results = await Promise.all(
          lessons.map(async (lesson) => {
            try {
              const data = await userProgressService.getTopicsForLesson(lesson.id)
              return [lesson.id, data] as const
            } catch (error) {
              console.error(`Failed to load topics for lesson ${lesson.id}`, error)
              return [lesson.id, []] as const
            }
          })
        )

        if (cancelled) return

        const next: Record<number, any[]> = {}
        for (const [lessonId, data] of results) {
          next[lessonId] = data
        }
        setTopicsProgress(next)
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load topic progress data', error)
        }
      }
    }

    fetchAllLessonTopics()

    return () => {
      cancelled = true
    }
  }, [user, userProgressKey])

  // Flatten lessons and topics for the timeline
  const timelineItems = lessons.flatMap((lesson) => [
    { ...lesson, isTopic: false as const },
    ...(lesson.topics || []).map((topic, i) => ({
      ...topic,
      parentId: lesson.id,
      isTopic: true as const,
      parentTitle: lesson.title,
      parentIdx: lesson.id,
      idx: i,
      details: `Details for ${topic.title}`,
    })),
  ])

  const resolveTopicIdForLesson = (lessonId: number, opts: { title?: string; idx?: number } = {}) => {
    const topicsForLesson = topicsProgress[lessonId] ?? []
    if (!topicsForLesson.length) return undefined

    const normalizedTitle = opts.title?.trim().toLowerCase()
    if (normalizedTitle) {
      const matchedByTitle = topicsForLesson.find((topic: any) => topic.title?.trim().toLowerCase() === normalizedTitle)
      if (matchedByTitle) return matchedByTitle.id
    }

    if (typeof opts.idx === 'number' && opts.idx >= 0 && opts.idx < topicsForLesson.length) {
      return topicsForLesson[opts.idx]?.id
    }

    return topicsForLesson[0]?.id
  }

  const navigateToLessonTopic = (lessonId: number, topicId?: number) => {
    if (typeof topicId === 'number') {
      navigate({
        to: '/lesson/$lessonId',
        params: { lessonId: String(lessonId) },
        search: { topicId },
      })
      return
    }

    navigate({ to: `/lesson/${lessonId}` })
  }

  const focusFirstTopicForLesson = (lessonId: number) => {
  const firstTopic = timelineItems.find((item) => item.isTopic && item.parentId === lessonId)
  if (!firstTopic || !firstTopic.isTopic) return undefined

    setSelected(firstTopic)
    setShowScrollHint(false)

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        const target = document.getElementById(`timeline-item-topic-${lessonId}-${firstTopic.idx}`)
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }

    return firstTopic
  }

  // Handle click: do not navigate immediately; update selection
  const handleItemClick = (item: any) => {
    setSelected(item)
    setShowScrollHint(false)
    // Don't navigate immediately, let user explore first
  }

  const handleStartLesson = () => {
    if (!selected) return

    if (!selected.isTopic) {
      const focusedTopic = focusFirstTopicForLesson(selected.id)

      if (!focusedTopic) {
        navigateToLessonTopic(selected.id)
      }

      return
    }

    const lessonId = selected.parentId
    const targetTopicId = resolveTopicIdForLesson(lessonId, {
      title: selected.title,
      idx: selected.idx,
    })

    navigateToLessonTopic(lessonId, targetTopicId)
  }

  // Handle adaptive assessment start
  const handleStartAdaptiveAssessment = async () => {
    if (!effectiveUser) return

    setLoadingAssessment(true)
    setAssessmentError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/assessment/start-adaptive-practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: effectiveUser.id }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        // Store the attempt data for the assessment component
        sessionStorage.setItem('currentAttempt', JSON.stringify(result.data))
        
        // Navigate to the assessment
        navigate({ to: `/assessment/${result.data.attemptId}` })
      } else {
        throw new Error(result.error || 'Failed to start adaptive assessment')
      }
    } catch (error) {
      console.error('Failed to start adaptive assessment:', error)
      setAssessmentError(error instanceof Error ? error.message : 'Failed to start assessment. Please try again.')
    } finally {
      setLoadingAssessment(false)
    }
  }

  // Handle regular practice assessment start (fallback)
  /* const handleStartRegularAssessment = async () => {
    if (!user) return

    setLoadingAssessment(true)
    setAssessmentError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/assessment/start-practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.id }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        sessionStorage.setItem('currentAttempt', JSON.stringify(result.data))
        navigate({ to: `/assessment/${result.data.attemptId}` })
      } else {
        throw new Error(result.error || 'Failed to start practice assessment')
      }
    } catch (error) {
      console.error('Failed to start practice assessment:', error)
      setAssessmentError(error instanceof Error ? error.message : 'Failed to start assessment. Please try again.')
    } finally {
      setLoadingAssessment(false)
    }
  } */

  return (
    <div className="m-auto mt-12 flex flex-col md:flex-row w-2/3 h-[80vh] gap-4 pt-24 overflow-hidden">
      {/* Left: Lesson Details */}
      <div className='flex flex-col gap-4 mr-4 shrink-0 max-h-full overflow-y-auto hide-scrollbar'>
        {!selected ? (
          /* Introduction State */
          <Card className="max-w-md w-full p-6 h-min">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">Welcome to Your Learning Path!</h2>
              </div>
              
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  This roadmap shows your Boolean Algebra learning journey with <strong className="text-foreground">{lessons.length} lessons</strong> covering everything from basics to advanced topics.
                </p>
                
                <p>
                  <strong className="text-foreground">Click any lesson tile</strong> on the right to explore its topics.
                </p>
                
                <p>
                  Each lesson has multiple <strong className="text-foreground">topics</strong> (shown as smaller tiles) that break down concepts step-by-step.
                </p>
                
                <p>
                  <strong className="text-foreground">Scroll down</strong> on the timeline to see all {lessons.length} lessons and their topics.
                </p>
              </div>

              <div className="mt-4 p-3 bg-accent/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Pro tip:</strong> Start with Lesson 1 and work your way through, or jump to any topic that interests you!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Selected Lesson Details */
          <>
            <Card className="max-w-md w-full p-6 h-min">
              <CardContent className="p-0 space-y-2">
                {/* Lesson badge */}
                {!selected.isTopic && (
                  <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
                    Lesson {lessons.findIndex((l) => l.id === selected.id) + 1}
                  </div>
                )}
                
                {selected.isTopic && (
                  <div className="inline-block px-3 py-1 bg-accent text-muted-foreground text-xs font-semibold rounded-full mb-2">
                    Topic of {selected.parentTitle}
                  </div>
                )}

                <h2 className="text-2xl font-bold">
                  {selected.title}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {selected.description}
                </p>
                <p className="text-sm text-muted-foreground">{selected.details}</p>

                {/* Start Lesson Button */}
                <Button 
                  className="w-full mt-4" 
                  onClick={handleStartLesson}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Start This Lesson
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        
        {/* Data Analytics Card - Only show when lesson selected */}
        {selected && <DataAnalyticsCard lesson={selected} user={user} />}

        {/* Adaptive Practice Assessment Card */}
        <Card className="max-w-md w-full p-6 h-min">
          <CardContent className="p-0 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Adaptive Practice Assessment
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Take a personalized assessment that adapts to your skill level and focuses on areas where you need improvement.
              </p>
            </div>

            {!user && !effectiveUser && (
              <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 p-2 rounded">
                <AlertCircle className="w-4 h-4" />
                You need to login before taking the assessment.
              </div>
            )}

            {assessmentError && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                <AlertCircle className="w-4 h-4" />
                {assessmentError}
              </div>
            )}

            <div className="space-y-2">
              <Button
                disabled={!user || loadingAssessment}
                className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700"
                onClick={handleStartAdaptiveAssessment}
              >
                {loadingAssessment ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Generating Assessment...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Take Adaptive Assessment
                  </>
                )}
              </Button>

           
            </div>

            <div className="text-xs text-muted-foreground">
              <p className="mb-1">
                <strong>Adaptive:</strong> Questions adjust to your skill level and focus on weak areas.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

  {/* Right: Timeline with topics (scrollable only) */}
      <div
        className="hide-scrollbar flex-1 flex flex-col justify-start items-center overflow-y-auto relative"
        style={{ maxHeight: '80vh', minHeight: '400px' }}
      >
        {/* Scroll hint - fades after interaction */}
        {showScrollHint && (
          <div className="sticky top-0 z-10 w-full flex justify-center py-2 bg-linear-to-b from-background to-transparent pointer-events-none">
            <div className="flex flex-col items-center gap-1 animate-bounce">
              <span className="text-xs text-muted-foreground font-medium">Scroll to explore</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        )}

        <Timeline position="alternate" sx={{ m: 0, p: 0 }}>
          {timelineItems.map((item, idx) => {
            const isSelected = selected?.id === item.id

            // Show Bitbot only for the exact selected item (not all items in the same lesson group)
            const showBitbot = isSelected

            const parentLessonId = item.isTopic ? item.parentId : item.id
            const lessonProgressData = userProgress.find((p) => p.lessonId === parentLessonId)
            const topicsForLesson = topicsProgress[parentLessonId] ?? []

            const derivedStatusFromTopics = topicsForLesson.length
              ? topicsForLesson.every((topic) => topic.userProgress?.status === 'completed')
                ? 'completed'
                : topicsForLesson.some((topic) => topic.userProgress?.status !== 'not-started')
                  ? 'in-progress'
                  : 'not-started'
              : undefined

            const status = lessonProgressData?.status ?? derivedStatusFromTopics ?? 'not-started'

            let progressPercent = lessonProgressData ? Math.round(lessonProgressData.progress * 100) : 0
            if (!lessonProgressData && topicsForLesson.length) {
              // Calculate progress based on completed topics when lesson summary is absent
              const completedCount = topicsForLesson.filter((topic) => topic.userProgress?.status === 'completed').length
              progressPercent = Math.round((completedCount / topicsForLesson.length) * 100)
            }

            const masteryPercent = lessonProgressData?.masteryScore
              ? Math.round(lessonProgressData.masteryScore * 100)
              : null

            const topicProgressEntry = item.isTopic
              ? topicsForLesson.find((topic: any, index: number) => {
                  if (topic.title === item.title) return true
                  return index === item.idx
                })
              : undefined

            const topicStatus = item.isTopic ? topicProgressEntry?.userProgress?.status ?? 'not-started' : undefined
            const isTopicCompleted = topicStatus === 'completed'
            const isTopicInProgress = topicStatus === 'viewed'
            
            const timelineElementId = item.isTopic
              ? `timeline-item-topic-${item.parentId}-${item.idx}`
              : `timeline-item-lesson-${item.id}`

            return (
              <TimelineItem
                key={item.id}
                id={timelineElementId}
                sx={{ 
                  minHeight: 100, 
                  mb: item.isTopic ? 2 : 4,
                  position: 'relative',
                }}
              >
                {/* Bitbot animation in the center for all selected items */}
                {showBitbot && (
                  <div 
                    className={`absolute left-1/2 -translate-x-1/2 w-20 h-20 z-20 animate-bounce pointer-events-none ${
                      item.isTopic ? '-top-12' : 'top-0 -translate-y-3/4'
                    }`}
                  >
                    <img src={bitbotIdle} alt="Bitbot" className="w-full h-full" />
                  </div>
                )}

                <TimelineOppositeContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    minWidth: item.isTopic ? 100 : 140,
                    color: item.isTopic ? 'text.secondary' : 'inherit',
                    position: 'relative',
                  }}
                >

                  {/* Main lesson label with progress */}
                  {!item.isTopic ? (
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium ${
                            isSelected 
                              ? 'text-primary font-bold' 
                              : 'text-muted-foreground'
                          }`}
                        >
                          Lesson {lessons.findIndex((l) => l.id === item.id) + 1}
                        </span>
                        
                        {/* Status badge */}
                        {user && status === 'completed' && (
                          <Badge variant="default" className="h-5 px-1.5 text-[10px] bg-green-500 hover:bg-green-600">
                            <CheckCircle2 className="w-3 h-3" />
                          </Badge>
                        )}
                        {user && status === 'in-progress' && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                            <Clock className="w-3 h-3" />
                          </Badge>
                        )}
                      </div>
                      
                      {/* Progress indicators */}
                      {user ? (
                        <div className="flex flex-col items-end gap-1">
                          {/* Topic viewing progress */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-muted-foreground w-12 text-right">Topics</span>
                            <div className="w-16 h-1.5 bg-accent rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium w-8">
                              {progressPercent}%
                            </span>
                          </div>
                          
                          {/* Assessment mastery (if taken) */}
                          {masteryPercent !== null && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] text-muted-foreground w-12 text-right">Mastery</span>
                              <div className="w-16 h-1.5 bg-accent rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 ${
                                    masteryPercent >= 70 ? 'bg-green-500' : masteryPercent >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${masteryPercent}%` }}
                                />
                              </div>
                              <span className={`text-[10px] font-medium w-8 ${
                                masteryPercent >= 70 ? 'text-green-600' : masteryPercent >= 40 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {masteryPercent}%
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-md border border-primary/20">
                          <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Navigate to login
                            }}
                            className="text-[10px] text-primary font-medium hover:underline"
                          >
                            Log in to track
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      {isTopicCompleted ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <span className="font-medium text-green-600">Completed</span>
                        </>
                      ) : isTopicInProgress ? (
                        <>
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span className="font-medium text-amber-600">In progress</span>
                        </>
                      ) : (
                        <span>Not started</span>
                      )}
                    </div>
                  )}
                </TimelineOppositeContent>

                <TimelineSeparator
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div className={`relative ${isSelected ? 'scale-110' : ''} transition-transform duration-200`}>
                    <AnimatedAssessmentButton
                      onClick={() => handleItemClick(item)}
                      isSelected={!!isSelected}
                      locked={false}
                      isCompleted={false}
                      className={
                        item.isTopic 
                          ? 'w-8 h-8 opacity-80 hover:opacity-100 transition-opacity' 
                          : 'w-12 h-12 hover:scale-105 transition-transform'
                      }
                    />
                    {/* Ring indicator for selected lesson */}
                    {isSelected && !item.isTopic && (
                      <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse" />
                    )}
                  </div>
                  {idx < timelineItems.length - 1 && (
                    <TimelineConnector 
                      sx={{
                        bgcolor: item.isTopic ? 'grey.300' : 'grey.400',
                        width: item.isTopic ? 1 : 2,
                      }}
                    />
                  )}
                </TimelineSeparator>

                <TimelineContent
                  sx={{
                    cursor: 'pointer',
                    flex: 1,
                    pl: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    opacity: item.isTopic ? 0.8 : 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      opacity: 1,
                      transform: item.isTopic ? 'translateX(4px)' : 'translateX(8px)',
                    },
                    position: 'relative',
                  }}
                  onClick={() => handleItemClick(item)}
                >
                  {/* Lesson group badge for main lessons */}
                  {!item.isTopic && (
                    <div className={`inline-block w-fit px-2 py-0.5 rounded-full text-[10px] font-bold mb-1 ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-accent text-accent-foreground'
                    }`}>
                      MAIN LESSON
                    </div>
                  )}
                  
                  <p
                    className={`text-sm transition-colors ${
                      isSelected
                        ? 'font-bold text-primary'
                        : 'font-normal hover:text-foreground'
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className={`text-xs transition-colors ${
                    isSelected ? 'text-primary/70' : 'text-muted-foreground'
                  }`}>
                    {item.description}
                  </p>

                  {/* Topic count for main lessons */}
               {!item.isTopic && item.topics && item.topics.length > 0 && (
                    <span className="text-[10px] text-muted-foreground mt-1">
                   {item.topics.length} topics
                    </span>
                  )}
                </TimelineContent>
              </TimelineItem>
            )
          })}
        </Timeline>
      </div>
    </div>
  )
}