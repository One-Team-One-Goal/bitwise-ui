import React, { useState } from 'react';
import { CircuitCanvas } from './components/CircuitCanvas';
import { ComponentPalette } from './components/ComponentPalette';
import { SimulatorToolbar } from './components/SimulatorToolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { BooleanExpressionInput } from './components/BooleanExpressionInput';
import { useCircuitSimulator } from './hooks/useCircuitSimulator';
import { Card, CardContent } from '@/components/ui/card';
import { parseExpression } from './utils/expressionParser';
import { generateCircuitFromExpression } from './utils/circuitGenerator';
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
    setToolbarState({
      selectedTool: tool,
      selectedComponentType: tool === 'component' ? toolbarState.selectedComponentType : null
    });
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
      setToolbarState(prev => ({ ...prev, selectedTool: 'select', selectedComponentType: null }));
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

      {/* Mobile & Tablet Component Palette - Fixed at bottom */}
      <div className="lg:hidden">
        {toolbarState.selectedTool === 'component' && 
         !circuitHook.circuitState.selectedComponent && 
         !circuitHook.circuitState.selectedConnection && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t-2 border-border shadow-2xl max-h-[60vh] overflow-y-auto">
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
                onGenerateCircuit={(expression) => {
                  // Parse the expression into an expression tree
                  const parseResult = parseExpression(expression);
                  
                  if (!parseResult.success || !parseResult.tree) {
                    console.error('Failed to parse expression:', parseResult.error);
                    // TODO: Show user-friendly error message
                    return;
                  }
                  
                  // Generate circuit components and connections from expression tree
                  const circuitResult = generateCircuitFromExpression(
                    parseResult.tree,
                    parseResult.variables
                  );
                  
                  // Clear existing circuit and load generated circuit
                  circuitHook.clearAll();
                  
                  // Load generated components and connections
                  // We'll add each component and connection one by one
                  // First add all components
                  const componentIdMap = new Map<string, string>();
                  
                  circuitResult.components.forEach(generatedComp => {
                    const newComp = circuitHook.addComponent(
                      generatedComp.type,
                      generatedComp.position
                    );
                    componentIdMap.set(generatedComp.id, newComp.id);
                    
                    // Update label if present
                    if (generatedComp.label) {
                      circuitHook.updateComponent(newComp.id, { label: generatedComp.label });
                    }
                  });
                  
                  // Then add all connections using the new component IDs
                  circuitResult.connections.forEach(conn => {
                    const fromCompId = componentIdMap.get(conn.from.componentId);
                    const toCompId = componentIdMap.get(conn.to.componentId);
                    
                    if (fromCompId && toCompId) {
                      // Find the corresponding connection points in the new components
                      const fromComp = circuitHook.circuitState.components.find(c => c.id === fromCompId);
                      const toComp = circuitHook.circuitState.components.find(c => c.id === toCompId);
                      
                      if (fromComp && toComp && fromComp.outputs[0] && toComp.inputs[0]) {
                        circuitHook.addConnection(
                          fromCompId,
                          fromComp.outputs[0].id,
                          toCompId,
                          toComp.inputs[0].id
                        );
                      }
                    }
                  });
                  
                  // Close the boolean expression panel
                  setShowBooleanExpression(false);
                  
                  console.log('Circuit generated successfully:', {
                    components: circuitResult.components.length,
                    connections: circuitResult.connections.length,
                    variables: parseResult.variables
                  });
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};