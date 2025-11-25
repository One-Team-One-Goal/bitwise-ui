import { apiService } from './api.service'
import { userProgressService } from './user-progress.service'

export interface AdaptiveAnalytics {
  overallMastery: number
  recommendedDifficulty: string
  skillsByLesson: Array<{
    lessonId: number
    lessonTitle: string
    skills: Array<{
      topicId: number
      topicTitle: string
      mastery: number
      level: number
      attempts: number
      correct: number
      accuracy: number
    }>
  }>
  focusAreas: Array<{
    topicId: number
    topicTitle: string
    lessonId: number
    mastery: number
    level: number
  }>
  reinforcementNeeded: Array<{
    topicId: number
    topicTitle: string
    level: number
  }>
  totalAttempts: number
  totalCorrect: number
}

export interface AssessmentStatistics {
  totalAttempts: number
  averageScore: number
  bestScore: number
  overallMastery: number
  skillBreakdown: Array<{
    topicTitle: string
    lessonTitle: string
    mastery: number
    level: number
    attempts: number
    correct: number
  }>
}

export type TopicsProgressMap = Record<number, any[]>

async function getTopicsProgressSnapshot(lessonIds: number[]): Promise<TopicsProgressMap> {
  const entries = await Promise.all(
    lessonIds.map(async (lessonId) => {
      try {
        const topics = await userProgressService.getTopicsForLesson(lessonId)
        return [lessonId, topics] as const
      } catch (error) {
        console.error(`Failed to load topics for lesson ${lessonId}`, error)
        return [lessonId, []] as const
      }
    })
  )

  return entries.reduce<TopicsProgressMap>((acc, [lessonId, topics]) => {
    acc[lessonId] = topics
    return acc
  }, {})
}

async function getAdaptiveAnalytics(userId: string | undefined) {
  if (!userId) return null
  try {
    const response = await apiService.get(`/adaptive/analytics/${userId}`)
    if ((response as any).success !== undefined) {
      return (response as any).success ? (response as any).data : null
    }
    return response as AdaptiveAnalytics
  } catch (error) {
    console.error('Failed to fetch adaptive analytics', error)
    return null
  }
}

async function getAssessmentStats(userId: string | undefined) {
  if (!userId) return null
  try {
    const response = await apiService.get(`/assessment/statistics/${userId}`)
    if ((response as any).success !== undefined) {
      return (response as any).success ? (response as any).data : null
    }
    return response as AssessmentStatistics
  } catch (error) {
    console.error('Failed to fetch assessment statistics', error)
    return null
  }
}

export const roadmapService = {
  getTopicsProgressSnapshot,
  getAdaptiveAnalytics,
  getAssessmentStats,
}
