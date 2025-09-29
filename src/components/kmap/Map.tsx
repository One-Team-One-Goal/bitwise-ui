import React from "react";
import Square from "./Square";
import { type KMapMatrix, type KMapGroup, getDimensions } from "@/utils/karnaugh.utils";

interface MapProps {
  squares: KMapMatrix;
  groups: KMapGroup[];
  variableCount: number;
  onCellClick: (row: number, col: number) => void;
}

const Map: React.FC<MapProps> = ({ squares, groups, variableCount, onCellClick }) => {
  const { rows, cols } = getDimensions(variableCount);
  
  // Generate headers for the map
  const generateHeaders = () => {
    if (variableCount === 2) {
      return {
        colHeaders: ['B', "B'"],
        rowHeaders: ['A', "A'"],
        cornerLabel: 'A//B'
      };
    } else if (variableCount === 3) {
      return {
        colHeaders: ['BC', "BC'", "B'C'", "B'C"],
        rowHeaders: ['A', "A'"],
        cornerLabel: 'A//BC'
      };
    } else if (variableCount === 4) {
      return {
        colHeaders: ['CD', "CD'", "C'D'", "C'D"],
        rowHeaders: ['AB', "AB'", "A'B'", "A'B"],
        cornerLabel: 'AB//CD'
      };
    }
    
    return { colHeaders: [], rowHeaders: [], cornerLabel: '' };
  };

  const { colHeaders, rowHeaders, cornerLabel } = generateHeaders();

  // Get the group for a specific cell
  const getCellGroup = (row: number, col: number): KMapGroup | undefined => {
    return groups.find(group => 
      group.cells.some(cell => cell.riga === row && cell.col === col)
    );
  };

  // Calculate group connections for visual borders with proper wraparound
  const getGroupConnections = (row: number, col: number, group?: KMapGroup) => {
    if (!group) return {};

    const connections = { top: false, right: false, bottom: false, left: false };
    
    // Check if adjacent cells are in the same group
    const isInGroup = (r: number, c: number) => 
      group.cells.some(cell => cell.riga === r && cell.col === c);

    // Check top connection (including wraparound for rows)
    const topRow = row === 0 ? rows - 1 : row - 1;
    if (isInGroup(topRow, col)) {
      connections.top = true;
    }

    // Check right connection (including wraparound for columns)
    const rightCol = col === cols - 1 ? 0 : col + 1;
    if (isInGroup(row, rightCol)) {
      connections.right = true;
    }

    // Check bottom connection (including wraparound for rows)
    const bottomRow = row === rows - 1 ? 0 : row + 1;
    if (isInGroup(bottomRow, col)) {
      connections.bottom = true;
    }

    // Check left connection (including wraparound for columns)
    const leftCol = col === 0 ? cols - 1 : col - 1;
    if (isInGroup(row, leftCol)) {
      connections.left = true;
    }

    return connections;
  };

  if (!squares || squares.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        Loading K-Map...
      </div>
    );
  }

  return (
    <div className="relative">
      {/* K-Map Table */}
      <div className="inline-block overflow-hidden">
        {/* Column Headers */}
        <div className="flex">
          <div className="w-16 h-12 flex items-center justify-center relative text-xs text-gray-600">
            <CornerLabel label={cornerLabel} />
          </div>
          {colHeaders.map((header, index) => (
            <div
              key={index}
              className="w-16 h-12 flex items-center justify-center font-semibold text-sm text-gray-700"
            >
              {header}
            </div>
          ))}
        </div>

        {/* Rows with data */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex">
            {/* Row Header */}
            <div className="w-16 h-16 flex items-center justify-center font-semibold text-sm text-gray-700">
              {rowHeaders[rowIndex]}
            </div>
            
            {/* Data Cells */}
            {Array.from({ length: cols }).map((_, colIndex) => {
              const cell = squares[rowIndex]?.[colIndex];
              const group = getCellGroup(rowIndex, colIndex);
              const connections = getGroupConnections(rowIndex, colIndex, group);
              
              if (!cell) return null;

              return (
                <Square
                  key={`${rowIndex}-${colIndex}`}
                  value={cell[0]}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  groupColor={group?.color}
                  isGrouped={!!group}
                  groupConnections={connections}
                  className="w-16 h-16"
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Group Overlays */}
      {groups.map((group) => (
        <GroupOverlay
          key={group.id}
          group={group}
          cellSize={64} // 16 * 4 (w-16 = 4rem = 64px)
          headerOffset={{ x: 64, y: 48 }} // Header sizes
          rows={rows}
          cols={cols}
        />
      ))}
    </div>
  );
};

// Component for drawing group overlays
interface GroupOverlayProps {
  group: KMapGroup;
  cellSize: number;
  headerOffset: { x: number; y: number };
  rows: number;
  cols: number;
}

const GroupOverlay: React.FC<GroupOverlayProps> = ({ group, cellSize, headerOffset, rows, cols }) => {
  if (group.cells.length === 0) return null;

  // Detect wraparound patterns
  const detectWraparound = () => {
    const rowSet = new Set(group.cells.map(cell => cell.riga));
    const colSet = new Set(group.cells.map(cell => cell.col));
    
    const rowArray = Array.from(rowSet).sort((a, b) => a - b);
    const colArray = Array.from(colSet).sort((a, b) => a - b);
    
    // Check for horizontal wraparound (columns)
    const horizontalWrap = colArray.length > 1 && 
      (colArray.includes(0) && colArray.includes(cols - 1));
    
    // Check for vertical wraparound (rows)  
    const verticalWrap = rowArray.length > 1 && 
      (rowArray.includes(0) && rowArray.includes(rows - 1));
    
    return { horizontalWrap, verticalWrap, rowArray, colArray };
  };

  const { horizontalWrap, verticalWrap, rowArray, colArray } = detectWraparound();

  // Create multiple rectangles for wraparound cases
  const createRectangles = () => {
    const rectangles: React.ReactElement[] = [];

    if (horizontalWrap && verticalWrap) {
      // Four corner rectangles for both horizontal and vertical wrap
      const leftCols = colArray.filter(col => col < cols / 2);
      const rightCols = colArray.filter(col => col >= cols / 2);
      const topRows = rowArray.filter(row => row < rows / 2);
      const bottomRows = rowArray.filter(row => row >= rows / 2);

      const configs = [
        { rows: topRows, cols: leftCols, key: 'tl' },
        { rows: topRows, cols: rightCols, key: 'tr' },
        { rows: bottomRows, cols: leftCols, key: 'bl' },
        { rows: bottomRows, cols: rightCols, key: 'br' }
      ];

      configs.forEach(({ rows: rectRows, cols: rectCols, key }) => {
        if (rectRows.length > 0 && rectCols.length > 0) {
          const minRow = Math.min(...rectRows);
          const maxRow = Math.max(...rectRows);
          const minCol = Math.min(...rectCols);
          const maxCol = Math.max(...rectCols);

          rectangles.push(
            <div
              key={`${group.id}-${key}`}
              className="absolute pointer-events-none"
              style={{
                left: headerOffset.x + minCol * cellSize,
                top: headerOffset.y + minRow * cellSize,
                width: (maxCol - minCol + 1) * cellSize,
                height: (maxRow - minRow + 1) * cellSize,
                backgroundColor: `${group.color}30`,
                zIndex: 10,
              }}
            />
          );
        }
      });

    } else if (horizontalWrap) {
      // Split into left and right rectangles
      const leftCols = colArray.filter(col => col < cols / 2);
      const rightCols = colArray.filter(col => col >= cols / 2);

      [leftCols, rightCols].forEach((rectCols, index) => {
        if (rectCols.length > 0) {
          const minRow = Math.min(...rowArray);
          const maxRow = Math.max(...rowArray);
          const minCol = Math.min(...rectCols);
          const maxCol = Math.max(...rectCols);

          rectangles.push(
            <div
              key={`${group.id}-h${index}`}
              className="absolute pointer-events-none"
              style={{
                left: headerOffset.x + minCol * cellSize,
                top: headerOffset.y + minRow * cellSize,
                width: (maxCol - minCol + 1) * cellSize,
                height: (maxRow - minRow + 1) * cellSize,
                backgroundColor: `${group.color}30`,
                zIndex: 10,
              }}
            />
          );
        }
      });

    } else if (verticalWrap) {
      // Split into top and bottom rectangles
      const topRows = rowArray.filter(row => row < rows / 2);
      const bottomRows = rowArray.filter(row => row >= rows / 2);

      [topRows, bottomRows].forEach((rectRows, index) => {
        if (rectRows.length > 0) {
          const minRow = Math.min(...rectRows);
          const maxRow = Math.max(...rectRows);
          const minCol = Math.min(...colArray);
          const maxCol = Math.max(...colArray);

          rectangles.push(
            <div
              key={`${group.id}-v${index}`}
              className="absolute pointer-events-none"
              style={{
                left: headerOffset.x + minCol * cellSize,
                top: headerOffset.y + minRow * cellSize,
                width: (maxCol - minCol + 1) * cellSize,
                height: (maxRow - minRow + 1) * cellSize,
                backgroundColor: `${group.color}30`,
                zIndex: 10,
              }}
            />
          );
        }
      });

    } else {
      // Normal single rectangle
      const minRow = Math.min(...rowArray);
      const maxRow = Math.max(...rowArray);
      const minCol = Math.min(...colArray);
      const maxCol = Math.max(...colArray);

      rectangles.push(
        <div
          key={group.id}
          className="absolute pointer-events-none rounded-lg"
          style={{
            left: headerOffset.x + minCol * cellSize,
            top: headerOffset.y + minRow * cellSize,
            width: (maxCol - minCol + 1) * cellSize,
            height: (maxRow - minRow + 1) * cellSize,
            backgroundColor: `${group.color}30`,
            zIndex: 10,
          }}
        />
      );
    }

    return rectangles;
  };

  return <>{createRectangles()}</>;
};

// Component for drawing corner labels with diagonal line
interface CornerLabelProps {
  label: string;
}

const CornerLabel: React.FC<CornerLabelProps> = ({ label }) => {
  const parts = label.split('//');
  if (parts.length !== 2) return <span>{label}</span>;
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Diagonal line */}
      <div className="absolute inset-0">
        <svg width="100%" height="100%" className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line 
            x1="15" 
            y1="15" 
            x2="100" 
            y2="100" 
            stroke="#E2E8F0" 
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      
      {/* Top-right label (column variables) */}
      <div className="absolute bottom-2 left-2 text-xs font-medium text-gray-700">
        {parts[1]}
      </div>
      
      {/* Bottom-left label (row variables) */}
      <div className="absolute top-2 right-2 text-xs font-medium text-gray-700">
        {parts[0]}
      </div>
    </div>
  );
};

export default Map;
