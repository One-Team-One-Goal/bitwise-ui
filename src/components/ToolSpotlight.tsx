import React from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Calculator, Binary, Cpu, Grid3X3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ToolSpotlightProps {
  tool: 'calculator' | 'converter' | 'circuit' | 'kmap';
  title?: string;
  description?: string;
}

const TOOLS = {
  calculator: {
    icon: Calculator,
    defaultTitle: 'Boolean Calculator',
    defaultDesc: 'Try out our Boolean Calculator to simplify expressions instantly!',
    path: '/calculator',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800'
  },
  converter: {
    icon: Binary,
    defaultTitle: 'Number Converter',
    defaultDesc: 'Convert between Binary, Decimal, and Hexadecimal easily.',
    path: '/converter',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800'
  },
  circuit: {
    icon: Cpu,
    defaultTitle: 'Circuit Designer',
    defaultDesc: 'Build and simulate your own digital logic circuits.',
    path: '/digitalCircuit',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800'
  },
  kmap: {
    icon: Grid3X3,
    defaultTitle: 'K-Map Solver',
    defaultDesc: 'Solve Karnaugh Maps visually and get the simplified expression.',
    path: '/karnaughMaps',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800'
  }
};

const ToolSpotlight: React.FC<ToolSpotlightProps> = ({ tool, title, description }) => {
  const config = TOOLS[tool];
  const Icon = config.icon;

  return (
    <Card className={`my-8 overflow-hidden border-2 ${config.border} ${config.bg}`}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-center p-6 gap-6">
          <div className={`p-4 rounded-full bg-white dark:bg-gray-800 shadow-sm ${config.color}`}>
            <Icon className="w-8 h-8" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              {title || config.defaultTitle}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {description || config.defaultDesc}
            </p>
            <Button asChild variant="default" className="group">
              <Link to={config.path}>
                Try it now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolSpotlight;
