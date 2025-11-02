import React, { useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import './introjs.css'
import rightPointSvg from '@/assets/bitbot/right-point.svg?url'


interface HelpGuideProps {
  onStartTour?: () => void;
}

export const HelpGuide: React.FC<HelpGuideProps> = ({ onStartTour }) => {
    const [isRunning, setIsRunning] = React.useState(false);

    const baseIntro = (content: string) => `
    <img src="${rightPointSvg}" class="intro-bitbot-left" alt="Bitbot" />
    <div class="space-y-2">
      ${content}
    </div>
  `
  const startTour = () => {
    if (isRunning) return; // Prevent starting tour if already running
    
    setIsRunning(true);
    const intro = introJs();
    
    intro.setOptions({
      steps: [
        {
          title: 'Welcome to Circuit Simulator!',
          intro: baseIntro('Let me guide you through creating digital circuits step by step.'),
        },
        {
          element: '[data-tour="toolbar"]',
          title: 'Toolbar',
          intro: baseIntro('Use these tools to interact with your circuit. Select components, move them, or connect wires.'),
        },
        {
          element: '[data-tour="component-palette"]',
          title: 'Component Palette',
          intro: baseIntro('Choose from logic gates, inputs, outputs, and more. Click a category to expand it.'),
        },
        {
          element: '[data-tour="canvas"]',
          title: 'Canvas',
          intro: baseIntro('This is where you build your circuit. Click to place components and drag to connect them.'),
        },
        {
          element: '[data-tour="properties"]',
          title: 'Properties Panel',
          intro: baseIntro('Adjust component settings and view information about selected components here.'),
        },
        {
          title: '🚀 Ready to Start!',
          intro: baseIntro('Try creating your first circuit:<br/>1. Select an input switch<br/>2. Add a logic gate<br/>3. Connect them with wires<br/>4. Add an LED output<br/><br/>Have fun learning!'),
        }
      ],
      showProgress: true,
      showBullets: false,
      exitOnOverlayClick: false,
      exitOnEsc: true,
      nextLabel: 'Next',
      prevLabel: 'Back',
      doneLabel: 'Start Building! 🎉',
      skipLabel: 'Skip',
    });

    intro.onbeforechange(() => {
      // Add custom styling for each step
      const tooltipLayer = document.querySelector('.introjs-tooltip');
      
      if (tooltipLayer) {
        tooltipLayer.classList.add('animate-in');
      }
      
      return true; // Continue to next step
    });

    intro.oncomplete(() => {
      localStorage.setItem('circuit-simulator-tour-seen', 'true');
      setIsRunning(false);
      if (onStartTour) onStartTour();
    });

    intro.onexit(() => {
      localStorage.setItem('circuit-simulator-tour-seen', 'true');
      setIsRunning(false);
    });

    intro.start();
  };

  // Auto-start tour for first-time users
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('circuit-simulator-tour-seen');
    if (!hasSeenTour) {
      // Delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startTour();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={startTour}
          className="h-10 w-10 p-0"
          data-tour="help-button"
          disabled={isRunning}
        >
          <HelpCircle className={`h-6 w-6 ${isRunning ? 'animate-pulse' : ''}`} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side='left'>
        {isRunning ? 'Tour in progress...' : 'Start Interactive Tour'}
      </TooltipContent>
    </Tooltip>
  );
};