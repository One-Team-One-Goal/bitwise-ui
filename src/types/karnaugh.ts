export interface KMapCell {
  0: number | 'X';
  1: string; 
  2: string;
}

export type KMapMatrix = KMapCell[][];

export interface KMapSolution {
  groups: Array<{
    coordinates: Array<{ riga: number; col: number }>;
    color: string;
    index: number;
  }>;
  expression: string;
  literalCost: number;
  terms: string[];
}

export interface TruthTableRow {
  inputs: string[];
  output: number | 'X';
}

export interface InitializeResponse {
  squares: KMapMatrix;
  permutations: string[][];
  dimensions: { rows: number; cols: number };
}

export interface UpdateCellResponse {
  squares: KMapMatrix;
  affectedTruthTableRows?: number[];
}

export interface TruthTableResponse {
  truthTable: TruthTableRow[];
}

export interface ParseExpressionResponse {
  squares: KMapMatrix;
  permutations: string[][];
  truthTable: TruthTableRow[];
}
