import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain } from 'lucide-react'

interface AdaptivePracticeCardProps {
  recommendedDifficulty: string | null
  loadingAssessment: boolean
  onStartAssessment: () => void
}

export function AdaptivePracticeCard({
  recommendedDifficulty,
  loadingAssessment,
  onStartAssessment,
}: AdaptivePracticeCardProps) {
  return (
    <div className="bg-linear-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white relative overflow-hidden shadow-lg group">
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-none"
            >
              <Brain className="w-3 h-3 mr-1" /> AI Powered
            </Badge>
          </div>
          <h2 className="text-xl font-semibold mb-2">Adaptive AI Practice</h2>
          <p className="text-blue-100 max-w-md">
            Master Boolean Algebra with personalized questions that adapt to
            your skill level in real-time.
          </p>
        </div>

        <div className="mt-8 flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-sm text-blue-100">Recommended Difficulty</p>
            <p className="font-semibold text-lg capitalize">
              {recommendedDifficulty ?? 'Calibrating...'}
            </p>
          </div>
          <Button
            onClick={onStartAssessment}
            disabled={loadingAssessment}
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
          >
            {loadingAssessment ? 'Loading...' : 'Continue'}
          </Button>
        </div>
      </div>

      {/* Background Decorations */}
      <Brain className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
    </div>
  )
}
