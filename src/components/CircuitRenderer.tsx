// ...existing code...
import { BookOpen } from 'lucide-react'

// Use CSS custom properties for gate colors to support dark mode
const GATE_COLORS: Record<string, string> = {
  AND: 'var(--color-greenz)',      // Green for AND
  OR: 'var(--color-bluez)',        // Blue for OR
  NOT: 'var(--color-yellowz)',     // Yellow for NOT
  NAND: 'var(--color-lightpurple)', // Light purple for NAND
  NOR: 'var(--color-darkpurple)',  // Dark purple for NOR
  XOR: 'var(--color-redz)',        // Red for XOR
  XNOR: 'var(--color-cyanz)',      // Cyan for XNOR
  BUFFER: 'var(--color-grayz)',    // Gray for BUFFER
}

function getGateColor(type: string) {
  return GATE_COLORS[type.toUpperCase()] || 'var(--color-grayz)'
}

// Color palette for input wires - distinct colors for each input variable
const WIRE_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

function getWireColor(inputName: string, allInputs: string[]): string {
  const index = allInputs.indexOf(inputName)
  return index >= 0 ? WIRE_COLORS[index % WIRE_COLORS.length] : '#6b7280' // gray fallback
}

interface Gate {
  id: string
  type: string
  inputs: string[]
  output: string
  position?: { x: number; y: number } // New: grid position for layout
}

interface Circuit {
  inputs: string[]
  gates: Gate[]
  outputs?: string[]        // optional: older format
  finalOutput?: string     // preferred per prompt (single final output)
  caption?: string
  connections?: Array<{ from: string; to: string }>
}

