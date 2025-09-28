import React from 'react';
import { Settings, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { BooleanExpressionInput } from '@/components/BooleanExpressionInput';
import { InteractiveExplanation } from '@/components/InteractiveExplanation';
import type { Component, Connection } from '../types';
import { COMPONENT_DEFINITIONS } from '../utils/componentFactory';

interface PropertiesPanelProps {
  circuitHook: any;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ circuitHook }) => {
  const { circuitState } = circuitHook;
  
  const selectedComponent = circuitState.selectedComponent
    ? circuitState.components.find((c: Component) => c.id === circuitState.selectedComponent)
    : null;

  const selectedConnection = circuitState.selectedConnection
    ? circuitState.connections.find((c: Connection) => c.id === circuitState.selectedConnection)
    : null;

  const renderComponentProperties = (component: Component) => {
    const definition = COMPONENT_DEFINITIONS[component.type];

    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{definition.name}</span>
          </div>
          <div className="text-xs text-muted-foreground">ID: {component.id}</div>
          <div className="text-xs text-muted-foreground mt-1">{definition.description}</div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Position</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="x-pos" className="text-xs">X Position</Label>
              <Input
                id="x-pos"
                type="number"
                value={Math.round(component.position.x)}
                onChange={(e) => {
                  const newPosition = { ...component.position, x: Number(e.target.value) };
                  circuitHook.updateComponent(component.id, { position: newPosition });
                }}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="y-pos" className="text-xs">Y Position</Label>
              <Input
                id="y-pos"
                type="number"
                value={Math.round(component.position.y)}
                onChange={(e) => {
                  const newPosition = { ...component.position, y: Number(e.target.value) };
                  circuitHook.updateComponent(component.id, { position: newPosition });
                }}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {(component.type === 'SWITCH' || component.type === 'PUSH_BUTTON') && component.outputs?.[0] && (
          <div className="space-y-2">
            <Separator />
            <h4 className="text-sm font-medium">Control</h4>
            <Button
              variant={component.outputs[0].value ? "default" : "outline"}
              size="sm"
              className="w-full"
              onClick={() => {
                const newOutputs = component.outputs.map((output: any) => 
                  output.id === component.outputs[0].id 
                    ? { ...output, value: !output.value }
                    : output
                );
                circuitHook.updateComponent(component.id, { outputs: newOutputs });
              }}
            >
              {component.type === 'SWITCH' ? 'Toggle Switch' : 'Press Button'}
            </Button>
          </div>
        )}

        <div className="pt-2">
          <Separator className="mb-3" />
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => circuitHook.removeComponent(component.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Component
          </Button>
        </div>
      </div>
    );
  };

  const renderConnectionProperties = (connection: Connection) => {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Connection</span>
          </div>
          <div className="text-xs text-muted-foreground">ID: {connection.id}</div>
          <div className={`text-sm font-medium mt-2 ${
            connection.value ? 'text-green-600' : 'text-muted-foreground'
          }`}>
            Signal: {connection.value ? 'HIGH (1)' : 'LOW (0)'}
          </div>
        </div>

        <div className="pt-2">
          <Separator className="mb-3" />
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => circuitHook.removeConnection(connection.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Connection
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-background border-l border-border flex flex-col">
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <h3 className="text-sm font-medium">Properties</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Configure selected element</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Boolean Expression Input */}
          <BooleanExpressionInput
            onExpressionValidated={(expression, isSimplified) => {
              console.log('Expression validated:', expression, 'Simplified:', isSimplified);
            }}
            onGenerateCircuit={(expression) => {
              console.log('Generate circuit for:', expression);
              // TODO: Implement circuit generation from expression
            }}
          />
          
          <Separator />
          
          {selectedComponent ? (
            <div className="space-y-6">
              {renderComponentProperties(selectedComponent)}
              
              {/* Interactive Explanation for Premade Circuits */}
              {selectedComponent.type in COMPONENT_DEFINITIONS && 
               COMPONENT_DEFINITIONS[selectedComponent.type as keyof typeof COMPONENT_DEFINITIONS]?.isTemplate && (
                <>
                  <Separator />
                  <InteractiveExplanation
                    circuitType={selectedComponent.type}
                    onHighlight={(componentIds, connectionIds) => {
                      console.log('Highlight components:', componentIds, 'connections:', connectionIds);
                      // TODO: Implement highlighting logic
                    }}
                    onClearHighlight={() => {
                      console.log('Clear highlights');
                      // TODO: Implement clear highlighting logic
                    }}
                  />
                </>
              )}
            </div>
          ) : selectedConnection ? (
            renderConnectionProperties(selectedConnection)
          ) : (
            <div className="text-center py-8">
              <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Select a component or connection to view its properties
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
