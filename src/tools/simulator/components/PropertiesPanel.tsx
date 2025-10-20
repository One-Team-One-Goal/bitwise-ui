import React from 'react';
import { Settings, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold truncate">{definition.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 sm:h-7 sm:w-7 p-0 flex-shrink-0"
              onClick={() => circuitHook.removeComponent(component.id)}
              title="Delete component"
            >
              <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-destructive" />
            </Button>
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate" title={component.id}>
            ID: {component.id}
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed break-words">
            {definition.description}
          </div>
        </div>

        {/* Label input for LABEL component */}
        {component.type === 'LABEL' && (
          <div className="space-y-1 pt-2">
            <Label htmlFor="component-label" className="text-xs">Label Text</Label>
            <Input
              id="component-label"
              type="text"
              value={component.label ?? ''}
              placeholder="Enter label text..."
              className="h-8 text-xs w-full"
              onChange={e => circuitHook.updateComponent(component.id, { label: e.target.value })}
            />
          </div>
        )}

        <Separator className="my-2 sm:my-3" />

        <div className="space-y-2 sm:space-y-3">
          <h4 className="text-xs sm:text-sm font-semibold">Position</h4>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
    // Find source and destination components
    const fromComponent = circuitState.components.find((c: Component) => c.id === connection.from.componentId);
    const toComponent = circuitState.components.find((c: Component) => c.id === connection.to.componentId);
    
    return (
      <div className="space-y-4">
        {/* Wire Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${connection.value ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">Wire Connection</span>
          </div>
          <div className="text-xs text-muted-foreground">ID: {connection.id}</div>
        </div>

        {/* Signal Status */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Signal State</span>
            <div className={`px-2 py-1 rounded-full text-xs font-bold ${
              connection.value 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}>
              {connection.value ? 'HIGH (1)' : 'LOW (0)'}
            </div>
          </div>
          
          {/* Visual signal indicator */}
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                connection.value ? 'bg-green-500' : 'bg-gray-400'
              }`}
              style={{ width: connection.value ? '100%' : '20%' }}
            />
          </div>
        </div>

        {/* Connection Details */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Connection Details</h4>
          
          {/* From Component */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-xs font-medium text-blue-800 mb-1">FROM (Output)</div>
            <div className="text-sm">
              {fromComponent ? (COMPONENT_DEFINITIONS[fromComponent.type as keyof typeof COMPONENT_DEFINITIONS]?.name || 'Unknown') : 'Unknown'}
            </div>
            <div className="text-xs text-blue-600">Component ID: {connection.from.componentId}</div>
            <div className="text-xs text-blue-600">Pin: {connection.from.connectionPointId}</div>
          </div>
          
          {/* To Component */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-xs font-medium text-purple-800 mb-1">TO (Input)</div>
            <div className="text-sm">
              {toComponent ? (COMPONENT_DEFINITIONS[toComponent.type as keyof typeof COMPONENT_DEFINITIONS]?.name || 'Unknown') : 'Unknown'}
            </div>
            <div className="text-xs text-purple-600">Component ID: {connection.to.componentId}</div>
            <div className="text-xs text-purple-600">Pin: {connection.to.connectionPointId}</div>
          </div>
        </div>

        {/* Wire Path Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Path Information</h4>
          <div className="text-xs text-muted-foreground">
            Path Points: {connection.path.length}
          </div>
          <div className="text-xs text-muted-foreground">
            Length: ~{Math.round(
              connection.path.reduce((total, point, index) => {
                if (index === 0) return 0;
                const prev = connection.path[index - 1];
                return total + Math.sqrt(Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2));
              }, 0)
            )}px
          </div>
        </div>

        {/* Wire Actions */}
        <div className="space-y-2">
          <Separator />
          
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              // TODO: Implement wire highlighting/tracing
              console.log('Trace wire:', connection.id);
            }}
          >
            <Info className="h-4 w-4 mr-2" />
            Trace Wire Path
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => circuitHook.removeConnection(connection.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Wire
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-background border-l border-border flex flex-col">
      <div className="p-2 sm:p-3 lg:p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <h3 className="text-xs sm:text-sm font-semibold">Properties</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 xl:hidden"
            onClick={() => {
              circuitHook.selectComponent(null);
              circuitHook.selectConnection(null);
            }}
            title="Close panel"
          >
            <span className="text-lg leading-none">×</span>
          </Button>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Configure selected element</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 sm:p-3 lg:p-4 space-y-4 sm:space-y-6">
          
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
            <div className="text-center py-8 my-auto">
              <div className='h-60'></div>
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
