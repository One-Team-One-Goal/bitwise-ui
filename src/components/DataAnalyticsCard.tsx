import { Card, CardContent } from '@/components/ui/card'

// Mock analytics data
const mockAnalytics = {
  progress: 65, // percent
  attempts: 3,
  averageScore: 72,
  weakTopics: [
    { name: 'Boolean Laws', percent: 40 },
    { name: 'Karnaugh Maps', percent: 55 },
  ],
}

export default function DataAnalyticsCard({ /*lesson,*/ user }: { lesson: any; user: any }) {
  return (
    <Card className="p-6">
      <CardContent className="p-0 space-y-2">
        <h3 className="text-lg font-semibold mb-2">Your Progress & Weak Points</h3>
        {!user ? (
          <div className="text-xs text-muted-foreground">Login to see your analytics for this lesson.</div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">Progress:</span>
              <span className="font-bold">{mockAnalytics.progress}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Attempts:</span>
              <span className="font-bold">{mockAnalytics.attempts}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Average Score:</span>
              <span className="font-bold">{mockAnalytics.averageScore}%</span>
            </div>
            <div>
              <span className="text-sm">Weak Topics:</span>
              <ul className="ml-4 list-disc">
                {mockAnalytics.weakTopics.map((t) => (
                  <li key={t.name} className="text-xs">
                    {t.name} (<span className="text-red-500">{t.percent}%</span> correct)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}