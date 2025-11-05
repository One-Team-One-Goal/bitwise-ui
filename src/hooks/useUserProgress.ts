import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userProgressService } from '@/services/user-progress.service'

export const USER_PROGRESS_QUERY_KEYS = {
  all: ['user-progress'] as const,
  allProgress: () => [...USER_PROGRESS_QUERY_KEYS.all, 'lessons'] as const,
  lesson: (lessonId: number) => [...USER_PROGRESS_QUERY_KEYS.all, 'lesson', lessonId] as const,
  topics: (lessonId: number) => [...USER_PROGRESS_QUERY_KEYS.all, 'topics', lessonId] as const,
  statistics: () => [...USER_PROGRESS_QUERY_KEYS.all, 'statistics'] as const,
} as const

export function useAllUserProgress(enabled: boolean = true) {
  return useQuery({
    queryKey: USER_PROGRESS_QUERY_KEYS.allProgress(),
    queryFn: () => userProgressService.getAllProgress(),
    enabled,
  })
}

export function useLessonProgress(lessonId: number | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: USER_PROGRESS_QUERY_KEYS.lesson(lessonId!),
    queryFn: () => userProgressService.getLessonProgress(lessonId!),
    enabled: enabled && !!lessonId,
  })
}

export function useTopicsForLesson(lessonId: number | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: USER_PROGRESS_QUERY_KEYS.topics(lessonId!),
    queryFn: () => userProgressService.getTopicsForLesson(lessonId!),
    enabled: enabled && !!lessonId,
  })
}

export function useUserStatistics(enabled: boolean = true) {
  return useQuery({
    queryKey: USER_PROGRESS_QUERY_KEYS.statistics(),
    queryFn: () => userProgressService.getStatistics(),
    enabled,
  })
}

export function useMarkTopicViewed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (topicId: number) => userProgressService.markTopicViewed(topicId),
    onSuccess: () => {
      // Invalidate all progress queries to refetch
      queryClient.invalidateQueries({ queryKey: USER_PROGRESS_QUERY_KEYS.all })
    },
  })
}

export function useMarkTopicCompleted() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (topicId: number) => userProgressService.markTopicCompleted(topicId),
    onSuccess: () => {
      // Invalidate all progress queries to refetch
      queryClient.invalidateQueries({ queryKey: USER_PROGRESS_QUERY_KEYS.all })
    },
  })
}
