import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import bitbotIdle from '@/assets/bitbot/idle.svg';
import KMapExpressionInput from './KMapExpressionInput';

interface BitBotExpressionPromptProps {
  variableCount: number;
  onApplyExpression: (expression: string) => void;
  isVisible: boolean;
  onDismiss: () => void;
}

/**
 * BitBot-guided expression input prompt
 * A prominent, eye-catching component that encourages users to try expression input
 */
export const BitBotExpressionPrompt: React.FC<BitBotExpressionPromptProps> = ({
  variableCount,
  onApplyExpression,
  isVisible,
  onDismiss,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const handleApplyExpression = (expression: string) => {
    onApplyExpression(expression);
    setIsPopoverOpen(false);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto mb-6"
    >
      <div className="relative">
        {/* Glow effect background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl animate-pulse" />
        
        {/* Main card */}
        <motion.div
          className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-4 shadow-lg"
          animate={{
            boxShadow: [
              '0 0 20px rgba(59, 130, 246, 0.3)',
              '0 0 40px rgba(139, 92, 246, 0.4)',
              '0 0 20px rgba(59, 130, 246, 0.3)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors opacity-60 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            {/* BitBot Avatar */}
            <motion.div
              className="relative shrink-0"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <img
                src={bitbotIdle}
                alt="BitBot"
                className="w-16 h-16 drop-shadow-lg"
              />
              {/* Sparkle effect */}
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 15, -15, 0],
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </motion.div>
            </motion.div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-blue-600 dark:text-blue-400">BitBot</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full">
                  Pro Tip
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Try entering a Boolean expression!</span>{' '}
                I'll automatically fill the K-map and truth table for you. It's faster than clicking each cell! ✨
              </p>
            </div>

            {/* Action Button with Popover */}
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  className="shrink-0 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <Zap className="w-4 h-4" />
                  Try It Now
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[420px] p-0" 
                align="end" 
                side="bottom"
                sideOffset={8}
              >
                <KMapExpressionInput
                  variableCount={variableCount}
                  onApplyExpression={handleApplyExpression}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Animated border gradient */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

/**
 * Mini floating button with glowing effect
 * Always visible next to the help button, opens expression input directly
 */
interface BitBotMiniButtonProps {
  variableCount: number;
  onApplyExpression: (expression: string) => void;
}

export const BitBotMiniButton: React.FC<BitBotMiniButtonProps> = ({
  variableCount,
  onApplyExpression,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const handleApplyExpression = (expression: string) => {
    onApplyExpression(expression);
    setIsPopoverOpen(false);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Outer glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
                '0 0 20px rgba(139, 92, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)',
                '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-300 dark:border-blue-700 cursor-pointer relative overflow-hidden"
            title="Enter Boolean Expression"
          >
            {/* Inner animated gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/30 to-blue-400/20"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              style={{ backgroundSize: '200% 100%' }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <img
              src={bitbotIdle}
              alt="BitBot"
              className="w-7 h-7 relative z-10"
            />
            {/* Sparkle indicator */}
            <motion.div
              className="absolute -top-0.5 -right-0.5 z-20"
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500 drop-shadow-sm" />
            </motion.div>
          </Button>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[420px] p-0" 
        align="end" 
        side="bottom"
        sideOffset={8}
      >
        <KMapExpressionInput
          variableCount={variableCount}
          onApplyExpression={handleApplyExpression}
        />
      </PopoverContent>
    </Popover>
  );
};

export default BitBotExpressionPrompt;
