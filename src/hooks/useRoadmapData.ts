import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAllUserProgress } from '@/hooks/useUserProgress'
import {
  roadmapService,
  type AdaptiveAnalytics,
  type AssessmentStatistics,
  type TopicsProgressMap,
} from '@/services/roadmap.service'

interface TopicMastery {
  topicId: number
  mastery: number
  level: number
  attempts: number
}

interface UseRoadmapDataResult {
  lessonProgress: any[]
  topicsProgress: TopicsProgressMap
  topicMastery: Record<number, TopicMastery[]>
  analytics: AdaptiveAnalytics | null
  statistics: AssessmentStatistics | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useRoadmapData(userId: string | undefined, lessonIds: number[]): UseRoadmapDataResult {
  const { data: lessonProgress = [], isLoading: progressLoading } = useAllUserProgress(!!userId)
  const [topicsProgress, setTopicsProgress] = useState<TopicsProgressMap>({})
  const [topicMastery, setTopicMastery] = useState<Record<number, TopicMastery[]>>({})
  const [analytics, setAnalytics] = useState<AdaptiveAnalytics | null>(null)
  const [statistics, setStatistics] = useState<AssessmentStatistics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lessonKey = useMemo(() => [...lessonIds].sort().join('-'), [lessonIds])

  const loadRoadmapData = useCallback(async () => {
    if (!userId) {
      setTopicsProgress({})
      setTopicMastery({})
      setAnalytics(null)
      setStatistics(null)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [topicsSnapshot, analyticsData, statsData] = await Promise.all([
        roadmapService.getTopicsProgressSnapshot(lessonIds),
        roadmapService.getAdaptiveAnalytics(userId),
        roadmapService.getAssessmentStats(userId),
      ])

      setTopicsProgress(topicsSnapshot)
      setAnalytics(analyticsData)
      setStatistics(statsData)

      if (analyticsData?.skillsByLesson?.length) {
        type LessonSkillSummary = AdaptiveAnalytics['skillsByLesson'][number]
        const masteryMap = (analyticsData.skillsByLesson as LessonSkillSummary[]).reduce(
          (acc: Record<number, TopicMastery[]>, lessonSummary: LessonSkillSummary) => {
            acc[lessonSummary.lessonId] = lessonSummary.skills.map((skill) => ({
              topicId: skill.topicId,
              mastery: skill.mastery,
              level: skill.level,
              attempts: skill.attempts,
            }))
            return acc
          },
          {} as Record<number, TopicMastery[]>
        )
        setTopicMastery(masteryMap)
      } else {
        setTopicMastery({})
      }
    } catch (err) {
      console.error('Failed to load roadmap data', err)
      setError(err instanceof Error ? err.message : 'Failed to load roadmap data')
    } finally {
      setLoading(false)
    }
  }, [lessonKey, lessonIds, userId])

  useEffect(() => {
    loadRoadmapData()
  }, [loadRoadmapData])

  return {
    lessonProgress,
    topicsProgress,
    topicMastery,
    analytics,
    statistics,
    loading: loading || progressLoading,
    error,
    refresh: loadRoadmapData,
  }
}
