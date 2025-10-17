/**
 * Circuit Generator from Boolean Expression
 * Converts expression trees into circuit components and connections
 */

import type { Component, Connection, ComponentType } from '../types';
import type { ExpressionNode, Operator } from './expressionParser';
import { ComponentFactory } from './componentFactory';

export interface CircuitGenerationResult {
  components: Component[];
  connections: Connection[];
  inputVariables: string[];
  outputVariable: string;
}

interface ComponentNode {
  id: string;
  component: Component;
  node: ExpressionNode;
  outputPin: string;
}

/**
 * Map expression operators to component types
 */
function operatorToComponentType(operator: Operator): ComponentType {
  const mapping: Record<Operator, ComponentType> = {
    'AND': 'AND',
    'OR': 'OR',
    'NOT': 'NOT',
    'XOR': 'XOR',
    'NAND': 'NAND',
    'NOR': 'NOR',
    'XNOR': 'XNOR',
  };
  return mapping[operator];
}

/**
 * Calculate layout positions for components
 */
function calculateLayout(
  componentNodes: ComponentNode[],
  inputVariables: string[]
): void {
  const LAYER_SPACING = 200;
  const COMPONENT_SPACING = 100;
  const START_X = 100;
  const START_Y = 100;
  
  // Group components by depth (layer)
  const layers: Map<number, ComponentNode[]> = new Map();
  
  function calculateDepth(node: ExpressionNode, depth = 0): number {
    if (node.type === 'variable' || node.type === 'constant') {
      return depth;
    }
    
    const leftDepth = node.left ? calculateDepth(node.left, depth + 1) : depth;
    const rightDepth = node.right ? calculateDepth(node.right, depth + 1) : depth;
    
    return Math.max(leftDepth, rightDepth);
  }
  
  // Assign depths
  componentNodes.forEach(compNode => {
    const depth = calculateDepth(compNode.node);
    if (!layers.has(depth)) {
      layers.set(depth, []);
    }
    layers.get(depth)!.push(compNode);
  });
  
  // Position components layer by layer
  const sortedLayers = Array.from(layers.keys()).sort((a, b) => b - a);
  
  sortedLayers.forEach((layerDepth, layerIndex) => {
    const layerNodes = layers.get(layerDepth)!;
    const layerY = START_Y + layerIndex * LAYER_SPACING;
    
    layerNodes.forEach((compNode, index) => {
      const x = START_X + index * COMPONENT_SPACING;
      const y = layerY;
      
      compNode.component.position = { x, y };
    });
  });
  
  // Position input variables on the left
  const inputY = START_Y + sortedLayers.length * LAYER_SPACING;
  inputVariables.forEach((variable, index) => {
    const inputComp = componentNodes.find(
      cn => cn.node.type === 'variable' && cn.node.value === variable
    );
    if (inputComp) {
      inputComp.component.position = {
        x: START_X,
        y: inputY + index * COMPONENT_SPACING,
      };
    }
  });
}

/**
 * Generate circuit from expression tree
 */
