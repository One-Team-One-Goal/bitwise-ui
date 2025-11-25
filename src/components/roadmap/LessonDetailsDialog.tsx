import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, Play } from 'lucide-react'
import bitbotIdle from '@/assets/bitbot/idle.svg'
import type { Lesson, LessonTopicDisplay, TopicProgress, TopicMastery } from './types'

interface LessonDetailsDialogProps {
  selectedLesson: Lesson | null
  topics: LessonTopicDisplay[]
  topicsProgress: Record<number, TopicProgress[]>
  topicMastery: Record<number, TopicMastery[]>
  isLoggedIn: boolean
  onClose: () => void
  onStartLesson: () => void
}

function toTopicIdParam(value: number | string | undefined | null) {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function getMasteryColor(percent: number) {
  if (percent >= 80) return 'text-green-600 dark:text-green-400'
  if (percent >= 60) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

export function LessonDetailsDialog({
  selectedLesson,
  topics,
  topicsProgress,
  topicMastery,
  isLoggedIn,
  onClose,
  onStartLesson,
}: LessonDetailsDialogProps) {
  return (
    <Dialog open={!!selectedLesson} onOpenChange={(open) => !open && onClose()}>
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
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md text-sm text-blue-800 dark:text-blue-200">
            {selectedLesson?.details}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
              Topics & Progress
            </h4>
            <div className="grid gap-3">
              {topics.map((topic) => {
                const topicStatus = topicsProgress[selectedLesson?.id || 0]?.find(
                  (t) => t.topicId === topic.id
                )
                const mastery = topicMastery[selectedLesson?.id || 0]?.find(
                  (m) => m.topicId === topic.id
                )
                const isTopicCompleted =
                  topic.status === 'completed' ||
                  topicStatus?.status === 'completed'
                const isTopicViewed =
                  isTopicCompleted ||
                  topic.status === 'viewed' ||
                  topicStatus?.status === 'viewed'
                const timeSpent = topic.timeSpent
                  ? Math.round(topic.timeSpent / 60)
                  : topicStatus?.timeSpent
                    ? Math.round(topicStatus.timeSpent / 60)
                    : 0
                const masteryPercent = mastery
                  ? Math.round(mastery.mastery * 100)
                  : 0
                const hasPracticed =
                  mastery && (mastery.attempts > 0 || mastery.mastery > 0)

                return (
                  <Link
                    to="/lesson/$lessonId"
                    params={{
                      lessonId: selectedLesson
                        ? selectedLesson.id.toString()
                        : '1',
                    }}
                    search={{ topicId: toTopicIdParam(topic.id) }}
                    key={`${selectedLesson?.id}-${topic.id}`}
                    className="p-3 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50/60 dark:hover:bg-blue-900/10 transition-colors block"
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
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {topic.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {topic.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {isTopicViewed && (
                          <>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {isTopicCompleted ? 'Completed' : 'In Progress'}
                            </p>
                            {timeSpent > 0 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {timeSpent} min
                              </p>
                            )}
                          </>
                        )}
                        <div className="mt-1">
                          <p
                            className={`text-xs font-bold ${getMasteryColor(masteryPercent)}`}
                          >
                            {masteryPercent}% Mastery
                          </p>
                          {!hasPracticed && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                              Not Practiced
                            </p>
                          )}
                          {mastery && mastery.level > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Level {Math.round(mastery.level * 100) / 100}
                            </p>
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
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={onStartLesson}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Lesson
          </Button>
        </div>

        {/* BitBot in Modal */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg flex items-start gap-4 border border-blue-100 dark:border-blue-800/30">
          <img src={bitbotIdle} alt="BitBot" className="w-12 h-12 shrink-0" />
          <div>
            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
              BitBot says:
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              {!isLoggedIn
                ? "Please log in to start your journey! I'll be waiting right here."
                : 'Ready to dive in? This lesson will boost your logic skills!'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
