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
 * Universal layout strategy: 
 * - All inputs (switches, constants) in leftmost column (depth 0)
 * - All gates positioned ahead/forward from inputs
 * - NOT gates at intermediate positions (depth + 0.6)
 * - Other gates at full depth increments (depth + 1)
 * - Clean left-to-right signal flow
 */
function calculateLayout(
  componentNodes: ComponentNode[],
  _inputVariables: string[]
): void {
  const HORIZONTAL_SPACING = 200;  // Spacing between layers (left to right)
  const VERTICAL_SPACING = 80;     // Spacing between components in same layer
  const START_X = 100;             // Starting X position (leftmost column)
  const START_Y = 300;             // Center Y position in canvas
  
  // Build a map of component to its depth
  const depthMap = new Map<ComponentNode, number>();
  
  // Calculate depth for each component
  // Strategy: All inputs at depth 0 (leftmost column), gates positioned forward from there
  function assignDepth(compNode: ComponentNode, visited = new Set<ComponentNode>()): number {
    if (visited.has(compNode)) return 0;
    visited.add(compNode);
    
    if (depthMap.has(compNode)) {
      return depthMap.get(compNode)!;
    }
    
    // Base case: ALL input variables and constants ALWAYS at depth 0 (leftmost column)
    if (compNode.node.type === 'variable' || compNode.node.type === 'constant') {
      depthMap.set(compNode, 0);
      return 0;
    }
    
    // For operators, calculate depth from their deepest input
    if (compNode.node.type === 'operator') {
      let maxChildDepth = 0; // Start at 0 (inputs are at depth 0)
      
      // Find child components and get their max depth
      componentNodes.forEach(childNode => {
        if (compNode.node.left === childNode.node || compNode.node.right === childNode.node) {
          const childDepth = assignDepth(childNode, visited);
          maxChildDepth = Math.max(maxChildDepth, childDepth);
        }
      });
      
      // All gates are positioned ahead of inputs
      // NOT gates: positioned closer to inputs (faster depth increment)
      // Other gates: full depth increment for clear separation
      if (compNode.node.operator === 'NOT') {
        // NOT gates at depth + 0.6 (60% of spacing forward)
        const depth = maxChildDepth + 0.6;
        depthMap.set(compNode, depth);
        return depth;
      }
      
      // All other gates (AND, OR, XOR, etc.) at full depth increment
      const depth = maxChildDepth + 1;
      depthMap.set(compNode, depth);
      return depth;
    }
    
    // Default fallback
    const depth = 1;
    depthMap.set(compNode, depth);
    return depth;
  }
  
  // Assign depths to all components
  componentNodes.forEach(node => assignDepth(node));
  
  // Group components by depth (handle fractional depths for NOT gates)
  const layers = new Map<number, ComponentNode[]>();
  componentNodes.forEach(compNode => {
    const depth = depthMap.get(compNode) || 0;
    if (!layers.has(depth)) {
      layers.set(depth, []);
    }
    layers.get(depth)!.push(compNode);
  });
  
  // Sort layers by depth
  const sortedDepths = Array.from(layers.keys()).sort((a, b) => a - b);
  
  // Position components layer by layer with vertical centering
  sortedDepths.forEach((depth) => {
    const layerNodes = layers.get(depth)!;
    const x = START_X + depth * HORIZONTAL_SPACING;
    
    // Sort nodes in this layer alphabetically if they're variables
    layerNodes.sort((a, b) => {
      if (a.node.type === 'variable' && b.node.type === 'variable') {
        return a.node.value.localeCompare(b.node.value);
      }
      return 0;
    });
    
    // Calculate total height needed for this layer
    const totalHeight = (layerNodes.length - 1) * VERTICAL_SPACING;
    const startY = START_Y - totalHeight / 2;
    
    // Position each component in this layer, centered vertically
    layerNodes.forEach((compNode, index) => {
      const y = startY + index * VERTICAL_SPACING;
      compNode.component.position = { x, y };
    });
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
  
  // Create input switches for each variable (but don't add to components yet)
  const inputComponents: Map<string, ComponentNode> = new Map();
  variables.forEach(variable => {
    const inputComp = ComponentFactory.createComponent(
      'SWITCH',
      { x: 0, y: 0 }, // Will be positioned later
      generateId('input')
    );
    inputComp.label = variable;
    
    const inputNode: ComponentNode = {
      id: inputComp.id,
      component: inputComp,
      node: { type: 'variable', value: variable },
      outputPin: inputComp.outputs[0].id,
    };
    inputComponents.set(variable, inputNode);
  });
  
  // Track which components are actually used
  const usedComponents = new Set<string>();
  
  // Recursively build circuit from expression tree
  function buildCircuit(node: ExpressionNode): ComponentNode {
    // Variable leaf node - return existing input component
    if (node.type === 'variable') {
      const inputNode = inputComponents.get(node.value);
      if (!inputNode) {
        throw new Error(`Variable ${node.value} not found in inputs`);
      }
      // Mark this component as used
      usedComponents.add(inputNode.component.id);
      // Add to components array if not already added
      if (!components.find(c => c.id === inputNode.component.id)) {
        components.push(inputNode.component);
        componentNodes.push(inputNode);
      }
      return inputNode;
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
      
      // Connect inputs (path will be calculated after layout)
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
          path: [], // Will be calculated after layout
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
          path: [], // Will be calculated after layout
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
  
  // Create LED connection (path will be calculated after layout)
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
    path: [], // Will be calculated after layout
    value: false,
  };
  connections.push(outputConnection);
  
  // Calculate layout for all components
  calculateLayout(componentNodes, variables);
  
  // Position LED: Find the rightmost component and place LED 200px to its right
  // Also align it vertically with the output node
  const maxX = Math.max(...componentNodes.map(cn => cn.component.position.x));
  
  ledComp.position = {
    x: maxX + 200,  // 200px to the right of rightmost component
    y: outputNode.component.position.y,  // Aligned with output
  };
  
  // Update all connection paths after positioning
  connections.forEach(conn => {
    const fromComp = components.find(c => c.id === conn.from.componentId);
    const toComp = components.find(c => c.id === conn.to.componentId);
    
    if (fromComp && toComp) {
      const fromPin = fromComp.outputs.find(p => p.id === conn.from.connectionPointId);
      const toPin = toComp.inputs.find(p => p.id === conn.to.connectionPointId);
      
      if (fromPin && toPin) {
        const startX = fromComp.position.x + fromPin.position.x;
        const startY = fromComp.position.y + fromPin.position.y;
        const endX = toComp.position.x + toPin.position.x;
        const endY = toComp.position.y + toPin.position.y;
        
        // Simple straight line path
        conn.path = [
          { x: startX, y: startY },
          { x: endX, y: endY }
        ];
      }
    }
  });
  
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
