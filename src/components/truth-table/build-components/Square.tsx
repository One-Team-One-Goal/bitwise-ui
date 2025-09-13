import React from 'react'

interface SquareProps {
  value: number;
  onClick: () => void;
}

export const Square: React.FC<SquareProps> = ({ value, onClick }) => {
  return (
    <div
      className="
      w-16 h-16 bg-gray-200 
      border border-gray-400 flex items-center justify-center"
      onClick={onClick}
    >
      {value}
    </div>
  )
}
