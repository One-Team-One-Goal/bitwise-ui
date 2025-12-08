/**
 * Expression Deriver - Derives Boolean expressions from circuit connections
 * Traces from output components (LEDs) back through gates to input components (Switches)
 */

import type { Component, Connection, ComponentType } from '../types';

export interface DerivedExpression {
  outputId: string;
  outputLabel: string;
  expression: string;
  outputValue: boolean;
}

/**
 * Get the operator symbol for a gate type
 */
function getGateOperator(type: ComponentType): string {
  switch (type) {
    case 'AND':
    case 'NAND':
      return '∧';
    case 'OR':
    case 'NOR':
      return '∨';
    case 'XOR':
      return '⊕';
    case 'XNOR':
      return '⊙';
    case 'NOT':
    case 'BUFFER':
      return '';
    default:
      return '?';
  }
}

/**
 * Get a label for an output component
 */
function getOutputLabel(component: Component, index: number): string {
  if (component.label) {
    return component.label;
  }
  
  switch (component.type) {
    case 'LED':
      return component.properties?.label || `Y${index}`;
    case 'SEVEN_SEGMENT':
      return component.properties?.label || `SEG${index}`;
    case 'DIGITAL_DISPLAY':
      return component.properties?.label || `OUT${index}`;
    default:
      return `OUT${index}`;
  }
}

/**
 * Trace the expression backwards from a component's input
 */
function traceExpression(
  componentId: string,
  connectionPointId: string,
  components: Component[],
  connections: Connection[],
  visited: Set<string>,
  inputLabels: Map<string, string>
): string {
  // Prevent infinite loops in feedback circuits
  const visitKey = `${componentId}:${connectionPointId}`;
  if (visited.has(visitKey)) {
    return '...'; // Feedback loop detected
  }
  visited.add(visitKey);

  const component = components.find(c => c.id === componentId);
  if (!component) return '?';

  // Check if this is an input component (source of signal)
  const inputTypes: ComponentType[] = ['SWITCH', 'PUSH_BUTTON', 'HIGH_CONSTANT', 'LOW_CONSTANT', 'CLOCK'];
  if (inputTypes.includes(component.type)) {
    // Get the pre-assigned label for this input (should always exist from deriveCircuitExpressions)
    let label = inputLabels.get(componentId);
    if (!label) {
      // Fallback: assign next available letter if somehow not pre-assigned
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const existingLabels = Array.from(inputLabels.values());
      let index = 0;
      while (index < alphabet.length && existingLabels.includes(alphabet[index])) {
        index++;
      }
      label = index < alphabet.length ? alphabet[index] : `X${index - alphabet.length + 1}`;
      inputLabels.set(componentId, label);
    }
    return label;
  }

  // For gate components, trace back through their inputs
  const gateTypes: ComponentType[] = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR', 'BUFFER'];
  if (gateTypes.includes(component.type)) {
    // Find all connections feeding into this component's inputs
    const inputConnections = connections.filter(
      conn => conn.to.componentId === componentId
    );

    if (inputConnections.length === 0) {
      // No inputs connected - floating input
      return '?';
    }

    // Trace each input
    const inputExpressions: string[] = [];
    for (const conn of inputConnections) {
      const expr = traceExpression(
        conn.from.componentId,
        conn.from.connectionPointId,
        components,
        connections,
        new Set(visited), // Create new set to allow parallel branches
        inputLabels
      );
      inputExpressions.push(expr);
    }

    // Handle NOT and BUFFER (single input)
    if (component.type === 'NOT') {
      const input = inputExpressions[0] || '?';
      // Use ¬ notation for calculator compatibility
      if (input.length === 1 || /^[A-Z]\d*$/i.test(input)) {
        return `¬${input}`;
      }
      // For complex expressions, wrap in parentheses
      return `¬(${input})`;
    }

    if (component.type === 'BUFFER') {
      return inputExpressions[0] || '?';
    }

    // Handle multi-input gates
    const operator = getGateOperator(component.type);
    const isNandNorXnor = component.type === 'NAND' || component.type === 'NOR' || component.type === 'XNOR';

    // Join inputs with operator
    let result = inputExpressions.join(` ${operator} `);
    
    // Add parentheses if there are multiple inputs
    if (inputExpressions.length > 1) {
      result = `(${result})`;
    }

    // Add inversion for NAND, NOR, XNOR using ¬ notation
    if (isNandNorXnor) {
      result = `¬${result}`;
    }

    return result;
  }

  // For output components (LED, etc.), trace their single input
  const outputTypes: ComponentType[] = ['LED', 'SEVEN_SEGMENT', 'DIGITAL_DISPLAY'];
  if (outputTypes.includes(component.type)) {
    // Find the connection feeding this output's input
    const inputConnection = connections.find(
      conn => conn.to.componentId === componentId
    );

    if (!inputConnection) {
      return '?'; // No input connected
    }

    return traceExpression(
      inputConnection.from.componentId,
      inputConnection.from.connectionPointId,
      components,
      connections,
      visited,
      inputLabels
    );
  }

  // Unknown component type
  return '?';
}

