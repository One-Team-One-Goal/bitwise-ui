import React from 'react'

interface SquareProps {
  value: React.ReactNode
  i?: number
  j?: number
  onClick?: () => void
  isSelected?: boolean
}

export const Square: React.FC<SquareProps> = ({ value, i, j, onClick, isSelected = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-16 h-16 
        border border-border 
        font-mono font-semibold text-xl
        transition-all duration-200 ease-in-out
        hover:scale-105 hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
        ${isSelected 
          ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
          : 'bg-card text-foreground hover:bg-secondary/50'
        }
      `}
      id={`${i ?? ''}${j ?? ''}`}
    >
      {value}
    </button>
  )
}