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
    description: 'Outputs HIGH (1) only when all inputs are HIGH. Used for logical conjunction.'
  },
  OR: {
    type: 'OR',
    name: 'OR Gate',
    category: 'gates',
    icon: '≥1',
    inputs: 2,
    outputs: 1,
    defaultSize: { width: 80, height: 50 },
    description: 'Outputs HIGH (1) when at least one input is HIGH. Used for logical disjunction.'
  },
  NOT: {
    type: 'NOT',
    name: 'NOT Gate',
    category: 'gates',
    icon: '¬',
    inputs: 1,
    outputs: 1,
    defaultSize: { width: 60, height: 40 },
    description: 'Inverts the input signal: HIGH becomes LOW, LOW becomes HIGH. Also called an inverter.'
  },
  NAND: {
    type: 'NAND',
    name: 'NAND Gate',
    category: 'gates',
    icon: '⊼',
    inputs: 2,
    outputs: 1,
    defaultSize: { width: 80, height: 50 },
    description: 'NOT-AND gate. Outputs LOW only when all inputs are HIGH. Universal gate - can create any logic circuit.'
  },
  NOR: {
    type: 'NOR',
    name: 'NOR Gate',
    category: 'gates',
    icon: '⊽',
    inputs: 2,
    outputs: 1,
    defaultSize: { width: 80, height: 50 },
    description: 'NOT-OR gate. Outputs HIGH only when all inputs are LOW. Universal gate - can create any logic circuit.'
  },
  XOR: {
    type: 'XOR',
    name: 'XOR Gate',
    category: 'gates',
    icon: '⊕',
    inputs: 2,
    outputs: 1,
    defaultSize: { width: 80, height: 50 },
    description: 'Exclusive OR. Outputs HIGH when inputs are different. Used in adders, comparators, and parity checkers.'
  },
  XNOR: {
    type: 'XNOR',
    name: 'XNOR Gate',
    category: 'gates',
    icon: '⊙',
    inputs: 2,
    outputs: 1,
    defaultSize: { width: 80, height: 50 },
    description: 'Exclusive NOR. Outputs HIGH when inputs are the same. Used for equality comparison.'
  },
  BUFFER: {
    type: 'BUFFER',
    name: 'Buffer',
    category: 'gates',
    icon: '▷',
    inputs: 1,
    outputs: 1,
    defaultSize: { width: 60, height: 40 },
    description: 'Passes the input signal unchanged. Used for signal amplification and timing control.'
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
    description: 'Set-Reset flip-flop. Set (S) makes Q=1, Reset (R) makes Q=0, Clock (CLK) synchronizes changes. Has Q and Q̄ outputs.'
  },
  D_FLIPFLOP: {
    type: 'D_FLIPFLOP',
    name: 'D Flip-Flop',
    category: 'flipflops',
    icon: 'D',
    inputs: 2,
    outputs: 2,
    defaultSize: { width: 80, height: 60 },
    description: 'Data flip-flop. Captures Data (D) input on clock edge. Most common flip-flop in digital systems, used for registers and memory.'
  },
  JK_FLIPFLOP: {
    type: 'JK_FLIPFLOP',
    name: 'JK Flip-Flop',
    category: 'flipflops',
    icon: 'JK',
    inputs: 3,
    outputs: 2,
    defaultSize: { width: 80, height: 60 },
    description: 'Universal flip-flop. J sets, K resets, both HIGH toggles output. No invalid states, can implement SR, D, or T flip-flops.'
  },
  T_FLIPFLOP: {
    type: 'T_FLIPFLOP',
    name: 'T Flip-Flop',
    category: 'flipflops',
    icon: 'T',
    inputs: 2,
    outputs: 2,
    defaultSize: { width: 80, height: 60 },
    description: 'Toggle flip-flop. When T=1, output toggles on clock edge. When T=0, output holds. Used in counters and frequency dividers.'
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
    description: 'Toggle switch. Click to switch between HIGH and LOW states. Maintains state until clicked again.'
  },
  PUSH_BUTTON: {
    type: 'PUSH_BUTTON',
    name: 'Push Button',
    category: 'inputs',
    icon: '🔲',
    inputs: 0,
    outputs: 1,
    defaultSize: { width: 40, height: 40 },
    description: 'Momentary push button. Outputs HIGH while pressed, returns to LOW when released.'
  },
  CLOCK: {
    type: 'CLOCK',
    name: 'Clock',
    category: 'inputs',
    icon: '⏰',
    inputs: 0,
    outputs: 1,
    defaultSize: { width: 50, height: 40 },
    description: 'Clock signal generator. Automatically produces alternating HIGH/LOW pulses for synchronizing sequential circuits.'
  },
  HIGH_CONSTANT: {
    type: 'HIGH_CONSTANT',
    name: 'HIGH (1)',
    category: 'inputs',
    icon: '1',
    inputs: 0,
    outputs: 1,
    defaultSize: { width: 30, height: 30 },
    description: 'Constant HIGH (1) signal source. Always outputs logical 1, commonly used for pull-up or enable signals.'
  },
  LOW_CONSTANT: {
    type: 'LOW_CONSTANT',
    name: 'LOW (0)',
    category: 'inputs',
    icon: '0',
    inputs: 0,
    outputs: 1,
    defaultSize: { width: 30, height: 30 },
    description: 'Constant LOW (0) signal source. Always outputs logical 0, commonly used for pull-down or disable signals.'
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
    description: 'Light Emitting Diode indicator. Lights up when input is HIGH, useful for visualizing circuit output states.'
  },
  SEVEN_SEGMENT: {
    type: 'SEVEN_SEGMENT',
    name: '7-Segment Display',
    category: 'outputs',
    icon: '🔸',
    inputs: 7, // Can also work with 4 for BCD mode
    outputs: 0,
    defaultSize: { width: 60, height: 90 },
    description: '7-segment display for showing digits 0-9 and letters. Accepts 7 individual segment inputs (a-g) or 4-bit BCD input.'
  },
  DIGITAL_DISPLAY: {
    type: 'DIGITAL_DISPLAY',
    name: 'Digital Display',
    category: 'outputs',
    icon: '🔢',
    inputs: 4, // Can be 4, 8, or 16 bits
    outputs: 0,
    defaultSize: { width: 100, height: 50 },
    description: 'Binary-to-decimal display. Shows the decimal value of binary input (4-bit, 8-bit, or 16-bit).'
  },

  // Premade Circuits (rendered as single black-box components)
  HALF_ADDER: {
    type: 'HALF_ADDER',
    name: 'Half Adder',
    category: 'circuits',
    icon: '½+',
    inputs: 2,
    outputs: 2,
    defaultSize: { width: 100, height: 70 },
    description: 'Adds two 1-bit binary numbers (A + B = Sum, Carry). Building block for larger arithmetic circuits.'
  },
  FULL_ADDER: {
    type: 'FULL_ADDER',
    name: 'Full Adder',
    category: 'circuits',
    icon: '1+',
    inputs: 3,
    outputs: 2,
    defaultSize: { width: 100, height: 80 },
    description: 'Adds two 1-bit numbers plus carry-in (A + B + Cin = Sum, Cout). Used for multi-bit addition in cascaded configurations.'
  },
  FOUR_BIT_ADDER: {
    type: 'FOUR_BIT_ADDER',
    name: '4-Bit Adder',
    category: 'circuits',
    icon: '4+',
    inputs: 9, // 4 + 4 + carry in
    outputs: 5, // 4 + carry out
    defaultSize: { width: 120, height: 140 },
    description: 'Adds two 4-bit binary numbers with carry-in (A[3:0] + B[3:0] + Cin). Produces 4-bit sum and carry-out.'
  },
  MULTIPLEXER_2TO1: {
    type: 'MULTIPLEXER_2TO1',
    name: '2:1 Multiplexer',
    category: 'circuits',
    icon: 'MUX',
    inputs: 3, // 2 data + 1 select
    outputs: 1,
    defaultSize: { width: 80, height: 70 },
    description: 'Data selector. Routes one of two inputs (I0 or I1) to output based on select signal. Used for data routing and signal selection.'
  },
  DECODER_2TO4: {
    type: 'DECODER_2TO4',
    name: '2:4 Decoder',
    category: 'circuits',
    icon: 'DEC',
    inputs: 2,
    outputs: 4,
    defaultSize: { width: 80, height: 100 },
    description: 'Binary decoder. Converts 2-bit input to one-hot 4-bit output (00→Y0, 01→Y1, 10→Y2, 11→Y3). Used for address decoding.'
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