import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import AnimatedAssessmentButton from '@/components/buttons/AnimatedAssessmentButton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import DataAnalyticsCard from '@/components/DataAnalyticsCard'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRoadmapData } from '@/hooks/useRoadmapData'
import { apiService } from '@/services/api.service'
import { 
  Brain, CheckCircle2, Play, Binary, Cpu, Network, Zap, Clock, Target
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import bitbotIdle from '@/assets/bitbot/idle.svg'

import { toast } from 'sonner'

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

interface LessonTopicDisplay {
  id: number
  title: string
  description: string
  status: string
  timeSpent?: number
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

// Inspirational quotes from computer science pioneers
const csQuotes = [
  { text: "The only way to learn a new programming language is by writing programs in it.", author: "Dennis Ritchie" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Logic is the beginning of wisdom, not the end.", author: "Leonard Nimoy" }
]

function RouteComponent() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [loadingAssessment, setLoadingAssessment] = useState(false)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const navigate = useNavigate()
  const { user } = useAuthContext() || { }
  const ALLOW_ANON = import.meta.env.VITE_ALLOW_ANON_ASSESSMENT === 'true'
  const FALLBACK_USER_ID = import.meta.env.VITE_FALLBACK_USER_ID ?? '5ed45890-4804-46fd-bfa1-5695515375ea'
  const effectiveUser = user ?? (ALLOW_ANON ? { id: FALLBACK_USER_ID } : null)

  const lessonIds = useMemo(() => lessons.map((lesson) => lesson.id), [])
  const {
    lessonProgress,
    topicsProgress,
    topicMastery,
    analytics,
    statistics,
    loading: roadmapLoading,
    error: roadmapError,
    refresh: refreshRoadmapData,
  } = useRoadmapData(user?.id, lessonIds)

  // Rotate quotes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % csQuotes.length)
    }, 10000)
    return () => clearInterval(interval)
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
      const result = await apiService.post<{ success: boolean; data: { attemptId: number }; error?: string }>(
        '/assessment/start-adaptive-practice',
        { uid: effectiveUser.id },
        true
      )
      if (result.success) {
        navigate({ to: '/assessment/$assessmentId', params: { assessmentId: result.data.attemptId.toString() } })
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

  const getLessonStatus = (lessonId: number) => {
    const progress = lessonProgress.find((p: any) => p.lessonId === lessonId)
    const isCompleted = progress?.status === 'completed' || (progress?.progress || 0) >= 1
    const isStarted = (progress?.progress || 0) > 0

    // Calculate mastery from adaptive practice for this lesson
    const lessonMastery = topicMastery[lessonId]
    const masteryScore = lessonMastery?.length 
      ? Math.round((lessonMastery.reduce((sum, topic) => sum + topic.mastery, 0) / lessonMastery.length) * 100)
      : progress?.masteryScore ? Math.round(progress.masteryScore * 100) : null

    return { 
      status: isCompleted ? 'completed' : isStarted ? 'in-progress' : 'not-started',
      progress: Math.round((progress?.progress || 0) * 100),
      masteryScore,
      isLocked: false // No locks - all lessons accessible
    }
  }

  const getTopicsForLesson = (lesson: Lesson): LessonTopicDisplay[] => {
    const dynamicTopics = topicsProgress[lesson.id]
    if (dynamicTopics?.length) {
      return dynamicTopics.map((topic: any, index: number) => ({
        id: topic.topicId,
        title: topic.topic?.title || lesson.topics[index]?.title || `Topic ${index + 1}`,
        description: topic.topic?.description || lesson.topics[index]?.description || '',
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

  const getLessonName = (lessonId: number) => lessons.find((lesson) => lesson.id === lessonId)?.title ?? `Lesson ${lessonId}`
  const toTopicIdParam = (value: number | string | undefined | null) => {
    if (value === undefined || value === null) return undefined
    if (typeof value === 'number') return value
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  // Determine current active lesson for BitBot position
  const currentLessonId = useMemo(() => {
    if (selectedLesson) return selectedLesson.id
    
    const firstInProgress = lessons.find(l => {
      const { status } = getLessonStatus(l.id)
      return status === 'in-progress'
    })
    if (firstInProgress) return firstInProgress.id

    const firstNotStarted = lessons.find(l => {
      const { status } = getLessonStatus(l.id)
      return status === 'not-started'
    })
    if (firstNotStarted) return firstNotStarted.id

    // If all completed, stay at last
    return lessons[lessons.length - 1].id
  }, [lessonProgress, selectedLesson])

  const selectedLessonTopics = selectedLesson ? getTopicsForLesson(selectedLesson) : []
  const activeLessonForAnalytics = selectedLesson ?? lessons.find((lesson) => lesson.id === currentLessonId) ?? null
  const recommendedDifficulty = analytics?.recommendedDifficulty ?? null
  const focusTopics = analytics?.focusAreas?.slice(0, 2) ?? []
  const totalAdaptiveAttempts = statistics?.totalAttempts ?? analytics?.totalAttempts ?? 0

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-4 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-6 overflow-hidden">
        
        {/* Header Section */}
        <div className="text-center space-y-2 relative z-10 shrink-0">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Your Learning Journey
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Travel through the world of Boolean Algebra. Master each node to unlock the next.
          </p>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
          
          {/* Left Column: Roadmap Map (Takes 6/12 columns) */}
          <div className="lg:col-span-6 relative w-full h-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar">
            {roadmapLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm pointer-events-none">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-200">Syncing your journey...</span>
              </div>
            )}
            
            {/* Background Decorations */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <Binary className="absolute top-10 left-10 w-24 h-24 text-blue-500 animate-pulse" />
              <Cpu className="absolute bottom-20 right-20 w-32 h-32 text-purple-500 animate-pulse" style={{ animationDelay: '1s' }} />
              <Network className="absolute top-1/2 left-1/3 w-16 h-16 text-green-500 animate-pulse" style={{ animationDelay: '2s' }} />
              <Zap className="absolute top-20 right-1/4 w-12 h-12 text-yellow-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" style={{ backgroundSize: '16px 16px' }} />
            </div>

            {/* The Path (Visual Only) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ strokeLinecap: 'round' }}>
              {/* Animated Path Effect */}
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              
              {/* This is a simplified path for the 2x2 grid layout on desktop */}
              <path 
                d="M 20% 30% C 50% 30%, 50% 30%, 80% 30% C 80% 60%, 80% 60%, 80% 70% C 50% 70%, 50% 70%, 20% 70%" 
                className="stroke-gray-200 dark:stroke-gray-800 stroke-8 fill-none hidden md:block"
              />
              {/* Animated Overlay Path */}
              <motion.path 
                d="M 20% 30% C 50% 30%, 50% 30%, 80% 30% C 80% 60%, 80% 60%, 80% 70% C 50% 70%, 50% 70%, 20% 70%" 
                className="stroke-blue-400/50 stroke-4 fill-none hidden md:block"
                initial={{ pathLength: 0, strokeDasharray: "10 10" }}
                animate={{ pathLength: 1, strokeDashoffset: -20 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />

              {/* Mobile Path (Vertical) */}
              <path 
                d="M 50% 10% L 50% 90%" 
                className="stroke-gray-200 dark:stroke-gray-800 stroke-4 fill-none md:hidden"
              />
            </svg>

            {/* Map Nodes Grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-8 h-full place-items-center">
              {lessons.map((lesson, index) => {
                const { status, progress: lessonProgressPercent, masteryScore } = getLessonStatus(lesson.id)
                const isActive = currentLessonId === lesson.id
                const lessonTopics = getTopicsForLesson(lesson)
                
                // Positioning logic for the "winding" feel on desktop
                // Index 0: Top Left, Index 1: Top Right
                // Index 2: Bottom Right, Index 3: Bottom Left
                const orderClass = 
                  index === 0 ? 'md:order-1 md:justify-self-start md:ml-20' :
                  index === 1 ? 'md:order-2 md:justify-self-end md:mr-20' :
                  index === 2 ? 'md:order-4 md:justify-self-end md:mr-20' :
                  'md:order-3 md:justify-self-start md:ml-20'

                return (
                  <div key={lesson.id} className={`relative ${orderClass} flex flex-col items-center gap-3`}>
                    {/* BitBot Avatar - Now Floating */}
                    {isActive && (
                      <motion.div
                        layoutId="bitbot-avatar"
                        className="absolute -top-24 left-1/2 -translate-x-1/2 z-20 w-20 h-20 pointer-events-none"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ 
                          layout: { type: "spring", stiffness: 300, damping: 30 },
                          y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                      >
                        <img src={bitbotIdle} alt="BitBot" className="w-full h-full drop-shadow-2xl filter brightness-110" />
                      </motion.div>
                    )}

                    {/* Node Button */}
                    <motion.button
                      onClick={() => setSelectedLesson(lesson)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-lg border-4 transition-all duration-300 relative group ${
                        status === 'completed'
                          ? 'bg-green-100 border-green-500 text-green-600 dark:bg-green-900/50 dark:border-green-500'
                          : status === 'in-progress'
                            ? 'bg-blue-100 border-blue-500 text-blue-600 dark:bg-blue-900/50 dark:border-blue-500'
                            : 'bg-white border-gray-300 text-gray-600 dark:bg-gray-800 dark:border-gray-600'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-8 h-8" />
                      ) : (
                        <span className="text-2xl md:text-3xl font-bold">{lesson.id}</span>
                      )}
                      
                      {/* Pulse effect for active node */}
                      {status !== 'completed' && (
                        <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20" />
                      )}

                      {/* Tooltip-like Label */}
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-md border border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                        {lesson.title}
                      </div>
                    </motion.button>

                    {/* Progress Indicators - Below Node */}
                    {user && (
                      <div className="w-32 space-y-2 mt-2">
                        {/* Status Badge */}
                        <div className="flex items-center justify-center gap-1.5">
                          <Badge variant={status === 'completed' ? 'default' : 'secondary'} className="text-xs px-2 py-0.5 h-5">
                            {status === 'completed' ? (
                              <><CheckCircle2 className="w-3 h-3 mr-1" />Done</>
                            ) : status === 'in-progress' ? (
                              <><Clock className="w-3 h-3 mr-1" />Active</>
                            ) : (
                              'Start'
                            )}
                          </Badge>
                        </div>

                        {/* Topics Progress */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400 text-[10px]">Topics</span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400 text-[10px]">{lessonProgressPercent}%</span>
                          </div>
                          <Progress value={lessonProgressPercent} className="h-1.5" />
                        </div>

                        {/* Mastery Score (if available from assessments) */}
                        {masteryScore !== null && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400 text-[10px] flex items-center gap-0.5">
                                <Target className="w-2.5 h-2.5" />
                                Mastery
                              </span>
                              <span className={`font-semibold text-[10px] ${
                                masteryScore >= 80 ? 'text-green-600 dark:text-green-400' :
                                masteryScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                              }`}>{masteryScore}%</span>
                            </div>
                            <Progress 
                              value={masteryScore} 
                              className={`h-1.5 ${
                                masteryScore >= 80 ? '[&>div]:bg-green-500' :
                                masteryScore >= 60 ? '[&>div]:bg-yellow-500' :
                                '[&>div]:bg-red-500'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Login prompt for non-logged users */}
                    {!user && (
                      <div className="w-32 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate({ to: '/login' })
                          }}
                          className="w-full text-[10px] px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-md border border-primary/20 transition-colors"
                        >
                          Log in to track
                        </button>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 max-w-xs">
                      {lessonTopics.map((topic) => {
                        const mastery = topicMastery[lesson.id]?.find((m) => m.topicId === topic.id)
                        const masteryPercent = mastery ? Math.round(mastery.mastery * 100) : null
                        const statusStyles = topic.status === 'completed'
                          ? 'border-green-400/60 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30'
                          : topic.status === 'viewed'
                            ? 'border-blue-400/60 text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-300/60 text-gray-600 dark:text-gray-300 bg-white/30 dark:bg-gray-800/40'

                        return (
                          <Link
                            key={`${lesson.id}-${topic.id}`}
                            to="/lesson/$lessonId"
                            params={{ lessonId: lesson.id.toString() }}
                            search={{ topicId: toTopicIdParam(topic.id) }}
                            className={`text-[10px] md:text-[11px] px-3 py-1 rounded-full border backdrop-blur-sm transition-transform hover:scale-105 inline-flex items-center gap-1 ${statusStyles}`}
                          >
                            <span>{topic.title}</span>
                            <span className="font-semibold text-[10px]">
                              {masteryPercent !== null ? `${masteryPercent}%` : '—'}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Sidebar (Takes 6/12 columns) */}
          <div className="lg:col-span-6 space-y-4 h-full overflow-y-auto custom-scrollbar pr-2 flex flex-col">
            
            {/* Adaptive Practice - Enhanced with animations */}
            <motion.div 
              className="relative py-8 px-6 rounded-2xl bg-linear-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-800/50 overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {/* Animated background particles */}
              <div className="absolute inset-0 opacity-20">
                <motion.div
                  className="absolute top-4 left-4 w-2 h-2 bg-purple-500 rounded-full"
                  animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute top-8 right-8 w-3 h-3 bg-blue-500 rounded-full"
                  animate={{ y: [0, -30, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                />
                <motion.div
                  className="absolute bottom-6 left-12 w-2 h-2 bg-indigo-500 rounded-full"
                  animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      Adaptive AI Practice
                    </h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                      Test your current skills with intelligent questions that adapt to your level!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-purple-500 rounded-full"
                  />
                  <span className="font-medium">AI adapts to your performance in real-time</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl bg-white/70 dark:bg-white/5 border border-purple-100/60 dark:border-purple-800/40 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-purple-500">Recommended</p>
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 capitalize">
                      {recommendedDifficulty ?? 'calibrating'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 dark:bg-white/5 border border-purple-100/60 dark:border-purple-800/40 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-purple-500">Adaptive attempts</p>
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                      {totalAdaptiveAttempts}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 dark:bg-white/5 border border-purple-100/60 dark:border-purple-800/40 p-3 hidden sm:block">
                    <p className="text-[10px] uppercase tracking-wide text-purple-500">Focus topics</p>
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                      {focusTopics.length > 0 ? focusTopics.length : 'All clear'}
                    </p>
                  </div>
                </div>

                {focusTopics.length > 0 && (
                  <div className="rounded-xl border border-purple-200/60 dark:border-purple-800/40 bg-white/60 dark:bg-white/5 p-3 text-xs text-purple-800 dark:text-purple-200">
                    <p className="font-semibold mb-1">Next best focus:</p>
                    <ul className="list-disc ml-4 space-y-0.5">
                      {focusTopics.map((topic) => (
                        <li key={topic.topicId}>
                          {getLessonName(topic.lessonId)} — {topic.topicTitle}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full"
                >
                  <AnimatedAssessmentButton 
                    onClick={handleStartAdaptiveAssessment}
                    loading={loadingAssessment}
                    disabled={loadingAssessment}
                    className="w-full shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Analytics & Stats - Full Width */}
            <div className="w-full">
              <DataAnalyticsCard
                user={user}
                lesson={activeLessonForAnalytics}
                analytics={analytics}
                statistics={statistics}
                loading={roadmapLoading}
                errorMessage={roadmapError}
                onRefresh={refreshRoadmapData}
              />
            </div>

            {/* Inspirational Quotes - Rotating */}
            <motion.div 
              className="relative mt-auto min-h-[140px]"
              key={currentQuoteIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
               <div className="absolute -top-6 -right-4 z-10">
                  <motion.div
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <img src={bitbotIdle} className="w-16 h-16 drop-shadow-lg" alt="BitBot" />
                  </motion.div>
               </div>
               <Card className="bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/70 dark:border-amber-800 shadow-lg shadow-amber-200/40 h-full overflow-hidden">
                  <CardContent className="p-4 pt-8 h-full flex flex-col justify-center relative">
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-orange-200/40 to-transparent pointer-events-none" />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="relative"
                    >
                      <p className="text-[11px] uppercase tracking-[0.2em] text-amber-500 font-semibold mb-2">
                        BitBot's travel tip
                      </p>
                      <blockquote className="text-sm text-gray-800 dark:text-gray-100 italic leading-relaxed">
                        “{csQuotes[currentQuoteIndex].text}”
                      </blockquote>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold text-right mt-3">
                        — {csQuotes[currentQuoteIndex].author}
                      </p>
                    </motion.div>
                  </CardContent>
               </Card>
            </motion.div>

          </div>
        </div>

        {/* Lesson Details Dialog */}
        <Dialog open={!!selectedLesson} onOpenChange={(open: boolean) => !open && setSelectedLesson(null)}>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Badge variant="outline">Lesson {selectedLesson?.id}</Badge>
                {selectedLesson?.title}
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                {selectedLesson?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                {selectedLesson?.details}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Topics & Progress</h4>
                <div className="grid gap-3">
                  {selectedLessonTopics.map((topic) => {
                     const topicStatus = topicsProgress[selectedLesson?.id || 0]?.find((t: any) => t.topicId === topic.id)
                     const mastery = topicMastery[selectedLesson?.id || 0]?.find((m: any) => m.topicId === topic.id)
                     const isTopicCompleted = (topic.status === 'completed') || topicStatus?.status === 'completed'
                     const isTopicViewed = isTopicCompleted || topic.status === 'viewed' || topicStatus?.status === 'viewed'
                     const timeSpent = topic.timeSpent ? Math.round(topic.timeSpent / 60) : topicStatus?.timeSpent ? Math.round(topicStatus.timeSpent / 60) : 0
                     const masteryPercent = mastery ? Math.round(mastery.mastery * 100) : 0
                     const hasPracticed = mastery && (mastery.attempts > 0 || mastery.mastery > 0)

                     const getMasteryColor = (percent: number) => {
                       if (percent >= 80) return 'text-green-600 dark:text-green-400'
                       if (percent >= 60) return 'text-yellow-600 dark:text-yellow-400'
                       return 'text-red-600 dark:text-red-400'
                     }

                     return (
                      <Link
                        to="/lesson/$lessonId"
                        params={{ lessonId: selectedLesson ? selectedLesson.id.toString() : '1' }}
                        search={{ topicId: toTopicIdParam(topic.id) }}
                        key={`${selectedLesson?.id}-${topic.id}`}
                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50/60 dark:hover:bg-blue-900/10 transition-colors block"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            {isTopicCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            ) : isTopicViewed ? (
                              <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{topic.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{topic.description}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {isTopicViewed && (
                              <>
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                  {isTopicCompleted ? 'Completed' : 'In Progress'}
                                </p>
                                {timeSpent > 0 && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{timeSpent} min</p>
                                )}
                              </>
                            )}
                            <div className="mt-1">
                              <p className={`text-xs font-bold ${getMasteryColor(masteryPercent)}`}>
                                {masteryPercent}% Mastery
                              </p>
                              {!hasPracticed && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 italic">Not Practiced</p>
                              )}
                              {mastery && mastery.level > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">Level {Math.round(mastery.level * 100) / 100}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                     )
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-950 py-2 border-t border-gray-100 dark:border-gray-800">
              <Button variant="outline" onClick={() => setSelectedLesson(null)}>Close</Button>
              <Button 
                onClick={() => {
                  if (!selectedLesson) return

                  if (!user) {
                    navigate({ to: '/login' })
                    return
                  }

                  navigate({ 
                    to: '/lesson/$lessonId', 
                    params: { lessonId: selectedLesson.id.toString() },
                    search: { topicId: parseInt(selectedLesson.topics[0].id.split('-')[1]) }
                  })
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Lesson
              </Button>
            </div>
            
            {/* BitBot in Modal */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl flex items-start gap-4 border border-blue-100 dark:border-blue-800/30">
              <img src={bitbotIdle} alt="BitBot" className="w-12 h-12 shrink-0" />
              <div>
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">BitBot says:</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {!user 
                    ? "Please log in to start your journey! I'll be waiting right here."
                    : "Ready to dive in? This lesson will boost your logic skills!"}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
