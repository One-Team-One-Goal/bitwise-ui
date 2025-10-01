import React from 'react';
import { 
  MousePointer, 
  Hand, 
  Cable, 
  Cpu, 
  Grid3X3, 
  RotateCcw, 
  Trash2,
  Zap,
  Calculator,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Keyboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HelpGuide } from '@/tools/simulator/components/HelpGuide';
import type { ToolbarState } from '../types';

interface SimulatorToolbarProps {
  toolbarState: ToolbarState;
  onToolSelect: (tool: ToolbarState['selectedTool']) => void;
  circuitHook: any; // We'll type this properly later
  showBooleanExpression: boolean;
  onToggleBooleanExpression: () => void;
  onShowQuickActions?: () => void;
  onShowKeyboardShortcuts?: () => void;
}

export const SimulatorToolbar: React.FC<SimulatorToolbarProps> = ({
  toolbarState,
  onToolSelect,
  circuitHook,
  showBooleanExpression,
  onToggleBooleanExpression,
  onShowQuickActions,
  onShowKeyboardShortcuts
}) => {
  
  const tools = [
    {
      id: 'select' as const,
      name: 'Select',
      icon: MousePointer,
      description: 'Select and move components (click wires to edit)'
    },
    {
      id: 'pan' as const,
      name: 'Pan',
      icon: Hand,
      description: 'Pan and navigate the canvas'
    },
    {
      id: 'wire' as const,
      name: 'Wire',
      icon: Cable,
      description: 'Connect components with wires'
    },
    {
      id: 'component' as const,
      name: 'Component',
      icon: Cpu,
      description: 'Place components on canvas'
    }
  ];

  return (
    <div className="bg-background border-b border-border">
      <div className="px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          {/* Logo/Title and Tools */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
            {/* Logo/Title - Compact on mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
              <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground truncate">
                <span className="hidden sm:inline">Digital Circuit Simulator</span>
                <span className="sm:hidden">Circuit Sim</span>
              </h1>
            </div>

            {/* Tool Selection - Compact buttons on mobile */}
            <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-muted rounded-md sm:rounded-lg">
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
                    className="h-8 w-8 sm:h-9 sm:w-auto p-1 sm:px-3 flex items-center justify-center sm:gap-2"
                  >
                    <IconComponent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden md:inline text-xs sm:text-sm">{tool.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Start - Lessons & Examples */}
            <Button
              variant="default"
              size="sm"
              onClick={onShowQuickActions}
              title="Open Quick Start (Ctrl+K)"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Lightbulb className="h-4 w-4" />
              <span className="hidden md:inline ml-1.5">Quick Start</span>
            </Button>

            {/* Keyboard Shortcuts */}
            <Button
              variant="outline"
              size="sm"
              onClick={onShowKeyboardShortcuts}
              title="View Keyboard Shortcuts (?)"
            >
              <Keyboard className="h-4 w-4" />
              <span className="hidden lg:inline ml-1.5">Shortcuts</span>
            </Button>

            {/* Boolean Expression Toggle */}
            <Button
              variant={showBooleanExpression ? "default" : "outline"}
              size="sm"
              onClick={onToggleBooleanExpression}
              title="Toggle Boolean Expression Input"
            >
              <Calculator className="h-4 w-4" />
              {showBooleanExpression ? (
                <ChevronUp className="h-4 w-4 ml-1 hidden sm:block" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1 hidden sm:block" />
              )}
              <span className="hidden sm:inline ml-1">Boolean</span>
            </Button>
            
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