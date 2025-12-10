export type CellValue = 0 | 1 | 'X';
export type KMapMatrix = CellValue[][][]; // [row][col][value, colCoord, rowCoord, eCoord?]
export type PermMatrix = string[][];

// For 5-variable K-Maps, we need to track which table (E=0 or E=1)
export interface GroupCell {
  riga: number;
  col: number;
  table?: number; // 0 for E=0 table, 1 for E=1 table (only for 5-variable)
}

export interface KMapGroup {
  cells: GroupCell[];
  color: string;
  id: number;
}

export interface KMapSolution {
  expression: string;
  literalCost: number;
  groups: KMapGroup[];
}

// Color palette for groups (ROYGBIV + more)
export const GROUP_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
];

export const isPowerOfTwo = (x: number, y: number): boolean => {
  if (x === 1) return y === 1;
  let pow = 1;
  while (pow < y) pow *= x;
  return pow === y;
};

export const getMatrixPerm = (dim: number): PermMatrix => {
  const col = dim;
  const row = Math.pow(2, dim);
  const matrix: string[][] = [];

  // Initialize matrix
  for (let i = 0; i < row; i++) {
    const temp: string[] = [];
    for (let j = 0; j < col; j++) {
      temp[j] = "0";
    }
    matrix[i] = temp;
  }

  // Generate binary permutations
  let tempDim = dim;
  for (let j = 0; j < col; j++) {
    const count = Math.pow(2, tempDim) / 2;
    for (let i = 0; i < row; i++) {
      const val = (i % (count * 2) < count) ? 0 : 1;
      matrix[i][j] = String(val);
    }
    tempDim--;
  }

  return matrix;
};

export const getMatrixSquare = (dim: number): KMapMatrix => {
  let row = dim;
  let col = dim;

  if (dim === 3) {
    row = 2;
    col = 4;
  } else if (dim === 5) {
    // 5 variables: Two 4x4 maps (AB on rows, CD on columns, E splits the tables)
    // We'll store this as a 4x8 matrix internally:
    // - Columns 0-3: E=0 table
    // - Columns 4-7: E=1 table
    row = 4;
    col = 8; // DOUBLED to accommodate both E=0 and E=1 tables
  }

  const matrix: CellValue[][][] = [];
  for (let i = 0; i < row; i++) {
    const temp: CellValue[][] = [];
    for (let j = 0; j < col; j++) {
      const cell: CellValue[] = [0, "0" as CellValue, "0" as CellValue];
      temp[j] = cell;
    }
    matrix[i] = temp;
  }

  return matrix;
};

