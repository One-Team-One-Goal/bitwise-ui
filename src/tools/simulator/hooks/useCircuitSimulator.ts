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
    simulatorRef.current.setComponents(circuitState.components);
    simulatorRef.current.setConnections(circuitState.connections);
    if (circuitState.components.length > 0 || circuitState.connections.length > 0) {
      simulatorRef.current.start();
      setCircuitState(prev => ({ ...prev, isSimulating: true }));
    }
  }, [circuitState.components, circuitState.connections]);

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
        console.warn('Cannot create connection: component not found');
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
      
      // Check if the input is already connected
      const existingInputConnection = prev.connections.find(conn =>
        conn.to.componentId === toComponentId && conn.to.connectionPointId === toConnectionPointId
      );
      
      if (existingInputConnection) {
        console.warn('Cannot create connection: input already connected. Removing old connection first.');
        // Remove the existing connection automatically
        prev = {
          ...prev,
          connections: prev.connections.filter(c => c.id !== existingInputConnection.id)
        };
      }
      
      // Check for duplicate connection
      const existingConnection = prev.connections.find(conn =>
        (conn.from.componentId === fromComponentId && conn.from.connectionPointId === fromConnectionPointId &&
         conn.to.componentId === toComponentId && conn.to.connectionPointId === toConnectionPointId)
      );
      
      if (existingConnection) {
        console.warn('Cannot create connection: connection already exists between these points');
        return prev;
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
      
      console.log('Connection created successfully:', newConnection.id);
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
      
      return {
        ...prev,
        components: updatedComponents,
        connections: [...prev.connections, newConnection],
      };
    });
    return createdConnection;
  }, []);

  const removeConnection = useCallback((connectionId: string) => {
    setCircuitState(prev => {
      const connection = prev.connections.find(c => c.id === connectionId);
      if (!connection) return prev;
      const updatedComponents = prev.components.map(component => {
        if (component.id === connection.from.componentId) {
          const output = component.outputs.find(o => o.id === connection.from.connectionPointId);
          if (output) output.connected = false;
          return { ...component };
        }
        if (component.id === connection.to.componentId) {
          const input = component.inputs.find(i => i.id === connection.to.connectionPointId);
          if (input) input.connected = false;
          return { ...component };
        }
        return component;
      });
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
    setCircuitState(prev => ({
      ...prev,
      isSimulating: false,
      components: prev.components.map(component => ({
        ...component,
        outputs: component.outputs.map(output => ({ ...output, value: false }))
      })),
      connections: prev.connections.map(connection => ({ ...connection, value: false }))
    }));
  }, []);

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
    setCircuitState(prev => ({
      ...prev,
      components: [],
      connections: [],
      selectedComponent: null,
      selectedConnection: null
    }));
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