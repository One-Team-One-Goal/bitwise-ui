import React from 'react';
import { motion } from 'motion/react';
import { getLawExplanation } from '@/constants/lawExplanations';
import type { ScriptStep } from '../FactoringDemo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface StepNarrationProps {
  step: ScriptStep;
  stepNumber: number;
  totalSteps: number;
  nextStepPreview?: ScriptStep;
}

export const StepNarration: React.FC<StepNarrationProps> = ({
  step,
  stepNumber,
  totalSteps,
  nextStepPreview,
}) => {
  const law = getLawExplanation(step.law);

  if (!law) {
    return (
      <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-4 border border-border">
        <p className="text-sm text-muted-foreground">
          Step {stepNumber} of {totalSteps}: {step.description || 'Transformation applied'}
        </p>
      </div>
    );
  }

  // Generate what happened explanation
  const whatHappened = generateWhatHappened(step, law);
  const whatChanged = generateWhatChanged(step);
  const nextHint = nextStepPreview ? generateNextHint(nextStepPreview) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-primary/5 dark:bg-primary/10 rounded-none border-l-none border-none">
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{law.icon}</span>
              <div>
                <CardTitle className="text-base">
                  Step {stepNumber} of {totalSteps}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Applied {law.title}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1 bg-background dark:bg-muted/30 border-border">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span>Simplifying</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* What Happened */}
          <div className="flex items-start gap-3">
            <Badge className="w-6 h-6 rounded-full bg-primary flex items-center justify-center p-0 text-xs">
              1
            </Badge>
            <div className="flex-1 space-y-1">
              <p className="text-xs font-semibold text-primary">What happened:</p>
              <p className="text-sm text-foreground leading-relaxed">{whatHappened}</p>
            </div>
          </div>

          {/* What Changed */}
          {whatChanged && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <Badge className="w-6 h-6 rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center p-0 text-xs">
                  2
                </Badge>
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-500">What changed:</p>
                  <div className="bg-background dark:bg-muted/30 rounded-md p-3 border border-border space-y-1">
                    <div className="flex items-center gap-2 text-sm font-mono">
                      <span className="text-muted-foreground">Before:</span>
                      <code className="text-foreground">{step.before.raw}</code>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-mono">
                      <span className="text-emerald-600 dark:text-emerald-500">After:</span>
                      <code className="text-emerald-600 dark:text-emerald-500 font-semibold">{step.after.raw}</code>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Next Step Preview */}
          {nextHint && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-base">→</span>
                <span className="font-semibold">Coming next:</span>
                <span>{nextHint}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Helper functions to generate contextual narration

function generateWhatHappened(_step: ScriptStep, law: any): string {
  const templates: Record<string, string> = {
    identity: `Removed identity elements (T or F) that don't affect the result.`,
    negation: `Found a variable AND its negation, which creates a contradiction (F) or tautology (T).`,
    doubleNegation: `Cancelled out double negation - two NOTs make a positive.`,
    negationsOfTF: `Simplified the negation of a constant (T or F).`,
    universalBound: `Applied universal bound - the constant (T or F) dominates the entire expression.`,
    associative: `Flattened nested operations of the same type (removed unnecessary grouping).`,
    commutative: `Reordered terms alphabetically for standardization.`,
    idempotent: `Removed duplicate identical terms.`,
    absorption: `One term absorbed another redundant term.`,
    deMorgans: `Applied De Morgan's Law - pushed NOT inside parentheses and flipped the operator.`,
    distributive: `Distributed one operator over another (or factored out common terms).`,
  };

  return templates[law.id] || `Applied ${law.title} to simplify the expression.`;
}

function generateWhatChanged(step: ScriptStep): string | null {
  const beforeTokens = step.before.tokens.length;
  const afterTokens = step.after.tokens.length;
  
  if (beforeTokens === afterTokens) {
    return null; // Restructuring, not reduction
  }
  
  if (beforeTokens > afterTokens) {
    const diff = beforeTokens - afterTokens;
    return `Reduced from ${beforeTokens} to ${afterTokens} tokens (removed ${diff})`;
  }
  
  return null;
}

function generateNextHint(nextStep: ScriptStep): string | null {
  const nextLaw = getLawExplanation(nextStep.law);
  if (!nextLaw) return null;

  const hints: Record<string, string> = {
    identity: `we'll remove unnecessary T/F values`,
    negation: `we'll resolve contradictions to simpler forms`,
    doubleNegation: `we'll eliminate double negations`,
    negationsOfTF: `we'll simplify constant negations`,
    universalBound: `we'll apply constant domination`,
    associative: `we'll flatten the structure`,
    commutative: `we'll reorder for clarity`,
    idempotent: `we'll remove duplicates`,
    absorption: `we'll eliminate redundant terms`,
    deMorgans: `we'll distribute negations`,
    distributive: `we'll restructure using distribution`,
  };

  return hints[nextLaw.id] || `we'll apply ${nextLaw.title}`;
}

export default StepNarration;
