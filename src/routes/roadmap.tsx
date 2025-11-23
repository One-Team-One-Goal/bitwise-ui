import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import AnimatedAssessmentButton from '@/components/buttons/AnimatedAssessmentButton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DataAnalyticsCard from '@/components/DataAnalyticsCard'
import { useAuthContext } from '@/contexts/AuthContext'
import { useAllUserProgress } from '@/hooks/useUserProgress'
import { userProgressService } from '@/services/user-progress.service'
import { 
  Brain, CheckCircle2, Lock, Play, Binary, Cpu, Network, Zap
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
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [loadingAssessment, setLoadingAssessment] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthContext() || { }
  const ALLOW_ANON = import.meta.env.VITE_ALLOW_ANON_ASSESSMENT === 'true'
  const FALLBACK_USER_ID = import.meta.env.VITE_FALLBACK_USER_ID ?? '5ed45890-4804-46fd-bfa1-5695515375ea'
  const effectiveUser = user ?? (ALLOW_ANON ? { id: FALLBACK_USER_ID } : null)

  // Fetch user progress
  const { data: userProgress = [] } = useAllUserProgress(!!user)
  const [topicsProgress, setTopicsProgress] = useState<Record<number, any[]>>({})

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (!userProgress.length) return 0
    const totalProgress = userProgress.reduce((acc, curr) => acc + (curr.progress || 0), 0)
    return Math.round((totalProgress / lessons.length) * 100)
  }, [userProgress])

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
        if (!cancelled) console.error('Failed to load topic progress data', error)
      }
    }
    fetchAllLessonTopics()
    return () => { cancelled = true }
  }, [user])

  const handleStartAdaptiveAssessment = async () => {
    if (!effectiveUser) {
      toast.error('Please log in to start an assessment')
      return
    }
    setLoadingAssessment(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/assessment/start-adaptive-practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: effectiveUser.id }),
      })
      const result = await response.json()
      if (result.success) {
        navigate({ to: '/assessment/$assessmentId', params: { assessmentId: result.data.attemptId.toString() } })
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
    const progress = userProgress.find(p => p.lessonId === lessonId)
    const isCompleted = progress?.status === 'completed' || (progress?.progress || 0) >= 1
    const isStarted = (progress?.progress || 0) > 0
    
    // Check if previous lesson is completed (for locking)
    const prevLesson = lessons.find(l => l.id === lessonId - 1)
    const prevProgress = prevLesson ? userProgress.find(p => p.lessonId === prevLesson.id) : null
    const isLocked = prevLesson && (!prevProgress || (prevProgress.progress || 0) < 0.8) // Lock if prev < 80%

    return { 
      status: isCompleted ? 'completed' : isStarted ? 'in-progress' : 'not-started',
      progress: Math.round((progress?.progress || 0) * 100),
      isLocked // Enable locking to enforce progression
    }
  }

  // Determine current active lesson for BitBot position
  const currentLessonId = useMemo(() => {
    const firstInProgress = lessons.find(l => {
      const { status } = getLessonStatus(l.id)
      return status === 'in-progress'
    })
    if (firstInProgress) return firstInProgress.id

    const firstNotStarted = lessons.find(l => {
      const { status, isLocked } = getLessonStatus(l.id)
      return status === 'not-started' && !isLocked
    })
    if (firstNotStarted) return firstNotStarted.id

    // If all completed, stay at last
    return lessons[lessons.length - 1].id
  }, [userProgress])

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
          
          {/* Left Column: Roadmap Map (Takes 8/12 columns) */}
          <div className="lg:col-span-8 relative w-full h-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-y-auto overflow-x-hidden p-8 md:p-12 custom-scrollbar">
            
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
                const { status, isLocked } = getLessonStatus(lesson.id)
                const isActive = currentLessonId === lesson.id
                
                // Positioning logic for the "winding" feel on desktop
                // Index 0: Top Left, Index 1: Top Right
                // Index 2: Bottom Right, Index 3: Bottom Left
                // This matches the SVG path above
                const orderClass = 
                  index === 0 ? 'md:order-1 md:justify-self-start md:ml-20' :
                  index === 1 ? 'md:order-2 md:justify-self-end md:mr-20' :
                  index === 2 ? 'md:order-4 md:justify-self-end md:mr-20' :
                  'md:order-3 md:justify-self-start md:ml-20'

                return (
                  <div key={lesson.id} className={`relative ${orderClass}`}>
                    {/* BitBot Avatar - Now Floating */}
                    {isActive && (
                      <motion.div
                        layoutId="bitbot-avatar"
                        className="absolute -top-20 left-1/2 -translate-x-1/2 z-20 w-24 h-24 pointer-events-none"
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
                      onClick={() => !isLocked && setSelectedLesson(lesson)}
                      whileHover={!isLocked ? { scale: 1.1 } : {}}
                      whileTap={!isLocked ? { scale: 0.95 } : {}}
                      className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-lg border-4 transition-all duration-300 relative group ${
                        isLocked 
                          ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700'
                          : status === 'completed'
                            ? 'bg-green-100 border-green-500 text-green-600 dark:bg-green-900/50 dark:border-green-500'
                            : 'bg-white border-blue-500 text-blue-600 dark:bg-gray-800 dark:border-blue-500'
                      }`}
                    >
                      {isLocked ? (
                        <Lock className="w-8 h-8" />
                      ) : status === 'completed' ? (
                        <CheckCircle2 className="w-10 h-10" />
                      ) : (
                        <span className="text-3xl font-bold">{lesson.id}</span>
                      )}
                      
                      {/* Pulse effect for active node */}
                      {!isLocked && status !== 'completed' && (
                        <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20" />
                      )}

                      {/* Tooltip-like Label */}
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-md border border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                        {lesson.title}
                      </div>
                    </motion.button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Sidebar (Takes 4/12 columns) */}
          <div className="lg:col-span-4 space-y-6 h-full overflow-y-auto custom-scrollbar pr-2">
            
            {/* Adaptive Practice - Highlighted */}
            <Card className="bg-linear-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl shadow-blue-500/20 overflow-hidden relative ring-2 ring-blue-400/50 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Brain className="w-32 h-32 animate-pulse" />
              </div>
              <CardContent className="p-6 relative z-10">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  Adaptive Practice
                </h3>
                <p className="text-blue-100 mb-6 text-sm">
                  Ready for a challenge? Test your skills with AI-generated questions!
                </p>
                <AnimatedAssessmentButton 
                  onClick={handleStartAdaptiveAssessment}
                  loading={loadingAssessment}
                  disabled={loadingAssessment}
                  className="w-full bg-white text-blue-600 hover:bg-blue-50 border-none shadow-lg"
                />
              </CardContent>
            </Card>

            {/* Analytics & Stats - Always Visible or Conditional */}
            <DataAnalyticsCard user={user} lesson={null} />

            {/* BitBot Guide - Floating Overlay Style */}
            <div className="relative">
               <div className="absolute -top-6 -right-4 z-10">
                  <motion.div
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <img src={bitbotIdle} className="w-16 h-16 drop-shadow-lg" alt="BitBot" />
                  </motion.div>
               </div>
               <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                  <CardContent className="p-4 pt-8">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      {overallProgress === 0 
                        ? "Welcome! I'm BitBot. Start with Lesson 1 to begin your journey into digital logic!" 
                        : "Great progress! Keep going, you're doing amazing!"}
                    </p>
                  </CardContent>
               </Card>
            </div>

          </div>
        </div>

        {/* Lesson Details Dialog */}
        <Dialog open={!!selectedLesson} onOpenChange={(open) => !open && setSelectedLesson(null)}>
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
                <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Topics</h4>
                <div className="grid gap-2">
                  {selectedLesson?.topics.map((topic) => {
                     const topicStatus = topicsProgress[selectedLesson.id]?.find((t: any) => t.topicId === parseInt(topic.id.split('-')[1]))
                     const isTopicCompleted = topicStatus?.status === 'completed'
                     return (
                      <div key={topic.id} className="flex items-center gap-3 p-2 rounded-md bg-gray-50 dark:bg-gray-800/50">
                        {isTopicCompleted ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                        <span className="text-sm">{topic.title}</span>
                      </div>
                     )
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-950 py-2 border-t border-gray-100 dark:border-gray-800">
              <Button variant="outline" onClick={() => setSelectedLesson(null)}>Close</Button>
              <Button 
                onClick={() => {
                  if (selectedLesson) {
                    navigate({ 
                      to: '/lesson/$lessonId', 
                      params: { lessonId: selectedLesson.id.toString() },
                      search: { topicId: parseInt(selectedLesson.topics[0].id.split('-')[1]) }
                    })
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Lesson <Play className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
