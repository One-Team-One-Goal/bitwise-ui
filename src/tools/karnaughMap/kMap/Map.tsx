import React from 'react';
import { Square } from '@/tools/karnaughMap/truthTable/build-components/Square';

interface MapProps {
  squares: number[][][]
  typeMap: number
  onClick: (i: number, j: number) => void
}

export const Map: React.FC<MapProps> = ({ squares, typeMap, onClick }) => {

  const renderSquare = (i: number, j: number) => {
    const value = (squares && squares[i] && squares[i][j]) ? squares[i][j][0] : 0
    return (
      <Square
        key={`${i}-${j}`}
        value={value}
        i={i}
        j={j}
        onClick={() => onClick(i, j)}

        isSelected={value === 1}
      />
    )
  }

  const generateMapRow = (i: number) => {
    const cols = typeMap === 3 ? 4 : typeMap
    return Array.from({ length: cols }, (_, j) => renderSquare(i, j))
  }

  const renderMapRow = (i: number) => (
    <div className="flex" key={i}>
      {generateMapRow(i)}
    </div>
  )

  const renderMap = () => {
    const rows = typeMap === 3 ? 2 : typeMap
    return Array.from({ length: rows }, (_, i) => renderMapRow(i))
  }

  const renderVariableHeader = () => {
    // Create variable labels for rows and columns
    const getVariableLabels = () => {
      if (typeMap === 2) {
        return { rowVars: "A", colVars: "B" }
      } else if (typeMap === 3) {
        return { rowVars: "AB", colVars: "C" }
      } else if (typeMap === 4) {
        return { rowVars: "AB", colVars: "CD" }
      }
      return { rowVars: "", colVars: "" }
    }

    const { rowVars, colVars } = getVariableLabels()

    return (
      <div className="w-16 h-16 bg-card relative">
        {/* Diagonal line */}
        <div className="absolute inset-1">
          <svg className="w-full h-full" viewBox="0 0 48 48">
            <line x1="48" y1="48" x2="4" y2="4" stroke="currentColor" strokeWidth="3" className="text-border" />
          </svg>
        </div>
        {/* Row variables (top right) */}
        <div className="absolute top-1 right-1 text-sm font-semibold text-foreground">
          {rowVars}
        </div>
        {/* Column variables (bottom left) */}
        <div className="absolute bottom-1 left-1 text-sm font-semibold text-foreground">
          {colVars}
        </div>
      </div>
    )
  }

  const renderColumnHeader = (value: string) => (
    <div className="w-16 h-16 flex items-center justify-center font-mono font-semibold text-base">
      {value}
    </div>
  )

  const renderRowHeader = (value: string) => (
    <div className="w-16 h-16 flex items-center justify-center font-mono font-semibold text-base">
      {value}
    </div>
  )

  const getHeaderValues = () => {
    let strings = ["00", "01", "11", "10"]
    if (typeMap === 2) strings = ["0", "1"]
    return strings
  }

  const getRowValues = () => {
    let strings = ["00", "01", "11", "10"]
    let rows = typeMap
    if (typeMap !== 4) {
      strings = ["0", "1"]
      rows = 2
    }
    return { strings, rows }
  }

  const headerValues = getHeaderValues()
  const { strings: rowValues, rows } = getRowValues()
  const cols = typeMap === 3 ? 4 : typeMap

  return (
    <div className="w-full max-w-fit mx-auto">
      <div className="w-96 mx-auto">
        
        {/* Title */}
        <div className="bg-primary px-4 py-2 border-b border-border rounded-sm min-w-fit">
          <h4 className="text-sm font-semibold text-center text-white">
            {typeMap}-Variable Karnaugh Map
          </h4>
        </div>

        {/* Map Container */}
        <div className="p-6 bg-card min-h-[300px] flex items-center justify-center">
          <div className="inline-block rounded-md overflow-hidden">
            
            {/* Header Row */}
            <div className="flex">
              {/* Top-left corner cell */}
              {renderVariableHeader()}
              
              {/* Column headers */}
              <div className="flex">
                {Array.from({ length: cols }, (_, i) => (
                  <div key={i}>
                    {renderColumnHeader(headerValues[i])}
                  </div>
                ))}
              </div>
            </div>

            {/* Body Rows */}
            <div className="flex">
              {/* Row headers */}
              <div className="flex flex-col">
                {Array.from({ length: rows }, (_, i) => (
                  <div key={i}>
                    {renderRowHeader(rowValues[i])}
                  </div>
                ))}
              </div>
              
              {/* Map grid */}
              <div className="flex flex-col">
                {renderMap()}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted/20 px-4 py-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Click cells to toggle between 0, 1 and X - don't care.
          </p>
        </div>
      </div>
    </div>
  )
}