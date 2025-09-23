import React, { useState } from 'react';
import { CircuitCanvas } from './components/CircuitCanvas';
import { ComponentPalette } from './components/ComponentPalette';
import { SimulatorToolbar } from './components/SimulatorToolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { useCircuitSimulator } from './hooks/useCircuitSimulator';
import type { ComponentType, ToolbarState } from './types';

export const CircuitSimulator: React.FC = () => {
  const circuitHook = useCircuitSimulator();
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    selectedTool: 'select',
    selectedComponentType: null
  });

  const handleToolSelect = (tool: ToolbarState['selectedTool']) => {
    setToolbarState(prev => ({
      ...prev,
      selectedTool: tool,
      selectedComponentType: tool === 'component' ? prev.selectedComponentType : null
    }));
  };

  const handleComponentTypeSelect = (componentType: ComponentType) => {
    setToolbarState({
      selectedTool: 'component',
      selectedComponentType: componentType
    });
  };

  const handleCanvasClick = (position: { x: number; y: number }) => {
    if (toolbarState.selectedTool === 'component' && toolbarState.selectedComponentType) {
      circuitHook.addComponent(toolbarState.selectedComponentType, position);
      // Optionally keep the tool selected or switch back to select
      // setToolbarState(prev => ({ ...prev, selectedTool: 'select' }));
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <SimulatorToolbar
        toolbarState={toolbarState}
        onToolSelect={handleToolSelect}
        circuitHook={circuitHook}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Component Palette */}
        <div className="w-60 bg-white border-r border-gray-200 flex-shrink-0">
          <ComponentPalette
            onComponentSelect={handleComponentTypeSelect}
            selectedComponentType={toolbarState.selectedComponentType}
          />
        </div>

        {/* Main Circuit Canvas */}
        <div className="flex-1 relative min-w-0">
          <CircuitCanvas
            circuitHook={circuitHook}
            toolbarState={toolbarState}
            onCanvasClick={handleCanvasClick}
          />
        </div>

        {/* Properties Panel */}
        <div className="w-60 bg-white border-l border-gray-200 flex-shrink-0">
          <PropertiesPanel
            circuitHook={circuitHook}
          />
        </div>
      </div>
    </div>
  );
};