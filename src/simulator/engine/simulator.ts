import type { Component, Connection, SimulationEvent } from '../types';

export class CircuitSimulator {
  private components: Map<string, Component> = new Map();
  private connections: Map<string, Connection> = new Map();
  private simulationEvents: SimulationEvent[] = [];
  private isRunning: boolean = false;
  private simulationSpeed: number = 100; // ms between updates

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

  private simulate(): void {
    if (!this.isRunning) return;

    this.propagateSignals();

    setTimeout(() => {
      this.simulate();
    }, this.simulationSpeed);
  }

  private propagateSignals(): void {
    // First, update all components based on their inputs
    this.components.forEach(component => {
      this.updateComponent(component);
    });

    // Then propagate signals through connections
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
    const trueCount = component.inputs.filter(input => input.value).length;
    component.outputs[0].value = trueCount % 2 === 0;
  }

  private updateBufferGate(component: Component): void {
    component.outputs[0].value = component.inputs[0].value;
  }

  private updateSRFlipFlop(component: Component): void {
    const s = component.inputs[0].value; // Set
    const r = component.inputs[1].value; // Reset
    const currentQ = component.outputs[0].value;
    const currentQNot = component.outputs[1].value;

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
    // S=1, R=1 is an invalid state (not handled)
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