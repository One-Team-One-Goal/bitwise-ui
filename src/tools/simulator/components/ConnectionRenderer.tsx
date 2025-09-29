import React, { useState, useEffect } from 'react';
import type { Connection } from '../types/index';

interface ConnectionRendererProps {
  connection: Connection;
  isSelected: boolean;
  onSelect: () => void;
  onRemove?: () => void;
  onPathUpdate?: (newPath: { x: number; y: number }[]) => void;
}

export const ConnectionRenderer: React.FC<ConnectionRendererProps> = ({
  connection,
  isSelected,
  onSelect,
  onRemove,
  onPathUpdate
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  // Handle wire dragging for rerouting
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && isSelected) { // Left click on selected wire
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && onPathUpdate) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      // Update the middle points of the wire path
      const newPath = connection.path.map((point, index) => {
        if (index > 0 && index < connection.path.length - 1) {
          return {
            x: point.x + deltaX,
            y: point.y + deltaY
          };
        }
        return point;
      });
      
      onPathUpdate(newPath);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, connection.path, onPathUpdate]);

  if (connection.path.length < 2) return null;

  const startPoint = connection.path[0];
  const endPoint = connection.path[connection.path.length - 1];

  // Calculate bounding box for the SVG with padding
  const minX = Math.min(...connection.path.map(p => p.x)) - 15;
  const maxX = Math.max(...connection.path.map(p => p.x)) + 15;
  const minY = Math.min(...connection.path.map(p => p.y)) - 15;
  const maxY = Math.max(...connection.path.map(p => p.y)) + 15;

  const width = maxX - minX;
  const height = maxY - minY;

  // Create smooth orthogonal path
  const createSmoothPath = () => {
    if (connection.path.length === 2) {
      const start = connection.path[0];
      const end = connection.path[1];
      
      // Calculate control points for smooth right-angle routing
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      
      // Choose whether to go horizontal first or vertical first based on distance
      const goHorizontalFirst = Math.abs(dx) > Math.abs(dy);
      
      if (goHorizontalFirst) {
        // Go horizontal first, then vertical
        const midX = start.x + dx * 0.7;
        const cornerRadius = 8;
        
        let path = `M ${start.x - minX} ${start.y - minY}`;
        
        if (Math.abs(midX - start.x) > cornerRadius) {
          path += ` L ${midX - cornerRadius - minX} ${start.y - minY}`;
          path += ` Q ${midX - minX} ${start.y - minY} ${midX - minX} ${start.y + (dy > 0 ? cornerRadius : -cornerRadius) - minY}`;
        }
        
        if (Math.abs(end.y - start.y) > cornerRadius * 2) {
          path += ` L ${midX - minX} ${end.y - (dy > 0 ? cornerRadius : -cornerRadius) - minY}`;
          path += ` Q ${midX - minX} ${end.y - minY} ${midX + cornerRadius - minX} ${end.y - minY}`;
        }
        
        path += ` L ${end.x - minX} ${end.y - minY}`;
        return path;
      } else {
        // Go vertical first, then horizontal
        const midY = start.y + dy * 0.7;
        const cornerRadius = 8;
        
        let path = `M ${start.x - minX} ${start.y - minY}`;
        
        if (Math.abs(midY - start.y) > cornerRadius) {
          path += ` L ${start.x - minX} ${midY - cornerRadius - minY}`;
          path += ` Q ${start.x - minX} ${midY - minY} ${start.x + (dx > 0 ? cornerRadius : -cornerRadius) - minX} ${midY - minY}`;
        }
        
        if (Math.abs(end.x - start.x) > cornerRadius * 2) {
          path += ` L ${end.x - (dx > 0 ? cornerRadius : -cornerRadius) - minX} ${midY - minY}`;
          path += ` Q ${end.x - minX} ${midY - minY} ${end.x - minX} ${midY + cornerRadius - minY}`;
        }
        
        path += ` L ${end.x - minX} ${end.y - minY}`;
        return path;
      }
    } else {
      // Multi-point path with smooth corners
      const pathParts = connection.path.map((point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${command} ${point.x - minX} ${point.y - minY}`;
      });
      return pathParts.join(' ');
    }
  };

  const pathString = createSmoothPath();

  // Color scheme for better visual feedback
  const getWireColor = () => {
    if (connection.value) {
      return {
        stroke: '#22c55e', // Green for HIGH
        glow: 'rgba(34, 197, 94, 0.4)',
        shadow: '0 0 8px rgba(34, 197, 94, 0.6)'
      };
    } else {
      return {
        stroke: '#64748b', // Slate for LOW
        glow: 'rgba(100, 116, 139, 0.3)',
        shadow: 'none'
      };
    }
  };

  const colors = getWireColor();

  return (
    <>
      <svg
        className="absolute pointer-events-none"
        style={{
          left: minX,
          top: minY,
          width,
          height,
          zIndex: isSelected ? 20 : 10
        }}
      >
      {/* Define gradient for signal flow animation */}
      <defs>
        <linearGradient id={`signal-flow-${connection.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.3">
            <animate
              attributeName="stop-opacity"
              values="0.3;1;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="50%" stopColor={colors.stroke} stopOpacity="1">
            <animate
              attributeName="stop-opacity"
              values="1;0.3;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor={colors.stroke} stopOpacity="0.3">
            <animate
              attributeName="stop-opacity"
              values="0.3;1;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>

        {/* Arrow marker for signal direction */}
        <marker
          id={`arrowhead-${connection.id}`}
          markerWidth="12"
          markerHeight="8"
          refX="11"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 12 4, 0 8"
            fill={colors.stroke}
            stroke="none"
          />
        </marker>

        {/* Glow filter for active signals */}
        <filter id={`glow-${connection.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Glow effect for properly connected wires */}
      {connection.from.componentId && connection.to.componentId && (
        <path
          d={pathString}
          stroke={colors.glow}
          strokeWidth="8"
          fill="none"
          opacity="0.6"
          className={connection.value ? 'animate-pulse' : ''}
          style={{
            filter: 'blur(3px)',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Background wire for better visibility and easier clicking */}
      <path
        d={pathString}
        stroke="transparent"
        strokeWidth="12"
        fill="none"
        className="pointer-events-auto cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setContextMenuPos({ x: e.clientX, y: e.clientY });
          setShowContextMenu(true);
          onSelect();
        }}
      />

      {/* Visible background wire */}
      <path
        d={pathString}
        stroke="#f1f5f9"
        strokeWidth="6"
        fill="none"
        className="pointer-events-none"
      />

      {/* Main wire with enhanced visuals */}
      <path
        d={pathString}
        stroke={colors.stroke}
        strokeWidth={isSelected ? 4 : 3}
        fill="none"
        className={`pointer-events-auto transition-all duration-200 ${ 
          isSelected ? 'cursor-move' : 'cursor-pointer'
        } ${
          connection.value ? 'animate-pulse' : ''
        }`}
        style={{
          filter: isSelected ? colors.shadow : connection.value ? `url(#glow-${connection.id})` : undefined,
          strokeDasharray: isDragging ? '5,5' : 'none',
          strokeDashoffset: isDragging ? '10' : '0'
        }}
        markerEnd={`url(#arrowhead-${connection.id})`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setContextMenuPos({ x: e.clientX, y: e.clientY });
          setShowContextMenu(true);
          onSelect();
        }}
        onMouseDown={handleMouseDown}
      />

      {/* Animated signal flow for HIGH state */}
      {connection.value && (
        <path
          d={pathString}
          stroke={`url(#signal-flow-${connection.id})`}
          strokeWidth="2"
          fill="none"
          className="pointer-events-none"
        />
      )}

      {/* Drag handles for wire rerouting when selected */}
      {isSelected && connection.path.length > 2 && (
        <>
          {connection.path.slice(1, -1).map((point, index) => (
            <circle
              key={`handle-${index}`}
              cx={point.x - minX}
              cy={point.y - minY}
              r="5"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
              className="cursor-grab hover:scale-125 transition-transform"
              style={{ pointerEvents: 'auto' }}
            />
          ))}
          
          {/* Add new control points on wire segments */}
          {connection.path.slice(0, -1).map((point, index) => {
            const nextPoint = connection.path[index + 1];
            const midX = (point.x + nextPoint.x) / 2;
            const midY = (point.y + nextPoint.y) / 2;
            
            return (
              <circle
                key={`mid-handle-${index}`}
                cx={midX - minX}
                cy={midY - minY}
                r="3"
                fill="#06b6d4"
                stroke="white"
                strokeWidth="1"
                className="cursor-crosshair hover:scale-150 transition-transform opacity-70"
                style={{ pointerEvents: 'auto' }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Add a new control point
                  const newPath = [...connection.path];
                  newPath.splice(index + 1, 0, { x: midX, y: midY });
                  onPathUpdate?.(newPath);
                }}
              />
            );
          })}
        </>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <>
          {/* Primary selection indicator */}
          <path
            d={pathString}
            stroke="#3b82f6"
            strokeWidth="8"
            fill="none"
            opacity={0.6}
            className="pointer-events-none"
            strokeDasharray="12 6"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;18"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Secondary glow effect */}
          <path
            d={pathString}
            stroke="#3b82f6"
            strokeWidth="12"
            fill="none"
            opacity={0.2}
            className="pointer-events-none"
          />
          
          {/* Wire selection badge */}
          <g transform={`translate(${(startPoint.x + endPoint.x) / 2 - minX - 15}, ${(startPoint.y + endPoint.y) / 2 - minY - 15})`}>
            <rect
              x="0"
              y="0"
              width="30"
              height="20"
              rx="10"
              fill="#3b82f6"
              opacity="0.9"
            />
            <text
              x="15"
              y="13"
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="white"
            >
              WIRE
            </text>
          </g>
        </>
      )}

      {/* Connection point indicators */}
      <circle
        cx={startPoint.x - minX}
        cy={startPoint.y - minY}
        r="3"
        fill={colors.stroke}
        stroke="#ffffff"
        strokeWidth="1"
        className="pointer-events-none"
      />
      
      <circle
        cx={endPoint.x - minX}
        cy={endPoint.y - minY}
        r="3"
        fill={colors.stroke}
        stroke="#ffffff"
        strokeWidth="1"
        className="pointer-events-none"
      />

      {/* Signal value indicator at midpoint */}
      {connection.path.length >= 2 && (
        <g>
          <circle
            cx={(startPoint.x + endPoint.x) / 2 - minX}
            cy={(startPoint.y + endPoint.y) / 2 - minY}
            r="6"
            fill="#ffffff"
            stroke={colors.stroke}
            strokeWidth="2"
            className="pointer-events-none"
          />
          <text
            x={(startPoint.x + endPoint.x) / 2 - minX}
            y={(startPoint.y + endPoint.y) / 2 - minY + 1}
            textAnchor="middle"
            fontSize="8"
            fontWeight="bold"
            fill={colors.stroke}
            className="pointer-events-none"
          >
            {connection.value ? '1' : '0'}
          </text>
        </g>
      )}

      {/* Wire control points - only show when selected */}
      {isSelected && onPathUpdate && connection.path.length >= 2 && (
        <g>
          {/* Midpoint control for adjusting wire routing */}
          <circle
            cx={(startPoint.x + endPoint.x) / 2 - minX}
            cy={(startPoint.y + endPoint.y) / 2 - minY}
            r="8"
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth="2"
            className="cursor-move"
            style={{ opacity: 0.8 }}
            onMouseDown={(e) => {
              e.stopPropagation();
              // TODO: Implement drag functionality for wire routing
            }}
          />
          
          {/* Control points for each path segment */}
          {connection.path.length > 2 && connection.path.slice(1, -1).map((point, index) => (
            <circle
              key={index}
              cx={point.x - minX}
              cy={point.y - minY}
              r="6"
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth="2"
              className="cursor-move"
              style={{ opacity: 0.7 }}
              onMouseDown={(e) => {
                e.stopPropagation();
                // TODO: Implement individual control point dragging
              }}
            />
          ))}
        </g>
      )}
    </svg>

    {/* Context Menu */}
    {showContextMenu && (
      <>
        {/* Backdrop to close menu */}
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowContextMenu(false)}
        />
        
        {/* Menu positioned at cursor */}
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[180px] max-w-[220px]"
          style={{
            left: Math.min(contextMenuPos.x, window.innerWidth - 220),
            top: Math.min(contextMenuPos.y, window.innerHeight - 200),
            transform: 'translate(-10px, -10px)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Wire Info Header */}
          <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="text-xs font-semibold text-blue-800">Wire Management</div>
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <div className={`w-2 h-2 rounded-full ${
                connection.value ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              Signal: {connection.value ? 'HIGH (1)' : 'LOW (0)'}
            </div>
          </div>
          
          {/* Wire Actions */}
          <div className="py-1">
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 text-blue-600 flex items-center gap-3 transition-colors"
              onClick={() => {
                onSelect(); // Select the wire for rerouting
                setShowContextMenu(false);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <polyline points="7.5 10.5 12 14 16.5 10.5" />
              </svg>
              <div>
                <div className="font-medium">Reroute Wire</div>
                <div className="text-xs text-gray-500">Drag to reposition</div>
              </div>
            </button>
            
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-3 transition-colors"
              onClick={() => {
                onRemove?.();
                setShowContextMenu(false);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              <div>
                <div className="font-medium">Delete Wire</div>
                <div className="text-xs text-gray-500">Remove connection</div>
              </div>
            </button>
          </div>
        </div>
      </>
    )}
  </>
  );
};