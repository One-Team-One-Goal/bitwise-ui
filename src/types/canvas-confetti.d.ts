declare module 'canvas-confetti' {
  // Options for firing confetti
  export interface Options {
    particleCount?: number
    angle?: number
    spread?: number
    startVelocity?: number
    decay?: number
    gravity?: number
    drift?: number
    ticks?: number
    x?: number
    y?: number
    shapes?: Array<'square' | 'circle'>
    zIndex?: number
    colors?: string[]
    origin?: { x?: number; y?: number }
    scalar?: number
    disableForReducedMotion?: boolean
  }

  // Global options for binding to a canvas
  export interface GlobalOptions {
    resize?: boolean
    useWorker?: boolean
  }

  // Instance that fires confetti on a bound canvas
  export interface ConfettiInstance {
    (options?: Options): Promise<null>
    reset(): void
  }

  // The default export is a callable function with extra properties
  export interface ConfettiFunction {
    (options?: Options): Promise<null>
    create(canvas: HTMLCanvasElement, options?: GlobalOptions): ConfettiInstance
    reset(): void
  }

  // For compatibility with existing imports in the codebase
  export type CreateTypes = ConfettiInstance

  const confetti: ConfettiFunction
  export default confetti
}
