import { useMemo } from 'react'
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface LessonMasteryRadarProps {
  analytics: {
    skillsByLesson?: Array<{
      lessonId: number
      lessonTitle: string
      skills: Array<{ mastery: number }>
    }>
  } | null
  compact?: boolean
}

const lessonShortNames: Record<number, string> = {
  1: 'Intro',
  2: 'Logic',
  3: 'Truth',
  4: 'Simplify',
}

const chartConfig = {
  mastery: {
    label: 'Mastery(%)',
    
  },
} satisfies ChartConfig

export function LessonMasteryRadar({ analytics }: LessonMasteryRadarProps) {
  // Prepare data for radar chart - all 4 lessons
  const radarData = useMemo(() => {
    const lessons = [1, 2, 3, 4]
    return lessons.map((lessonId) => {
      const lessonData = analytics?.skillsByLesson?.find(
        (l) => l.lessonId === lessonId
      )
      const mastery = lessonData?.skills?.length
        ? lessonData.skills.reduce((sum, s) => sum + s.mastery, 0) /
          lessonData.skills.length
        : 0
      return {
        lesson: lessonShortNames[lessonId],
        mastery: Math.round(mastery * 100),
      }
    })
  }, [analytics])


  return (
    <div className="w-full h-[240px] relative">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <defs>
              <radialGradient id="layer1">
                <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.05" />
              </radialGradient>
              <radialGradient id="layer2">
                <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.05" />
              </radialGradient>
              <radialGradient id="layer3">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.08" />
              </radialGradient>
              <radialGradient id="layer4">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.10" />
              </radialGradient>
              <radialGradient id="layer5">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.12" />
              </radialGradient>
            </defs>
            
            {/* Circular background fills */}
            <circle cx="50%" cy="50%" r="40%" fill="url(#layer5)" />
            <circle cx="50%" cy="50%" r="32%" fill="url(#layer4)" />
            <circle cx="50%" cy="50%" r="24%" fill="url(#layer3)" />
            <circle cx="50%" cy="50%" r="16%" fill="url(#layer2)" />
            <circle cx="50%" cy="50%" r="8%" fill="url(#layer1)" />
            
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            
     
            <PolarGrid
              gridType="circle"
            stroke="#0000FF"
              strokeOpacity={0.1}
            />
            <PolarAngleAxis 
              dataKey="lesson"
              tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 400}}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              stroke="#8b5cf6"
              strokeOpacity={0.3}
            />
  
            <Radar
              dataKey="mastery"
              fill="#8b5cf6"
              fillOpacity={0.5}
              stroke="#8b5cf6"
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}