import React from 'react';
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
      icon: '👆',
      description: 'Select and move components'
    },
    {
      id: 'pan' as const,
      name: 'Pan',
      icon: '✋',
      description: 'Pan the canvas'
    },
    {
      id: 'wire' as const,
      name: 'Wire',
      icon: '🔗',
      description: 'Connect components'
    },
    {
      id: 'component' as const,
      name: 'Component',
      icon: '⚡',
      description: 'Place components'
    }
  ];

  const ToolButton: React.FC<{
    tool: typeof tools[0];
    isSelected: boolean;
    onClick: () => void;
  }> = ({ tool, isSelected, onClick }) => (
    <button
      className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
        isSelected
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
      }`}
      onClick={onClick}
      title={tool.description}
    >
      <span className="text-lg">{tool.icon}</span>
      <span className="hidden sm:inline text-sm font-medium">{tool.name}</span>
    </button>
  );

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Logo/Title */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl">⚡</div>
            <h1 className="text-xl font-bold text-gray-900">Circuit Simulator</h1>
          </div>

          {/* Tool Selection */}
          <div className="hidden md:flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
            {tools.map(tool => (
              <ToolButton
                key={tool.id}
                tool={tool}
                isSelected={toolbarState.selectedTool === tool.id}
                onClick={() => onToolSelect(tool.id)}
              />
            ))}
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center space-x-3">
          {/* Simulation Speed */}
          <div className="hidden lg:flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Speed:</label>
            <select
              value={circuitHook.circuitState.simulationSpeed}
              onChange={(e) => circuitHook.setSimulationSpeed(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value={50}>Fast</option>
              <option value={100}>Normal</option>
              <option value={200}>Slow</option>
              <option value={500}>Very Slow</option>
            </select>
          </div>

          {/* Grid Toggle */}
          <button
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              circuitHook.circuitState.snapToGrid
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
            onClick={circuitHook.toggleSnapToGrid}
            title="Toggle snap to grid"
          >
            <div className="flex items-center space-x-1">
              <span>⊞</span>
              <span className="hidden sm:inline">Grid</span>
            </div>
          </button>

          {/* Auto-Simulation Status */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg border border-green-300">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">Auto-Sim</span>
            </div>

            <button
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
              onClick={circuitHook.resetSimulation}
              title="Reset simulation"
            >
              <span>🔄</span>
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          {/* Clear All */}
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            onClick={circuitHook.clearAll}
            title="Clear all components"
          >
            <span>🗑️</span>
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Mobile tool selection */}
      <div className="md:hidden mt-4 flex items-center space-x-2 overflow-x-auto">
        {tools.map(tool => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isSelected={toolbarState.selectedTool === tool.id}
            onClick={() => onToolSelect(tool.id)}
          />
        ))}
      </div>
    </div>
  );
};