export const setCoordinates = (
  squares: KMapMatrix,
  perm: PermMatrix,
  typeMap: number
): KMapMatrix => {
  let r = typeMap;
  let c = typeMap;

  if (typeMap === 3) {
    c = 4;
    r = 2;
  } else if (typeMap === 5) {
    // 5 variables: 4x8 map (4 rows, 8 cols split into two 4x4 tables)
    c = 8;
    r = 4;
  }

  // Gray code lookup tables for different dimensions
  const grayCode2 = [0, 1]; // 00, 01
  const grayCode4 = [0, 1, 3, 2]; // 00, 01, 11, 10

  for (let i = 0; i < c; i++) {
    // For 5 variables, determine which table (E=0 or E=1)
    let tableIndex = 0;
    let colInTable = i;
    
    if (typeMap === 5) {
      tableIndex = i < 4 ? 0 : 1; // First 4 cols = E=0, Last 4 cols = E=1
      colInTable = i % 4; // Column within the table (0-3)
    }

    for (let j = 0; j < r; j++) {
      // Gray code mapping for rows
      let grayRowIndex = j;
      if (r === 4) {
        grayRowIndex = grayCode4[j];
      } else if (r === 2) {
        grayRowIndex = grayCode2[j];
      }

      // Calculate the truth table index based on variable count
      let truthTableIndex: number;
      if (typeMap === 5) {
        // For 5 variables: EABCD (E is MSB, D is LSB)
        // E is the table index (bit 4)
        // AB are rows (bits 3-2)
        // CD are columns (bits 1-0)
        const cdBits = grayCode4[colInTable]; // Gray-coded column value
        const abBits = grayCode4[j]; // Gray-coded row value
        truthTableIndex = tableIndex * 16 + abBits * 4 + cdBits;
      } else if (typeMap === 4) {
        // For 4 variables: ABCD (A is MSB, D is LSB)
        // AB are rows (bits 3-2)
        // CD are columns (bits 1-0)
        const cdBits = grayCode4[i]; // Gray-coded column value
        const abBits = grayCode4[j]; // Gray-coded row value
        truthTableIndex = abBits * 4 + cdBits;
      } else if (typeMap === 3) {
        // For 3 variables: ABC (A is MSB, C is LSB)
        // A is row (bit 2)
        // BC are columns (bits 1-0)
        const bcBits = grayCode4[i]; // Gray-coded column value
        const aBit = grayCode2[j]; // Gray-coded row value
        truthTableIndex = aBit * 4 + bcBits;
      } else {
        // For 2 variables: AB (A is MSB, B is LSB)
        // A is row (bit 1)
        // B is column (bit 0)
        const bBit = grayCode2[i]; // Gray-coded column value
        const aBit = grayCode2[j]; // Gray-coded row value
        truthTableIndex = aBit * 2 + bBit;
      }

      // Set coordinates based on variable arrangement
      // perm[truthTableIndex] contains [MSB, ..., LSB]
      // For ABC: perm = [A, B, C]
      // For ABCD: perm = [A, B, C, D]
      // For ABCDE: perm = [A, B, C, D, E]
      
      let colCoord = "";
      let rowCoord = "";
      
      if (typeMap === 5) {
        // Column: CD (bits at indices 2-3 from perm, which is [A,B,C,D,E])
        colCoord = perm[truthTableIndex][2] + perm[truthTableIndex][3]; // CD
        // Row: AB (bits at indices 0-1 from perm)
        rowCoord = perm[truthTableIndex][0] + perm[truthTableIndex][1]; // AB
      } else if (typeMap === 4) {
        // Column: CD (bits at indices 2-3 from perm, which is [A,B,C,D])
        colCoord = perm[truthTableIndex][2] + perm[truthTableIndex][3]; // CD
        // Row: AB (bits at indices 0-1 from perm)
        rowCoord = perm[truthTableIndex][0] + perm[truthTableIndex][1]; // AB
      } else if (typeMap === 3) {
        // Column: BC (bits at indices 1-2 from perm, which is [A,B,C])
        colCoord = perm[truthTableIndex][1] + perm[truthTableIndex][2]; // BC
        // Row: A (bit at index 0 from perm)
        rowCoord = perm[truthTableIndex][0]; // A
      } else { // typeMap === 2
        // Column: B (bit at index 1 from perm, which is [A,B])
        colCoord = perm[truthTableIndex][1]; // B
        // Row: A (bit at index 0 from perm)
        rowCoord = perm[truthTableIndex][0]; // A
      }
      
      squares[grayRowIndex][i][1] = colCoord as CellValue;
      squares[grayRowIndex][i][2] = rowCoord as CellValue;
      
      // For 5 variables, add E coordinate
      if (typeMap === 5) {
        squares[grayRowIndex][i][3] = String(tableIndex) as CellValue;
      }
    }
  }

  return squares;
};

export const cycleCellValue = (currentValue: CellValue): CellValue => {
  if (currentValue === 'X') return 0;
  if (currentValue === 0) return 1;
  return 'X';
};

export const getDimensions = (typeMap: number) => {
  if (typeMap === 5) return { rows: 4, cols: 8 }; // 4x8 (two 4x4 tables side by side)
  if (typeMap === 4) return { rows: 4, cols: 4 };
  if (typeMap === 3) return { rows: 2, cols: 4 };
  return { rows: 2, cols: 2 };
};

