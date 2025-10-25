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
}

const Square: React.FC<SquareProps> = ({
  value,
  onClick,
  groupColor,
  className = '',
  isGrouped = false,
  groupConnections = {},
}) => {
  // Track theme so we can adjust subtle line colors for dark mode
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false
  )

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
    // base visual classes
    const base = 'text-center'
    if (value === 1)
      return `${base} text-green-600 dark:text-green-400 font-bold ${!groupColor ? 'bg-green-50 dark:bg-green-900/30' : ''}`
    if (value === 0)
      return `${base} text-muted-foreground font-normal ${!groupColor ? 'bg-gray-50 dark:bg-slate-800' : ''}`
    return `${base} text-red-600 dark:text-red-400 font-bold ${!groupColor ? 'bg-red-50 dark:bg-red-900/30' : ''}`
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
      title="Click to cycle: X → 0 → 1 → X"
      style={{
        ...(groupColor ? { backgroundColor: `${groupColor}40` } : {}),
        ...(getBorderStyle() || {}),
        outline: 'none',
      }}
    >
      {value}
    </div>
  )
}

export default Square
