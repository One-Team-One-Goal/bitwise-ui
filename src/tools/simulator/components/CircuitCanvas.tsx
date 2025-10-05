import React, { useRef, useCallback, useState, useEffect } from 'react';
import type { Component, Connection, Position, ToolbarState } from '../types';
import { ConnectionRenderer } from './ConnectionRenderer';

interface CircuitCanvasProps {
  circuitHook: any;
  toolbarState: ToolbarState;
  onCanvasClick: (position: Position) => void;
  onToolSelect?: (tool: ToolbarState['selectedTool']) => void;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  circuitHook,
  toolbarState,
  onCanvasClick,
  onToolSelect
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    componentId: string | null;
    startPosition: Position;
    offset: Position;
  }>({
    isDragging: false,
    componentId: null,
    startPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  });

  // Keyboard event handling for deleting selected items
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle deletion if the user isn't typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        
        // Prioritize wire deletion when wire-edit tool is selected
        if (toolbarState.selectedTool === 'wire-edit' && circuitHook.circuitState.selectedConnection) {
          circuitHook.removeConnection(circuitHook.circuitState.selectedConnection);
        }
        // Handle wire deletion in any mode if a wire is selected
        else if (circuitHook.circuitState.selectedConnection) {
          circuitHook.removeConnection(circuitHook.circuitState.selectedConnection);
        }
        // Only delete components if no wire is selected
        else if (circuitHook.circuitState.selectedComponent) {
          circuitHook.removeComponent(circuitHook.circuitState.selectedComponent);
        }
      }
      
      // 'W' key to quickly switch to wire edit mode
      if (event.key === 'w' || event.key === 'W') {
        if (!event.ctrlKey && !event.metaKey && onToolSelect) {
          event.preventDefault();
          onToolSelect('wire-edit');
        }
      }
      
      // 'Escape' key to deselect everything
      if (event.key === 'Escape') {
        circuitHook.selectComponent(null);
        circuitHook.selectConnection(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [circuitHook.circuitState.selectedConnection, circuitHook.circuitState.selectedComponent, circuitHook, toolbarState.selectedTool]);

  const [panState, setPanState] = useState<{
    isPanning: boolean;
    startPosition: Position;
    startPan: Position;
  }>({
    isPanning: false,
    startPosition: { x: 0, y: 0 },
    startPan: { x: 0, y: 0 }
  });

  const [connectionState, setConnectionState] = useState<{
    isConnecting: boolean;
    startComponent: string | null;
    startConnectionPoint: string | null;
  }>({
    isConnecting: false,
    startComponent: null,
    startConnectionPoint: null
  });

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenPos: Position): Position => {
    return {
      x: (screenPos.x - pan.x) / zoom,
      y: (screenPos.y - pan.y) / zoom
    };
  }, [pan, zoom]);

  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (dragState.isDragging || panState.isPanning) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    const canvasPosition = screenToCanvas(screenPosition);

    // Clear selections unless clicking on a component
    const target = event.target as HTMLElement;
    if (target === canvasRef.current || target.classList.contains('canvas-background')) {
      circuitHook.selectComponent(null);
      circuitHook.selectConnection(null);
      
      // Reset connection state if clicking on empty canvas
      if (connectionState.isConnecting) {
        setConnectionState({
          isConnecting: false,
          startComponent: null,
          startConnectionPoint: null
        });
      }
    }

    onCanvasClick(canvasPosition);
  }, [dragState.isDragging, panState.isPanning, onCanvasClick, circuitHook, screenToCanvas, connectionState.isConnecting]);

  // Handle mouse down for canvas (pan tool)
  const handleCanvasMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.target !== canvasRef.current) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    if (toolbarState.selectedTool === 'pan') {
      setPanState({
        isPanning: true,
        startPosition: screenPosition,
        startPan: pan
      });
      event.preventDefault();
    }
  }, [toolbarState.selectedTool, pan]);

  // Handle component click for interactive controls
  const handleComponentClick = useCallback((componentId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Handle interactive input controls
    const component = circuitHook.circuitState.components.find((c: Component) => c.id === componentId);
    if (!component) return;

    if (component.type === 'SWITCH' || component.type === 'PUSH_BUTTON') {
      // Toggle the output value
      const newOutputs = component.outputs.map((output: any) => ({
        ...output,
        value: !output.value
      }));
      circuitHook.updateComponent(componentId, { outputs: newOutputs });
    }
  }, [circuitHook]);

  // Handle component mouse down
  const handleComponentMouseDown = useCallback((componentId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (toolbarState.selectedTool === 'select') {
      circuitHook.selectComponent(componentId);
      
      const component = circuitHook.circuitState.components.find((c: Component) => c.id === componentId);
      if (!component) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const screenPos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      
      const canvasPos = screenToCanvas(screenPos);
      
      setDragState({
        isDragging: true,
        componentId,
        startPosition: canvasPos,
        offset: {
          x: canvasPos.x - component.position.x,
          y: canvasPos.y - component.position.y
        }
      });
    }
  }, [toolbarState.selectedTool, circuitHook, screenToCanvas]);

  // Handle connection point click
  const handleConnectionPointClick = useCallback((componentId: string, connectionPointId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (toolbarState.selectedTool !== 'wire') return;

    if (!connectionState.isConnecting) {
      // Start a new connection
      setConnectionState({
        isConnecting: true,
        startComponent: componentId,
        startConnectionPoint: connectionPointId
      });
    } else {
      // Complete the connection
      if (connectionState.startComponent && connectionState.startConnectionPoint) {
        // Check if we're connecting output to input
        const startComponent = circuitHook.circuitState.components.find((c: Component) => c.id === connectionState.startComponent);
        const endComponent = circuitHook.circuitState.components.find((c: Component) => c.id === componentId);
        
        if (startComponent && endComponent) {
          const startIsOutput = startComponent.outputs.some((o: any) => o.id === connectionState.startConnectionPoint);
          const endIsInput = endComponent.inputs.some((i: any) => i.id === connectionPointId);
          
          if (startIsOutput && endIsInput) {
            circuitHook.addConnection(
              connectionState.startComponent,
              connectionState.startConnectionPoint,
              componentId,
              connectionPointId
            );
          } else if (!startIsOutput && !endIsInput) {
            // Both are inputs or both are outputs, try the reverse
            const startIsInput = startComponent.inputs.some((i: any) => i.id === connectionState.startConnectionPoint);
            const endIsOutput = endComponent.outputs.some((o: any) => o.id === connectionPointId);
            
            if (endIsOutput && startIsInput) {
              circuitHook.addConnection(
                componentId,
                connectionPointId,
                connectionState.startComponent,
                connectionState.startConnectionPoint
              );
            }
          }
        }
      }
      
      // Reset connection state
      setConnectionState({
        isConnecting: false,
        startComponent: null,
        startConnectionPoint: null
      });
    }
  }, [toolbarState.selectedTool, connectionState, circuitHook]);

  // Utility function to update wire paths when components move
  const updateWirePathsForComponent = useCallback((componentId: string) => {
    const component = circuitHook.circuitState.components.find((c: Component) => c.id === componentId);
    if (!component) return;

    // Find all connections that involve this component
    const connectionsToUpdate = circuitHook.circuitState.connections.filter((conn: Connection) => 
      conn.from.componentId === componentId || conn.to.componentId === componentId
    );

    // Update each connection's path
    connectionsToUpdate.forEach((connection: Connection) => {
      const fromComponent = circuitHook.circuitState.components.find((c: Component) => c.id === connection.from.componentId);
      const toComponent = circuitHook.circuitState.components.find((c: Component) => c.id === connection.to.componentId);

      if (fromComponent && toComponent) {
        // Calculate new start and end positions based on component positions
        const fromPoint = fromComponent.outputs.find((o: any) => o.id === connection.from.connectionPointId);
        const toPoint = toComponent.inputs.find((i: any) => i.id === connection.to.connectionPointId);

        if (fromPoint && toPoint) {
          // Calculate connection point positions relative to component position
          const startX = fromComponent.position.x + fromComponent.size.width;
          const startY = fromComponent.position.y + (fromComponent.outputs.indexOf(fromPoint) + 1) * 
                          fromComponent.size.height / (fromComponent.outputs.length + 1);

          const endX = toComponent.position.x;
          const endY = toComponent.position.y + (toComponent.inputs.indexOf(toPoint) + 1) * 
                        toComponent.size.height / (toComponent.inputs.length + 1);

          // Create a simple two-point path (can be enhanced for better routing)
          const newPath = [
            { x: startX, y: startY },
            { x: endX, y: endY }
          ];

          // Update the connection path
          if (circuitHook.updateConnection) {
            circuitHook.updateConnection(connection.id, { path: newPath });
          }
        }
      }
    });
  }, [circuitHook]);

  // Handle mouse move
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    // Handle component dragging
    if (dragState.isDragging && dragState.componentId) {
      const canvasPos = screenToCanvas(screenPos);
      const newPosition = {
        x: canvasPos.x - dragState.offset.x,
        y: canvasPos.y - dragState.offset.y
      };
      
      circuitHook.moveComponent(dragState.componentId, newPosition);
      // Update wire paths for the moved component
      updateWirePathsForComponent(dragState.componentId);
    }

    // Handle panning
    if (panState.isPanning) {
      const deltaX = screenPos.x - panState.startPosition.x;
      const deltaY = screenPos.y - panState.startPosition.y;
      
      setPan({
        x: panState.startPan.x + deltaX,
        y: panState.startPan.y + deltaY
      });
    }
  }, [dragState, panState, circuitHook, screenToCanvas]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      componentId: null,
      startPosition: { x: 0, y: 0 },
      offset: { x: 0, y: 0 }
    });

    setPanState({
      isPanning: false,
      startPosition: { x: 0, y: 0 },
      startPan: { x: 0, y: 0 }
    });
  }, []);

  // Handle wheel for zoom
  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mousePos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom * zoomFactor));
    
    // Zoom towards mouse position
    const zoomRatio = newZoom / zoom;
    setPan(prev => ({
      x: mousePos.x - (mousePos.x - prev.x) * zoomRatio,
      y: mousePos.y - (mousePos.y - prev.y) * zoomRatio
    }));
    
    setZoom(newZoom);
  }, [zoom]);

  // Zoom helpers: clamp and focused zoom (keeps a focus point stable when zooming)
  const clampZoom = (z: number) => Math.max(0.1, Math.min(3, z));

  const setZoomWithFocus = (newZoom: number, focusPos?: Position) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    // If we don't have a canvas rect, just set zoom
    if (!rect) {
      setZoom(newZoom);
      return;
    }

    const focus = focusPos ?? { x: rect.width / 2, y: rect.height / 2 };
    const zoomRatio = newZoom / zoom;

    setPan(prev => ({
      x: focus.x - (focus.x - prev.x) * zoomRatio,
      y: focus.y - (focus.y - prev.y) * zoomRatio
    }));

    setZoom(newZoom);
  };

  const ZOOM_STEP = 0.1;
  const handleZoomDelta = (delta: number) => {
    const newZoom = clampZoom(zoom + delta);
    setZoomWithFocus(newZoom);
  };

  const handleSetZoomPercent = (percent: number) => {
    const newZoom = clampZoom(percent / 100);
    setZoomWithFocus(newZoom);
  };

  // Get cursor style based on tool
  const getCursorStyle = () => {
    switch (toolbarState.selectedTool) {
      case 'pan':
        return panState.isPanning ? 'cursor-grabbing' : 'cursor-grab';
      case 'wire':
        return 'cursor-crosshair';
      case 'component':
        return 'cursor-copy';
      default:
        return 'cursor-default';
    }
  };

  // Utility: capitalize first letter for display
  const capitalizeFirst = (s: string) => (s && s.length > 0) ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  // Simple component renderer
  const renderComponent = (component: Component) => {
    const isSelected = circuitHook.circuitState.selectedComponent === component.id;
    
    return (
      <div
        key={component.id}
        className={`absolute cursor-move select-none border-2 rounded flex items-center justify-center text-sm font-semibold ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-400 bg-white'
        }`}
        style={{
          left: component.position.x * zoom + pan.x,
          top: component.position.y * zoom + pan.y,
          width: component.size.width * zoom,
          height: component.size.height * zoom,
          transform: `rotate(${component.rotation}deg)`
        }}
        onMouseDown={(event: React.MouseEvent) => {
          // Handle component interaction based on tool
          if (toolbarState.selectedTool === 'select') {
            handleComponentMouseDown(component.id, event);
          }
        }}
        onClick={(event: React.MouseEvent) => {
          // Handle switch/button clicks for interactive controls
          if (component.type === 'SWITCH' || component.type === 'PUSH_BUTTON') {
            handleComponentClick(component.id, event);
          }
        }}
      >
        <span>{component.type}</span>
        
        {/* Input connection points */}
        {component.inputs.map((input, index) => (
          <div
            key={input.id}
            className={`absolute w-3 h-3 rounded-full border-2 cursor-pointer z-10 hover:scale-125 transition-transform ${
              connectionState.isConnecting && connectionState.startComponent === component.id && connectionState.startConnectionPoint === input.id
                ? 'bg-blue-500 border-blue-600 animate-pulse' :
              input.connected 
                ? 'bg-green-500 border-green-600' : 
              input.value 
                ? 'bg-red-500 border-red-600' : 'bg-gray-300 border-gray-400'
            } ${toolbarState.selectedTool === 'wire' ? 'hover:bg-blue-400' : ''}`}
            style={{
              left: -6,
              top: ((index + 1) * component.size.height * zoom / (component.inputs.length + 1)) - 6
            }}
            onClick={(e) => handleConnectionPointClick(component.id, input.id, e)}
            title={`Input ${index + 1} - ${input.value ? 'HIGH' : 'LOW'}`}
          />
        ))}
        
        {/* Output connection points */}
        {component.outputs.map((output, index) => (
          <div
            key={output.id}
            className={`absolute w-3 h-3 rounded-full border-2 cursor-pointer z-10 hover:scale-125 transition-transform ${
              connectionState.isConnecting && connectionState.startComponent === component.id && connectionState.startConnectionPoint === output.id
                ? 'bg-blue-500 border-blue-600 animate-pulse' :
              output.connected 
                ? 'bg-green-500 border-green-600' : 
              output.value 
                ? 'bg-red-500 border-red-600' : 'bg-gray-300 border-gray-400'
            } ${toolbarState.selectedTool === 'wire' ? 'hover:bg-blue-400' : ''}`}
            style={{
              right: -6,
              top: ((index + 1) * component.size.height * zoom / (component.outputs.length + 1)) - 6
            }}
            onClick={(e) => handleConnectionPointClick(component.id, output.id, e)}
            title={`Output ${index + 1} - ${output.value ? 'HIGH' : 'LOW'}`}
          />
        ))}
      </div>
    );
  };

  // Enhanced connection renderer with removal and editing support
  const renderConnection = (connection: Connection) => {
    return (
      <div
        key={connection.id}
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: '0 0'
        }}
      >
        <ConnectionRenderer
          connection={connection}
          isSelected={circuitHook.circuitState.selectedConnection === connection.id}
          onSelect={() => circuitHook.selectConnection(connection.id)}
          onRemove={() => circuitHook.removeConnection(connection.id)}
          onPathUpdate={(newPath) => {
            // TODO: Implement path update functionality
            console.log('Path update requested:', newPath);
          }}
        />
      </div>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50">
      <div
        ref={canvasRef}
        className={`w-full h-full relative canvas-background ${getCursorStyle()}`}
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ 
          backgroundImage: circuitHook.circuitState.snapToGrid ? 'radial-gradient(circle, #ccc 1px, transparent 1px)' : undefined,
          backgroundSize: circuitHook.circuitState.snapToGrid ? `${20 * zoom}px ${20 * zoom}px` : undefined,
          backgroundPosition: circuitHook.circuitState.snapToGrid ? `${pan.x % (20 * zoom)}px ${pan.y % (20 * zoom)}px` : undefined
        }}
      >
        {/* Connections */}
        {circuitHook.circuitState.connections.map(renderConnection)}

        {/* Components */}
        {circuitHook.circuitState.components.map(renderComponent)}

        {/* Connection preview line when connecting */}
        {connectionState.isConnecting && connectionState.startComponent && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
            <div className="text-center text-sm text-blue-600 bg-blue-100 rounded px-3 py-2 shadow-lg border border-blue-200">
              🔗 Click on an input connection point to complete the wire
            </div>
          </div>
        )}
      </div>

      {/* Canvas info */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-95 rounded-lg px-3 py-2 text-sm text-gray-600 shadow-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">Tool: <span className="font-medium text-blue-600 ml-1">{capitalizeFirst(String(toolbarState.selectedTool))}</span></div>
          <div className="flex items-center gap-1">Components: <span className="font-medium ml-1">{circuitHook.circuitState.components.length}</span></div>

          {/* Zoom controls: minus button, numeric input (percent), plus button */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => handleZoomDelta(-ZOOM_STEP)}
              className="inline-flex items-center justify-center rounded px-2 py-1 border border-gray-200 bg-white hover:bg-gray-50 text-sm"
            >
              −
            </button>

            <div className="flex items-center border rounded overflow-hidden">
              <input
                min={10}
                max={300}
                step={1}
                value={Math.round(zoom * 100)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val)) {
                    handleSetZoomPercent(val);
                  }
                }}
                className="w-11 text-center px-2 py-1 text-sm outline-none"
                aria-label="Zoom percent"
              />
              <span className="py-1 pr-1 text-sm text-gray-500">%</span>
            </div>

            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => handleZoomDelta(ZOOM_STEP)}
              className="inline-flex items-center justify-center rounded px-2 py-1 border border-gray-200 bg-white hover:bg-gray-50 text-sm"
            >
              +
            </button>
          </div>

          {connectionState.isConnecting && (
            <div className="text-blue-600 font-medium">🔗 Connecting...</div>
          )}
        </div>
      </div>
    </div>
  );
};