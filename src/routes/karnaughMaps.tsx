import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import TruthTable from "@/tools/karnaughMap/truthTable/TruthTable"
import SettingsCard from "@/tools/karnaughMap/settings/SettingsCard"
import { useKMaps } from "@/hooks/useKMaps"
import Map from "@/components/kmap/Map"
import { TooltipProvider } from "@/components/ui/tooltip"
import introJs from 'intro.js'
import 'intro.js/introjs.css'
import { HelpCircle, Calculator, Shuffle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { calculatorService } from "@/services/calculator.service"

// Random example expressions for quick testing - properly mapped to K-map variables (A, B, C, D, E)
const RANDOM_EXPRESSIONS = [
  // 2-variable examples (A, B)
  { expr: "A∧B", vars: 2, desc: "Simple AND" },
  { expr: "A∨B", vars: 2, desc: "Simple OR" },
  { expr: "¬A∧B", vars: 2, desc: "Negation AND" },
  { expr: "A⊕B", vars: 2, desc: "XOR" },
  { expr: "A∧B∨¬A∧¬B", vars: 2, desc: "XNOR" },
  
  // 3-variable examples (A, B, C)
  { expr: "A∧B∨C", vars: 3, desc: "Mixed operations" },
  { expr: "(A∨B)∧C", vars: 3, desc: "Grouped OR-AND" },
  { expr: "A∧B∨B∧C∨A∧C", vars: 3, desc: "Majority function" },
  { expr: "¬A∧B∨A∧¬B", vars: 3, desc: "XOR pattern" },
  { expr: "(A∨B)∧(B∨C)", vars: 3, desc: "Overlapping groups" },
  { expr: "A∧B∧C∨¬A∧¬B∧¬C", vars: 3, desc: "Corners" },
  
  // 4-variable examples (A, B, C, D)
  { expr: "A∧B∨C∧D", vars: 4, desc: "Two groups" },
  { expr: "(A∨B)∧(C∨D)", vars: 4, desc: "Product of sums" },
  { expr: "A∧B∧C∨D", vars: 4, desc: "Mixed complexity" },
  { expr: "A⊕B⊕C⊕D", vars: 4, desc: "4-bit XOR" },
  { expr: "(A∧B)∨(C∧D)∨(A∧D)", vars: 4, desc: "Multiple products" },
  { expr: "A∧C∨B∧D", vars: 4, desc: "Diagonal pattern" },
  
  // 5-variable examples (A, B, C, D, E)
  { expr: "A∧B∨C∧D∨E", vars: 5, desc: "Five-way OR" },
  { expr: "(A∨B)∧(C∨D)∧E", vars: 5, desc: "Complex POS" },
  { expr: "A∧B∧C∨D∧E", vars: 5, desc: "Grouped products" },
  { expr: "A∧E∨B∧C∨D", vars: 5, desc: "Cross-table groups" },
];

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

  // Generate a random expression
  const handleRandomExpression = () => {
    const randomExample = RANDOM_EXPRESSIONS[Math.floor(Math.random() * RANDOM_EXPRESSIONS.length)];
    setExpression(randomExample.expr);
    setExpressionError(null);
  };

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

      console.log('Truth table response:', response); // Debug log

      if (!response.success || !response.result) {
        const errorMsg = response.error || "Failed to parse expression";
        console.error('Truth table error:', errorMsg);
        setExpressionError(errorMsg);
        setIsProcessingExpression(false);
        return;
      }

      const { variables: varNames, table } = response.result;

      console.log('Parsed variables:', varNames, 'Table rows:', table?.length); // Debug log

      if (!table || !Array.isArray(table)) {
        setExpressionError("Invalid truth table format received");
        setIsProcessingExpression(false);
        return;
      }

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
        const newTruthTable = table.map((row: any) => (row.result ? 1 : 0) as 0 | 1);
        
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

  // Start the intro.js tutorial
  const startTutorial = () => {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          title: '👋 Welcome to Karnaugh Map Solver!',
          intro: 'This tool helps you simplify Boolean expressions using Karnaugh Maps (K-Maps). Let me show you how to use it!'
        },
        {
          element: '.expression-input',
          title: '⚡ Quick Start: Import Expression',
          intro: 'The fastest way to get started! Type a Boolean expression like "A∧B∨C" or "A·B+C" and click Generate. The tool will automatically set up the K-Map with the correct number of variables and populate the truth table.',
          position: 'bottom'
        },
        {
          element: '.settings-panel',
          title: '⚙️ Settings Panel',
          intro: 'Manually choose the number of variables (2-5) and select SOP (Sum of Products) or POS (Product of Sums) form. The K-Map will update automatically!',
          position: 'right'
        },
        {
          element: '.truth-table',
          title: '📊 Truth Table',
          intro: 'This is your truth table. Each row represents a combination of input variables. Click on output cells to toggle between 0, 1, and X (don\'t care).',
          position: 'right'
        },
        {
          element: '.kmap-container',
          title: '🗺️ Karnaugh Map',
          intro: 'The K-Map visualizes your truth table in a grid format optimized for finding patterns. Cells are arranged using Gray code so adjacent cells differ by only one bit.',
          position: 'left'
        },
        {
          element: '.kmap-container',
          title: '🖱️ Interactive Cells',
          intro: 'Hover over any cell to see its binary coordinates, minterm number, and variable representation. Click cells to cycle through values: X → 0 → 1 → X',
          position: 'left'
        },
        {
          element: '.solution-display',
          title: '✨ Simplified Expression',
          intro: 'Your simplified Boolean expression appears here! The solver automatically finds the minimal form with optimal grouping. Lower literal cost means a simpler circuit.',
          position: 'top'
        },
        {
          title: '🎨 Visual Groups',
          intro: 'Groups of 1s (or 0s for POS) are highlighted with colored overlays. Each group represents a term in your final expression. Larger groups mean fewer variables in that term!'
        },
        {
          title: '🔢 5-Variable Magic',
          intro: 'For 5 variables, you\'ll see two 4×4 tables (E=0 and E=1). The solver can find groups that span across both tables, which means the E variable doesn\'t appear in that term!'
        },
        {
          title: '🎓 Ready to Simplify!',
          intro: 'Try entering an expression or clicking some cells to set values, and watch the solution update in real-time. Click the help button (?) anytime to see this tutorial again. Happy simplifying!'
        }
      ],
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: false,
      doneLabel: 'Got it!',
      nextLabel: 'Next →',
      prevLabel: '← Back',
      skipLabel: 'Skip'
    });
    intro.start();
  };

  return (
    <TooltipProvider>
      <div className="relative">
        {/* Floating Action Buttons - Top Right */}
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
          <Button
            type="button"
            onClick={startTutorial}
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl hover:bg-primary/10 hover:border-primary transition-all bg-background dark:bg-gray-800 border-2"
            title="Show Tutorial"
          >
            <HelpCircle className="h-5 w-5 text-primary" />
          </Button>
          
          <Button
            onClick={handleRandomExpression}
            variant="outline"
            size="icon"
            disabled={isProcessingExpression}
            title="Generate random example"
            className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl hover:bg-primary/10 hover:border-primary transition-all bg-background dark:bg-gray-800 border-2"
          >
            <Shuffle className="h-5 w-5 text-primary" />
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
        <div className="mb-10 mt-30">
          <p className="font-semibold text-center text-3xl">Karnaugh Map Solver</p>
        </div>

        {/* Expression Input Section */}
        <div className="max-w-2xl mx-auto mb-6 expression-input">
          <div className="bg-card dark:bg-gray-800 rounded-lg shadow-md p-4 border border-border">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Import Boolean Expression
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Enter a Boolean expression to automatically populate the K-Map (e.g., A∧B∨C or A·B+C)
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleExpressionSubmit();
                  }
                }}
                placeholder="Enter expression (e.g., A∧B∨C, A·B+C)"
                className="flex-1"
                disabled={isProcessingExpression}
              />
              <Button
                onClick={handleExpressionSubmit}
                disabled={isProcessingExpression || !expression.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {isProcessingExpression ? 'Processing...' : 'Generate'}
              </Button>
            </div>
            {expressionError && (
              <div className="mt-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded px-3 py-2">
                ⚠️ {expressionError}
              </div>
            )}
          </div>
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
