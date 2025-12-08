import * as React from 'react'
import { useRef, useCallback, useState, useEffect, useMemo } from 'react'
import type { Component, Connection, Position, ToolbarState } from '../types'
import { ConnectionRenderer } from './ConnectionRenderer'
import { ComponentRenderer } from './ComponentRenderer'
import { Button } from '@/components/ui/button'
import {
  Grid2X2,
  RotateCcw,
  Trash2,
  Calculator,
  ChevronDown,
  ChevronUp,
  Info,
  ChevronRight,
} from 'lucide-react'
import { deriveCircuitExpressions, formatExpression, type DerivedExpression } from '../utils/expressionDeriver'
import { HelpGuide } from './HelpGuide'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const INITIAL_CONNECTION_STATE: {
  isConnecting: boolean
  startComponent: string | null
  startConnectionPoint: string | null
  startPosition: Position | null
  currentMousePosition: Position | null
} = {
  isConnecting: false,
  startComponent: null,
  startConnectionPoint: null,
  startPosition: null,
  currentMousePosition: null,
}

/**
 * Panel component to display derived boolean expressions from circuit outputs
 */
interface DerivedExpressionsPanelProps {
  currentBooleanExpression: string
  derivedExpressions: DerivedExpression[]
}

/**
 * Normalize an expression for comparison (remove spaces, standardize operators, simplify parentheses)
 */
const normalizeExpression = (expr: string): string => {
  let normalized = expr
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/·/g, '∧')  // Standardize AND
    .replace(/\*/g, '∧')
    .replace(/&/g, '∧')
    .replace(/\+/g, '∨')  // Standardize OR
    .replace(/\|/g, '∨')
    .replace(/!/g, '¬')   // Standardize NOT
    .replace(/~/g, '¬')
    .replace(/'/g, '¬')   // Handle prime notation
    .toLowerCase()
  
  // Remove redundant outer parentheses repeatedly
  while (normalized.startsWith('(') && normalized.endsWith(')')) {
    // Check if these are matching parentheses
    let depth = 0
    let isMatching = true
    for (let i = 0; i < normalized.length - 1; i++) {
      if (normalized[i] === '(') depth++
      else if (normalized[i] === ')') depth--
      if (depth === 0 && i < normalized.length - 1) {
        isMatching = false
        break
      }
    }
    if (isMatching && depth === 1) {
      normalized = normalized.slice(1, -1)
    } else {
      break
    }
  }
  
  return normalized
}

