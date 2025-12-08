import { useState, useEffect, useCallback } from "react";
import {
  type KMapMatrix,
  type CellValue,
  type KMapSolution,
  getMatrixPerm,
  getMatrixSquare,
  setCoordinates,
  cycleCellValue,
  solveKarnaugh,
  getDimensions,
} from "@/utils/karnaugh.utils";
import { evaluateExpression, type EvaluationResult } from "@/utils/expressionEvaluator";

interface TruthTableRow {
  input: string;
  output: CellValue;
  index: number;
}

export const useKMaps = () => {
  const [variables, setVariables] = useState<string[]>(['A', 'B', 'C']);
  const [variableCount, setVariableCount] = useState<number>(3);
  const [formType, setFormType] = useState<'SOP' | 'POS'>('SOP');
  const [truthTable, setTruthTable] = useState<TruthTableRow[]>([]);
  const [squares, setSquares] = useState<KMapMatrix>([]);
  const [solution, setSolution] = useState<KMapSolution | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentExpression, setCurrentExpression] = useState<string>('');
  const [inputMode, setInputMode] = useState<'manual' | 'expression'>('manual');

  // Update variables when count changes
  useEffect(() => {
    const allVariables = ['A', 'B', 'C', 'D', 'E'];
    const newVariables = allVariables.slice(0, variableCount);
    setVariables(newVariables);
  }, [variableCount]);

  // Initialize K-Map when variable count changes
  useEffect(() => {
    const initializeKMap = () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Generate permutation matrix for truth table
        const perm = getMatrixPerm(variableCount);
        
        // Generate truth table
        const newTruthTable: TruthTableRow[] = perm.map((row, index) => ({
          input: row.join(''),
          output: 0 as CellValue,
          index
        }));
        
        // Generate K-Map matrix
        let matrix = getMatrixSquare(variableCount);
        matrix = setCoordinates(matrix, perm, variableCount);
        
        setTruthTable(newTruthTable);
        setSquares(matrix);
        setSolution(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize K-Map');
      } finally {
        setIsLoading(false);
      }
    };

    initializeKMap();
  }, [variableCount]);

  // Auto-solve whenever the K-Map changes
  const autoSolve = useCallback(() => {
    try {
      const newSolution = solveKarnaugh(squares, variableCount, formType);
      setSolution(newSolution);
    } catch (error) {
      console.error("Error auto-solving K-Map:", error);
      setSolution(null);
    }
  }, [squares, variableCount, formType]);

  // Trigger auto-solve when matrix or form type changes
  useEffect(() => {
    if (squares.length > 0) {
      autoSolve();
    }
  }, [squares, formType, autoSolve]);

  const handleVariableCountChange = useCallback((count: number) => {
    setVariableCount(count);
  }, []);

  const handleFormTypeChange = useCallback((type: 'SOP' | 'POS') => {
    setFormType(type);
  }, []);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (isLoading) return;
    
    const newMatrix = [...squares];
    const currentValue = newMatrix[row][col][0];
    const newValue = cycleCellValue(currentValue);
    newMatrix[row][col][0] = newValue;
    
    setSquares(newMatrix);
    
    // Update truth table to match K-Map
    updateTruthTableFromKMap(newMatrix);
  }, [squares, isLoading]);

  const handleTruthTableChange = useCallback((index: number, value: CellValue) => {
    const newTruthTable = [...truthTable];
    newTruthTable[index].output = value;
    setTruthTable(newTruthTable);
    
    // Update K-Map matrix based on truth table
    updateKMapFromTruthTable(newTruthTable);
  }, [truthTable]);

  const updateKMapFromTruthTable = (truthTableData: TruthTableRow[]) => {
    const { rows, cols } = getDimensions(variableCount);
    const newMatrix = [...squares];
    
    // Map truth table entries to K-Map positions
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (newMatrix[i] && newMatrix[i][j]) {
          const colCoord = newMatrix[i][j][1] as string;
          const rowCoord = newMatrix[i][j][2] as string;
          
          let binaryString: string;
          if (variableCount === 5) {
            // For 5 variables, include E coordinate
            // Order: EABCD where E is MSB, D is LSB
            const eCoord = newMatrix[i][j][3] as string;
            binaryString = eCoord + rowCoord + colCoord; // EABCD
          } else {
            // For 2-4 variables: row coords are higher bits, col coords are lower bits
            // 2 vars: AB -> rowCoord + colCoord
            // 3 vars: ABC -> rowCoord (A) + colCoord (BC)
            // 4 vars: ABCD -> rowCoord (AB) + colCoord (CD)
            binaryString = rowCoord + colCoord;
          }
          
          const truthTableIndex = parseInt(binaryString, 2);
          if (truthTableData[truthTableIndex]) {
            newMatrix[i][j][0] = truthTableData[truthTableIndex].output;
          }
        }
      }
    }
    
    setSquares(newMatrix);
  };

  const updateTruthTableFromKMap = (matrixData: KMapMatrix) => {
    const { rows, cols } = getDimensions(variableCount);
    const newTruthTable = [...truthTable];
    
    // Map K-Map positions back to truth table
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (matrixData[i] && matrixData[i][j]) {
          const colCoord = matrixData[i][j][1] as string;
          const rowCoord = matrixData[i][j][2] as string;
          
          let binaryString: string;
          if (variableCount === 5) {
            // For 5 variables, include E coordinate
            // Order: EABCD where E is MSB, D is LSB
            const eCoord = matrixData[i][j][3] as string;
            binaryString = eCoord + rowCoord + colCoord; // EABCD
          } else {
            // For 2-4 variables: row coords are higher bits, col coords are lower bits
            // 2 vars: AB -> rowCoord + colCoord
            // 3 vars: ABC -> rowCoord (A) + colCoord (BC)
            // 4 vars: ABCD -> rowCoord (AB) + colCoord (CD)
            binaryString = rowCoord + colCoord;
          }
          
          const truthTableIndex = parseInt(binaryString, 2);
          if (newTruthTable[truthTableIndex]) {
            newTruthTable[truthTableIndex].output = matrixData[i][j][0];
          }
        }
      }
    }
    
    setTruthTable(newTruthTable);
  };

  const handleSetAllCells = useCallback((value: CellValue) => {
    if (isLoading) return;
    
    // Preserve coordinate metadata (including E coordinate for 5-variable maps)
    const newMatrix = squares.map(row => 
      row.map(cell => {
        const updated = [...cell] as CellValue[];
        updated[0] = value;
        return updated;
      })
    );
    
    setSquares(newMatrix);
    
    // Update truth table
    const newTruthTable = truthTable.map(row => ({
      ...row,
      output: value
    }));
    setTruthTable(newTruthTable);
  }, [squares, truthTable, isLoading]);

  const resetKMap = () => {
    const perm = getMatrixPerm(variableCount);
    
    // Reset truth table
    const newTruthTable: TruthTableRow[] = perm.map((row, index) => ({
      input: row.join(''),
      output: 'X' as CellValue,
      index
    }));
    
    // Reset K-Map matrix
    let matrix = getMatrixSquare(variableCount);
    matrix = setCoordinates(matrix, perm, variableCount);
    
    setTruthTable(newTruthTable);
    setSquares(matrix);
    setSolution(null);
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Handle expression input
  const handleExpressionApply = useCallback((expression: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the variables for the current variable count
      const allVariables = ['A', 'B', 'C', 'D', 'E'];
      const targetVariables = allVariables.slice(0, variableCount);
      
      const result: EvaluationResult = evaluateExpression(expression, targetVariables);
      
      if (!result.success || !result.truthTable) {
        setError(result.error || 'Failed to evaluate expression');
        setIsLoading(false);
        return;
      }
      
      // Update truth table with the evaluated values
      const newTruthTable = truthTable.map((row, index) => ({
        ...row,
        output: result.truthTable![index]
      }));
      setTruthTable(newTruthTable);
      
      // Update K-Map from the new truth table
      updateKMapFromTruthTable(newTruthTable);
      
      // Store the current expression
      setCurrentExpression(expression);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse expression');
    } finally {
      setIsLoading(false);
    }
  }, [variableCount, truthTable]);

  // Handle setting values from expression input component
  const handleSetFromExpressionValues = useCallback((values: CellValue[]) => {
    if (values.length !== Math.pow(2, variableCount)) {
      setError(`Expected ${Math.pow(2, variableCount)} values, got ${values.length}`);
      return;
    }
    
    // Update truth table with the values
    const newTruthTable = truthTable.map((row, index) => ({
      ...row,
      output: values[index]
    }));
    setTruthTable(newTruthTable);
    
    // Update K-Map from the new truth table
    updateKMapFromTruthTable(newTruthTable);
  }, [variableCount, truthTable]);

  const handleInputModeChange = useCallback((mode: 'manual' | 'expression') => {
    setInputMode(mode);
  }, []);

  return {
    // State
    variables,
    variableCount,
    formType,
    squares,
    truthTable,
    solution,
    isLoading,
    error,
    currentExpression,
    inputMode,

    // Handlers
    handleVariableCountChange,
    handleFormTypeChange,
    handleCellClick,
    handleTruthTableChange,
    handleSetAllCells,
    resetKMap,
    clearError,
    handleExpressionApply,
    handleSetFromExpressionValues,
    handleInputModeChange
  };
};