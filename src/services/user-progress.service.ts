import { apiService } from './api.service'

export interface UserTopicProgress {
  id: number
  userId: string
  topicId: number
  status: 'not-started' | 'viewed' | 'completed'
  viewCount?: number
  timeSpent: number
  firstViewedAt: string | null
  lastViewedAt: string
  completedAt: string | null
  createdAt: string
}

export interface UserLessonProgress {
  id: number
  userId: string
  lessonId: number
  status: 'not-started' | 'in-progress' | 'completed'
  progress: number
  masteryScore: number | null
  startedAt: string | null
  completedAt: string | null
  lastViewedAt: string
  createdAt: string
  lesson?: {
    id: number
    title: string
  }
}

export interface UserStatistics {
  lessonsStarted: number
  lessonsCompleted: number
  totalLessons: number
  topicsViewed: number
  topicsCompleted: number
  totalTopics: number
  averageProgress: number
}

export const userProgressService = {
  async markTopicViewed(topicId: number): Promise<UserTopicProgress> {
    return await apiService.post<UserTopicProgress>(
      `/progress/topic/${topicId}/viewed`,
      {},
      true
    )
  },

  async markTopicCompleted(topicId: number): Promise<UserTopicProgress> {
    return await apiService.post<UserTopicProgress>(
      `/progress/topic/${topicId}/completed`,
      {},
      true
    )
  },

  async getLessonProgress(lessonId: number): Promise<UserLessonProgress> {
    return await apiService.get<UserLessonProgress>(
      `/progress/lesson/${lessonId}`,
      true
    )
  },

  async getAllProgress(): Promise<UserLessonProgress[]> {
    return await apiService.get<UserLessonProgress[]>(
      '/progress/all',
      true
    )
  },

  async getTopicsForLesson(lessonId: number): Promise<any> {
    return await apiService.get(
      `/progress/topics/lesson/${lessonId}`,
      true
    )
  },

  async getStatistics(): Promise<UserStatistics> {
    return await apiService.get<UserStatistics>(
      '/progress/statistics',
      true
    )
  }
}