// Main algorithm - converted from the original JavaScript
export const solveKarnaugh = (
  squares: KMapMatrix,
  typeMap: number,
  formType: 'SOP' | 'POS'
): KMapSolution => {
  const { rows: dimRig, cols: dimCol } = getDimensions(typeMap);
  const val = formType === "SOP" ? 1 : 0;

  try {
    // Find all groups of the target value
    const groups = findAllGroups(squares, dimRig, dimCol, val, typeMap);
    
    // Generate solution
    const solution = generateSolution(squares, groups, typeMap, formType);
    
    // Create colored groups for visualization
    const coloredGroups = groups
      .map((group, index) => ({
        cells: group,
        color: GROUP_COLORS[index % GROUP_COLORS.length],
        id: index
      }))
      .filter(group => group.cells.length > 0);

    return {
      expression: solution.expression,
      literalCost: solution.literalCost,
      groups: coloredGroups
    };
  } catch (error) {
    console.error('Error in solveKarnaugh:', error);
    return {
      expression: formType === 'SOP' ? '0' : '1',
      literalCost: 0,
      groups: []
    };
  }
};

// Enhanced grouping algorithm with proper K-map adjacency handling
// In K-maps, adjacency follows Gray code, meaning cells that differ by only 1 bit are adjacent
// This includes wraparound: last row/col is adjacent to first row/col
const findAllGroups = (
  squares: KMapMatrix,
  rows: number,
  cols: number,
  targetValue: CellValue,
  typeMap: number
): GroupCell[][] => {
  const allPossibleGroups: GroupCell[][] = [];
  
  // For 5 variables, we can have cross-table groups
  const canHaveCrossTableGroups = typeMap === 5;
  
  // Effective dimensions for grouping (for 5-var, treat each table separately first)
  const effectiveCols = typeMap === 5 ? 4 : cols;
  
  // Find all possible valid groups of each size (from largest to smallest)
  // Valid sizes are powers of 2: 16, 8, 4, 2, 1 for 4-var; 8, 4, 2, 1 for 3-var; etc.
  const maxGroupSize = rows * effectiveCols;
  
  for (let groupSize = maxGroupSize; groupSize >= 1; groupSize = Math.floor(groupSize / 2)) {
    if (!isPowerOfTwo(2, groupSize)) continue;
    
    const groupsOfSize: GroupCell[][] = [];
    
    // For 5 variables, try cross-table groups first (where E varies)
    if (canHaveCrossTableGroups && groupSize >= 2) {
      findCrossTableGroups(squares, rows, targetValue, groupSize / 2, groupsOfSize, typeMap);
    }
    
    // Find all rectangular groups with wraparound support
    findAllRectangularGroups(squares, rows, cols, targetValue, groupSize, groupsOfSize, typeMap);
    
    allPossibleGroups.push(...groupsOfSize);
  }
  
  // Select the minimal set that covers all essential minterms
  const essentialMinterms = getEssentialMinterms(squares, rows, cols, targetValue);
  const selectedGroups = selectMinimalGroupSet(allPossibleGroups, essentialMinterms);
  
  return selectedGroups;
};

// Find all valid rectangular groups of a specific size, including wraparound
const findAllRectangularGroups = (
  squares: KMapMatrix,
  rows: number,
  cols: number,
  targetValue: CellValue,
  size: number,
  groups: GroupCell[][],
  typeMap: number
) => {
  // For 5 variables, process each table (E=0 and E=1) separately
  if (typeMap === 5) {
    // E=0 table (columns 0-3)
    findGroupsInRegion(squares, rows, 0, 4, targetValue, size, groups, 0);
    // E=1 table (columns 4-7)
    findGroupsInRegion(squares, rows, 4, 4, targetValue, size, groups, 1);
  } else {
    findGroupsInRegion(squares, rows, 0, cols, targetValue, size, groups, undefined);
  }
};

