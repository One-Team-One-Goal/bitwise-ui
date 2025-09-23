import React from 'react';
import type { Connection } from '../types';

interface ConnectionRendererProps {
  connection: Connection;
  isSelected: boolean;
  onSelect: () => void;
}

export const ConnectionRenderer: React.FC<ConnectionRendererProps> = ({
  connection,
  isSelected,
  onSelect
}) => {
  if (connection.path.length < 2) return null;

  const startPoint = connection.path[0];
  const endPoint = connection.path[connection.path.length - 1];

  // Calculate bounding box for the SVG
  const minX = Math.min(...connection.path.map(p => p.x));
  const maxX = Math.max(...connection.path.map(p => p.x));
  const minY = Math.min(...connection.path.map(p => p.y));
  const maxY = Math.max(...connection.path.map(p => p.y));

  const width = maxX - minX + 20; // Add padding
  const height = maxY - minY + 20;

  // Create path string for SVG
  const createPath = () => {
    if (connection.path.length === 2) {
      // Simple straight line with right-angle routing
      const start = connection.path[0];
      const end = connection.path[1];
      
      const midX = start.x + (end.x - start.x) * 0.7;
      
      return `M ${start.x - minX + 10} ${start.y - minY + 10} 
              L ${midX - minX + 10} ${start.y - minY + 10} 
              L ${midX - minX + 10} ${end.y - minY + 10} 
              L ${end.x - minX + 10} ${end.y - minY + 10}`;
    } else {
      // Multi-point path
      const pathParts = connection.path.map((point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${command} ${point.x - minX + 10} ${point.y - minY + 10}`;
      });
      return pathParts.join(' ');
    }
  };

  const pathString = createPath();

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: minX - 10,
        top: minY - 10,
        width,
        height,
        zIndex: isSelected ? 15 : 5
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Connection wire */}
      <path
        d={pathString}
        stroke={connection.value ? '#ef4444' : '#6b7280'} // Red for HIGH, gray for LOW
        strokeWidth={isSelected ? 3 : 2}
        fill="none"
        className="pointer-events-auto cursor-pointer hover:stroke-width-3"
        style={{
          filter: connection.value ? 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))' : undefined
        }}
      />

      {/* Selection indicator */}
      {isSelected && (
        <path
          d={pathString}
          stroke="#3b82f6"
          strokeWidth={5}
          fill="none"
          opacity={0.3}
        />
      )}

      {/* Signal direction indicator (arrow) */}
      {connection.path.length >= 2 && (
        <defs>
          <marker
            id={`arrowhead-${connection.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill={connection.value ? '#ef4444' : '#6b7280'}
            />
          </marker>
        </defs>
      )}

      {/* Apply arrow marker to the path */}
      <path
        d={pathString}
        stroke="transparent"
        strokeWidth={2}
        fill="none"
        markerEnd={`url(#arrowhead-${connection.id})`}
      />

      {/* Value indicator dot at midpoint */}
      {connection.path.length >= 2 && (
        <circle
          cx={(startPoint.x + endPoint.x) / 2 - minX + 10}
          cy={(startPoint.y + endPoint.y) / 2 - minY + 10}
          r={connection.value ? 4 : 2}
          fill={connection.value ? '#ef4444' : '#6b7280'}
          className="pointer-events-none"
        />
      )}
    </svg>
  );
};