import type { Component, ComponentType, Position, ComponentDefinition } from '../types';

export const COMPONENT_DEFINITIONS: Record<ComponentType, ComponentDefinition> = {
  // Logic Gates
  AND: {
    type: 'AND',
    name: 'AND Gate',
    category: 'gates',
    icon: '&',
    inputs: 2,
    outputs: 1,
    defaultSize: { width: 80, height: 50 },
    description: 'AND logic gate'
  },
  OR: {
    type: 'OR',
    name: 'OR Gate',
    category: 'gates',
    icon: '≥1',
    inputs: 2,
    outputs: 1,
    defaultSize: { width: 80, height: 50 },
    description: 'OR logic gate'
  },
  NOT: {
    type: 'NOT',
    name: 'NOT Gate',
    category: 'gates',
    icon: '¬',
    inputs: 1,
    outputs: 1,
    defaultSize: { width: 60, height: 40 },
    description: 'NOT gate'
  },
  NAND: {
    type: 'NAND',
    name: 'NAND Gate',
    category: 'gates',
    icon: '⊼',
    inputs: 2,
    outputs: 1,
    defaultSize: { width: 80, height: 50 },
    description: 'NAND gate'
  },
  NOR: {
    type: 'NOR',
    name: 'NOR Gate',
    category: 'gates',
    icon: '⊽',
    inputs: 2,
    outputs: 1,
    defaultSize: { width: 80, height: 50 },
    description: 'NOR gate'
  },
  XOR: {
    type: 'XOR',
    name: 'XOR Gate',
    category: 'gates',
    icon: '⊕',
    inputs: 2,
    outputs: 1,
    defaultSize: { width: 80, height: 50 },
    description: 'XOR gate'
  },
  XNOR: {
    type: 'XNOR',
    name: 'XNOR Gate',
    category: 'gates',
    icon: '⊙',
    inputs: 2,
    outputs: 1,
    defaultSize: { width: 80, height: 50 },
    description: 'XNOR gate'
  },
  BUFFER: {
    type: 'BUFFER',
    name: 'Buffer',
    category: 'gates',
    icon: '▷',
    inputs: 1,
    outputs: 1,
    defaultSize: { width: 60, height: 40 },
    description: 'Buffer gate'
  },

  // Flip-Flops
  SR_FLIPFLOP: {
    type: 'SR_FLIPFLOP',
    name: 'SR Flip-Flop',
    category: 'flipflops',
    icon: 'SR',
    inputs: 3, // S, R, CLK
    outputs: 2, // Q, Q'
    defaultSize: { width: 80, height: 60 },
    description: 'SR flip-flop - Set (S), Reset (R), Clock (CLK) inputs; Q and Q\' outputs'
  },
  D_FLIPFLOP: {
    type: 'D_FLIPFLOP',
    name: 'D Flip-Flop',
    category: 'flipflops',
    icon: 'D',
    inputs: 2,
    outputs: 2,
    defaultSize: { width: 80, height: 60 },
    description: 'D flip-flop with clock'
  },
  JK_FLIPFLOP: {
    type: 'JK_FLIPFLOP',
    name: 'JK Flip-Flop',
    category: 'flipflops',
    icon: 'JK',
    inputs: 3,
    outputs: 2,
    defaultSize: { width: 80, height: 60 },
    description: 'JK flip-flop with clock'
  },
  T_FLIPFLOP: {
    type: 'T_FLIPFLOP',
    name: 'T Flip-Flop',
    category: 'flipflops',
    icon: 'T',
    inputs: 2,
    outputs: 2,
    defaultSize: { width: 80, height: 60 },
    description: 'T flip-flop with clock'
  },

  // Input Controls
  SWITCH: {
    type: 'SWITCH',
    name: 'Switch',
    category: 'inputs',
    icon: '🔘',
    inputs: 0,
    outputs: 1,
    defaultSize: { width: 40, height: 40 },
    description: 'Toggle switch'
  },
  PUSH_BUTTON: {
    type: 'PUSH_BUTTON',
    name: 'Push Button',
    category: 'inputs',
    icon: '🔲',
    inputs: 0,
    outputs: 1,
    defaultSize: { width: 40, height: 40 },
    description: 'Momentary push button'
  },
  CLOCK: {
    type: 'CLOCK',
    name: 'Clock',
    category: 'inputs',
    icon: '⏰',
    inputs: 0,
    outputs: 1,
    defaultSize: { width: 50, height: 40 },
    description: 'Clock signal generator'
  },
  HIGH_CONSTANT: {
    type: 'HIGH_CONSTANT',
    name: 'HIGH (1)',
    category: 'inputs',
    icon: '1',
    inputs: 0,
    outputs: 1,
    defaultSize: { width: 30, height: 30 },
    description: 'Constant HIGH signal'
  },
  LOW_CONSTANT: {
    type: 'LOW_CONSTANT',
    name: 'LOW (0)',
    category: 'inputs',
    icon: '0',
    inputs: 0,
    outputs: 1,
    defaultSize: { width: 30, height: 30 },
    description: 'Constant LOW signal'
  },

  // Output Controls
  LED: {
    type: 'LED',
    name: 'LED',
    category: 'outputs',
    icon: '💡',
    inputs: 1,
    outputs: 0,
    defaultSize: { width: 40, height: 40 },
    description: 'Light emitting diode'
  },
  SEVEN_SEGMENT: {
    type: 'SEVEN_SEGMENT',
    name: '7-Segment Display',
    category: 'outputs',
    icon: '🔸',
    inputs: 7, // Can also work with 4 for BCD mode
    outputs: 0,
    defaultSize: { width: 60, height: 90 },
    description: '7-segment display - accepts 7 individual segment inputs or 4-bit BCD'
  },
  DIGITAL_DISPLAY: {
    type: 'DIGITAL_DISPLAY',
    name: 'Digital Display',
    category: 'outputs',
    icon: '🔢',
    inputs: 4, // Can be 4, 8, or 16 bits
    outputs: 0,
    defaultSize: { width: 100, height: 50 },
    description: 'Binary to decimal display - shows binary input as decimal number'
  },

  // Premade Circuits
  HALF_ADDER: {
    type: 'HALF_ADDER',
    name: 'Half Adder',
    category: 'circuits',
    icon: '½+',
    inputs: 2,
    outputs: 2,
    defaultSize: { width: 120, height: 80 },
    description: 'Adds two 1-bit numbers (A + B = Sum, Carry)',
    isTemplate: true
  },
  FULL_ADDER: {
    type: 'FULL_ADDER',
    name: 'Full Adder',
    category: 'circuits',
    icon: '1+',
    inputs: 3,
    outputs: 2,
    defaultSize: { width: 120, height: 80 },
    description: 'Adds two 1-bit numbers with carry input (A + B + Cin = Sum, Cout)',
    isTemplate: true
  },
  FOUR_BIT_ADDER: {
    type: 'FOUR_BIT_ADDER',
    name: '4-Bit Adder',
    category: 'circuits',
    icon: '4+',
    inputs: 9, // 4 + 4 + carry in
    outputs: 5, // 4 + carry out
    defaultSize: { width: 200, height: 120 },
    description: 'Adds two 4-bit numbers with carry',
    isTemplate: true
  },
  MULTIPLEXER_2TO1: {
    type: 'MULTIPLEXER_2TO1',
    name: '2:1 Multiplexer',
    category: 'circuits',
    icon: 'MUX',
    inputs: 3, // 2 data + 1 select
    outputs: 1,
    defaultSize: { width: 100, height: 80 },
    description: 'Selects one of two inputs based on select signal',
    isTemplate: true
  },
  DECODER_2TO4: {
    type: 'DECODER_2TO4',
    name: '2:4 Decoder',
    category: 'circuits',
    icon: 'DEC',
    inputs: 2,
    outputs: 4,
    defaultSize: { width: 100, height: 100 },
    description: 'Decodes 2-bit input to 4 output lines',
    isTemplate: true
  },

  // Other
  LABEL: {
    type: 'LABEL',
    name: 'Label',
    category: 'other',
    icon: 'T',
    inputs: 0,
    outputs: 0,
    defaultSize: { width: 60, height: 30 },
    description: 'Text label'
  },
  BUS: {
    type: 'BUS',
    name: 'Bus',
    category: 'other',
    icon: '═',
    inputs: 8,
    outputs: 8,
    defaultSize: { width: 100, height: 20 },
    description: 'Multi-bit bus'
  },
  PULL_UP: {
    type: 'PULL_UP',
    name: 'Pull Up',
    category: 'other',
    icon: '↑',
    inputs: 1,
    outputs: 1,
    defaultSize: { width: 40, height: 30 },
    description: 'Pull up resistor'
  },
  PULL_DOWN: {
    type: 'PULL_DOWN',
    name: 'Pull Down',
    category: 'other',
    icon: '↓',
    inputs: 1,
    outputs: 1,
    defaultSize: { width: 40, height: 30 },
    description: 'Pull down resistor'
  }
};