export function generateCircuitFromExpression(
  expressionTree: ExpressionNode,
  variables: string[]
): CircuitGenerationResult {
  const components: Component[] = [];
  const connections: Connection[] = [];
  const componentNodes: ComponentNode[] = [];
  
  let componentIdCounter = 0;
  let connectionIdCounter = 0;
  
  const generateId = (prefix: string) => `${prefix}_${Date.now()}_${componentIdCounter++}`;
  const generateConnectionId = () => `conn_${Date.now()}_${connectionIdCounter++}`;
  
  // Create input switches for each variable
  const inputComponents: Map<string, Component> = new Map();
  variables.forEach(variable => {
    const inputComp = ComponentFactory.createComponent(
      'SWITCH',
      { x: 0, y: 0 }, // Will be positioned later
      generateId('input')
    );
    inputComp.label = variable;
    inputComponents.set(variable, inputComp);
    components.push(inputComp);
    
    componentNodes.push({
      id: inputComp.id,
      component: inputComp,
      node: { type: 'variable', value: variable },
      outputPin: inputComp.outputs[0].id,
    });
  });
  
  // Recursively build circuit from expression tree
  function buildCircuit(node: ExpressionNode): ComponentNode {
    // Variable leaf node - return existing input component
    if (node.type === 'variable') {
      const inputComp = inputComponents.get(node.value);
      if (!inputComp) {
        throw new Error(`Variable ${node.value} not found in inputs`);
      }
      return componentNodes.find(cn => cn.component.id === inputComp.id)!;
    }
    
    // Constant leaf node
    if (node.type === 'constant') {
      const constType: ComponentType = node.value === '1' ? 'HIGH_CONSTANT' : 'LOW_CONSTANT';
      const constComp = ComponentFactory.createComponent(
        constType,
        { x: 0, y: 0 },
        generateId('const')
      );
      components.push(constComp);
      
      const constNode: ComponentNode = {
        id: constComp.id,
        component: constComp,
        node,
        outputPin: constComp.outputs[0].id,
      };
      componentNodes.push(constNode);
      return constNode;
    }
    
    // Operator node - create gate component
    if (node.type === 'operator' && node.operator) {
      const gateType = operatorToComponentType(node.operator);
      const gateComp = ComponentFactory.createComponent(
        gateType,
        { x: 0, y: 0 },
        generateId('gate')
      );
      components.push(gateComp);
      
      const gateNode: ComponentNode = {
        id: gateComp.id,
        component: gateComp,
        node,
        outputPin: gateComp.outputs[0].id,
      };
      componentNodes.push(gateNode);
      
      // Connect inputs
      if (node.left) {
        const leftNode = buildCircuit(node.left);
        const connection: Connection = {
          id: generateConnectionId(),
          from: {
            componentId: leftNode.component.id,
            connectionPointId: leftNode.outputPin,
          },
          to: {
            componentId: gateComp.id,
            connectionPointId: gateComp.inputs[0].id,
          },
          path: [], // Will be calculated by the simulator
          value: false,
        };
        connections.push(connection);
      }
      
      if (node.right) {
        const rightNode = buildCircuit(node.right);
        const inputIndex = node.operator === 'NOT' ? 0 : 1;
        const connection: Connection = {
          id: generateConnectionId(),
          from: {
            componentId: rightNode.component.id,
            connectionPointId: rightNode.outputPin,
          },
          to: {
            componentId: gateComp.id,
            connectionPointId: gateComp.inputs[inputIndex].id,
          },
          path: [],
          value: false,
        };
        connections.push(connection);
      }
      
      return gateNode;
    }
    
    throw new Error('Invalid expression node');
  }
  
  // Build the circuit
  const outputNode = buildCircuit(expressionTree);
  
  // Add output LED
  const ledComp = ComponentFactory.createComponent(
    'LED',
    { x: 0, y: 0 },
    generateId('output')
  );
  ledComp.label = 'Output';
  components.push(ledComp);
  
  const outputConnection: Connection = {
    id: generateConnectionId(),
    from: {
      componentId: outputNode.component.id,
      connectionPointId: outputNode.outputPin,
    },
    to: {
      componentId: ledComp.id,
      connectionPointId: ledComp.inputs[0].id,
    },
    path: [],
    value: false,
  };
  connections.push(outputConnection);
  
  // Calculate layout
  calculateLayout(componentNodes, variables);
  ledComp.position = {
    x: 100 + componentNodes.length * 150,
    y: 100,
  };
  
  return {
    components,
    connections,
    inputVariables: variables,
    outputVariable: 'Output',
  };
}

/**
 * Optimize circuit by combining redundant gates
 * (Future enhancement)
 */
export function optimizeCircuit(
  components: Component[],
  connections: Connection[]
): { components: Component[]; connections: Connection[] } {
  // TODO: Implement circuit optimization
  // - Remove redundant gates
  // - Simplify double NOT gates
  // - Combine parallel gates
  
  return { components, connections };
}

/**
 * Calculate circuit complexity metrics
 */
export function calculateCircuitMetrics(components: Component[]): {
  gateCount: number;
  notGateCount: number;
  depth: number;
  inputCount: number;
  outputCount: number;
} {
  const gates = components.filter(c => 
    ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR'].includes(c.type)
  );
  
  const notGates = components.filter(c => c.type === 'NOT');
  const inputs = components.filter(c => c.type === 'SWITCH' || c.type === 'HIGH_CONSTANT' || c.type === 'LOW_CONSTANT');
  const outputs = components.filter(c => c.type === 'LED');
  
  // Calculate depth (longest path from input to output)
  // Simplified version - actual depth would need connection analysis
  const depth = Math.ceil(gates.length / inputs.length);
  
  return {
    gateCount: gates.length,
    notGateCount: notGates.length,
    depth,
    inputCount: inputs.length,
    outputCount: outputs.length,
  };
}
