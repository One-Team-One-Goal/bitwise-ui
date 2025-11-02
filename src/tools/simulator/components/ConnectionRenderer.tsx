import React, { useState, useEffect, useRef } from 'react'
import type { Connection } from '../types/index'

interface ConnectionRendererProps {
  connection: Connection
  isSelected: boolean
  onSelect: () => void
  onRemove?: () => void
  onPathUpdate?: (newPath: { x: number; y: number }[]) => void
}

type WireDragState = {
  type: 'path' | 'handle'
  handleIndex?: number
  lastMouse: { x: number; y: number }
}

// Memoize the component to prevent unnecessary re-renders
export const ConnectionRenderer: React.FC<ConnectionRendererProps> = React.memo(
  ({ connection, isSelected, onSelect, onRemove, onPathUpdate }) => {
    const svgRef = useRef<SVGSVGElement | null>(null)
    const pendingHandleRef = useRef<{
      handleIndex: number
      mouse: { x: number; y: number }
    } | null>(null)

    const [showContextMenu, setShowContextMenu] = useState(false)
    const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 })
    const [dragState, setDragState] = useState<WireDragState | null>(null)

    // Handle wire dragging for rerouting
    const handlePathMouseDown = (e: React.MouseEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()

      if (!isSelected) {
        onSelect()
      }

      setShowContextMenu(false)

      if (!onPathUpdate) {
        return
      }

      if (connection.path.length <= 2) {
        const start = connection.path[0]
        const end = connection.path[connection.path.length - 1]
        const midpoint = {
          x: (start.x + end.x) / 2,
          y: (start.y + end.y) / 2,
        }

        const newPath = [...connection.path]
        newPath.splice(1, 0, midpoint)
        pendingHandleRef.current = {
          handleIndex: 1,
          mouse: { x: e.clientX, y: e.clientY },
        }
        onPathUpdate(newPath)
        return
      }

      setDragState({
        type: 'path',
        lastMouse: { x: e.clientX, y: e.clientY },
      })
    }

    const handleControlPointMouseDown = (
      e: React.MouseEvent,
      handleIndex: number
    ) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      if (!onPathUpdate) return
      setShowContextMenu(false)
      setDragState({
        type: 'handle',
        handleIndex,
        lastMouse: { x: e.clientX, y: e.clientY },
      })
    }

    const handleAddControlPoint = (
      e: React.MouseEvent,
      insertIndex: number,
      point: { x: number; y: number }
    ) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()

      if (!onPathUpdate) return

      const newPath = [...connection.path]
      newPath.splice(insertIndex + 1, 0, point)
      pendingHandleRef.current = {
        handleIndex: insertIndex + 1,
        mouse: { x: e.clientX, y: e.clientY },
      }
      onPathUpdate(newPath)
    }

    useEffect(() => {
      if (!isSelected) {
        setShowContextMenu(false)
      }
    }, [isSelected])

    if (connection.path.length < 2) return null

    const startPoint = connection.path[0]
    const endPoint = connection.path[connection.path.length - 1]

    // Calculate bounding box for the SVG with padding
    const minX = Math.min(...connection.path.map((p) => p.x)) - 15
    const maxX = Math.max(...connection.path.map((p) => p.x)) + 15
    const minY = Math.min(...connection.path.map((p) => p.y)) - 15
    const maxY = Math.max(...connection.path.map((p) => p.y)) + 15

    const width = maxX - minX
    const height = maxY - minY

    useEffect(() => {
      if (!dragState || !onPathUpdate || !svgRef.current) return

      const handleMove = (event: MouseEvent) => {
        const svgElement = svgRef.current
        if (!svgElement || !onPathUpdate) return

        const rect = svgElement.getBoundingClientRect()
        const scaleX = rect.width / Math.max(width, 1)
        const scaleY = rect.height / Math.max(height, 1)

        if (dragState.type === 'path') {
          const deltaX = (event.clientX - dragState.lastMouse.x) / scaleX
          const deltaY = (event.clientY - dragState.lastMouse.y) / scaleY

          if (Math.abs(deltaX) < 0.1 && Math.abs(deltaY) < 0.1) return

          const updatedPath = connection.path.map((point, index) => {
            if (index === 0 || index === connection.path.length - 1) {
              return point
            }
            return {
              x: point.x + deltaX,
              y: point.y + deltaY,
            }
          })

          onPathUpdate(updatedPath)
          setDragState((prev) =>
            prev
              ? { ...prev, lastMouse: { x: event.clientX, y: event.clientY } }
              : prev
          )
        } else if (
          dragState.type === 'handle' &&
          dragState.handleIndex !== undefined
        ) {
          const absoluteX = (event.clientX - rect.left) / scaleX + minX
          const absoluteY = (event.clientY - rect.top) / scaleY + minY

          const updatedPath = connection.path.map((point, index) =>
            index === dragState.handleIndex
              ? { x: absoluteX, y: absoluteY }
              : point
          )

          onPathUpdate(updatedPath)
        }
      }

      const handleUp = () => {
        setDragState(null)
      }

      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)

      return () => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleUp)
      }
    }, [dragState, connection.path, onPathUpdate, width, height, minX, minY])

    useEffect(() => {
      if (!pendingHandleRef.current) return
      if (!onPathUpdate) {
        pendingHandleRef.current = null
        return
      }

      const pending = pendingHandleRef.current
      if (!connection.path[pending.handleIndex]) {
        return
      }

      pendingHandleRef.current = null
      setDragState({
        type: 'handle',
        handleIndex: pending.handleIndex,
        lastMouse: pending.mouse,
      })
    }, [connection.path, onPathUpdate])

    // Create smooth orthogonal path
    const createSmoothPath = () => {
      if (connection.path.length === 2) {
        const start = connection.path[0]
        const end = connection.path[1]

        // Calculate control points for smooth right-angle routing
        const dx = end.x - start.x
        const dy = end.y - start.y

        // Choose whether to go horizontal first or vertical first based on distance
        const goHorizontalFirst = Math.abs(dx) > Math.abs(dy)

        if (goHorizontalFirst) {
          // Go horizontal first, then vertical
          const midX = start.x + dx * 0.7
          const cornerRadius = 8

          let path = `M ${start.x - minX} ${start.y - minY}`

          if (Math.abs(midX - start.x) > cornerRadius) {
            path += ` L ${midX - cornerRadius - minX} ${start.y - minY}`
            path += ` Q ${midX - minX} ${start.y - minY} ${midX - minX} ${start.y + (dy > 0 ? cornerRadius : -cornerRadius) - minY}`
          }

          if (Math.abs(end.y - start.y) > cornerRadius * 2) {
            path += ` L ${midX - minX} ${end.y - (dy > 0 ? cornerRadius : -cornerRadius) - minY}`
            path += ` Q ${midX - minX} ${end.y - minY} ${midX + cornerRadius - minX} ${end.y - minY}`
          }

          path += ` L ${end.x - minX} ${end.y - minY}`
          return path
        } else {
          // Go vertical first, then horizontal
          const midY = start.y + dy * 0.7
          const cornerRadius = 8

          let path = `M ${start.x - minX} ${start.y - minY}`

          if (Math.abs(midY - start.y) > cornerRadius) {
            path += ` L ${start.x - minX} ${midY - cornerRadius - minY}`
            path += ` Q ${start.x - minX} ${midY - minY} ${start.x + (dx > 0 ? cornerRadius : -cornerRadius) - minX} ${midY - minY}`
          }

          if (Math.abs(end.x - start.x) > cornerRadius * 2) {
            path += ` L ${end.x - (dx > 0 ? cornerRadius : -cornerRadius) - minX} ${midY - minY}`
            path += ` Q ${end.x - minX} ${midY - minY} ${end.x - minX} ${midY + cornerRadius - minY}`
          }

          path += ` L ${end.x - minX} ${end.y - minY}`
          return path
        }
      } else {
        // Multi-point path with smooth corners
        const pathParts = connection.path.map((point, index) => {
          const command = index === 0 ? 'M' : 'L'
          return `${command} ${point.x - minX} ${point.y - minY}`
        })
        return pathParts.join(' ')
      }
    }

    const pathString = createSmoothPath()

    // Color scheme for better visual feedback
    const getWireColor = () => {
      if (connection.value) {
        return {
          stroke: '#22c55e', // Green for HIGH
          glow: 'rgba(34, 197, 94, 0.4)',
          shadow: '0 0 8px rgba(34, 197, 94, 0.6)',
        }
      } else {
        return {
          stroke: '#64748b', // Slate for LOW
          glow: 'rgba(100, 116, 139, 0.3)',
          shadow: 'none',
        }
      }
    }

    const colors = getWireColor()
    const isPathDragging = dragState?.type === 'path'

    return (
      <>
        <svg
          ref={svgRef}
          className="absolute pointer-events-none"
          style={{
            left: minX,
            top: minY,
            width,
            height,
            zIndex: isSelected ? 20 : 10,
          }}
        >
          {/* Define gradient for signal flow animation */}
          <defs>
            <linearGradient
              id={`signal-flow-${connection.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.3">
                <animate
                  attributeName="stop-opacity"
                  values="0.3;1;0.3"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor={colors.stroke} stopOpacity="1">
                <animate
                  attributeName="stop-opacity"
                  values="1;0.3;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor={colors.stroke} stopOpacity="0.3">
                <animate
                  attributeName="stop-opacity"
                  values="0.3;1;0.3"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>

            {/* Arrow marker for signal direction */}
            <marker
              id={`arrowhead-${connection.id}`}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon
                points="0 0, 6 3, 0 6"
                fill={colors.stroke}
                stroke="none"
              />
            </marker>

            {/* Glow filter for active signals */}
            <filter
              id={`glow-${connection.id}`}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Glow effect for properly connected wires */}
          {connection.from.componentId && connection.to.componentId && (
            <path
              d={pathString}
              stroke={colors.glow}
              strokeWidth="8"
              fill="none"
              opacity="0.6"
              className={connection.value ? 'animate-pulse' : ''}
              style={{
                filter: 'blur(3px)',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Background wire for better visibility and easier clicking */}
          <path
            d={pathString}
            stroke="transparent"
            strokeWidth="12"
            fill="none"
            className="pointer-events-auto cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
            onMouseDown={handlePathMouseDown}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setContextMenuPos({ x: e.clientX, y: e.clientY })
              setShowContextMenu(true)
              onSelect()
            }}
          />

          {/* Visible background wire */}
          <path
            d={pathString}
            stroke="#f1f5f9"
            strokeWidth="6"
            fill="none"
            className="pointer-events-none"
          />

          {/* Main wire with enhanced visuals */}
          <path
            d={pathString}
            stroke={colors.stroke}
            strokeWidth={isSelected ? 4 : 3}
            fill="none"
            className={`pointer-events-auto transition-all duration-200 ${
              isSelected ? 'cursor-move' : 'cursor-pointer'
            } ${connection.value ? 'animate-pulse' : ''}`}
            style={{
              filter: isSelected
                ? colors.shadow
                : connection.value
                  ? `url(#glow-${connection.id})`
                  : undefined,
              strokeDasharray: isPathDragging ? '5,5' : 'none',
              strokeDashoffset: isPathDragging ? '10' : '0',
            }}
            markerEnd={`url(#arrowhead-${connection.id})`}
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setContextMenuPos({ x: e.clientX, y: e.clientY })
              setShowContextMenu(true)
              onSelect()
            }}
            onMouseDown={handlePathMouseDown}
          />

          {/* Animated signal flow for HIGH state */}
          {connection.value && (
            <path
              d={pathString}
              stroke={`url(#signal-flow-${connection.id})`}
              strokeWidth="2"
              fill="none"
              className="pointer-events-none"
            />
          )}

          {/* Drag handles for wire rerouting when selected */}
          {isSelected && connection.path.length > 2 && (
            <>
              {connection.path.slice(1, -1).map((point, index) => (
                <circle
                  key={`handle-${index}`}
                  cx={point.x - minX}
                  cy={point.y - minY}
                  r="5"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-grab hover:scale-125 transition-transform"
                  style={{ pointerEvents: 'auto' }}
                  onMouseDown={(e) => handleControlPointMouseDown(e, index + 1)}
                />
              ))}

              {/* Add new control points on wire segments */}
              {connection.path.slice(0, -1).map((point, index) => {
                const nextPoint = connection.path[index + 1]
                const midX = (point.x + nextPoint.x) / 2
                const midY = (point.y + nextPoint.y) / 2

                return (
                  <circle
                    key={`mid-handle-${index}`}
                    onMouseDown={(e) =>
                      handleAddControlPoint(e, index, { x: midX, y: midY })
                    }
                    style={{ pointerEvents: 'auto' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      // Add a new control point
                      const newPath = [...connection.path]
                      newPath.splice(index + 1, 0, { x: midX, y: midY })
                      onPathUpdate?.(newPath)
                    }}
                  />
                )
              })}
            </>
          )}

          {/* Selection indicator */}
          {isSelected && (
            <>
              {/* Primary selection indicator */}
              <path
                d={pathString}
                stroke="#3b82f6"
                strokeWidth="8"
                fill="none"
                opacity={0.6}
                className="pointer-events-none"
                strokeDasharray="12 6"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;18"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>

              {/* Secondary glow effect */}
              <path
                d={pathString}
                stroke="#3b82f6"
                strokeWidth="12"
                fill="none"
                opacity={0.2}
                className="pointer-events-none"
              />

              {/* Wire selection badge */}
              <g
                transform={`translate(${(startPoint.x + endPoint.x) / 2 - minX - 15}, ${(startPoint.y + endPoint.y) / 2 - minY - 15})`}
              >
                <rect
                  x="0"
                  y="0"
                  width="30"
                  height="20"
                  rx="10"
                  fill="#3b82f6"
                  opacity="0.9"
                />
                <text
                  x="15"
                  y="13"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="white"
                >
                  WIRE
                </text>
              </g>
            </>
          )}

          {/* Connection point indicators */}
          <circle
            cx={startPoint.x - minX}
            cy={startPoint.y - minY}
            r="3"
            fill={colors.stroke}
            stroke="#ffffff"
            strokeWidth="1"
            className="pointer-events-none"
          />

          <circle
            cx={endPoint.x - minX}
            cy={endPoint.y - minY}
            r="3"
            fill={colors.stroke}
            stroke="#ffffff"
            strokeWidth="1"
            className="pointer-events-none"
          />

          {/* Signal value indicator at midpoint */}
          {connection.path.length >= 2 && (
            <g>
              <circle
                cx={(startPoint.x + endPoint.x) / 2 - minX}
                cy={(startPoint.y + endPoint.y) / 2 - minY}
                r="6"
                fill="#ffffff"
                stroke={colors.stroke}
                strokeWidth="2"
                className="pointer-events-none"
              />
              <text
                x={(startPoint.x + endPoint.x) / 2 - minX}
                y={(startPoint.y + endPoint.y) / 2 - minY + 1}
                textAnchor="middle"
                fontSize="8"
                fontWeight="bold"
                fill={colors.stroke}
                className="pointer-events-none"
              >
                {connection.value ? '1' : '0'}
              </text>
            </g>
          )}
        </svg>

        {/* Context Menu */}
        {showContextMenu && (
          <>
            {/* Backdrop to close menu */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowContextMenu(false)}
            />

            {/* Menu positioned at cursor */}
            <div
              className="fixed z-50 bg-background border border-gray-200 rounded-lg shadow-xl py-1 min-w-[180px] max-w-[220px]"
              style={{
                left: Math.min(contextMenuPos.x, window.innerWidth - 220),
                top: Math.min(contextMenuPos.y, window.innerHeight - 200),
                transform: 'translate(-10px, -10px)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Wire Info Header */}
              <div className="px-3 py-2 bg-linear-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border-b border-border">
                <div className="text-xs font-semibold text-primary">
                  Wire Management
                </div>
                <div className="flex items-center gap-2 text-xs text-primary/80">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      connection.value
                        ? 'bg-(--color-greenz) animate-pulse'
                        : 'bg-muted-foreground'
                    }`}
                  />
                  Signal: {connection.value ? 'HIGH (1)' : 'LOW (0)'}
                </div>
              </div>

              {/* Wire Actions */}
              <div className="py-1">
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-primary/10 dark:hover:bg-primary/20 text-primary flex items-center gap-3 transition-colors"
                  onClick={() => {
                    onSelect() // Select the wire for rerouting
                    setShowContextMenu(false)
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    <polyline points="7.5 10.5 12 14 16.5 10.5" />
                  </svg>
                  <div>
                    <div className="font-medium">Reroute Wire</div>
                    <div className="text-xs text-muted-foreground">
                      Drag to reposition
                    </div>
                  </div>
                </button>

                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-destructive/10 dark:hover:bg-destructive/20 text-destructive flex items-center gap-3 transition-colors"
                  onClick={() => {
                    onRemove?.()
                    setShowContextMenu(false)
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                  <div>
                    <div className="font-medium">Delete Wire</div>
                    <div className="text-xs text-gray-500">
                      Remove connection
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison function for better performance
    return (
      prevProps.connection.id === nextProps.connection.id &&
      prevProps.connection.value === nextProps.connection.value &&
      prevProps.isSelected === nextProps.isSelected &&
      JSON.stringify(prevProps.connection.path) ===
        JSON.stringify(nextProps.connection.path)
    )
  }
)
