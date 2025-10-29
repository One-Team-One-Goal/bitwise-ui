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
  isMobile?: boolean;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  onComponentSelect,
  selectedComponentType,
  isMobile = false
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
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
    const baseClasses = 'w-full justify-between h-10 px-2 flex-shrink-0 rounded-md transition-colors border';
    const stateClasses = isSelected
      ? 'border-primary/40 bg-primary/10 text-primary shadow-sm hover:bg-primary/15'
      : 'border-transparent hover:bg-muted/60';
    
    return (
      <TooltipProvider key={definition.type}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`${baseClasses} ${stateClasses}`}
              onClick={() => onComponentSelect(definition.type)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`text-sm font-mono rounded px-1.5 py-0.5 min-w-[1.5rem] text-center flex-shrink-0 ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted/80 text-foreground'}`}>
                  {definition.icon}
                </div>
                <div className={`text-xs font-medium truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>{definition.name}</div>
              </div>
              <Info className={`h-3 w-3 flex-shrink-0 ml-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="text-xs">{definition.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Mobile horizontal layout with categories
  if (isMobile) {
    return (
      <div className="bg-background">
        {/* Category Tabs */}
        <div className="border-b border-border overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="flex gap-1 px-3 py-2 min-w-max">
            {categories.map(category => {
              const isExpanded = expandedCategories.has(category.id);
              const IconComponent = category.icon;
              const components = ComponentFactory.getDefinitionsByCategory(category.id as any);
              
              return (
                <Button
                  key={category.id}
                  variant={isExpanded ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-1.5 h-9 px-3 flex-shrink-0"
                  onClick={() => toggleCategory(category.id)}
                >
                  <IconComponent className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{category.name}</span>
                  <span className="text-xs opacity-60">({components.length})</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Component Grid */}
        <div className="px-3 py-3">
          {Array.from(expandedCategories).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm font-medium">Select a category above</p>
              <p className="text-xs mt-1">Tap a category to view its components</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.filter(cat => expandedCategories.has(cat.id)).map(category => {
                const components = ComponentFactory.getDefinitionsByCategory(category.id as any);
                
                return (
                  <div key={category.id}>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {components.map(definition => {
                        const isSelected = selectedComponentType === definition.type;
                        return (
                          <TooltipProvider key={definition.type}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  className="h-20 w-full flex flex-col items-center justify-center gap-1.5 p-2"
                                  onClick={() => onComponentSelect(definition.type)}
                                >
                                  <div className="text-2xl font-mono">{definition.icon}</div>
                                  <div className="text-[10px] font-medium leading-tight text-center line-clamp-2 w-full">
                                    {definition.name}
                                  </div>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="text-xs font-semibold">{definition.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">{definition.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop vertical layout
  return (
    <div className="h-full w-full bg-background border-r border-border flex flex-col">
      <div className="p-3 border-b border-border flex-shrink-0">
        <h3 className="text-sm font-semibold">Components</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Click to select, then place on canvas
        </p>
      </div>

      <ScrollArea className="flex-1 min-h-0 w-full">
        <div className="p-2 space-y-1.5 w-full">
          {categories.map(category => {
            const isExpanded = expandedCategories.has(category.id);
            const components = ComponentFactory.getDefinitionsByCategory(category.id as any);
            const IconComponent = category.icon;
            const categoryButtonClasses = `w-full justify-between h-9 px-3 rounded-md transition-colors border ${
              isExpanded ? 'bg-muted/80 text-foreground border-border/70 shadow-sm hover:bg-muted' : 'border-transparent hover:bg-muted/60'
            }`;

            return (
              <div key={category.id} className="flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className={categoryButtonClasses}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center h-6 w-6 rounded-sm ${isExpanded ? 'bg-primary/20 text-primary' : 'bg-muted/70 text-muted-foreground'}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold tracking-wide">{category.name}</span>
                    <span className={`text-xs ${isExpanded ? 'text-primary' : 'text-muted-foreground'}`}>({components.length})</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>

                {isExpanded && (
                  <div className="mt-2 rounded-md border border-border/60 bg-muted/20 p-2 transition-colors">
                    {components.length > 6 ? (
                      <ScrollArea className="h-64 pr-1">
                        <div className="space-y-1">
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