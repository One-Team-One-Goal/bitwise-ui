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

  // Update variables when count changes
  useEffect(() => {
    const allVariables = ['A', 'B', 'C', 'D'];
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
          const binaryString = colCoord + rowCoord;
          
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
          const binaryString = colCoord + rowCoord;
          
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
    
    const newMatrix = squares.map(row => 
      row.map(cell => [value, cell[1], cell[2]] as [CellValue, CellValue, CellValue])
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

    // Handlers
    handleVariableCountChange,
    handleFormTypeChange,
    handleCellClick,
    handleTruthTableChange,
    handleSetAllCells,
    resetKMap,
    clearError
  };
};