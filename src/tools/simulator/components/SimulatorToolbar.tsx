import React from 'react';
import { 
  MousePointer, 
  Hand, 
  Cable, 
  Cpu, 
  Grid3X3, 
  RotateCcw, 
  Trash2,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HelpGuide } from '@/components/HelpGuide';
import type { ToolbarState } from '../types';

interface SimulatorToolbarProps {
  toolbarState: ToolbarState;
  onToolSelect: (tool: ToolbarState['selectedTool']) => void;
  circuitHook: any; // We'll type this properly later
}

export const SimulatorToolbar: React.FC<SimulatorToolbarProps> = ({
  toolbarState,
  onToolSelect,
  circuitHook
}) => {
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
      id: 'component' as const,
      name: 'Component',
      icon: Cpu,
      description: 'Place components'
    }
  ];

  return (
    <div className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo/Title and Tools */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Logo/Title */}
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold text-foreground">
                Digital Circuit Simulator
              </h1>
            </div>

            {/* Tool Selection */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              {tools.map(tool => {
                const IconComponent = tool.icon;
                const isSelected = toolbarState.selectedTool === tool.id;
                
                return (
                  <Button
                    key={tool.id}
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onToolSelect(tool.id)}
                    title={tool.description}
                    className="flex items-center gap-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{tool.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Grid Toggle */}
            <Button
              variant={circuitHook.circuitState.snapToGrid ? "default" : "outline"}
              size="sm"
              onClick={circuitHook.toggleSnapToGrid}
              title="Toggle snap to grid"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </Button>

            {/* Reset */}
            <Button
              variant="outline"
              size="sm"
              onClick={circuitHook.resetSimulation}
              title="Reset simulation"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>

            {/* Clear All */}
            <Button
              variant="destructive"
              size="sm"
              onClick={circuitHook.clearAll}
              title="Clear all components"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>

            {/* Help Guide */}
            <HelpGuide />
          </div>
        </div>
      </div>
    </div>
  );
};