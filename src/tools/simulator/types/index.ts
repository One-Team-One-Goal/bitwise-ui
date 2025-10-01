export interface Position {
  x: number;
  y: number;
}

export interface ConnectionPoint {
  id: string;
  position: Position;
  type: 'input' | 'output';
  value: boolean;
  connected: boolean;
}

export interface Component {
  id: string;
  type: ComponentType;
  position: Position;
  size: { width: number; height: number };
  rotation: number;
  inputs: ConnectionPoint[];
  outputs: ConnectionPoint[];
  properties: Record<string, any>;
  label?: string;
}

export interface Connection {
  id: string;
  from: {
    componentId: string;
    connectionPointId: string;
  };
  to: {
    componentId: string;
    connectionPointId: string;
  };
  path: Position[];
  value: boolean;
}

export type ComponentType =
  // Logic Gates
  | 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR' | 'BUFFER'
  // Flip-Flops
  | 'SR_FLIPFLOP' | 'D_FLIPFLOP' | 'JK_FLIPFLOP' | 'T_FLIPFLOP'
  // Input Controls
  | 'SWITCH' | 'PUSH_BUTTON' | 'CLOCK' | 'HIGH_CONSTANT' | 'LOW_CONSTANT'
  // Output Controls
  | 'LED' | 'SEVEN_SEGMENT' | 'DIGITAL_DISPLAY'
  // Premade Circuits
  | 'HALF_ADDER' | 'FULL_ADDER' | 'FOUR_BIT_ADDER' | 'MULTIPLEXER_2TO1' | 'DECODER_2TO4'
  // Other
  | 'LABEL' | 'BUS' | 'PULL_UP' | 'PULL_DOWN';

export interface CircuitState {
  components: Component[];
  connections: Connection[];
  selectedComponent: string | null;
  selectedConnection: string | null;
  isSimulating: boolean;
  simulationSpeed: number;
  gridSize: number;
  snapToGrid: boolean;
}

export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  category: 'gates' | 'flipflops' | 'inputs' | 'outputs' | 'circuits' | 'other';
  icon: string;
  inputs: number;
  outputs: number;
  defaultSize: { width: number; height: number };
  description: string;
  isTemplate?: boolean; // For premade circuits
}

export interface CircuitTemplate {
  id: string;
  name: string;
  description: string;
  explanation: string; // For educational explanations
  components: Omit<Component, 'id'>[];
  connections: Omit<Connection, 'id' | 'from' | 'to'>[];
  inputMapping: { name: string; position: Position }[];
  outputMapping: { name: string; position: Position }[];
  truthTable?: TruthTableEntry[];
}

export interface TruthTableEntry {
  inputs: Record<string, boolean>;
  outputs: Record<string, boolean>;
}

export interface SimulationEvent {
  timestamp: number;
  componentId: string;
  connectionPointId: string;
  oldValue: boolean;
  newValue: boolean;
}

export interface ToolbarState {
  selectedTool: 'select' | 'pan' | 'wire' | 'component';
  selectedComponentType: ComponentType | null;
}

export interface CanvasState {
  zoom: number;
  pan: Position;
  canvasSize: { width: number; height: number };
}