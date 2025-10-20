import type { Component, Connection, SimulationEvent } from '../types';

export class CircuitSimulator {
  private components: Map<string, Component> = new Map();
  private connections: Map<string, Connection> = new Map();
  private simulationEvents: SimulationEvent[] = [];
  private isRunning: boolean = false;
  private simulationSpeed: number = 100;

  constructor() {}

  setComponents(components: Component[]): void {
    this.components.clear();
    components.forEach(component => {
      this.components.set(component.id, { ...component });
    });
  }

  setConnections(connections: Connection[]): void {
    this.connections.clear();
    connections.forEach(connection => {
      this.connections.set(connection.id, { ...connection });
    });
  }

  start(): void {
    this.isRunning = true;
    this.simulate();
  }

  stop(): void {
    this.isRunning = false;
  }

  reset(): void {
    this.stop();
    // Reset all component outputs to false
    this.components.forEach(component => {
      component.outputs.forEach(output => {
        output.value = false;
      });
    });
    this.simulationEvents = [];
  }

  getComponents(): Component[] {
    return Array.from(this.components.values());
  }

  getConnections(): Connection[] {
    return Array.from(this.connections.values());
  }

  private simulate(): void {
    if (!this.isRunning) return;

    this.propagateSignals();

    setTimeout(() => {
      this.simulate();
    }, this.simulationSpeed);
  }

  private propagateSignals(): void {
    // Run multiple iterations to ensure signals propagate through all layers
    // For deep circuits, signals need to flow from inputs -> gates -> more gates -> LED
    for (let iteration = 0; iteration < 10; iteration++) {
      let changesOccurred = false;
      
      // First propagate signals through connections
      this.connections.forEach(connection => {
        const fromComponent = this.components.get(connection.from.componentId);
        const toComponent = this.components.get(connection.to.componentId);

        if (fromComponent && toComponent) {
          const fromOutput = fromComponent.outputs.find(
            output => output.id === connection.from.connectionPointId
          );
          const toInput = toComponent.inputs.find(
            input => input.id === connection.to.connectionPointId
          );

          if (fromOutput && toInput) {
            const oldValue = toInput.value;
            
            toInput.value = fromOutput.value;
            connection.value = fromOutput.value;

            if (oldValue !== toInput.value) {
              changesOccurred = true;
              this.simulationEvents.push({
                timestamp: Date.now(),
                componentId: toComponent.id,
                connectionPointId: toInput.id,
                oldValue,
                newValue: toInput.value
              });
            }
          }
        }
      });
      
      // Then update all components based on their inputs
      this.components.forEach(component => {
        this.updateComponent(component);
      });
      
      // If no changes occurred, we can stop iterating
      if (!changesOccurred && iteration > 0) {
        break;
      }
    }
    
    // Limit simulation events to prevent memory issues
    if (this.simulationEvents.length > 1000) {
      this.simulationEvents = this.simulationEvents.slice(-500);
    }
  }

  private updateComponent(component: Component): void {
    switch (component.type) {
      case 'AND':
        this.updateAndGate(component);
        break;
      case 'OR':
        this.updateOrGate(component);
        break;
      case 'NOT':
        this.updateNotGate(component);
        break;
      case 'NAND':
        this.updateNandGate(component);
        break;
      case 'NOR':
        this.updateNorGate(component);
        break;
      case 'XOR':
        this.updateXorGate(component);
        break;
      case 'XNOR':
        this.updateXnorGate(component);
        break;
      case 'BUFFER':
        this.updateBufferGate(component);
        break;
      case 'SR_FLIPFLOP':
        this.updateSRFlipFlop(component);
        break;
      case 'D_FLIPFLOP':
        this.updateDFlipFlop(component);
        break;
      case 'JK_FLIPFLOP':
        this.updateJKFlipFlop(component);
        break;
      case 'T_FLIPFLOP':
        this.updateTFlipFlop(component);
        break;
      case 'HIGH_CONSTANT':
        this.updateHighConstant(component);
        break;
      case 'LOW_CONSTANT':
        this.updateLowConstant(component);
        break;
      case 'SWITCH':
        this.updateSwitch(component);
        break;
      case 'PUSH_BUTTON':
        this.updatePushButton(component);
        break;
      case 'CLOCK':
        this.updateClock(component);
        break;
      case 'HALF_ADDER':
        this.updateHalfAdder(component);
        break;
      case 'FULL_ADDER':
        this.updateFullAdder(component);
        break;
      case 'MULTIPLEXER_2TO1':
        this.updateMultiplexer2to1(component);
        break;
      case 'DECODER_2TO4':
        this.updateDecoder2to4(component);
        break;
      default:
        break;
    }
  }

