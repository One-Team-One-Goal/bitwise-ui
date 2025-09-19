export type CellValue = 0 | 1 | 'X';
export type KMapMatrix = CellValue[][][]; // [row][col][value, colCoord, rowCoord]
export type PermMatrix = string[][];

export interface GroupCell {
  riga: number;
  col: number;
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
  }

  for (let i = 0; i < c; i++) {
    // Gray code mapping
    let l = i;
    if (i === 2) l = 3;
    else if (i === 3) l = 2;

    for (let j = 0; j < r; j++) {
      // Gray code mapping
      let k = j;
      if (j % r === 2) k = 3;
      else if (j % r === 3) k = 2;

      // Set column coordinates
      let val = "";
      let t = typeMap;
      let p = 0;

      do {
        val += perm[i * r + j][p];
        p++;
      } while (p < t / 2);
      
      squares[k][l][1] = val as CellValue;

      // Set row coordinates
      val = "";
      p = Math.floor(t / 2);
      if (typeMap === 3) {
        t = 2;
        p = Math.floor(t / 2 + 1);
      }

      do {
        val += perm[i * r + j][p];
        p++;
      } while (p < t);
      
      squares[k][l][2] = val as CellValue;
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

// Enhanced grouping algorithm with better don't care optimization
const findAllGroups = (
  squares: KMapMatrix,
  rows: number,
  cols: number,
  targetValue: CellValue,
  typeMap: number
): GroupCell[][] => {
  // For better optimization, try to find all possible groups and pick the minimal set
  const allPossibleGroups: GroupCell[][] = [];
  
  // Find all possible groups starting from largest size
  const maxGroupSize = rows * cols;
  
  for (let groupSize = maxGroupSize; groupSize >= 1; groupSize = Math.floor(groupSize / 2)) {
    if (!isPowerOfTwo(2, groupSize)) continue;
    
    // Find all groups of this size without marking as covered yet
    const tempCovered: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false));
    const groupsOfSize: GroupCell[][] = [];
    findGroupsOfExactSize(squares, rows, cols, targetValue, groupSize, tempCovered, groupsOfSize, typeMap);
    
    // Add all found groups to possible groups
    allPossibleGroups.push(...groupsOfSize);
  }
  
  // Now select the minimal set that covers all essential minterms
  const essentialMinterms = getEssentialMinterms(squares, rows, cols, targetValue);
  const selectedGroups = selectMinimalGroupSet(allPossibleGroups, essentialMinterms);
  
  return selectedGroups;
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

// Select minimal set of groups that covers all essential minterms
const selectMinimalGroupSet = (
  allGroups: GroupCell[][],
  essentialMinterms: Array<{row: number, col: number}>
): GroupCell[][] => {
  if (essentialMinterms.length === 0) return [];
  
  // Sort groups by size (largest first) for greedy selection
  allGroups.sort((a, b) => b.length - a.length);
  
  const selectedGroups: GroupCell[][] = [];
  const coveredMinterms = new Set<string>();
  
  // Greedy algorithm: pick largest groups that cover uncovered minterms
  for (const group of allGroups) {
    let coversNewMinterm = false;
    
    // Check if this group covers any uncovered essential minterms
    for (const cell of group) {
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

const findGroupsOfExactSize = (
  squares: KMapMatrix,
  rows: number,
  cols: number,
  targetValue: CellValue,
  size: number,
  covered: boolean[][],
  groups: GroupCell[][],
  typeMap: number
) => {
  const factors = getFactors(size);
  
  for (const [height, width] of factors) {
    // Try normal rectangular groups
    for (let r = 0; r <= rows - height; r++) {
      for (let c = 0; c <= cols - width; c++) {
        const group = tryRectangularGroup(r, c, height, width, squares, rows, cols, targetValue, covered);
        if (group.length === size) {
          groups.push(group);
          markGroupAsCovered(group, covered);
        }
      }
    }
    
    // Try wraparound groups for 3+ variable maps
    if (typeMap >= 3 && cols === 4) {
      // Horizontal wraparound (columns 0 and 3 are adjacent in Gray code)
      if (width === 2) {
        for (let r = 0; r <= rows - height; r++) {
          const wrapGroup = tryHorizontalWrapGroup(r, height, squares, rows, targetValue, covered);
          if (wrapGroup.length === size) {
            groups.push(wrapGroup);
            markGroupAsCovered(wrapGroup, covered);
          }
        }
      }
    }
    
    // Try vertical wraparound for 4-variable maps
    if (typeMap === 4 && rows === 4 && height === 2) {
      for (let c = 0; c <= cols - width; c++) {
        const wrapGroup = tryVerticalWrapGroup(c, width, squares, cols, targetValue, covered);
        if (wrapGroup.length === size) {
          groups.push(wrapGroup);
          markGroupAsCovered(wrapGroup, covered);
        }
      }
    }
  }
};

const tryHorizontalWrapGroup = (
  startRow: number,
  height: number,
  squares: KMapMatrix,
  rows: number,
  targetValue: CellValue,
  covered: boolean[][]
): GroupCell[] => {
  const group: GroupCell[] = [];
  
  // Check if cells at column 0 and column 3 form a valid wrap group
  for (let r = startRow; r < startRow + height && r < rows; r++) {
    if (covered[r][0] || covered[r][3] ||
        squares[r][0][0] !== targetValue || squares[r][3][0] !== targetValue) {
      return [];
    }
    group.push({ riga: r, col: 0 });
    group.push({ riga: r, col: 3 });
  }
  
  return group;
};

const tryVerticalWrapGroup = (
  startCol: number,
  width: number,
  squares: KMapMatrix,
  cols: number,
  targetValue: CellValue,
  covered: boolean[][]
): GroupCell[] => {
  const group: GroupCell[] = [];
  
  // Check if cells at row 0 and row 3 form a valid wrap group
  for (let c = startCol; c < startCol + width && c < cols; c++) {
    if (covered[0][c] || covered[3][c] ||
        squares[0][c][0] !== targetValue || squares[3][c][0] !== targetValue) {
      return [];
    }
    group.push({ riga: 0, col: c });
    group.push({ riga: 3, col: c });
  }
  
  return group;
};

const tryRectangularGroup = (
  startR: number,
  startC: number,
  height: number,
  width: number,
  squares: KMapMatrix,
  rows: number,
  cols: number,
  targetValue: CellValue,
  covered: boolean[][]
): GroupCell[] => {
  const group: GroupCell[] = [];
  
  for (let r = startR; r < startR + height && r < rows; r++) {
    for (let c = startC; c < startC + width && c < cols; c++) {
      const cellValue = squares[r][c][0];
      
      // Standard K-Map logic: accept target value OR don't care ('X') values
      // Don't care values can be included in groups when beneficial for optimization
      if (covered[r][c] || (cellValue !== targetValue && cellValue !== 'X')) {
        return [];
      }
      group.push({ riga: r, col: c });
    }
  }
  
  return group;
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

const markGroupAsCovered = (group: GroupCell[], covered: boolean[][]) => {
  for (const cell of group) {
    covered[cell.riga][cell.col] = true;
  }
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

  const variables = ["A", "B", "C", "D"];
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
    } else {
      // 4-variable K-Map: AB\CD
      // Get all coordinates for this group
      const groupCoords = group.map(cell => ({
        colCoord: squares[cell.riga][cell.col][1] as string, // CD coordinates
        rowCoord: squares[cell.riga][cell.col][2] as string  // AB coordinates
      }));

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
      
      // Analyze row coordinates (AB variables - variables A,B)
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
