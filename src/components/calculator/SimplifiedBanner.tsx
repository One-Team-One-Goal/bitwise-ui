import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';

interface SimplifiedBannerProps {
  expression: string;
  isVisible: boolean;
}

export const SimplifiedBanner: React.FC<SimplifiedBannerProps> = ({
  expression,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mb-4"
    >
      <div className="flex items-start gap-3">
        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
            Already in Simplest Form
          </h4>
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            The expression{' '}
            <code 
              className="bg-emerald-100 dark:bg-emerald-800/50 px-2 py-0.5 rounded font-mono"
              style={{ fontFamily: "'JetBrains Mono', 'Segoe UI Symbol', 'Apple Symbols', monospace" }}
            >
              {expression}
            </code>{' '}
            cannot be simplified further using Boolean algebra laws.
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-2">
            This is the most reduced form of your expression.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
