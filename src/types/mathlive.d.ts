declare namespace JSX {
  interface IntrinsicElements {
    'math-field': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      value?: string
      onInput?: (event: Event) => void
      virtualKeyboardMode?: string
      toolbar?: string
    }
  }
}
