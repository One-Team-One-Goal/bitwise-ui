import React, { useState } from 'react';
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
    { id: 'gates', name: 'Logic Gates', icon: '⚡' },
    { id: 'flipflops', name: 'Flip-Flops', icon: '🔄' },
    { id: 'inputs', name: 'Input Controls', icon: '📥' },
    { id: 'outputs', name: 'Output Controls', icon: '📤' },
    { id: 'other', name: 'Other', icon: '🔧' }
  ];

  const renderComponentButton = (definition: any) => {
    const isSelected = selectedComponentType === definition.type;
    
    return (
      <button
        key={definition.type}
        className={`w-full p-3 mb-2 border rounded-lg text-left transition-all duration-200 ${
          isSelected
            ? 'bg-blue-100 border-blue-500 text-blue-800'
            : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        }`}
        onClick={() => onComponentSelect(definition.type)}
        title={definition.description}
      >
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{definition.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{definition.name}</div>
            <div className="text-xs text-gray-500 truncate">{definition.description}</div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <p className="text-sm text-gray-600 mt-1">Click to select, then click on canvas to place</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {categories.map(category => {
          const isExpanded = expandedCategories.has(category.id);
          const components = ComponentFactory.getDefinitionsByCategory(category.id as any);

          return (
            <div key={category.id} className="border-b border-gray-100">
              <button
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm text-gray-500">({components.length})</span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isExpanded ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4">
                  {components.map(renderComponentButton)}
                </div>
              )}
            </div>
          );
        })}
        
      </div>
    </div>
  );
};