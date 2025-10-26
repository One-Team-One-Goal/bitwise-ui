import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { lessonService, type Lesson } from '@/services/lesson.service'

export default function useLesson(
  lessonId?: number | null,
  opts?: { enabled?: boolean; staleTimeMs?: number }
): UseQueryResult<Lesson, Error> {
  const validId = typeof lessonId === 'number' && !Number.isNaN(lessonId)
  const enabled = validId && (opts?.enabled ?? true)
  const staleTime = opts?.staleTimeMs ?? 1000 * 60 * 2

  return useQuery<Lesson, Error>({
    queryKey: lessonId ? ['lesson', String(lessonId)] : ['lesson', 'null'],
    queryFn: async () => {
      if (!validId) throw new Error('No lesson id provided')
      return await lessonService.getLessonById(Number(lessonId))
    },
    enabled,
    staleTime,
    retry: 1,
  })
}