
import React from "react"

export interface TableSquareProps {
  value: React.ReactNode
  className?: string
  k?: number | string
}

export const TableSquare: React.FC<TableSquareProps> = ({ value, className = "", k }) => {
  return (
    <div 
      className={`
        w-12 h-12 
        flex items-center justify-center
        border border-border
        font-mono font-semibold text-sm
        bg-primary text-primary-foreground
        ${className}
      `} 
      data-k={k}
    >
      {value}
    </div>
  )
}