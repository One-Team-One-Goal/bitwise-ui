import React, { useEffect, useState, useMemo } from 'react'
import { type CellValue } from '@/utils/karnaugh.utils'

interface SquareProps {
  value: CellValue
  onClick: () => void
  groupColor?: string
  className?: string
  isGrouped?: boolean
  groupConnections?: {
    top?: boolean
    right?: boolean
    bottom?: boolean
    left?: boolean
  }
  coordinates?: {
    binary: string
    minterm?: number
    variables?: string
  }
}

const Square: React.FC<SquareProps> = ({
  value,
  onClick,
  groupColor,
  className = '',
  isGrouped = false,
  groupConnections = {},
  coordinates
}) => {
  // Track theme so we can adjust subtle line colors for dark mode
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false
  )
  const [isHovered, setIsHovered] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top')
  const cellRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => obs.disconnect()
  }, [])

  // Determine if tooltip should appear above or below based on cell position
  useEffect(() => {
    if (isHovered && cellRef.current) {
      const rect = cellRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      // If cell is in top 40% of viewport, show tooltip below
      if (rect.top < viewportHeight * 0.4) {
        setTooltipPosition('bottom')
      } else {
        setTooltipPosition('top')
      }
    }
  }, [isHovered])

  const valueClass = useMemo(() => {
    // base visual classes using Tailwind dark mode support
    const base = 'text-center'
    if (value === 1)
      return `${base} font-bold ${!groupColor ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`
    if (value === 0)
      return `${base} text-muted-foreground font-normal ${!groupColor ? 'bg-muted/30 dark:bg-muted/20' : ''}`
    return `${base} font-bold ${!groupColor ? 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'text-red-600 dark:text-red-400'}`
  }, [value, groupColor])

  // Create border style based on group connections
  const getBorderStyle = () => {
    if (!isGrouped || !groupColor) {
      return null
    }

    // Create borders that appear more toward the inside using padding and positioning
    const borderColor = groupColor

    // Use a combination of margin and padding to create inward-appearing borders
    const style: React.CSSProperties = {
      position: 'relative',
      borderRadius: '4px',
    }

    // Create pseudo-element-like borders using box-shadow, but positioned more inward
    const shadows: string[] = []

    if (!groupConnections.top) {
      shadows.push(`inset 0 6px 0 -3px ${borderColor}`)
    }
    if (!groupConnections.right) {
      shadows.push(`inset -6px 0 0 -3px ${borderColor}`)
    }
    if (!groupConnections.bottom) {
      shadows.push(`inset 0 -6px 0 -3px ${borderColor}`)
    }
    if (!groupConnections.left) {
      shadows.push(`inset 6px 0 0 -3px ${borderColor}`)
    }

    if (shadows.length > 0) {
      style.boxShadow = shadows.join(', ')
    }

    // Add very subtle grid lines for connected sides (theme-aware)
    const subtle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
    if (groupConnections.top) style.borderTop = `1px solid ${subtle}`
    if (groupConnections.right) style.borderRight = `1px solid ${subtle}`
    if (groupConnections.bottom) style.borderBottom = `1px solid ${subtle}`
    if (groupConnections.left) style.borderLeft = `1px solid ${subtle}`

    return style
  }

  const borderClass =
    !isGrouped || !groupColor ? 'border border-border' : 'relative rounded-md'

  return (
    <div className={`relative group ${isHovered ? 'z-9999' : 'z-0'}`} ref={cellRef}>
      <div
        className={`
          flex items-center justify-center 
          cursor-pointer transition-all duration-200
          text-lg font-mono
          hover:scale-105 hover:shadow-lg
          active:scale-95
          ${valueClass}
          ${borderClass}
          ${className}
        `}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={!coordinates ? "Click to cycle: X → 0 → 1 → X" : undefined}
        style={{
          ...(groupColor ? { backgroundColor: `${groupColor}40` } : {}),
          ...(getBorderStyle() || {}),
          outline: 'none',
        }}
      >
        {value}
      </div>
      
      {/* Coordinate Tooltip on Hover */}
      {isHovered && coordinates && (
        <div className={`fixed px-3 py-2 bg-popover dark:bg-gray-800 border-2 border-primary/50 text-popover-foreground dark:text-gray-100 text-xs rounded-lg shadow-2xl whitespace-nowrap z-9999 pointer-events-none`}
          style={{
            top: tooltipPosition === 'top' 
              ? `${(cellRef.current?.getBoundingClientRect().top || 0) - 10}px`
              : `${(cellRef.current?.getBoundingClientRect().bottom || 0) + 10}px`,
            left: `${(cellRef.current?.getBoundingClientRect().left || 0) + (cellRef.current?.getBoundingClientRect().width || 0) / 2}px`,
            transform: tooltipPosition === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)'
          }}
        >
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-center">{coordinates.variables || coordinates.binary}</div>
            <div className="text-muted-foreground dark:text-gray-400">Binary: {coordinates.binary}</div>
            {coordinates.minterm !== undefined && (
              <div className="text-muted-foreground dark:text-gray-400">Minterm: m{coordinates.minterm}</div>
            )}
            <div className="text-xs text-muted-foreground/70 dark:text-gray-500 mt-1 text-center">Click to cycle value</div>
          </div>
          {/* Arrow pointing in appropriate direction */}
          <div className={`absolute ${tooltipPosition === 'top' ? 'top-full' : 'bottom-full'} left-1/2 transform -translate-x-1/2 ${tooltipPosition === 'top' ? '-mt-1' : '-mb-1'} z-9999`}>
            <div className={`border-4 border-transparent ${tooltipPosition === 'top' ? 'border-t-popover dark:border-t-gray-800' : 'border-b-popover dark:border-b-gray-800'}`}></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Square
