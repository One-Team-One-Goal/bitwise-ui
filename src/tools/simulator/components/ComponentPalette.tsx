import React, { useState } from 'react'
import {
  Zap,
  RotateCcw,
  Download,
  Upload,
  Settings,
  ChevronDown,
  ChevronRight,
  Cpu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { ComponentType, ComponentDefinition } from '../types'
import { ComponentFactory } from '../utils/componentFactory'

interface ComponentPaletteProps {
  onComponentSelect: (componentType: ComponentType) => void
  selectedComponentType: ComponentType | null
  isMobile?: boolean
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  onComponentSelect,
  selectedComponentType,
  isMobile = false,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['gates']) // Default to open 'Logic Gates'
  )

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  const categories = [
    { id: 'gates', name: 'Logic Gates', icon: Zap },
    { id: 'flipflops', name: 'Flip-Flops', icon: RotateCcw },
    { id: 'inputs', name: 'Input Controls', icon: Download },
    { id: 'outputs', name: 'Output Controls', icon: Upload },
    { id: 'circuits', name: 'Premade Circuits', icon: Cpu },
    { id: 'other', name: 'Other', icon: Settings },
  ]

  const renderComponentButton = (definition: ComponentDefinition) => {
    const isSelected = selectedComponentType === definition.type
    const stateClasses = isSelected
      ? 'bg-muted text-primary'
      : 'hover:bg-muted/50'

    return (
      <TooltipProvider key={definition.type} delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start h-9 px-2 rounded-md transition-colors ${stateClasses}`}
              onClick={() => onComponentSelect(definition.type)}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex items-center justify-center h-6 w-6 rounded text-xs font-mono shrink-0 ${isSelected ? 'bg-primary/20' : 'bg-muted'}`}
                >
                  {definition.icon}
                </div>
                <span className="text-xs font-medium truncate">
                  {definition.name}
                </span>
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs" align="start">
            <p className="font-semibold text-sm">{definition.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {definition.description}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Mobile horizontal layout with categories
  if (isMobile) {
    return (
      <div className="bg-background border-t flex flex-col max-h-[50vh] min-h-0">
        {/* Category Tabs */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent border-b">
          <div className="flex gap-2 px-3 py-2 min-w-max">
            {categories.map((category) => {
              const isExpanded = expandedCategories.has(category.id)
              const IconComponent = category.icon

              return (
                <Button
                  key={category.id}
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-full transition-colors ${
                    isExpanded
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <IconComponent className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{category.name}</span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Component Grid */}
        <ScrollArea className="flex-1 min-h-0 h-full">
          <div className="p-3">
            {Array.from(expandedCategories).length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm font-medium">Select a category</p>
                <p className="text-xs mt-1">
                  Tap on a category to view its components
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {categories
                  .filter((cat) => expandedCategories.has(cat.id))
                  .flatMap((category) =>
                    ComponentFactory.getDefinitionsByCategory(
                      category.id as ComponentDefinition['category']
                    )
                  )
                  .map((definition) => {
                    const isSelected = selectedComponentType === definition.type
                    return (
                      <TooltipProvider
                        key={definition.type}
                        delayDuration={300}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-20 w-full flex flex-col items-center justify-center gap-1.5 p-1 rounded-lg transition-colors ${
                                isSelected ? 'bg-muted text-primary' : ''
                              }`}
                              onClick={() => onComponentSelect(definition.type)}
                            >
                              <div className="text-xl font-mono">
                                {definition.icon}
                              </div>
                              <div className="text-[10px] font-medium leading-tight text-center line-clamp-2 w-full text-foreground">
                                {definition.name}
                              </div>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="font-semibold">{definition.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {definition.description}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    )
  }

  // Desktop vertical layout
  return (
    <aside className="h-full bg-background border-r flex flex-col min-h-0 w-full">
      <header className="p-4 border-b shrink-0">
        <p className="text-base font-semibold">Components</p>
      </header>

      <ScrollArea className="flex-1 min-h-0 h-full">
        <div className="p-2 space-y-1 w-full">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category.id)
            const components = ComponentFactory.getDefinitionsByCategory(
              category.id as ComponentDefinition['category']
            )
            const IconComponent = category.icon

            return (
              <div key={category.id}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between h-10 px-2 rounded-md"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComponent
                      className={`h-4 w-4 transition-colors ${isExpanded ? 'text-primary' : 'text-muted-foreground'}`}
                    />
                    <span className="text-xs font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {components.length}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </Button>

                {isExpanded && (
                  <div className="pl-4 pt-1 space-y-1">
                    {components.map(renderComponentButton)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </aside>
  )
}