  private updateAndGate(component: Component): void {
    const result = component.inputs.every(input => input.value);
    component.outputs[0].value = result;
  }

  private updateOrGate(component: Component): void {
    const result = component.inputs.some(input => input.value);
    component.outputs[0].value = result;
  }

  private updateNotGate(component: Component): void {
    component.outputs[0].value = !component.inputs[0].value;
  }

  private updateNandGate(component: Component): void {
    const result = !component.inputs.every(input => input.value);
    component.outputs[0].value = result;
  }

  private updateNorGate(component: Component): void {
    const result = !component.inputs.some(input => input.value);
    component.outputs[0].value = result;
  }

  private updateXorGate(component: Component): void {
    const trueCount = component.inputs.filter(input => input.value).length;
    component.outputs[0].value = trueCount % 2 === 1;
  }

  private updateXnorGate(component: Component): void {
    // XNOR: Output HIGH when all inputs are the same (all HIGH or all LOW)
    // For 2 inputs: A XNOR B = (A AND B) OR (NOT A AND NOT B)
    const allHigh = component.inputs.every(input => input.value);
    const allLow = component.inputs.every(input => !input.value);
    component.outputs[0].value = allHigh || allLow;
  }

  private updateBufferGate(component: Component): void {
    component.outputs[0].value = component.inputs[0].value;
  }

  private updateSRFlipFlop(component: Component): void {
    const s = component.inputs[0].value; // Set
    const r = component.inputs[1].value; // Reset
    const clk = component.inputs[2]?.value || false; // Clock
    const prevClk = component.properties.prevClk || false;
    const currentQ = component.outputs[0].value;
    const currentQNot = component.outputs[1].value;

    // Rising edge trigger
    if (clk && !prevClk) {
      if (s && !r) {
        component.outputs[0].value = true;  // Q
        component.outputs[1].value = false; // Q'
      } else if (!s && r) {
        component.outputs[0].value = false; // Q
        component.outputs[1].value = true;  // Q'
      } else if (!s && !r) {
        // Hold state
        component.outputs[0].value = currentQ;
        component.outputs[1].value = currentQNot;
      }
      // S=1, R=1 is an invalid state (outputs may be unpredictable)
      else if (s && r) {
        // Invalid state - both outputs go LOW in most implementations
        component.outputs[0].value = false;
        component.outputs[1].value = false;
      }
    }

    component.properties.prevClk = clk;
  }

  private updateDFlipFlop(component: Component): void {
    const d = component.inputs[0].value; // Data
    const clk = component.inputs[1].value; // Clock
    const prevClk = component.properties.prevClk || false;

    // Rising edge trigger
    if (clk && !prevClk) {
      component.outputs[0].value = d;      // Q
      component.outputs[1].value = !d;     // Q'
    }

    component.properties.prevClk = clk;
  }

  private updateJKFlipFlop(component: Component): void {
    const j = component.inputs[0].value; // J
    const k = component.inputs[1].value; // K
    const clk = component.inputs[2].value; // Clock
    const prevClk = component.properties.prevClk || false;
    const currentQ = component.outputs[0].value;

    // Rising edge trigger
    if (clk && !prevClk) {
      if (!j && !k) {
        // Hold state
      } else if (j && !k) {
        component.outputs[0].value = true;
        component.outputs[1].value = false;
      } else if (!j && k) {
        component.outputs[0].value = false;
        component.outputs[1].value = true;
      } else if (j && k) {
        // Toggle
        component.outputs[0].value = !currentQ;
        component.outputs[1].value = currentQ;
      }
    }

    component.properties.prevClk = clk;
  }

