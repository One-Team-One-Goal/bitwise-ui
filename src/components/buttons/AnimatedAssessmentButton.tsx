import React, { useState, useRef } from 'react'
import Lottie from 'lottie-react'
import { Loader2 } from 'lucide-react'
import hoverAnimation from '@/assets/animations/assessmentHover.json'
import hoverAnimationLocked from '@/assets/animations/AnimatedHoveredButtonLocked.json'
import defaultAnimation from '@/assets/animations/assessmentIdle.json'
import defaultAnimationLocked from '@/assets/animations/defaultTopicButtonLocked.json'
import pressedAnimation from '@/assets/animations/assessmentPressed.json'
import completeHoverAssessment from '@/assets/animations/completeHover.json'
import completeDefaultAssessment from '@/assets/animations/completeDefault.json'
import completePressedAssessment from '@/assets/animations/completePressed.json'

interface AnimatedAssessmentButtonProps {
  onClick: () => void
  isSelected?: boolean
  className?: string
  locked?: boolean
  isCompleted?: boolean
  loading?: boolean
  disabled?: boolean
}

const AnimatedAssessmentButton: React.FC<AnimatedAssessmentButtonProps> = ({
  onClick,
  isSelected = false,
  className,
  locked,
  isCompleted,
  loading,
  disabled
}) => {
  const [state, setState] = useState('default')
  const animationRef = useRef(null)

  const getAnimation = () => {
    // Priority: completed > locked > normal
    if (isCompleted) {
      switch (state) {
        case 'hover':
          return completeHoverAssessment
        case 'pressed':
          return completePressedAssessment
        default:
          return completeDefaultAssessment
      }
    } else if (locked) {
      switch (state) {
        case 'hover':
          return hoverAnimationLocked
        default:
          return defaultAnimationLocked
      }
    } else {
      switch (state) {
        case 'hover':
          return hoverAnimation
        case 'pressed':
          return pressedAnimation
        default:
          return defaultAnimation
      }
    }
  }

  const handleMouseEnter = () => {
    if (disabled || loading) return
    if (locked) {
      setState('hover')
    } else if (state !== 'pressed') {
      setState('hover')
    }
  }

  const handleMouseLeave = () => {
    if (state !== 'pressed') setState('default')
  }

  const handleClick = () => {
    if (locked || disabled || loading) return
    setState('pressed')
    setTimeout(() => {
      setState('default')
      onClick()
    }, 500)
  }

  return (
    <div className="relative flex items-center">
      <div
        className={`flex items-center justify-center rounded-xl transition-all duration-300 ${
          locked || disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer'
        } z-50 ${className}`}
      >
        <div
          className="flex items-center justify-center w-20 h-20 relative"
          onClick={handleClick}
        >
          {/* Lottie Animation Background */}
          <div className="absolute inset-0 scale-75">
            {loading ? (
              <div className="flex items-center justify-center w-full h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <Lottie
                animationData={getAnimation()}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                loop={state !== 'pressed'}
                autoplay
                lottieRef={animationRef}
                className={`w-full h-full ${disabled ? 'opacity-50 grayscale' : ''}`}
              />
            )}
          </div>

          {/* Assessment Icon and Label Overlay */}
          <div
            className={`relative z-10 flex flex-col items-center justify-center transition-all duration-300 ${
              isSelected
                ? 'text-background'
                : locked
                  ? 'text-gray-500'
                  : isCompleted
                    ? 'text-background'
                    : 'text-background'
            }`}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default AnimatedAssessmentButton