// Find groups within a specific region of the K-map
const findGroupsInRegion = (
  squares: KMapMatrix,
  rows: number,
  colStart: number,
  numCols: number,
  targetValue: CellValue,
  size: number,
  groups: GroupCell[][],
  tableIndex: number | undefined
) => {
  const factors = getFactors(size);
  const seenGroups = new Set<string>();
  
  for (const [height, width] of factors) {
    // Skip invalid dimensions for this region
    if (height > rows || width > numCols) continue;
    
    // Try all possible starting positions with wraparound
    for (let startRow = 0; startRow < rows; startRow++) {
      for (let startCol = 0; startCol < numCols; startCol++) {
        const group = tryGroupWithWraparound(
          squares, rows, colStart, numCols, 
          startRow, startCol, height, width, 
          targetValue, tableIndex
        );
        
        if (group.length === size) {
          // Create a canonical key for this group to avoid duplicates
          const sortedCells = [...group].sort((a, b) => 
            a.riga !== b.riga ? a.riga - b.riga : a.col - b.col
          );
          const key = sortedCells.map(c => `${c.riga},${c.col}`).join('|');
          
          if (!seenGroups.has(key)) {
            seenGroups.add(key);
            groups.push(group);
          }
        }
      }
    }
  }
};

// Try to form a group starting at a position with wraparound support
// IMPORTANT: Uses VISUAL coordinates for adjacency, converts to STORAGE for data access
const tryGroupWithWraparound = (
  squares: KMapMatrix,
  totalRows: number,
  colStart: number,
  numCols: number,
  startRow: number,  // This is VISUAL row index
  startCol: number,  // This is relative column within the region (0 to numCols-1)
  height: number,
  width: number,
  targetValue: CellValue,
  tableIndex: number | undefined
): GroupCell[] => {
  const group: GroupCell[] = [];
  let hasTargetValue = false;
  
  // Gray code mapping for 4 rows: visual [0,1,2,3] -> storage [0,1,3,2]
  const visualToStorageRow = (visualRow: number): number => {
    if (totalRows === 4) {
      const mapping = [0, 1, 3, 2];
      return mapping[visualRow % 4];
    }
    return visualRow;
  };
  
  for (let dr = 0; dr < height; dr++) {
    for (let dc = 0; dc < width; dc++) {
      // Use modulo for wraparound on VISUAL coordinates
      const visualRow = (startRow + dr) % totalRows;
      const relativeCol = (startCol + dc) % numCols;
      
      // Convert to STORAGE coordinates
      const storageRow = visualToStorageRow(visualRow);
      const storageCol = colStart + relativeCol;
      
      const cellValue = squares[storageRow]?.[storageCol]?.[0];
      
      // Cell must have target value or be don't care ('X')
      if (cellValue !== targetValue && cellValue !== 'X') {
        return [];
      }
      
      if (cellValue === targetValue) {
        hasTargetValue = true;
      }
      
      // Store using STORAGE coordinates (since that's how groups are looked up)
      group.push({ 
        riga: storageRow, 
        col: storageCol,
        table: tableIndex
      });
    }
  }
  
  // Group must contain at least one cell with the target value
  return hasTargetValue ? group : [];
};

// Get all minterms that must be covered (cells with target value)
const getEssentialMinterms = (
  squares: KMapMatrix,
  rows: number,
  cols: number,
  targetValue: CellValue
): Array<{row: number, col: number}> => {
  const minterms: Array<{row: number, col: number}> = [];
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (squares[r][c][0] === targetValue) {
        minterms.push({row: r, col: c});
      }
    }
  }
  
  return minterms;
};

