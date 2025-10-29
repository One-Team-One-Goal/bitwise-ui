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

  const valueClass = useMemo(() => {
    // base visual classes using CSS variables for theme support
    const base = 'text-center'
    if (value === 1)
      return `${base} font-bold ${!groupColor ? 'bg-(--color-greenz)/10 dark:bg-(--color-greenz)/20 text-(--color-greenz) dark:text-(--color-greenz2)' : 'text-(--color-greenz)'}`
    if (value === 0)
      return `${base} text-muted-foreground font-normal ${!groupColor ? 'bg-muted/30 dark:bg-muted/20' : ''}`
    return `${base} font-bold ${!groupColor ? 'bg-(--color-redz)/10 dark:bg-(--color-redz)/20 text-(--color-redz)' : 'text-(--color-redz)'}`
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
    <div className="relative group">
      <div
        className={`
          flex items-center justify-center 
          cursor-pointer transition-all duration-200
          text-lg font-mono
          hover:scale-105 hover:shadow-lg hover:z-10
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
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border text-popover-foreground text-xs rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-center">{coordinates.variables || coordinates.binary}</div>
            <div className="text-muted-foreground">Binary: {coordinates.binary}</div>
            {coordinates.minterm !== undefined && (
              <div className="text-muted-foreground">Minterm: m{coordinates.minterm}</div>
            )}
            <div className="text-xs text-muted-foreground/70 mt-1 text-center">Click to cycle value</div>
          </div>
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Square
