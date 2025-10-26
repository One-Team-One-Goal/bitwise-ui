import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { lessonService, type Lesson } from '@/services/lesson.service'

export default function useLesson(
  lessonId?: number | null,
  opts?: { enabled?: boolean; staleTimeMs?: number }
): UseQueryResult<Lesson, Error> {
  const enabled = !!lessonId && (opts?.enabled ?? true)
  const staleTime = opts?.staleTimeMs ?? 1000 * 60 * 2 // 2 minutes

  return useQuery<Lesson, Error>({
    queryKey: lessonId ? ['lessons', String(lessonId)] : ['lessons', 'null'],
    queryFn: async () => {
      if (!lessonId) throw new Error('No lesson id provided')
      return await lessonService.getLessonById(Number(lessonId))
    },
    enabled,
    staleTime,
    retry: 1,
  })
}