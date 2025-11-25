import { useAuthContext } from '@/contexts/AuthContext'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  XCircle,
  Brain,
  Target,
  TrendingUp,
  AlertCircle,
  Table,
  Grid3X3,
  BookOpen,
  Lightbulb,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import CircuitRenderer from '@/components/CircuitRenderer'

async function fetchAttempt(attemptId: number) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/assessment/attempt/${attemptId}`
  )
  const result = await response.json()
  if (!result.success)
    throw new Error(result.error || 'Failed to fetch attempt')
  return result.data
}

// Mapping from topic/tag to lessonIdFf
const topicToLessonId: Record<string, number> = {
  intro: 1,
  'boolean-values': 1,
  applications: 1,
  'and-gate': 2,
  'or-gate': 2,
  'not-gate': 2,
  'nand-gate': 2,
  'nor-gate': 2,
  'xor-gate': 2,
  'xnor-gate': 2,
  'truth-table-construction': 3,
  'truth-table-reading': 3,
  'truth-table-for-gates': 3,
  'identity-law': 4,
  'null-law': 4,
  'idempotent-law': 4,
  'inverse-law': 4,
  'commutative-law': 4,
  'absorption-law': 4,
  'distributive-law': 4,
  simplification: 4,
  'karnaugh-maps': 4,
}

// Component to render truth tables
const TruthTableRenderer = ({ tableData }: { tableData: any }) => {
  return (
    <div className="my-6 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
        <Table className="w-4 h-4 text-muted-foreground" />
        <h4 className="font-medium text-sm text-foreground">
          {tableData.caption || 'Truth Table'}
        </h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b bg-muted/50 transition-colors hover:bg-muted/60">
              {(tableData.headers || tableData.rows[0] || []).map(
                (header: string, idx: number) => (
                  <th
                    key={idx}
                    className="h-10 px-4 align-middle font-medium text-muted-foreground"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {tableData.rows
              .slice(tableData.headers ? 0 : 1)
              .map((row: string[], rowIdx: number) => (
                <tr
                  key={rowIdx}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {row.map((cell: string, cellIdx: number) => (
                    <td key={cellIdx} className="p-4 align-middle">
                      {cell === '0' || cell === '1' ? (
                        <span
                          className={`font-mono font-medium ${cell === '1' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                        >
                          {cell}
                        </span>
                      ) : (
                        <span className="text-foreground">{cell}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Component to render Karnaugh maps
const KarnaughMapRenderer = ({ kMapData }: { kMapData: any }) => {
  return (
    <div className="my-6 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
        <Grid3X3 className="w-4 h-4 text-muted-foreground" />
        <h4 className="font-medium text-sm text-foreground">
          {kMapData.caption || 'Karnaugh Map'}
        </h4>
      </div>
      <div className="p-6 flex justify-center bg-background">
        <div className="inline-block">
          <div className="flex mb-2">
            <div className="w-12" />
            {(kMapData.headers || []).map((header: string, idx: number) => (
              <div
                key={idx}
                className="w-12 text-center font-medium text-muted-foreground text-xs"
              >
                {header}
              </div>
            ))}
          </div>
          {kMapData.rows.map((row: string[], rowIdx: number) => (
            <div key={rowIdx} className="flex items-center mb-1">
              <div className="w-12 text-center font-medium text-muted-foreground text-xs pr-2">
                {kMapData.sideLabels
                  ? kMapData.sideLabels[rowIdx]
                  : `Row ${rowIdx}`}
              </div>
              {row.map((cell: string, cellIdx: number) => (
                <div
                  key={cellIdx}
                  className="w-12 h-12 border bg-card flex items-center justify-center font-mono text-sm transition-colors hover:bg-accent"
                >
                  {cell === '0' || cell === '1' ? (
                    <span
                      className={`font-bold ${
                        cell === '1'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {cell}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{cell}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Component to render question stem with embedded tables/maps
const QuestionStemRenderer = ({ stem }: { stem: any }) => {
  if (typeof stem === 'string') {
    return (
      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
        {stem}
      </h2>
    )
  }
  if (typeof stem === 'object' && stem !== null) {
    // If there's a visual element (table, kmap, circuit), only show that - no text
    if (stem.type === 'table' && stem.table) {
      return (
        <div>
          <TruthTableRenderer tableData={stem.table} />
        </div>
      )
    }
    if (stem.type === 'karnaughMap' && stem.karnaughMap) {
      return (
        <div>
          <KarnaughMapRenderer kMapData={stem.karnaughMap} />
        </div>
      )
    }
    if (stem.type === 'circuit' && stem.circuit) {
      return (
        <div>
          <CircuitRenderer circuit={stem.circuit} />
        </div>
      )
    }
    // Only show text if there's no visual element
    if (stem.text && !stem.type) {
      return (
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
          {stem.text}
        </h2>
      )
    }
  }
  return (
    <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
      {JSON.stringify(stem)}
    </h2>
  )
}

export const Route = createFileRoute('/assessment/$assessmentId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { assessmentId } = Route.useParams()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [questions, setQuestions] = useState<any[]>([])
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<{ [qId: number]: string }>({})
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [adaptiveInfo, setAdaptiveInfo] = useState<any>(null)
  const [topicPerformance, setTopicPerformance] = useState<any[]>([])
  const [attemptFeedback, setAttemptFeedback] = useState<string | null>(null)
  const [weakestAreas, setWeakestAreas] = useState<string[]>([])
  const [strongestAreas, setStrongestAreas] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [processingResults, setProcessingResults] = useState(false)
  // Move these hooks to the top to comply with Rules of Hooks
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [submittedAnswers, setSubmittedAnswers] = useState<Set<number>>(
    new Set()
  )

  useEffect(() => {
    if (!user) {
      navigate({ to: '/roadmap' })
      return
    }
    setLoading(true)

    // Try to get attempt data from sessionStorage first (for newly created assessments)
    const cachedAttempt = sessionStorage.getItem('currentAttempt')
    if (cachedAttempt) {
      try {
        const data = JSON.parse(cachedAttempt)
        // Check if this is the correct attempt
        if (data.attemptId === Number(assessmentId)) {
          // Clear the cache after using it
          sessionStorage.removeItem('currentAttempt')

          // Ensure questions is always an array
          const questionsData = Array.isArray(data.questions)
            ? data.questions
            : []
          setQuestions(questionsData)
          setAttemptId(data.attemptId)
          if (data.adaptiveInfo) {
            setAdaptiveInfo(data.adaptiveInfo)
          }
          setLoading(false)
          return
        }
      } catch (error) {
        console.error('Failed to parse cached attempt:', error)
        sessionStorage.removeItem('currentAttempt')
      }
    }

    // If no cached data or different attempt, fetch from server
    fetchAttempt(Number(assessmentId))
      .then((data) => {
        // Ensure questions is always an array
        const questionsData = Array.isArray(data.questions)
          ? data.questions
          : []
        setQuestions(questionsData)
        setAttemptId(data.id)
        if (data.performance) {
          setAdaptiveInfo(data.performance)
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch attempt:', error)
        setLoading(false)
        navigate({ to: '/roadmap' })
      })
  }, [assessmentId, navigate, user])

  // Reset selectedOption when moving to a new question
  useEffect(() => {
    setSelectedOption(null)
  }, [current])

  if (loading) {
    return (
      <div className="pt-36 max-w-4xl mx-auto flex flex-col items-center">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
          <Card className="w-full">
            <CardContent className="p-6 space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="pt-36 max-w-4xl mx-auto flex flex-col items-center">
        <Card className="w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Assessment Not Found
            </h2>
            <p className="text-gray-500 dark:text-gray-300 mb-4">
              The assessment you're looking for doesn't exist or has been
              removed.
            </p>
            <Button onClick={() => navigate({ to: '/roadmap' })}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = questions[current]
  const total = questions.length
  const progress = ((current + 1) / total) * 100

  const handleSelectOption = (optionId: string) => {
    // Don't allow changing answer after submission
    if (submittedAnswers.has(question.id ?? current)) return
    setSelectedOption(optionId)
  }

  const handleSubmitAnswer = () => {
    if (!selectedOption) return
    setAnswers({ ...answers, [question.id ?? current]: selectedOption })
    setSubmittedAnswers(new Set([...submittedAnswers, question.id ?? current]))
  }

  const handleNext = async () => {
    if (current < total - 1) {
      setCurrent(current + 1)
      // selectedOption is now reset by useEffect when current changes
    } else {
      setProcessingResults(true)
      setShowResult(true)
      await handleSubmit()
      setTimeout(() => setProcessingResults(false), 2000)
    }
  }

  const handleSubmit = async () => {
    if (!attemptId) return
    setSubmitting(true)
    try {
      const endpoint = adaptiveInfo
        ? 'submit-adaptive-practice'
        : 'submit-practice'
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/assessment/${endpoint}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attemptId,
            responses: answers,
          }),
        }
      )
      const result = await response.json()
      if (result.success) {
        setScore(result.data.score)
        setFeedback(result.data.feedback)
        setAttemptFeedback(result.data.attemptFeedback || null)
        setWeakestAreas(result.data.weakestAreas || [])
        setStrongestAreas(result.data.strongestAreas || [])
        setRecommendations(result.data.recommendations || [])
        if (result.data.topicPerformance) {
          setTopicPerformance(result.data.topicPerformance)
        }
      } else {
        throw new Error(result.error || 'Failed to submit assessment')
      }
    } catch (error) {
      console.error('Failed to submit assessment:', error)
      setFeedback(
        'There was an error submitting your assessment. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleRestart = () => {
    navigate({ to: '/roadmap' })
  }

  const localScore = questions.reduce(
    (acc, q, idx) =>
      acc +
      (q.options.find((o: any) => o.id === answers[q.id ?? idx] && o.isCorrect)
        ? 1
        : 0),
    0
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/10 text-green-700 border-green-200 dark:text-green-400 dark:border-green-900'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:text-yellow-400 dark:border-yellow-900'
      case 'hard':
        return 'bg-red-500/10 text-red-700 border-red-200 dark:text-red-400 dark:border-red-900'
      default:
        return 'bg-muted text-muted-foreground border-transparent'
    }
  }

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return 'text-green-600 dark:text-green-400'
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const formatTagName = (tag: string) => {
    return tag.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const hasVisualElements = () => {
    if (typeof question.stem === 'object' && question.stem !== null) {
      return (
        question.stem.type === 'table' || question.stem.type === 'karnaughMap'
      )
    }
    return false
  }

  // Helper to try to extract a tag from a recommendation string
  const extractTagFromRecommendation = (rec: string) => {
    // Try to find a tag that is a substring in the recommendation (case-insensitive)
    return Object.keys(topicToLessonId).find((t) =>
      rec.toLowerCase().includes(t.replace(/-/g, ' '))
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div
        className={`pt-24 ${hasVisualElements() ? 'max-w-5xl' : 'max-w-3xl'} mx-auto px-4 flex flex-col items-center`}
      >
        {/* Header Section */}
        <div className="w-full mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-foreground">
              {adaptiveInfo ? (
                <>
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                    <Brain className="w-6 h-6" />
                  </div>
                  Adaptive Assessment
                </>
              ) : (
                <>
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                    <Target className="w-6 h-6" />
                  </div>
                  Practice Assessment
                </>
              )}
            </h1>
            {adaptiveInfo && (
              <div className="flex items-center gap-3 mt-3 text-muted-foreground">
                <div
                  className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold capitalize ${getDifficultyColor(adaptiveInfo.recommendedDifficulty)}`}
                >
                  {adaptiveInfo.recommendedDifficulty}
                </div>
                <span className="text-sm font-medium">
                  Mastery: {Math.round(adaptiveInfo.overallMastery * 100)}%
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 min-w-[200px]">
            <div className="text-sm font-medium text-muted-foreground">
              Question {showResult ? total : current + 1} of {total}
            </div>
            <Progress value={progress} className="h-2 w-full" />
          </div>
        </div>

        {!showResult ? (
          <Card className="w-full shadow-sm border bg-card">
            <CardContent>
              <div>
                <div className="flex items-center flex-wrap gap-2 mb-6">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    Lesson {question.lessonId}
                  </span>
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    Topic {question.topicId}
                  </span>
                  {question.difficulty && (
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getDifficultyColor(question.difficulty)}`}
                    >
                      {question.difficulty}
                    </span>
                  )}
                  {hasVisualElements() && (
                    <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-orange-500/10 text-orange-700 dark:text-orange-400">
                      {typeof question.stem === 'object' &&
                      question.stem?.type === 'table' ? (
                        <>
                          <Table className="w-3 h-3" />
                          Truth Table
                        </>
                      ) : (
                        <>
                          <Grid3X3 className="w-3 h-3" />
                          K-Map
                        </>
                      )}
                    </span>
                  )}
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <QuestionStemRenderer stem={question.stem} />
                </div>
              </div>

              <div className="grid gap-3">
                {question.options.map((opt: any) => {
                  const isAnswered = !!answers[question.id ?? current]
                  const isSelected = isAnswered
                    ? answers[question.id ?? current] === opt.id
                    : selectedOption === opt.id
                  const isCorrect = opt.isCorrect

                  let stateClass =
                    'border-input hover:bg-accent hover:text-accent-foreground'
                  if (isAnswered) {
                    if (isSelected) {
                      if (isCorrect)
                        stateClass =
                          'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                      else
                        stateClass =
                          'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400'
                    } else if (isCorrect) {
                      stateClass =
                        'border-green-500 bg-green-500/5 text-green-700 dark:text-green-400'
                    } else {
                      stateClass = 'opacity-50'
                    }
                  } else if (isSelected) {
                    stateClass =
                      'border-primary ring-1 ring-primary bg-primary/5'
                  }

                  return (
                    <button
                      key={opt.id}
                      className={`
                        relative flex w-full items-center rounded-lg border p-4 text-left text-sm font-medium transition-all
                        ${stateClass}
                        ${isAnswered ? 'cursor-default' : 'cursor-pointer'}
                      `}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt.id)}
                    >
                      <span className="flex-1">{opt.text}</span>
                      {isAnswered && (
                        <div className="ml-4 shrink-0">
                          {isSelected &&
                            (isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            ))}
                          {!isSelected && isCorrect && (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Submit Answer Button */}
              {!answers[question.id ?? current] && selectedOption && (
                <div className="mt-6 animate-in fade-in slide-in-from-bottom-2">
                  <Button
                    onClick={handleSubmitAnswer}
                    className="w-full h-11 text-base"
                  >
                    Submit Answer
                  </Button>
                </div>
              )}

              {answers[question.id ?? current] && (
                <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
                    <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Explanation
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      {
                        question.options.find(
                          (o: any) => o.id === answers[question.id ?? current]
                        )?.explanation
                      }
                    </p>
                  </div>

                  {!question.options.find(
                    (o: any) =>
                      o.id === answers[question.id ?? current] && o.isCorrect
                  ) && (
                    <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-900/20">
                      <h4 className="mb-2 font-semibold text-red-900 dark:text-red-300">
                        Solution Steps
                      </h4>
                      <ul className="list-disc ml-6 text-sm text-red-800 dark:text-red-200 space-y-1">
                        {question.solutionSteps?.map(
                          (step: string, i: number) => (
                            <li key={i}>{step}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center mt-8cd pt-6 border-t">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCurrent(current - 1)
                    setSelectedOption(null)
                  }}
                  disabled={submitting || current === 0}
                  className={current === 0 ? 'invisible' : ''}
                >
                  Previous
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!answers[question.id ?? current] || submitting}
                  className="min-w-[140px]"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </div>
                  ) : current < total - 1 ? (
                    'Next Question'
                  ) : (
                    'Finish Assessment'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : processingResults ? (
          <Card className="w-full mb-8 shadow-sm border bg-card">
            <CardContent className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                <Loader2 className="relative w-16 h-16 text-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">
                Analyzing Performance
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're processing your answers to generate personalized feedback
                and study recommendations.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full mb-8 shadow-sm border bg-card">
            <CardContent className="p-8">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-foreground">
                  Assessment Complete!
                </h2>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  {adaptiveInfo && (
                    <span className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      {adaptiveInfo.recommendedDifficulty} difficulty
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 rounded-xl border bg-card text-center">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Final Score
                  </div>
                  <div
                    className={`text-4xl font-bold ${getScoreColor(score ?? localScore, total)}`}
                  >
                    {score ?? localScore}
                    <span className="text-xl text-muted-foreground font-normal">
                      /{total}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {Math.round(((score ?? localScore) / total) * 100)}% Correct
                  </div>
                </div>

                {attemptFeedback && (
                  <div className="p-6 rounded-xl border bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900 flex flex-col justify-center">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Assessment Summary
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      {attemptFeedback}
                    </p>
                  </div>
                )}
              </div>

              {feedback && (
                <div className="mb-8 p-6 rounded-xl border bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Overall Progress Feedback
                  </h3>
                  <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                    {feedback}
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {/* Weak Areas */}
                {weakestAreas.length > 0 && (
                  <div className="rounded-xl border border-red-200 bg-red-50/30 p-6 dark:border-red-900 dark:bg-red-900/10">
                    <h4 className="font-semibold text-red-900 dark:text-red-300 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Focus Areas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {weakestAreas.map((area, idx) => (
                        <Link
                          key={idx}
                          to="/lesson/$lessonId"
                          params={{
                            lessonId: String(topicToLessonId[area] || 1),
                          }}
                          search={{ topicId: undefined }}
                          className="inline-flex items-center px-3 py-1.5 rounded-md bg-background border border-red-200 dark:border-red-800 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-sm"
                        >
                          {formatTagName(area)}
                          <ArrowRight className="w-3 h-3 ml-2 opacity-50" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strong Areas */}
                {strongestAreas.length > 0 && (
                  <div className="rounded-xl border border-green-200 bg-green-50/30 p-6 dark:border-green-900 dark:bg-green-900/10">
                    <h4 className="font-semibold text-green-900 dark:text-green-300 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Strong Points
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {strongestAreas.map((area, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1.5 rounded-md bg-background border border-green-200 dark:border-green-800 text-sm font-medium text-green-700 dark:text-green-300 shadow-sm"
                        >
                          {formatTagName(area)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <div className="rounded-xl border border-yellow-200 bg-yellow-50/30 p-6 dark:border-yellow-900 dark:bg-yellow-900/10">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Study Plan
                    </h4>
                    <ul className="space-y-3">
                      {recommendations.map((rec, idx) => {
                        const tag = extractTagFromRecommendation(rec)
                        return (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-sm text-yellow-800 dark:text-yellow-200"
                          >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                            {tag ? (
                              <Link
                                to="/lesson/$lessonId"
                                params={{
                                  lessonId: String(topicToLessonId[tag]),
                                }}
                                search={{ topicId: undefined }}
                                className="font-medium underline decoration-yellow-400/50 hover:decoration-yellow-500 underline-offset-2"
                              >
                                {rec}
                              </Link>
                            ) : (
                              <span>{rec}</span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

                {/* Topic Performance Breakdown */}
                {topicPerformance.length > 0 && (
                  <div className="rounded-xl border bg-card p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-muted-foreground" />
                      Detailed Breakdown
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {topicPerformance.map((perf, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 rounded-lg border bg-muted/30"
                        >
                          <span className="text-sm font-medium text-foreground">
                            Topic {perf.topicId}
                          </span>
                          <span
                            className={`text-sm font-bold ${getScoreColor(perf.correct, perf.total)}`}
                          >
                            {perf.correct}/{perf.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="min-w-40"
                >
                  Back to Dashboard
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="min-w-40"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
