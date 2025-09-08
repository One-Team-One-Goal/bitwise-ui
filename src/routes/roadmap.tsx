import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
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
  const [selected, setSelected] = useState<Lesson>(lessons[0])

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

  const handleItemSelection = (item: typeof timelineItems[0]) => {
    if (item.isSublesson) {
      // For sublessons, find the parent lesson
      const parentLesson = lessons.find(lesson => lesson.id === item.parentId)
      if (parentLesson) {
        setSelected(parentLesson)
      }
    } else {
      // For main lessons, set directly
      setSelected(item as Lesson)
    }
  }

  return (
    <div className="m-auto mt-30 flex flex-col md:flex-row w-2/3 min-h-[80vh] gap-4 p-4">
      {/* Left: Lesson Details */}
      <Card className="max-w-md w-full p-6 h-min">
        <CardContent className="p-0 space-y-2">
          <h2 className="text-2xl font-bold">
            {selected.title}
          </h2>
          <p className="text-muted-foreground text-sm">
            {selected.description}
          </p>
          <p className="text-sm text-muted-foreground">{selected.details}</p>
        </CardContent>
      </Card>

      {/* Right: Timeline with sublessons */}
      <div className="flex-1 flex justify-center items-start">
        <Timeline position="alternate" sx={{ m: 0, p: 0 }}>
          {timelineItems.map((item, idx) => (
            <TimelineItem key={item.id} sx={{ minHeight: 100, mb: 4 }}>
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
                  onClick={() => handleItemSelection(item)}
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
                onClick={() => handleItemSelection(item)}
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
