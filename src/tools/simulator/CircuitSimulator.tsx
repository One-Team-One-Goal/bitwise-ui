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
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div data-tour="toolbar">
        <SimulatorToolbar
          toolbarState={toolbarState}
          onToolSelect={handleToolSelect}
          circuitHook={circuitHook}
        />
      </div>

      <div className="flex flex-1 overflow-hidden lg:overflow-visible min-h-0">
        {/* Component Palette - Hidden on mobile, slide-out panel */}
        <div className="hidden lg:flex w-64 xl:w-72 flex-shrink-0" data-tour="component-palette">
          <ComponentPalette
            onComponentSelect={handleComponentTypeSelect}
            selectedComponentType={toolbarState.selectedComponentType}
          />
        </div>

        {/* Main Circuit Canvas - Full width on mobile */}
        <div className="flex-1 relative min-w-0" data-tour="canvas">
          <CircuitCanvas
            circuitHook={circuitHook}
            toolbarState={toolbarState}
            onCanvasClick={handleCanvasClick}
          />
        </div>

        {/* Properties Panel - Hidden on tablets and below */}
        <div className="hidden xl:flex w-64 flex-shrink-0" data-tour="properties">
          <PropertiesPanel
            circuitHook={circuitHook}
          />
        </div>
      </div>

      {/* Mobile Component Palette - Bottom sheet */}
      <div className="lg:hidden">
        {toolbarState.selectedTool === 'component' && (
          <div className="flex-shrink-0 bg-background border-t border-border max-h-60 overflow-hidden">
            <ComponentPalette
              onComponentSelect={handleComponentTypeSelect}
              selectedComponentType={toolbarState.selectedComponentType}
            />
          </div>
        )}
      </div>
    </div>
  );
};