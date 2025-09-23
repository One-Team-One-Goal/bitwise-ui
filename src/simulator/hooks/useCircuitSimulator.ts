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

  // Update simulator when components or connections change and auto-start simulation
  useEffect(() => {
    simulatorRef.current.setComponents(circuitState.components);
    simulatorRef.current.setConnections(circuitState.connections);
    
    // Auto-start simulation if there are components or connections
    if (circuitState.components.length > 0 || circuitState.connections.length > 0) {
      simulatorRef.current.start();
      setCircuitState(prev => ({
        ...prev,
        isSimulating: true
      }));
    }
  }, [circuitState.components, circuitState.connections]);

  const addComponent = useCallback((type: ComponentType, position: Position) => {
    const component = ComponentFactory.createComponent(type, position);
    setCircuitState(prev => ({
      ...prev,
      components: [...prev.components, component]
    }));
    return component;
  }, []);

  const removeComponent = useCallback((componentId: string) => {
    setCircuitState(prev => {
      // First, find all connections that will be removed
      const connectionsToRemove = prev.connections.filter(
        c => c.from.componentId === componentId || c.to.componentId === componentId
      );
      
      // Update components to mark connection points as disconnected
      const updatedComponents = prev.components.map(component => {
        if (component.id === componentId) return component; // This will be filtered out anyway
        
        // Check if any of this component's connection points were connected to the removed component
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
        
        return {
          ...component,
          inputs: updatedInputs,
          outputs: updatedOutputs
        };
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
    const fromComponent = circuitState.components.find(c => c.id === fromComponentId);
    const toComponent = circuitState.components.find(c => c.id === toComponentId);

    if (!fromComponent || !toComponent) {
      console.warn('Cannot create connection: component not found');
      return null;
    }

    // Validate connection direction: output to input only
    const fromPoint = fromComponent.outputs.find(o => o.id === fromConnectionPointId);
    const toPoint = toComponent.inputs.find(i => i.id === toConnectionPointId);

    if (!fromPoint || !toPoint) {
      console.warn('Cannot create connection: invalid connection points or wrong direction (output->input only)');
      return null;
    }

    // Check if connection points are already connected
    if (fromPoint.connected || toPoint.connected) {
      console.warn('Cannot create connection: one or both connection points already connected');
      return null;
    }

    // Prevent self-connections
    if (fromComponentId === toComponentId) {
      console.warn('Cannot create connection: self-connections not allowed');
      return null;
    }

    // Check for existing connection between same points
    const existingConnection = circuitState.connections.find(conn =>
      (conn.from.componentId === fromComponentId && conn.from.connectionPointId === fromConnectionPointId &&
       conn.to.componentId === toComponentId && conn.to.connectionPointId === toConnectionPointId) ||
      (conn.to.componentId === fromComponentId && conn.to.connectionPointId === fromConnectionPointId &&
       conn.from.componentId === toComponentId && conn.from.connectionPointId === toConnectionPointId)
    );

    if (existingConnection) {
      console.warn('Cannot create connection: connection already exists between these points');
      return null;
    }

    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const connection: Connection = {
      id: connectionId,
      from: { componentId: fromComponentId, connectionPointId: fromConnectionPointId },
      to: { componentId: toComponentId, connectionPointId: toConnectionPointId },
      path: [
        { x: fromComponent.position.x + fromPoint.position.x, y: fromComponent.position.y + fromPoint.position.y },
        { x: toComponent.position.x + toPoint.position.x, y: toComponent.position.y + toPoint.position.y }
      ],
      value: false
    };

    // Mark connection points as connected
    fromPoint.connected = true;
    toPoint.connected = true;

    setCircuitState(prev => ({
      ...prev,
      connections: [...prev.connections, connection],
      components: prev.components.map(c => {
        if (c.id === fromComponentId || c.id === toComponentId) {
          return { ...c };
        }
        return c;
      })
    }));

    console.log('Connection created successfully:', connectionId);
    return connection;
  }, [circuitState.components, circuitState.connections]);

  const removeConnection = useCallback((connectionId: string) => {
    const connection = circuitState.connections.find(c => c.id === connectionId);
    if (!connection) return;

    setCircuitState(prev => {
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
  }, [circuitState.connections]);

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
    setCircuitState(prev => ({
      ...prev,
      isSimulating: true
    }));
  }, []);

  const stopSimulation = useCallback(() => {
    simulatorRef.current.stop();
    setCircuitState(prev => ({
      ...prev,
      isSimulating: false
    }));
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
    setCircuitState(prev => ({
      ...prev,
      simulationSpeed: speed
    }));
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
    setCircuitState(prev => ({
      ...prev,
      gridSize: size
    }));
  }, []);

  const toggleSnapToGrid = useCallback(() => {
    setCircuitState(prev => ({
      ...prev,
      snapToGrid: !prev.snapToGrid
    }));
  }, []);

  return {
    circuitState,
    addComponent,
    removeComponent,
    updateComponent,
    moveComponent,
    addConnection,
    removeConnection,
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
    simulator: simulatorRef.current
  };
};