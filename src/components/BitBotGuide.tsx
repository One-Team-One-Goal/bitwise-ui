import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle, Lightbulb } from 'lucide-react';
import bitbotIdle from '@/assets/bitbot/idle.svg';
import bitbotRightPoint from '@/assets/bitbot/right-point.svg';
import bitbotLeftPoint from '@/assets/bitbot/left-point.svg';

interface BitBotGuideProps {
  message?: string;
  emotion?: 'idle' | 'pointing-right' | 'pointing-left';
  position?: 'bottom-right' | 'bottom-left' | 'inline';
  className?: string;
  onClick?: () => void;
}

const BitBotGuide: React.FC<BitBotGuideProps> = ({
  message = "Hi! I'm BitBot. I'm here to help you learn!",
  emotion = 'idle',
  position = 'inline',
  className = '',
  onClick
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const getImage = () => {
    switch (emotion) {
      case 'pointing-right': return bitbotRightPoint;
      case 'pointing-left': return bitbotLeftPoint;
      default: return bitbotIdle;
    }
  };

  if (!isVisible) return null;

  const containerClasses = position === 'inline' 
    ? `flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 ${className}`
    : `fixed ${position === 'bottom-right' ? 'bottom-8 right-8' : 'bottom-8 left-8'} z-50 flex flex-col items-end gap-2 ${className}`;

  return (
    <div 
      className={containerClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {position !== 'inline' && (
        <AnimatePresence>
          {(isHovered || message) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-xs mb-2 relative"
            >
              <p className="text-sm text-gray-700 dark:text-gray-200">{message}</p>
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 transform rotate-45"></div>
              <button 
                onClick={() => setIsVisible(false)}
                className="absolute -top-2 -right-2 bg-gray-100 dark:bg-gray-700 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <div className="relative group cursor-pointer" onClick={onClick}>
        <motion.img
          src={getImage()}
          alt="BitBot"
          className="w-24 h-24 drop-shadow-lg"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
        {position === 'inline' && (
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-blue-600 dark:text-blue-400">BitBot</span>
              <Badge variant="secondary" className="text-xs">AI Guide</Badge>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

function Badge({ children, className, variant }: any) {
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ${className}`}>{children}</span>
}

export default BitBotGuide;
