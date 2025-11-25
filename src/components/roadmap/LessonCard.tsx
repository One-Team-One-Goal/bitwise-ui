import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Lesson, LessonStatus } from './types'

interface LessonCardProps {
  lesson: Lesson
  lessonStatus: LessonStatus
  lessonImage: string
  onSelect: (lesson: Lesson) => void
}

export function LessonCard({
  lesson,
  lessonStatus,
  lessonImage,
  onSelect,
}: LessonCardProps) {
  const { status, progress } = lessonStatus

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
      {/* Card Header / Image */}
      <div
        className={`h-32 w-full relative overflow-hidden ${
          status === 'completed'
            ? 'bg-green-100 dark:bg-green-900/20'
            : status === 'in-progress'
              ? 'bg-blue-100 dark:bg-blue-900/20'
              : 'bg-gray-100 dark:bg-gray-800'
        }`}
      >
        <img
          src={lessonImage}
          alt={lesson.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/6 dark:bg-black/20" />
        <div className="absolute top-3 right-3">
          <Badge
            variant="secondary"
            className="bg-white/90 dark:bg-black/50 backdrop-blur-sm"
          >
            {lesson.topics.length} Topics
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Lesson {lesson.id}
          </span>
          {status === 'in-progress' && (
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          )}
        </div>

        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
          {lesson.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
          {lesson.description}
        </p>

        {/* Progress */}
        <div className="space-y-3 mt-auto">
          <div className="flex justify-between text-xs font-medium">
            <span
              className={
                status === 'completed'
                  ? 'text-green-600'
                  : status === 'in-progress'
                    ? 'text-blue-600'
                    : 'text-gray-500'
              }
            >
              {status === 'not-started'
                ? 'Not Started'
                : `${progress}% Complete`}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />

          <Button
            onClick={() => onSelect(lesson)}
            variant={status === 'completed' ? 'outline' : 'default'}
            className="w-full mt-2"
          >
            {status === 'completed'
              ? 'Review'
              : status === 'in-progress'
                ? 'Continue'
                : 'Start'}
          </Button>
        </div>
      </div>
    </div>
  )
}
