import { useState, useEffect, useCallback } from "react";
import { karnaughMapService, type KMapMatrix, type KMapSolution, type TruthTableRow } from "@/services/karnaugh.service";

export const useKMaps = () => {
    // Original state from your hook
    const [variables, setVariables] = useState<string[]>(['A', 'B', 'C']);
    const [variableCount, setVariableCount] = useState<number>(3);
    const [formType, setFormType] = useState<'SOP' | 'POS'>('SOP');

    // Additional state for K-Map functionality
    const [squares, setSquares] = useState<KMapMatrix>([]);
    const [permutations, setPermutations] = useState<string[][]>([]);
    const [truthTable, setTruthTable] = useState<TruthTableRow[]>([]);
    const [solution, setSolution] = useState<KMapSolution | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Update variables when count changes (your original logic)
    useEffect(() => {
        const allVariables = ['A', 'B', 'C', 'D'];
        const newVariables = allVariables.slice(0, variableCount);
        setVariables(newVariables);
    }, [variableCount]);

    // Initialize K-Map when variable count changes
    useEffect(() => {
        const initializeKMap = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const result = await karnaughMapService.initialize(variableCount);
                setSquares(result.squares);
                setPermutations(result.permutations);
                
                // Get initial truth table
                const truthTableResult = await karnaughMapService.getTruthTable(
                    result.squares,
                    result.permutations,
                    variableCount
                );
                setTruthTable(truthTableResult.truthTable);
                setSolution(null); // Clear any previous solution
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize K-Map');
            } finally {
                setIsLoading(false);
            }
        };

        initializeKMap();
    }, [variableCount]);

    // Your original handlers
    const handleVariableCountChange = useCallback((count: number) => {
        setVariableCount(count);
    }, []);

    const handleFormTypeChange = useCallback((type: 'SOP' | 'POS') => {
        setFormType(type);
        setSolution(null); // Clear solution when form type changes
    }, []);

    // New handlers for K-Map functionality
    const handleCellClick = useCallback(async (row: number, col: number) => {
        if (isLoading) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await karnaughMapService.updateCell(squares, row, col);
            setSquares(result.squares);
            
            // Update truth table
            const truthTableResult = await karnaughMapService.getTruthTable(
                result.squares,
                permutations,
                variableCount
            );
            setTruthTable(truthTableResult.truthTable);
            setSolution(null); // Clear solution when matrix changes
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update cell');
        } finally {
            setIsLoading(false);
        }
    }, [squares, permutations, variableCount, isLoading]);

    const handleSetAllCells = useCallback(async (value: number | 'X') => {
        if (isLoading) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await karnaughMapService.setAllCells(squares, value);
            setSquares(result.squares);
            
            // Update truth table
            const truthTableResult = await karnaughMapService.getTruthTable(
                result.squares,
                permutations,
                variableCount
            );
            setTruthTable(truthTableResult.truthTable);
            setSolution(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to set all cells');
        } finally {
            setIsLoading(false);
        }
    }, [squares, permutations, variableCount, isLoading]);

    const handleSolve = useCallback(async (showSteps: boolean = false) => {
        if (isLoading) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await karnaughMapService.solve(
                squares,
                variableCount,
                formType,
                showSteps
            );
            setSolution(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to solve K-Map');
        } finally {
            setIsLoading(false);
        }
    }, [squares, variableCount, formType, isLoading]);

    const handleParseExpression = useCallback(async (expression: string) => {
        if (isLoading) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await karnaughMapService.parseExpression(expression, variables);
            setSquares(result.squares);
            setPermutations(result.permutations);
            setTruthTable(result.truthTable);
            setSolution(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse expression');
        } finally {
            setIsLoading(false);
        }
    }, [variables, isLoading]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // Original state
        variables,
        variableCount,
        formType,

        // New K-Map state
        squares,
        truthTable,
        solution,
        isLoading,
        error,

        // Original handlers
        handleVariableCountChange,
        handleFormTypeChange,

        // New handlers
        handleCellClick,
        handleSetAllCells,
        handleSolve,
        handleParseExpression,
        clearError
    }
}