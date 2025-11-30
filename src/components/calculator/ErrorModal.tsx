import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import bitbotIdle from '@/assets/bitbot/idle.svg';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExamples: () => void;
  errorMessage?: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  onOpenExamples,
  errorMessage,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <img 
              src={bitbotIdle} 
              alt="BitBot" 
              className="w-16 h-16 shrink-0"
            />
            <div>
              <DialogTitle className="text-lg">Oops! Invalid Expression</DialogTitle>
              <DialogDescription className="mt-2 text-sm">
                {errorMessage || "I couldn't understand that expression."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="bg-muted/50 rounded-lg p-4 mt-2">
          <p className="text-sm text-foreground mb-3">
            Here are some tips:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <span>Use the <strong>Quick Insert</strong> buttons below the input to add operators</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>Variables should be single letters like <code className="bg-background px-1 rounded">A</code>, <code className="bg-background px-1 rounded">B</code>, <code className="bg-background px-1 rounded">C</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>Check out the <strong>Examples</strong> to see valid expressions</span>
            </li>
          </ul>
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Try Again
          </Button>
          <Button onClick={() => { onClose(); onOpenExamples(); }}>
            View Examples
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
