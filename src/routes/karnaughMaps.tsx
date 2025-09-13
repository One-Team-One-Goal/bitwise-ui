import { createFileRoute } from "@tanstack/react-router"
import TruthTable from "@/components/truth-table/TruthTable"
import SettingsCard from "@/components/truth-table/SettingsCard"
import { useKMaps } from "@/hooks/useKMaps"

export const Route = createFileRoute("/karnaughMaps")({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    variables,
    variableCount,
    formType,
    handleVariableCountChange,
    handleFormTypeChange
  } = useKMaps();


  return (
    <div>
      {/* Title Section - Separate from content */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-center">Karnaugh Map Solver</h1>
      </div>
      
      {/* Content Section - Horizontal layout */}
      <div className="flex justify-center items-start gap-32 flex-wrap">
        <div className="flex-1 max-w-sm">
          <h3 className="text-lg font-semibold mb-4 text-center">Truth Table</h3>
          <TruthTable variables={variables} />
        </div>
        <div className="flex-1 max-w-sm">
          {/* Empty div with same height as h3 to maintain alignment */}
          <div className="h-[1.5rem] mb-5"></div>
          <TruthTable variables={["A", "B", "C"]} />
        </div>
        <div className="flex-1 max-w-sm">
          {/* Empty div with same height as h3 to maintain alignment */}
          <div className="h-[1.5rem] mb-5"></div>
          <SettingsCard
            variableCount={variableCount}
            formType={formType}
            onVariableCountChange={handleVariableCountChange}
            onFormTypeChange={handleFormTypeChange}
            onSetAllCells={() => {}}
            onProcess={() => {}}
          />
        </div>
      </div>
    </div>
  )
}