export class ComponentFactory {
  static createComponent(type: ComponentType, position: Position, id?: string): Component {
    const definition = COMPONENT_DEFINITIONS[type];
    const componentId = id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const inputs = Array.from({ length: definition.inputs }, (_, index) => ({
      id: `${componentId}_input_${index}`,
      position: { 
        x: 0,
        y: ((index + 1) * definition.defaultSize.height / (definition.inputs + 1))
      },
      type: 'input' as const,
      value: false,
      connected: false
    }));

    const outputs = Array.from({ length: definition.outputs }, (_, index) => ({
      id: `${componentId}_output_${index}`,
      position: { 
        x: definition.defaultSize.width,
        y: ((index + 1) * definition.defaultSize.height / (definition.outputs + 1))
      },
      type: 'output' as const,
      value: false,
      connected: false
    }));

    return {
      id: componentId,
      type,
      position,
      size: definition.defaultSize,
      rotation: 0,
      inputs,
      outputs,
      properties: {},
      label: definition.name
    };
  }

  static getComponentDefinition(type: ComponentType): ComponentDefinition {
    return COMPONENT_DEFINITIONS[type];
  }

  static getAllDefinitions(): ComponentDefinition[] {
    return Object.values(COMPONENT_DEFINITIONS);
  }

  static getDefinitionsByCategory(category: ComponentDefinition['category']): ComponentDefinition[] {
    return Object.values(COMPONENT_DEFINITIONS).filter(def => def.category === category);
  }
}