  private updateTFlipFlop(component: Component): void {
    const t = component.inputs[0].value; // Toggle
    const clk = component.inputs[1].value; // Clock
    const prevClk = component.properties.prevClk || false;
    const currentQ = component.outputs[0].value;

    // Rising edge trigger
    if (clk && !prevClk && t) {
      component.outputs[0].value = !currentQ;
      component.outputs[1].value = currentQ;
    }

    component.properties.prevClk = clk;
  }

  private updateHighConstant(component: Component): void {
    component.outputs[0].value = true;
  }

  private updateLowConstant(component: Component): void {
    component.outputs[0].value = false;
  }

  private updateSwitch(component: Component): void {
    // Switch maintains its output state (toggled by user interaction)
    // Output is already set by user interaction, just maintain it
    if (component.outputs[0]) {
      component.outputs[0].value = component.outputs[0].value ?? false;
    }
  }

  private updatePushButton(component: Component): void {
    // Push button maintains its output state (set HIGH when pressed, LOW when released)
    if (component.outputs[0]) {
      component.outputs[0].value = component.outputs[0].value ?? false;
    }
  }

  private updateClock(component: Component): void {
    // Clock toggles automatically based on frequency
    // Initialize clock properties if not set
    if (!component.properties.clockFrequency) {
      component.properties.clockFrequency = 1000; // Default 1 Hz (1000ms period)
      component.properties.lastToggle = Date.now();
    }
    
    const now = Date.now();
    const period = component.properties.clockFrequency;
    const elapsed = now - component.properties.lastToggle;
    
    // Toggle clock output when half period has elapsed
    if (elapsed >= period / 2) {
      component.outputs[0].value = !component.outputs[0].value;
      component.properties.lastToggle = now;
    }
  }

  private updateHalfAdder(component: Component): void {
    // Half Adder: inputs A, B; outputs Sum (A XOR B), Carry (A AND B)
    if (component.inputs.length >= 2 && component.outputs.length >= 2) {
      const a = component.inputs[0].value;
      const b = component.inputs[1].value;
      component.outputs[0].value = a !== b; // Sum = A XOR B
      component.outputs[1].value = a && b;  // Carry = A AND B
    }
  }

  private updateFullAdder(component: Component): void {
    // Full Adder: inputs A, B, Cin; outputs Sum, Cout
    if (component.inputs.length >= 3 && component.outputs.length >= 2) {
      const a = component.inputs[0].value;
      const b = component.inputs[1].value;
      const cin = component.inputs[2].value;
      
      // Sum = A XOR B XOR Cin
      const xor1 = a !== b;
      const sum = xor1 !== cin;
      
      // Cout = (A AND B) OR (Cin AND (A XOR B))
      const and1 = a && b;
      const and2 = cin && xor1;
      const cout = and1 || and2;
      
      component.outputs[0].value = sum;
      component.outputs[1].value = cout;
    }
  }

  private updateMultiplexer2to1(component: Component): void {
    // 2:1 MUX: inputs A (data 0), B (data 1), S (select); output Y
    if (component.inputs.length >= 3 && component.outputs.length >= 1) {
      const a = component.inputs[0].value;
      const b = component.inputs[1].value;
      const s = component.inputs[2].value;
      // When S=0, output A; when S=1, output B
      component.outputs[0].value = s ? b : a;
    }
  }

  private updateDecoder2to4(component: Component): void {
    // 2:4 Decoder: inputs A1, A0; outputs Y0, Y1, Y2, Y3
    // Only one output is HIGH based on the binary input
    if (component.inputs.length >= 2 && component.outputs.length >= 4) {
      const a1 = component.inputs[0].value;
      const a0 = component.inputs[1].value;
      const value = (a1 ? 2 : 0) + (a0 ? 1 : 0);
      
      for (let i = 0; i < 4; i++) {
        component.outputs[i].value = (i === value);
      }
    }
  }

  getComponent(id: string): Component | undefined {
    return this.components.get(id);
  }

  getConnection(id: string): Connection | undefined {
    return this.connections.get(id);
  }

  getSimulationEvents(): SimulationEvent[] {
    return [...this.simulationEvents];
  }

  isSimulationRunning(): boolean {
    return this.isRunning;
  }

  setSimulationSpeed(speed: number): void {
    this.simulationSpeed = speed;
  }
}