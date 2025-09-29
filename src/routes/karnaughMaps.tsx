import { createFileRoute } from "@tanstack/react-router"
import TruthTable from "@/tools/karnaughMap/truthTable/TruthTable"
import SettingsCard from "@/tools/karnaughMap/settings/SettingsCard"
import { useKMaps } from "@/hooks/useKMaps"
import Map from "@/components/kmap/Map"

export const Route = createFileRoute("/karnaughMaps")({
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
  } = useKMaps();

  return (
    <div>
      {/* Loading Indicator */}
      {isLoading && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            Processing...
          </div>
        </div>
      )}

      {/* Title Section */}
      <div className="mb-4 mt-8">
        <p className="font-semibold text-center text-3xl">Karnaugh Map Solver</p>
      </div>
      
      {/* Content Section - Horizontal layout */}
      <div className="flex justify-center items-start gap-42 flex-wrap">

        {/* Truth Table Section */}
        <div className="flex-1 max-w-sm mt-4">
          <TruthTable 
            variables={variables}
            truthTable={truthTable}
            onTruthTableChange={handleTruthTableChange}
          />
        </div>

        {/* Karnaugh Map Section */}
        <div className="space-y-4 mt-20 p-4">
          <Map
            squares={squares}
            groups={solution?.groups || []}
            variableCount={variableCount}
            onCellClick={handleCellClick}
          />
          
          {/* Solution Display */}
          {solution && (
            <div className="mt-6 p-4 min-w-[320px] w-full ">
              <p className="font-semibold mb-2 text-sm text-muted-foreground">
                {formType} Solution:
              </p>
              <div className="font-mono text-lg mb-2 border rounded-sm pl-2 p-1">{solution.expression}</div>
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
        <div className="flex-1 max-w-sm">
          <SettingsCard
            variableCount={variableCount}
            formType={formType}
            onVariableCountChange={handleVariableCountChange}
            onFormTypeChange={(type: string) => handleFormTypeChange(type as 'SOP' | 'POS')}
            onSetAllCells={(value: number | string) => {
              if (typeof value === 'string' && value !== 'X') {
                handleSetAllCells(parseInt(value) as 0 | 1);
              } else {
                handleSetAllCells(value as any);
              }
            }}
            onProcess={() => {}} // Auto-solving enabled, no manual process needed
          />
        </div>

      </div>
    </div>
  )
}

