export interface RoadmapTopic {
  id: string
  title: string
  description: string
}

export interface Lesson {
  id: number
  title: string
  description: string
  details: string
  topics: RoadmapTopic[]
}

export interface LessonTopicDisplay {
  id: number
  title: string
  description: string
  status: string
  timeSpent?: number
}

export interface LessonProgress {
  lessonId: number
  status: string
  progress: number
  masteryScore?: number
}

export interface TopicProgress {
  topicId: string | number
  status: string
  timeSpent: number
  topic?: {
    title: string
    description: string
  }
}

export interface TopicMastery {
  topicId: string | number
  mastery: number
  attempts: number
  level: number
}

export interface LessonStatus {
  status: 'completed' | 'in-progress' | 'not-started'
  progress: number
  masteryScore: number | null
  isLocked: boolean
}

export interface FocusArea {
  topicTitle: string
}

export interface Analytics {
  recommendedDifficulty?: string
  focusAreas?: FocusArea[]
  totalAttempts?: number
  overallMastery?: number
}

export interface Statistics {
  totalAttempts?: number
}
