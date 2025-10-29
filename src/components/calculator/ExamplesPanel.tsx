import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CALCULATOR_EXAMPLES, 
  getDifficultyColor,
  getDifficultyIcon,
  type CalculatorExample 
} from '@/constants/calculatorExamples';
import { Button } from '../ui/button';

interface ExamplesPanelProps {
  onSelectExample: (expression: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ExamplesPanel: React.FC<ExamplesPanelProps> = ({
  onSelectExample,
  isOpen,
  onClose,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | CalculatorExample['difficulty']>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | CalculatorExample['category']>('all');

  const filteredExamples = CALCULATOR_EXAMPLES.filter(ex => {
    const matchesDifficulty = selectedDifficulty === 'all' || ex.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    return matchesDifficulty && matchesCategory;
  });

  const handleSelectExample = (example: CalculatorExample) => {
    onSelectExample(example.expression);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">Challenge Examples</h2>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-blue-100">
                Can't think of an expression? Try these pre-built challenges!
              </p>
            </div>

            {/* Filters */}
            <div className="border-b bg-gray-50 p-4 space-y-3">
              {/* Difficulty Filter */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  DIFFICULTY
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'beginner', 'intermediate', 'advanced', 'expert'] as const).map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedDifficulty === diff
                          ? 'bg-blue-600 text-white shadow-md scale-105'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {diff === 'all' ? 'All Levels' : `${getDifficultyIcon(diff)} ${diff.charAt(0).toUpperCase() + diff.slice(1)}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  CATEGORY
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'simplification', 'distribution', 'logic', 'advanced'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-purple-600 text-white shadow-md scale-105'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results count */}
              <div className="text-xs text-gray-600 pt-2 border-t">
                Showing <span className="font-semibold text-blue-600">{filteredExamples.length}</span> examples
              </div>
            </div>

            {/* Examples List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredExamples.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <div className="text-6xl mb-4">∅</div>
                  <p>No examples match your filters</p>
                </div>
              ) : (
                filteredExamples.map(example => (
                  <ExampleCard
                    key={example.id}
                    example={example}
                    onSelect={() => handleSelectExample(example)}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Individual Example Card
const ExampleCard: React.FC<{
  example: CalculatorExample;
  onSelect: () => void;
}> = ({ example, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const difficultyColor = getDifficultyColor(example.difficulty);
  const difficultyIcon = getDifficultyIcon(example.difficulty);

  return (
    <motion.div
      layout
      className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border ${difficultyColor}`}>
                {difficultyIcon} {example.difficulty.toUpperCase()}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                ~{example.estimatedSteps} steps
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{example.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{example.description}</p>
          </div>
        </div>

        {/* Expression Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
          <div className="text-xs text-gray-500 mb-1 font-semibold">EXPRESSION:</div>
          <div className="font-mono text-base text-gray-800 break-all">
            {example.expression}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onSelect}
            className="flex-1"
            variant="default"
          >
            Try This Challenge
          </Button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            {expanded ? '▲' : '▼'} Info
          </button>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t space-y-3">
                {/* Learning Focus */}
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">LEARNING FOCUS:</div>
                  <div className="text-sm text-gray-700">{example.learningFocus}</div>
                </div>

                {/* Laws Used */}
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">LAWS USED:</div>
                  <div className="flex flex-wrap gap-1">
                    {example.lawsUsed.map(law => (
                      <span
                        key={law}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded border border-blue-200"
                      >
                        {law}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {example.tags.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">TAGS:</div>
                    <div className="flex flex-wrap gap-1">
                      {example.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ExamplesPanel;
