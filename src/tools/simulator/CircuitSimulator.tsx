import React, { useState } from 'react'
import { CircuitCanvas } from './components/CircuitCanvas'
import { ComponentPalette } from './components/ComponentPalette'
import { SimulatorToolbar } from './components/SimulatorToolbar'
import { PropertiesPanel } from './components/PropertiesPanel'
import { BooleanExpressionInput } from './components/BooleanExpressionInput'
import { useCircuitSimulator } from './hooks/useCircuitSimulator'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { parseExpression } from './utils/expressionParser'
import { generateCircuitFromExpression } from './utils/circuitGenerator'
import type {
  Component,
  ComponentType,
  ToolbarState,
  Connection,
} from './types'
import { MousePointer, Hand, Cable, Cpu, Boxes, Settings } from 'lucide-react'

export const CircuitSimulator: React.FC = () => {
  // Undo/redo state
  const circuitHook = useCircuitSimulator()
  const [undoStack, setUndoStack] = useState<any[]>([])
  const [redoStack, setRedoStack] = useState<any[]>([])
  const isUndoingRef = React.useRef(false)

  // Save state to undo stack on every change (but not during undo/redo operations)
  React.useEffect(() => {
    if (!isUndoingRef.current) {
      setUndoStack((stack) => {
        // Avoid adding duplicate states
        const lastState = stack[stack.length - 1]
        if (
          lastState &&
          JSON.stringify(lastState) === JSON.stringify(circuitHook.circuitState)
        ) {
          return stack
        }
        return [...stack, circuitHook.circuitState]
      })
      // Clear redo stack on new action
      setRedoStack([])
    }
    // eslint-disable-next-line
  }, [circuitHook.circuitState])

  const handleUndo = () => {
    if (undoStack.length > 1) {
      isUndoingRef.current = true
      const prev = undoStack[undoStack.length - 2]
      setUndoStack((stack) => stack.slice(0, -1))
      setRedoStack((stack) => [circuitHook.circuitState, ...stack])
      circuitHook.setCircuitState(prev)
      // Reset flag after state update completes
      setTimeout(() => {
        isUndoingRef.current = false
      }, 0)
    }
  }

  const handleRedo = () => {
    if (redoStack.length > 0) {
      isUndoingRef.current = true
      const next = redoStack[0]
      setRedoStack((stack) => stack.slice(1))
      setUndoStack((stack) => [...stack, next])
      circuitHook.setCircuitState(next)
      // Reset flag after state update completes
      setTimeout(() => {
        isUndoingRef.current = false
      }, 0)
    }
  }
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    selectedTool: 'select',
    selectedComponentType: null,
  })
  const [showBooleanExpression, setShowBooleanExpression] = useState(false)
  const [currentBooleanExpression, setCurrentBooleanExpression] =
    useState<string>('')

  // Mobile drawer states
  const [showComponentDrawer, setShowComponentDrawer] = useState(false)
  const [showPropertiesDrawer, setShowPropertiesDrawer] = useState(false)

  // Monitor circuit state and clear expression when circuit is empty
  React.useEffect(() => {
    // If there are no components, clear the boolean expression
    if (circuitHook.circuitState.components.length === 0) {
      setCurrentBooleanExpression('')
    }
  }, [circuitHook.circuitState.components.length])

  // Auto-close properties drawer on deselection
  React.useEffect(() => {
    if (
      !circuitHook.circuitState.selectedComponent &&
      !circuitHook.circuitState.selectedConnection
    ) {
      setShowPropertiesDrawer(false)
    }
  }, [
    circuitHook.circuitState.selectedComponent,
    circuitHook.circuitState.selectedConnection,
  ])

  const tools = [
    {
      id: 'select' as const,
      name: 'Select',
      icon: MousePointer,
      description: 'Select and move components',
    },
    {
      id: 'pan' as const,
      name: 'Pan',
      icon: Hand,
      description: 'Pan the canvas',
    },
    {
      id: 'wire' as const,
      name: 'Wire',
      icon: Cable,
      description: 'Connect components',
    },
    {
      id: 'component' as const,
      name: 'Component',
      icon: Cpu,
      description: 'Place components',
    },
  ]

  const handleToolSelect = (tool: ToolbarState['selectedTool']) => {
    setToolbarState({
      selectedTool: tool,
      selectedComponentType:
        tool === 'component' ? toolbarState.selectedComponentType : null,
    })
  }

  const handleComponentTypeSelect = (componentType: ComponentType) => {
    setToolbarState({
      selectedTool: 'component',
      selectedComponentType: componentType,
    })
  }

  const handleCanvasClick = (position: { x: number; y: number }) => {
    if (
      toolbarState.selectedTool === 'component' &&
      toolbarState.selectedComponentType
    ) {
      circuitHook.addComponent(toolbarState.selectedComponentType, position)
      setToolbarState((prev) => ({
        ...prev,
        selectedTool: 'select',
        selectedComponentType: null,
      }))
    }
  }

  return (
    <div className="h-full flex flex-col bg-background relative border-t border-border">
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Component Palette - Desktop sidebar */}
        <div
          className="hidden lg:flex w-56 xl:w-64 shrink-0"
          data-tour="component-palette"
        >
          <ComponentPalette
            onComponentSelect={handleComponentTypeSelect}
            selectedComponentType={toolbarState.selectedComponentType}
          />
        </div>

        {/* Main Circuit Canvas */}
        <div className="flex-1 relative min-w-0" data-tour="canvas">
          <CircuitCanvas
            circuitHook={circuitHook}
            toolbarState={toolbarState}
            onCanvasClick={handleCanvasClick}
            onToolSelect={handleToolSelect}
            tools={tools}
            showBooleanExpression={showBooleanExpression}
            onToggleBooleanExpression={() =>
              setShowBooleanExpression(!showBooleanExpression)
            }
            undoStack={undoStack}
            redoStack={redoStack}
            handleUndo={handleUndo}
            handleRedo={handleRedo}
            currentBooleanExpression={currentBooleanExpression}
          />
        </div>

        {/* Properties Panel - Desktop sidebar */}
        {(circuitHook.circuitState.selectedComponent ||
          circuitHook.circuitState.selectedConnection) && (
          <div
            className="hidden xl:flex w-72 2xl:w-80 shrink-0"
            data-tour="properties"
          >
            <PropertiesPanel circuitHook={circuitHook} />
          </div>
        )}
      </div>

      {/* Mobile Side Drawer Buttons - Fixed Bottom Right */}
      <div className="lg:hidden fixed bottom-4 right-4 z-30 flex flex-col gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowComponentDrawer(true)}
          className="h-12 w-12 rounded-full shadow-lg"
        >
          <Boxes className="h-5 w-5" />
        </Button>
        {(circuitHook.circuitState.selectedComponent ||
          circuitHook.circuitState.selectedConnection) && (
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowPropertiesDrawer(true)}
            className="h-12 w-12 rounded-full shadow-lg"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Mobile Component Palette Drawer */}
      <Sheet open={showComponentDrawer} onOpenChange={setShowComponentDrawer}>
        <SheetContent
          side="left"
          className="w-[280px] sm:w-[320px] p-0 overflow-y-auto"
        >
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle>Components</SheetTitle>
          </SheetHeader>
          <div className="h-full flex flex-col min-h-0">
            <ComponentPalette
              onComponentSelect={(type) => {
                handleComponentTypeSelect(type)
                setShowComponentDrawer(false)
              }}
              selectedComponentType={toolbarState.selectedComponentType}
              isMobile={true}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Properties Panel Drawer */}
      <Sheet open={showPropertiesDrawer} onOpenChange={setShowPropertiesDrawer}>
        <SheetContent
          side="right"
          className="w-[280px] sm:w-[320px] p-0 overflow-y-auto"
        >
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle>Properties</SheetTitle>
          </SheetHeader>
          <div className="h-full flex flex-col min-h-0">
            <PropertiesPanel circuitHook={circuitHook} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Boolean Expression Input Overlay */}
      {showBooleanExpression && (
        <div className="absolute top-16 left-4 right-4 z-20 md:left-1/2 md:transform md:-translate-x-1/2 md:max-w-2xl">
          <Card className="shadow-lg border-border bg-background/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <BooleanExpressionInput
                hasExistingCircuit={
                  circuitHook.circuitState.components.length > 0
                }
                onClose={() => setShowBooleanExpression(false)}
                onGenerateCircuit={(
                  expression: string,
                  options?: { clearExisting?: boolean }
                ) => {
                  // Store the expression for display
                  setCurrentBooleanExpression(expression)

                  // Parse the expression into an expression tree
                  const parseResult = parseExpression(expression)

                  if (!parseResult.success || !parseResult.tree) {
                    console.error(
                      'Failed to parse expression:',
                      parseResult.error
                    )
                    // TODO: Show user-friendly error message
                    return
                  }

                  // Generate circuit components and connections from expression tree
                  const circuitResult = generateCircuitFromExpression(
                    parseResult.tree,
                    parseResult.variables
                  )

                  // Clear existing circuit only if clearExisting is true (default)
                  if (options?.clearExisting !== false) {
                    circuitHook.circuitState.components.forEach(
                      (comp: Component) => {
                        circuitHook.removeComponent(comp.id)
                      }
                    )
                  }

                  // Load generated components and connections
                  // Store all components first, keeping track of both new and generated IDs
                  const componentIdMap = new Map<string, string>()
                  const addedComponents: Component[] = []

                  circuitResult.components.forEach((generatedComp) => {
                    const newComp = circuitHook.addComponent(
                      generatedComp.type,
                      generatedComp.position
                    )

                    if (!newComp) {
                      console.warn(
                        '[CircuitSimulator] Failed to add generated component',
                        generatedComp
                      )
                      return
                    }

                    componentIdMap.set(generatedComp.id, newComp.id)
                    addedComponents.push(newComp)

                    // Update label if present
                    if (generatedComp.label) {
                      circuitHook.updateComponent(newComp.id, {
                        label: generatedComp.label,
                      })
                    }
                  })

                  // Wait for React state to update before adding connections
                  setTimeout(() => {
                    circuitResult.connections.forEach((conn) => {
                      const fromCompId = componentIdMap.get(
                        conn.from.componentId
                      )
                      const toCompId = componentIdMap.get(conn.to.componentId)

                      if (fromCompId && toCompId) {
                        // Find components from our local array instead of state
                        const fromComp = addedComponents.find(
                          (c) => c.id === fromCompId
                        )
                        const toComp = addedComponents.find(
                          (c) => c.id === toCompId
                        )

                        if (fromComp && toComp) {
                          // Find matching connection points by index (preserve original mapping)
                          const fromOutputIndex =
                            conn.from.connectionPointId.includes('output_')
                              ? parseInt(
                                  conn.from.connectionPointId.split(
                                    'output_'
                                  )[1]
                                )
                              : 0
                          const toInputIndex =
                            conn.to.connectionPointId.includes('input_')
                              ? parseInt(
                                  conn.to.connectionPointId.split('input_')[1]
                                )
                              : 0

                          const fromOutput = fromComp.outputs[fromOutputIndex]
                          const toInput = toComp.inputs[toInputIndex]

                          if (fromOutput && toInput) {
                            const newConnection = circuitHook.addConnection(
                              fromCompId,
                              fromOutput.id,
                              toCompId,
                              toInput.id
                            ) as Connection | null

                            // Apply pre-calculated wire path
                            if (
                              newConnection &&
                              conn.path &&
                              conn.path.length > 0
                            ) {
                              requestAnimationFrame(() => {
                                if (circuitHook.updateConnection) {
                                  circuitHook.updateConnection(
                                    newConnection.id,
                                    {
                                      path: conn.path,
                                    }
                                  )
                                }
                              })
                            }
                          }
                        }
                      }
                    })

                    // Force an immediate simulation update after circuit generation
                    setTimeout(() => {
                      // Trigger immediate propagation by toggling a switch output (if any)
                      const switches =
                        circuitHook.circuitState.components.filter(
                          (c: Component) => c.type === 'SWITCH'
                        )
                      if (switches.length > 0) {
                        // Force re-evaluation by updating the simulator
                        circuitHook.circuitState.components.forEach(
                          (comp: Component) => {
                            circuitHook.updateComponent(comp.id, {})
                          }
                        )
                      }
                    }, 250)

                    // Close the boolean expression panel
                    setShowBooleanExpression(false)
                  }, 200)
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
