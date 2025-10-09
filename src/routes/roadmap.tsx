import { useState } from 'react'
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
import DataAnalyticsCard from '@/components/DataAnalyticsCard'
import { useAuthContext } from '@/contexts/AuthContext'
import { Loader2, Brain, Target, AlertCircle } from 'lucide-react'

// Define types for better TypeScript support
interface Sublesson {
  id: string
  title: string
  description: string
}

interface Lesson {
  id: number
  title: string
  description: string
  details: string
  sublessons: Sublesson[]
}

// Lessons with sublessons
const lessons: Lesson[] = [
  {
    id: 1,
    title: 'Intro to Boolean Algebra',
    description: 'Basics, history, and importance in logic.',
    details:
      "Boolean Algebra deals with true/false values. It's key in computer science and circuit design.",
    sublessons: [
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
    sublessons: [
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
    sublessons: [
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
    sublessons: [
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
  const [selected, setSelected] = useState(lessons[0])
  const [loadingAssessment, setLoadingAssessment] = useState(false)
  const [assessmentError, setAssessmentError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [hovered, setHovered] = useState<typeof timelineItems[0] | null>(null)

  // Flatten lessons and sublessons for the timeline
  const timelineItems = lessons.flatMap((lesson) => [
    { ...lesson, isSublesson: false as const },
    ...(lesson.sublessons || []).map((sub, i) => ({
      ...sub,
      parentId: lesson.id,
      isSublesson: true as const,
      parentTitle: lesson.title,
      parentIdx: lesson.id,
      idx: i,
      details: `Details for ${sub.title}`, // Add missing details
      sublessons: [] as Sublesson[], // Add missing sublessons
    })),
  ])

  // Handle click: if lesson, go to /lesson/{id}
  // If sublesson, go to parent lesson
  const handleItemClick = (item: any) => {
    if (!item.isSublesson) {
      navigate({ to: `/lesson/${item.id}` })
    } else {
      navigate({ to: `/lesson/${item.parentId}` })
    }
    setSelected(item)
  }

  // Handle adaptive assessment start
  const handleStartAdaptiveAssessment = async () => {
    if (!user) return

    setLoadingAssessment(true)
    setAssessmentError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/assessment/start-adaptive-practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.id }),
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
  const handleStartRegularAssessment = async () => {
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
  }

  const displayItem = hovered || selected

  return (
    <div className="m-auto mt-12 flex flex-col md:flex-row w-2/3 min-h-[80vh] gap-4 p-4">
      {/* Left: Lesson Details */}
      <div className='flex flex-col gap-4 mr-4 flex-shrink-0'>
        {/* Lesson Details Card */}
        <Card className="max-w-md w-full p-6 h-min">
          <CardContent className="p-0 space-y-2">
            <h2 className="text-2xl font-bold">
              {displayItem.title}
            </h2>
            <p className="text-muted-foreground text-sm">
              {displayItem.description}
            </p>
            <p className="text-sm text-muted-foreground">{displayItem.details}</p>
          </CardContent>
        </Card>

        
        {/* Data Analytics Card */}
        <DataAnalyticsCard lesson={displayItem} user={user} />

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

            {!user && (
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

      {/* Right: Timeline with sublessons (scrollable only) */}
      <div
        className="hide-scrollbar flex-1 flex justify-center items-start overflow-y-auto"
        style={{ maxHeight: '80vh', minHeight: '400px' }}
      >
        <Timeline position="alternate" sx={{ m: 0, p: 0 }}>
          {timelineItems.map((item, idx) => (
            <TimelineItem
              key={item.id}
              sx={{ minHeight: 100, mb: 4 }}
              onMouseEnter={() => setHovered(item)}
              onMouseLeave={() => setHovered(null)}
            >
              <TimelineOppositeContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minWidth: item.isSublesson ? 80 : 120,
                  color: item.isSublesson ? 'text.secondary' : 'inherit',
                }}
              >
                <span
                  className={`text-xs ${item.isSublesson ? 'text-gray-400' : 'text-muted-foreground'}`}
                >
                  {item.isSublesson
                    ? `${item.title}`
                    : `Lesson ${lessons.findIndex((l) => l.id === item.id) + 1}`}
                </span>
              </TimelineOppositeContent>
              <TimelineSeparator
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AnimatedAssessmentButton
                  onClick={() => handleItemClick(item)}
                  isSelected={
                    selected.id === item.id ||
                    (item.isSublesson && selected.title === item.parentTitle)
                  }
                  locked={false}
                  isCompleted={false}
                  className={
                    item.isSublesson ? 'w-8 h-8 opacity-80' : 'w-12 h-12'
                  }
                />
                {idx < timelineItems.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent
                sx={{
                  cursor: 'pointer',
                  flex: 1,
                  pl: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  opacity: item.isSublesson ? 0.8 : 1,
                }}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setHovered(item)}
                onMouseLeave={() => setHovered(null)}
              >
                <p
                  className={`text-sm ${
                    selected.id === item.id ||
                    (item.isSublesson && selected.title === item.parentTitle)
                      ? 'font-semibold'
                      : 'font-normal'
                  }`}
                >
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    </div>
  )
}