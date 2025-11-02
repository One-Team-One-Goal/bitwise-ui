import React, { useState, useRef } from 'react'
import Lottie from 'lottie-react'
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
  isSelected: boolean
  className?: string
  locked?: boolean
  isCompleted?: boolean
}

const AnimatedAssessmentButton: React.FC<AnimatedAssessmentButtonProps> = ({
  onClick,
  isSelected,
  className,
  locked,
  isCompleted, // New prop for completed state
}) => {
  const [state, setState] = useState('default')
  const animationRef = useRef(null)

  const getAnimation = () => {
    // Priority: completed > locked > normal
    if (isCompleted) {
      switch (state) {
        case 'hover':
          return completeHoverAssessment // or completeHover if reusing
        case 'pressed':
          return completePressedAssessment // or completePressed if reusing
        default:
          return completeDefaultAssessment // or completeDefault if reusing
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
    if (locked) {
      setState('hover') // Still allow hover animation for locked
    } else if (state !== 'pressed') {
      setState('hover')
    }
  }

  const handleMouseLeave = () => {
    if (state !== 'pressed') setState('default')
  }

  const handleClick = () => {
    if (locked) return // Block clicks on locked
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
          locked ? 'cursor-not-allowed' : 'cursor-pointer'
        } z-50 ${className}`}
      >
        <div
          className="flex items-center justify-center w-20 h-20 relative"
          onClick={handleClick}
        >
          {/* Lottie Animation Background */}
          <div className="absolute inset-0 scale-75">
            <Lottie
              animationData={getAnimation()}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              loop={state !== 'pressed'}
              autoplay
              lottieRef={animationRef}
              className="w-full h-full"
            />
          </div>

          {/* Assessment Icon and Label Overlay */}
          <div
            className={`relative z-10 flex flex-col items-center justify-center transition-all duration-300 ${
              isSelected
                ? 'text-background'
                : locked
                  ? 'text-gray-500'
                  : isCompleted
                    ? 'text-background' // Keep white text for completed assessments
                    : 'text-background'
            }`}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default AnimatedAssessmentButton