const CircuitRenderer = ({ circuit }: { circuit: Circuit }) => {
  // Guard clause for missing circuit data
  if (!circuit || !circuit.inputs || !circuit.gates) {
    return (
      <div className="my-4 p-4 bg-destructive/10 dark:bg-destructive/20 rounded-lg border border-destructive/30">
        <p className="text-destructive">Invalid circuit data provided</p>
      </div>
    )
  }

  // Build list of output signals (support both outputs array and finalOutput)
  const outputSignals: string[] = circuit.outputs && circuit.outputs.length > 0
    ? circuit.outputs
    : circuit.finalOutput ? [circuit.finalOutput] : []

  const inputCount = circuit.inputs.length
  const gateCount = circuit.gates.length
  const outputCount = outputSignals.length

  // Map for quick lookup
  const gateMap: Record<string, Gate> = {}
  circuit.gates.forEach(g => (gateMap[g.id] = g))

  // Map output signal names to their source gate ID
  const signalSource: Record<string, string> = {}
  circuit.gates.forEach(g => {
    if (g.output) signalSource[g.output] = g.id
  })

  // Check if gates have position information (new format)
  const hasPositionData = circuit.gates.some(g => g.position !== undefined)

  // Calculate depth/level for each gate for auto-layout (only if no position data)
  const gateLevels: Record<string, number> = {}
  
  if (!hasPositionData) {
    const getGateLevel = (gateId: string, visited = new Set<string>()): number => {
      if (visited.has(gateId)) return 0 // Cycle detected
      if (gateLevels[gateId] !== undefined) return gateLevels[gateId]
      
      visited.add(gateId)
      const gate = gateMap[gateId]
      let maxInputLevel = -1 // -1 means input is from global inputs
      
      gate.inputs.forEach(input => {
        const sourceGateId = signalSource[input]
        if (sourceGateId) {
          const level = getGateLevel(sourceGateId, new Set(visited))
          maxInputLevel = Math.max(maxInputLevel, level)
        }
      })
      
      const level = maxInputLevel + 1
      gateLevels[gateId] = level
      return level
    }

    // Calculate levels for all gates
    circuit.gates.forEach(g => getGateLevel(g.id))
  }
  
  const maxLevel = hasPositionData ? 0 : Math.max(0, ...Object.values(gateLevels))

  // Positions: keys can be input names, gate ids (for gate body), and output signal names
  const positions: Record<string, { x: number; y: number; type: 'input' | 'gate' | 'output' }> = {}

  // Layout constants
  const leftX = 60
  const rightX = 600 // Increased width
  const midX = (leftX + rightX) / 2
  const rowSpacing = 100
  const topOffset = 80
  const levelWidth = (rightX - leftX) / (maxLevel + 2) // Distribute columns

  // Grid-based layout parameters (for new position format)
  const gridCellWidth = 140
  const gridCellHeight = 100
  const gridOffsetX = 80
  const gridOffsetY = 80

  // Position inputs (left column)
  if (hasPositionData) {
    // Use explicit input positioning if gates have positions
    circuit.inputs.forEach((input, idx) => {
      positions[input] = {
        x: gridOffsetX,
        y: gridOffsetY + idx * gridCellHeight,
        type: 'input',
      }
    })
  } else {
    // Original auto-layout for inputs
    circuit.inputs.forEach((input, idx) => {
      positions[input] = {
        x: leftX,
        y: topOffset + idx * rowSpacing,
        type: 'input',
      }
    })
  }

  // Group gates by level
  const gatesByLevel: Record<number, Gate[]> = {}
  
  if (hasPositionData) {
    // Use explicit position data from gates
    circuit.gates.forEach(gate => {
      if (gate.position) {
        const x = gridOffsetX + gate.position.x * gridCellWidth
        const y = gridOffsetY + gate.position.y * gridCellHeight
        
        positions[gate.id] = { x, y, type: 'gate' }
        
        // Also map the output signal to this gate's position (for connections)
        if (gate.output) {
          positions[gate.output] = { x, y, type: 'gate' }
        }
      }
    })
  } else {
    // Original auto-layout based on levels
    circuit.gates.forEach(g => {
      const level = gateLevels[g.id] || 0
      if (!gatesByLevel[level]) gatesByLevel[level] = []
      gatesByLevel[level].push(g)
    })

    // Position gates based on level with vertical staggering to avoid wire overlap
    Object.entries(gatesByLevel).forEach(([levelStr, gates]) => {
      const level = parseInt(levelStr)
      const x = leftX + (level + 1) * levelWidth
      
      gates.forEach((gate, idx) => {
        // Add more vertical spacing and stagger based on both index and level
        const baseY = topOffset + idx * rowSpacing
        const levelStagger = (level % 2) * 40 // Alternate levels offset by 40px
        const y = baseY + levelStagger
        
        positions[gate.id] = { x, y, type: 'gate' }
        
        if (gate.output) {
          positions[gate.output] = { x, y, type: 'gate' }
        }
      })
    })
  }

  // Position outputs (right column)
  for (let idx = 0; idx < outputSignals.length; idx++) {
    const output = outputSignals[idx]
    const sourceGateId = signalSource[output]
    const sourceGatePos = sourceGateId ? positions[sourceGateId] : null
    
    // Calculate rightmost position based on layout mode
    const outputX = hasPositionData ? gridOffsetX + (4 * gridCellWidth) : rightX + 50
    
    positions[output] = {
      x: outputX,
      y: sourceGatePos ? sourceGatePos.y : (hasPositionData ? gridOffsetY + idx * gridCellHeight : topOffset + idx * rowSpacing),
      type: 'output',
    }
  }

  // If there are explicit connections provided, ensure referenced nodes have positions.
  (circuit.connections || []).forEach(conn => {
    if (!positions[conn.from] && circuit.gates.find(g => g.output === conn.from)) {
      // If from is a gate output, align with its gate
      const source = circuit.gates.find(g => g.output === conn.from)!
      positions[conn.from] = { x: midX + 120, y: positions[source.id].y, type: 'gate' } // additional anchor
    }
    if (!positions[conn.to] && circuit.gates.find(g => g.id === conn.to)) {
      positions[conn.to] = positions[conn.to] || { x: midX, y: topOffset, type: 'gate' }
    }
  })

  // SVG sizes - adjust based on layout mode
  const svgWidth = hasPositionData 
    ? Math.max(700, gridOffsetX + (5 * gridCellWidth)) 
    : Math.max(600, rightX + 80)
  const maxRows = Math.max(inputCount, gateCount, outputCount)
  const svgHeight = hasPositionData
    ? Math.max(400, gridOffsetY + maxRows * gridCellHeight + 50)
    : Math.max(250, topOffset + maxRows * rowSpacing)

  // Helper: bezier path for nice curved wires with increased tension
  const bezier = (
    x1: number, 
    y1: number, 
    x2: number, 
    y2: number, 
    curvature = 0.65, // Increased from 0.5 for more horizontal travel
    verticalOffset = 0 // For vertical fanning
  ) => {
    const dx = Math.max(60, Math.abs(x2 - x1) * curvature) // Increased minimum from 40
    const c1x = x1 + dx
    const c2x = x2 - dx
    // Apply vertical offset to control points for fanning effect
    const c1y = y1 + verticalOffset * 0.3
    const c2y = y2 + verticalOffset * 0.3
    return `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`
  }

  // Draw connection between arbitrary named nodes (input/gate/output)
  const drawConnection = (fromId: string, toId: string, inputIndex = 0, totalInputs = 1) => {
    const from = positions[fromId]
    const to = positions[toId]
    if (!from || !to) return null

    let startX = from.x
    let startY = from.y
    let endX = to.x
    let endY = to.y

    // Determine wire color based on the source
    let wireColor: string
    let markerId: string
    
    if (from.type === 'gate') {
      // Wire coming from a gate output - use the gate's color
      const sourceGate = circuit.gates.find(g => g.id === fromId || g.output === fromId)
      if (sourceGate) {
        wireColor = getGateColor(sourceGate.type)
        markerId = `arrowhead-gate-${sourceGate.type}`
      } else {
        wireColor = '#6b7280'
        markerId = 'arrowhead-intermediate'
      }
    } else if (from.type === 'input' && circuit.inputs.includes(fromId)) {
      // Wire from input variable - use input color
      wireColor = getWireColor(fromId, circuit.inputs)
      markerId = `arrowhead-${fromId}`
    } else {
      // Default for other cases
      wireColor = '#6b7280'
      markerId = 'arrowhead-intermediate'
    }
    
    // Offset start to the right of inputs / right edge of gates
    if (from.type === 'input') {
      startX += 20
    } else if (from.type === 'gate') {
      startX += 50
    } else if (from.type === 'output') {
      startX -= 20
    }

    // Offset end towards left edge of gates or left of outputs
    if (to.type === 'gate') {
      endX -= 50
      // stagger multiple input pins on the gate's left side
      const spacing = 60 / (totalInputs + 1)
      endY = endY - 30 + spacing * (inputIndex + 1)
    } else if (to.type === 'output') {
      endX -= 20
    } else if (to.type === 'input') {
      endX -= 20
    }

    // Calculate vertical offset for fanning (spreads parallel wires)
    const fanningFactor = totalInputs > 1 ? (inputIndex - (totalInputs - 1) / 2) * 8 : 0
    
    const pathD = bezier(startX, startY, endX, endY, 0.65, fanningFactor)
    
    return (
      <g key={`${fromId}-${toId}-${inputIndex}`}>
        {/* Wire Halo: thick background-colored stroke for visual separation */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--background)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeOpacity={1}
        />
        {/* Actual wire */}
        <path
          d={pathD}
          fill="none"
          stroke={wireColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeOpacity={0.85}
          markerEnd={`url(#${markerId})`}
        />
      </g>
    )
  }

  return (
    <div className="my-4 p-4 bg-muted/30 dark:bg-muted/20 rounded-lg border border-border overflow-x-auto">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-5 h-5 text-(--color-orangez)" />
        <h4 className="font-semibold text-card-foreground">{circuit.caption || 'Circuit Diagram'}</h4>
      </div>

      <svg width={svgWidth} height={svgHeight} style={{ minWidth: svgWidth }}>
        <defs>
          {/* Create colored arrowhead markers for each input */}
          {circuit.inputs.map((input) => {
            const color = getWireColor(input, circuit.inputs)
            return (
              <marker
                key={`marker-${input}`}
                id={`arrowhead-${input}`}
                markerWidth="10"
                markerHeight="10"
                refX="10"
                refY="5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 10 5, 0 10" fill={color} fillOpacity="0.85" />
              </marker>
            )
          })}
          
          {/* Create colored arrowhead markers for each gate type */}
          {['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR', 'BUFFER'].map((gateType) => {
            const color = getGateColor(gateType)
            return (
              <marker
                key={`marker-gate-${gateType}`}
                id={`arrowhead-gate-${gateType}`}
                markerWidth="10"
                markerHeight="10"
                refX="10"
                refY="5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 10 5, 0 10" fill={color} fillOpacity="0.9" />
              </marker>
            )
          })}
          
          {/* Gray arrowhead for intermediate signals */}
          <marker
            id="arrowhead-intermediate"
            markerWidth="10"
            markerHeight="10"
            refX="10"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon points="0 0, 10 5, 0 10" fill="#6b7280" fillOpacity="0.85" />
          </marker>

          {/* small soft shadow for wires */}
          <filter id="wire-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="var(--foreground)" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Draw connections from inputs -> gates */}
        {circuit.gates.map(gate =>
          gate.inputs.map((inputSignal, inputIdx) => drawConnection(inputSignal, gate.id, inputIdx, gate.inputs.length))
        )}

        {/* Draw explicit connections if present */}
        {(circuit.connections || []).map((c) => drawConnection(c.from, c.to, 0, 1))}

        {/* Draw connections from gates -> outputs (if mapping exists) */}
        {outputSignals.map(output => {
          const sourceGate = circuit.gates.find(g => g.output === output)
          if (sourceGate) {
            return drawConnection(sourceGate.id, output)
          }
          return null
        })}

        {/* Render inputs */}
        {circuit.inputs.map(input => {
          const pos = positions[input]
          if (!pos) return null
          return (
            <g key={input}>
              <circle cx={pos.x} cy={pos.y} r={20} fill="var(--muted)" stroke="var(--border)" strokeWidth={2.5} />
              <text x={pos.x} y={pos.y + 6} textAnchor="middle" fontWeight="bold" fontSize={18} fill="var(--foreground)">
                {input}
              </text>
            </g>
          )
        })}

        {/* Render gates */}
        {circuit.gates.map(gate => {
          const pos = positions[gate.id]
          if (!pos) return null
          const gateWidth = 110
          const gateHeight = 60
          const fill = getGateColor(gate.type)
          return (
            <g key={gate.id}>
              {/* Gate body */}
              <rect
                x={pos.x - gateWidth / 2}
                y={pos.y - gateHeight / 2}
                width={gateWidth}
                height={gateHeight}
                rx={10}
                fill={fill}
                fillOpacity={0.9}
                stroke="var(--foreground)"
                strokeWidth={2.5}
                strokeOpacity={0.6}
              />
              {/* Gate type */}
              <text x={pos.x} y={pos.y - 6} textAnchor="middle" fontWeight="bold" fontSize={16} fill="var(--background)">
                {gate.type}
              </text>
              {/* Gate id */}
              <text x={pos.x} y={pos.y + 14} textAnchor="middle" fontSize={11} fontWeight="600" fill="#111827">
                {gate.id}
              </text>

              {/* Input terminal dots (visual anchors) */}
              {gate.inputs.map((_inp, i) => {
                const spacing = 60 / (gate.inputs.length + 1)
                const terminalY = pos.y - gateHeight / 2 + spacing * (i + 1)
                const terminalX = pos.x - gateWidth / 2 + 10
                return <circle key={i} cx={terminalX} cy={terminalY} r={3.5} fill="#111827" />
              })}

              {/* Output tiny marker */}
              <circle cx={pos.x + gateWidth / 2 - 8} cy={pos.y} r={4} fill="#111827" />
              {/* Output label near gate */}
              <text
                x={pos.x + gateWidth / 2 + 6}
                y={pos.y + 4}
                textAnchor="start"
                fontSize={11}
                fill="#475569"
                fontWeight={600}
              >
                {gate.output}
              </text>
            </g>
          )
        })}

        {/* Render outputs (right column). Support multiple outputs and finalOutput */}
        {outputSignals.map(output => {
          const pos = positions[output]
          if (!pos) return null
          // Use rounded rect for outputs for clearer look
          const ow = 56
          const oh = 32
          return (
            <g key={output}>
              <rect
                x={pos.x - ow / 2}
                y={pos.y - oh / 2}
                width={ow}
                height={oh}
                rx={8}
                fill="#fef3c7"
                stroke="#f59e0b"
                strokeWidth={2.5}
              />
              <text x={pos.x} y={pos.y + 6} textAnchor="middle" fontWeight="bold" fontSize={16} fill="#92400e">
                {output}
              </text>
            </g>
          )
        })}

        {/* If a gate produces a finalOutput and finalOutput is present, draw connecting wire if not already drawn */}
        {outputSignals.map(output => {
          const sourceGate = circuit.gates.find(g => g.output === output)
          if (!sourceGate) return null
          // Draw a connection from gate to output anchor if positions exist (this complements earlier path drawing)
          const from = positions[sourceGate.id]
          const to = positions[output]
          if (!from || !to) return null
          // Small check to avoid duplicate path keys (they will be same as earlier, but harmless)
          return (
            <path
              key={`link-${sourceGate.id}-${output}`}
              d={bezier(from.x + 50, from.y, to.x - 18, to.y)}
              fill="none"
              stroke="#374151"
              strokeWidth={2.5}
              strokeLinecap="round"
              markerEnd="url(#arrowhead)"
            />
          )
        })}
      </svg>
    </div>
  )
}

export default CircuitRenderer
// ...existing code...