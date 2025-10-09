import { useAuthContext } from '@/contexts/AuthContext'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, Brain, Target, TrendingUp, AlertCircle, Table, Grid3X3, BookOpen, Lightbulb, Loader2 } from 'lucide-react'
import CircuitRenderer from '@/components/CircuitRenderer'

async function fetchAttempt(attemptId: number) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/assessment/attempt/${attemptId}`)
  const result = await response.json()
  if (!result.success) throw new Error(result.error || 'Failed to fetch attempt')
  return result.data
}

// Mapping from topic/tag to lessonId
const topicToLessonId: Record<string, number> = {
  'intro': 1,
  'boolean-values': 1,
  'applications': 1,
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
  'simplification': 4,
  'karnaugh-maps': 4,
}

const lessonNames: Record<number, string> = {
  1: "Introduction to Boolean Algebra",
  2: "Logic Gates",
  3: "Truth Tables",
  4: "Simplification"
}

// Component to render truth tables
const TruthTableRenderer = ({ tableData }: { tableData: any }) => {
  return (
    <div className="my-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2 mb-3">
        <Table className="w-5 h-5 text-blue-600" />
        <h4 className="font-semibold text-gray-800">{tableData.caption || 'Truth Table'}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 bg-white">
          <thead>
            <tr className="bg-blue-100">
              {(tableData.headers || tableData.rows[0] || []).map((header: string, idx: number) => (
                <th key={idx} className="border border-gray-300 px-3 py-2 text-center font-semibold text-blue-900">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.slice(tableData.headers ? 0 : 1).map((row: string[], rowIdx: number) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell: string, cellIdx: number) => (
                  <td key={cellIdx} className="border border-gray-300 px-3 py-2 text-center">
                    {cell === '0' || cell === '1' ? (
                      <span className={`font-mono font-bold ${cell === '1' ? 'text-green-600' : 'text-red-600'}`}>
                        {cell}
                      </span>
                    ) : (
                      <span className="text-gray-700">{cell}</span>
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
    <div className="my-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2 mb-3">
        <Grid3X3 className="w-5 h-5 text-purple-600" />
        <h4 className="font-semibold text-gray-800">{kMapData.caption || 'Karnaugh Map'}</h4>
      </div>
      <div className="flex justify-center">
        <div className="inline-block">
          <div className="flex mb-2">
            <div className="w-16"></div>
            {(kMapData.headers || []).map((header: string, idx: number) => (
              <div key={idx} className="w-16 text-center font-semibold text-purple-700 text-sm">
                {header}
              </div>
            ))}
          </div>
          {kMapData.rows.map((row: string[], rowIdx: number) => (
            <div key={rowIdx} className="flex items-center mb-1">
              <div className="w-16 text-center font-semibold text-purple-700 text-sm pr-2">
                {kMapData.sideLabels ? kMapData.sideLabels[rowIdx] : `Row ${rowIdx}`}
              </div>
              {row.map((cell: string, cellIdx: number) => (
                <div 
                  key={cellIdx} 
                  className="w-16 h-12 border-2 border-purple-300 bg-white flex items-center justify-center font-mono font-bold text-sm hover:bg-purple-50 transition-colors"
                >
                  {cell === '0' || cell === '1' ? (
                    <span className={cell === '1' ? 'text-green-600' : 'text-red-600'}>
                      {cell}
                    </span>
                  ) : (
                    <span className="text-gray-700">{cell}</span>
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
    return <h2 className="text-xl font-semibold mb-3">{stem}</h2>
  }
  if (typeof stem === 'object' && stem !== null) {
    if (stem.type === 'table' && stem.table) {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-3">Analyze the following truth table:</h2>
          <TruthTableRenderer tableData={stem.table} />
        </div>
      )
    }
    if (stem.type === 'karnaughMap' && stem.karnaughMap) {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-3">Analyze the following Karnaugh map:</h2>
          <KarnaughMapRenderer kMapData={stem.karnaughMap} />
        </div>
      )
    }
    if (stem.type === 'circuit' && stem.circuit) {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-3">Analyze the following circuit:</h2>
          <CircuitRenderer circuit={stem.circuit} />
        </div>
      )
    }
    if (stem.text) {
      return <h2 className="text-xl font-semibold mb-3">{stem.text}</h2>
    }
  }
  return <h2 className="text-xl font-semibold mb-3">{JSON.stringify(stem)}</h2>
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

  useEffect(() => {
    if (!user) {
      navigate({ to: '/roadmap' })
      return
    }
    setLoading(true)
    fetchAttempt(Number(assessmentId))
      .then(data => {
        setQuestions(data.questions || [])
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

  if (loading) {
    return (
      <div className="pt-36 max-w-4xl mx-auto flex flex-col items-center">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
          <Card className="w-full">
            <CardContent className="p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
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
            <h2 className="text-xl font-semibold mb-2">Assessment Not Found</h2>
            <p className="text-gray-500 mb-4">The assessment you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate({ to: '/roadmap' })}>
              Back to Roadmap
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = questions[current]
  const total = questions.length
  const progress = ((current + 1) / total) * 100

  const handleAnswer = (optionId: string) => {
    setAnswers({ ...answers, [question.id ?? current]: optionId })
  }

  const handleNext = async () => {
    if (current < total - 1) {
      setCurrent(current + 1)
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
      const endpoint = adaptiveInfo ? 'submit-adaptive-practice' : 'submit-practice'
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/assessment/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          responses: answers,
        }),
      })
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
      setFeedback('There was an error submitting your assessment. Please try again.')
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
      (q.options.find((o: any) => o.id === answers[q.id ?? idx] && o.isCorrect) ? 1 : 0),
    0
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'hard': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatTagName = (tag: string) => {
    return tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const hasVisualElements = () => {
    if (typeof question.stem === 'object' && question.stem !== null) {
      return question.stem.type === 'table' || question.stem.type === 'karnaughMap'
    }
    return false
  }

  // Helper to try to extract a tag from a recommendation string
  const extractTagFromRecommendation = (rec: string) => {
    // Try to find a tag that is a substring in the recommendation (case-insensitive)
    return Object.keys(topicToLessonId).find(t =>
      rec.toLowerCase().includes(t.replace(/-/g, ' '))
    )
  }

  return (
    <div>
      <div className={`pt-8 ${hasVisualElements() ? 'max-w-4xl' : 'max-w-2xl'} mx-auto flex flex-col items-center`}>
        {/* Header Card */}
        <Card className="w-full mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {adaptiveInfo ? (
                    <>
                      <Brain className="w-6 h-6 text-purple-600" />
                      Adaptive Assessment
                    </>
                  ) : (
                    <>
                      <Target className="w-6 h-6 text-blue-600" />
                      Practice Assessment
                    </>
                  )}
                </h1>
                {adaptiveInfo && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">Difficulty:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getDifficultyColor(adaptiveInfo.recommendedDifficulty)}`}>
                      {adaptiveInfo.recommendedDifficulty}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      Mastery: {Math.round(adaptiveInfo.overallMastery * 100)}%
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">
                  Question {showResult ? total : current + 1} of {total}
                </div>
                <Progress value={progress} className="w-32 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {!showResult ? (
          <Card className="w-full mb-8 shadow-lg">
            <CardContent className="p-6">
              <div className="mb-6">
                <QuestionStemRenderer stem={question.stem} />
                <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500 mb-4">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Lesson {question.lessonId}
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Topic {question.topicId}
                  </span>
                  {question.difficulty && (
                    <span className={`px-2 py-1 rounded font-medium ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                  )}
                  {hasVisualElements() && (
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded flex items-center gap-1">
                      {typeof question.stem === 'object' && question.stem?.type === 'table' ? (
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
              </div>
              <div className="flex flex-col gap-3">
                {question.options.map((opt: any) => {
                  const isSelected = answers[question.id ?? current] === opt.id
                  const isAnswered = !!answers[question.id ?? current]
                  const isCorrect = opt.isCorrect
                  return (
                    <button
                      key={opt.id}
                      className={`
                        flex items-center px-4 py-3 rounded-lg border transition-all duration-200
                        text-left
                        ${isAnswered
                          ? isSelected
                            ? isCorrect
                              ? 'bg-green-50 border-green-400 text-green-900 shadow-md'
                              : 'bg-red-50 border-red-400 text-red-900 shadow-md'
                            : isCorrect
                              ? 'bg-green-50 border-green-300 text-green-800'
                              : 'bg-gray-50 border-gray-200 text-gray-500'
                          : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm'}
                        ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}
                        font-medium
                      `}
                      disabled={isAnswered}
                      onClick={() => handleAnswer(opt.id)}
                    >
                      <span className="flex-1">{opt.text}</span>
                      {isAnswered && (
                        <>
                          {isSelected && (
                            isCorrect ? (
                              <CheckCircle2 className="ml-2 w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="ml-2 w-5 h-5 text-red-500" />
                            )
                          )}
                          {!isSelected && isCorrect && (
                            <CheckCircle2 className="ml-2 w-5 h-5 text-green-400" />
                          )}
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
              {answers[question.id ?? current] && (
                <>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                    <p className="text-sm text-blue-800">
                      {
                        question.options.find(
                          (o: any) => o.id === answers[question.id ?? current]
                        )?.explanation
                      }
                    </p>
                  </div>
                  {!question.options.find(
                    (o: any) => o.id === answers[question.id ?? current] && o.isCorrect
                  ) && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg">
                      <h4 className="font-semibold text-red-900 mb-2">Solution Steps:</h4>
                      <ul className="list-disc ml-6 text-sm text-red-800 space-y-1">
                        {question.solutionSteps?.map((step: string, i: number) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                      {question.sourcePassages?.length > 0 && (
                        <>
                          <h4 className="font-semibold text-red-900 mt-3 mb-2">Reference:</h4>
                          <ul className="list-disc ml-6 text-sm text-red-800 space-y-1">
                            {question.sourcePassages.map((passage: string, i: number) => (
                              <li key={i}>{passage}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between items-center mt-8">
                <div className="flex gap-2">
                  {current > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrent(current - 1)}
                      disabled={submitting}
                    >
                      Previous
                    </Button>
                  )}
                </div>
                <Button
                  onClick={handleNext}
                  disabled={!answers[question.id ?? current] || submitting}
                  className="min-w-[120px]"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </div>
                  ) : (
                    current < total - 1 ? 'Next' : 'Finish'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : processingResults ? (
          <Card className="w-full mb-8">
            <CardContent className="p-8 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Processing your assessment results...</h2>
              <p className="text-gray-500">Analyzing your answers and generating personalized feedback. Please wait.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full mb-8">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Assessment Complete!</h2>
              </div>
              <div className="mb-6">
                <p className="text-2xl mb-2">
                  Your Score: 
                  <span className={`font-bold ml-2 ${getScoreColor(score ?? localScore, total)}`}>
                    {score ?? localScore} / {total}
                  </span>
                  <span className={`text-lg ml-2 ${getScoreColor(score ?? localScore, total)}`}>
                    ({Math.round(((score ?? localScore) / total) * 100)}%)
                  </span>
                </p>
                {adaptiveInfo && (
                  <div className="flex justify-center items-center gap-4 mt-4">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      Completed at {adaptiveInfo.recommendedDifficulty} difficulty
                    </span>
                  </div>
                )}
              </div>
              {/* Immediate Attempt Feedback */}
              {attemptFeedback && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    This Assessment Results
                  </h3>
                  <p className="text-sm text-blue-800">{attemptFeedback}</p>
                </div>
              )}
              {/* Weak Areas */}
              {weakestAreas.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Areas for Improvement:
                  </h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {weakestAreas.map((area, idx) => (
                      <Link
                        key={idx}
                        to={`/lesson/${topicToLessonId[area] || 1}`}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm underline hover:bg-red-200 transition"
                        title={`Go to ${lessonNames[topicToLessonId[area] || 1]}`}
                      >
                        {formatTagName(area)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {/* Strong Areas */}
              {strongestAreas.length > 0 && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Your Strengths:
                  </h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {strongestAreas.map((area, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {formatTagName(area)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Study Recommendations:
                  </h4>
                  <ul className="text-sm text-yellow-800 space-y-1 text-left max-w-2xl mx-auto">
                    {recommendations.map((rec, idx) => {
                      const tag = extractTagFromRecommendation(rec)
                      return (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          {tag ? (
                            <Link
                              to={`/lesson/${topicToLessonId[tag]}`}
                              className="underline text-yellow-900 hover:text-yellow-700"
                              title={`Go to ${lessonNames[topicToLessonId[tag]]}`}
                            >
                              {rec}
                            </Link>
                          ) : (
                            rec
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
              {/* Long-term Adaptive Feedback */}
              {feedback && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Overall Progress Feedback
                  </h3>
                  <p className="text-sm text-purple-800">{feedback}</p>
                </div>
              )}
              {/* Topic Performance Breakdown */}
              {topicPerformance.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Performance by Topic:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {topicPerformance.map((perf, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-white rounded">
                        <span>Topic {perf.topicId}</span>
                        <span className={`font-medium ${getScoreColor(perf.correct, perf.total)}`}>
                          {perf.correct}/{perf.total} ({Math.round((perf.correct / perf.total) * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleRestart} className="min-w-[160px]">
                  Back to Roadmap
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="min-w-[160px]"
                >
                  Take Another Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}