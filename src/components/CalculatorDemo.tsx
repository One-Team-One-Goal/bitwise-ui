import React, { useState } from 'react'
import {
  calculatorService,
  type SimplificationResult,
  type TruthTableResult,
} from '../services/calculator.service'

interface CalculatorDemoProps {
  className?: string
}

export const CalculatorDemo: React.FC<CalculatorDemoProps> = ({
  className,
}) => {
  const [expression, setExpression] = useState('A ∧ B ∨ ¬A')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [operation, setOperation] = useState<
    'simplify' | 'evaluate' | 'truthTable'
  >('simplify')
  const [variables, setVariables] = useState<Record<string, boolean>>({
    A: true,
    B: false,
  })

  const handleCalculate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      let response

      switch (operation) {
        case 'simplify':
          response = await calculatorService.simplify(expression)
          break
        case 'evaluate':
          response = await calculatorService.evaluate(expression, variables)
          break
        case 'truthTable':
          response = await calculatorService.generateTruthTable(expression)
          break
      }

      if (response.success) {
        setResult(response.result)
      } else {
        setError(response.error || 'Calculation failed')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const renderSimplificationResult = (result: SimplificationResult) => (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Original Expression:</h3>
        <p className="font-mono bg-gray-100 p-2 rounded">
          {result.originalExpression}
        </p>
      </div>

      <div>
        <h3 className="font-semibold">Simplified Expression:</h3>
        <p className="font-mono bg-green-100 p-2 rounded">
          {result.simplifiedExpression}
        </p>
      </div>

      <div>
        <h3 className="font-semibold">Simplification Steps:</h3>
        <div className="space-y-2">
          {result.steps.map((step, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4">
              <div className="font-mono text-sm">{step.expression}</div>
              <div className="text-xs text-gray-600">
                {step.lawName} ({step.law})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTruthTable = (result: TruthTableResult) => (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Expression:</h3>
        <p className="font-mono bg-gray-100 p-2 rounded">{result.expression}</p>
      </div>

      <div>
        <h3 className="font-semibold">Truth Table:</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {result.variables.map((variable) => (
                  <th
                    key={variable}
                    className="border border-gray-300 px-4 py-2"
                  >
                    {variable}
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-background' : 'bg-gray-50'}
                >
                  {result.variables.map((variable) => (
                    <td
                      key={variable}
                      className="border border-gray-300 px-4 py-2 text-center"
                    >
                      {row.variables[variable] ? 'T' : 'F'}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    {row.result ? 'T' : 'F'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <div className="bg-background rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Boolean Algebra Calculator</h2>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Boolean Expression:
            </label>
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a boolean expression (e.g., A ∧ B ∨ ¬A)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported operators: ∧ (AND), ∨ (OR), ¬ (NOT), ⊕ (XOR), →
              (IMPLIES), ↔ (IFF)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Operation:</label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="simplify">Simplify</option>
              <option value="evaluate">Evaluate</option>
              <option value="truthTable">Truth Table</option>
            </select>
          </div>

          {operation === 'evaluate' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Variable Values:
              </label>
              <div className="space-y-2">
                {Object.entries(variables).map(([variable, value]) => (
                  <div key={variable} className="flex items-center space-x-2">
                    <span className="w-8">{variable}:</span>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={variable}
                        checked={value === true}
                        onChange={() =>
                          setVariables((prev) => ({
                            ...prev,
                            [variable]: true,
                          }))
                        }
                        className="mr-1"
                      />
                      True
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={variable}
                        checked={value === false}
                        onChange={() =>
                          setVariables((prev) => ({
                            ...prev,
                            [variable]: false,
                          }))
                        }
                        className="mr-1"
                      />
                      False
                    </label>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setVariables((prev) => ({
                      ...prev,
                      [String.fromCharCode(65 + Object.keys(prev).length)]:
                        false,
                    }))
                  }
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Variable
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleCalculate}
            disabled={loading || !expression.trim()}
            className="px-6 py-2 bg-blue-600 text-background rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Calculating...' : 'Calculate'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Results</h3>

            {operation === 'simplify' && renderSimplificationResult(result)}

            {operation === 'evaluate' && (
              <div>
                <h3 className="font-semibold">Evaluation Result:</h3>
                <p className="text-2xl font-mono">
                  <span
                    className={`px-3 py-1 rounded ${result ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {result ? 'TRUE' : 'FALSE'}
                  </span>
                </p>
              </div>
            )}

            {operation === 'truthTable' && renderTruthTable(result)}
          </div>
        )}

        {/* Operator Guide */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-3">Operator Guide</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {Object.entries(calculatorService.getSupportedOperators()).map(
              ([name, symbols]) => (
                <div key={name} className="bg-gray-50 p-3 rounded">
                  <div className="font-medium">{name}:</div>
                  <div className="text-gray-600">{symbols.join(', ')}</div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
