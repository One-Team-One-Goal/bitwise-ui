import { useAuthContext } from '@/contexts/AuthContext'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, XCircle } from 'lucide-react'

async function fetchAttempt(attemptId: number) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/assessment/attempt/${attemptId}`)
  if (!response.ok) throw new Error('Failed to fetch attempt')
  return await response.json()
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
  const [score, setScore] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

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
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        navigate({ to: '/roadmap' })
      })
  }, [assessmentId, navigate, user])

  if (loading) {
    return (
      <div className="pt-36 max-w-2xl mx-auto flex flex-col items-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="pt-36 max-w-2xl mx-auto flex flex-col items-center">
        <p className="text-lg text-gray-500">Assessment not found.</p>
      </div>
    )
  }

  const question = questions[current]
  const total = questions.length

  const handleAnswer = (optionId: string) => {
    setAnswers({ ...answers, [question.id ?? current]: optionId })
  }

  const handleNext = async () => {
    if (current < total - 1) {
      setCurrent(current + 1)
    } else {
      setShowResult(true)
      await handleSubmit()
    }
  }

  const handleSubmit = async () => {
    if (!attemptId) return
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/assessment/submit-practice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId,
        responses: answers,
      }),
    })
    const data = await response.json()
    setScore(data.score)
    setFeedback(data.feedback)
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

  return (
    <div>
      <div className="pt-8 max-w-2xl mx-auto flex flex-col items-center">
        <Card className="w-full mb-8">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-2">Practice Assessment</h1>
            <div className="text-sm text-gray-500 mb-2">
              Question {showResult ? total : current + 1} of {total}
            </div>
          </CardContent>
        </Card>

        {!showResult ? (
          <Card className="w-full mb-8 shadow-lg">
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{question.stem}</h2>
                <div className="flex items-center text-xs text-gray-500 space-x-4 mb-2">
                  <span>Lesson {question.lessonId}</span>
                  <span>Topic {question.topicId}</span>
                  {question.tags?.length > 0 && (
                    <div className="flex space-x-1">
                      {question.tags.map((tag: string, i: number) => (
                        <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
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
                        flex items-center px-4 py-3 rounded-lg border transition
                        text-left
                        ${isAnswered
                          ? isSelected
                            ? isCorrect
                              ? 'bg-green-50 border-green-400 text-green-900'
                              : 'bg-red-50 border-red-400 text-red-900'
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                          : 'bg-white border-gray-200 hover:bg-blue-50'}
                        ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}
                        font-medium
                      `}
                      disabled={isAnswered}
                      onClick={() => handleAnswer(opt.id)}
                    >
                      <span className="flex-1">{opt.text}</span>
                      {isAnswered && isSelected && (
                        isCorrect ? (
                          <CheckCircle2 className="ml-2 text-green-500" />
                        ) : (
                          <XCircle className="ml-2 text-red-500" />
                        )
                      )}
                    </button>
                  )
                })}
              </div>
              {answers[question.id ?? current] && (
                <>
                  <div className="mt-4 text-sm text-blue-700 bg-blue-50 rounded p-2">
                    <span className="font-semibold">Explanation: </span>
                    {
                      question.options.find(
                        (o: any) => o.id === answers[question.id ?? current]
                      )?.explanation
                    }
                  </div>
                  {!question.options.find(
                    (o: any) => o.id === answers[question.id ?? current] && o.isCorrect
                  ) && (
                    <div className="mt-4 text-sm text-red-700 bg-red-50 rounded p-2">
                      <span className="font-semibold">Solution Steps:</span>
                      <ul className="list-disc ml-6">
                        {question.solutionSteps?.map((step: string, i: number) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                      <span className="font-semibold block mt-2">Source Passages:</span>
                      <ul className="list-disc ml-6">
                        {question.sourcePassages?.map((pass: string, i: number) => (
                          <li key={i}>{pass}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-end mt-8">
                <Button
                  onClick={handleNext}
                  disabled={!answers[question.id ?? current]}
                  className="w-32"
                >
                  {current < total - 1 ? 'Next' : 'Finish'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full mb-8">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Assessment Complete!</h2>
              <p className="mb-2 text-lg">
                Your Score: <span className="font-semibold">{score ?? localScore} / {total}</span>
              </p>
              {feedback && (
                <div className="mb-4 text-sm text-blue-700 bg-blue-50 rounded p-2">
                  <span className="font-semibold">Feedback: </span>
                  {feedback}
                </div>
              )}
              <div className="mb-4 text-sm text-gray-600">
                Review your answers and try again to improve!
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleRestart}>
                  Back to Roadmap
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}