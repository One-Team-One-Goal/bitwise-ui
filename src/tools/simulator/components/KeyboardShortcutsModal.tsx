import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

interface ShortcutSection {
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

const SHORTCUTS: ShortcutSection[] = [
  {
    title: 'Tools',
    shortcuts: [
      { keys: ['V'], description: 'Select tool (move and select components)' },
      { keys: ['H'], description: 'Pan tool (navigate canvas)' },
      { keys: ['W'], description: 'Wire tool (connect components)' },
      { keys: ['C'], description: 'Component tool (place components)' },
    ]
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: ['Del', 'Backspace'], description: 'Delete selected item' },
      { keys: ['Esc'], description: 'Deselect all & return to select tool' },
      { keys: ['Ctrl', 'Shift', 'Del'], description: 'Clear entire canvas (with confirmation)' },
    ]
  },
  {
    title: 'View & Navigation',
    shortcuts: [
      { keys: ['Ctrl', '+'], description: 'Zoom in' },
      { keys: ['Ctrl', '-'], description: 'Zoom out' },
      { keys: ['Ctrl', '0'], description: 'Reset zoom and pan to default' },
      { keys: ['Space', 'Drag'], description: 'Pan canvas (temporary pan mode)' },
    ]
  },
  {
    title: 'Help & Learning',
    shortcuts: [
      { keys: ['?'], description: 'Show this keyboard shortcuts guide' },
      { keys: ['Ctrl', 'K'], description: 'Open quick actions menu (lessons & examples)' },
    ]
  }
];

const KeyBadge: React.FC<{ keyName: string }> = ({ keyName }) => {
  return (
    <Badge 
      variant="outline" 
      className="px-2 py-1 font-mono text-xs bg-muted"
    >
      {keyName}
    </Badge>
  );
};

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <Keyboard className="h-6 w-6 text-primary" />
                Keyboard Shortcuts
              </CardTitle>
              <CardDescription className="mt-1">
                Master these shortcuts to design circuits faster
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 min-h-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 sm:p-6 space-y-6">
              {SHORTCUTS.map((section) => (
                <div key={section.title} className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.shortcuts.map((shortcut, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between gap-4 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm text-muted-foreground flex-1">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {shortcut.keys.map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              <KeyBadge keyName={key} />
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="text-xs text-muted-foreground mx-0.5">
                                  +
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Tips Section */}
              <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  💡 Pro Tips
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                  <li>Use <KeyBadge keyName="?" /> anytime to view these shortcuts again</li>
                  <li>Press <KeyBadge keyName="Esc" /> to quickly deselect and return to select tool</li>
                  <li>Click components directly to toggle switches and buttons</li>
                  <li>Right-click wires to delete them quickly</li>
                  <li>Zoom controls also available in bottom-right on mobile</li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </CardContent>

        <div className="border-t p-4 flex-shrink-0 bg-muted/20">
          <Button onClick={onClose} className="w-full">
            Got it! Let's build circuits
          </Button>
        </div>
      </Card>
    </div>
  );
};
