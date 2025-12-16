import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OPERATOR_SYMBOLS, type OperatorInfo } from '@/constants/operatorSymbols';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '../ui/button';

interface SymbolHelpTooltipProps {
  symbol: string;
  children: React.ReactNode;
}

/**
 * Wraps a quick insert button with a tooltip showing alternative symbols
 */
export const SymbolHelpTooltip: React.FC<SymbolHelpTooltipProps> = ({ symbol, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const operatorInfo = OPERATOR_SYMBOLS.find(op => op.symbol === symbol);

  if (!operatorInfo) {
    return <>{children}</>;
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs"
          >
            <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-xl p-3 text-sm">
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                <div className="border-8 border-transparent border-t-gray-900 dark:border-t-gray-800" />
              </div>
              
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-mono">{operatorInfo.symbol}</span>
                <span className="font-bold text-primary">{operatorInfo.name}</span>
              </div>
              
              {/* Description */}
              <p className="text-gray-300 text-xs mb-2">{operatorInfo.description}</p>
              
              {/* Alternatives */}
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-xs text-gray-400">Also written as:</span>
                {operatorInfo.alternatives.slice(0, 5).map((alt, idx) => (
                  <span 
                    key={idx}
                    className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-600 rounded text-xs font-mono"
                  >
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SymbolHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full modal showing all operators and their alternatives
 */
export const SymbolHelpModal: React.FC<SymbolHelpModalProps> = ({ isOpen, onClose }) => {
  const operatorsForGuide = OPERATOR_SYMBOLS.filter(
    (op) => op.symbol !== '→' && op.symbol !== '↔'
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[80vh] bg-background rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                <h2 className="text-lg font-bold">Symbol Reference Guide</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-muted-foreground text-sm mb-4">
                Boolean operators can be written in many different ways. Here's a guide to all the symbols you can use:
              </p>
              
              <div className="space-y-4">
                {operatorsForGuide.map((op) => (
                  <OperatorCard key={op.symbol} operator={op} />
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="border-t p-4 bg-muted/30">
              <Button onClick={onClose} className="w-full">
                Got it!
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const OperatorCard: React.FC<{ operator: OperatorInfo }> = ({ operator }) => {
  return (
    <div className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Symbol */}
        <div className="shrink-0 w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
          <span className="text-3xl font-mono text-primary">{operator.symbol}</span>
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg">{operator.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{operator.description}</p>
          
          {/* Alternatives */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-medium text-muted-foreground mr-1">Alternatives:</span>
            {operator.alternatives.map((alt, idx) => (
              <span 
                key={idx}
                className="px-2 py-0.5 bg-muted rounded text-xs font-mono border"
              >
                {alt}
              </span>
            ))}
          </div>
          
          {/* Example */}
          <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono text-muted-foreground">
            Example: {operator.example}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymbolHelpModal;