// Find groups that span across E=0 and E=1 tables (for 5 variables)
// These groups have the same AB/CD pattern in both tables, meaning E varies
const findCrossTableGroups = (
  squares: KMapMatrix,
  rows: number,
  targetValue: CellValue,
  sizePerTable: number, // Size in each table (total group size = sizePerTable * 2)
  groups: GroupCell[][],
  typeMap: number
) => {
  if (typeMap !== 5) return; // Only for 5-variable maps
  
  // Gray code mapping for 4 rows: visual [0,1,2,3] -> storage [0,1,3,2]
  const visualToStorageRow = (visualRow: number): number => {
    const mapping = [0, 1, 3, 2];
    return mapping[visualRow % 4];
  };
  
  // Try to find matching patterns in columns 0-3 (E=0) and 4-7 (E=1)
  const factors = getFactors(sizePerTable);
  
  for (const [height, width] of factors) {
    // Try all possible VISUAL positions in the 4x4 sub-map
    for (let startVisualRow = 0; startVisualRow < rows; startVisualRow++) {
      for (let startCol = 0; startCol < 4; startCol++) {
        // Check if the same pattern exists in both E=0 and E=1 tables
        const e0Group: GroupCell[] = [];
        const e1Group: GroupCell[] = [];
        let valid = true;
        
        // Use wraparound for both horizontal and vertical (in VISUAL space)
        for (let r = 0; r < height && valid; r++) {
          const visualRow = (startVisualRow + r) % rows;
          const storageRow = visualToStorageRow(visualRow);
          
          for (let c = 0; c < width && valid; c++) {
            const col = (startCol + c) % 4;
            
            const e0Col = col; // E=0 table: columns 0-3
            const e1Col = col + 4; // E=1 table: columns 4-7
            
            const e0Cell = squares[storageRow]?.[e0Col]?.[0];
            const e1Cell = squares[storageRow]?.[e1Col]?.[0];
            
            // Both cells must have target value or be don't care
            if ((e0Cell !== targetValue && e0Cell !== 'X') ||
                (e1Cell !== targetValue && e1Cell !== 'X')) {
              valid = false;
              break;
            }
            
            e0Group.push({ riga: storageRow, col: e0Col, table: 0 });
            e1Group.push({ riga: storageRow, col: e1Col, table: 1 });
          }
        }
        
        if (valid && e0Group.length === sizePerTable && e1Group.length === sizePerTable) {
          // Found a valid cross-table group
          groups.push([...e0Group, ...e1Group]);
        }
      }
    }
  }
};

// Select minimal set of groups that covers all essential minterms
const selectMinimalGroupSet = (
  allGroups: GroupCell[][],
  essentialMinterms: Array<{row: number, col: number}>
): GroupCell[][] => {
  if (essentialMinterms.length === 0) return [];
  
  // Sort groups by size (largest first), then by number of essential minterms covered
  allGroups.sort((a, b) => {
    if (b.length !== a.length) return b.length - a.length;
    // Tie-breaker: prefer groups that cover more essential minterms
    const aEssential = a.filter(cell => 
      essentialMinterms.some(m => m.row === cell.riga && m.col === cell.col)
    ).length;
    const bEssential = b.filter(cell => 
      essentialMinterms.some(m => m.row === cell.riga && m.col === cell.col)
    ).length;
    return bEssential - aEssential;
  });
  
  const selectedGroups: GroupCell[][] = [];
  const coveredMinterms = new Set<string>();
  
  // Greedy algorithm: pick largest groups that cover uncovered minterms
  for (const group of allGroups) {
    let coversNewMinterm = false;
    
    // Check if this group covers any uncovered essential minterms
    for (const cell of group) {
      // Use only row,col for the key (table is for visualization only)
      const key = `${cell.riga},${cell.col}`;
      const isEssential = essentialMinterms.some(m => m.row === cell.riga && m.col === cell.col);
      
      if (isEssential && !coveredMinterms.has(key)) {
        coversNewMinterm = true;
        break;
      }
    }
    
    if (coversNewMinterm) {
      selectedGroups.push(group);
      
      // Mark all minterms covered by this group
      for (const cell of group) {
        const key = `${cell.riga},${cell.col}`;
        const isEssential = essentialMinterms.some(m => m.row === cell.riga && m.col === cell.col);
        if (isEssential) {
          coveredMinterms.add(key);
        }
      }
      
      // If all essential minterms are covered, we're done
      if (coveredMinterms.size === essentialMinterms.length) {
        break;
      }
    }
  }
  
  return selectedGroups;
};

