import React, { useRef, useCallback, useState, useEffect } from 'react';
import type { Component, Connection, Position, ToolbarState } from '../types';
import { ConnectionRenderer } from './ConnectionRenderer';
import { ComponentRenderer } from './ComponentRenderer';

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

  // Comprehensive keyboard shortcuts system
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;

      // Delete/Backspace - Remove selected items
      if (key === 'delete' || key === 'backspace') {
        event.preventDefault();
        if (circuitHook.circuitState.selectedConnection) {
          circuitHook.removeConnection(circuitHook.circuitState.selectedConnection);
        } else if (circuitHook.circuitState.selectedComponent) {
          circuitHook.removeComponent(circuitHook.circuitState.selectedComponent);
        }
      }
      
      // Tool Shortcuts (without Ctrl/Cmd)
      if (!ctrl && !shift && onToolSelect) {
        switch (key) {
          case 'v': // Select tool
            event.preventDefault();
            onToolSelect('select');
            break;
          case 'h': // Pan tool
            event.preventDefault();
            onToolSelect('pan');
            break;
          case 'w': // Wire tool
            event.preventDefault();
            onToolSelect('wire');
            break;
          case 'c': // Component tool
            event.preventDefault();
            onToolSelect('component');
            break;
        }
      }

      // Zoom shortcuts
      if (ctrl && !shift) {
        if (key === '=' || key === '+') {
          event.preventDefault();
          setZoom(prev => Math.min(prev + 0.1, 2));
        } else if (key === '-' || key === '_') {
          event.preventDefault();
          setZoom(prev => Math.max(prev - 0.1, 0.5));
        } else if (key === '0') {
          event.preventDefault();
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }
      }

      // Escape - Deselect everything
      if (key === 'escape') {
        event.preventDefault();
        circuitHook.selectComponent(null);
        circuitHook.selectConnection(null);
        if (onToolSelect) onToolSelect('select');
      }

      // Clear all (Ctrl+Shift+Delete)
      if (ctrl && shift && (key === 'delete' || key === 'backspace')) {
        event.preventDefault();
        if (window.confirm('Clear all components and connections?')) {
          circuitHook.clearAll();
        }
      }

      // Simulation controls
      if (key === ' ' && !ctrl && !shift) {
        // Space bar is reserved for pan (Space+drag)
        // Don't prevent default to allow space scrolling
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    circuitHook.circuitState.selectedConnection, 
    circuitHook.circuitState.selectedComponent, 
    circuitHook, 
    toolbarState.selectedTool,
    onToolSelect
  ]);

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

    // Toggle output for interactive input components
    if (component.type === 'SWITCH' || 
        component.type === 'PUSH_BUTTON' || 
        component.type === 'HIGH_CONSTANT' || 
        component.type === 'LOW_CONSTANT') {
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
          // Calculate connection point positions using stored offsets
          const startX = fromComponent.position.x + fromPoint.position.x;
          const startY = fromComponent.position.y + fromPoint.position.y;

          const endX = toComponent.position.x + toPoint.position.x;
          const endY = toComponent.position.y + toPoint.position.y;

          const existingPath = connection.path && connection.path.length >= 2
            ? connection.path
            : [
                { x: startX, y: startY },
                { x: endX, y: endY }
              ];

          const startPoint = { x: startX, y: startY };
          const endPoint = { x: endX, y: endY };

          const oldStart = existingPath[0];
          const oldEnd = existingPath[existingPath.length - 1];

          const deltaFrom = connection.from.componentId === componentId
            ? { x: startPoint.x - oldStart.x, y: startPoint.y - oldStart.y }
            : { x: 0, y: 0 };

          const deltaTo = connection.to.componentId === componentId
            ? { x: endPoint.x - oldEnd.x, y: endPoint.y - oldEnd.y }
            : { x: 0, y: 0 };

          const newPath = existingPath.map((point, index) => {
            if (index === 0) return startPoint;
            if (index === existingPath.length - 1) return endPoint;
            return {
              x: point.x + deltaFrom.x + deltaTo.x,
              y: point.y + deltaFrom.y + deltaTo.y
            };
          });

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

  // Component renderer using the ComponentRenderer component
  const renderComponent = (component: Component) => {
    const isSelected = circuitHook.circuitState.selectedComponent === component.id;
    
    return (
      <div
        key={component.id}
        style={{
          position: 'absolute',
          transform: `translate(${component.position.x * zoom + pan.x}px, ${component.position.y * zoom + pan.y}px) scale(${zoom})`,
          transformOrigin: 'top left',
          width: component.size.width,
          height: component.size.height
        }}
      >
        <ComponentRenderer
          component={component}
          isSelected={isSelected}
          onMouseDown={(event: React.MouseEvent) => {
            // Handle component interaction based on tool
            if (toolbarState.selectedTool === 'select') {
              handleComponentMouseDown(component.id, event);
            }
          }}
          onClick={(event: React.MouseEvent) => {
            // Handle interactive component clicks (switches, buttons, constants)
            handleComponentClick(component.id, event);
          }}
          onConnectionPointClick={(connectionPointId: string) => {
            // Create a mock event for compatibility
            const mockEvent = new MouseEvent('click') as any;
            handleConnectionPointClick(component.id, connectionPointId, mockEvent);
          }}
        />
      </div>
    );
  };

  // Enhanced connection renderer with removal and editing support
  const renderConnection = (connection: Connection) => {
    // Apply zoom and pan to connection path
    const transformedConnection = {
      ...connection,
      path: connection.path.map(point => ({
        x: point.x * zoom + pan.x,
        y: point.y * zoom + pan.y
      }))
    };
    
    return (
      <div key={connection.id}>
        <ConnectionRenderer
          connection={transformedConnection}
          isSelected={circuitHook.circuitState.selectedConnection === connection.id}
          onSelect={() => circuitHook.selectConnection(connection.id)}
          onRemove={() => circuitHook.removeConnection(connection.id)}
          onPathUpdate={(newPath) => {
            // Transform path back to canvas coordinates
            const canvasPath = newPath.map(point => ({
              x: (point.x - pan.x) / zoom,
              y: (point.y - pan.y) / zoom
            }));
            circuitHook.updateConnection?.(connection.id, { path: canvasPath });
          }}
        />
      </div>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div
        ref={canvasRef}
        className={`w-full h-full relative canvas-background ${getCursorStyle()} touch-none`}
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ 
          backgroundImage: circuitHook.circuitState.snapToGrid ? 'radial-gradient(circle, #d1d5db 1px, transparent 1px)' : undefined,
          backgroundSize: circuitHook.circuitState.snapToGrid ? `${20 * zoom}px ${20 * zoom}px` : undefined,
          backgroundPosition: circuitHook.circuitState.snapToGrid ? `${pan.x % (20 * zoom)}px ${pan.y % (20 * zoom)}px` : undefined,
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none'
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

      {/* Canvas info - Compact on mobile */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-white/95 dark:bg-gray-900/95 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm max-w-[140px] sm:max-w-none">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">Tool:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 capitalize truncate">{toolbarState.selectedTool}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-gray-500 dark:text-gray-400">Items:</span>
            <span className="font-semibold">{circuitHook.circuitState.components.length}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-gray-500 dark:text-gray-400">Zoom:</span>
            <span className="font-semibold">{Math.round(zoom * 100)}%</span>
          </div>
          {connectionState.isConnecting && (
            <div className="text-blue-600 dark:text-blue-400 font-semibold text-[9px] sm:text-xs animate-pulse">🔗 Connecting</div>
          )}
        </div>
      </div>
      
      {/* Mobile & Tablet zoom controls - Better positioning */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 lg:hidden flex flex-col gap-1.5 sm:gap-2 z-10">
        <button
          onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
          className="w-9 h-9 sm:w-11 sm:h-11 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 transition-all hover:scale-110 active:scale-95"
          aria-label="Zoom in"
        >
          <span className="text-lg sm:text-xl font-bold leading-none">+</span>
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
          className="w-9 h-9 sm:w-11 sm:h-11 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 transition-all hover:scale-110 active:scale-95"
          aria-label="Zoom out"
        >
          <span className="text-lg sm:text-xl font-bold leading-none">−</span>
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="w-9 h-9 sm:w-11 sm:h-11 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 transition-all hover:scale-110 active:scale-95"
          aria-label="Reset view"
        >
          <span className="text-base sm:text-lg leading-none">⟲</span>
        </button>
      </div>
    </div>
  );
};