/**
 * Derive boolean expressions for all output components in the circuit
 */
export function deriveCircuitExpressions(
  components: Component[],
  connections: Connection[]
): DerivedExpression[] {
  const expressions: DerivedExpression[] = [];
  const inputLabels = new Map<string, string>();

  // First pass: assign labels to all input components in order of their position (top to bottom, left to right)
  const inputTypes: ComponentType[] = ['SWITCH', 'PUSH_BUTTON', 'HIGH_CONSTANT', 'LOW_CONSTANT', 'CLOCK'];
  const inputComponents = components
    .filter(c => inputTypes.includes(c.type))
    .sort((a, b) => {
      // Sort by Y position first (top to bottom), then by X (left to right)
      if (Math.abs(a.position.y - b.position.y) > 20) {
        return a.position.y - b.position.y;
      }
      return a.position.x - b.position.x;
    });

  // Assign labels A, B, C, D, E... to inputs (always use variable letters, not custom labels)
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  inputComponents.forEach((comp, index) => {
    // Always use alphabetic variable names for expressions
    if (index < alphabet.length) {
      inputLabels.set(comp.id, alphabet[index]);
    } else {
      inputLabels.set(comp.id, `X${index - alphabet.length + 1}`);
    }
  });

  // Find all output components (LEDs, etc.)
  const outputTypes: ComponentType[] = ['LED', 'SEVEN_SEGMENT', 'DIGITAL_DISPLAY'];
  const outputComponents = components
    .filter(c => outputTypes.includes(c.type))
    .sort((a, b) => {
      // Sort by Y position first (top to bottom), then by X (left to right)
      if (Math.abs(a.position.y - b.position.y) > 20) {
        return a.position.y - b.position.y;
      }
      return a.position.x - b.position.x;
    });

  // Derive expression for each output
  outputComponents.forEach((outputComp, index) => {
    // Check if this output has any input connections
    const hasConnection = connections.some(
      conn => conn.to.componentId === outputComp.id
    );

    if (!hasConnection) {
      return; // Skip outputs with no connections
    }

    const visited = new Set<string>();
    const expression = traceExpression(
      outputComp.id,
      outputComp.inputs[0]?.id || '',
      components,
      connections,
      visited,
      inputLabels
    );

    // Get the current output value (from the input connection or component state)
    const inputConnection = connections.find(
      conn => conn.to.componentId === outputComp.id
    );
    const outputValue = inputConnection?.value ?? false;

    expressions.push({
      outputId: outputComp.id,
      outputLabel: getOutputLabel(outputComp, index),
      expression: expression || '?',
      outputValue
    });
  });

  return expressions;
}

/**
 * Format expression for display (using calculator-compatible notation)
 */
export function formatExpression(expression: string): string {
  // The expression is already in calculator format (∧, ∨, ¬)
  // Just clean up any extra spaces
  return expression
    .replace(/\s+/g, ' ')          // Collapse multiple spaces
    .replace(/\(\s+/g, '(')        // Clean up spaces after open paren
    .replace(/\s+\)/g, ')')        // Clean up spaces before close paren
    .trim();
}

/**
 * Format expression for display in simplified notation (for UI display)
 */
export function formatExpressionSimplified(expression: string): string {
  // Convert to simpler notation for display
  return expression
    .replace(/∧/g, '·')            // AND as dot
    .replace(/∨/g, '+')            // OR as plus
    .replace(/¬/g, "'")            // NOT as prime (postfix style for single vars)
    .replace(/⊕/g, '⊕')            // XOR stays same
    .replace(/⊙/g, '⊙')            // XNOR stays same
    .replace(/\s+/g, ' ')          // Collapse multiple spaces
    .replace(/\(\s+/g, '(')        // Clean up spaces
    .replace(/\s+\)/g, ')')
    .trim();
}
