import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { lessonService, type Lesson, type Topic } from '@/services/lesson.service'

export const LESSON_QUERY_KEYS = {
  list: ['lessons'] as const,
  detail: (id: number | string) => ['lessons', String(id)] as const,
  topics: (lessonId: number | string) => ['lessons', String(lessonId), 'topics'] as const,
} as const

export function useGetLessons() {
  return useQuery({
    queryKey: LESSON_QUERY_KEYS.list,
    queryFn: () => lessonService.getLessons(),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

export function useGetLesson(lessonId?: number | null) {
  return useQuery({
    queryKey: lessonId ? LESSON_QUERY_KEYS.detail(lessonId) : ['lessons', 'null'],
    queryFn: async () => {
      if (!lessonId) throw new Error('No lesson id provided')
      return await lessonService.getLessonById(Number(lessonId))
    },
    enabled: typeof lessonId === 'number' && !Number.isNaN(Number(lessonId)),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

