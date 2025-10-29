// ...existing code...
import { Card, CardContent } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Target, BarChart3, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { apiService } from '@/services/api.service'

interface AnalyticsData {
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

interface StatisticsData {
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

const lessonNames: Record<number, string> = {
  1: "Introduction to Boolean Algebra",
  2: "Logic Gates",
  3: "Truth Tables",
  4: "Simplification"
}

export default function DataAnalyticsCard({ lesson, user }: { lesson: any; user: any }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [statistics, setStatistics] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user?.id) {
      setAnalytics(null)
      setStatistics(null)
      return
    }

    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)
      try {
        // Use apiService which normalizes base URL and avoids duplicate /api
        const [analyticsResult, statisticsResult] = await Promise.all([
          apiService.get(`/adaptive/analytics/${user.id}`),
          apiService.get(`/assessment/statistics/${user.id}`)
        ])

        // Keep existing success/data shape checks to remain compatible with backend response format
        if (analyticsResult && (analyticsResult as any).success !== undefined) {
          if ((analyticsResult as any).success) {
            setAnalytics((analyticsResult as any).data)
          } else {
            throw new Error((analyticsResult as any).error || 'Failed to fetch analytics')
          }
        } else {
          // assume apiService returned the data directly
          setAnalytics(analyticsResult as AnalyticsData)
        }

        if (statisticsResult && (statisticsResult as any).success !== undefined) {
          if ((statisticsResult as any).success) {
            setStatistics((statisticsResult as any).data)
          } else {
            throw new Error((statisticsResult as any).error || 'Failed to fetch statistics')
          }
        } else {
          setStatistics(statisticsResult as StatisticsData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [user?.id])


  const getCurrentLessonAnalytics = () => {
    if (!analytics || !lesson) return null
    // Find analytics for the current lesson
    const currentLessonData = analytics.skillsByLesson.find(
      l => l.lessonId === lesson.id || l.lessonTitle === lesson.title
    )
    return currentLessonData
  }

  const getWeakTopicsForCurrentLesson = () => {
    const currentLessonData = getCurrentLessonAnalytics()
    if (!currentLessonData) return []
    // Return topics with mastery < 60%
    return currentLessonData.skills
      .filter(skill => skill.mastery < 0.6)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 3) // Top 3 weakest
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'hard': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 0.8) return 'text-green-600'
    if (mastery >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Collapsed state for unauthenticated, loading, or error
  if (!user) {
    return (
      <Card className="p-0 max-w-md rounded-md">
        <button
          className="w-full flex items-center justify-between px-6 py-3 bg-primary-foreground border-b rounded-md"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Your Progress & Analytics
          </span>
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {open && (
          <CardContent className="p-6 pt-4 space-y-2">
            <div className="text-xs text-muted-foreground">
              Login to see your personalized analytics and progress for this lesson.
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="p-0 max-w-md rounded-md">
        <button
          className="w-full flex items-center justify-between px-6 py-3 bg-primary-foreground border-b rounded-md"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Your Progress & Analytics
          </span>
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {open && (
          <CardContent className="p-6 pt-4 space-y-2">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-0 max-w-md rounded-md">
        <button
          className="w-full flex items-center justify-between px-6 py-3 bg-primary-foreground border-b rounded-md"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Your Progress & Analytics
          </span>
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {open && (
          <CardContent className="p-6 pt-4 space-y-2">
            <div className="text-xs text-red-500">
              Error loading analytics: {error}
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  if (!analytics || !statistics) {
    return (
      <Card className="p-0 max-w-md rounded-md">
        <button
          className="w-full flex items-center justify-between px-6 py-3 bg-primary-foreground border-b rounded-md"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Your Progress & Analytics
          </span>
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {open && (
          <CardContent className="p-6 pt-4 space-y-2">
            <div className="text-xs text-muted-foreground">
              No analytics data available. Take some assessments to see your progress!
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  const currentLessonData = getCurrentLessonAnalytics()
  const weakTopics = getWeakTopicsForCurrentLesson()
  const overallMasteryPercent = Math.round(analytics.overallMastery * 100)
  const currentLessonMastery = currentLessonData ?
    Math.round(currentLessonData.skills.reduce((sum, skill) => sum + skill.mastery, 0) / currentLessonData.skills.length * 100) : 0

  return (
    <Card className="p-0 max-w-md rounded-sm">
      <button
        className="w-full flex items-center justify-between px-6 py-3 bg-primary-foreground border-b rounded-md"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="analytics-dropdown-content"
      >
        <span className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Your Progress & Analytics
        </span>
        {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {open && (
        <CardContent id="analytics-dropdown-content" className="p-6 pt-4 space-y-4">
          {/* Alert explaining Focus Areas vs Weak Topics */}
          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded p-3 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-xs text-yellow-800">
              <b>Focus Areas</b> are your <b>overall weakest topics</b> across all lessons, based on your long-term mastery (learning progress over time).<br />
              <b>Weak Topics (This Lesson)</b> are topics in the current lesson where your mastery is still below 60%.<br />
              <span className="italic">Mastery</span> is a long-term skill estimate, not just your latest score.
            </div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Mastery</span>
              <span className={`font-bold ${getMasteryColor(analytics.overallMastery)}`}>
                {overallMasteryPercent}%
              </span>
            </div>
            <Progress value={overallMasteryPercent} className="h-2" />
          </div>

          {/* Current Lesson Progress */}
          {currentLessonData && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Lesson</span>
                <span className={`font-bold ${getMasteryColor(currentLessonMastery / 100)}`}>
                  {currentLessonMastery}%
                </span>
              </div>
              <Progress value={currentLessonMastery} className="h-2" />
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span>Attempts:</span>
                <span className="font-bold">{statistics.totalAttempts}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>Best Score:</span>
                <span className="font-bold">{statistics.bestScore}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <span>Avg Score:</span>
                <span className="font-bold">{statistics.averageScore.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">Difficulty:</span>
                <span className={`font-bold text-xs capitalize ${getDifficultyColor(analytics.recommendedDifficulty)}`}>
                  {analytics.recommendedDifficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Focus Areas with lesson links */}
          {analytics.focusAreas.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Focus Areas (Review these lessons):</span>
              </div>
              <ul className="space-y-1">
                {analytics.focusAreas.slice(0, 3).map((topic) => (
                  <li key={topic.topicId} className="text-xs flex justify-between items-center">
                    <div>
                      <Link
                        to="/lesson/$lessonId"
                        params={{ lessonId: String(topic.lessonId) }}
                        className="text-blue-600 underline hover:text-blue-800"
                        title={`Go to ${lessonNames[topic.lessonId] || 'Lesson'}`}
                      >
                        {lessonNames[topic.lessonId] || 'Lesson'}: {topic.topicTitle}
                      </Link>
                    </div>
                    <span className="text-red-500">
                      {Math.round(topic.mastery * 100)}% mastery
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weak Topics for Current Lesson with links */}
          {weakTopics.length > 0 && (
            <div>
              <span className="text-sm font-medium">Weak Topics (This Lesson):</span>
              <ul className="ml-4 list-disc space-y-1">
                {weakTopics.map((topic) => (
                  <li key={topic.topicId} className="text-xs">
                    <Link
                      to="/lesson/$lessonId"
                      params={{ lessonId: String(lesson.id) }}
                      className="text-blue-600 underline hover:text-blue-800"
                      title={`Review ${topic.topicTitle} in this lesson`}
                    >
                      {topic.topicTitle}
                    </Link>
                    <span className="text-red-500 ml-1">
                      ({Math.round(topic.mastery * 100)}% mastery)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {analytics.reinforcementNeeded.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-blue-800">Recommendation:</span>
              <p className="text-xs text-blue-700 mt-1">
                {analytics.reinforcementNeeded.length} topics need reinforcement. 
                Take more practice assessments to improve your mastery!
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}