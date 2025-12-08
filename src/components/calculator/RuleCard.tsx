import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  getLawExplanation,
  getLawCategoryColor,
} from '@/constants/lawExplanations'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RuleCardProps {
  lawId: string
  isVisible: boolean
  beforeExpression?: string
  afterExpression?: string
  compact?: boolean
}

export const RuleCard: React.FC<RuleCardProps> = ({
  lawId,
  isVisible,
  beforeExpression,
  afterExpression,
  compact = false,
}) => {
  const law = getLawExplanation(lawId)

  if (!law) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Card className="shadow-md border-border/60 bg-card/95 backdrop-blur-sm gap-0">
            {/* Header */}
            <CardHeader className="space-y-2 pb-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{law.icon}</span>
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold leading-tight">
                    {law.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    {law.category}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Current Application */}
              {beforeExpression && afterExpression && (
                <div className="space-y-2.5">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Transformation
                  </p>
                  <div className="space-y-2">
                    <code className="block text-sm font-mono text-foreground bg-muted/60 px-3 py-2 rounded-md border border-border/40">
                      {beforeExpression}
                    </code>
                    <div className="flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">↓</span>
                    </div>
                    <code className="block text-sm font-mono text-foreground bg-primary/5 px-3 py-2 rounded-md border border-primary/30 border-l-2">
                      {afterExpression}
                    </code>
                  </div>
                </div>
              )}

              {/* Description */}
              {!compact && law.description && (
                <div className="pt-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {law.description}
                  </p>
                </div>
              )}

              {/* Pattern Examples */}
              {law.patterns && law.patterns.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Pattern
                  </p>
                  <div className="space-y-2">
                    {law.patterns
                      .slice(0, compact ? 1 : 2)
                      .map((pattern, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 text-sm bg-muted/30 px-3 py-2 rounded-md"
                        >
                          <code className="font-mono text-muted-foreground">
                            {pattern.before}
                          </code>
                          <span className="text-muted-foreground">→</span>
                          <code className="font-mono text-foreground font-medium">
                            {pattern.after}
                          </code>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Compact version for inline display
export const RuleCardInline: React.FC<{ lawId: string }> = ({ lawId }) => {
  const law = getLawExplanation(lawId)

  if (!law) return null

  const categoryColor = getLawCategoryColor(law.category)

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-2 px-3 py-1.5 border-2 ${categoryColor} text-sm font-medium`}
    >
      <span className="text-base">{law.icon}</span>
      <span>{law.shortName}</span>
      <span className="opacity-60">•</span>
      <span className="text-xs opacity-80">{law.title}</span>
    </Badge>
  )
}

// Law badge for timeline
export const LawBadge: React.FC<{
  lawId: string
  size?: 'sm' | 'md' | 'lg'
}> = ({ lawId, size = 'md' }) => {
  const law = getLawExplanation(lawId)

  if (!law) return null

  const categoryColor = getLawCategoryColor(law.category)

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center border ${categoryColor} font-semibold ${sizeClasses[size]}`}
      title={law.title}
    >
      <span>{law.title}</span>
    </Badge>
  )
}

export default RuleCard
