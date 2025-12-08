import React from "react";
import Square from "./Square";
import { type KMapMatrix, type KMapGroup, getDimensions } from "@/utils/karnaugh.utils";

interface MapProps {
  squares: KMapMatrix;
  groups: KMapGroup[];
  variableCount: number;
  onCellClick: (row: number, col: number) => void;
  formType: 'SOP' | 'POS';
}

const Map: React.FC<MapProps> = ({ squares, groups, variableCount, onCellClick, formType }) => {
  const { rows, cols } = getDimensions(variableCount);
  
  // Generate headers for the map
  // Headers follow Gray code order: [00, 01, 11, 10]
  const generateHeaders = () => {
    if (variableCount === 2) {
      return {
        colHeaders: ["B'", "B"], // Gray code: [0, 1]
        rowHeaders: ["A'", "A"], // Gray code: [0, 1]
        cornerLabel: 'A//B'
      };
    } else if (variableCount === 3) {
      return {
        colHeaders: ["B'C'", "B'C", "BC", "BC'"], // Gray code: [00, 01, 11, 10]
        rowHeaders: ["A'", "A"], // Gray code: [0, 1]
        cornerLabel: 'A//BC'
      };
    } else if (variableCount === 4) {
      return {
        colHeaders: ["C'D'", "C'D", "CD", "CD'"], // Gray code: [00, 01, 11, 10]
        rowHeaders: ["A'B'", "A'B", "AB", "AB'"], // Gray code: [00, 01, 11, 10]
        cornerLabel: 'AB//CD'
      };
    } else if (variableCount === 5) {
      return {
        colHeaders: ["C'D'", "C'D", "CD", "CD'"], // Gray code: [00, 01, 11, 10]
        rowHeaders: ["A'B'", "A'B", "AB", "AB'"], // Gray code: [00, 01, 11, 10]
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
      // Display in ABCD order (row variables first, then column variables)
      variables = `${a}${b}${c}${d}`;
    } else if (variableCount === 5) {
      binary = (eCoord || "0") + rowCoord + colCoord;
      const e = eCoord === "0" ? "E'" : "E";
      const a = rowCoord[0] === "0" ? "A'" : "A";
      const b = rowCoord[1] === "0" ? "B'" : "B";
      const c = colCoord[0] === "0" ? "C'" : "C";
      const d = colCoord[1] === "0" ? "D'" : "D";
      // Display in ABCDE order (E first, then row variables, then column variables)
      variables = `${a}${b}${c}${d}${e}`;
    } else {
      binary = "";
      variables = "";
    }

    const minterm = parseInt(binary, 2);

    return { binary, minterm, variables };
  };

  // Get the group for a specific cell (with table support for 5 variables)
  // Returns the group only if this specific cell is actually part of the group
  const getCellGroup = (row: number, col: number, table?: number): KMapGroup | undefined => {
    const cell = squares[row]?.[col];
    if (!cell) return undefined;
    
    // First check if this cell's value is appropriate for grouping
    const cellValue = cell[0];
    const isValidForGrouping = cellValue === 'X' || 
      (formType === 'SOP' && cellValue === 1) || 
      (formType === 'POS' && cellValue === 0);
    
    if (!isValidForGrouping) return undefined;
    
    return groups.find(group => 
      group.cells.some(groupCell => {
        const matchesPosition = groupCell.riga === row && groupCell.col === col;
        if (!matchesPosition) return false;

        // For 5-variable maps, ensure we are looking at the correct table (E=0 vs E=1)
        if (variableCount === 5 && table !== undefined) {
          const cellTable = groupCell.table !== undefined ? groupCell.table : (groupCell.col >= 4 ? 1 : 0);
          return cellTable === table;
        }

        return true;
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
            {Array.from({ length: rows }).map((_, visualRowIndex) => {
              // Map visual row index to actual storage row index using Gray code
              const grayCode4 = [0, 1, 3, 2];
              const storageRowIndex = grayCode4[visualRowIndex];
              
              return (
                <div key={visualRowIndex} className="flex">
                  {/* Row Header */}
                  <div className="w-16 h-16 flex items-center justify-center font-semibold text-sm text-foreground">
                    {rowHeaders[visualRowIndex]}
                  </div>
                  
                  {/* Data Cells - columns 0-3 for E=0 */}
                  {Array.from({ length: 4 }).map((_, colIndex) => {
                    const cell = squares[storageRowIndex]?.[colIndex]; // Access columns 0-3
                    const group = getCellGroup(storageRowIndex, colIndex, 0);
                    const connections = getGroupConnections(storageRowIndex, colIndex, group);
                    const coordinates = getCellCoordinates(storageRowIndex, colIndex);
                    
                    if (!cell) return null;

                    // getCellGroup already validates if the cell is appropriate for the form type
                    const shouldShowGroup = !!group;

                    return (
                      <Square
                        key={`e0-${visualRowIndex}-${colIndex}`}
                        value={cell[0]}
                        onClick={() => onCellClick(storageRowIndex, colIndex)}
                        groupColor={shouldShowGroup ? group?.color : undefined}
                        isGrouped={shouldShowGroup}
                        groupConnections={shouldShowGroup ? connections : {}}
                        coordinates={coordinates}
                        className="w-16 h-16"
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Group Overlays for E=0 table */}
          {groups.filter(g => g.cells.some(c => c.table === 0 || c.table === undefined)).map((group) => (
            <GroupOverlay
              key={group.id}
              group={{
                ...group,
                cells: group.cells.filter(c => (c.table === 0) || (c.table === undefined && c.col < 4))
              }}
              cellSize={64}
              headerOffset={{ x: 64, y: 48 + 40 }} // Extra 40px for E=0 label
              squares={squares}
              formType={formType}
              variableCount={variableCount}
            />
          ))}
        </div>

        {/* E = 1 Table (columns 4-7) */}
        <div className="relative">
          <div className="text-center mb-2">
            <span className="inline-block bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg text-sm font-semibold">
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
            {Array.from({ length: rows }).map((_, visualRowIndex) => {
              // Map visual row index to actual storage row index using Gray code
              const grayCode4 = [0, 1, 3, 2];
              const storageRowIndex = grayCode4[visualRowIndex];
              
              return (
                <div key={visualRowIndex} className="flex">
                  {/* Row Header */}
                  <div className="w-16 h-16 flex items-center justify-center font-semibold text-sm text-foreground">
                    {rowHeaders[visualRowIndex]}
                  </div>
                  
                  {/* Data Cells - columns 4-7 for E=1 */}
                  {Array.from({ length: 4 }).map((_, colIndex) => {
                    const actualCol = colIndex + 4; // Offset by 4 to access columns 4-7
                    const cell = squares[storageRowIndex]?.[actualCol];
                    const group = getCellGroup(storageRowIndex, actualCol, 1);
                    // Use the actual column (4-7) for connection detection
                    const connections = getGroupConnections(storageRowIndex, actualCol, group);
                    const coordinates = getCellCoordinates(storageRowIndex, actualCol);
                    
                    if (!cell) return null;

                    // getCellGroup already validates if the cell is appropriate for the form type
                    const shouldShowGroup = !!group;

                    return (
                      <Square
                        key={`e1-${visualRowIndex}-${colIndex}`}
                        value={cell[0]}
                        onClick={() => onCellClick(storageRowIndex, actualCol)}
                        groupColor={shouldShowGroup ? group?.color : undefined}
                        isGrouped={shouldShowGroup}
                        groupConnections={shouldShowGroup ? connections : {}}
                        coordinates={coordinates}
                        className="w-16 h-16"
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Group Overlays for E=1 table */}
          {groups.filter(g => g.cells.some(c => c.table === 1)).map((group) => (
            <GroupOverlay
              key={`e1-${group.id}`}
              group={{
                ...group,
                cells: group.cells.filter(c => (c.table === 1) || (c.table === undefined && c.col >= 4))
              }}
              cellSize={64}
              headerOffset={{ x: 64, y: 48 + 40 }}
              squares={squares}
              formType={formType}
              variableCount={variableCount}
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
        {Array.from({ length: rows }).map((_, visualRowIndex) => {
          // Map visual row index to actual storage row index using Gray code
          const grayCode4 = [0, 1, 3, 2];
          const grayCode2 = [0, 1];
          const storageRowIndex = rows === 4 ? grayCode4[visualRowIndex] : 
                                  rows === 2 ? grayCode2[visualRowIndex] : visualRowIndex;
          
          return (
            <div key={visualRowIndex} className="flex">
              {/* Row Header */}
              <div className="w-16 h-16 flex items-center justify-center font-semibold text-sm text-foreground">
                {rowHeaders[visualRowIndex]}
              </div>
              
              {/* Data Cells */}
              {Array.from({ length: cols }).map((_, colIndex) => {
                const cell = squares[storageRowIndex]?.[colIndex];
                const group = getCellGroup(storageRowIndex, colIndex);
                const connections = getGroupConnections(storageRowIndex, colIndex, group);
                const coordinates = getCellCoordinates(storageRowIndex, colIndex);
                
                if (!cell) return null;

                // getCellGroup already validates if the cell is appropriate for the form type
                const shouldShowGroup = !!group;

                return (
                  <Square
                    key={`${visualRowIndex}-${colIndex}`}
                    value={cell[0]}
                    onClick={() => onCellClick(storageRowIndex, colIndex)}
                    groupColor={shouldShowGroup ? group?.color : undefined}
                    isGrouped={shouldShowGroup}
                    groupConnections={shouldShowGroup ? connections : {}}
                    coordinates={coordinates}
                    className="w-16 h-16"
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Group Overlays */}
      {groups.map((group) => (
        <GroupOverlay
          key={group.id}
          group={group}
          cellSize={64} // 16 * 4 (w-16 = 4rem = 64px)
          headerOffset={{ x: 64, y: 48 }} // Header sizes
          squares={squares}
          formType={formType}
          variableCount={variableCount}
        />
      ))}
    </div>
  );
};

// Component for drawing group overlays
// Note: The colored overlays are supplementary visual aids.
// The actual group membership is shown by the individual cell coloring via shouldShowGroup.
// This overlay creates rectangular regions but cells are individually validated.
interface GroupOverlayProps {
  group: KMapGroup;
  cellSize: number;
  headerOffset: { x: number; y: number };
  squares: KMapMatrix;
  formType: 'SOP' | 'POS';
  variableCount: number;
}

const GroupOverlay: React.FC<GroupOverlayProps> = ({ group, cellSize, headerOffset, squares, formType, variableCount }) => {
  if (group.cells.length === 0) return null;

  // Gray code mappings for converting storage indices to visual indices
  const grayCode4 = [0, 1, 3, 2];
  const grayCode2 = [0, 1];
  
  // Helper to convert storage row index to visual row index
  const getVisualRowIndex = (storageRow: number): number => {
    if (variableCount === 2) {
      return grayCode2.indexOf(storageRow);
    } else if (variableCount === 3 || variableCount === 4 || variableCount === 5) {
      return grayCode4.indexOf(storageRow);
    }
    return storageRow;
  };

  // Filter cells to only include those with valid values for the current form type
  const validCells = group.cells.filter(cell => {
    const cellData = squares[cell.riga]?.[cell.col];
    if (!cellData) return false;
    const cellValue = cellData[0];
    // For SOP, only highlight 1s and Xs; for POS, only highlight 0s and Xs
    return cellValue === 'X' || 
      (formType === 'SOP' && cellValue === 1) || 
      (formType === 'POS' && cellValue === 0);
  });

  if (validCells.length === 0) return null;

  // Instead of drawing rectangles based on min/max (which can incorrectly cover non-group cells),
  // draw individual cell overlays for each cell in the group
  return (
    <>
      {validCells.map((cell, index) => {
        const visualRowIndex = getVisualRowIndex(cell.riga);
        return (
          <div
            key={`${group.id}-cell-${index}`}
            className="absolute pointer-events-none rounded-sm"
            style={{
              // For 5-variable maps, table 1 uses columns 4-7 in storage but 0-3 visually
              left: headerOffset.x + ((variableCount === 5 && (cell.table === 1 || cell.col >= 4)) ? (cell.col % 4) : cell.col) * cellSize + 2,
              top: headerOffset.y + visualRowIndex * cellSize + 2,
              width: cellSize - 4,
              height: cellSize - 4,
              backgroundColor: `${group.color}25`,
              border: `2px solid ${group.color}60`,
              zIndex: 10,
            }}
          />
        );
      })}
    </>
  );
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
