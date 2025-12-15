import { createFileRoute } from '@tanstack/react-router'
import TruthTable from '@/tools/karnaughMap/truthTable/TruthTable'
import SettingsCard from '@/tools/karnaughMap/settings/SettingsCard'
import { useKMaps } from '@/hooks/useKMaps'
import Map from '@/components/kmap/Map'
import { TooltipProvider } from '@/components/ui/tooltip'

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

  return (
    <TooltipProvider>
      <div className="relative">
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

        {/* Content Section - keep original structure, stack nicely on mobile */}
        <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:justify-center lg:items-start lg:gap-8 lg:flex-wrap">
          {/* Truth Table Section */}
          <div className="w-full px-3 sm:px-0 sm:max-w-sm mx-auto mt-4 truth-table lg:mx-0 lg:flex-1 lg:max-w-sm">
            <TruthTable
              variables={variables}
              truthTable={truthTable}
              onTruthTableChange={handleTruthTableChange}
              variableCount={variableCount}
            />
          </div>

          {/* Karnaugh Map Section */}
          <div className="w-full space-y-4 mt-4 p-2 sm:p-4 kmap-container lg:w-auto">
            <div className="w-full overflow-x-auto">
              <div className="min-w-max w-full flex justify-center">
                <Map
                  squares={squares}
                  groups={solution?.groups || []}
                  variableCount={variableCount}
                  onCellClick={handleCellClick}
                  formType={formType}
                />
              </div>
            </div>

            {/* Solution Display */}
            {solution && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 w-full solution-display">
                <p className="font-semibold mb-2 text-sm text-muted-foreground">
                  {formType} Solution:
                </p>
                <div className="font-mono text-lg mb-2 border rounded-sm pl-2 p-1 overflow-x-auto whitespace-nowrap w-full">
                  {solution.expression}
                </div>
                <div className="flex mt-2 gap-x-12 gap-y-2 flex-wrap">
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
          <div className="w-full px-3 sm:px-0 sm:max-w-sm mx-auto settings-panel lg:mx-0 lg:flex-1 lg:max-w-sm">
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
