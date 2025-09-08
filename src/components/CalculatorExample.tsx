// import { useState } from 'react'
// import { useBasicCalculation, useAdvancedCalculation, useCalculationHistory } from '../hooks/useCalculatorQueries'
// import { useAuthContext } from '../contexts/AuthContext'

// export function CalculatorExample() {
//   const [expression, setExpression] = useState('')
  
//   const { isAuthenticated } = useAuthContext()
  
//   // Mutations
//   const basicCalc = useBasicCalculation()
//   const advancedCalc = useAdvancedCalculation()
  
//   // Queries
//   const { data: history, isLoading: historyLoading } = useCalculationHistory()

//   const handleBasicCalculation = () => {
//     if (!expression) return
    
//     basicCalc.mutate({
//       operation: 'basic',
//       values: [2, 3], // Example values
//       expression,
//     })
//   }

//   const handleAdvancedCalculation = () => {
//     if (!expression || !isAuthenticated) return
    
//     advancedCalc.mutate({
//       operation: 'advanced',
//       values: [5, 10], // Example values
//       expression,
//     })
//   }

//   return (
//     <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
//       <h2 className="text-2xl font-bold mb-4">Calculator Example</h2>
      
//       {/* Input */}
//       <div className="mb-4">
//         <input
//           type="text"
//           value={expression}
//           onChange={(e) => setExpression(e.target.value)}
//           placeholder="Enter expression..."
//           className="w-full p-2 border border-gray-300 rounded"
//         />
//       </div>

//       {/* Buttons */}
//       <div className="space-y-2 mb-6">
//         <button
//           onClick={handleBasicCalculation}
//           disabled={basicCalc.isPending || !expression}
//           className="w-full p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
//         >
//           {basicCalc.isPending ? 'Calculating...' : 'Basic Calculation (No Auth)'}
//         </button>

//         <button
//           onClick={handleAdvancedCalculation}
//           disabled={advancedCalc.isPending || !expression || !isAuthenticated}
//           className="w-full p-2 bg-green-500 text-white rounded disabled:bg-gray-300"
//         >
//           {advancedCalc.isPending ? 'Calculating...' : 'Advanced Calculation (Auth Required)'}
//         </button>
//       </div>

//       {/* Results */}
//       {basicCalc.data && (
//         <div className="mb-4 p-3 bg-blue-50 rounded">
//           <h3 className="font-semibold">Basic Result:</h3>
//           <p>Result: {basicCalc.data.result}</p>
//           <p>Operation: {basicCalc.data.operation}</p>
//         </div>
//       )}

//       {advancedCalc.data && (
//         <div className="mb-4 p-3 bg-green-50 rounded">
//           <h3 className="font-semibold">Advanced Result:</h3>
//           <p>Result: {advancedCalc.data.result}</p>
//           <p>Operation: {advancedCalc.data.operation}</p>
//           <p>User ID: {advancedCalc.data.userId}</p>
//         </div>
//       )}

//       {/* History (only if authenticated) */}
//       {isAuthenticated && (
//         <div className="mt-6">
//           <h3 className="font-semibold mb-2">Calculation History:</h3>
//           {historyLoading ? (
//             <p>Loading history...</p>
//           ) : history && history.length > 0 ? (
//             <ul className="space-y-2">
//               {history.map((calc) => (
//                 <li key={calc.id} className="p-2 bg-gray-50 rounded">
//                   <span className="font-medium">{calc.operation}</span>
//                   <span className="ml-2 text-gray-600">= {calc.result}</span>
//                   <span className="ml-2 text-xs text-gray-400">
//                     {new Date(calc.timestamp).toLocaleString()}
//                   </span>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-gray-500">No calculations yet</p>
//           )}
//         </div>
//       )}

//       {/* Auth status */}
//       <div className="mt-4 text-sm text-gray-600">
//         Status: {isAuthenticated ? '🟢 Authenticated' : '🔴 Not authenticated'}
//       </div>
//     </div>
//   )
// }
