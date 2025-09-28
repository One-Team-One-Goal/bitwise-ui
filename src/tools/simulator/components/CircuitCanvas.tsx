import React, { useRef, useCallback, useState } from 'react';
import type { Component, Connection, Position, ToolbarState } from '../types';

interface CircuitCanvasProps {
  circuitHook: any;
  toolbarState: ToolbarState;
  onCanvasClick: (position: Position) => void;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  circuitHook,
  toolbarState,
  onCanvasClick
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

  // Simple connection renderer
  const renderConnection = (connection: Connection) => {
    if (connection.path.length < 2) return null;

    const start = connection.path[0];
    const end = connection.path[connection.path.length - 1];

    return (
      <svg
        key={connection.id}
        className="absolute pointer-events-none"
        style={{ 
          left: 0, 
          top: 0, 
          width: '100%', 
          height: '100%',
          zIndex: connection.value ? 10 : 5
        }}
      >
        <line
          x1={start.x * zoom + pan.x}
          y1={start.y * zoom + pan.y}
          x2={end.x * zoom + pan.x}
          y2={end.y * zoom + pan.y}
          stroke={connection.value ? '#ef4444' : '#6b7280'}
          strokeWidth={connection.value ? 3 : 2}
          style={{
            filter: connection.value ? 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))' : undefined
          }}
        />
        
        {/* Signal direction indicator */}
        <circle
          cx={(start.x + end.x) / 2 * zoom + pan.x}
          cy={(start.y + end.y) / 2 * zoom + pan.y}
          r={connection.value ? 4 : 2}
          fill={connection.value ? '#ef4444' : '#6b7280'}
        />
      </svg>
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
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg px-3 py-2 text-sm text-gray-600 shadow-lg border border-gray-200">
        <div className="space-y-1">
          <div>Tool: <span className="font-medium text-blue-600">{toolbarState.selectedTool}</span></div>
          <div>Components: <span className="font-medium">{circuitHook.circuitState.components.length}</span></div>
          <div>Zoom: <span className="font-medium">{Math.round(zoom * 100)}%</span></div>
          {connectionState.isConnecting && (
            <div className="text-blue-600 font-medium">🔗 Connecting...</div>
          )}
        </div>
      </div>
    </div>
  );
};