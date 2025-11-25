import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Target } from 'lucide-react'

interface FocusTopic {
  topicTitle: string
}

interface AnalyticsCardProps {
  totalAttempts: number
  focusTopics: FocusTopic[]
  overallMastery: number | null
}

export function AnalyticsCard({
  totalAttempts,
  focusTopics,
  overallMastery,
}: AnalyticsCardProps) {
  const masteryPercent = overallMastery ? Math.round(overallMastery * 100) : 0

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Badge
            variant="outline"
            className="mb-2 border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-400"
          >
            <Target className="w-3 h-3 mr-1" /> Insights
          </Badge>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Progress & Analytics
          </h2>
        </div>
        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-md">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Attempts
          </p>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {totalAttempts}
          </p>
        </div>
        <div className="rounded-md">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Focus Areas
          </p>
          <p className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">
            {focusTopics.length > 0 ? focusTopics[0].topicTitle : 'General'}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">
            Overall Mastery
          </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {masteryPercent}%
          </span>
        </div>
        <Progress value={masteryPercent} className="h-2" />
      </div>
    </div>
  )
}
