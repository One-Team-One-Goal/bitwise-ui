import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import TruthTable from "@/tools/karnaughMap/truthTable/TruthTable"
import SettingsCard from "@/tools/karnaughMap/settings/SettingsCard"
import { useKMaps } from "@/hooks/useKMaps"
import Map from "@/components/kmap/Map"
import { KMapHelpGuide } from "@/tools/karnaughMap/KMapHelpGuide"
import { TooltipProvider } from "@/components/ui/tooltip"

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

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Quick set values: 0, 1, X keys
      if (selectedCell && ['0', '1', 'x', 'X'].includes(e.key)) {
        const row = selectedCell.row;
        const col = selectedCell.col;
        handleCellClick(row, col);
        e.preventDefault();
      }

      // Arrow navigation
      if (selectedCell && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const { row, col } = selectedCell;
        const dims = variableCount === 5 ? 4 : variableCount === 4 ? 4 : variableCount === 3 ? 4 : 2;
        const rows = variableCount === 3 ? 2 : variableCount === 5 ? 4 : variableCount === 4 ? 4 : 2;
        const cols = dims;

        let newRow = row;
        let newCol = col;

        switch (e.key) {
          case 'ArrowUp':
            newRow = row > 0 ? row - 1 : rows - 1;
            break;
          case 'ArrowDown':
            newRow = row < rows - 1 ? row + 1 : 0;
            break;
          case 'ArrowLeft':
            newCol = col > 0 ? col - 1 : cols - 1;
            break;
          case 'ArrowRight':
            newCol = col < cols - 1 ? col + 1 : 0;
            break;
        }

        setSelectedCell({ row: newRow, col: newCol });
        e.preventDefault();
      }

      // Space to toggle
      if (selectedCell && e.key === ' ') {
        handleCellClick(selectedCell.row, selectedCell.col);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedCell, variableCount, handleCellClick]);

  return (
    <TooltipProvider>
      <div className="relative">
        {/* Help Buttons - Top Right */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
            className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            title="Keyboard shortcuts"
          >
            ⌨️
          </button>
          <KMapHelpGuide />
        </div>

        {/* Keyboard Shortcuts Help */}
        {showKeyboardHelp && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowKeyboardHelp(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">⌨️ Keyboard Shortcuts</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Click cell to select</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Click</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Navigate K-Map</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">↑</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">↓</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">←</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">→</kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Toggle cell value</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Space</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Set value</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">0</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">1</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">X</kbd>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="mt-6 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                Got it!
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
        <div className="mb-4 mt-8">
          <p className="font-semibold text-center text-3xl">Karnaugh Map Solver</p>
        </div>
      
      {/* Content Section - Horizontal layout */}
      <div className="flex justify-center items-start gap-42 flex-wrap">

        {/* Truth Table Section */}
        <div className="flex-1 max-w-sm mt-4" data-tour="truth-table">
          <TruthTable 
            variables={variables}
            truthTable={truthTable}
            onTruthTableChange={handleTruthTableChange}
          />
        </div>

        {/* Karnaugh Map Section */}
        <div className="space-y-4 mt-20 p-4" data-tour="kmap">
          <Map
            squares={squares}
            groups={solution?.groups || []}
            variableCount={variableCount}
            onCellClick={handleCellClick}
          />
          
          {/* Solution Display */}
          {solution && (
            <div className="mt-6 p-4 min-w-[320px] w-full" data-tour="solution">
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
    </TooltipProvider>
  )
}
