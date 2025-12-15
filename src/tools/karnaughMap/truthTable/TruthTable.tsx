import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from '../../../components/ui/table'
import { type CellValue } from '@/utils/karnaugh.utils'

interface TruthTableRow {
  input: string
  output: CellValue
  index: number
}

interface TruthTableProps {
  variables: string[]
  truthTable?: TruthTableRow[]
  onTruthTableChange?: (index: number, value: CellValue) => void
  variableCount?: number
}

function generateTruthTables(numVars: number): number[][] {
  const rows = Math.pow(2, numVars)
  const table: number[][] = []

  for (let i = 0; i < rows; i++) {
    const row: number[] = []
    for (let j = numVars - 1; j >= 0; j--) {
      row.push((i >> j) & 1)
    }
    table.push(row)
  }

  return table
}

const TruthTable: React.FC<TruthTableProps> = ({
  variables,
  truthTable,
  onTruthTableChange,
  variableCount = variables.length,
}) => {
  const table = generateTruthTables(variables.length)
  const isCompact = variableCount >= 5

  const handleOutputClick = (index: number) => {
    if (truthTable && onTruthTableChange) {
      const currentValue = truthTable[index]?.output ?? 'X'

      let newValue: CellValue
      if (currentValue === 'X') {
        newValue = 0
      } else if (currentValue === 0) {
        newValue = 1
      } else {
        newValue = 'X'
      }

      onTruthTableChange(index, newValue)
    }
  }

  // Theme-aware classes for cell states (light + dark)
  const outputCellClass = (value: CellValue) => {
    const padding = isCompact ? 'px-1.5' : 'p-3'
    const base = `text-center font-mono cursor-pointer transition-all duration-150 ${padding} select-none font-semibold`
    const hoverActive =
      'hover:bg-blue-100 dark:hover:bg-blue-900/30 active:bg-blue-200 dark:active:bg-blue-800/40'

    if (value === 1) {
      // Green for 1
      return `${base} text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 ${hoverActive}`
    }

    if (value === 0) {
      // Neutral for 0
      return `${base} text-muted-foreground bg-gray-50 dark:bg-slate-800 ${hoverActive}`
    }

    // X / don't care - warn
    return `${base} text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 ${hoverActive}`
  }

  // Cell classes for input cells
  const inputCellClass = isCompact
    ? 'text-center border-r border-border last:border-r-0 font-mono px-1.5'
    : 'text-center border-r border-border last:border-r-0 font-mono p-3'

  // Header cell classes
  const headerCellClass = isCompact
    ? 'px-1.5 text-center font-semibold text-primary border-r last:border-r-0'
    : 'p-2 text-center font-semibold text-primary border-r last:border-r-0'

  return (
    // Allow height to overflow so page scrolls instead of the div
    <div className={`w-full max-w-md mx-auto mb-20 ${isCompact ? 'pl-4' : ''}`}>
      <div className="border" data-tour="truth-table">
        <Table className="w-full">
          <TableHeader className="bg-background">
            <TableRow className="bg-muted hover:bg-muted/80 transition-colors">
              {variables.map((variable) => (
                <TableHead key={variable} className={headerCellClass}>
                  {variable}
                </TableHead>
              ))}
              <TableHead
                className={
                  isCompact
                    ? 'px-1.5 text-center font-semibold text-primary'
                    : 'p-2 text-center font-semibold text-primary'
                }
              >
                R
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="bg-card">
            {table.map((row, rowIdx) => {
              const truthRow = truthTable?.[rowIdx]
              const outputValue = truthRow?.output ?? 'X'

              return (
                <TableRow
                  key={rowIdx}
                  className={`border-b border-border last:border-b-0 hover:bg-secondary/50 ${
                    rowIdx % 2 === 0 ? 'bg-secondary/30' : 'bg-card'
                  }`}
                >
                  {row.map((val, colIdx) => (
                    <TableCell key={colIdx} className={inputCellClass}>
                      <span className="font-semibold">{val}</span>
                    </TableCell>
                  ))}
                  <TableCell
                    className={outputCellClass(outputValue)}
                    onClick={() => handleOutputClick(rowIdx)}
                    title={`Click to cycle: ${outputValue} → ${
                      outputValue === 'X' ? '0' : outputValue === 0 ? '1' : 'X'
                    }`}
                  >
                    {outputValue}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Instructions */}
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Click on R values to cycle: X → 0 → 1 → X
      </div>
    </div>
  )
}

export default TruthTable
