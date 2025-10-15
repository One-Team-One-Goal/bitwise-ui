import React from 'react'
import { BookOpen } from 'lucide-react'

const GATE_COLORS: Record<string, string> = {
  AND: '#34d399',
  OR: '#60a5fa',
  NOT: '#fbbf24',
  NAND: '#f472b6',
  NOR: '#a78bfa',
  XOR: '#f87171',
  XNOR: '#818cf8',
}

function getGateColor(type: string) {
  return GATE_COLORS[type.toUpperCase()] || '#d1d5db'
}

const CircuitRenderer = ({ circuit }: { circuit: any }) => {
  // Layout helpers
  const inputCount = circuit.inputs.length
  const gateCount = circuit.gates.length

  // Map signal names to x/y positions
  const signalPositions: Record<string, { x: number; y: number }> = {}

  // Inputs: left side
  circuit.inputs.forEach((input: string, idx: number) => {
    signalPositions[input] = { x: 40, y: 60 + idx * 60 }
  })

  // Gates: middle, spaced vertically
  circuit.gates.forEach((gate: any, idx: number) => {
    signalPositions[gate.output] = { x: 220, y: 60 + idx * 80 }
  })

  // Final output: right side
  signalPositions[circuit.finalOutput] = { x: 400, y: 60 + gateCount * 40 }

  // Helper to find y position for a signal (input or gate output)
  const getSignalY = (signal: string) =>
    signalPositions[signal]?.y ?? 60

  // SVG height
  const svgHeight = Math.max(
    60 + Math.max(inputCount, gateCount) * 80,
    200
  )

  return (
    <div className="my-4 p-4 bg-gray-50 rounded-lg border overflow-x-auto">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-5 h-5 text-orange-600" />
        <h4 className="font-semibold text-gray-800">{circuit.caption || 'Circuit Diagram'}</h4>
      </div>
      <svg width={480} height={svgHeight} style={{ minWidth: 480 }}>
        {/* Draw inputs */}
        {circuit.inputs.map((input: string, idx: number) => (
          <g key={input}>
            {/* Input circle */}
            <circle
              cx={40}
              cy={60 + idx * 60}
              r={18}
              fill="#f3f4f6"
              stroke="#6b7280"
              strokeWidth={2}
            />
            <text
              x={40}
              y={60 + idx * 60 + 5}
              textAnchor="middle"
              fontWeight="bold"
              fontSize={16}
              fill="#374151"
            >
              {input}
            </text>
            {/* Wire to gates */}
            <line
              x1={58}
              y1={60 + idx * 60}
              x2={100}
              y2={60 + idx * 60}
              stroke="#6b7280"
              strokeWidth={2}
            />
          </g>
        ))}

        {/* Draw gates */}
        {circuit.gates.map((gate: any, idx: number) => {
          const gateY = 60 + idx * 80
          return (
            <g key={gate.output}>
              {/* Gate rectangle */}
              <rect
                x={180}
                y={gateY - 25}
                width={80}
                height={50}
                rx={10}
                fill={getGateColor(gate.type)}
                stroke="#374151"
                strokeWidth={2}
              />
              {/* Gate type label */}
              <text
                x={220}
                y={gateY + 6}
                textAnchor="middle"
                fontWeight="bold"
                fontSize={18}
                fill="#1f2937"
              >
                {gate.type}
              </text>
              {/* Output label */}
              <text
                x={265}
                y={gateY + 22}
                fontSize={12}
                fill="#6b7280"
              >
                {gate.output}
              </text>
              {/* Wires from inputs to gate */}
              {gate.inputs.map((input: string, i: number) => (
                <line
                  key={input}
                  x1={100}
                  y1={getSignalY(input)}
                  x2={180}
                  y2={gateY - 10 + i * 20}
                  stroke="#6b7280"
                  strokeWidth={2}
                  markerEnd="url(#arrowhead)"
                />
              ))}
              {/* Wire from gate to output signal */}
              <line
                x1={260}
                y1={gateY}
                x2={signalPositions[gate.output].x + 40}
                y2={signalPositions[gate.output].y}
                stroke="#6b7280"
                strokeWidth={2}
                markerEnd="url(#arrowhead)"
              />
            </g>
          )
        })}

        {/* Draw output circle */}
        <circle
          cx={signalPositions[circuit.finalOutput].x}
          cy={signalPositions[circuit.finalOutput].y}
          r={18}
          fill="#f3f4f6"
          stroke="#6b7280"
          strokeWidth={2}
        />
        <text
          x={signalPositions[circuit.finalOutput].x}
          y={signalPositions[circuit.finalOutput].y + 5}
          textAnchor="middle"
          fontWeight="bold"
          fontSize={16}
          fill="#374151"
        >
          {circuit.finalOutput}
        </text>
        {/* Wire from last gate to output */}
        {(() => {
          // Find the gate whose output is the finalOutput
          const lastGate = circuit.gates.find(
            (g: any) => g.output === circuit.finalOutput
          )
          if (!lastGate) return null
          const gateY = signalPositions[lastGate.output].y
          return (
            <line
              x1={signalPositions[lastGate.output].x + 40}
              y1={gateY}
              x2={signalPositions[circuit.finalOutput].x - 18}
              y2={signalPositions[circuit.finalOutput].y}
              stroke="#6b7280"
              strokeWidth={2}
              markerEnd="url(#arrowhead)"
            />
          )
        })()}

        {/* Arrowhead marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="8"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon points="0 0, 8 4, 0 8" fill="#6b7280" />
          </marker>
        </defs>
      </svg>
    </div>
  )
}

export default CircuitRenderer