const DerivedExpressionsPanel: React.FC<DerivedExpressionsPanelProps> = ({
  currentBooleanExpression,
  derivedExpressions,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Show panel if there's a generated expression OR derived expressions from outputs
  const hasContent = currentBooleanExpression || derivedExpressions.length > 0
  
  if (!hasContent) {
    return null
  }

  // Combine generated expression with derived expressions
  const allExpressions: Array<{ label: string; expression: string; isGenerated?: boolean; value?: boolean }> = []
  
  // Normalize the generated expression for comparison
  const normalizedGenerated = currentBooleanExpression ? normalizeExpression(currentBooleanExpression) : ''
  
  // First, add derived expressions from circuit outputs (prioritize these)
  const derivedAdded = new Set<string>()
  derivedExpressions.forEach((derived) => {
    const formattedExpr = formatExpression(derived.expression)
    const normalizedDerived = normalizeExpression(formattedExpr)
    
    allExpressions.push({
      label: derived.outputLabel,
      expression: formattedExpr,
      value: derived.outputValue,
    })
    
    derivedAdded.add(normalizedDerived)
  })
  
  // Only add the generated expression if there's no equivalent derived expression
  if (currentBooleanExpression && !derivedAdded.has(normalizedGenerated)) {
    allExpressions.push({
      label: 'F',
      expression: currentBooleanExpression,
      isGenerated: true,
    })
  }

  // If only 1-3 expressions, show inline; if more, show scrollable
  const maxVisibleExpressions = 3
  const needsScroll = allExpressions.length > maxVisibleExpressions

  return (
    <div className="absolute bottom-4 left-4 z-20">
      <div className="bg-blue-50/95 dark:bg-blue-950/95 backdrop-blur-sm rounded-lg shadow-lg border-2 border-blue-300 dark:border-blue-700 overflow-hidden transition-all">
        {/* Header */}
        <div 
          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/50 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-sm text-blue-900 dark:text-blue-100">
            Expressions ({allExpressions.length})
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 ml-auto"
            onClick={(e) => {
              e.stopPropagation()
              setIsCollapsed(!isCollapsed)
            }}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            )}
          </Button>
        </div>
        
        {/* Expressions list */}
        {!isCollapsed && (
          <div 
            className={`px-3 pb-3 ${needsScroll ? 'max-h-36 overflow-y-auto' : ''}`}
            style={{ minWidth: '200px', maxWidth: '400px' }}
          >
            <div className="space-y-2">
              {allExpressions.map((expr, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <a
                      href="/calculator"
                      onClick={() => {
                        // Save expression to localStorage so calculator can load it
                        localStorage.setItem('circuit_expression', expr.expression)
                        localStorage.setItem('circuit_expression_label', expr.label)
                      }}
                      className="flex items-center gap-2 p-2 rounded-md bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                    >
                      {/* Output indicator */}
                      {expr.value !== undefined && (
                        <div 
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            expr.value 
                              ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' 
                              : 'bg-gray-400'
                          }`}
                        />
                      )}
                      {expr.isGenerated && (
                        <div className="w-2 h-2 rounded-full flex-shrink-0 bg-blue-500" />
                      )}
                      
                      {/* Label */}
                      <span className="font-semibold text-xs text-blue-800 dark:text-blue-200 flex-shrink-0">
                        {expr.label} =
                      </span>
                      
                      {/* Expression */}
                      <span className="font-mono text-xs text-blue-700 dark:text-blue-300 truncate group-hover:text-blue-900 dark:group-hover:text-blue-100">
                        {expr.expression}
                      </span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="font-mono text-sm mb-1">{expr.label} = {expr.expression}</p>
                    <p className="text-xs text-gray-500">Click to simplify in Boolean Calculator</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface CircuitCanvasProps {
  circuitHook: any
  toolbarState: ToolbarState
  onCanvasClick: (position: Position) => void
  onToolSelect?: (tool: ToolbarState['selectedTool']) => void
  tools: Array<{
    id: string
    name: string
    icon: any
    description: string
  }>
  showBooleanExpression: boolean
  onToggleBooleanExpression: () => void
  undoStack: any[]
  redoStack: any[]
  handleUndo: () => void
  handleRedo: () => void
  currentBooleanExpression?: string
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  circuitHook,
  toolbarState,
  onCanvasClick,
  onToolSelect,
  tools,
  showBooleanExpression,
  onToggleBooleanExpression,
  undoStack,
  redoStack,
  handleUndo,
  handleRedo,
  currentBooleanExpression = '',
}) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    componentId: string | null
    startPosition: Position
    offset: Position
    hasMoved: boolean // Track if the user actually moved the mouse (drag vs click)
    multiDragOffsets: Map<string, Position> // Offsets for multi-select drag
  }>({
    isDragging: false,
    componentId: null,
    startPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    hasMoved: false,
    multiDragOffsets: new Map(),
  })
  const lastDragInfoRef = useRef<{
    componentId: string | null
    timestamp: number
  }>({ componentId: null, timestamp: 0 })

  // State for delete confirmation/animation
  const [deleteAnimation, setDeleteAnimation] = useState<{
    componentId?: string
    connectionId?: string
  } | null>(null)

  // State for box selection (drag to select multiple)
  const [selectionBox, setSelectionBox] = useState<{
    isSelecting: boolean
    startPosition: Position
    currentPosition: Position
  } | null>(null)

  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(
    new Set()
  )

  // State for bulk delete confirmation dialog
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)

  // State for clear all confirmation dialog
  const [showClearAllDialog, setShowClearAllDialog] = useState(false)

  // State for clipboard (copy/paste)
  const [clipboard, setClipboard] = useState<{
    components: Component[]
    connections: Connection[]
  } | null>(null)

  // Track previous tool for space bar toggle
  const previousToolRef = useRef<ToolbarState['selectedTool']>('select')

  // State for collapsible panels
  const [isInfoCollapsed, setIsInfoCollapsed] = useState(false)
  const [isSelectionCollapsed, setIsSelectionCollapsed] = useState(false)

  // Keyboard event handling for deleting selected items
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle deletion if the user isn't typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()

        // Handle wire deletion if a wire is selected
        if (circuitHook.circuitState.selectedConnection) {
          const connId = circuitHook.circuitState.selectedConnection

          // Show delete animation/highlight
          setDeleteAnimation({ connectionId: connId })

          // Wait briefly for visual feedback, then delete
          setTimeout(() => {
            circuitHook.removeConnection(connId)
            setDeleteAnimation(null)
          }, 150)
        }
        // FEATURE: Delete multiple selected components with confirmation
        else if (selectedComponents.size > 0) {
          setShowBulkDeleteDialog(true)
        }
        // Delete single selected component
        else if (circuitHook.circuitState.selectedComponent) {
          const compId = circuitHook.circuitState.selectedComponent

          // Show delete animation/highlight
          setDeleteAnimation({ componentId: compId })

          // Wait briefly for visual feedback, then delete
          setTimeout(() => {
            circuitHook.removeComponent(compId)
            setDeleteAnimation(null)
          }, 150)
        }
      }

      // 'Escape' key to deselect everything
      if (event.key === 'Escape') {
        circuitHook.selectComponent(null)
        circuitHook.selectConnection(null)
        setDeleteAnimation(null)
        setSelectedComponents(new Set())
        setSelectionBox(null)
      }

      // Ctrl+Z for undo
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === 'z' &&
        !event.shiftKey
      ) {
        event.preventDefault()
        if (undoStack.length > 1) {
          handleUndo()
        }
      }

      // Ctrl+Shift+Z or Ctrl+Y for redo
      if (
        ((event.ctrlKey || event.metaKey) &&
          event.key === 'z' &&
          event.shiftKey) ||
        ((event.ctrlKey || event.metaKey) && event.key === 'y')
      ) {
        event.preventDefault()
        if (redoStack.length > 0) {
          handleRedo()
        }
      }

      // R key to reset simulation
      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault()
        circuitHook.resetSimulation()
      }

      // V key for select tool
      if (event.key === 'v' || event.key === 'V') {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        )
          return
        event.preventDefault()
        onToolSelect?.('select')
      }

      // W key for wire tool
      if (event.key === 'w' || event.key === 'W') {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        )
          return
        event.preventDefault()
        onToolSelect?.('wire')
      }

      // H key for pan/hand tool
      if (event.key === 'h' || event.key === 'H') {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        )
          return
        event.preventDefault()
        onToolSelect?.('pan')
      }

      // Space bar to enable pan mode temporarily
      if (event.key === ' ' && !event.repeat) {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        )
          return
        event.preventDefault()

        // If there's a selected switch/button, toggle it
        const component = circuitHook.circuitState.components.find(
          (c: Component) => c.id === circuitHook.circuitState.selectedComponent
        )
        if (
          component &&
          (component.type === 'SWITCH' || component.type === 'PUSH_BUTTON')
        ) {
          // Toggle the output value
          const newOutputs = component.outputs.map((output: any) => ({
            ...output,
            value: !output.value,
          }))
          circuitHook.updateComponent(component.id, { outputs: newOutputs })
        } else {
          // Otherwise, switch to pan mode
          if (toolbarState.selectedTool !== 'pan') {
            previousToolRef.current = toolbarState.selectedTool
            onToolSelect?.('pan')
          }
        }
      }

      // Ctrl+A to select all components
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault()
        const allComponentIds = new Set<string>(
          circuitHook.circuitState.components.map((c: Component) => c.id)
        )
        setSelectedComponents(allComponentIds)
      }

      // G key to toggle grid
      if (event.key === 'g' || event.key === 'G') {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        )
          return
        event.preventDefault()
        circuitHook.toggleSnapToGrid?.()
      }

      // = or + key to zoom in
      if (event.key === '=' || event.key === '+') {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        )
          return
        event.preventDefault()
        setZoom((prev) => Math.min(prev + 0.1, 3))
      }

      // - key to zoom out
      if (event.key === '-' || event.key === '_') {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        )
          return
        event.preventDefault()
        setZoom((prev) => Math.max(prev - 0.1, 0.1))
      }

      // 0 key to reset zoom
      if (event.key === '0') {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        )
          return
        event.preventDefault()
        setZoom(1)
      }

      // Ctrl+C to copy selected components
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        )
          return

        // Determine which components to copy
        let componentIdsToCopy: Set<string> = new Set()

        if (selectedComponents.size > 0) {
          componentIdsToCopy = new Set(selectedComponents)
        } else if (circuitHook.circuitState.selectedComponent) {
          componentIdsToCopy = new Set([
            circuitHook.circuitState.selectedComponent,
          ])
        }

        if (componentIdsToCopy.size > 0) {
          event.preventDefault()
          // Deep clone selected components and their internal connections
          const componentsToCopy = circuitHook.circuitState.components
            .filter((c: Component) => componentIdsToCopy.has(c.id))
            .map((c: Component) => JSON.parse(JSON.stringify(c)))

          const connectionsToCopy = circuitHook.circuitState.connections
            .filter(
              (conn: Connection) =>
                componentIdsToCopy.has(conn.from.componentId) &&
                componentIdsToCopy.has(conn.to.componentId)
            )
            .map((conn: Connection) => JSON.parse(JSON.stringify(conn)))

          setClipboard({
            components: componentsToCopy,
            connections: connectionsToCopy,
          })
        }
      }

      // Ctrl+V to paste clipboard
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        )
          return

        if (clipboard && clipboard.components.length > 0) {
          event.preventDefault()

          // Create ID mapping for pasted components
          const idMap = new Map<string, string>()
          const newSelectedIds = new Set<string>()
          const newComponents: Component[] = []

          // Calculate offset for pasted components (30px down and right)
          const PASTE_OFFSET = 30

          // Add components with new IDs and offset positions
          clipboard.components.forEach((comp) => {
            const newComp = circuitHook.addComponent(comp.type, {
              x: comp.position.x + PASTE_OFFSET,
              y: comp.position.y + PASTE_OFFSET,
            })

            if (newComp) {
              idMap.set(comp.id, newComp.id)
              newSelectedIds.add(newComp.id)
              newComponents.push(newComp)

              // Copy label if it exists
              if (comp.label) {
                circuitHook.updateComponent(newComp.id, { label: comp.label })
              }
            }
          })

          // Add connections between pasted components (use a longer delay to ensure state is updated)
          setTimeout(() => {
            clipboard.connections.forEach((conn) => {
              const newFromId = idMap.get(conn.from.componentId)
              const newToId = idMap.get(conn.to.componentId)

              if (newFromId && newToId) {
                // Find components from the fresh state
                const fromComp = circuitHook.circuitState.components.find(
                  (c: Component) => c.id === newFromId
                )
                const toComp = circuitHook.circuitState.components.find(
                  (c: Component) => c.id === newToId
                )

                if (fromComp && toComp) {
                  // Find matching connection points by their relative index using the cloned clipboard data
                  const oldFromComp = clipboard.components.find(
                    (c) => c.id === conn.from.componentId
                  )
                  const oldToComp = clipboard.components.find(
                    (c) => c.id === conn.to.componentId
                  )

                  if (oldFromComp && oldToComp) {
                    const fromOutputIndex = oldFromComp.outputs.findIndex(
                      (o: any) => o.id === conn.from.connectionPointId
                    )
                    const toInputIndex = oldToComp.inputs.findIndex(
                      (i: any) => i.id === conn.to.connectionPointId
                    )

                    if (
                      fromOutputIndex !== -1 &&
                      toInputIndex !== -1 &&
                      fromComp.outputs[fromOutputIndex] &&
                      toComp.inputs[toInputIndex]
                    ) {
                      const newFromOutput = fromComp.outputs[fromOutputIndex]
                      const newToInput = toComp.inputs[toInputIndex]

                      circuitHook.addConnection(
                        newFromId,
                        newFromOutput.id,
                        newToId,
                        newToInput.id
                      )
                    }
                  }
                }
              }
            })

            // Select the pasted components
            setSelectedComponents(newSelectedIds)
          }, 150)
        }
      }

      // Ctrl+X to cut selected components
      if ((event.ctrlKey || event.metaKey) && event.key === 'x') {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        )
          return

        if (selectedComponents.size > 0) {
          event.preventDefault()
          // Copy to clipboard
          const componentsToCopy = circuitHook.circuitState.components.filter(
            (c: Component) => selectedComponents.has(c.id)
          )

          const connectionsToCopy = circuitHook.circuitState.connections.filter(
            (conn: Connection) =>
              selectedComponents.has(conn.from.componentId) &&
              selectedComponents.has(conn.to.componentId)
          )

          setClipboard({
            components: componentsToCopy,
            connections: connectionsToCopy,
          })

          // Delete selected components
          selectedComponents.forEach((compId) => {
            circuitHook.removeComponent(compId)
          })
          setSelectedComponents(new Set())
        }
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      // Release space to go back to previous tool
      if (event.key === ' ') {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        )
          return
        event.preventDefault()
        if (toolbarState.selectedTool === 'pan') {
          onToolSelect?.(previousToolRef.current)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [
    circuitHook.circuitState.selectedConnection,
    circuitHook.circuitState.selectedComponent,
    circuitHook,
    toolbarState.selectedTool,
    undoStack,
    redoStack,
    handleUndo,
    handleRedo,
    onToolSelect,
    selectedComponents,
    clipboard,
  ])

  const [panState, setPanState] = useState<{
    isPanning: boolean
    startPosition: Position
    startPan: Position
  }>({
    isPanning: false,
    startPosition: { x: 0, y: 0 },
    startPan: { x: 0, y: 0 },
  })

  const [connectionState, setConnectionState] = useState<
    typeof INITIAL_CONNECTION_STATE
  >({ ...INITIAL_CONNECTION_STATE })
  const connectionStateRef = useRef(connectionState)

  useEffect(() => {
    connectionStateRef.current = connectionState
  }, [connectionState])

  useEffect(() => {
    if (
      toolbarState.selectedTool !== 'wire' &&
      connectionStateRef.current.isConnecting
    ) {
      const resetState = { ...INITIAL_CONNECTION_STATE }
      connectionStateRef.current = resetState
      setConnectionState(resetState)
    }
  }, [toolbarState.selectedTool])

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenPos: Position): Position => {
      return {
        x: (screenPos.x - pan.x) / zoom,
        y: (screenPos.y - pan.y) / zoom,
      }
    },
    [pan, zoom]
  )

  // Handle canvas click
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent) => {
      if (dragState.isDragging || panState.isPanning) return

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const screenPosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }

      const canvasPosition = screenToCanvas(screenPosition)

      // Clear selections unless clicking on a component
      const target = event.target as HTMLElement
      if (
        target === canvasRef.current ||
        target.classList.contains('canvas-background')
      ) {
        circuitHook.selectComponent(null)
        circuitHook.selectConnection(null)

        // Reset connection state if clicking on empty canvas
        if (connectionStateRef.current.isConnecting) {
          const resetState = {
            isConnecting: false,
            startComponent: null,
            startConnectionPoint: null,
            startPosition: null,
            currentMousePosition: null,
          }
          connectionStateRef.current = resetState
          setConnectionState(resetState)
        }
      }

      onCanvasClick(canvasPosition)
    },
    [
      dragState.isDragging,
      panState.isPanning,
      onCanvasClick,
      circuitHook,
      screenToCanvas,
    ]
  )

  // Handle mouse down for canvas (pan tool or selection box)
  const handleCanvasMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (event.target !== canvasRef.current) return

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const screenPosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }

      if (toolbarState.selectedTool === 'pan') {
        setPanState({
          isPanning: true,
          startPosition: screenPosition,
          startPan: pan,
        })
        event.preventDefault()
      } else if (toolbarState.selectedTool === 'select') {
        // FEATURE: Box selection - drag on empty canvas to select multiple
        const canvasPos = screenToCanvas(screenPosition)
        setSelectionBox({
          isSelecting: true,
          startPosition: canvasPos,
          currentPosition: canvasPos,
        })
        event.preventDefault()
      }
    },
    [toolbarState.selectedTool, pan, screenToCanvas]
  )

  // Handle component click for interactive controls
  const handleComponentClick = useCallback(
    (componentId: string, event: React.MouseEvent) => {
      event.stopPropagation()

      const now = Date.now()
      const { componentId: lastDraggedId, timestamp } = lastDragInfoRef.current
      const DRAG_CLICK_SUPPRESSION_MS = 250

      if (
        lastDraggedId === componentId &&
        now - timestamp < DRAG_CLICK_SUPPRESSION_MS
      ) {
        lastDragInfoRef.current = { componentId: null, timestamp: 0 }
        return
      }

      // Handle interactive input controls
      const component = circuitHook.circuitState.components.find(
        (c: Component) => c.id === componentId
      )
      if (!component) return

      // Toggle output for interactive input components
      if (
        component.type === 'SWITCH' ||
        component.type === 'PUSH_BUTTON' ||
        component.type === 'HIGH_CONSTANT' ||
        component.type === 'LOW_CONSTANT'
      ) {
        // Toggle the output value
        const newOutputs = component.outputs.map((output: any) => ({
          ...output,
          value: !output.value,
        }))

        // CRITICAL FIX: Build updated component with deep copy of outputs
        const updatedComponent: Component = {
          ...component,
          outputs: newOutputs,
          inputs: component.inputs.map((i: any) => ({ ...i })), // Ensure inputs are also copied
        }

        // Update React state
        circuitHook.updateComponent(componentId, { outputs: newOutputs })

        // CRITICAL FIX: Immediately sync to simulator with proper deep copy
        // The simulator needs the updated values right away, not in 50ms
        const allComponents = circuitHook.circuitState.components.map(
          (c: Component) => (c.id === componentId ? updatedComponent : c)
        )
        circuitHook.simulator.setComponents(allComponents)
      }
    },
    [circuitHook, lastDragInfoRef]
  )

  // Handle component mouse down
  const handleComponentMouseDown = useCallback(
    (componentId: string, event: React.MouseEvent) => {
      event.stopPropagation()

      if (toolbarState.selectedTool === 'select') {
        // If clicking on a component that's part of multi-selection, don't deselect others
        if (!selectedComponents.has(componentId)) {
          // If not holding shift, clear selection and select just this one
          if (!event.shiftKey) {
            setSelectedComponents(new Set())
          }
          circuitHook.selectComponent(componentId)
        }

        const component = circuitHook.circuitState.components.find(
          (c: Component) => c.id === componentId
        )
        if (!component) return

        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const screenPos = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        }

        const canvasPos = screenToCanvas(screenPos)

        // Calculate offsets for all selected components (for multi-drag)
        const multiDragOffsets = new Map<string, Position>()
        const componentsToMove = selectedComponents.has(componentId) 
          ? selectedComponents 
          : new Set([componentId])
        
        componentsToMove.forEach((compId) => {
          const comp = circuitHook.circuitState.components.find(
            (c: Component) => c.id === compId
          )
          if (comp) {
            multiDragOffsets.set(compId, {
              x: canvasPos.x - comp.position.x,
              y: canvasPos.y - comp.position.y,
            })
          }
        })

        setDragState({
          isDragging: true,
          componentId,
          startPosition: canvasPos,
          offset: {
            x: canvasPos.x - component.position.x,
            y: canvasPos.y - component.position.y,
          },
          hasMoved: false,
          multiDragOffsets,
        })
      }
    },
    [toolbarState.selectedTool, circuitHook, screenToCanvas, selectedComponents]
  )

  // Handle connection point click
  const handleConnectionPointClick = useCallback(
    (
      componentId: string,
      connectionPointId: string,
      event: React.MouseEvent
    ) => {
      event.stopPropagation()

      console.log('[handleConnectionPointClick] called:', {
        componentId,
        connectionPointId,
        tool: toolbarState.selectedTool,
      })

      if (toolbarState.selectedTool !== 'wire') {
        console.log(
          '[handleConnectionPointClick] Not in wire mode, ignoring click'
        )
        return
      }

      const currentState = connectionStateRef.current

      if (!currentState.isConnecting) {
        // Start a new connection - find the component and connection point position
        const component = circuitHook.circuitState.components.find(
          (c: Component) => c.id === componentId
        )
        if (!component) {
          console.log(
            '[handleConnectionPointClick] Component not found:',
            componentId
          )
          return
        }

        // Find the connection point to get its position
        const allPoints = [...component.inputs, ...component.outputs]
        const connectionPoint = allPoints.find(
          (p: any) => p.id === connectionPointId
        )
        if (!connectionPoint) {
          console.log(
            '[handleConnectionPointClick] Connection point not found:',
            connectionPointId
          )
          return
        }

        // If this connection point is already connected, remove existing wires to allow rerouting
        const connectionsAtPoint = circuitHook.circuitState.connections.filter(
          (conn: Connection) => {
            if (connectionPoint.type === 'output') {
              return (
                conn.from.componentId === componentId &&
                conn.from.connectionPointId === connectionPointId
              )
            }
            return (
              conn.to.componentId === componentId &&
              conn.to.connectionPointId === connectionPointId
            )
          }
        )

        if (connectionsAtPoint.length > 0) {
          const shouldDetach =
            connectionPoint.type === 'input' || connectionsAtPoint.length === 1
          if (shouldDetach) {
            console.log(
              '[handleConnectionPointClick] Detaching existing connections before rerouting:',
              connectionsAtPoint.map((conn: Connection) => conn.id)
            )
            connectionsAtPoint.forEach((conn: Connection) =>
              circuitHook.removeConnection(conn.id)
            )
          }
        }

        console.log('[handleConnectionPointClick] Starting connection from:', {
          component: component.type,
          pointType: connectionPoint.type,
          pointId: connectionPointId,
        })

        // Calculate the absolute position of the connection point
        const startPos = {
          x: component.position.x + connectionPoint.position.x,
          y: component.position.y + connectionPoint.position.y,
        }

        let initialCursorPosition = startPos
        const canvasRect = canvasRef.current?.getBoundingClientRect()
        if (canvasRect) {
          const screenPosition = {
            x: event.clientX - canvasRect.left,
            y: event.clientY - canvasRect.top,
          }
          initialCursorPosition = screenToCanvas(screenPosition)
        }

        const nextState = {
          isConnecting: true,
          startComponent: componentId,
          startConnectionPoint: connectionPointId,
          startPosition: startPos,
          currentMousePosition: initialCursorPosition,
        }
        connectionStateRef.current = nextState
        setConnectionState(nextState)
      } else {
        console.log(
          '[handleConnectionPointClick] Attempting to complete connection to:',
          { componentId, connectionPointId }
        )

        // Check if clicking the same connection point - if so, cancel the connection
        if (
          currentState.startComponent === componentId &&
          currentState.startConnectionPoint === connectionPointId
        ) {
          console.log(
            '[handleConnectionPointClick] Clicked same connection point - canceling connection'
          )
          const resetState = { ...INITIAL_CONNECTION_STATE }
          connectionStateRef.current = resetState
          setConnectionState(resetState)
          return
        }

        // Complete the connection
        if (currentState.startComponent && currentState.startConnectionPoint) {
          // Check if we're connecting output to input
          const startComponent = circuitHook.circuitState.components.find(
            (c: Component) => c.id === currentState.startComponent
          )
          const endComponent = circuitHook.circuitState.components.find(
            (c: Component) => c.id === componentId
          )

          if (startComponent && endComponent) {
            const startIsOutput = startComponent.outputs.some(
              (o: any) => o.id === currentState.startConnectionPoint
            )
            const endIsInput = endComponent.inputs.some(
              (i: any) => i.id === connectionPointId
            )
            const startIsInput = startComponent.inputs.some(
              (i: any) => i.id === currentState.startConnectionPoint
            )
            const endIsOutput = endComponent.outputs.some(
              (o: any) => o.id === connectionPointId
            )

            console.log('[handleConnectionPointClick] Connection analysis:', {
              start: {
                component: startComponent.type,
                isOutput: startIsOutput,
                isInput: startIsInput,
              },
              end: {
                component: endComponent.type,
                isOutput: endIsOutput,
                isInput: endIsInput,
              },
            })

            // Case 1: Output → Input (normal direction)
            if (startIsOutput && endIsInput) {
              console.log(
                '[handleConnectionPointClick] Valid connection: Output to Input'
              )
              const result = circuitHook.addConnection(
                currentState.startComponent,
                currentState.startConnectionPoint,
                componentId,
                connectionPointId
              )
              if (result) {
                console.log(
                  '[handleConnectionPointClick] Connection created successfully'
                )
              } else {
                console.warn(
                  '[handleConnectionPointClick] Connection failed - may already exist or invalid'
                )
              }
            }
            // Case 2: Input → Output (reverse direction, swap the order)
            else if (startIsInput && endIsOutput) {
              console.log(
                '[handleConnectionPointClick] Valid connection (reversed): Input to Output, swapping order'
              )
              const result = circuitHook.addConnection(
                componentId,
                connectionPointId,
                currentState.startComponent,
                currentState.startConnectionPoint
              )
              if (result) {
                console.log(
                  '[handleConnectionPointClick] Connection created successfully (reversed)'
                )
              } else {
                console.warn(
                  '[handleConnectionPointClick] Connection failed - may already exist or invalid'
                )
              }
            }
            // Case 3: Invalid connections (input→input or output→output)
            else {
              const errorType =
                startIsOutput && endIsOutput
                  ? 'output to output'
                  : startIsInput && endIsInput
                    ? 'input to input'
                    : 'unknown type'
              console.warn(
                '[handleConnectionPointClick] Invalid connection:',
                errorType
              )

              // Show error message to user
              const errorMsg = document.createElement('div')
              errorMsg.className =
                'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-background px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce'
              errorMsg.textContent = `Invalid Connection: Cannot connect ${errorType}`
              document.body.appendChild(errorMsg)
              setTimeout(() => {
                errorMsg.style.transition = 'opacity 0.3s'
                errorMsg.style.opacity = '0'
                setTimeout(() => document.body.removeChild(errorMsg), 300)
              }, 2000)
            }
          }
        }

        // Reset connection state
        const resetState = { ...INITIAL_CONNECTION_STATE }
        connectionStateRef.current = resetState
        setConnectionState(resetState)
      }
    },
    [
      toolbarState.selectedTool,
      circuitHook.circuitState.components,
      circuitHook.circuitState.connections,
      circuitHook.addConnection,
      circuitHook.removeConnection,
      screenToCanvas,
    ]
  )

  // Utility function to update wire paths when components move
  const updateWirePathsForComponent = useCallback(
    (componentId: string) => {
      const component = circuitHook.circuitState.components.find(
        (c: Component) => c.id === componentId
      )
      if (!component) return

      // Find all connections that involve this component
      const connectionsToUpdate = circuitHook.circuitState.connections.filter(
        (conn: Connection) =>
          conn.from.componentId === componentId ||
          conn.to.componentId === componentId
      )

      // Update each connection's path
      connectionsToUpdate.forEach((connection: Connection) => {
        const fromComponent = circuitHook.circuitState.components.find(
          (c: Component) => c.id === connection.from.componentId
        )
        const toComponent = circuitHook.circuitState.components.find(
          (c: Component) => c.id === connection.to.componentId
        )

        if (fromComponent && toComponent) {
          // Calculate new start and end positions based on component positions
          const fromPoint = fromComponent.outputs.find(
            (o: any) => o.id === connection.from.connectionPointId
          )
          const toPoint = toComponent.inputs.find(
            (i: any) => i.id === connection.to.connectionPointId
          )

          if (fromPoint && toPoint) {
            // Calculate connection point positions
            const startX = fromComponent.position.x + fromPoint.position.x
            const startY = fromComponent.position.y + fromPoint.position.y
            const endX = toComponent.position.x + toPoint.position.x
            const endY = toComponent.position.y + toPoint.position.y

            // Only update if we have a valid path
            if (!connection.path || connection.path.length < 2) {
              const newPath = [
                { x: startX, y: startY },
                { x: endX, y: endY },
              ]
              if (circuitHook.updateConnection) {
                circuitHook.updateConnection(connection.id, { path: newPath })
              }
              return
            }

            const existingPath = connection.path
            const startPoint = { x: startX, y: startY }
            const endPoint = { x: endX, y: endY }
            const oldStart = existingPath[0]
            const oldEnd = existingPath[existingPath.length - 1]

            // Calculate deltas
            const deltaFromX = startPoint.x - oldStart.x
            const deltaFromY = startPoint.y - oldStart.y
            const deltaToX = endPoint.x - oldEnd.x
            const deltaToY = endPoint.y - oldEnd.y

            // Skip update if no change
            if (
              Math.abs(deltaFromX) < 0.01 &&
              Math.abs(deltaFromY) < 0.01 &&
              Math.abs(deltaToX) < 0.01 &&
              Math.abs(deltaToY) < 0.01
            ) {
              return
            }

            // Update path with interpolation for middle points
            const newPath = existingPath.map((point, index) => {
              if (index === 0) return startPoint
              if (index === existingPath.length - 1) return endPoint

              // Interpolate middle points based on their position ratio
              const ratio = index / (existingPath.length - 1)
              return {
                x: point.x + deltaFromX * (1 - ratio) + deltaToX * ratio,
                y: point.y + deltaFromY * (1 - ratio) + deltaToY * ratio,
              }
            })

            if (circuitHook.updateConnection) {
              circuitHook.updateConnection(connection.id, { path: newPath })
            }
          }
        }
      })
    },
    [circuitHook]
  )

  // Handle mouse move
  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const screenPos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }

      // Update wire preview position when in connecting mode
      if (
        connectionStateRef.current.isConnecting &&
        connectionStateRef.current.startPosition
      ) {
        const canvasPos = screenToCanvas(screenPos)
        setConnectionState((prev) => {
          const nextState = {
            ...prev,
            currentMousePosition: canvasPos,
          }
          connectionStateRef.current = nextState
          return nextState
        })
      }

      // Handle box selection
      if (selectionBox?.isSelecting) {
        const canvasPos = screenToCanvas(screenPos)
        setSelectionBox((prev) =>
          prev
            ? {
                ...prev,
                currentPosition: canvasPos,
              }
            : null
        )

        // Calculate which components are in the selection box
        const minX = Math.min(selectionBox.startPosition.x, canvasPos.x)
        const maxX = Math.max(selectionBox.startPosition.x, canvasPos.x)
        const minY = Math.min(selectionBox.startPosition.y, canvasPos.y)
        const maxY = Math.max(selectionBox.startPosition.y, canvasPos.y)

        const selectedIds = new Set<string>()
        circuitHook.circuitState.components.forEach((component: Component) => {
          const compCenterX = component.position.x + component.size.width / 2
          const compCenterY = component.position.y + component.size.height / 2

          if (
            compCenterX >= minX &&
            compCenterX <= maxX &&
            compCenterY >= minY &&
            compCenterY <= maxY
          ) {
            selectedIds.add(component.id)
          }
        })

        setSelectedComponents(selectedIds)
        return
      }

      // Handle component dragging
      if (dragState.isDragging && dragState.componentId) {
        const canvasPos = screenToCanvas(screenPos)

        // FIX: Add drag threshold to distinguish between click and drag
        // Only start moving if user has moved at least 3 pixels (prevents accidental drags)
        const DRAG_THRESHOLD = 3
        const distance = Math.sqrt(
          Math.pow(canvasPos.x - dragState.startPosition.x, 2) +
            Math.pow(canvasPos.y - dragState.startPosition.y, 2)
        )

        // Only move component if past threshold
        if (distance > DRAG_THRESHOLD || dragState.hasMoved) {
          // Check if we're doing multi-drag (multiple components selected)
          if (dragState.multiDragOffsets.size > 1) {
            // Move all selected components together
            dragState.multiDragOffsets.forEach((offset, compId) => {
              const newPosition = {
                x: canvasPos.x - offset.x,
                y: canvasPos.y - offset.y,
              }
              circuitHook.moveComponent(compId, newPosition)
              updateWirePathsForComponent(compId)
            })
          } else {
            // Single component drag
            const newPosition = {
              x: canvasPos.x - dragState.offset.x,
              y: canvasPos.y - dragState.offset.y,
            }
            circuitHook.moveComponent(dragState.componentId, newPosition)
            updateWirePathsForComponent(dragState.componentId)
          }

          // Mark that we've actually moved (so subsequent small movements still count)
          if (!dragState.hasMoved) {
            setDragState((prev) => ({ ...prev, hasMoved: true }))
            if (dragState.componentId) {
              lastDragInfoRef.current = {
                componentId: dragState.componentId,
                timestamp: Date.now(),
              }
            }
          }
        }
      }

      // Handle panning
      if (panState.isPanning) {
        const deltaX = screenPos.x - panState.startPosition.x
        const deltaY = screenPos.y - panState.startPosition.y

        setPan({
          x: panState.startPan.x + deltaX,
          y: panState.startPan.y + deltaY,
        })
      }
    },
    [
      dragState,
      panState,
      circuitHook,
      screenToCanvas,
      updateWirePathsForComponent,
      selectionBox,
    ]
  )

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    // Finalize box selection
    if (selectionBox?.isSelecting) {
      setSelectionBox(null)
      // Selection is already stored in selectedComponents
    }

    setDragState({
      isDragging: false,
      componentId: null,
      startPosition: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      hasMoved: false,
      multiDragOffsets: new Map(),
    })

    setPanState({
      isPanning: false,
      startPosition: { x: 0, y: 0 },
      startPan: { x: 0, y: 0 },
    })
  }, [selectionBox])

  // Handle wheel for zoom
  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      event.preventDefault()

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const mousePos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }

      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.max(0.1, Math.min(3, zoom * zoomFactor))

      // Zoom towards mouse position
      const zoomRatio = newZoom / zoom
      setPan((prev) => ({
        x: mousePos.x - (mousePos.x - prev.x) * zoomRatio,
        y: mousePos.y - (mousePos.y - prev.y) * zoomRatio,
      }))

      setZoom(newZoom)
    },
    [zoom]
  )

  // Zoom helpers: clamp and focused zoom (keeps a focus point stable when zooming)
  const clampZoom = (z: number) => Math.max(0.1, Math.min(3, z))

  const setZoomWithFocus = (newZoom: number, focusPos?: Position) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    // If we don't have a canvas rect, just set zoom
    if (!rect) {
      setZoom(newZoom)
      return
    }

    const focus = focusPos ?? { x: rect.width / 2, y: rect.height / 2 }
    const zoomRatio = newZoom / zoom

    setPan((prev) => ({
      x: focus.x - (focus.x - prev.x) * zoomRatio,
      y: focus.y - (focus.y - prev.y) * zoomRatio,
    }))

    setZoom(newZoom)
  }

  const ZOOM_STEP = 0.1
  const handleZoomDelta = (delta: number) => {
    const newZoom = clampZoom(zoom + delta)
    setZoomWithFocus(newZoom)
  }

  const handleSetZoomPercent = (percent: number) => {
    const newZoom = clampZoom(percent / 100)
    setZoomWithFocus(newZoom)
  }

  // Get cursor style based on tool
  const getCursorStyle = () => {
    switch (toolbarState.selectedTool) {
      case 'pan':
        return panState.isPanning ? 'cursor-grabbing' : 'cursor-grab'
      case 'wire':
        return 'cursor-crosshair'
      case 'component':
        return 'cursor-copy'
      default:
        return 'cursor-default'
    }
  }

  // Utility: capitalize first letter for display
  const capitalizeFirst = (s: string) =>
    s && s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s

  // Memoize component rendering to prevent unnecessary recalculations
  const renderedComponents = useMemo(() => {
    return circuitHook.circuitState.components.map((component: Component) => {
      const isSelected =
        circuitHook.circuitState.selectedComponent === component.id ||
        selectedComponents.has(component.id)
      const isBeingDeleted = deleteAnimation?.componentId === component.id

      return (
        <div
          key={component.id}
          style={{
            position: 'absolute',
            transform: `translate(${component.position.x * zoom + pan.x}px, ${component.position.y * zoom + pan.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
            width: component.size.width,
            height: component.size.height,
          }}
          className={isBeingDeleted ? 'animate-pulse opacity-50' : ''}
        >
          <ComponentRenderer
            component={component}
            isSelected={isSelected}
            currentTool={toolbarState.selectedTool}
            onMouseDown={(event: React.MouseEvent) => {
              // CRITICAL FIX: Always handle mouseDown for dragging regardless of tool
              // Connection points won't block this anymore
              if (toolbarState.selectedTool === 'select') {
                handleComponentMouseDown(component.id, event)
              }
            }}
            onClick={(event: React.MouseEvent) => {
              // Handle interactive component clicks (switches, buttons, constants)
              if (toolbarState.selectedTool === 'select') {
                handleComponentClick(component.id, event)
              }
            }}
            onConnectionPointClick={(
              connectionPointId: string,
              event: React.MouseEvent
            ) => {
              handleConnectionPointClick(component.id, connectionPointId, event)
            }}
          />
          {/* Multi-selection highlight */}
          {selectedComponents.has(component.id) && (
            <div className="absolute inset-0 border-2 border-blue-500 bg-blue-500/10 rounded-lg pointer-events-none">
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                ✓
              </div>
            </div>
          )}
          {/* Delete highlight overlay */}
          {isBeingDeleted && (
            <div className="absolute inset-0 border-4 border-red-500 rounded-lg animate-ping pointer-events-none" />
          )}
        </div>
      )
    })
  }, [
    circuitHook.circuitState.components,
    circuitHook.circuitState.selectedComponent,
    zoom,
    pan,
    toolbarState.selectedTool,
    handleComponentMouseDown,
    handleComponentClick,
    handleConnectionPointClick,
    deleteAnimation,
    selectedComponents,
  ])

  // Enhanced connection renderer with removal and editing support
  const renderConnection = useCallback(
    (connection: Connection) => {
      // Check if path exists
      if (!connection.path || connection.path.length === 0) {
        console.warn(
          '[renderConnection] Connection has no path:',
          connection.id
        )
        return null
      }

      // Apply zoom and pan to connection path (inline transformation)
      const transformedPath = connection.path.map((point) => ({
        x: point.x * zoom + pan.x,
        y: point.y * zoom + pan.y,
      }))

      const isBeingDeleted = deleteAnimation?.connectionId === connection.id

      return (
        <div
          key={connection.id}
          className={isBeingDeleted ? 'animate-pulse' : ''}
        >
          <ConnectionRenderer
            connection={{ ...connection, path: transformedPath }}
            isSelected={
              circuitHook.circuitState.selectedConnection === connection.id
            }
            onSelect={() => circuitHook.selectConnection(connection.id)}
            onRemove={() => circuitHook.removeConnection(connection.id)}
            onPathUpdate={(newPath) => {
              // Transform path back to canvas coordinates
              const canvasPath = newPath.map((point) => ({
                x: (point.x - pan.x) / zoom,
                y: (point.y - pan.y) / zoom,
              }))
              circuitHook.updateConnection?.(connection.id, {
                path: canvasPath,
              })
            }}
          />
        </div>
      )
    },
    [circuitHook, zoom, pan, deleteAnimation]
  )

  // Derive expressions from circuit outputs
  const derivedExpressions = useMemo(() => {
    return deriveCircuitExpressions(
      circuitHook.circuitState.components,
      circuitHook.circuitState.connections
    )
  }, [circuitHook.circuitState.components, circuitHook.circuitState.connections])

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Bulk Actions Toolbar - Shows when multiple components selected */}
      {selectedComponents.size > 0 && (
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 shadow-lg bg-background text-background rounded-lg border border-primary-muted animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-primary">
                {selectedComponents.size === 1
                  ? '1 selected'
                  : `${selectedComponents.size} selected`}{' '}
              </span>
            </div>
            {!isSelectionCollapsed && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedComponents(new Set())}
                  className="h-8 bg-background/20 text-xs text-primary px-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBulkDeleteDialog(true)}
                  className="bg-red-500 hover:bg-red-600 text-background text-xs"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSelectionCollapsed(!isSelectionCollapsed)}
              className="h-8 w-8 p-0 ml-1"
            >
              {isSelectionCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Tool Selection Buttons + Undo/Redo - Top Left - Responsive: Vertical on mobile, Horizontal on desktop */}
      <div className="absolute top-3 left-3 z-10 flex flex-col md:flex-row gap-0.5 p-1 bg-background/90 backdrop-blur-sm rounded-md shadow-lg border border-gray-200">
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger>
              <Button
                variant={
                  toolbarState.selectedTool === tool.id ? 'default' : 'ghost'
                }
                size="sm"
                onClick={() =>
                  onToolSelect?.(tool.id as ToolbarState['selectedTool'])
                }
                className="h-9 w-9 p-0"
              >
                <tool.icon className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{tool.description}</TooltipContent>
          </Tooltip>
        ))}
        {/* Divider for undo/redo - Horizontal on mobile, Vertical on desktop */}
        <div className="h-px w-8 md:w-px md:h-8 bg-gray-200 my-1 md:mx-1 self-center" />
        {/* Undo Button */}
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={undoStack.length <= 1}
              className="h-9 w-9 p-0"
              aria-label="Undo"
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>
        {/* Redo Button */}
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="h-9 w-9 p-0"
              aria-label="Redo"
            >
              <RotateCcw className="h-6 w-6 rotate-180" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>
      </div>

      <div className="absolute top-3 right-15 z-10 flex flex-col gap-2 p-1">
        {/* Boolean Expression Toggle */}
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant={showBooleanExpression ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleBooleanExpression}
              className="h-9 p-0"
            >
              <Calculator className="h-6 w-6 mr-2" />
              Expression to Circuit
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Boolean Expression Input</TooltipContent>
        </Tooltip>
      </div>

      {/* Controls - Top Right */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 p-1">
        {/* Clear All */}
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowClearAllDialog(true)}
              className="h-9 w-9 p-0"
            >
              <Trash2 className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear all components</TooltipContent>
        </Tooltip>

        {/* Reset */}
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="outline"
              size="sm"
              onClick={circuitHook.resetSimulation}
              className="h-9 w-9 p-0"
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Reset simulation</TooltipContent>
        </Tooltip>

        {/* Help Guide */}
        <HelpGuide />

        {/* Grid Toggle */}
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant={
                circuitHook.circuitState.snapToGrid ? 'default' : 'outline'
              }
              size="sm"
              onClick={circuitHook.toggleSnapToGrid}
              className="h-9 w-9 p-0"
            >
              <Grid2X2 className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Toggle snap to grid</TooltipContent>
        </Tooltip>
      </div>

      <div
        ref={canvasRef}
        className={`w-full h-full relative canvas-background ${getCursorStyle()} touch-none`}
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          backgroundImage: circuitHook.circuitState.snapToGrid
            ? 'radial-gradient(circle, var(--color-dotBlack) 1px, transparent 1px)'
            : undefined,
          backgroundSize: circuitHook.circuitState.snapToGrid
            ? `${20 * zoom}px ${20 * zoom}px`
            : undefined,
          backgroundPosition: circuitHook.circuitState.snapToGrid
            ? `${pan.x % (20 * zoom)}px ${pan.y % (20 * zoom)}px`
            : undefined,
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none',
          backgroundColor: 'var(--color-background)',
        }}
      >
        {/* Connections */}
        {circuitHook.circuitState.connections.map(renderConnection)}

        {/* Wire Preview - Show temporary line while connecting */}
        {connectionState.isConnecting &&
          connectionState.startPosition &&
          connectionState.currentMousePosition && (
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 15 }}
            >
              <defs>
                <marker
                  id="preview-arrowhead"
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon points="0 0, 6 3, 0 6" fill="#3b82f6" />
                </marker>
              </defs>

              {/* Glow effect */}
              <line
                x1={connectionState.startPosition.x * zoom + pan.x}
                y1={connectionState.startPosition.y * zoom + pan.y}
                x2={connectionState.currentMousePosition.x * zoom + pan.x}
                y2={connectionState.currentMousePosition.y * zoom + pan.y}
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="8"
                strokeLinecap="round"
                className="animate-pulse"
              />

              {/* Main preview line */}
              <line
                x1={connectionState.startPosition.x * zoom + pan.x}
                y1={connectionState.startPosition.y * zoom + pan.y}
                x2={connectionState.currentMousePosition.x * zoom + pan.x}
                y2={connectionState.currentMousePosition.y * zoom + pan.y}
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray="8 4"
                strokeLinecap="round"
                markerEnd="url(#preview-arrowhead)"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;12"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </line>

              {/* Start point indicator */}
              <circle
                cx={connectionState.startPosition.x * zoom + pan.x}
                cy={connectionState.startPosition.y * zoom + pan.y}
                r="6"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
                className="animate-pulse"
              />

              {/* End point cursor */}
              <circle
                cx={connectionState.currentMousePosition.x * zoom + pan.x}
                cy={connectionState.currentMousePosition.y * zoom + pan.y}
                r="8"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                className="animate-ping"
              />
              <circle
                cx={connectionState.currentMousePosition.x * zoom + pan.x}
                cy={connectionState.currentMousePosition.y * zoom + pan.y}
                r="4"
                fill="#3b82f6"
              />
            </svg>
          )}

        {/* Components */}
        {renderedComponents}

        {/* Box Selection Rectangle */}
        {selectionBox?.isSelecting && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none"
            style={{
              left:
                Math.min(
                  selectionBox.startPosition.x,
                  selectionBox.currentPosition.x
                ) *
                  zoom +
                pan.x,
              top:
                Math.min(
                  selectionBox.startPosition.y,
                  selectionBox.currentPosition.y
                ) *
                  zoom +
                pan.y,
              width:
                Math.abs(
                  selectionBox.currentPosition.x - selectionBox.startPosition.x
                ) * zoom,
              height:
                Math.abs(
                  selectionBox.currentPosition.y - selectionBox.startPosition.y
                ) * zoom,
            }}
          />
        )}
      </div>

      {/* Canvas info - Collapsible */}
      <div className="absolute bottom-4 right-4 bg-background bg-opacity-95 rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center justify-between px-3 py-2 gap-2">
          {!isInfoCollapsed && (
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                Tool:{' '}
                <span className="font-medium text-blue-600 ml-1">
                  {capitalizeFirst(String(toolbarState.selectedTool))}
                </span>
              </div>
              <div className="flex items-center gap-1">
                Components:{' '}
                <span className="font-medium ml-1">
                  {circuitHook.circuitState.components.length}
                </span>
              </div>

              {/* Zoom controls: minus button, numeric input (percent), plus button */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Zoom out"
                  onClick={() => handleZoomDelta(-ZOOM_STEP)}
                  className="inline-flex items-center justify-center rounded px-2 py-1 border border-gray-200 bg-background hover:bg-gray-50 text-sm"
                >
                  −
                </button>

                <div className="flex items-center border rounded overflow-hidden">
                  <input
                    min={10}
                    max={300}
                    step={1}
                    value={Math.round(zoom * 100)}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      if (!Number.isNaN(val)) {
                        handleSetZoomPercent(val)
                      }
                    }}
                    className="w-11 text-center px-2 py-1 text-sm outline-none"
                    aria-label="Zoom percent"
                  />
                  <span className="py-1 pr-1 text-sm text-gray-500">%</span>
                </div>

                <button
                  type="button"
                  aria-label="Zoom in"
                  onClick={() => handleZoomDelta(ZOOM_STEP)}
                  className="inline-flex items-center justify-center rounded px-2 py-1 border border-gray-200 bg-background hover:bg-gray-50 text-sm"
                >
                  +
                </button>
              </div>

              {connectionState.isConnecting && (
                <div className="text-blue-600 dark:text-blue-400 font-semibold text-[9px] sm:text-xs animate-pulse">
                  🔗 Connecting
                </div>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsInfoCollapsed(!isInfoCollapsed)}
            className="h-8 w-8 p-0 shrink-0"
          >
            {isInfoCollapsed ? (
              <Info className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Boolean Expression Display - Bottom Left */}
      <DerivedExpressionsPanel
        currentBooleanExpression={currentBooleanExpression}
        derivedExpressions={derivedExpressions}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedComponents.size} Component
              {selectedComponents.size !== 1 ? 's' : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              {selectedComponents.size === 1
                ? 'this component'
                : `these ${selectedComponents.size} components`}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                // Delete all selected components
                selectedComponents.forEach((compId) => {
                  setDeleteAnimation({ componentId: compId })
                })

                setTimeout(() => {
                  selectedComponents.forEach((compId) => {
                    circuitHook.removeComponent(compId)
                  })
                  setSelectedComponents(new Set())
                  setDeleteAnimation(null)
                }, 150)

                setShowBulkDeleteDialog(false)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog
        open={showClearAllDialog}
        onOpenChange={setShowClearAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Components?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear the entire circuit? This will
              remove all {circuitHook.circuitState.components.length} component
              {circuitHook.circuitState.components.length !== 1 ? 's' : ''} and{' '}
              {circuitHook.circuitState.connections.length} connection
              {circuitHook.circuitState.connections.length !== 1 ? 's' : ''}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                circuitHook.clearAll()
                setShowClearAllDialog(false)
                setSelectedComponents(new Set())
              }}
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
