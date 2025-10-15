import React, { useState } from 'react';
import { CircuitCanvas } from './components/CircuitCanvas';
import { ComponentPalette } from './components/ComponentPalette';
import { SimulatorToolbar } from './components/SimulatorToolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { BooleanExpressionInput } from './components/BooleanExpressionInput';
import { useCircuitSimulator } from './hooks/useCircuitSimulator';
import { Card, CardContent } from '@/components/ui/card';
import type { ComponentType, ToolbarState } from './types';
import { MousePointer, Hand, Cable, Scissors, Cpu } from 'lucide-react';

export const CircuitSimulator: React.FC = () => {
  const circuitHook = useCircuitSimulator();
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    selectedTool: 'select',
    selectedComponentType: null
  });
  const [showBooleanExpression, setShowBooleanExpression] = useState(false);

  const tools = [
    {
      id: 'select' as const,
      name: 'Select',
      icon: MousePointer,
      description: 'Select and move components'
    },
    {
      id: 'pan' as const,
      name: 'Pan',
      icon: Hand,
      description: 'Pan the canvas'
    },
    {
      id: 'wire' as const,
      name: 'Wire',
      icon: Cable,
      description: 'Connect components'
    },
    {
      id: 'wire-edit' as const,
      name: 'Wire Edit',
      icon: Scissors,
      description: 'Select and manage wires'
    },
    {
      id: 'component' as const,
      name: 'Component',
      icon: Cpu,
      description: 'Place components'
    }
  ];

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
        <SimulatorToolbar />
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Component Palette - Desktop sidebar */}
        <div className="hidden lg:flex w-64 xl:w-80 flex-shrink-0" data-tour="component-palette">
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
            tools={tools}
            showBooleanExpression={showBooleanExpression}
            onToggleBooleanExpression={() => setShowBooleanExpression(!showBooleanExpression)}
          />
        </div>

        {/* Properties Panel - Desktop sidebar */}
        <div className="hidden xl:flex w-72 2xl:w-80 flex-shrink-0" data-tour="properties">
          <PropertiesPanel
            circuitHook={circuitHook}
          />
        </div>
      </div>

      {/* Mobile & Tablet Component Palette - Horizontal scrollable strip at bottom */}
      <div className="lg:hidden">
        {toolbarState.selectedTool === 'component' && (
          <div className="flex-shrink-0 bg-background border-t border-border">
            <ComponentPalette
              onComponentSelect={handleComponentTypeSelect}
              selectedComponentType={toolbarState.selectedComponentType}
              isMobile={true}
            />
          </div>
        )}
      </div>

      {/* Mobile & Tablet Properties Panel - Slide-up overlay */}
      <div className="xl:hidden">
        {(circuitHook.circuitState.selectedComponent || circuitHook.circuitState.selectedConnection) && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t-2 border-border shadow-2xl rounded-t-2xl animate-slide-up">
            <div className="flex justify-center py-2">
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            <div className="max-h-[50vh] overflow-hidden">
              <PropertiesPanel circuitHook={circuitHook} />
            </div>
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