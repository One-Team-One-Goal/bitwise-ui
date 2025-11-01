import React from 'react';
import { Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const shortcutCategories = [
  {
    category: 'Tools',
    shortcuts: [
      { keys: ['V'], description: 'Select tool' },
      { keys: ['H'], description: 'Pan tool' },
      { keys: ['W'], description: 'Wire tool' },
      { keys: ['Space'], description: 'Hold to temporarily pan (release to return)' },
    ],
  },
  {
    category: 'Selection',
    shortcuts: [
      { keys: ['Ctrl', 'A'], description: 'Select all components' },
      { keys: ['Click'], description: 'Select single component' },
      { keys: ['Shift', 'Click'], description: 'Add/remove from selection' },
      { keys: ['Drag'], description: 'Box select multiple components' },
      { keys: ['Esc'], description: 'Clear selection' },
    ],
  },
  {
    category: 'Edit',
    shortcuts: [
      { keys: ['Ctrl', 'C'], description: 'Copy selected components' },
      { keys: ['Ctrl', 'X'], description: 'Cut selected components' },
      { keys: ['Ctrl', 'V'], description: 'Paste components' },
      { keys: ['Delete'], description: 'Delete selected items' },
      { keys: ['Backspace'], description: 'Delete selected items' },
      { keys: ['Ctrl', 'Z'], description: 'Undo (coming soon)' },
      { keys: ['Ctrl', 'Y'], description: 'Redo (coming soon)' },
    ],
  },
  {
    category: 'View',
    shortcuts: [
      { keys: ['Ctrl', '+'], description: 'Zoom in' },
      { keys: ['Ctrl', '-'], description: 'Zoom out' },
      { keys: ['Ctrl', '0'], description: 'Reset zoom' },
    ],
  },
  {
    category: 'Components',
    shortcuts: [
      { keys: ['Click'], description: 'Toggle switch/button state' },
      { keys: ['Space'], description: 'Toggle selected switch/button' },
    ],
  },
];

const KeyboardShortcut: React.FC<{ keys: string[]; description: string }> = ({
  keys,
  description,
}) => (
  <div className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded-md transition-colors">
    <span className="text-sm text-muted-foreground">{description}</span>
    <div className="flex gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="text-muted-foreground text-xs self-center">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

export const KeyboardShortcuts: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to work faster in the circuit simulator
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {shortcutCategories.map((category) => (
              <div key={category.category}>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="h-px flex-1 bg-border" />
                  {category.category}
                  <span className="h-px flex-1 bg-border" />
                </h3>
                <div className="space-y-1">
                  {category.shortcuts.map((shortcut, index) => (
                    <KeyboardShortcut
                      key={index}
                      keys={shortcut.keys}
                      description={shortcut.description}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
