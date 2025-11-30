import * as React from 'react'
import type { Component, ConnectionPoint } from '../types/index'
import { COMPONENT_DEFINITIONS } from '../utils/componentFactory'

interface ComponentRendererProps {
  component: Component
  isSelected: boolean
  onMouseDown: (event: React.MouseEvent) => void
  onConnectionPointClick: (
    connectionPointId: string,
    event: React.MouseEvent
  ) => void
  onClick?: (event: React.MouseEvent) => void
  circuitHook?: any
  currentTool?: string
}

// Memoize the component to prevent unnecessary re-renders
export const ComponentRenderer: React.FC<ComponentRendererProps> = React.memo(
  ({
    component,
    isSelected,
    onMouseDown,
    onConnectionPointClick,
    onClick,
    circuitHook,
    currentTool,
  }) => {
    const definition = COMPONENT_DEFINITIONS[component.type]

    const renderConnectionPoint = (point: ConnectionPoint, index: number) => {
      const isInput = point.type === 'input'
      const isWireMode = currentTool === 'wire'

      return (
        <div
          key={point.id}
          className={`absolute transition-all duration-200 group ${isWireMode ? 'z-30 cursor-crosshair' : 'z-5'}`}
          style={{
            left: isInput ? -8 : component.size.width - 8,
            top:
              ((index + 1) * component.size.height) /
                (isInput
                  ? component.inputs.length + 1
                  : component.outputs.length + 1) -
              8,
            pointerEvents: 'auto',
          }}
          onMouseDown={(e) => {
            if (isWireMode) {
              // Prevent component drag when preparing to wire
              e.stopPropagation()
            }
          }}
          onClick={(e) => {
            if (!isWireMode) {
              return
            }
            e.stopPropagation()
            onConnectionPointClick(point.id, e)
          }}
          title={`${point.type} ${index + 1} - ${point.value ? 'HIGH (1)' : 'LOW (0)'}${point.connected ? ' (Connected)' : ' (Available)'}`}
        >
          {/* Hover ring - enhanced visibility in wire mode */}
          <div
            className={`absolute inset-0 w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              isWireMode
                ? 'opacity-0 group-hover:opacity-100 scale-150 group-hover:scale-200'
                : 'opacity-0'
            } ${
              point.connected
                ? 'border-green-400'
                : point.value
                  ? 'border-red-400'
                  : 'border-blue-400'
            }`}
          />

          {/* Main connection point - MORE VISIBLE */}
          <div
            className={`relative w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              isWireMode ? 'group-hover:scale-150 group-hover:z-50' : ''
            } ${
              point.connected
                ? 'bg-green-500 border-green-600 shadow-lg shadow-green-500/50 opacity-100'
                : point.value
                  ? 'bg-red-500 border-red-600 shadow-md shadow-red-500/50 opacity-100'
                  : isWireMode
                    ? 'bg-blue-300 border-blue-500 opacity-90 group-hover:bg-blue-400 group-hover:border-blue-600 group-hover:shadow-lg group-hover:shadow-blue-500/50 group-hover:opacity-100'
                    : 'bg-gray-400 border-gray-500 opacity-70'
            }`}
          >
            {/* Inner glow for active states */}
            {(point.connected || point.value) && (
              <div
                className={`absolute inset-1 rounded-full animate-pulse ${
                  point.connected ? 'bg-green-300' : 'bg-red-300'
                } opacity-60`}
              />
            )}

            {/* Value indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`text-xs font-bold transition-opacity duration-200 ${
                  point.connected || point.value
                    ? 'text-background opacity-100'
                    : 'text-gray-600 opacity-0 group-hover:opacity-100'
                }`}
              >
                {point.value ? '1' : '0'}
              </span>
            </div>
          </div>

          {/* Connection status indicator */}
          {point.connected && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-background animate-pulse" />
          )}
        </div>
      )
    }

    const renderGateShape = () => {
      const { width, height } = component.size
      const strokeWidth = isSelected ? (3 / zoom) : (2 / zoom);

      switch (component.type) {
        case 'AND':
          return (
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
            >
              {/* AND gate - flat left side, curved right side */}
              <path
                d={`M15,10 L${width - 25},10 A${(width - 40) / 2},${(height - 20) / 2} 0 0,1 ${width - 25},${height - 10} L15,${height - 10} Z`}
                fill="var(--color-primary-foreground)"
                stroke={isSelected ? '#3b82f6' : 'var(--color-dotBlack)'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              {/* Input connection points visual guide */}
              <line
                x1="15"
                y1={height / 3}
                x2="8"
                y2={height / 3}
                stroke="black"
                strokeWidth="1"
              />
              <line
                x1="15"
                y1={(2 * height) / 3}cd 
                x2="8"
                y2={(2 * height) / 3}
                stroke="black"
                strokeWidth="1"
              />
              {/* Output connection point visual guide */}
              <line
                x1={width - 15}
                y1={height / 2}
                x2={width - 8}
                y2={height / 2}
                stroke="black"
                strokeWidth="1"
              />
            </svg>
          )

        case 'OR':
          return (
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
            >
              {/* OR gate - scaled to match AND gate size */}
              <path
                d={`M 15,10 Q ${width / 2 - 10},10 ${width - 25},${height / 2} Q ${width / 2 - 10},${height - 10} 15,${height - 10} Q 35,${height / 2} 15,10 Z`}
                fill="var(--color-primary-foreground)"
                stroke={isSelected ? '#3b82f6' : 'var(--color-dotBlack)'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              {/* Input connection points visual guide */}
              <line
                x1="15"
                y1={height / 3}
                x2="8"
                y2={height / 3}
                stroke="black"
                strokeWidth="1"
              />
              <line
                x1="15"
                y1={(2 * height) / 3}
                x2="8"
                y2={(2 * height) / 3}
                stroke="black"
                strokeWidth="1"
              />
              {/* Output connection point visual guide */}
              <line
                x1={width - 15}
                y1={height / 2}
                x2={width - 8}
                y2={height / 2}
                stroke="black"
                strokeWidth="1"
              />
            </svg>
          )

        case 'NOT':
          return (
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
            >
              {/* NOT gate - triangle with inversion bubble */}
              <polygon
                points={`15,10 ${width - 20},${height / 2} 15,${height - 10}`}
                fill="var(--color-primary-foreground)"
                stroke={isSelected ? '#3b82f6' : 'var(--color-dotBlack)'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              {/* Inversion bubble */}
              <circle
                cx={width - 12}
                cy={height / 2}
                r="6"
                fill="var(--color-primary-foreground)"
                stroke={isSelected ? '#3b82f6' : 'var(--color-dotBlack)'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              {/* Input connection point visual guide */}
              <line
                x1="15"
                y1={height / 2}
                x2="8"
                y2={height / 2}
                stroke="black"
                strokeWidth="1"
              />
              {/* Output connection point visual guide */}
              <line
                x1={width - 6}
                y1={height / 2}
                x2={width - 2}
                y2={height / 2}
                stroke="black"
                strokeWidth="1"
              />
            </svg>
          )

        case 'NAND':
          return (
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
            >
              {/* NAND gate - AND shape with inversion bubble */}
              <path
                d={`M15,10 L${width - 30},10 A${(width - 45) / 2},${(height - 20) / 2} 0 0,1 ${width - 30},${height - 10} L15,${height - 10} Z`}
                fill="var(--color-primary-foreground)"
                stroke={isSelected ? '#3b82f6' : 'var(--color-dotBlack)'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              {/* Inversion bubble */}
              <circle
                cx={width - 15}
                cy={height / 2}
                r="6"
                fill="var(--color-primary-foreground)"
                stroke={isSelected ? '#3b82f6' : 'var(--color-dotBlack)'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              {/* Input connection points visual guide */}
              <line
                x1="15"
                y1={height / 3}
                x2="8"
                y2={height / 3}
                stroke="black"
                strokeWidth="1"
              />
              <line
                x1="15"
                y1={(2 * height) / 3}
                x2="8"
                y2={(2 * height) / 3}
                stroke="black"
                strokeWidth="1"
              />
              {/* Output connection point visual guide */}
              <line
                x1={width - 9}
                y1={height / 2}
                x2={width - 2}
                y2={height / 2}
                stroke="black"
                strokeWidth="1"
              />
            </svg>
          )

        case 'NOR':
          return (
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
            >
              {/* NOR gate - scaled to match AND gate size, with inversion bubble */}
              <path
                d={`M 15,10 Q ${width / 2 - 10},10 ${width - 25},${height / 2} Q ${width / 2 - 10},${height - 10} 15,${height - 10} Q 35,${height / 2} 15,10 Z`}
                fill="var(--color-primary-foreground)"
                stroke={isSelected ? '#3b82f6' : 'var(--color-dotBlack)'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              {/* Inversion bubble */}
              <circle
                cx={width - 12}
                cy={height / 2}
                r="6"
                fill="var(--color-primary-foreground)"
                stroke={isSelected ? '#3b82f6' : 'var(--color-dotBlack)'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              {/* Input connection points visual guide */}
              <line
                x1="15"
                y1={height / 3}
                x2="8"
                y2={height / 3}
                stroke="black"
                strokeWidth="1"
              />
              <line
                x1="15"
                y1={(2 * height) / 3}
                x2="8"
                y2={(2 * height) / 3}
                stroke="black"
                strokeWidth="1"
              />
              {/* Output connection point visual guide */}
              <line
                x1={width - 6}
                y1={height / 2}
                x2={width - 2}
                y2={height / 2}
                stroke="black"
                strokeWidth="1"
              />
            </svg>
          )

        case 'XOR':
          return (
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
            >
              {/* XOR gate - OR shape with additional curved line */}
              <path
                d={`M 20,10 Q 23,10 27,${height / 2} Q 23,${height - 10} 20,${height - 10} Q 45,${height / 2} ${width - 15},${height / 2} Q 45,${height / 2} 20,10 Z`}
                fill="var(--color-primary-foreground)"
                stroke={isSelected ? '#3b82f6' : 'var(--color-dotBlack)'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              {/* Additional curved line for XOR */}
              <path
                d={`M 10,10 Q 13,${height / 2} 10,${height - 10}`}
                fill="none"
                stroke={isSelected ? '#3b82f6' : 'var(--color-dotBlack)'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              {/* Input connection points visual guide */}
              <line
                x1="25"
                y1={height / 3 + 3}
                x2="8"
                y2={height / 3}
                stroke="black"
                strokeWidth="1"
              />
              <line
                x1="25"
                y1={(2 * height) / 3 - 3}
                x2="8"
                y2={(2 * height) / 3}
                stroke="black"
                strokeWidth="1"
              />
              {/* Output connection point visual guide */}
              <line
                x1={width - 15}
                y1={height / 2}
                x2={width - 8}
                y2={height / 2}
                stroke="black"
                strokeWidth="1"
              />
            </svg>
          )

        case 'XNOR':
          return (
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
            >
              {/* XNOR gate - XOR shape with inversion bubble */}
              <path
                d={`M 20,10 Q 23,10 27,${height / 2} Q 23,${height - 10} 20,${height - 10} Q 45,${height / 2} ${width - 20},${height / 2} Q 45,${height / 2} 20,10 Z`}
                fill="var(--color-primary-foreground)"
                stroke={isSelected ? '#3b82f6' : 'var(--color-dotBlack)'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              {/* Additional curved line for XOR */}
              <path
                d={`M 10,10 Q 13,${height / 2} 10,${height - 10}`}
                fill="none"
                stroke={isSelected ? '#3b82f6' : 'var(--color-dotBlack)'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              {/* Inversion bubble */}
              <circle
                cx={width - 12}
                cy={height / 2}
                r="6"
                fill="var(--color-primary-foreground)"
                stroke={isSelected ? '#3b82f6' : 'var(--color-dotBlack)'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              {/* Input connection points visual guide */}
              <line
                x1="25"
                y1={height / 3 + 3}
                x2="8"
                y2={height / 3}
                stroke="black"
                strokeWidth="1"
              />
              <line
                x1="25"
                y1={(2 * height) / 3 - 3}
                x2="8"
                y2={(2 * height) / 3}
                stroke="black"
                strokeWidth="1"
              />
              {/* Output connection point visual guide */}
              <line
                x1={width - 6}
                y1={height / 2}
                x2={width - 2}
                y2={height / 2}
                stroke="black"
                strokeWidth="1"
              />
            </svg>
          )

        case 'BUFFER':
          return (
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
            >
              {/* BUFFER gate - triangle (same as NOT but without bubble) */}
              <polygon
                points={`15,10 ${width - 8},${height / 2} 15,${height - 10}`}
                fill="var(--color-primary-foreground)"
                stroke={isSelected ? '#3b82f6' : 'var(--color-dotBlack)'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              {/* Input connection point visual guide */}
              <line
                x1="15"
                y1={height / 2}
                x2="8"
                y2={height / 2}
                stroke="black"
                strokeWidth="1"
              />
              {/* Output connection point visual guide */}
              <line
                x1={width - 8}
                y1={height / 2}
                x2={width - 2}
                y2={height / 2}
                stroke="black"
                strokeWidth="1"
              />
            </svg>
          )

        default:
          // Generic complex component with proper styling
          return (
            <div className="relative w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 80 60"
                className="absolute inset-0"
              >
                {/* Component body */}
                <rect
                  x="5"
                  y="5"
                  width="70"
                  height="50"
                  rx="8"
                  fill="var(--color-primary-foreground)"
                  stroke={isSelected ? '#3B82F6' : '#374151'}
                  strokeWidth={isSelected ? '3' : '2'}
                  className="transition-all duration-200"
                />

                {/* Component type label */}
                <text
                  x="40"
                  y="25"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={isSelected ? '#3B82F6' : '#374151'}
                  className="transition-all duration-200"
                >
                  {component.type.replace('_', ' ')}
                </text>

                {/* Circuit pattern decoration */}
                <g
                  stroke={isSelected ? '#93C5FD' : '#9CA3AF'}
                  strokeWidth="1"
                  fill="none"
                  opacity="0.5"
                >
                  <path d="M15 35 L25 35 L25 40 L35 40 L35 35 L45 35" />
                  <circle
                    cx="20"
                    cy="35"
                    r="1"
                    fill={isSelected ? '#93C5FD' : '#9CA3AF'}
                  />
                  <circle
                    cx="30"
                    cy="40"
                    r="1"
                    fill={isSelected ? '#93C5FD' : '#9CA3AF'}
                  />
                  <circle
                    cx="40"
                    cy="35"
                    r="1"
                    fill={isSelected ? '#93C5FD' : '#9CA3AF'}
                  />
                </g>

                {/* Selection indicator */}
                {isSelected && (
                  <rect
                    x="3"
                    y="3"
                    width="74"
                    height="54"
                    rx="10"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    opacity="0.6"
                  />
                )}
              </svg>
            </div>
          )
      }
    }

    const renderFlipFlop = () => {
      // Get input/output labels based on flip-flop type
      const getFFLabels = () => {
        switch (component.type) {
          case 'SR_FLIPFLOP':
            return { inputs: ['S', 'R', 'CLK'], outputs: ['Q', "Q'"] }
          case 'D_FLIPFLOP':
            return { inputs: ['D', 'CLK'], outputs: ['Q', "Q'"] }
          case 'JK_FLIPFLOP':
            return { inputs: ['J', 'K', 'CLK'], outputs: ['Q', "Q'"] }
          case 'T_FLIPFLOP':
            return { inputs: ['T', 'CLK'], outputs: ['Q', "Q'"] }
          default:
            return { inputs: [], outputs: [] }
        }
      }

      const labels = getFFLabels()
      const clockInputIndex = component.inputs.length - 1 // Clock is always last input

      return (
        <div className="relative w-full h-full">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 80 60"
            className="absolute inset-0"
          >
            {/* Flip-flop body */}
            <rect
              x="5"
              y="5"
              width="70"
              height="50"
              rx="6"
              fill="var(--color-primary-foreground)"
              stroke={isSelected ? '#3B82F6' : '#4B5563'}
              strokeWidth={isSelected ? '3' : '2'}
              className="transition-all duration-200"
            />

            {/* Flip-flop type label */}
            <text
              x="40"
              y="22"
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill={isSelected ? '#3B82F6' : '#1F2937'}
            >
              {component.type.replace('_FLIPFLOP', '')}
            </text>

            {/* FF label */}
            <text
              x="40"
              y="38"
              textAnchor="middle"
              fontSize="10"
              fill={isSelected ? '#3B82F6' : '#6B7280'}
            >
              FF
            </text>

            {/* Clock triangle indicator - rising edge symbol */}
            <polygon
              points="5,48 13,44 5,40"
              fill={
                component.inputs[clockInputIndex]?.value
                  ? '#10B981'
                  : isSelected
                    ? '#3B82F6'
                    : '#374151'
              }
              className="transition-all duration-200"
            />

            {/* Input labels */}
            {labels.inputs.map((label, idx) => {
              const y = 15 + idx * 15
              const isClockInput = idx === clockInputIndex
              return (
                <text
                  key={`input-${idx}`}
                  x={isClockInput ? '12' : '12'}
                  y={y}
                  textAnchor="start"
                  fontSize="8"
                  fontWeight="600"
                  fill={component.inputs[idx]?.value ? '#10B981' : '#6B7280'}
                  className="transition-colors duration-200"
                >
                  {label}
                </text>
              )
            })}

            {/* Output labels */}
            {labels.outputs.map((label, idx) => {
              const y = 22 + idx * 18
              return (
                <text
                  key={`output-${idx}`}
                  x="66"
                  y={y}
                  textAnchor="end"
                  fontSize="8"
                  fontWeight="600"
                  fill={component.outputs[idx]?.value ? '#EF4444' : '#6B7280'}
                  className="transition-colors duration-200"
                >
                  {label}
                </text>
              )
            })}

            {/* Input/Output pin indicators */}
            <g
              stroke={isSelected ? '#3B82F6' : '#6B7280'}
              strokeWidth="1"
              fill="none"
            >
              {/* Input side indicators */}
              {component.inputs.map((_, idx) => {
                const y = 15 + idx * 15
                return (
                  <line key={`in-line-${idx}`} x1="5" y1={y} x2="8" y2={y} />
                )
              })}

              {/* Output side indicators */}
              {component.outputs.map((_, idx) => {
                const y = 20 + idx * 18
                return (
                  <line key={`out-line-${idx}`} x1="72" y1={y} x2="75" y2={y} />
                )
              })}
            </g>

            {/* Selection indicator */}
            {isSelected && (
              <rect
                x="3"
                y="3"
                width="74"
                height="54"
                rx="8"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="4 2"
                opacity="0.6"
              />
            )}
          </svg>
        </div>
      )
    }

    const renderInputControl = () => {
      switch (component.type) {
        case 'SWITCH':
          const isOn = component.outputs[0]?.value
          return (
            <div className="relative w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 40 40"
                className="absolute inset-0"
              >
                {/* Switch body */}
                <rect
                  x="8"
                  y="15"
                  width="24"
                  height="10"
                  rx="5"
                  fill={isOn ? '#10B981' : '#6B7280'}
                  stroke={isSelected ? '#3B82F6' : '#374151'}
                  strokeWidth="2"
                />

                {/* Switch toggle */}
                <circle
                  cx={isOn ? 26 : 14}
                  cy="20"
                  r="6"
                  fill="var(--color-primary-foreground)"
                  stroke={isSelected ? '#3B82F6' : '#374151'}
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                {/* Switch labels */}
                <text x="6" y="12" fontSize="6" fill="#374151">
                  ON
                </text>
                <text x="30" y="32" fontSize="6" fill="#374151">
                  OFF
                </text>
              </svg>
            </div>
          )

        case 'PUSH_BUTTON':
          const isPressed = component.outputs[0]?.value
          return (
            <div className="relative w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 40 40"
                className="absolute inset-0"
              >
                {/* Button base */}
                <rect
                  x="5"
                  y="5"
                  width="30"
                  height="30"
                  rx="4"
                  fill="#E5E7EB"
                  stroke={isSelected ? '#3B82F6' : '#6B7280'}
                  strokeWidth="2"
                />

                {/* Button top */}
                <circle
                  cx="20"
                  cy={isPressed ? '22' : '18'}
                  r="8"
                  fill={isPressed ? '#EF4444' : '#F87171'}
                  stroke="#DC2626"
                  strokeWidth="2"
                  className="transition-all duration-100"
                />

                {/* Button reflection */}
                <circle
                  cx="18"
                  cy={isPressed ? '20' : '16'}
                  r="3"
                  fill="var(--color-primary-foreground)"
                  opacity="0.6"
                  className="transition-all duration-100"
                />
              </svg>
            </div>
          )

        case 'CLOCK':
          const isClockHigh = component.outputs[0]?.value
          return (
            <div className="relative w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 60 40"
                className="absolute inset-0"
              >
                {/* Clock body */}
                <rect
                  x="5"
                  y="8"
                  width="50"
                  height="24"
                  rx="6"
                  fill={isClockHigh ? '#FEF08A' : '#E5E7EB'}
                  stroke={
                    isSelected ? '#3B82F6' : isClockHigh ? '#F59E0B' : '#9CA3AF'
                  }
                  strokeWidth={isSelected ? '3' : '2'}
                />
                {/* Clock wave pattern */}
                <g
                  stroke={isClockHigh ? '#DC2626' : '#6B7280'}
                  strokeWidth="2"
                  fill="none"
                >
                  <path d="M10 25 L15 25 L15 15 L20 15 L20 25 L25 25 L25 15 L30 15 L30 25 L35 25 L35 15 L40 15 L40 25 L45 25" />
                </g>
                {/* Clock label */}
                <text
                  x="30"
                  y="7"
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="bold"
                  fill={isSelected ? '#3B82F6' : '#374151'}
                >
                  CLK
                </text>
              </svg>

              {/* Pulsing effect when active */}
              {isClockHigh && (
                <div className="absolute inset-1 rounded bg-yellow-300 opacity-30 animate-pulse pointer-events-none" />
              )}
            </div>
          )

        case 'HIGH_CONSTANT':
        case 'LOW_CONSTANT':
          const constantValue =
            component.outputs?.[0]?.value ?? component.type === 'HIGH_CONSTANT'
          return (
            <div className="relative w-full h-full cursor-pointer group hover:scale-105 transition-transform">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 40 40"
                className="absolute inset-0"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill={constantValue ? '#10B981' : '#6B7280'}
                  stroke={
                    isSelected
                      ? '#3B82F6'
                      : constantValue
                        ? '#059669'
                        : '#4B5563'
                  }
                  strokeWidth="2"
                />
                <text
                  x="20"
                  y="26"
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="bold"
                  fill="var(--color-primary-foreground)"
                >
                  {constantValue ? '1' : '0'}
                </text>
              </svg>
              {/* Hover hint */}
              <div className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    fill="var(--color-primary-foreground)"
                    stroke="#3B82F6"
                    strokeWidth="1"
                  />
                  <text
                    x="8"
                    y="11"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#3B82F6"
                  >
                    ⇄
                  </text>
                </svg>
              </div>
            </div>
          )

        default:
          return (
            <div className="relative w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 60 40"
                className="absolute inset-0"
              >
                {/* Input device body */}
                <rect
                  x="5"
                  y="5"
                  width="50"
                  height="30"
                  rx="8"
                  fill="#E0F2FE"
                  stroke={isSelected ? '#3B82F6' : '#0EA5E9'}
                  strokeWidth={isSelected ? '3' : '2'}
                />
                {/* Input indicator LED */}
                <circle
                  cx="15"
                  cy="20"
                  r="3"
                  fill={component.outputs?.[0]?.value ? '#10B981' : '#6B7280'}
                />
                {/* Input control shape speaks for itself */}
              </svg>
            </div>
          )
      }
    }

    const renderOutputControl = () => {
      switch (component.type) {
        case 'LED':
          const isLit = component.inputs[0]?.value
          return (
            <div className="relative w-full h-full flex items-center justify-center">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 48 64"
                className="absolute inset-0"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Glow effect for when lit */}
                  {isLit && (
                    <>
                      <radialGradient
                        id={`ledGlow-${component.id}`}
                        cx="50%"
                        cy="35%"
                        r="60%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#FEF08A"
                          stopOpacity="0.9"
                        />
                        <stop
                          offset="40%"
                          stopColor="#FCD34D"
                          stopOpacity="0.6"
                        />
                        <stop
                          offset="70%"
                          stopColor="#F59E0B"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#F59E0B"
                          stopOpacity="0"
                        />
                      </radialGradient>
                      <filter id={`blur-${component.id}`}>
                        <feGaussianBlur stdDeviation="3" />
                      </filter>
                    </>
                  )}
                </defs>

                {/* Outer glow aura when lit */}
                {isLit && (
                  <circle
                    cx="24"
                    cy="22"
                    r="22"
                    fill={`url(#ledGlow-${component.id})`}
                    filter={`url(#blur-${component.id})`}
                  />
                )}

                {/* Light bulb shape */}
                <g>
                  {/* Main bulb body - classic round bulb shape */}
                  <path
                    d="M24 8 C17 8 11 14 11 21 C11 25 12.5 28 15 31 L15 38 L33 38 L33 31 C35.5 28 37 25 37 21 C37 14 31 8 24 8 Z"
                    fill={isLit ? '#FDE047' : '#E5E7EB'}
                    stroke={isLit ? '#FACC15' : '#9CA3AF'}
                    strokeWidth="1.5"
                    className="transition-all duration-300"
                  />

                  {/* Glass shine highlight */}
                  <ellipse
                    cx="20"
                    cy="16"
                    rx="5"
                    ry="7"
                    fill="var(--color-primary-foreground)"
                    opacity={isLit ? '0.75' : '0.35'}
                    className="transition-opacity duration-300"
                  />

                  {/* Secondary highlight */}
                  <ellipse
                    cx="28"
                    cy="20"
                    rx="2.5"
                    ry="3"
                    fill="var(--color-primary-foreground)"
                    opacity={isLit ? '0.5' : '0.2'}
                    className="transition-opacity duration-300"
                  />

                  {/* Filament wires */}
                  <path
                    d="M20 24 Q24 21 28 24 M20 27 Q24 24 28 27"
                    stroke={isLit ? '#EF4444' : '#9CA3AF'}
                    strokeWidth="1.2"
                    fill="none"
                    opacity={isLit ? '1' : '0.5'}
                    className="transition-all duration-300"
                  />

                  {/* Filament support */}
                  <line
                    x1="24"
                    y1="20"
                    x2="24"
                    y2="30"
                    stroke={isLit ? '#DC2626' : '#9CA3AF'}
                    strokeWidth="0.8"
                    opacity={isLit ? '0.8' : '0.4'}
                  />

                  {/* Neck/transition to base */}
                  <path
                    d="M15 38 L15 42 L33 42 L33 38"
                    fill={isLit ? '#D6D3D1' : '#E5E7EB'}
                    stroke={isLit ? '#A8A29E' : '#9CA3AF'}
                    strokeWidth="1"
                  />

                  {/* Screw base */}
                  <rect
                    x="16"
                    y="42"
                    width="16"
                    height="14"
                    rx="1"
                    fill={isLit ? '#A8A29E' : '#D1D5DB'}
                    stroke={isLit ? '#78716C' : '#9CA3AF'}
                    strokeWidth="1"
                  />

                  {/* Screw threads */}
                  <line
                    x1="16"
                    y1="44"
                    x2="32"
                    y2="44"
                    stroke={isLit ? '#57534E' : '#9CA3AF'}
                    strokeWidth="0.8"
                  />
                  <line
                    x1="16"
                    y1="47"
                    x2="32"
                    y2="47"
                    stroke={isLit ? '#57534E' : '#9CA3AF'}
                    strokeWidth="0.8"
                  />
                  <line
                    x1="16"
                    y1="50"
                    x2="32"
                    y2="50"
                    stroke={isLit ? '#57534E' : '#9CA3AF'}
                    strokeWidth="0.8"
                  />
                  <line
                    x1="16"
                    y1="53"
                    x2="32"
                    y2="53"
                    stroke={isLit ? '#57534E' : '#9CA3AF'}
                    strokeWidth="0.8"
                  />

                  {/* Base contact */}
                  <circle
                    cx="24"
                    cy="58"
                    r="4"
                    fill={isLit ? '#78716C' : '#9CA3AF'}
                    stroke={isLit ? '#57534E' : '#6B7280'}
                    strokeWidth="1"
                  />
                </g>
              </svg>

              {/* Animated glow pulse when lit */}
              {isLit && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-yellow-300 opacity-40 animate-pulse pointer-events-none blur-sm" />
              )}

              {/* Selection border */}
              {isSelected && (
                <div className="absolute inset-[-3px] rounded-lg border-2 border-blue-500 pointer-events-none" />
              )}
            </div>
          )

        case 'SEVEN_SEGMENT':
          // 7-segment display with proper segment decoding
          // Inputs: [a, b, c, d, e, f, g] (7 segments)
          // Or: [BCD0, BCD1, BCD2, BCD3] for BCD mode (4 bits)
          const segments = component.inputs.map((i) => Boolean(i.value))

          const mode = component.properties?.sevenSegmentMode ?? 'auto'
          const firstFourInputs = component.inputs.slice(0, 4)
          const extraInputs = component.inputs.slice(4)
          const extrasHaveSignal = extraInputs.some(
            (input) => input.connected || input.value
          )
          const firstFourAllConnected =
            firstFourInputs.length === 4 &&
            firstFourInputs.every((input) => input.connected)

          const shouldUseBcd =
            mode === 'bcd' ||
            (mode !== 'segments' &&
              (component.inputs.length === 4 ||
                (firstFourInputs.length === 4 &&
                  firstFourAllConnected &&
                  !extrasHaveSignal)))

          let segmentStates = [...segments]

          if (shouldUseBcd && firstFourInputs.length === 4) {
            const bcdBits =
              component.inputs.length === 4
                ? segmentStates
                : segmentStates.slice(0, 4)

            const bcdValue = bcdBits.reduce(
              (acc, bit, idx) =>
                acc + (bit ? Math.pow(2, bcdBits.length - 1 - idx) : 0),
              0
            )

            // BCD to 7-segment decoder (segments: a, b, c, d, e, f, g)
            const bcdTo7Seg: Record<number, boolean[]> = {
              0: [true, true, true, true, true, true, false], // 0
              1: [false, true, true, false, false, false, false], // 1
              2: [true, true, false, true, true, false, true], // 2
              3: [true, true, true, true, false, false, true], // 3
              4: [false, true, true, false, false, true, true], // 4
              5: [true, false, true, true, false, true, true], // 5
              6: [true, false, true, true, true, true, true], // 6
              7: [true, true, true, false, false, false, false], // 7
              8: [true, true, true, true, true, true, true], // 8
              9: [true, true, true, true, false, true, true], // 9
              10: [true, true, true, false, true, true, true], // A
              11: [false, false, true, true, true, true, true], // b
              12: [true, false, false, true, true, true, false], // C
              13: [false, true, true, true, true, false, true], // d
              14: [true, false, false, true, true, true, true], // E
              15: [true, false, false, false, true, true, true], // F
            }

            segmentStates = [...(bcdTo7Seg[bcdValue] || bcdTo7Seg[0])]
          }

          // Ensure we have exactly 7 segments
          if (segmentStates.length > 7) {
            segmentStates = segmentStates.slice(0, 7)
          }
          while (segmentStates.length < 7) {
            segmentStates.push(false)
          }

          // Display mode indicator text below the display
          const displayModeText = shouldUseBcd ? 'BCD' : 'SEG'
          const hasAnyInput = component.inputs.some(i => i.connected || i.value)
          
          return (
            <div className="relative w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 60 95"
                className="absolute inset-0"
              >
                {/* Display background */}
                <rect
                  x="8"
                  y="8"
                  width="44"
                  height="74"
                  rx="4"
                  fill="#1A1A1A"
                  stroke={isSelected ? '#3B82F6' : '#2D2D2D'}
                  strokeWidth={isSelected ? '3' : '2'}
                />

                {/* 7-Segment Display - Each segment is a polygon for authentic look */}
                <g>
                  {/* Segment A (top) */}
                  <polygon
                    points="20,15 40,15 38,17 22,17"
                    fill={segmentStates[0] ? '#FF3B30' : '#333333'}
                    className="transition-all duration-200"
                  />

                  {/* Segment B (top right) */}
                  <polygon
                    points="41,16 43,18 43,38 41,40 39,38 39,18"
                    fill={segmentStates[1] ? '#FF3B30' : '#333333'}
                    className="transition-all duration-200"
                  />

                  {/* Segment C (bottom right) */}
                  <polygon
                    points="41,42 43,44 43,64 41,66 39,64 39,44"
                    fill={segmentStates[2] ? '#FF3B30' : '#333333'}
                    className="transition-all duration-200"
                  />

                  {/* Segment D (bottom) */}
                  <polygon
                    points="20,67 40,67 38,65 22,65"
                    fill={segmentStates[3] ? '#FF3B30' : '#333333'}
                    className="transition-all duration-200"
                  />

                  {/* Segment E (bottom left) */}
                  <polygon
                    points="17,42 19,44 19,64 17,66 15,64 15,44"
                    fill={segmentStates[4] ? '#FF3B30' : '#333333'}
                    className="transition-all duration-200"
                  />

                  {/* Segment F (top left) */}
                  <polygon
                    points="17,16 19,18 19,38 17,40 15,38 15,18"
                    fill={segmentStates[5] ? '#FF3B30' : '#333333'}
                    className="transition-all duration-200"
                  />

                  {/* Segment G (middle) */}
                  <polygon
                    points="20,41 40,41 38,39 22,39 20,41"
                    fill={segmentStates[6] ? '#FF3B30' : '#333333'}
                    className="transition-all duration-200"
                  />
                </g>

                {/* Glow effect when lit */}
                {segmentStates.some((s) => s) && (
                  <rect
                    x="8"
                    y="8"
                    width="44"
                    height="74"
                    rx="4"
                    fill="none"
                    stroke="#FF3B30"
                    strokeWidth="0.5"
                    opacity="0.3"
                    className="pointer-events-none"
                  />
                )}
                
                {/* Mode indicator - improved styling */}
                <g>
                  <rect
                    x="20"
                    y="82"
                    width="20"
                    height="10"
                    rx="2"
                    fill="#374151"
                    fillOpacity="0.5"
                  />
                  <text
                    x="30"
                    y="89"
                    textAnchor="middle"
                    fontSize="6"
                    fill={hasAnyInput ? '#9CA3AF' : '#6B7280'}
                    fontWeight="700"
                    letterSpacing="0.5"
                  >
                    {displayModeText}
                  </text>
                </g>
              </svg>
            </div>
          )

        case 'DIGITAL_DISPLAY':
          // Calculate decimal value from binary inputs (MSB first)
          const binaryValue =
            component.inputs.length > 0
              ? component.inputs.reduce(
                  (acc, input, i) =>
                    acc +
                    (input.value
                      ? Math.pow(2, component.inputs.length - 1 - i)
                      : 0),
                  0
                )
              : 0

          const hasSignal = component.inputs?.some((input) => input.value)
          const displayColor = hasSignal ? '#10B981' : '#4B5563'

          return (
            <div className="relative w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 50"
                className="absolute inset-0"
              >
                {/* Display housing */}
                <rect
                  x="5"
                  y="5"
                  width="90"
                  height="40"
                  rx="6"
                  fill="#1A1A1A"
                  stroke={isSelected ? '#3B82F6' : '#2D2D2D'}
                  strokeWidth={isSelected ? '3' : '2'}
                />

                {/* LCD screen inset */}
                <rect
                  x="10"
                  y="10"
                  width="80"
                  height="30"
                  rx="3"
                  fill="#0F172A"
                  stroke="#1E293B"
                  strokeWidth="1"
                />

                {/* Binary representation (small, top) */}
                <text
                  x="50"
                  y="19"
                  textAnchor="middle"
                  fontSize="5"
                  fontFamily="monospace"
                  fill={displayColor}
                  opacity="0.6"
                >
                  {component.inputs.map((i) => (i.value ? '1' : '0')).join('')}
                </text>

                {/* Decimal value (large, center) */}
                <text
                  x="50"
                  y="32"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill={displayColor}
                  className="transition-colors duration-200"
                >
                  {binaryValue}
                </text>

                {/* Bit count label */}
                <text
                  x="88"
                  y="42"
                  textAnchor="end"
                  fontSize="4"
                  fill="#6B7280"
                >
                  {component.inputs.length}bit
                </text>

                {/* Glow effect when active */}
                {hasSignal && (
                  <rect
                    x="10"
                    y="10"
                    width="80"
                    height="30"
                    rx="3"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="0.5"
                    opacity="0.4"
                    className="pointer-events-none"
                  />
                )}
              </svg>
            </div>
          )

        default:
          return (
            <div className="relative w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 60 40"
                className="absolute inset-0"
              >
                {/* Output device body */}
                <rect
                  x="5"
                  y="5"
                  width="50"
                  height="30"
                  rx="8"
                  fill="#F0FDF4"
                  stroke={isSelected ? '#3B82F6' : '#16A34A'}
                  strokeWidth={isSelected ? '3' : '2'}
                />
                {/* Output indicator */}
                <circle
                  cx="45"
                  cy="20"
                  r="3"
                  fill={component.inputs?.[0]?.value ? '#EF4444' : '#6B7280'}
                />
                {/* Icon display */}
                <text
                  x="25"
                  y="25"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill={isSelected ? '#3B82F6' : '#0F172A'}
                >
                  {definition.icon}
                </text>
              </svg>
            </div>
          )
      }
    }

    const renderComponent = () => {
      switch (definition.category) {
        case 'gates':
          return renderGateShape()
        case 'flipflops':
          return renderFlipFlop()
        case 'inputs':
          return renderInputControl()
        case 'outputs':
          return renderOutputControl()
        case 'other':
          if (component.type === 'LABEL') {
            // Calculate min width/height and grow with content
            const labelLines = (component.label ?? '').split('\n')
            const minWidth = 60
            const minHeight = 24 // smaller base height for single line
            const charWidth = 8 // px per character (approx)
            const lineHeight = 18 // px per line (approx)
            const contentWidth = Math.max(
              minWidth,
              Math.max(...labelLines.map((line) => line.length * charWidth)) +
                24
            )
            // Grow height for each line, with a small padding
            const contentHeight = Math.max(
              minHeight,
              labelLines.length * lineHeight + 8
            )

            // Update component size if it changed
            React.useEffect(() => {
              if (
                circuitHook &&
                typeof circuitHook.updateComponent === 'function' &&
                (component.size.width !== contentWidth ||
                  component.size.height !== contentHeight)
              ) {
                circuitHook.updateComponent(component.id, {
                  size: { width: contentWidth, height: contentHeight },
                })
              }
            }, [contentWidth, contentHeight])

            return (
              <div
                className="bg-white/90 backdrop-blur-sm border-2 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200"
                style={{
                  borderColor: isSelected ? '#3b82f6' : '#d1d5db',
                  position: 'relative',
                  width: contentWidth,
                  height: contentHeight,
                  minWidth,
                  minHeight,
                  boxShadow: isSelected ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
                }}
              >
                <textarea
                  value={component.label ?? ''}
                  onChange={(e) => {
                    if (typeof onClick === 'function') e.stopPropagation()
                    if (
                      circuitHook &&
                      typeof circuitHook.updateComponent === 'function'
                    ) {
                      circuitHook.updateComponent(component.id, {
                        label: e.target.value,
                      })
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  className="w-full h-full text-center bg-transparent border-none outline-none text-sm font-medium px-3 resize-none text-gray-800 placeholder:text-gray-400"
                  style={{
                    pointerEvents: 'auto',
                    overflow: 'hidden',
                    resize: 'none',
                    lineHeight: '1.5',
                  }}
                  placeholder="Add text..."
                  rows={labelLines.length || 1}
                />
              </div>
            )
          }
          
          // BUS component
          if (component.type === 'BUS') {
            const bitCount = component.inputs.length
            const hasSignal = component.inputs.some(i => i.connected || i.value)
            return (
              <div className="relative w-full h-full">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 100 24"
                  className="absolute inset-0"
                >
                  {/* Bus line background glow when active */}
                  {hasSignal && (
                    <rect
                      x="0"
                      y="9"
                      width="100"
                      height="6"
                      fill={isSelected ? '#3B82F6' : '#10B981'}
                      fillOpacity="0.3"
                      rx="2"
                      className="animate-pulse"
                    />
                  )}
                  
                  {/* Bus line (thick) */}
                  <rect
                    x="0"
                    y="10"
                    width="100"
                    height="4"
                    fill={isSelected ? '#3B82F6' : hasSignal ? '#10B981' : '#6B7280'}
                    rx="1.5"
                    className="transition-all duration-200"
                  />
                  
                  {/* Diagonal slash indicators (left) */}
                  <line
                    x1="12"
                    y1="7"
                    x2="16"
                    y2="17"
                    stroke={isSelected ? '#1E40AF' : hasSignal ? '#047857' : '#4B5563'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="18"
                    y1="7"
                    x2="22"
                    y2="17"
                    stroke={isSelected ? '#1E40AF' : hasSignal ? '#047857' : '#4B5563'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  
                  {/* Diagonal slash indicators (right) */}
                  <line
                    x1="78"
                    y1="7"
                    x2="82"
                    y2="17"
                    stroke={isSelected ? '#1E40AF' : hasSignal ? '#047857' : '#4B5563'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="84"
                    y1="7"
                    x2="88"
                    y2="17"
                    stroke={isSelected ? '#1E40AF' : hasSignal ? '#047857' : '#4B5563'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  
                  {/* Bit count label with background */}
                  <rect
                    x="40"
                    y="3"
                    width="20"
                    height="12"
                    rx="3"
                    fill={isSelected ? '#3B82F6' : hasSignal ? '#10B981' : '#4B5563'}
                  />
                  <text
                    x="50"
                    y="11.5"
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="bold"
                    fill="#FFFFFF"
                  >
                    {bitCount}
                  </text>
                </svg>
              </div>
            )
          }
          return (
            <div
              className="w-full h-full bg-gray-100 border-2 border-gray-400 rounded"
              style={{ borderColor: isSelected ? '#3b82f6' : '#9ca3af' }}
            ></div>
          )
      }
    }

    // Check if any inputs are connected
    const hasConnectedInputs = component.inputs.some((input) => input.connected)
    const hasActiveInputs = component.inputs.some(
      (input) => input.connected && input.value
    )

    // Check if component is an interactive control (switches, buttons, etc.)
    return (
      <div
        className={`relative select-none ${isSelected ? 'z-20' : 'z-10'} transition-all duration-200 hover:z-30`}
        style={{
          width: component.size.width,
          height: component.size.height,
          transform: `rotate(${component.rotation}deg)`,
          cursor:
            currentTool === 'select'
              ? 'move'
              : currentTool === 'wire'
                ? 'crosshair'
                : 'default',
        }}
        onMouseDown={(e) => {
          if (currentTool === 'select') {
            onMouseDown(e)
          }
        }}
        onClick={(e) => {
          // Always allow clicking interactive controls in select mode
          if (currentTool === 'select') {
            onClick?.(e)
          }
        }}
        title={`${definition.name}${component.label ? ` - ${component.label}` : ''}`}
      >
        {/* Connected inputs indicator - greenish glow */}
        {hasConnectedInputs && (
          <div
            className={`absolute -inset-1 rounded-sm transition-all duration-300 pointer-events-none ${
              hasActiveInputs
                ? 'bg-green-400/20 shadow-lg shadow-green-400/30 ring-2 ring-green-400/40'
                : 'bg-emerald-300/15 ring-1 ring-emerald-400/30'
            }`}
            style={{
              animation: hasActiveInputs
                ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                : 'none',
            }}
          />
        )}

        {/* Component body */}
        {renderComponent()}

        {/* Input connection points */}
        {component.inputs.map((input, index) =>
          renderConnectionPoint(input, index)
        )}

        {/* Output connection points */}
        {component.outputs.map((output, index) =>
          renderConnectionPoint(output, index)
        )}

        {/* Component label */}
        {component.label && (
          <div className="absolute -bottom-6 left-0 text-xs text-gray-600 whitespace-nowrap">
            {component.label}
          </div>
        )}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison function for better performance
    return (
      prevProps.component.id === nextProps.component.id &&
      prevProps.component.position.x === nextProps.component.position.x &&
      prevProps.component.position.y === nextProps.component.position.y &&
      prevProps.component.rotation === nextProps.component.rotation &&
      prevProps.component.label === nextProps.component.label &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.currentTool === nextProps.currentTool &&
      JSON.stringify(prevProps.component.inputs) ===
        JSON.stringify(nextProps.component.inputs) &&
      JSON.stringify(prevProps.component.outputs) ===
        JSON.stringify(nextProps.component.outputs)
    )
  }
)
