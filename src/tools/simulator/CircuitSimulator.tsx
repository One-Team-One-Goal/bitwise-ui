import React, { useState } from 'react';
import { CircuitCanvas } from './components/CircuitCanvas';
import { ComponentPalette } from './components/ComponentPalette';
import { SimulatorToolbar } from './components/SimulatorToolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { BooleanExpressionInput } from './components/BooleanExpressionInput';
import { useCircuitSimulator } from './hooks/useCircuitSimulator';
import { Card, CardContent } from '@/components/ui/card';
import type { ComponentType, ToolbarState } from './types';

export const CircuitSimulator: React.FC = () => {
  const circuitHook = useCircuitSimulator();
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    selectedTool: 'select',
    selectedComponentType: null
  });
  const [showBooleanExpression, setShowBooleanExpression] = useState(false);

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
    <div className="h-full flex flex-col bg-background relative">
      {/* Toolbar */}
      <div data-tour="toolbar">
        <SimulatorToolbar
          toolbarState={toolbarState}
          onToolSelect={handleToolSelect}
          circuitHook={circuitHook}
          showBooleanExpression={showBooleanExpression}
          onToggleBooleanExpression={() => setShowBooleanExpression(!showBooleanExpression)}
        />
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Component Palette - Responsive visibility */}
        <div className="hidden md:flex w-64 lg:w-72 flex-shrink-0" data-tour="component-palette">
          <ComponentPalette
            onComponentSelect={handleComponentTypeSelect}
            selectedComponentType={toolbarState.selectedComponentType}
          />
        </div>

        {/* Main Circuit Canvas */}
        <div className="flex-1 relative min-w-0" data-tour="canvas">
          <CircuitCanvas
            circuitHook={circuitHook}
            toolbarState={toolbarState}
            onCanvasClick={handleCanvasClick}
            onToolSelect={handleToolSelect}
          />
        </div>

        {/* Properties Panel - Responsive visibility */}
        <div className="hidden lg:flex w-64 xl:w-72 flex-shrink-0" data-tour="properties">
          <PropertiesPanel
            circuitHook={circuitHook}
          />
        </div>
      </div>

      {/* Mobile Component Palette - Bottom sheet */}
      <div className="md:hidden">
        {toolbarState.selectedTool === 'component' && (
          <div className="flex-shrink-0 bg-background border-t border-border max-h-48 overflow-hidden">
            <ComponentPalette
              onComponentSelect={handleComponentTypeSelect}
              selectedComponentType={toolbarState.selectedComponentType}
            />
          </div>
        )}
      </div>

      {/* Mobile Properties Panel - Overlay */}
      <div className="lg:hidden">
        {(circuitHook.circuitState.selectedComponent || circuitHook.circuitState.selectedConnection) && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg max-h-64 md:max-h-72">
            <PropertiesPanel
              circuitHook={circuitHook}
            />
          </div>
        )}
      </div>

      {/* Boolean Expression Input Overlay */}
      {showBooleanExpression && (
        <div className="absolute top-16 left-4 right-4 z-40 md:left-1/2 md:transform md:-translate-x-1/2 md:max-w-2xl">
          <Card className="shadow-lg border-border bg-background/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <BooleanExpressionInput
                onExpressionValidated={(expression, isSimplified) => {
                  console.log('Expression validated:', expression, 'Simplified:', isSimplified);
                }}
                onGenerateCircuit={(expression) => {
                  console.log('Generate circuit for:', expression);
                  // TODO: Implement circuit generation from expression
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};