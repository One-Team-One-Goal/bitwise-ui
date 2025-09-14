import { 
    type KMapMatrix, 
    type KMapSolution, 
    type InitializeResponse, 
    type UpdateCellResponse,
    type TruthTableResponse,
    type ParseExpressionResponse,
} from '../types/karnaugh';

    

class KarnaughMapService {
  private baseUrl = '/api/kmap';

  /**
   * Initialize K-Map with given variable count
   */
  async initialize(variableCount: number): Promise<InitializeResponse> {
    const response = await fetch(`${this.baseUrl}/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variableCount })
    });

    if (!response.ok) {
      throw new Error(`Failed to initialize K-Map: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update a single cell value (toggles if newValue not provided)
   */
  async updateCell(
    squares: KMapMatrix,
    row: number,
    col: number,
    newValue?: number | 'X'
  ): Promise<UpdateCellResponse> {
    const response = await fetch(`${this.baseUrl}/cell`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ squares, row, col, newValue })
    });

    if (!response.ok) {
      throw new Error(`Failed to update cell: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Set all cells to a specific value
   */
  async setAllCells(
    squares: KMapMatrix,
    value: number | 'X'
  ): Promise<UpdateCellResponse> {
    const response = await fetch(`${this.baseUrl}/set-all`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ squares, value })
    });

    if (!response.ok) {
      throw new Error(`Failed to set all cells: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Solve the K-Map and get optimized solution
   */
  async solve(
    squares: KMapMatrix,
    typeMap: number,
    formType: 'SOP' | 'POS',
    showSteps?: boolean
  ): Promise<KMapSolution> {
    const response = await fetch(`${this.baseUrl}/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ squares, typeMap, formType, showSteps })
    });

    if (!response.ok) {
      throw new Error(`Failed to solve K-Map: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate truth table from current K-Map state
   */
  async getTruthTable(
    squares: KMapMatrix,
    permutations: string[][],
    typeMap: number
  ): Promise<TruthTableResponse> {
    const response = await fetch(`${this.baseUrl}/truth-table`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ squares, permutations, typeMap })
    });

    if (!response.ok) {
      throw new Error(`Failed to get truth table: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Parse boolean expression and convert to K-Map
   */
  async parseExpression(
    expression: string,
    variables?: string[]
  ): Promise<ParseExpressionResponse> {
    const response = await fetch(`${this.baseUrl}/parse-expression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression, variables })
    });

    if (!response.ok) {
      throw new Error(`Failed to parse expression: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Validate boolean expression syntax
   */
  async validateExpression(expression: string): Promise<{ isValid: boolean; error?: string }> {
    const response = await fetch(`${this.baseUrl}/validate-expression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression })
    });

    if (!response.ok) {
      throw new Error(`Failed to validate expression: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const karnaughMapService = new KarnaughMapService();
