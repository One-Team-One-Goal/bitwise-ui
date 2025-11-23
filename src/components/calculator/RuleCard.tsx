import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getLawExplanation, getLawCategoryColor } from '@/constants/lawExplanations';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface RuleCardProps {
  lawId: string;
  isVisible: boolean;
  beforeExpression?: string;
  afterExpression?: string;
  compact?: boolean;
}

export const RuleCard: React.FC<RuleCardProps> = ({
  lawId,
  isVisible,
  beforeExpression,
  afterExpression,
  compact = false,
}) => {
  const law = getLawExplanation(lawId);

  if (!law) return null;

  const categoryColor = getLawCategoryColor(law.category);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute top-4 right-4 max-w-md z-10"
        >
          <Card className={`shadow-lg ${compact ? 'max-w-sm' : ''}`}>
            {/* Header */}
            <CardHeader className={`border-b-2 ${categoryColor}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{law.icon}</span>
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-lg">{law.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {law.shortName} • {law.category}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-0 p-0">
              {/* Current Application (if provided) - MOST IMPORTANT */}
              {beforeExpression && afterExpression && (
                <div className="px-6 py-4 bg-primary/10 dark:bg-primary/20">
                  <p className="text-xs font-semibold text-primary mb-3">Applied to Your Expression:</p>
                  <div className="space-y-2">
                    <code className="block font-mono text-sm text-foreground bg-background dark:bg-muted/30 px-3 py-2 rounded border border-border">
                      {beforeExpression}
                    </code>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-primary">↓</span>
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                        {law.title}
                      </Badge>
                    </div>
                    <code className="block font-mono text-sm text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 dark:bg-emerald-500/20 px-3 py-2 rounded border border-emerald-500/30 dark:border-emerald-500/40">
                      {afterExpression}
                    </code>
                  </div>
                </div>
              )}

              {/* Description - Simple Explanation */}
              {!compact && (
                <>
                  <Separator />
                  <div className="px-6 py-4 bg-muted/30 dark:bg-muted/20">
                    <p className="text-sm text-foreground leading-relaxed">
                      {law.description}
                    </p>
                  </div>
                </>
              )}

              {/* Pattern Section - Reference */}
              <Separator />
              <div className="px-6 py-4"
>
                <p className="text-xs font-semibold text-muted-foreground mb-3">General Pattern:</p>
                <div className="space-y-2">
                  {law.patterns.slice(0, compact ? 2 : 4).map((pattern, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <code className="font-mono text-primary bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded">
                        {pattern.before}
                      </code>
                      <span className="text-muted-foreground">→</span>
                      <code className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-1 rounded">
                        {pattern.after}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Compact version for inline display
export const RuleCardInline: React.FC<{ lawId: string }> = ({ lawId }) => {
  const law = getLawExplanation(lawId);
  
  if (!law) return null;

  const categoryColor = getLawCategoryColor(law.category);

  return (
    <Badge variant="outline" className={`inline-flex items-center gap-2 px-3 py-1.5 border-2 ${categoryColor} text-sm font-medium`}>
      <span className="text-base">{law.icon}</span>
      <span>{law.shortName}</span>
      <span className="opacity-60">•</span>
      <span className="text-xs opacity-80">{law.title}</span>
    </Badge>
  );
};

// Law badge for timeline
export const LawBadge: React.FC<{ lawId: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  lawId, 
  size = 'md' 
}) => {
  const law = getLawExplanation(lawId);
  
  if (!law) return null;

  const categoryColor = getLawCategoryColor(law.category);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <Badge 
      variant="outline"
      className={`inline-flex items-center border ${categoryColor} font-semibold ${sizeClasses[size]}`}
      title={law.title}
    >
      <span>{law.title}</span>
    </Badge>
  );
};

export default RuleCard;
