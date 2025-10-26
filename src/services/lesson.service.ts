import { apiService } from './api.service'

export type ContentBlock = {
  type: string
  // flexible shape for display content blocks
  [k: string]: any
}

export type Topic = {
  id: number
  title: string
  lessonId: number
  contentText?: string
  displayContent?: ContentBlock[] | null
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

export type Lesson = {
  id: number
  title: string
  topics?: Topic[] | null
  createdAt?: string
  updatedAt?: string
}

export const lessonService = {
  async createLesson(title: string): Promise<Lesson> {
    try {
      return await apiService.post<Lesson>('/lessons', { title }, true)
    } catch (err: any) {
      throw new Error(err?.message ?? 'Failed to create lesson')
    }
  },

  async getLessons(): Promise<Lesson[]> {
    try {
      return await apiService.get<Lesson[]>('/lessons', false)
    } catch (err: any) {
      throw new Error(err?.message ?? 'Failed to fetch lessons')
    }
  },

  async getLessonById(id: number): Promise<Lesson> {
    try {
      return await apiService.get<Lesson>(`/lessons/${id}`, false)
    } catch (err: any) {
      throw new Error(err?.message ?? `Failed to fetch lesson ${id}`)
    }
  },

  async updateLesson(id: number, title: string): Promise<Lesson> {
    try {
      return await apiService.patch<Lesson>(`/lessons/${id}`, { title }, true)
    } catch (err: any) {
      throw new Error(err?.message ?? `Failed to update lesson ${id}`)
    }
  },

  async deleteLesson(id: number): Promise<void> {
    try {
      await apiService.delete(`/lessons/${id}`, true)
    } catch (err: any) {
      throw new Error(err?.message ?? `Failed to delete lesson ${id}`)
    }
  },

  async createTopic(createTopicDto: Partial<Topic>): Promise<Topic> {
    try {
      return await apiService.post<Topic>('/lessons/topics', createTopicDto, true)
    } catch (err: any) {
      throw new Error(err?.message ?? 'Failed to create topic')
    }
  },

  async createTopicsBulk(topics: Partial<Topic>[]): Promise<any> {
    try {
      return await apiService.post('/lessons/topics/bulk', { topics }, true)
    } catch (err: any) {
      throw new Error(err?.message ?? 'Failed to create topics bulk')
    }
  },

  async getTopicsForLesson(lessonId: number): Promise<Topic[]> {
    try {
      return await apiService.get<Topic[]>(`/lessons/${lessonId}/topics`, false)
    } catch (err: any) {
      throw new Error(err?.message ?? `Failed to fetch topics for lesson ${lessonId}`)
    }
  },

  async getAllDisplayContentBlocks(): Promise<Array<{ id: number; displayContent: ContentBlock[] | null }>> {
    try {
      return await apiService.get(`/lessons/display-content/blocks`, false)
    } catch (err: any) {
      throw new Error(err?.message ?? 'Failed to fetch display content blocks')
    }
  },
}