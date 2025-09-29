import React from "react";
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
}

const Square: React.FC<SquareProps> = ({ 
  value, 
  onClick, 
  groupColor, 
  className = "", 
  isGrouped = false,
  groupConnections = {}
}) => {
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
    <div
      className={`
        flex items-center justify-center 
        cursor-pointer transition-all duration-200
        text-lg font-mono
        ${className}
      `}
      onClick={onClick}
      style={{
        ...valueStyle,
        ...getBorderStyle(),
        outline: 'none',
      }}
    >
      {value}
    </div>
  );
};

export default Square;
