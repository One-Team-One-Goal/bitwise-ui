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
    description: 'AND logic gate - outputs true only when all inputs are true'
  },
  OR: {
    type: 'OR',
    name: 'OR Gate',
    category: 'gates',
    icon: '≥1',
    inputs: 2,
    outputs: 1,
    defaultSize: { width: 80, height: 50 },
    description: 'OR logic gate - outputs true when any input is true'
  },
  NOT: {
    type: 'NOT',
    name: 'NOT Gate',
    category: 'gates',
    icon: '¬',
    inputs: 1,
    outputs: 1,
    defaultSize: { width: 60, height: 40 },
    description: 'NOT gate (inverter) - outputs the opposite of input'
  },
  NAND: {
    type: 'NAND',
    name: 'NAND Gate',
    category: 'gates',
    icon: '⊼',
    inputs: 2,
    outputs: 1,
    defaultSize: { width: 80, height: 50 },
    description: 'NAND gate - outputs false only when all inputs are true'
  },
  NOR: {
    type: 'NOR',
    name: 'NOR Gate',
    category: 'gates',
    icon: '⊽',
    inputs: 2,
    outputs: 1,
    defaultSize: { width: 80, height: 50 },
    description: 'NOR gate - outputs true only when all inputs are false'
  },
  XOR: {
    type: 'XOR',
    name: 'XOR Gate',
    category: 'gates',
    icon: '⊕',
    inputs: 2,
    outputs: 1,
    defaultSize: { width: 80, height: 50 },
    description: 'XOR gate - outputs true when inputs are different'
  },
  XNOR: {
    type: 'XNOR',
    name: 'XNOR Gate',
    category: 'gates',
    icon: '⊙',
    inputs: 2,
    outputs: 1,
    defaultSize: { width: 80, height: 50 },
    description: 'XNOR gate - outputs true when inputs are the same'
  },
  BUFFER: {
    type: 'BUFFER',
    name: 'Buffer',
    category: 'gates',
    icon: '→',
    inputs: 1,
    outputs: 1,
    defaultSize: { width: 60, height: 40 },
    description: 'Buffer gate - outputs the same as input'
  },

  // Flip-Flops
  SR_FLIPFLOP: {
    type: 'SR_FLIPFLOP',
    name: 'SR Flip-Flop',
    category: 'flipflops',
    icon: 'SR',
    inputs: 2,
    outputs: 2,
    defaultSize: { width: 80, height: 80 },
    description: 'Set-Reset flip-flop'
  },
  D_FLIPFLOP: {
    type: 'D_FLIPFLOP',
    name: 'D Flip-Flop',
    category: 'flipflops',
    icon: 'D',
    inputs: 2,
    outputs: 2,
    defaultSize: { width: 80, height: 80 },
    description: 'Data flip-flop'
  },
  JK_FLIPFLOP: {
    type: 'JK_FLIPFLOP',
    name: 'JK Flip-Flop',
    category: 'flipflops',
    icon: 'JK',
    inputs: 3,
    outputs: 2,
    defaultSize: { width: 80, height: 80 },
    description: 'JK flip-flop'
  },
  T_FLIPFLOP: {
    type: 'T_FLIPFLOP',
    name: 'T Flip-Flop',
    category: 'flipflops',
    icon: 'T',
    inputs: 2,
    outputs: 2,
    defaultSize: { width: 80, height: 80 },
    description: 'Toggle flip-flop'
  },

  // Input Controls
  SWITCH: {
    type: 'SWITCH',
    name: 'Switch',
    category: 'inputs',
    icon: '⎘',
    inputs: 0,
    outputs: 1,
    defaultSize: { width: 60, height: 40 },
    description: 'Toggle switch input'
  },
  PUSH_BUTTON: {
    type: 'PUSH_BUTTON',
    name: 'Push Button',
    category: 'inputs',
    icon: '●',
    inputs: 0,
    outputs: 1,
    defaultSize: { width: 50, height: 50 },
    description: 'Push button input'
  },
  CLOCK: {
    type: 'CLOCK',
    name: 'Clock',
    category: 'inputs',
    icon: '⏱',
    inputs: 0,
    outputs: 1,
    defaultSize: { width: 60, height: 40 },
    description: 'Clock signal generator'
  },
  HIGH_CONSTANT: {
    type: 'HIGH_CONSTANT',
    name: 'High (1)',
    category: 'inputs',
    icon: '1',
    inputs: 0,
    outputs: 1,
    defaultSize: { width: 40, height: 40 },
    description: 'Constant high signal'
  },
  LOW_CONSTANT: {
    type: 'LOW_CONSTANT',
    name: 'Low (0)',
    category: 'inputs',
    icon: '0',
    inputs: 0,
    outputs: 1,
    defaultSize: { width: 40, height: 40 },
    description: 'Constant low signal'
  },

  // Output Controls
  LED: {
    type: 'LED',
    name: 'Light Bulb',
    category: 'outputs',
    icon: '💡',
    inputs: 1,
    outputs: 0,
    defaultSize: { width: 40, height: 40 },
    description: 'Light bulb that glows when input is HIGH'
  },
  SEVEN_SEGMENT: {
    type: 'SEVEN_SEGMENT',
    name: '7-Segment Display',
    category: 'outputs',
    icon: '8',
    inputs: 7,
    outputs: 0,
    defaultSize: { width: 60, height: 80 },
    description: '7-segment display'
  },
  DIGITAL_DISPLAY: {
    type: 'DIGITAL_DISPLAY',
    name: 'Digital Display',
    category: 'outputs',
    icon: '🔢',
    inputs: 4,
    outputs: 0,
    defaultSize: { width: 80, height: 40 },
    description: '4-bit digital display'
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
    inputs: 1,
    outputs: 1,
    defaultSize: { width: 80, height: 20 },
    description: 'Bus connector'
  },
  PULL_UP: {
    type: 'PULL_UP',
    name: 'Pull Up',
    category: 'other',
    icon: '↑',
    inputs: 1,
    outputs: 1,
    defaultSize: { width: 40, height: 60 },
    description: 'Pull-up resistor'
  },
  PULL_DOWN: {
    type: 'PULL_DOWN',
    name: 'Pull Down',
    category: 'other',
    icon: '↓',
    inputs: 1,
    outputs: 1,
    defaultSize: { width: 40, height: 60 },
    description: 'Pull-down resistor'
  }
};

export class ComponentFactory {
  private static idCounter = 0;

  static createComponent(type: ComponentType, position: Position): Component {
    const definition = COMPONENT_DEFINITIONS[type];
    const id = `${type}_${++ComponentFactory.idCounter}`;

    // Create input connection points
    const inputs = Array.from({ length: definition.inputs }, (_, index) => ({
      id: `${id}_input_${index}`,
      position: { x: 0, y: (index + 1) * (definition.defaultSize.height / (definition.inputs + 1)) },
      type: 'input' as const,
      value: false,
      connected: false
    }));

    // Create output connection points
    const outputs = Array.from({ length: definition.outputs }, (_, index) => ({
      id: `${id}_output_${index}`,
      position: { 
        x: definition.defaultSize.width, 
        y: (index + 1) * (definition.defaultSize.height / (definition.outputs + 1)) 
      },
      type: 'output' as const,
      value: false,
      connected: false
    }));

    return {
      id,
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