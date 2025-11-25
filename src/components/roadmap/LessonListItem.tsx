import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Lesson, LessonStatus } from './types'

interface LessonListItemProps {
  lesson: Lesson
  lessonStatus: LessonStatus
  lessonImage: string
  onSelect: (lesson: Lesson) => void
}

export function LessonListItem({
  lesson,
  lessonStatus,
  lessonImage,
  onSelect,
}: LessonListItemProps) {
  const { status, progress } = lessonStatus

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md hover:border-gray-300 dark:hover:border-gray-700 transition-colors group">
      <div className="p-4 flex items-center gap-4">
        {/* Status Icon */}
        <div className="shrink-0 relative">
          <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <img
              src={lessonImage}
              alt={lesson.title}
              className="w-full h-full object-cover"
            />
          </div>
          {status === 'in-progress' && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          )}
        </div>

        {/* Lesson Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Lesson {lesson.id}
            </span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {lesson.topics.length} Topics
            </span>
          </div>
          <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 mb-1">
            {lesson.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
            {lesson.description}
          </p>
        </div>

        {/* Progress Section */}
        <div className="shrink-0 w-32">
          <div className="text-right mb-2">
            <span
              className={`text-xs font-medium ${
                status === 'completed'
                  ? 'text-green-600 dark:text-green-400'
                  : status === 'in-progress'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {status === 'not-started' ? 'Not Started' : `${progress}%`}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          <Button
            onClick={() => onSelect(lesson)}
            variant={status === 'completed' ? 'outline' : 'default'}
            size="sm"
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
