import { useState, useEffect } from "react";

export const useKMaps = () => {
    const [variables, setVariables] = useState<string[]>(['A', 'B', 'C']);
    const [variableCount, setVariableCount] = useState<number>(3);
    const [formType, setFormType] = useState<'SOP' | 'POS'>('SOP');

    useEffect(() => {
        const allVariables = ['A', 'B', 'C', 'D'];
        const newVariables = allVariables.slice(0, variableCount);
        setVariables(newVariables);
    }, [variableCount]);

    const handleVariableCountChange = (count: number) => {
        setVariableCount(count);
    };

    const handleFormTypeChange = (type: 'SOP' | 'POS') => {
        setFormType(type);
    };

    return {
        // Mga State
        variables,
        variableCount,
        formType,

        // Handlers
        handleVariableCountChange,
        handleFormTypeChange
    }
}