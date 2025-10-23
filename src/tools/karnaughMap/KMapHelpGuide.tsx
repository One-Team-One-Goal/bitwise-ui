import React, { useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import '@/tools/simulator/components/introjs.css'; // Reuse the same custom styles

interface KMapHelpGuideProps {
  onStartTour?: () => void;
}

export const KMapHelpGuide: React.FC<KMapHelpGuideProps> = ({ onStartTour }) => {
  const startTour = () => {
    const intro = introJs();
    
    intro.setOptions({
      steps: [
        {
          title: 'Welcome to Karnaugh Map Solver!',
          intro: `
            <div class="space-y-2">
              <p>Karnaugh Maps (K-Maps) are a visual method for simplifying Boolean expressions.</p>
              <p>Let me show you how to use this interactive tool! 🎯</p>
            </div>
          `,
        },
        {
          element: '[data-tour="variable-count"]',
          title: '📊 Variable Count',
          intro: `
            <div class="space-y-2">
              <p><strong>Start here:</strong> Choose how many variables (2-5) your Boolean function has.</p>
              <p>• 2 variables → 2×2 map (4 cells)</p>
              <p>• 3 variables → 2×4 map (8 cells)</p>
              <p>• 4 variables → 4×4 map (16 cells)</p>
              <p>• 5 variables → 4×8 map (32 cells)</p>
            </div>
          `,
        },
        {
          element: '[data-tour="form-type"]',
          title: '🔄 Form Type',
          intro: `
            <div class="space-y-2">
              <p><strong>SOP (Sum of Products):</strong> Find minimal expression with 1s</p>
              <p><strong>POS (Product of Sums):</strong> Find minimal expression with 0s</p>
              <p class="text-sm text-gray-600 mt-2">💡 Most commonly, we use SOP form.</p>
            </div>
          `,
        },
        {
          element: '[data-tour="truth-table"]',
          title: '📋 Truth Table',
          intro: `
            <div class="space-y-2">
              <p><strong>Fill in your truth table:</strong></p>
              <p>• Click any output cell to cycle: 0 → 1 → X (don't care)</p>
              <p>• Each row represents a unique combination of inputs</p>
              <p>• "X" means you don't care about that output (allows better optimization)</p>
            </div>
          `,
        },
        {
          element: '[data-tour="kmap"]',
          title: '🗺️ The K-Map Grid',
          intro: `
            <div class="space-y-2">
              <p><strong>Your visual simplification tool:</strong></p>
              <p>• Click any cell to toggle: 0 → 1 → X</p>
              <p>• Cells are arranged in <strong>Gray code order</strong> (only 1 bit changes between adjacent cells)</p>
              <p>• This arrangement helps identify groups easily!</p>
            </div>
          `,
        },
        {
          element: '[data-tour="kmap"]',
          title: '🎨 Grouping (The Magic!)',
          intro: `
            <div class="space-y-2">
              <p><strong>The solver automatically finds optimal groups:</strong></p>
              <p>• Groups must contain <strong>power of 2</strong> cells (1, 2, 4, 8, 16...)</p>
              <p>• Groups can <strong>wrap around</strong> edges (they're connected!)</p>
              <p>• Larger groups = fewer literals = simpler expression</p>
              <p>• Each color represents a different group</p>
            </div>
          `,
        },
        {
          element: '[data-tour="solution"]',
          title: '✨ Solution & Cost',
          intro: `
            <div class="space-y-2">
              <p><strong>Your simplified Boolean expression!</strong></p>
              <p>• <strong>Literal Cost:</strong> Total number of variables in the expression (lower is better)</p>
              <p>• <strong>Groups:</strong> Number of terms in the expression</p>
              <p class="text-sm text-gray-600 mt-2">💡 The solver uses Quine-McCluskey algorithm for optimal results!</p>
            </div>
          `,
        },
        {
          element: '[data-tour="set-all"]',
          title: '⚡ Quick Actions',
          intro: `
            <div class="space-y-2">
              <p><strong>Speed up your workflow:</strong></p>
              <p>• Set all cells to 0, 1, or X at once</p>
              <p>• Perfect for starting fresh or creating patterns</p>
              <p>• The solution updates automatically as you change values!</p>
            </div>
          `,
        },
        {
          title: '🚀 Try It Yourself!',
          intro: `
            <div class="space-y-3">
              <p><strong>Practice exercise:</strong></p>
              <ol class="list-decimal list-inside space-y-1">
                <li>Select 3 variables</li>
                <li>Fill in some 1s in the truth table</li>
                <li>Watch the K-Map update in real-time</li>
                <li>See how groups form automatically</li>
                <li>Get your simplified expression!</li>
              </ol>
              <p class="mt-3 text-sm text-gray-600">💡 Experiment with different patterns and see how grouping works!</p>
            </div>
          `,
        }
      ],
      showProgress: true,
      showBullets: false,
      exitOnOverlayClick: false,
      exitOnEsc: true,
      nextLabel: 'Next ->',
      prevLabel: '<- Back',
      doneLabel: 'Start Simplifying! 🎉',
      skipLabel: 'Skip Tutorial',
    });

    intro.onbeforechange(() => {
      const tooltipLayer = document.querySelector('.introjs-tooltip');
      
      if (tooltipLayer) {
        tooltipLayer.classList.add('animate-in');
      }
      
      return true;
    });

    intro.oncomplete(() => {
      localStorage.setItem('kmap-tour-seen', 'true');
      if (onStartTour) onStartTour();
    });

    intro.onexit(() => {
      localStorage.setItem('kmap-tour-seen', 'true');
    });

    intro.start();
  };

  // Auto-start tour for first-time users
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('kmap-tour-seen');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startTour();
      }, 1500); // Slightly longer delay to ensure K-Map renders
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          variant="outline"
          size="sm"
          onClick={startTour}
          className="h-10 w-10 p-0"
          data-tour="help-button"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side='left'>
        Start Interactive Tutorial
      </TooltipContent>
    </Tooltip>
  );
};
