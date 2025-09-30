import type { Component, Connection, Position } from '../types';
import { ComponentFactory } from './componentFactory';

export interface CircuitTemplate {
  id: string;
  name: string;
  description: string;
  inputLabels: string[];
  outputLabels: string[];
  generateComponents: (basePosition: Position, baseId: string) => {
    components: Component[];
    connections: Connection[];
    inputMappings: { label: string; componentId: string; connectionPointId: string }[];
    outputMappings: { label: string; componentId: string; connectionPointId: string }[];
  };
}

export const CIRCUIT_TEMPLATES: Record<string, CircuitTemplate> = {
  HALF_ADDER: {
    id: 'HALF_ADDER',
    name: 'Half Adder',
    description: 'Adds two 1-bit numbers using XOR (sum) and AND (carry) gates',
    inputLabels: ['A', 'B'],
    outputLabels: ['Sum', 'Carry'],
    generateComponents: (basePosition: Position, baseId: string) => {
      const components: Component[] = [];
      const connections: Connection[] = [];
      
      // Create XOR gate for sum
      const xorGate = ComponentFactory.createComponent('XOR', {
        x: basePosition.x + 100,
        y: basePosition.y + 20
      }, `${baseId}_xor`);
      
      // Create AND gate for carry
      const andGate = ComponentFactory.createComponent('AND', {
        x: basePosition.x + 100,
        y: basePosition.y + 80
      }, `${baseId}_and`);
      
      // Create input switches
      const inputA = ComponentFactory.createComponent('SWITCH', {
        x: basePosition.x,
        y: basePosition.y + 10
      }, `${baseId}_inputA`);
      inputA.label = 'A';
      
      const inputB = ComponentFactory.createComponent('SWITCH', {
        x: basePosition.x,
        y: basePosition.y + 70
      }, `${baseId}_inputB`);
      inputB.label = 'B';
      
      // Create output LEDs
      const sumLed = ComponentFactory.createComponent('LED', {
        x: basePosition.x + 200,
        y: basePosition.y + 30
      }, `${baseId}_sum`);
      sumLed.label = 'Sum';
      
      const carryLed = ComponentFactory.createComponent('LED', {
        x: basePosition.x + 200,
        y: basePosition.y + 90
      }, `${baseId}_carry`);
      carryLed.label = 'Carry';
      
      components.push(xorGate, andGate, inputA, inputB, sumLed, carryLed);
      
      // Create connections
      const connectionsData = [
        // Input A to both gates
        {
          id: `${baseId}_conn1`,
          from: { componentId: inputA.id, connectionPointId: inputA.outputs[0].id },
          to: { componentId: xorGate.id, connectionPointId: xorGate.inputs[0].id },
          path: [],
          value: false
        },
        {
          id: `${baseId}_conn2`,
          from: { componentId: inputA.id, connectionPointId: inputA.outputs[0].id },
          to: { componentId: andGate.id, connectionPointId: andGate.inputs[0].id },
          path: [],
          value: false
        },
        // Input B to both gates
        {
          id: `${baseId}_conn3`,
          from: { componentId: inputB.id, connectionPointId: inputB.outputs[0].id },
          to: { componentId: xorGate.id, connectionPointId: xorGate.inputs[1].id },
          path: [],
          value: false
        },
        {
          id: `${baseId}_conn4`,
          from: { componentId: inputB.id, connectionPointId: inputB.outputs[0].id },
          to: { componentId: andGate.id, connectionPointId: andGate.inputs[1].id },
          path: [],
          value: false
        },
        // Outputs to LEDs
        {
          id: `${baseId}_conn5`,
          from: { componentId: xorGate.id, connectionPointId: xorGate.outputs[0].id },
          to: { componentId: sumLed.id, connectionPointId: sumLed.inputs[0].id },
          path: [],
          value: false
        },
        {
          id: `${baseId}_conn6`,
          from: { componentId: andGate.id, connectionPointId: andGate.outputs[0].id },
          to: { componentId: carryLed.id, connectionPointId: carryLed.inputs[0].id },
          path: [],
          value: false
        }
      ];
      
      connections.push(...connectionsData);
      
      return {
        components,
        connections,
        inputMappings: [
          { label: 'A', componentId: inputA.id, connectionPointId: inputA.outputs[0].id },
          { label: 'B', componentId: inputB.id, connectionPointId: inputB.outputs[0].id }
        ],
        outputMappings: [
          { label: 'Sum', componentId: sumLed.id, connectionPointId: sumLed.inputs[0].id },
          { label: 'Carry', componentId: carryLed.id, connectionPointId: carryLed.inputs[0].id }
        ]
      };
    }
  }
};

export class CircuitTemplateFactory {
  static generateCircuitFromTemplate(templateId: string, basePosition: Position, baseId?: string): {
    components: Component[];
    connections: Connection[];
    inputMappings: { label: string; componentId: string; connectionPointId: string }[];
    outputMappings: { label: string; componentId: string; connectionPointId: string }[];
  } | null {
    const template = CIRCUIT_TEMPLATES[templateId];
    if (!template) return null;
    
    const id = baseId || `${templateId}_${Date.now()}`;
    return template.generateComponents(basePosition, id);
  }
  
  static getTemplateInfo(templateId: string): CircuitTemplate | null {
    return CIRCUIT_TEMPLATES[templateId] || null;
  }
  
  static getAllTemplates(): CircuitTemplate[] {
    return Object.values(CIRCUIT_TEMPLATES);
  }
}