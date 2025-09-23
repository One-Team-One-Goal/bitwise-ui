import React from 'react';
import type { Component, Connection } from '../types';
import { COMPONENT_DEFINITIONS } from '../utils/componentFactory';

interface PropertiesPanelProps {
  circuitHook: any; // We'll type this properly later
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
          <div className="space-y-3">
            {/* Basic Info */}
            <div>
              <div className="mt-1 text-sm text-gray-900">{definition.name}</div>
            </div>

            {/* Position */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">X Position</label>
                <input
                  type="number"
                  value={Math.round(component.position.x)}
                  onChange={(e) => {
                    const newPosition = { ...component.position, x: Number(e.target.value) };
                    circuitHook.updateComponent(component.id, { position: newPosition });
                  }}
                  className="mt-1 block w-full text-sm border border-gray-300 rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Y Position</label>
                <input
                  type="number"
                  value={Math.round(component.position.y)}
                  onChange={(e) => {
                    const newPosition = { ...component.position, y: Number(e.target.value) };
                    circuitHook.updateComponent(component.id, { position: newPosition });
                  }}
                  className="mt-1 block w-full text-sm border border-gray-300 rounded px-2 py-1"
                />
              </div>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Width</label>
                <input
                  type="number"
                  value={component.size.width}
                  onChange={(e) => {
                    const newSize = { ...component.size, width: Number(e.target.value) };
                    circuitHook.updateComponent(component.id, { size: newSize });
                  }}
                  className="mt-1 block w-full text-sm border border-gray-300 rounded px-2 py-1"
                  min="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Height</label>
                <input
                  type="number"
                  value={component.size.height}
                  onChange={(e) => {
                    const newSize = { ...component.size, height: Number(e.target.value) };
                    circuitHook.updateComponent(component.id, { size: newSize });
                  }}
                  className="mt-1 block w-full text-sm border border-gray-300 rounded px-2 py-1"
                  min="20"
                />
              </div>
            </div>

            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Label</label>
              <input
                type="text"
                value={component.label || ''}
                onChange={(e) => {
                  circuitHook.updateComponent(component.id, { label: e.target.value });
                }}
                className="mt-1 block w-full text-sm border border-gray-300 rounded px-2 py-1"
                placeholder="Enter label..."
              />
            </div>

            {/* Rotation */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Rotation</label>
              <select
                value={component.rotation}
                onChange={(e) => {
                  circuitHook.updateComponent(component.id, { rotation: Number(e.target.value) });
                }}
                className="mt-1 block w-full text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value={0}>0°</option>
                <option value={90}>90°</option>
                <option value={180}>180°</option>
                <option value={270}>270°</option>
              </select>
            </div>

            {/* Interactive Controls for Input Components */}
            {(component.type === 'SWITCH' || component.type === 'PUSH_BUTTON') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Control</label>
                <button
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    component.outputs[0]?.value
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                  onClick={() => {
                    if (component.outputs[0]) {
                      const newOutputs = component.outputs.map(output => 
                        output.id === component.outputs[0].id 
                          ? { ...output, value: !output.value }
                          : output
                      );
                      circuitHook.updateComponent(component.id, { outputs: newOutputs });
                    }
                  }}
                >
                  {component.type === 'SWITCH' ? 'Toggle Switch' : 'Press Button'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Connection Points */}
        {(component.inputs.length > 0 || component.outputs.length > 0) && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-2">Connection Points</h4>
            
            {component.inputs.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-1">Inputs</h5>
                <div className="space-y-1">
                  {component.inputs.map((input, index) => (
                    <div key={input.id} className="flex items-center justify-between text-xs">
                      <span>Input {index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`w-3 h-3 rounded-full ${
                          input.value ? 'bg-red-500' : 'bg-gray-300'
                        }`} />
                        <span className={input.connected ? 'text-green-600' : 'text-gray-500'}>
                          {input.connected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {component.outputs.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Outputs</h5>
                <div className="space-y-1">
                  {component.outputs.map((output, index) => (
                    <div key={output.id} className="flex items-center justify-between text-xs">
                      <span>Output {index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`w-3 h-3 rounded-full ${
                          output.value ? 'bg-red-500' : 'bg-gray-300'
                        }`} />
                        <span className={output.connected ? 'text-green-600' : 'text-gray-500'}>
                          {output.connected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200">
          <button
            className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            onClick={() => {
              circuitHook.removeComponent(component.id);
            }}
          >
            Delete Component
          </button>
        </div>
      </div>
    );
  };

  const renderConnectionProperties = (connection: Connection) => {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Properties</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID</label>
              <div className="mt-1 text-sm text-gray-900 font-mono">{connection.id}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Signal Value</label>
              <div className={`mt-1 text-sm font-medium ${
                connection.value ? 'text-red-600' : 'text-gray-600'
              }`}>
                {connection.value ? 'HIGH (1)' : 'LOW (0)'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">From</label>
              <div className="mt-1 text-sm text-gray-900">
                {connection.from.componentId} → {connection.from.connectionPointId}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">To</label>
              <div className="mt-1 text-sm text-gray-900">
                {connection.to.componentId} → {connection.to.connectionPointId}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            onClick={() => {
              circuitHook.removeConnection(connection.id);
            }}
          >
            Delete Connection
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Properties</h2>
        
        {selectedComponent ? (
          renderComponentProperties(selectedComponent)
        ) : selectedConnection ? (
          renderConnectionProperties(selectedConnection)
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">⚙️</div>
            <p className="text-gray-500">Select a component or connection to view its properties</p>
          </div>
        )}
      </div>
    </div>
  );
};