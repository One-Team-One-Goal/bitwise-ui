import React from 'react'

interface CalculatorOutputProps {
  value: string | number
}

const CalculatorOutput: React.FC<CalculatorOutputProps> = ({ value }) => {
  return <div className="calculator-output">{value}</div>
}

export default CalculatorOutput
