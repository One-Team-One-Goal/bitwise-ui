import React from 'react';
import { motion } from 'framer-motion';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { LawBadge } from './RuleCard';
import type { ScriptStep } from '../FactoringDemo';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface ProgressTimelineProps {
  steps: ScriptStep[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
  originalExpression: string;
  onNavigate?: (direction: 'first' | 'prev' | 'next' | 'last') => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;
}

export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  steps,
  currentStepIndex,
  onStepClick,
  originalExpression,
  onNavigate,
  canGoPrev = true,
  canGoNext = true,
}) => {
  const progressPercentage = steps.length > 0 ? (currentStepIndex / steps.length) * 100 : 0;

  return (
    <Card className="p-6">
      {/* Container with centered alignment */}
      <div className="flex flex-col items-center justify-center gap-6">

        {/* Timeline - Centered */}
        <div className="w-full flex justify-center overflow-visible">
          <ScrollArea className="max-w-full">
            <div className="flex items-center justify-center gap-3 px-4 py-6">
              {/* Start node */}
              <div className="flex flex-col items-center">
                <Badge
                  variant={currentStepIndex === 0 ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 transition-all ${
                    currentStepIndex === 0
                      ? 'shadow-lg scale-110 bg-blue-500'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => onStepClick(0)}
                  title={originalExpression}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="text-xs font-bold">START</div>
                  </div>
                </Badge>
              </div>

              {/* Arrow */}
              <div className="flex items-center">
                <div className="w-6 h-0.5 bg-gray-300"></div>
                <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[6px] border-transparent border-l-gray-300"></div>
              </div>

              {/* Step nodes */}
              {steps.map((step, index) => {
                const stepNum = index + 1;
                const isActive = currentStepIndex === stepNum;
                const isPast = currentStepIndex > stepNum;
                const isFuture = currentStepIndex < stepNum;

                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      {/* Law badge */}
                      <motion.button
                        onClick={() => onStepClick(stepNum)}
                        className={`relative transition-all ${
                          isActive
                            ? 'scale-110 z-10'
                            : isPast
                            ? 'scale-100 opacity-80 hover:opacity-100'
                            : 'scale-95 opacity-60 hover:opacity-80'
                        }`}
                        whileHover={{ scale: isActive ? 1.1 : 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={`Step ${stepNum}: ${step.law}`}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            className="absolute -inset-2 bg-blue-400 rounded-lg opacity-25"
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0.25, 0.4, 0.25],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                        )}

                        {/* Badge */}
                        <div className="relative">
                          <LawBadge lawId={step.law} size="md" />
                          
                          {/* Step number */}
                          <div
                            className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                              isActive
                                ? 'bg-blue-500 text-white'
                                : isPast
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-400 text-white'
                            }`}
                          >
                            {stepNum}
                          </div>

                          {/* Checkmark for completed */}
                          {isPast && (
                            <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </motion.button>
                    </div>

                    {/* Arrow to next step */}
                    {index < steps.length - 1 && (
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-0.5 ${
                            isPast ? 'bg-emerald-400' : isFuture ? 'bg-gray-200' : 'bg-blue-400'
                          }`}
                        ></div>
                        <div
                          className={`w-0 h-0 border-t-[3px] border-b-[3px] border-l-[6px] border-transparent ${
                            isPast ? 'border-l-emerald-400' : isFuture ? 'border-l-gray-200' : 'border-l-blue-400'
                          }`}
                        ></div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Final arrow */}
              {steps.length > 0 && (
                <>
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-0.5 ${
                        currentStepIndex === steps.length ? 'bg-emerald-400' : 'bg-gray-200'
                      }`}
                    ></div>
                    <div
                      className={`w-0 h-0 border-t-[3px] border-b-[3px] border-l-[6px] border-transparent ${
                        currentStepIndex === steps.length ? 'border-l-emerald-400' : 'border-l-gray-200'
                    }`}
                  ></div>
                </div>

                {/* Final result node */}
                <div className="flex flex-col items-center">
                  <Badge
                    variant={currentStepIndex === steps.length ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 transition-all ${
                      currentStepIndex === steps.length
                        ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg scale-110'
                        : 'hover:bg-accent opacity-80'
                    }`}
                    onClick={() => onStepClick(steps.length)}
                    title="Final simplified result"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="text-xs font-bold">FINAL</div>
                    </div>
                  </Badge>
                </div>
              </>
            )}
            </div>
          </ScrollArea>
        </div>

        {/* Navigation Controls - Centered */}
        <div className="flex flex-col items-center justify-center gap-4 pt-4 border-t">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('first')}
              disabled={!canGoPrev || currentStepIndex === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('prev')}
              disabled={!canGoPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onNavigate?.('next')}
              disabled={!canGoNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('last')}
              disabled={!canGoNext || currentStepIndex === steps.length}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-lg flex items-center justify-center gap-3">
            <Progress 
              value={progressPercentage} 
              className="flex-1 h-2"
            />
            <Badge variant="outline" className="text-xs font-semibold min-w-max px-3 py-1">
              {currentStepIndex} / {steps.length}
            </Badge>
          </div>
        </div>

      </div>
    </Card>
  );
};

export default ProgressTimeline;
