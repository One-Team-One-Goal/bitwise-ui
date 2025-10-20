import { useState, useCallback, useRef, useEffect } from 'react';
import type { CircuitState, Component, Connection, ComponentType, Position } from '../types';
import { CircuitSimulator } from '../engine/simulator';
import { ComponentFactory } from '../utils/componentFactory';

export const useCircuitSimulator = () => {
  const [circuitState, setCircuitState] = useState<CircuitState>({
    components: [],
    connections: [],
    selectedComponent: null,
    selectedConnection: null,
    isSimulating: false,
    simulationSpeed: 100,
    gridSize: 20,
    snapToGrid: true
  });

  const simulatorRef = useRef<CircuitSimulator>(new CircuitSimulator());

  useEffect(() => {
    // Update simulator state when components or connections change
    simulatorRef.current.setComponents(circuitState.components);
    simulatorRef.current.setConnections(circuitState.connections);
  }, [circuitState.components, circuitState.connections]);

  // Sync simulator state back to React state periodically (only update values, not structure)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (circuitState.isSimulating) {
        const updatedComponents = simulatorRef.current.getComponents();
        const updatedConnections = simulatorRef.current.getConnections();
        
        setCircuitState(prev => {
          // Only update if there are actual value changes
          const componentsChanged = prev.components.some((comp, idx) => {
            const updated = updatedComponents[idx];
            if (!updated) return false;
            
            // Check if any input/output values changed
            return comp.inputs.some((input, i) => input.value !== updated.inputs[i]?.value) ||
                   comp.outputs.some((output, i) => output.value !== updated.outputs[i]?.value);
          });
          
          const connectionsChanged = prev.connections.some((conn, idx) => {
            const updated = updatedConnections[idx];
            return updated && conn.value !== updated.value;
          });
          
          if (!componentsChanged && !connectionsChanged) {
            return prev; // No changes, don't update state
          }
          
          // Update only the values, preserve positions and paths
          return {
            ...prev,
            components: prev.components.map(comp => {
              const updated = updatedComponents.find(u => u.id === comp.id);
              if (!updated) return comp;
              
              return {
                ...comp,
                inputs: comp.inputs.map((input, i) => ({
                  ...input,
                  value: updated.inputs[i]?.value ?? input.value
                })),
                outputs: comp.outputs.map((output, i) => ({
                  ...output,
                  value: updated.outputs[i]?.value ?? output.value
                }))
              };
            }),
            connections: prev.connections.map(conn => {
              const updated = updatedConnections.find(u => u.id === conn.id);
              if (!updated) return conn;
              
              return {
                ...conn,
                value: updated.value
              };
            })
          };
        });
      }
    }, 50); // Sync every 50ms

    return () => clearInterval(syncInterval);
  }, [circuitState.isSimulating]);

  // Start the simulator once on mount
  useEffect(() => {
    try {
      simulatorRef.current.start?.();
      setCircuitState(prev => ({ ...prev, isSimulating: true }));
    } catch (err) {
      // If start throws or is not defined, ignore
    }
    return () => {
      try { simulatorRef.current.stop?.(); } catch (e) {}
    };
  }, []);

  const addComponent = useCallback((type: ComponentType, position: Position) => {
    const component = ComponentFactory.createComponent(type, position);
    setCircuitState(prev => ({ ...prev, components: [...prev.components, component] }));
    return component;
  }, []);

  const removeComponent = useCallback((componentId: string) => {
    setCircuitState(prev => {
      const connectionsToRemove = prev.connections.filter(
        c => c.from.componentId === componentId || c.to.componentId === componentId
      );
      const updatedComponents = prev.components.map(component => {
        if (component.id === componentId) return component;
        const updatedInputs = component.inputs.map(input => {
          const wasConnected = connectionsToRemove.some(conn =>
            (conn.to.componentId === component.id && conn.to.connectionPointId === input.id) ||
            (conn.from.componentId === component.id && conn.from.connectionPointId === input.id)
          );
          return wasConnected ? { ...input, connected: false, value: false } : input;
        });
        const updatedOutputs = component.outputs.map(output => {
          const wasConnected = connectionsToRemove.some(conn =>
            (conn.to.componentId === component.id && conn.to.connectionPointId === output.id) ||
            (conn.from.componentId === component.id && conn.from.connectionPointId === output.id)
          );
          return wasConnected ? { ...output, connected: false } : output;
        });
        return { ...component, inputs: updatedInputs, outputs: updatedOutputs };
      }).filter(c => c.id !== componentId);
      return {
        ...prev,
        components: updatedComponents,
        connections: prev.connections.filter(
          c => c.from.componentId !== componentId && c.to.componentId !== componentId
        ),
        selectedComponent: prev.selectedComponent === componentId ? null : prev.selectedComponent
      };
    });
  }, []);

  const updateComponent = useCallback((componentId: string, updates: Partial<Component>) => {
    setCircuitState(prev => ({
      ...prev,
      components: prev.components.map(c =>
        c.id === componentId ? { ...c, ...updates } : c
      )
    }));
  }, []);

  const moveComponent = useCallback((componentId: string, position: Position) => {
    updateComponent(componentId, { position });
  }, [updateComponent]);

  const addConnection = useCallback((
    fromComponentId: string,
    fromConnectionPointId: string,
    toComponentId: string,
    toConnectionPointId: string
  ) => {
    let createdConnection: Connection | null = null;
    
    setCircuitState(prev => {
      const fromComponent = prev.components.find(c => c.id === fromComponentId);
      const toComponent = prev.components.find(c => c.id === toComponentId);
      
      if (!fromComponent || !toComponent) {
        console.warn('[addConnection] Cannot create connection: component not found');
        return prev;
      }
      
      // FIX BUG #3: Check for exact duplicate FIRST to prevent StrictMode double-creation
      const exactDuplicate = prev.connections.find(conn =>
        (conn.from.componentId === fromComponentId && conn.from.connectionPointId === fromConnectionPointId &&
         conn.to.componentId === toComponentId && conn.to.connectionPointId === toConnectionPointId)
      );
      
      if (exactDuplicate) {
        console.warn('[addConnection] BLOCKED: Connection already exists:', exactDuplicate.id);
        return prev;
      }
      
      // Prevent connecting a component to itself
      if (fromComponentId === toComponentId) {
        console.warn('Cannot create connection: cannot connect component to itself');
        return prev;
      }
      
      const fromPoint = fromComponent.outputs.find(o => o.id === fromConnectionPointId);
      const toPoint = toComponent.inputs.find(i => i.id === toConnectionPointId);
      
      if (!fromPoint || !toPoint) {
        console.warn('Cannot create connection: connection point not found');
        return prev;
      }
      
      // Debug logging for connection attempts
      console.log('[addConnection] Attempting connection:', {
        from: `${fromComponentId} -> ${fromConnectionPointId}`,
        to: `${toComponentId} -> ${toConnectionPointId}`,
        existingConnections: prev.connections.length
      });
      
      // Check if the input is already connected to a DIFFERENT source
      const existingInputConnection = prev.connections.find(conn =>
        conn.to.componentId === toComponentId && conn.to.connectionPointId === toConnectionPointId
      );
      
      // If input is already connected to a different source, remove old connection
      // (This allows re-routing but prevents issues with secondary inputs)
      let connectionsToUse = prev.connections;
      if (existingInputConnection) {
        console.log('[addConnection] Input already connected, replacing old connection:', existingInputConnection.id);
        connectionsToUse = prev.connections.filter(c => c.id !== existingInputConnection.id);
      } else {
        console.log('[addConnection] Input is free, proceeding with new connection');
      }
      
      const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newConnection: Connection = {
        id: connectionId,
        from: { componentId: fromComponentId, connectionPointId: fromConnectionPointId },
        to: { componentId: toComponentId, connectionPointId: toConnectionPointId },
        path: [
          { x: fromComponent.position.x + fromPoint.position.x, y: fromComponent.position.y + fromPoint.position.y },
          { x: toComponent.position.x + toPoint.position.x, y: toComponent.position.y + toPoint.position.y }
        ],
        value: false
      };
      
      createdConnection = newConnection;
      
      // Update connection point states
      const updatedComponents = prev.components.map(component => {
        if (component.id === fromComponentId) {
          return {
            ...component,
            outputs: component.outputs.map(o => 
              o.id === fromConnectionPointId ? { ...o, connected: true } : o
            )
          };
        }
        if (component.id === toComponentId) {
          return {
            ...component,
            inputs: component.inputs.map(i => 
              i.id === toConnectionPointId ? { ...i, connected: true } : i
            )
          };
        }
        return component;
      });
      
      console.log('[addConnection] Successfully created connection:', newConnection.id);
      
      return {
        ...prev,
        components: updatedComponents,
        connections: [...connectionsToUse, newConnection], // Use filtered connections
      };
    });
    
    console.log('[addConnection] Final result:', createdConnection ? 'SUCCESS' : 'FAILED');
    return createdConnection;
  }, []);

  const removeConnection = useCallback((connectionId: string) => {
    console.log('[removeConnection] Removing connection:', connectionId);
    setCircuitState(prev => {
      const connection = prev.connections.find(c => c.id === connectionId);
      if (!connection) {
        console.warn('[removeConnection] Connection not found:', connectionId);
        return prev;
      }
      
      console.log('[removeConnection] Found connection:', {
        from: `${connection.from.componentId} -> ${connection.from.connectionPointId}`,
        to: `${connection.to.componentId} -> ${connection.to.connectionPointId}`
      });
      
      // CRITICAL FIX: Deep copy components to prevent state mutation
      const updatedComponents = prev.components.map(component => {
        if (component.id === connection.from.componentId) {
          // Deep copy outputs array and update the specific output
          return {
            ...component,
            outputs: component.outputs.map(o => 
              o.id === connection.from.connectionPointId 
                ? { ...o, connected: false } 
                : { ...o }
            )
          };
        }
        if (component.id === connection.to.componentId) {
          // Deep copy inputs array and update the specific input
          return {
            ...component,
            inputs: component.inputs.map(i => 
              i.id === connection.to.connectionPointId 
                ? { ...i, connected: false } 
                : { ...i }
            )
          };
        }
        return component;
      });
      
      console.log('[removeConnection] Successfully removed connection');
      
      return {
        ...prev,
        components: updatedComponents,
        connections: prev.connections.filter(c => c.id !== connectionId),
        selectedConnection: prev.selectedConnection === connectionId ? null : prev.selectedConnection
      };
    });
  }, []);

  const updateConnection = useCallback((connectionId: string, updates: Partial<Connection>) => {
    setCircuitState(prev => ({
      ...prev,
      connections: prev.connections.map(connection => {
        if (connection.id !== connectionId) {
          return connection;
        }
        const updatedConnection: Connection = {
          ...connection,
          ...updates
        };
        if (updates.path) {
          updatedConnection.path = updates.path.map(point => ({ ...point }));
        }
        return updatedConnection;
      })
    }));
  }, []);

  const selectComponent = useCallback((componentId: string | null) => {
    setCircuitState(prev => ({
      ...prev,
      selectedComponent: componentId,
      selectedConnection: null
    }));
  }, []);

  const selectConnection = useCallback((connectionId: string | null) => {
    setCircuitState(prev => ({
      ...prev,
      selectedConnection: connectionId,
      selectedComponent: null
    }));
  }, []);

  const startSimulation = useCallback(() => {
    simulatorRef.current.start();
    setCircuitState(prev => ({ ...prev, isSimulating: true }));
  }, []);

  const stopSimulation = useCallback(() => {
    simulatorRef.current.stop();
    setCircuitState(prev => ({ ...prev, isSimulating: false }));
  }, []);

  const resetSimulation = useCallback(() => {
    simulatorRef.current.reset();
    
    // Reset all component values
    const resetComponents = circuitState.components.map(component => ({
      ...component,
      inputs: component.inputs.map(input => ({ ...input, value: false })),
      outputs: component.outputs.map(output => ({ ...output, value: false }))
    }));
    
    const resetConnections = circuitState.connections.map(connection => ({ 
      ...connection, 
      value: false 
    }));
    
    setCircuitState(prev => ({
      ...prev,
      components: resetComponents,
      connections: resetConnections
    }));
    
    // Update simulator with reset values
    simulatorRef.current.setComponents(resetComponents);
    simulatorRef.current.setConnections(resetConnections);
    
    // Restart simulation
    if (!circuitState.isSimulating) {
      simulatorRef.current.start();
      setCircuitState(prev => ({ ...prev, isSimulating: true }));
    }
  }, [circuitState.components, circuitState.connections, circuitState.isSimulating]);

  const setSimulationSpeed = useCallback((speed: number) => {
    simulatorRef.current.setSimulationSpeed(speed);
    setCircuitState(prev => ({ ...prev, simulationSpeed: speed }));
  }, []);

  const toggleComponentInput = useCallback((componentId: string, inputId: string) => {
    setCircuitState(prev => ({
      ...prev,
      components: prev.components.map(component => {
        if (component.id === componentId) {
          const updatedInputs = component.inputs.map(input => {
            if (input.id === inputId) {
              return { ...input, value: !input.value };
            }
            return input;
          });
          return { ...component, inputs: updatedInputs };
        }
        return component;
      })
    }));
  }, []);

  const clearAll = useCallback(() => {
    stopSimulation();
    // Reset simulator completely
    simulatorRef.current.reset();
    simulatorRef.current.setComponents([]);
    simulatorRef.current.setConnections([]);
    
    setCircuitState(prev => ({
      ...prev,
      components: [],
      connections: [],
      selectedComponent: null,
      selectedConnection: null,
      isSimulating: false
    }));
    
    // Restart simulation after clearing
    setTimeout(() => {
      simulatorRef.current.start();
      setCircuitState(prev => ({ ...prev, isSimulating: true }));
    }, 100);
  }, [stopSimulation]);

  const setGridSize = useCallback((size: number) => {
    setCircuitState(prev => ({ ...prev, gridSize: size }));
  }, []);

  const toggleSnapToGrid = useCallback(() => {
    setCircuitState(prev => ({ ...prev, snapToGrid: !prev.snapToGrid }));
  }, []);

  return {
    circuitState,
    addComponent,
    removeComponent,
    updateComponent,
    moveComponent,
    addConnection,
    removeConnection,
    updateConnection,
    selectComponent,
    selectConnection,
    startSimulation,
    stopSimulation,
    resetSimulation,
    setSimulationSpeed,
    toggleComponentInput,
    clearAll,
    setGridSize,
    toggleSnapToGrid,
    setCircuitState,
    simulator: simulatorRef.current
  };
}