const getFactors = (n: number): [number, number][] => {
  const factors: [number, number][] = [];
  for (let i = 1; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      factors.push([i, n / i]);
      if (i !== n / i) {
        factors.push([n / i, i]);
      }
    }
  }
  return factors.sort((a, b) => b[0] * b[1] - a[0] * a[1]); // Prefer larger groups
};

const generateSolution = (
  squares: KMapMatrix,
  groups: GroupCell[][],
  typeMap: number,
  formType: 'SOP' | 'POS'
): { expression: string; literalCost: number } => {
  if (groups.length === 0) {
    return {
      expression: formType === 'SOP' ? '0' : '1',
      literalCost: 0
    };
  }

  const variables = ["A", "B", "C", "D", "E"];
  const terms: string[] = [];
  let literalCost = 0;

  for (const group of groups) {
    if (group.length === 0) continue;

    let term = "";
    
    if (typeMap === 2) {
      // 2-variable K-Map: A\B
      // Check if A varies (row coordinate)
      const rowCoords = group.map(cell => squares[cell.riga][cell.col][2] as string);
      const uniqueRows = [...new Set(rowCoords)];
      
      if (uniqueRows.length === 1) {
        // A is constant
        const aBit = uniqueRows[0];
        if (formType === "SOP") {
          term += aBit === "0" ? "A'" : "A";
        } else {
          term += aBit === "0" ? "A" : "A'";
        }
        literalCost++;
      }
      
      // Check B (column coordinate)
      const colCoords = group.map(cell => squares[cell.riga][cell.col][1] as string);
      const uniqueCols = [...new Set(colCoords)];
      
      if (uniqueCols.length === 1) {
        // B is constant
        const bBit = uniqueCols[0];
        if (formType === "SOP") {
          term += bBit === "0" ? "B'" : "B";
        } else {
          term += bBit === "0" ? "B" : "B'";
        }
        literalCost++;
      }
      
    } else if (typeMap === 3) {
      // 3-variable K-Map: A\BC
      // Check if A varies (row coordinate)
      const rowCoords = group.map(cell => squares[cell.riga][cell.col][2] as string);
      const uniqueRows = [...new Set(rowCoords)];
      
      if (uniqueRows.length === 1) {
        // A is constant
        const aBit = uniqueRows[0];
        if (formType === "SOP") {
          term += aBit === "0" ? "A'" : "A";
        } else {
          term += aBit === "0" ? "A" : "A'";
        }
        literalCost++;
      }
      
      // Check B and C (column coordinates)
      const colCoords = group.map(cell => squares[cell.riga][cell.col][1] as string);
      const uniqueCols = [...new Set(colCoords)];
      
      if (uniqueCols.length === 1) {
        // BC is constant
        const bcBits = uniqueCols[0];
        const bBit = bcBits[0];
        const cBit = bcBits[1];
        
        if (formType === "SOP") {
          term += bBit === "0" ? "B'" : "B";
          term += cBit === "0" ? "C'" : "C";
        } else {
          term += bBit === "0" ? "B" : "B'";
          term += cBit === "0" ? "C" : "C'";
        }
        literalCost += 2;
      } else {
        // Check individual bits of BC
        const bBits = colCoords.map(coord => coord[0]);
        const cBits = colCoords.map(coord => coord[1]);
        
        const uniqueBBits = [...new Set(bBits)];
        const uniqueCBits = [...new Set(cBits)];
        
        if (uniqueBBits.length === 1) {
          const bBit = uniqueBBits[0];
          if (formType === "SOP") {
            term += bBit === "0" ? "B'" : "B";
          } else {
            term += bBit === "0" ? "B" : "B'";
          }
          literalCost++;
        }
        
        if (uniqueCBits.length === 1) {
          const cBit = uniqueCBits[0];
          if (formType === "SOP") {
            term += cBit === "0" ? "C'" : "C";
          } else {
            term += cBit === "0" ? "C" : "C'";
          }
          literalCost++;
        }
      }
    } else if (typeMap === 4 || typeMap === 5) {
      // 4 & 5-variable K-Map: AB\CD (+ E for 5-var)
      // Get all coordinates for this group
      const groupCoords = group.map(cell => ({
        colCoord: squares[cell.riga][cell.col][1] as string, // CD coordinates
        rowCoord: squares[cell.riga][cell.col][2] as string, // AB coordinates
        eCoord: typeMap === 5 ? (squares[cell.riga][cell.col][3] as string) : undefined // E coordinate for 5-var
      }));

      // Analyze row coordinates FIRST (AB variables - variables A,B)
      // This ensures ABCD order in the output, not CDAB
      const rowLength = groupCoords[0].rowCoord.length;
      for (let i = 0; i < rowLength; i++) {
        const bits = groupCoords.map(coord => coord.rowCoord[i]);
        const uniqueBits = [...new Set(bits)];
        
        // Only include this variable if all cells in the group have the same bit value
        if (uniqueBits.length === 1) {
          const bit = uniqueBits[0];
          const varIndex = i; // A=0, B=1 (AB are the 1st and 2nd variables)
          if (formType === "SOP") {
            term += bit === "0" ? `${variables[varIndex]}'` : variables[varIndex];
          } else {
            term += bit === "0" ? variables[varIndex] : `${variables[varIndex]}'`;
          }
          literalCost++;
        }
      }
      
      // Analyze column coordinates (CD variables - variables C,D)
      const colLength = groupCoords[0].colCoord.length;
      for (let i = 0; i < colLength; i++) {
        const bits = groupCoords.map(coord => coord.colCoord[i]);
        const uniqueBits = [...new Set(bits)];
        
        // Only include this variable if all cells in the group have the same bit value
        if (uniqueBits.length === 1) {
          const bit = uniqueBits[0];
          const varIndex = i + 2; // C=2, D=3 (CD are the 3rd and 4th variables)
          if (formType === "SOP") {
            term += bit === "0" ? `${variables[varIndex]}'` : variables[varIndex];
          } else {
            term += bit === "0" ? variables[varIndex] : `${variables[varIndex]}'`;
          }
          literalCost++;
        }
      }

      // For 5 variables, check E coordinate last (so it appears as ABCDE)
      if (typeMap === 5) {
        const eBits = groupCoords.map(coord => coord.eCoord).filter(e => e !== undefined);
        const uniqueEBits = [...new Set(eBits)];
        
        // Only include E if it's constant across the group
        if (uniqueEBits.length === 1) {
          const eBit = uniqueEBits[0];
          if (formType === "SOP") {
            term += eBit === "0" ? "E'" : "E";
          } else {
            term += eBit === "0" ? "E" : "E'";
          }
          literalCost++;
        }
      }
    }
    
    if (term) {
      // For POS, wrap each term in parentheses as it represents a sum clause
      if (formType === "POS") {
        // Split the term into individual literals and join with +
        const literals = [];
        let i = 0;
        while (i < term.length) {
          if (i + 1 < term.length && term[i + 1] === "'") {
            // Variable with complement
            literals.push(term.substring(i, i + 2));
            i += 2;
          } else {
            // Variable without complement
            literals.push(term[i]);
            i += 1;
          }
        }
        terms.push(`(${literals.join(' + ')})`);
      } else {
        terms.push(term);
      }
    }
  }

  const operator = formType === "SOP" ? " + " : " · ";
  let expression: string;
  
  if (formType === "POS") {
    // For POS: product of sums format
    expression = terms.length > 0 ? terms.join(operator) : '1';
  } else {
    // For SOP: sum of products format  
    expression = terms.length > 0 ? terms.join(operator) : '0';
  }

  return { expression, literalCost };
};
