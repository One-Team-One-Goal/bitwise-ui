import React, { useState } from 'react';
import { 
  Zap, 
  RotateCcw, 
  Download, 
  Upload, 
  Settings,
  ChevronDown,
  ChevronRight,
  Cpu,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ComponentType } from '../types';
import { ComponentFactory } from '../utils/componentFactory';

interface ComponentPaletteProps {
  onComponentSelect: (componentType: ComponentType) => void;
  selectedComponentType: ComponentType | null;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  onComponentSelect,
  selectedComponentType
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['gates', 'inputs', 'outputs'])
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const categories = [
    { id: 'gates', name: 'Logic Gates', icon: Zap },
    { id: 'flipflops', name: 'Flip-Flops', icon: RotateCcw },
    { id: 'inputs', name: 'Input Controls', icon: Download },
    { id: 'outputs', name: 'Output Controls', icon: Upload },
    { id: 'circuits', name: 'Premade Circuits', icon: Cpu },
    { id: 'other', name: 'Other', icon: Settings }
  ];

  const renderComponentButton = (definition: any) => {
    const isSelected = selectedComponentType === definition.type;
    
    return (
      <TooltipProvider key={definition.type}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isSelected ? "outline" : "ghost"}
              size="sm"
              className="w-full justify-between h-10 p-2 flex-shrink-0"
              onClick={() => onComponentSelect(definition.type)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-sm font-mono bg-muted rounded px-1.5 py-0.5 min-w-[1.5rem] text-center flex-shrink-0">
                  {definition.icon}
                </div>
                <div className="text-xs font-medium truncate">{definition.name}</div>
              </div>
              <Info className="h-3 w-3 text-muted-foreground flex-shrink-0 ml-1" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="text-xs">{definition.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="h-full bg-background border-r border-border flex flex-col">
      <div className="p-4 border-b border-border flex-shrink-0">
        <h3 className="text-sm font-medium">Components</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Select component, then click canvas to place
        </p>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-2">
          {categories.map(category => {
            const isExpanded = expandedCategories.has(category.id);
            const components = ComponentFactory.getDefinitionsByCategory(category.id as any);
            const IconComponent = category.icon;

            return (
              <div key={category.id} className="flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between h-8 px-2"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-xs text-muted-foreground">({components.length})</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>

                {isExpanded && (
                  <div className="mt-2">
                    {components.length > 6 ? (
                      <ScrollArea className="h-64">
                        <div className="space-y-1 pr-2">
                          {components.map(renderComponentButton)}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="space-y-1 overflow-hidden">
                        {components.map(renderComponentButton)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};