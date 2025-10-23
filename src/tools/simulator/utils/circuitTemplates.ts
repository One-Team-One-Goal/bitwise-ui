import type { Component, Connection, Position } from '../types';
import { ComponentFactory } from './componentFactory';

interface ConnectionPathOptions {
  straight?: boolean;
  bendX?: number;
  offsetFromStart?: number;
  via?: Position[];
}

const createConnection = (
  baseId: string,
  suffix: string,
  fromComponent: Component,
  outputIndex: number,
  toComponent: Component,
  inputIndex: number,
  options: ConnectionPathOptions = {}
): Connection => {
  const fromPoint = fromComponent.outputs[outputIndex];
  const toPoint = toComponent.inputs[inputIndex];

  if (!fromPoint || !toPoint) {
    throw new Error(`Invalid connection indices for template ${baseId}_${suffix}`);
  }

  const start: Position = {
    x: fromComponent.position.x + fromPoint.position.x,
    y: fromComponent.position.y + fromPoint.position.y
  };

  const end: Position = {
    x: toComponent.position.x + toPoint.position.x,
    y: toComponent.position.y + toPoint.position.y
  };

  let path: Position[];

  if (options.via && options.via.length > 0) {
    path = [start, ...options.via, end];
  } else if (options.straight || Math.abs(start.y - end.y) < 6) {
    path = [start, end];
  } else {
    const bendX = options.bendX ?? (options.offsetFromStart ? start.x + options.offsetFromStart : (start.x + end.x) / 2);
    path = [
      start,
      { x: bendX, y: start.y },
      { x: bendX, y: end.y },
      end
    ];
  }

  return {
    id: `${baseId}_${suffix}`,
    from: {
      componentId: fromComponent.id,
      connectionPointId: fromPoint.id
    },
    to: {
      componentId: toComponent.id,
      connectionPointId: toPoint.id
    },
    path,
    value: false
  };
};

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
      const layoutOriginX = basePosition.x - 150;
      const layoutOriginY = basePosition.y - 70;

      // Input switches with better spacing
      const inputA = ComponentFactory.createComponent('SWITCH', {
        x: layoutOriginX + 20,
        y: layoutOriginY + 30
      }, `${baseId}_inputA`);
      inputA.label = 'A';
      
      const inputB = ComponentFactory.createComponent('SWITCH', {
        x: layoutOriginX + 20,
        y: layoutOriginY + 100
      }, `${baseId}_inputB`);
      inputB.label = 'B';
      
      // Logic gates with improved layout
      const xorGate = ComponentFactory.createComponent('XOR', {
        x: layoutOriginX + 140,
        y: layoutOriginY + 30
      }, `${baseId}_xor`);
      xorGate.label = 'SUM';
      
      const andGate = ComponentFactory.createComponent('AND', {
        x: layoutOriginX + 140,
        y: layoutOriginY + 100
      }, `${baseId}_and`);
      andGate.label = 'CARRY';
      
      // Output LEDs
      const sumLed = ComponentFactory.createComponent('LED', {
        x: layoutOriginX + 280,
        y: layoutOriginY + 40
      }, `${baseId}_sum`);
      sumLed.label = 'Sum';
      
      const carryLed = ComponentFactory.createComponent('LED', {
        x: layoutOriginX + 280,
        y: layoutOriginY + 110
      }, `${baseId}_carry`);
      carryLed.label = 'Carry';
      
      components.push(inputA, inputB, xorGate, andGate, sumLed, carryLed);

      connections.push(
        createConnection(baseId, 'conn1', inputA, 0, xorGate, 0, { straight: true }),
        createConnection(baseId, 'conn2', inputA, 0, andGate, 0, { offsetFromStart: 80 }),
        createConnection(baseId, 'conn3', inputB, 0, xorGate, 1, { offsetFromStart: 80 }),
        createConnection(baseId, 'conn4', inputB, 0, andGate, 1, { straight: true }),
        createConnection(baseId, 'conn5', xorGate, 0, sumLed, 0, { straight: true }),
        createConnection(baseId, 'conn6', andGate, 0, carryLed, 0, { straight: true })
      );
      
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
      const layoutOriginX = basePosition.x - 290;
      const layoutOriginY = basePosition.y - 90;

      // Input switches
      const inputA = ComponentFactory.createComponent('SWITCH', {
        x: layoutOriginX + 20,
        y: layoutOriginY + 30
      }, `${baseId}_inputA`);
      inputA.label = 'A';
      
      const inputB = ComponentFactory.createComponent('SWITCH', {
        x: layoutOriginX + 20,
        y: layoutOriginY + 90
      }, `${baseId}_inputB`);
      inputB.label = 'B';
      
      const inputCin = ComponentFactory.createComponent('SWITCH', {
        x: layoutOriginX + 20,
        y: layoutOriginY + 150
      }, `${baseId}_inputCin`);
      inputCin.label = 'Cin';
      
      // First stage: A XOR B
      const xor1 = ComponentFactory.createComponent('XOR', {
        x: layoutOriginX + 140,
        y: layoutOriginY + 50
      }, `${baseId}_xor1`);
      xor1.label = 'XOR1';
      
      // Second stage: (A XOR B) XOR Cin = Sum
      const xor2 = ComponentFactory.createComponent('XOR', {
        x: layoutOriginX + 280,
        y: layoutOriginY + 90
      }, `${baseId}_xor2`);
      xor2.label = 'SUM';
      
      // Carry logic: A AND B
      const and1 = ComponentFactory.createComponent('AND', {
        x: layoutOriginX + 140,
        y: layoutOriginY + 130
      }, `${baseId}_and1`);
      and1.label = 'AND1';
      
      // Carry logic: (A XOR B) AND Cin
      const and2 = ComponentFactory.createComponent('AND', {
        x: layoutOriginX + 280,
        y: layoutOriginY + 150
      }, `${baseId}_and2`);
      and2.label = 'AND2';
      
      // Final carry: OR of both AND gates
      const or1 = ComponentFactory.createComponent('OR', {
        x: layoutOriginX + 420,
        y: layoutOriginY + 140
      }, `${baseId}_or1`);
      or1.label = 'COUT';
      
      // Output LEDs
      const sumLed = ComponentFactory.createComponent('LED', {
        x: layoutOriginX + 420,
        y: layoutOriginY + 100
      }, `${baseId}_sum`);
      sumLed.label = 'Sum';
      
      const carryLed = ComponentFactory.createComponent('LED', {
        x: layoutOriginX + 560,
        y: layoutOriginY + 150
      }, `${baseId}_carry`);
      carryLed.label = 'Cout';
      
      components.push(inputA, inputB, inputCin, xor1, xor2, and1, and2, or1, sumLed, carryLed);

      connections.push(
        createConnection(baseId, 'conn1', inputA, 0, xor1, 0, { offsetFromStart: 90 }),
        createConnection(baseId, 'conn2', inputA, 0, and1, 0, { offsetFromStart: 140 }),
        createConnection(baseId, 'conn3', inputB, 0, xor1, 1, { offsetFromStart: 70 }),
        createConnection(baseId, 'conn4', inputB, 0, and1, 1, { offsetFromStart: 120 }),
        createConnection(baseId, 'conn5', xor1, 0, xor2, 0, { offsetFromStart: 110 }),
        createConnection(baseId, 'conn6', xor1, 0, and2, 0, { offsetFromStart: 150 }),
        createConnection(baseId, 'conn7', inputCin, 0, xor2, 1, { offsetFromStart: 90 }),
        createConnection(baseId, 'conn8', inputCin, 0, and2, 1, { offsetFromStart: 130 }),
        createConnection(baseId, 'conn9', and1, 0, or1, 0, { offsetFromStart: 120 }),
        createConnection(baseId, 'conn10', and2, 0, or1, 1, { offsetFromStart: 80 }),
        createConnection(baseId, 'conn11', xor2, 0, sumLed, 0, { straight: true }),
        createConnection(baseId, 'conn12', or1, 0, carryLed, 0, { straight: true })
      );
      
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

  FOUR_BIT_ADDER: {
    id: 'FOUR_BIT_ADDER',
    name: '4-Bit Ripple Adder',
    description: 'Adds two 4-bit inputs with a ripple-carry chain. Toggle switches to set A[3:0], B[3:0], and Cin; LEDs display the four-bit sum and Cout.',
    inputLabels: ['A3', 'A2', 'A1', 'A0', 'B3', 'B2', 'B1', 'B0', 'Cin'],
    outputLabels: ['S3', 'S2', 'S1', 'S0', 'Cout'],
    generateComponents: (basePosition: Position, baseId: string) => {
      const components: Component[] = [];
      const connections: Connection[] = [];
      const inputMappings: { label: string; componentId: string; connectionPointId: string }[] = [];
      const outputMappings: { label: string; componentId: string; connectionPointId: string }[] = [];

      const bitCount = 4;
      const bitSpacing = 120;
      const layoutOriginX = basePosition.x - 330;
      const layoutOriginY = basePosition.y - 260;

      const aSwitches: Component[] = [];
      const bSwitches: Component[] = [];
      const stages: Array<{
        xor1: Component;
        xor2: Component;
        and1: Component;
        and2: Component;
        orGate: Component;
        sumLed: Component;
      }> = [];

      for (let bit = 0; bit < bitCount; bit++) {
        const row = bitCount - 1 - bit;
        const yBase = layoutOriginY + row * bitSpacing;

        const inputA = ComponentFactory.createComponent('SWITCH', {
          x: layoutOriginX + 20,
          y: yBase + 10
        }, `${baseId}_A${bit}`);
        inputA.label = `A${bit}`;

        const inputB = ComponentFactory.createComponent('SWITCH', {
          x: layoutOriginX + 20,
          y: yBase + 70
        }, `${baseId}_B${bit}`);
        inputB.label = `B${bit}`;

        const xor1 = ComponentFactory.createComponent('XOR', {
          x: layoutOriginX + 180,
          y: yBase + 10
        }, `${baseId}_bit${bit}_xor1`);
        xor1.label = `A${bit} ⊕ B${bit}`;

        const xor2 = ComponentFactory.createComponent('XOR', {
          x: layoutOriginX + 320,
          y: yBase + 30
        }, `${baseId}_bit${bit}_xor2`);
        xor2.label = `S${bit}`;

        const and1 = ComponentFactory.createComponent('AND', {
          x: layoutOriginX + 180,
          y: yBase + 90
        }, `${baseId}_bit${bit}_and1`);
        and1.label = `A${bit}·B${bit}`;

        const and2 = ComponentFactory.createComponent('AND', {
          x: layoutOriginX + 320,
          y: yBase + 110
        }, `${baseId}_bit${bit}_and2`);
        and2.label = `Cin·X${bit}`;

        const orGate = ComponentFactory.createComponent('OR', {
          x: layoutOriginX + 480,
          y: yBase + 100
        }, `${baseId}_bit${bit}_or`);
        orGate.label = `Carry ${bit + 1}`;

        const sumLed = ComponentFactory.createComponent('LED', {
          x: layoutOriginX + 640,
          y: yBase + 40
        }, `${baseId}_S${bit}`);
        sumLed.label = `S${bit}`;

        components.push(inputA, inputB, xor1, xor2, and1, and2, orGate, sumLed);
        aSwitches[bit] = inputA;
        bSwitches[bit] = inputB;
        stages[bit] = { xor1, xor2, and1, and2, orGate, sumLed };

        inputMappings.push({ label: `A${bit}`, componentId: inputA.id, connectionPointId: inputA.outputs[0].id });
        inputMappings.push({ label: `B${bit}`, componentId: inputB.id, connectionPointId: inputB.outputs[0].id });
        outputMappings.push({ label: `S${bit}`, componentId: sumLed.id, connectionPointId: sumLed.inputs[0].id });
      }

      const cinSwitch = ComponentFactory.createComponent('SWITCH', {
        x: layoutOriginX + 20,
        y: layoutOriginY + bitCount * bitSpacing + 40
      }, `${baseId}_Cin`);
      cinSwitch.label = 'Cin';
      components.push(cinSwitch);
      inputMappings.push({ label: 'Cin', componentId: cinSwitch.id, connectionPointId: cinSwitch.outputs[0].id });

      const carryLed = ComponentFactory.createComponent('LED', {
        x: layoutOriginX + 640,
        y: layoutOriginY + bitCount * bitSpacing + 30
      }, `${baseId}_Cout`);
      carryLed.label = 'Cout';
      components.push(carryLed);
      outputMappings.push({ label: 'Cout', componentId: carryLed.id, connectionPointId: carryLed.inputs[0].id });

      for (let bit = 0; bit < bitCount; bit++) {
        const stage = stages[bit];
        const inputA = aSwitches[bit];
        const inputB = bSwitches[bit];

        connections.push(
          createConnection(baseId, `bit${bit}_a_xor1`, inputA, 0, stage.xor1, 0, { offsetFromStart: 130 }),
          createConnection(baseId, `bit${bit}_a_and1`, inputA, 0, stage.and1, 0, { offsetFromStart: 170 }),
          createConnection(baseId, `bit${bit}_b_xor1`, inputB, 0, stage.xor1, 1, { offsetFromStart: 110 }),
          createConnection(baseId, `bit${bit}_b_and1`, inputB, 0, stage.and1, 1, { offsetFromStart: 150 }),
          createConnection(baseId, `bit${bit}_xor1_to_xor2`, stage.xor1, 0, stage.xor2, 0, { offsetFromStart: 120 }),
          createConnection(baseId, `bit${bit}_xor1_to_and2`, stage.xor1, 0, stage.and2, 0, { offsetFromStart: 160 })
        );

        const carrySource = bit === 0 ? cinSwitch : stages[bit - 1].orGate;

        connections.push(
          createConnection(baseId, `bit${bit}_cin_xor2`, carrySource, 0, stage.xor2, 1, {
            bendX: carrySource.position.x + (carrySource.outputs[0]?.position.x ?? 0) - 60
          }),
          createConnection(baseId, `bit${bit}_cin_and2`, carrySource, 0, stage.and2, 1, {
            bendX: carrySource.position.x + (carrySource.outputs[0]?.position.x ?? 0) - 20
          }),
          createConnection(baseId, `bit${bit}_sum_led`, stage.xor2, 0, stage.sumLed, 0, { straight: true }),
          createConnection(baseId, `bit${bit}_and1_or`, stage.and1, 0, stage.orGate, 0, { offsetFromStart: 140 }),
          createConnection(baseId, `bit${bit}_and2_or`, stage.and2, 0, stage.orGate, 1, { offsetFromStart: 100 })
        );
      }

      const msbStage = stages[bitCount - 1];
      connections.push(createConnection(baseId, 'cout_led', msbStage.orGate, 0, carryLed, 0, { straight: true }));

      return {
        components,
        connections,
        inputMappings,
        outputMappings
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
      const layoutOriginX = basePosition.x - 290;
      const layoutOriginY = basePosition.y - 130;
      
      // Input switches
      const inputA = ComponentFactory.createComponent('SWITCH', {
        x: layoutOriginX + 20,
        y: layoutOriginY + 30
      }, `${baseId}_inputA`);
      inputA.label = 'Data A';
      
      const inputB = ComponentFactory.createComponent('SWITCH', {
        x: layoutOriginX + 20,
        y: layoutOriginY + 130
      }, `${baseId}_inputB`);
      inputB.label = 'Data B';
      
      const inputS = ComponentFactory.createComponent('SWITCH', {
        x: layoutOriginX + 20,
        y: layoutOriginY + 230
      }, `${baseId}_inputS`);
      inputS.label = 'Select';
      
      // Logic gates
      const notGate = ComponentFactory.createComponent('NOT', {
        x: layoutOriginX + 140,
        y: layoutOriginY + 230
      }, `${baseId}_not`);
      notGate.label = 'NOT S';
      
      const and1 = ComponentFactory.createComponent('AND', {
        x: layoutOriginX + 280,
        y: layoutOriginY + 50
      }, `${baseId}_and1`);
      and1.label = 'A·S̄';
      
      const and2 = ComponentFactory.createComponent('AND', {
        x: layoutOriginX + 280,
        y: layoutOriginY + 150
      }, `${baseId}_and2`);
      and2.label = 'B·S';
      
      const orGate = ComponentFactory.createComponent('OR', {
        x: layoutOriginX + 420,
        y: layoutOriginY + 100
      }, `${baseId}_or`);
      orGate.label = 'OUTPUT';
      
      // Output LED
      const outputLed = ComponentFactory.createComponent('LED', {
        x: layoutOriginX + 560,
        y: layoutOriginY + 110
      }, `${baseId}_output`);
      outputLed.label = 'Y';
      
      components.push(inputA, inputB, inputS, notGate, and1, and2, orGate, outputLed);
      
      const sOutputPos = {
        x: inputS.position.x + inputS.outputs[0].position.x,
        y: inputS.position.y + inputS.outputs[0].position.y
      };
      const and2SelectInputPos = {
        x: and2.position.x + and2.inputs[1].position.x,
        y: and2.position.y + and2.inputs[1].position.y
      };

      connections.push(
        createConnection(baseId, 'conn1', inputS, 0, notGate, 0, { offsetFromStart: 90 }),
        createConnection(baseId, 'conn2', inputA, 0, and1, 0, { offsetFromStart: 150 }),
        createConnection(baseId, 'conn3', notGate, 0, and1, 1, { offsetFromStart: 90 }),
        createConnection(baseId, 'conn4', inputB, 0, and2, 0, { offsetFromStart: 150 }),
        createConnection(baseId, 'conn5', inputS, 0, and2, 1, {
          via: [
            { x: sOutputPos.x + 80, y: sOutputPos.y },
            { x: sOutputPos.x + 80, y: and2SelectInputPos.y }
          ]
        }),
        createConnection(baseId, 'conn6', and1, 0, orGate, 0, { offsetFromStart: 120 }),
        createConnection(baseId, 'conn7', and2, 0, orGate, 1, { offsetFromStart: 80 }),
        createConnection(baseId, 'conn8', orGate, 0, outputLed, 0, { straight: true })
      );
      
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

  DECODER_2TO4: {
    id: 'DECODER_2TO4',
    name: '2-to-4 Decoder',
    description: 'Binary decoder that converts two inputs into four mutually exclusive outputs. Each LED represents one-hot activation for the corresponding input combination.',
    inputLabels: ['A', 'B'],
    outputLabels: ['Y0', 'Y1', 'Y2', 'Y3'],
    generateComponents: (basePosition: Position, baseId: string) => {
      const components: Component[] = [];
      const connections: Connection[] = [];
      const inputMappings: { label: string; componentId: string; connectionPointId: string }[] = [];
      const outputMappings: { label: string; componentId: string; connectionPointId: string }[] = [];

      const layoutOriginX = basePosition.x - 240;
      const layoutOriginY = basePosition.y - 130;
      const inputA = ComponentFactory.createComponent('SWITCH', {
        x: layoutOriginX + 20,
        y: layoutOriginY + 20
      }, `${baseId}_A`);
      inputA.label = 'A';

      const inputB = ComponentFactory.createComponent('SWITCH', {
        x: layoutOriginX + 20,
        y: layoutOriginY + 120
      }, `${baseId}_B`);
      inputB.label = 'B';

      const notA = ComponentFactory.createComponent('NOT', {
        x: layoutOriginX + 150,
        y: layoutOriginY + 20
      }, `${baseId}_notA`);
      notA.label = 'A̅';

      const notB = ComponentFactory.createComponent('NOT', {
        x: layoutOriginX + 150,
        y: layoutOriginY + 120
      }, `${baseId}_notB`);
      notB.label = 'B̅';

      const and0 = ComponentFactory.createComponent('AND', {
        x: layoutOriginX + 300,
        y: layoutOriginY - 10
      }, `${baseId}_and0`);
      and0.label = 'Y0';

      const and1 = ComponentFactory.createComponent('AND', {
        x: layoutOriginX + 300,
        y: layoutOriginY + 70
      }, `${baseId}_and1`);
      and1.label = 'Y1';

      const and2 = ComponentFactory.createComponent('AND', {
        x: layoutOriginX + 300,
        y: layoutOriginY + 150
      }, `${baseId}_and2`);
      and2.label = 'Y2';

      const and3 = ComponentFactory.createComponent('AND', {
        x: layoutOriginX + 300,
        y: layoutOriginY + 230
      }, `${baseId}_and3`);
      and3.label = 'Y3';

      const led0 = ComponentFactory.createComponent('LED', {
        x: layoutOriginX + 460,
        y: layoutOriginY
      }, `${baseId}_Y0`);
      led0.label = 'Y0';

      const led1 = ComponentFactory.createComponent('LED', {
        x: layoutOriginX + 460,
        y: layoutOriginY + 80
      }, `${baseId}_Y1`);
      led1.label = 'Y1';

      const led2 = ComponentFactory.createComponent('LED', {
        x: layoutOriginX + 460,
        y: layoutOriginY + 160
      }, `${baseId}_Y2`);
      led2.label = 'Y2';

      const led3 = ComponentFactory.createComponent('LED', {
        x: layoutOriginX + 460,
        y: layoutOriginY + 240
      }, `${baseId}_Y3`);
      led3.label = 'Y3';

      components.push(inputA, inputB, notA, notB, and0, and1, and2, and3, led0, led1, led2, led3);

      inputMappings.push({ label: 'A', componentId: inputA.id, connectionPointId: inputA.outputs[0].id });
      inputMappings.push({ label: 'B', componentId: inputB.id, connectionPointId: inputB.outputs[0].id });
      outputMappings.push({ label: 'Y0', componentId: led0.id, connectionPointId: led0.inputs[0].id });
      outputMappings.push({ label: 'Y1', componentId: led1.id, connectionPointId: led1.inputs[0].id });
      outputMappings.push({ label: 'Y2', componentId: led2.id, connectionPointId: led2.inputs[0].id });
      outputMappings.push({ label: 'Y3', componentId: led3.id, connectionPointId: led3.inputs[0].id });

      connections.push(
        createConnection(baseId, 'a_not', inputA, 0, notA, 0, { offsetFromStart: 90 }),
        createConnection(baseId, 'b_not', inputB, 0, notB, 0, { offsetFromStart: 90 }),
        createConnection(baseId, 'and0_notA', notA, 0, and0, 0, { offsetFromStart: 100 }),
        createConnection(baseId, 'and0_notB', notB, 0, and0, 1, { offsetFromStart: 120 }),
        createConnection(baseId, 'and1_notA', notA, 0, and1, 0, { offsetFromStart: 140 }),
        createConnection(baseId, 'and1_B', inputB, 0, and1, 1, { offsetFromStart: 150 }),
        createConnection(baseId, 'and2_A', inputA, 0, and2, 0, { offsetFromStart: 150 }),
        createConnection(baseId, 'and2_notB', notB, 0, and2, 1, { offsetFromStart: 140 }),
        createConnection(baseId, 'and3_A', inputA, 0, and3, 0, { offsetFromStart: 130 }),
        createConnection(baseId, 'and3_B', inputB, 0, and3, 1, { offsetFromStart: 110 }),
        createConnection(baseId, 'and0_led', and0, 0, led0, 0, { straight: true }),
        createConnection(baseId, 'and1_led', and1, 0, led1, 0, { straight: true }),
        createConnection(baseId, 'and2_led', and2, 0, led2, 0, { straight: true }),
        createConnection(baseId, 'and3_led', and3, 0, led3, 0, { straight: true })
      );

      return {
        components,
        connections,
        inputMappings,
        outputMappings
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
      const layoutOriginX = basePosition.x - 220;
      const layoutOriginY = basePosition.y - 115;
      
      // Input switches
      const inputD = ComponentFactory.createComponent('SWITCH', {
        x: layoutOriginX + 20,
        y: layoutOriginY + 80
      }, `${baseId}_inputD`);
      inputD.label = 'Data';
      
      const inputS = ComponentFactory.createComponent('SWITCH', {
        x: layoutOriginX + 20,
        y: layoutOriginY + 180
      }, `${baseId}_inputS`);
      inputS.label = 'Select';
      
      // Logic gates
      const notGate = ComponentFactory.createComponent('NOT', {
        x: layoutOriginX + 140,
        y: layoutOriginY + 180
      }, `${baseId}_not`);
      notGate.label = 'NOT S';
      
      const and1 = ComponentFactory.createComponent('AND', {
        x: layoutOriginX + 280,
        y: layoutOriginY + 50
      }, `${baseId}_and1`);
      and1.label = 'Y0 Gate';
      
      const and2 = ComponentFactory.createComponent('AND', {
        x: layoutOriginX + 280,
        y: layoutOriginY + 150
      }, `${baseId}_and2`);
      and2.label = 'Y1 Gate';
      
      // Output LEDs
      const output0Led = ComponentFactory.createComponent('LED', {
        x: layoutOriginX + 420,
        y: layoutOriginY + 60
      }, `${baseId}_output0`);
      output0Led.label = 'Y0';
      
      const output1Led = ComponentFactory.createComponent('LED', {
        x: layoutOriginX + 420,
        y: layoutOriginY + 160
      }, `${baseId}_output1`);
      output1Led.label = 'Y1';
      
      components.push(inputD, inputS, notGate, and1, and2, output0Led, output1Led);
      const sOutputPos = {
        x: inputS.position.x + inputS.outputs[0].position.x,
        y: inputS.position.y + inputS.outputs[0].position.y
      };
      const and2SelectInputPos = {
        x: and2.position.x + and2.inputs[1].position.x,
        y: and2.position.y + and2.inputs[1].position.y
      };

      connections.push(
        createConnection(baseId, 'conn1', inputS, 0, notGate, 0, { offsetFromStart: 90 }),
        createConnection(baseId, 'conn2', inputD, 0, and1, 0, { offsetFromStart: 150 }),
        createConnection(baseId, 'conn3', inputD, 0, and2, 0, { offsetFromStart: 190 }),
        createConnection(baseId, 'conn4', notGate, 0, and1, 1, { offsetFromStart: 110 }),
        createConnection(baseId, 'conn5', inputS, 0, and2, 1, {
          via: [
            { x: sOutputPos.x + 80, y: sOutputPos.y },
            { x: sOutputPos.x + 80, y: and2SelectInputPos.y }
          ]
        }),
        createConnection(baseId, 'conn6', and1, 0, output0Led, 0, { straight: true }),
        createConnection(baseId, 'conn7', and2, 0, output1Led, 0, { straight: true })
      );
      
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

export class CircuitTemplateFactory {
  static generateCircuitFromTemplate(
    templateId: string,
    basePosition: Position,
    baseId?: string
  ): {
    components: Component[];
    connections: Connection[];
    inputMappings: { label: string; componentId: string; connectionPointId: string }[];
    outputMappings: { label: string; componentId: string; connectionPointId: string }[];
  } | null {
    const template = CIRCUIT_TEMPLATES[templateId];
    if (!template) {
      return null;
    }

    const uniqueBaseId = baseId || `${templateId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return template.generateComponents(basePosition, uniqueBaseId);
  }

  static getTemplateInfo(templateId: string): CircuitTemplate | null {
    return CIRCUIT_TEMPLATES[templateId] || null;
  }

  static getAllTemplates(): CircuitTemplate[] {
    return Object.values(CIRCUIT_TEMPLATES);
  }
}