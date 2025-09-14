import { createFileRoute } from "@tanstack/react-router"
import TruthTable from "@/tools/karnaughMap/truthTable/TruthTable"
import SettingsCard from "@/tools/karnaughMap/settings/SettingsCard"
import { useKMaps } from "@/hooks/useKMaps"
import { Map } from "@/tools/karnaughMap/kMap/Map"

export const Route = createFileRoute("/karnaughMaps")({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    // Original state
    variables,
    variableCount,
    formType,
    // New K-Map state  
    squares,
    solution,
    isLoading,
    error,
    // Original handlers
    handleVariableCountChange,
    handleFormTypeChange,
    // New handlers
    handleCellClick,
    handleSetAllCells,
    handleSolve,
    clearError
  } = useKMaps();

  return (
    <div>
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="ml-4 text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        </div>
      )}

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
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-center">Karnaugh Map Solver</h1>
      </div>
      
      {/* Content Section - Horizontal layout */}
      <div className="flex justify-center items-start gap-42 flex-wrap">

        {/* Truth Table Section */}
        <div className="flex-1 max-w-sm">
          <h3 className="text-lg font-semibold mb-4 text-center">Truth Table</h3>
          <TruthTable 
            variables={variables}
          />
        </div>

        {/* Karnaugh Map Section */}
        <div className="space-y-4 mt-20 p-4">
          <h3 className="text-xl font-semibold mb-6 text-center flex items-center justify-center gap-2">
            Karnaugh Map
          </h3>
          <Map
            squares={squares as any} // Temporary type assertion - we'll fix the Map component later
            typeMap={variableCount}
            onClick={handleCellClick}
          />
          
          {/* Solution Display */}
          {solution && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                {formType} Solution:
              </h4>
              <div className="font-mono text-lg mb-2">{solution.expression}</div>
              <div className="text-sm text-green-600">
                Literal Cost: {solution.literalCost}
              </div>
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className="flex-1 max-w-sm">
          <div className="h-[1.5rem] mb-5"></div>
          <SettingsCard
            variableCount={variableCount}
            formType={formType}
            onVariableCountChange={handleVariableCountChange}
            onFormTypeChange={(type: string) => handleFormTypeChange(type as 'SOP' | 'POS')}
            onSetAllCells={(value: number | string) => {
              if (typeof value === 'string' && value !== 'X') {
                handleSetAllCells(parseInt(value) as 0 | 1);
              } else {
                handleSetAllCells(value as number | 'X');
              }
            }}
            onProcess={() => handleSolve(false)}
          />
        </div>

      </div>
    </div>
  )
}

