import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import TruthTable from "@/tools/karnaughMap/truthTable/TruthTable"
import SettingsCard from "@/tools/karnaughMap/settings/SettingsCard"
import { useKMaps } from "@/hooks/useKMaps"
import Map from "@/components/kmap/Map"
import { TooltipProvider } from "@/components/ui/tooltip"
import introJs from 'intro.js'
import 'intro.js/introjs.css'
import { HelpCircle, Calculator } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { calculatorService } from "@/services/calculator.service"
import { KMapHelpGuide } from "@/tools/karnaughMap/KMapHelpGuide"

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

  const [expression, setExpression] = useState("");
  const [expressionError, setExpressionError] = useState<string | null>(null);
  const [isProcessingExpression, setIsProcessingExpression] = useState(false);

  // Handle expression input and conversion to truth table
  const handleExpressionSubmit = async () => {
    if (!expression.trim()) {
      setExpressionError("Please enter a Boolean expression");
      return;
    }

    setIsProcessingExpression(true);
    setExpressionError(null);

    try {
      // Generate truth table from expression
      const response = await calculatorService.generateTruthTable(expression);

      if (!response.success || !response.result) {
        setExpressionError(response.error || "Failed to parse expression");
        setIsProcessingExpression(false);
        return;
      }

      const { variables: varNames, rows } = response.result;

      // Validate variable count (2-5 variables)
      if (varNames.length < 2 || varNames.length > 5) {
        setExpressionError(`Expression must have 2-5 variables (found ${varNames.length})`);
        setIsProcessingExpression(false);
        return;
      }

      // Set variable count to match expression
      handleVariableCountChange(varNames.length as 2 | 3 | 4 | 5);

      // Wait a bit for state to update
      setTimeout(() => {
        // Convert truth table rows to the K-Map format
        const newTruthTable = rows.map((row: any) => (row.result ? 1 : 0) as 0 | 1);
        
        // Update each cell in the truth table
        newTruthTable.forEach((value: 0 | 1, index: number) => {
          handleTruthTableChange(index, value);
        });

        setIsProcessingExpression(false);
      }, 100);

    } catch (error: any) {
      setExpressionError(error?.message || "Failed to process expression");
      setIsProcessingExpression(false);
    }
  };



  return (
    <TooltipProvider>
      <div className="relative mt-40">
        {/* Help Button - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <KMapHelpGuide />
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
        <div className="mb-6 mt-8">
          <p className="font-semibold text-center text-3xl">Karnaugh Map Solver</p>
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
        <div className="space-y-4 mt-20 p-4 kmap-container">
          <Map
            squares={squares}
            groups={solution?.groups || []}
            variableCount={variableCount}
            onCellClick={handleCellClick}
          />
          
          {/* Solution Display */}
          {solution && (
            <div className="mt-6 p-4 min-w-[320px] w-full solution-display">
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
        <div className="flex-1 max-w-sm settings-panel">
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
