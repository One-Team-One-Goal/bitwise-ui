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
    description: 'Adds two 1-bit numbers. Sum output (A XOR B) shows the addition result, Carry output (A AND B) indicates overflow.',
    inputLabels: ['A', 'B'],
    outputLabels: ['Sum', 'Carry'],
    generateComponents: (basePosition: Position, baseId: string) => {
      const components: Component[] = [];
      const connections: Connection[] = [];
      
      // Input switches with better spacing
      const inputA = ComponentFactory.createComponent('SWITCH', {
        x: basePosition.x + 20,
        y: basePosition.y + 30
      }, `${baseId}_inputA`);
      inputA.label = 'A';
      
      const inputB = ComponentFactory.createComponent('SWITCH', {
        x: basePosition.x + 20,
        y: basePosition.y + 100
      }, `${baseId}_inputB`);
      inputB.label = 'B';
      
      // Logic gates with improved layout
      const xorGate = ComponentFactory.createComponent('XOR', {
        x: basePosition.x + 140,
        y: basePosition.y + 30
      }, `${baseId}_xor`);
      xorGate.label = 'SUM';
      
      const andGate = ComponentFactory.createComponent('AND', {
        x: basePosition.x + 140,
        y: basePosition.y + 100
      }, `${baseId}_and`);
      andGate.label = 'CARRY';
      
      // Output LEDs
      const sumLed = ComponentFactory.createComponent('LED', {
        x: basePosition.x + 280,
        y: basePosition.y + 40
      }, `${baseId}_sum`);
      sumLed.label = 'Sum';
      
      const carryLed = ComponentFactory.createComponent('LED', {
        x: basePosition.x + 280,
        y: basePosition.y + 110
      }, `${baseId}_carry`);
      carryLed.label = 'Carry';
      
      components.push(inputA, inputB, xorGate, andGate, sumLed, carryLed);
      
      // Create connections
      const connectionsData = [
        // A to both gates
        { id: `${baseId}_conn1`, from: { componentId: inputA.id, connectionPointId: inputA.outputs[0].id }, to: { componentId: xorGate.id, connectionPointId: xorGate.inputs[0].id }, path: [], value: false },
        { id: `${baseId}_conn2`, from: { componentId: inputA.id, connectionPointId: inputA.outputs[0].id }, to: { componentId: andGate.id, connectionPointId: andGate.inputs[0].id }, path: [], value: false },
        // B to both gates
        { id: `${baseId}_conn3`, from: { componentId: inputB.id, connectionPointId: inputB.outputs[0].id }, to: { componentId: xorGate.id, connectionPointId: xorGate.inputs[1].id }, path: [], value: false },
        { id: `${baseId}_conn4`, from: { componentId: inputB.id, connectionPointId: inputB.outputs[0].id }, to: { componentId: andGate.id, connectionPointId: andGate.inputs[1].id }, path: [], value: false },
        // Gates to LEDs
        { id: `${baseId}_conn5`, from: { componentId: xorGate.id, connectionPointId: xorGate.outputs[0].id }, to: { componentId: sumLed.id, connectionPointId: sumLed.inputs[0].id }, path: [], value: false },
        { id: `${baseId}_conn6`, from: { componentId: andGate.id, connectionPointId: andGate.outputs[0].id }, to: { componentId: carryLed.id, connectionPointId: carryLed.inputs[0].id }, path: [], value: false }
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
  },

  FULL_ADDER: {
    id: 'FULL_ADDER',
    name: 'Full Adder',
    description: 'Adds three 1-bit inputs (A, B, Carry In). Uses two XOR gates for sum and combination of AND/OR gates for carry out.',
    inputLabels: ['A', 'B', 'Cin'],
    outputLabels: ['Sum', 'Cout'],
    generateComponents: (basePosition: Position, baseId: string) => {
      const components: Component[] = [];
      const connections: Connection[] = [];
      
      // Input switches
      const inputA = ComponentFactory.createComponent('SWITCH', {
        x: basePosition.x + 20,
        y: basePosition.y + 30
      }, `${baseId}_inputA`);
      inputA.label = 'A';
      
      const inputB = ComponentFactory.createComponent('SWITCH', {
        x: basePosition.x + 20,
        y: basePosition.y + 90
      }, `${baseId}_inputB`);
      inputB.label = 'B';
      
      const inputCin = ComponentFactory.createComponent('SWITCH', {
        x: basePosition.x + 20,
        y: basePosition.y + 150
      }, `${baseId}_inputCin`);
      inputCin.label = 'Cin';
      
      // First stage: A XOR B
      const xor1 = ComponentFactory.createComponent('XOR', {
        x: basePosition.x + 140,
        y: basePosition.y + 50
      }, `${baseId}_xor1`);
      xor1.label = 'XOR1';
      
      // Second stage: (A XOR B) XOR Cin = Sum
      const xor2 = ComponentFactory.createComponent('XOR', {
        x: basePosition.x + 280,
        y: basePosition.y + 90
      }, `${baseId}_xor2`);
      xor2.label = 'SUM';
      
      // Carry logic: A AND B
      const and1 = ComponentFactory.createComponent('AND', {
        x: basePosition.x + 140,
        y: basePosition.y + 130
      }, `${baseId}_and1`);
      and1.label = 'AND1';
      
      // Carry logic: (A XOR B) AND Cin
      const and2 = ComponentFactory.createComponent('AND', {
        x: basePosition.x + 280,
        y: basePosition.y + 150
      }, `${baseId}_and2`);
      and2.label = 'AND2';
      
      // Final carry: OR of both AND gates
      const or1 = ComponentFactory.createComponent('OR', {
        x: basePosition.x + 420,
        y: basePosition.y + 140
      }, `${baseId}_or1`);
      or1.label = 'COUT';
      
      // Output LEDs
      const sumLed = ComponentFactory.createComponent('LED', {
        x: basePosition.x + 420,
        y: basePosition.y + 100
      }, `${baseId}_sum`);
      sumLed.label = 'Sum';
      
      const carryLed = ComponentFactory.createComponent('LED', {
        x: basePosition.x + 560,
        y: basePosition.y + 150
      }, `${baseId}_carry`);
      carryLed.label = 'Cout';
      
      components.push(inputA, inputB, inputCin, xor1, xor2, and1, and2, or1, sumLed, carryLed);
      
      // Create connections
      const connectionsData = [
        // A to XOR1 and AND1
        {
          id: `${baseId}_conn1`,
          from: { componentId: inputA.id, connectionPointId: inputA.outputs[0].id },
          to: { componentId: xor1.id, connectionPointId: xor1.inputs[0].id },
          path: [],
          value: false
        },
        {
          id: `${baseId}_conn2`,
          from: { componentId: inputA.id, connectionPointId: inputA.outputs[0].id },
          to: { componentId: and1.id, connectionPointId: and1.inputs[0].id },
          path: [],
          value: false
        },
        // B to XOR1 and AND1
        {
          id: `${baseId}_conn3`,
          from: { componentId: inputB.id, connectionPointId: inputB.outputs[0].id },
          to: { componentId: xor1.id, connectionPointId: xor1.inputs[1].id },
          path: [],
          value: false
        },
        {
          id: `${baseId}_conn4`,
          from: { componentId: inputB.id, connectionPointId: inputB.outputs[0].id },
          to: { componentId: and1.id, connectionPointId: and1.inputs[1].id },
          path: [],
          value: false
        },
        // XOR1 output to XOR2 and AND2
        {
          id: `${baseId}_conn5`,
          from: { componentId: xor1.id, connectionPointId: xor1.outputs[0].id },
          to: { componentId: xor2.id, connectionPointId: xor2.inputs[0].id },
          path: [],
          value: false
        },
        {
          id: `${baseId}_conn6`,
          from: { componentId: xor1.id, connectionPointId: xor1.outputs[0].id },
          to: { componentId: and2.id, connectionPointId: and2.inputs[0].id },
          path: [],
          value: false
        },
        // Cin to XOR2 and AND2
        {
          id: `${baseId}_conn7`,
          from: { componentId: inputCin.id, connectionPointId: inputCin.outputs[0].id },
          to: { componentId: xor2.id, connectionPointId: xor2.inputs[1].id },
          path: [],
          value: false
        },
        {
          id: `${baseId}_conn8`,
          from: { componentId: inputCin.id, connectionPointId: inputCin.outputs[0].id },
          to: { componentId: and2.id, connectionPointId: and2.inputs[1].id },
          path: [],
          value: false
        },
        // AND gates to OR gate
        {
          id: `${baseId}_conn9`,
          from: { componentId: and1.id, connectionPointId: and1.outputs[0].id },
          to: { componentId: or1.id, connectionPointId: or1.inputs[0].id },
          path: [],
          value: false
        },
        {
          id: `${baseId}_conn10`,
          from: { componentId: and2.id, connectionPointId: and2.outputs[0].id },
          to: { componentId: or1.id, connectionPointId: or1.inputs[1].id },
          path: [],
          value: false
        },
        // Final outputs
        {
          id: `${baseId}_conn11`,
          from: { componentId: xor2.id, connectionPointId: xor2.outputs[0].id },
          to: { componentId: sumLed.id, connectionPointId: sumLed.inputs[0].id },
          path: [],
          value: false
        },
        {
          id: `${baseId}_conn12`,
          from: { componentId: or1.id, connectionPointId: or1.outputs[0].id },
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
          { label: 'B', componentId: inputB.id, connectionPointId: inputB.outputs[0].id },
          { label: 'Cin', componentId: inputCin.id, connectionPointId: inputCin.outputs[0].id }
        ],
        outputMappings: [
          { label: 'Sum', componentId: sumLed.id, connectionPointId: sumLed.inputs[0].id },
          { label: 'Cout', componentId: carryLed.id, connectionPointId: carryLed.inputs[0].id }
        ]
      };
    }
  },

  MULTIPLEXER_2TO1: {
    id: 'MULTIPLEXER_2TO1',
    name: '2-to-1 Multiplexer',
    description: 'Data selector that routes one of two inputs to output based on select signal. When S=0, output=A. When S=1, output=B.',
    inputLabels: ['A', 'B', 'S'],
    outputLabels: ['Y'],
    generateComponents: (basePosition: Position, baseId: string) => {
      const components: Component[] = [];
      const connections: Connection[] = [];
      
      // Input switches
      const inputA = ComponentFactory.createComponent('SWITCH', {
        x: basePosition.x + 20,
        y: basePosition.y + 30
      }, `${baseId}_inputA`);
      inputA.label = 'Data A';
      
      const inputB = ComponentFactory.createComponent('SWITCH', {
        x: basePosition.x + 20,
        y: basePosition.y + 130
      }, `${baseId}_inputB`);
      inputB.label = 'Data B';
      
      const inputS = ComponentFactory.createComponent('SWITCH', {
        x: basePosition.x + 20,
        y: basePosition.y + 230
      }, `${baseId}_inputS`);
      inputS.label = 'Select';
      
      // Logic gates
      const notGate = ComponentFactory.createComponent('NOT', {
        x: basePosition.x + 140,
        y: basePosition.y + 230
      }, `${baseId}_not`);
      notGate.label = 'NOT S';
      
      const and1 = ComponentFactory.createComponent('AND', {
        x: basePosition.x + 280,
        y: basePosition.y + 50
      }, `${baseId}_and1`);
      and1.label = 'A·S̄';
      
      const and2 = ComponentFactory.createComponent('AND', {
        x: basePosition.x + 280,
        y: basePosition.y + 150
      }, `${baseId}_and2`);
      and2.label = 'B·S';
      
      const orGate = ComponentFactory.createComponent('OR', {
        x: basePosition.x + 420,
        y: basePosition.y + 100
      }, `${baseId}_or`);
      orGate.label = 'OUTPUT';
      
      // Output LED
      const outputLed = ComponentFactory.createComponent('LED', {
        x: basePosition.x + 560,
        y: basePosition.y + 110
      }, `${baseId}_output`);
      outputLed.label = 'Y';
      
      components.push(inputA, inputB, inputS, notGate, and1, and2, orGate, outputLed);
      
      // Create connections
      const connectionsData = [
        // S to NOT gate
        {
          id: `${baseId}_conn1`,
          from: { componentId: inputS.id, connectionPointId: inputS.outputs[0].id },
          to: { componentId: notGate.id, connectionPointId: notGate.inputs[0].id },
          path: [],
          value: false
        },
        // A to AND1
        {
          id: `${baseId}_conn2`,
          from: { componentId: inputA.id, connectionPointId: inputA.outputs[0].id },
          to: { componentId: and1.id, connectionPointId: and1.inputs[0].id },
          path: [],
          value: false
        },
        // NOT(S) to AND1
        {
          id: `${baseId}_conn3`,
          from: { componentId: notGate.id, connectionPointId: notGate.outputs[0].id },
          to: { componentId: and1.id, connectionPointId: and1.inputs[1].id },
          path: [],
          value: false
        },
        // B to AND2
        {
          id: `${baseId}_conn4`,
          from: { componentId: inputB.id, connectionPointId: inputB.outputs[0].id },
          to: { componentId: and2.id, connectionPointId: and2.inputs[0].id },
          path: [],
          value: false
        },
        // S to AND2
        {
          id: `${baseId}_conn5`,
          from: { componentId: inputS.id, connectionPointId: inputS.outputs[0].id },
          to: { componentId: and2.id, connectionPointId: and2.inputs[1].id },
          path: [],
          value: false
        },
        // AND gates to OR
        {
          id: `${baseId}_conn6`,
          from: { componentId: and1.id, connectionPointId: and1.outputs[0].id },
          to: { componentId: orGate.id, connectionPointId: orGate.inputs[0].id },
          path: [],
          value: false
        },
        {
          id: `${baseId}_conn7`,
          from: { componentId: and2.id, connectionPointId: and2.outputs[0].id },
          to: { componentId: orGate.id, connectionPointId: orGate.inputs[1].id },
          path: [],
          value: false
        },
        // OR to output
        {
          id: `${baseId}_conn8`,
          from: { componentId: orGate.id, connectionPointId: orGate.outputs[0].id },
          to: { componentId: outputLed.id, connectionPointId: outputLed.inputs[0].id },
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
          { label: 'B', componentId: inputB.id, connectionPointId: inputB.outputs[0].id },
          { label: 'S', componentId: inputS.id, connectionPointId: inputS.outputs[0].id }
        ],
        outputMappings: [
          { label: 'Y', componentId: outputLed.id, connectionPointId: outputLed.inputs[0].id }
        ]
      };
    }
  },

  DEMULTIPLEXER_1TO2: {
    id: 'DEMULTIPLEXER_1TO2',
    name: '1-to-2 Demultiplexer',
    description: 'Data distributor that routes input to one of two outputs based on select. When S=0, Y0=D. When S=1, Y1=D.',
    inputLabels: ['D', 'S'],
    outputLabels: ['Y0', 'Y1'],
    generateComponents: (basePosition: Position, baseId: string) => {
      const components: Component[] = [];
      const connections: Connection[] = [];
      
      // Input switches
      const inputD = ComponentFactory.createComponent('SWITCH', {
        x: basePosition.x + 20,
        y: basePosition.y + 80
      }, `${baseId}_inputD`);
      inputD.label = 'Data';
      
      const inputS = ComponentFactory.createComponent('SWITCH', {
        x: basePosition.x + 20,
        y: basePosition.y + 180
      }, `${baseId}_inputS`);
      inputS.label = 'Select';
      
      // Logic gates
      const notGate = ComponentFactory.createComponent('NOT', {
        x: basePosition.x + 140,
        y: basePosition.y + 180
      }, `${baseId}_not`);
      notGate.label = 'NOT S';
      
      const and1 = ComponentFactory.createComponent('AND', {
        x: basePosition.x + 280,
        y: basePosition.y + 50
      }, `${baseId}_and1`);
      and1.label = 'Y0 Gate';
      
      const and2 = ComponentFactory.createComponent('AND', {
        x: basePosition.x + 280,
        y: basePosition.y + 150
      }, `${baseId}_and2`);
      and2.label = 'Y1 Gate';
      
      // Output LEDs
      const output0Led = ComponentFactory.createComponent('LED', {
        x: basePosition.x + 420,
        y: basePosition.y + 60
      }, `${baseId}_output0`);
      output0Led.label = 'Y0';
      
      const output1Led = ComponentFactory.createComponent('LED', {
        x: basePosition.x + 420,
        y: basePosition.y + 160
      }, `${baseId}_output1`);
      output1Led.label = 'Y1';
      
      components.push(inputD, inputS, notGate, and1, and2, output0Led, output1Led);
      
      // Create connections
      const connectionsData = [
        // S to NOT gate
        {
          id: `${baseId}_conn1`,
          from: { componentId: inputS.id, connectionPointId: inputS.outputs[0].id },
          to: { componentId: notGate.id, connectionPointId: notGate.inputs[0].id },
          path: [],
          value: false
        },
        // D to both AND gates
        {
          id: `${baseId}_conn2`,
          from: { componentId: inputD.id, connectionPointId: inputD.outputs[0].id },
          to: { componentId: and1.id, connectionPointId: and1.inputs[0].id },
          path: [],
          value: false
        },
        {
          id: `${baseId}_conn3`,
          from: { componentId: inputD.id, connectionPointId: inputD.outputs[0].id },
          to: { componentId: and2.id, connectionPointId: and2.inputs[0].id },
          path: [],
          value: false
        },
        // NOT(S) to AND1
        {
          id: `${baseId}_conn4`,
          from: { componentId: notGate.id, connectionPointId: notGate.outputs[0].id },
          to: { componentId: and1.id, connectionPointId: and1.inputs[1].id },
          path: [],
          value: false
        },
        // S to AND2
        {
          id: `${baseId}_conn5`,
          from: { componentId: inputS.id, connectionPointId: inputS.outputs[0].id },
          to: { componentId: and2.id, connectionPointId: and2.inputs[1].id },
          path: [],
          value: false
        },
        // AND outputs to LEDs
        {
          id: `${baseId}_conn6`,
          from: { componentId: and1.id, connectionPointId: and1.outputs[0].id },
          to: { componentId: output0Led.id, connectionPointId: output0Led.inputs[0].id },
          path: [],
          value: false
        },
        {
          id: `${baseId}_conn7`,
          from: { componentId: and2.id, connectionPointId: and2.outputs[0].id },
          to: { componentId: output1Led.id, connectionPointId: output1Led.inputs[0].id },
          path: [],
          value: false
        }
      ];
      
      connections.push(...connectionsData);
      
      return {
        components,
        connections,
        inputMappings: [
          { label: 'D', componentId: inputD.id, connectionPointId: inputD.outputs[0].id },
          { label: 'S', componentId: inputS.id, connectionPointId: inputS.outputs[0].id }
        ],
        outputMappings: [
          { label: 'Y0', componentId: output0Led.id, connectionPointId: output0Led.inputs[0].id },
          { label: 'Y1', componentId: output1Led.id, connectionPointId: output1Led.inputs[0].id }
        ]
      };
    }
  }
};