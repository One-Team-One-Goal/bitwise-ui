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


export function useUpdateLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => lessonService.updateLesson(id, title),
    onSuccess: (data: Lesson) => {
      toast.success('Lesson updated')
      qc.invalidateQueries({ queryKey: LESSON_QUERY_KEYS.detail(data.id) })
      qc.invalidateQueries({ queryKey: LESSON_QUERY_KEYS.list })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update lesson')
    },
  })
}

export function useDeleteLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => lessonService.deleteLesson(id),
    onSuccess: (_, id) => {
      toast.success('Lesson deleted')
      qc.invalidateQueries({ queryKey: LESSON_QUERY_KEYS.list })
      qc.removeQueries({ queryKey: LESSON_QUERY_KEYS.detail(id) })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete lesson')
    },
  })
}

/* Topic-related hooks */

export function useGetTopicsForLesson(lessonId?: number | null) {
  return useQuery({
    queryKey: lessonId ? LESSON_QUERY_KEYS.topics(lessonId) : ['lessons', 'topics', 'null'],
    queryFn: async () => {
      if (!lessonId) throw new Error('No lesson id provided')
      return await lessonService.getTopicsForLesson(Number(lessonId))
    },
    enabled: typeof lessonId === 'number' && !Number.isNaN(Number(lessonId)),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

export function useCreateTopic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Topic>) => lessonService.createTopic(payload),
    onSuccess: (topic: Topic) => {
      toast.success('Topic created')
      qc.invalidateQueries({ queryKey: LESSON_QUERY_KEYS.detail(topic.lessonId) })
      qc.invalidateQueries({ queryKey: LESSON_QUERY_KEYS.topics(topic.lessonId) })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create topic')
    },
  })
}

export function useCreateTopicsBulk() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (topics: Partial<Topic>[]) => lessonService.createTopicsBulk(topics),
    onSuccess: (res) => {
      toast.success('Topics created')
      qc.invalidateQueries({ queryKey: LESSON_QUERY_KEYS.list })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create topics')
    },
  })
}