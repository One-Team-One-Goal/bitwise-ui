import React, { useState } from "react";
import { type CellValue } from "@/utils/karnaugh.utils";

interface SquareProps {
  value: CellValue;
  onClick: () => void;
  groupColor?: string;
  className?: string;
  isGrouped?: boolean;
  groupConnections?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
  coordinates?: {
    binary: string;
    minterm?: number;
    variables?: string;
  };
}

const Square: React.FC<SquareProps> = ({ 
  value, 
  onClick, 
  groupColor, 
  className = "", 
  isGrouped = false,
  groupConnections = {},
  coordinates
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const getValueStyle = () => {
    if (value === 1) return {
      color: '#16a34a',
      backgroundColor: groupColor ? `${groupColor}40` : '#f0fdf4',
      fontWeight: 'bold'
    };
    if (value === 0) return {
      color: '#6b7280',
      backgroundColor: groupColor ? `${groupColor}40` : '#f9fafb',
      fontWeight: 'normal'
    };
    return {
      color: '#dc2626', 
      backgroundColor: groupColor ? `${groupColor}40` : '#fef2f2',
      fontWeight: 'bold'
    };
  };

  const valueStyle = getValueStyle();

  // Create border style based on group connections
  const getBorderStyle = () => {
    if (!isGrouped || !groupColor) {
      return {
        border: '1px solid #e5e7eb',
      };
    }

    // Create borders that appear more toward the inside using padding and positioning
    const borderColor = groupColor;

    // Use a combination of margin and padding to create inward-appearing borders
    const style: React.CSSProperties = {
      position: 'relative',
      borderRadius: '4px',
    };

    // Create pseudo-element-like borders using box-shadow, but positioned more inward
    const shadows: string[] = [];
    
    if (!groupConnections.top) {
      shadows.push(`inset 0 6px 0 -3px ${borderColor}`);
    }
    if (!groupConnections.right) {
      shadows.push(`inset -6px 0 0 -3px ${borderColor}`);
    }
    if (!groupConnections.bottom) {
      shadows.push(`inset 0 -6px 0 -3px ${borderColor}`);
    }
    if (!groupConnections.left) {
      shadows.push(`inset 6px 0 0 -3px ${borderColor}`);
    }

    if (shadows.length > 0) {
      style.boxShadow = shadows.join(', ');
    }

    // Add very subtle grid lines for connected sides
    if (groupConnections.top) style.borderTop = '1px solid rgba(0,0,0,0.03)';
    if (groupConnections.right) style.borderRight = '1px solid rgba(0,0,0,0.03)';
    if (groupConnections.bottom) style.borderBottom = '1px solid rgba(0,0,0,0.03)';
    if (groupConnections.left) style.borderLeft = '1px solid rgba(0,0,0,0.03)';

    return style;
  };

  return (
    <div className="relative group">
      <div
        className={`
          flex items-center justify-center 
          cursor-pointer transition-all duration-200
          text-lg font-mono
          hover:scale-105 hover:shadow-lg hover:z-10
          active:scale-95
          ${className}
        `}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          ...valueStyle,
          ...getBorderStyle(),
          outline: 'none',
        }}
      >
        {value}
      </div>
      
      {/* Coordinate Tooltip on Hover */}
      {isHovered && coordinates && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-center">{coordinates.variables || coordinates.binary}</div>
            <div className="text-gray-300">Binary: {coordinates.binary}</div>
            {coordinates.minterm !== undefined && (
              <div className="text-gray-300">Minterm: m{coordinates.minterm}</div>
            )}
            <div className="text-xs text-gray-400 mt-1 text-center">Click to cycle value</div>
          </div>
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Square;
