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
    } else if (variableCount === 5) {
      return {
        colHeaders: ['CD', "CD'", "C'D'", "C'D"],
        rowHeaders: ['AB', "AB'", "A'B'", "A'B"],
        cornerLabel: 'AB//CD'
      };
    }
    
    return { colHeaders: [], rowHeaders: [], cornerLabel: '' };
  };

  const { colHeaders, rowHeaders, cornerLabel } = generateHeaders();

  // Get coordinate information for a cell
  const getCellCoordinates = (row: number, col: number) => {
    const cell = squares[row]?.[col];
    if (!cell) return undefined;

    const colCoord = cell[1] as string;
    const rowCoord = cell[2] as string;
    const eCoord = variableCount === 5 ? (cell[3] as string) : undefined;

    let binary: string;
    let variables: string;

    if (variableCount === 2) {
      binary = rowCoord + colCoord;
      const a = rowCoord === "0" ? "A'" : "A";
      const b = colCoord === "0" ? "B'" : "B";
      variables = `${a}${b}`;
    } else if (variableCount === 3) {
      binary = rowCoord + colCoord;
      const a = rowCoord === "0" ? "A'" : "A";
      const b = colCoord[0] === "0" ? "B'" : "B";
      const c = colCoord[1] === "0" ? "C'" : "C";
      variables = `${a}${b}${c}`;
    } else if (variableCount === 4) {
      binary = rowCoord + colCoord;
      const a = rowCoord[0] === "0" ? "A'" : "A";
      const b = rowCoord[1] === "0" ? "B'" : "B";
      const c = colCoord[0] === "0" ? "C'" : "C";
      const d = colCoord[1] === "0" ? "D'" : "D";
      variables = `${a}${b}${c}${d}`;
    } else if (variableCount === 5) {
      binary = (eCoord || "0") + rowCoord + colCoord;
      const e = eCoord === "0" ? "E'" : "E";
      const a = rowCoord[0] === "0" ? "A'" : "A";
      const b = rowCoord[1] === "0" ? "B'" : "B";
      const c = colCoord[0] === "0" ? "C'" : "C";
      const d = colCoord[1] === "0" ? "D'" : "D";
      variables = `${e}${a}${b}${c}${d}`;
    } else {
      binary = "";
      variables = "";
    }

    const minterm = parseInt(binary, 2);

    return { binary, minterm, variables };
  };

  // Get the group for a specific cell (with table support for 5 variables)
  const getCellGroup = (row: number, col: number, table?: number): KMapGroup | undefined => {
    return groups.find(group => 
      group.cells.some(cell => {
        const matchesPosition = cell.riga === row && cell.col === col;
        // For 5-variable, also check table if specified
        if (variableCount === 5 && table !== undefined && cell.table !== undefined) {
          return matchesPosition && cell.table === table;
        }
        return matchesPosition;
      })
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
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        Loading K-Map...
      </div>
    );
  }

  // For 5 variables, render two separate 4x4 tables
  if (variableCount === 5) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* E = 0 Table (columns 0-3) */}
        <div className="relative">
          <div className="text-center mb-2">
            <span className="inline-block bg-primary/10 dark:bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm font-semibold">
              E = 0
            </span>
          </div>
          <div className="inline-block overflow-hidden">
            {/* Column Headers */}
            <div className="flex">
              <div className="w-16 h-12 flex items-center justify-center relative text-xs text-muted-foreground">
                <CornerLabel label={cornerLabel} />
              </div>
              {colHeaders.map((header, index) => (
                <div
                  key={index}
                  className="w-16 h-12 flex items-center justify-center font-semibold text-sm text-foreground"
                >
                  {header}
                </div>
              ))}
            </div>

            {/* Rows with data - E=0 table (columns 0-3) */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex">
                {/* Row Header */}
                <div className="w-16 h-16 flex items-center justify-center font-semibold text-sm text-foreground">
                  {rowHeaders[rowIndex]}
                </div>
                
                {/* Data Cells - columns 0-3 for E=0 */}
                {Array.from({ length: 4 }).map((_, colIndex) => {
                  const cell = squares[rowIndex]?.[colIndex]; // Access columns 0-3
                  const group = getCellGroup(rowIndex, colIndex, 0);
                  const connections = getGroupConnections(rowIndex, colIndex, group);
                  const coordinates = getCellCoordinates(rowIndex, colIndex);
                  
                  if (!cell) return null;

                  return (
                    <Square
                      key={`e0-${rowIndex}-${colIndex}`}
                      value={cell[0]}
                      onClick={() => onCellClick(rowIndex, colIndex)}
                      groupColor={group?.color}
                      isGrouped={!!group}
                      groupConnections={connections}
                      coordinates={coordinates}
                      className="w-16 h-16"
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Group Overlays for E=0 table */}
          {groups.filter(g => g.cells.some(c => c.table === 0 || c.table === undefined)).map((group) => (
            <GroupOverlay
              key={group.id}
              group={{
                ...group,
                cells: group.cells.filter(c => c.table === 0 || c.table === undefined)
              }}
              cellSize={64}
              headerOffset={{ x: 64, y: 48 + 40 }} // Extra 40px for E=0 label
              rows={rows}
              cols={4}
            />
          ))}
        </div>

        {/* E = 1 Table (columns 4-7) */}
        <div className="relative">
          <div className="text-center mb-2">
            <span className="inline-block bg-(--color-greenz)/10 dark:bg-(--color-greenz)/20 text-(--color-greenz) px-3 py-1 rounded-lg text-sm font-semibold">
              E = 1
            </span>
          </div>
          <div className="inline-block overflow-hidden">
            {/* Column Headers */}
            <div className="flex">
              <div className="w-16 h-12 flex items-center justify-center relative text-xs text-muted-foreground">
                <CornerLabel label={cornerLabel} />
              </div>
              {colHeaders.map((header, index) => (
                <div
                  key={index}
                  className="w-16 h-12 flex items-center justify-center font-semibold text-sm text-foreground"
                >
                  {header}
                </div>
              ))}
            </div>

            {/* Rows with data - E=1 table (columns 4-7) */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex">
                {/* Row Header */}
                <div className="w-16 h-16 flex items-center justify-center font-semibold text-sm text-foreground">
                  {rowHeaders[rowIndex]}
                </div>
                
                {/* Data Cells - columns 4-7 for E=1 */}
                {Array.from({ length: 4 }).map((_, colIndex) => {
                  const actualCol = colIndex + 4; // Offset by 4 to access columns 4-7
                  const cell = squares[rowIndex]?.[actualCol];
                  const group = getCellGroup(rowIndex, colIndex, 1);
                  const connections = getGroupConnections(rowIndex, colIndex, group);
                  const coordinates = getCellCoordinates(rowIndex, actualCol);
                  
                  if (!cell) return null;

                  return (
                    <Square
                      key={`e1-${rowIndex}-${colIndex}`}
                      value={cell[0]}
                      onClick={() => onCellClick(rowIndex, actualCol)}
                      groupColor={group?.color}
                      isGrouped={!!group}
                      groupConnections={connections}
                      coordinates={coordinates}
                      className="w-16 h-16"
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Group Overlays for E=1 table */}
          {groups.filter(g => g.cells.some(c => c.table === 1)).map((group) => (
            <GroupOverlay
              key={`e1-${group.id}`}
              group={{
                ...group,
                cells: group.cells.filter(c => c.table === 1).map(c => ({ ...c, col: c.col % 4 }))
              }}
              cellSize={64}
              headerOffset={{ x: 64, y: 48 + 40 }}
              rows={rows}
              cols={4}
            />
          ))}
        </div>
      </div>
    );
  }

  // For 2-4 variables, render single table
  return (
    <div className="relative">
      {/* K-Map Table */}
      <div className="inline-block overflow-hidden">
        {/* Column Headers */}
        <div className="flex">
          <div className="w-16 h-12 flex items-center justify-center relative text-xs text-muted-foreground">
            <CornerLabel label={cornerLabel} />
          </div>
          {colHeaders.map((header, index) => (
            <div
              key={index}
              className="w-16 h-12 flex items-center justify-center font-semibold text-sm text-foreground"
            >
              {header}
            </div>
          ))}
        </div>

        {/* Rows with data */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex">
            {/* Row Header */}
            <div className="w-16 h-16 flex items-center justify-center font-semibold text-sm text-foreground">
              {rowHeaders[rowIndex]}
            </div>
            
            {/* Data Cells */}
            {Array.from({ length: cols }).map((_, colIndex) => {
              const cell = squares[rowIndex]?.[colIndex];
              const group = getCellGroup(rowIndex, colIndex);
              const connections = getGroupConnections(rowIndex, colIndex, group);
              const coordinates = getCellCoordinates(rowIndex, colIndex);
              
              if (!cell) return null;

              return (
                <Square
                  key={`${rowIndex}-${colIndex}`}
                  value={cell[0]}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  groupColor={group?.color}
                  isGrouped={!!group}
                  groupConnections={connections}
                  coordinates={coordinates}
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
            stroke="var(--border)" 
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      
      {/* Top-right label (column variables) */}
      <div className="absolute bottom-2 left-2 text-xs font-medium text-muted-foreground">
        {parts[1]}
      </div>
      
      {/* Bottom-left label (row variables) */}
      <div className="absolute top-2 right-2 text-xs font-medium text-muted-foreground">
        {parts[0]}
      </div>
    </div>
  );
};

export default Map;
