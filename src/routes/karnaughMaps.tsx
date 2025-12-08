import { createFileRoute } from '@tanstack/react-router'
import TruthTable from '@/tools/karnaughMap/truthTable/TruthTable'
import SettingsCard from '@/tools/karnaughMap/settings/SettingsCard'
import { useKMaps } from '@/hooks/useKMaps'
import Map from '@/components/kmap/Map'
import { TooltipProvider } from '@/components/ui/tooltip'
import introJs from 'intro.js'
import 'intro.js/introjs.css'
import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/karnaughMaps')({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    // State
    variables,
    variableCount,
    formType,
    squares,
    truthTable,
    solution,
    isLoading,
    // Handlers
    handleVariableCountChange,
    handleFormTypeChange,
    handleCellClick,
    handleTruthTableChange,
    handleSetAllCells,
    handleExpressionApply,
  } = useKMaps()

  // Start the intro.js tutorial
  const startTutorial = () => {
    const intro = introJs()
    intro.setOptions({
      steps: [
        {
          title: '👋 Welcome to Karnaugh Map Solver!',
          intro:
            'This interactive tool helps you visualize and simplify Boolean expressions using Karnaugh Maps. Let me show you around!',
        },
        {
          element: '.truth-table',
          title: '📊 Truth Table',
          intro:
            "This truth table shows all possible input combinations and their outputs. Click any output cell to toggle between 0, 1, or X (don't care).",
          position: 'right',
        },
        {
          element: '.kmap-container',
          title: '🗺️ Karnaugh Map',
          intro:
            'The K-Map visualizes your truth table in a special arrangement. Click cells to toggle values. Groups of 1s (or 0s) are automatically detected and highlighted!',
          position: 'left',
        },
        {
          element: '.solution-display',
          title: '✨ Solution',
          intro:
            'The simplified Boolean expression appears here, along with the literal cost (number of literals) and group count. The tool automatically finds the optimal groupings!',
          position: 'top',
        },
        {
          element: '.settings-panel',
          title: '⚙️ Settings',
          intro:
            'Change the number of variables (2-5), switch between SOP (Sum of Products) and POS (Product of Sums), or quickly fill all cells with a value.',
          position: 'left',
        },
        {
          title: '🎓 Ready to Simplify!',
          intro:
            "You're all set! Try clicking cells in the truth table or K-Map to set values, then watch the solution update automatically. Happy simplifying!",
        },
      ],
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: false,
      doneLabel: 'Got it!',
      nextLabel: 'Next',
      prevLabel: 'Back',
      skipLabel: 'Skip',
    })
    intro.start()
  }

  return (
    <TooltipProvider>
      <div className="relative">
        {/* Floating Action Buttons - Top Right */}
        <div className="fixed top-20 right-4 z-50 flex gap-2">
          {/* Help Button */}
          <Button
            type="button"
            onClick={startTutorial}
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl hover:bg-primary/10 hover:border-primary transition-all bg-background dark:bg-gray-800 border-2 cursor-pointer"
            title="Show Tutorial"
          >
            <HelpCircle className="h-5 w-5 text-primary" />
          </Button>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mb-4 p-4 bg-primary/10 border border-primary/30 text-primary rounded-lg dark:bg-primary/20">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Processing...
            </div>
          </div>
        )}

        {/* Title Section */}
        <div className="mb-6 mt-30">
          <p className="font-semibold text-center text-3xl">
            Karnaugh Map Solver
          </p>
        </div>

        {/* Content Section - Horizontal layout */}
        <div className="flex justify-center items-start gap-8 flex-wrap">
          {/* Truth Table Section */}
          <div className="flex-1 max-w-sm mt-4 truth-table">
            <TruthTable
              variables={variables}
              truthTable={truthTable}
              onTruthTableChange={handleTruthTableChange}
            />
          </div>

          {/* Karnaugh Map Section */}
          <div className="space-y-4 mt-4 p-4 kmap-container">
            <Map
              squares={squares}
              groups={solution?.groups || []}
              variableCount={variableCount}
              onCellClick={handleCellClick}
              formType={formType}
            />

            {/* Solution Display */}
            {solution && (
              <div className="mt-6 p-4 min-w-[320px] max-w-[500px] w-full solution-display">
                <p className="font-semibold mb-2 text-sm text-muted-foreground">
                  {formType} Solution:
                </p>
                <div className="font-mono text-lg mb-2 border rounded-sm p-2 overflow-x-auto overflow-y-auto max-h-[150px] wrap-break-word whitespace-pre-wrap">
                  {solution.expression}
                </div>
                <div className="flex mt-2 gap-12">
                  <div className="text-sm text-muted-foreground">
                    Literal Cost: {solution.literalCost}
                  </div>
                  {solution.groups.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Groups: {solution.groups.length}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings Section */}
          <div className="flex-1 max-w-sm settings-panel">
            <SettingsCard
              variableCount={variableCount}
              formType={formType}
              onVariableCountChange={handleVariableCountChange}
              onFormTypeChange={(type: string) =>
                handleFormTypeChange(type as 'SOP' | 'POS')
              }
              onSetAllCells={(value: number | string) => {
                if (typeof value === 'string' && value !== 'X') {
                  handleSetAllCells(parseInt(value) as 0 | 1)
                } else {
                  handleSetAllCells(value as any)
                }
              }}
              onApplyExpression={handleExpressionApply}
              isProcessing={isLoading}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
