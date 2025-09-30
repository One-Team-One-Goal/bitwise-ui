import React, { useState, useEffect } from 'react';
import { BookOpen, Play, Pause, SkipForward, RotateCcw, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ExplanationStep {
  id: string;
  title: string;
  description: string;
  highlightComponents?: string[];
  highlightConnections?: string[];
  truthTableStep?: {
    inputs: Record<string, boolean>;
    outputs: Record<string, boolean>;
    explanation: string;
  };
}

interface CircuitExplanation {
  circuitType: string;
  title: string;
  overview: string;
  steps: ExplanationStep[];
  truthTable: {
    inputs: string[];
    outputs: string[];
    rows: Array<{ inputs: Record<string, boolean>; outputs: Record<string, boolean> }>;
  };
  applications: string[];
}

interface InteractiveExplanationProps {
  circuitType: string;
  onHighlight: (componentIds: string[], connectionIds: string[]) => void;
  onClearHighlight: () => void;
}

// Predefined explanations for common circuits
const CIRCUIT_EXPLANATIONS: Record<string, CircuitExplanation> = {
  HALF_ADDER: {
    circuitType: 'HALF_ADDER',
    title: 'Half Adder Circuit',
    overview: 'A half adder adds two single-bit binary numbers and produces a sum and carry output. It\'s the building block for more complex arithmetic circuits.',
    steps: [
      {
        id: 'intro',
        title: 'Circuit Overview',
        description: 'The half adder consists of an XOR gate for the sum and an AND gate for the carry. It takes two inputs A and B.',
        highlightComponents: []
      },
      {
        id: 'sum',
        title: 'Sum Calculation',
        description: 'The XOR gate produces the sum bit. It outputs 1 when inputs are different (0+1=1 or 1+0=1) and 0 when inputs are the same (0+0=0 or 1+1=0).',
        highlightComponents: ['XOR_gate'],
        truthTableStep: {
          inputs: { A: false, B: true },
          outputs: { Sum: true, Carry: false },
          explanation: 'A=0, B=1: XOR produces Sum=1'
        }
      },
      {
        id: 'carry',
        title: 'Carry Generation',
        description: 'The AND gate produces the carry bit. It outputs 1 only when both inputs are 1 (1+1=10 in binary, so Sum=0, Carry=1).',
        highlightComponents: ['AND_gate'],
        truthTableStep: {
          inputs: { A: true, B: true },
          outputs: { Sum: false, Carry: true },
          explanation: 'A=1, B=1: AND produces Carry=1, XOR produces Sum=0'
        }
      }
    ],
    truthTable: {
      inputs: ['A', 'B'],
      outputs: ['Sum', 'Carry'],
      rows: [
        { inputs: { A: false, B: false }, outputs: { Sum: false, Carry: false } },
        { inputs: { A: false, B: true }, outputs: { Sum: true, Carry: false } },
        { inputs: { A: true, B: false }, outputs: { Sum: true, Carry: false } },
        { inputs: { A: true, B: true }, outputs: { Sum: false, Carry: true } }
      ]
    },
    applications: ['Binary arithmetic', 'ALU design', 'Calculator circuits', 'Computer processors']
  },
  FULL_ADDER: {
    circuitType: 'FULL_ADDER',
    title: 'Full Adder Circuit',
    overview: 'A full adder adds three single-bit binary numbers: two operands and a carry input from a previous addition. Essential for multi-bit arithmetic.',
    steps: [
      {
        id: 'intro',
        title: 'Circuit Overview',
        description: 'The full adder uses two half adders and an OR gate. It accepts three inputs: A, B, and Carry-in (Cin).',
        highlightComponents: []
      },
      {
        id: 'first_half',
        title: 'First Half Adder',
        description: 'The first half adder adds inputs A and B, producing an intermediate sum and carry.',
        highlightComponents: ['first_XOR', 'first_AND']
      },
      {
        id: 'second_half',
        title: 'Second Half Adder',
        description: 'The second half adder adds the intermediate sum with Carry-in, producing the final sum.',
        highlightComponents: ['second_XOR', 'second_AND']
      },
      {
        id: 'final_carry',
        title: 'Final Carry',
        description: 'The OR gate combines carries from both half adders to produce the final carry output.',
        highlightComponents: ['OR_gate']
      }
    ],
    truthTable: {
      inputs: ['A', 'B', 'Cin'],
      outputs: ['Sum', 'Cout'],
      rows: [
        { inputs: { A: false, B: false, Cin: false }, outputs: { Sum: false, Cout: false } },
        { inputs: { A: false, B: false, Cin: true }, outputs: { Sum: true, Cout: false } },
        { inputs: { A: false, B: true, Cin: false }, outputs: { Sum: true, Cout: false } },
        { inputs: { A: false, B: true, Cin: true }, outputs: { Sum: false, Cout: true } },
        { inputs: { A: true, B: false, Cin: false }, outputs: { Sum: true, Cout: false } },
        { inputs: { A: true, B: false, Cin: true }, outputs: { Sum: false, Cout: true } },
        { inputs: { A: true, B: true, Cin: false }, outputs: { Sum: false, Cout: true } },
        { inputs: { A: true, B: true, Cin: true }, outputs: { Sum: true, Cout: true } }
      ]
    },
    applications: ['Multi-bit adders', 'Ripple carry adders', 'Carry-lookahead adders', 'Arithmetic units']
  }
};

export const InteractiveExplanation: React.FC<InteractiveExplanationProps> = ({
  circuitType,
  onHighlight,
  onClearHighlight
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTruthTable, setShowTruthTable] = useState(false);
  
  const explanation = CIRCUIT_EXPLANATIONS[circuitType];
  
  useEffect(() => {
    if (!explanation) return;
    
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentStepIndex < explanation.steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStepIndex(prev => {
          const next = prev + 1;
          if (next >= explanation.steps.length) {
            setIsPlaying(false);
            return prev;
          }
          return next;
        });
      }, 3000); // 3 seconds per step
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStepIndex, explanation]);

  useEffect(() => {
    if (!explanation) return;
    
    const currentStep = explanation.steps[currentStepIndex];
    if (currentStep) {
      onHighlight(
        currentStep.highlightComponents || [],
        currentStep.highlightConnections || []
      );
    }
    
    return () => {
      onClearHighlight();
    };
  }, [currentStepIndex, explanation, onHighlight, onClearHighlight]);

  if (!explanation) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5" />
            Interactive Explanation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            No explanation available for this circuit type. 
            Interactive explanations are available for premade circuits like adders and multiplexers.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentStep = explanation.steps[currentStepIndex];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentStepIndex < explanation.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };



  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-4">
      {/* Overview */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            {explanation.title}
          </CardTitle>
          <CardDescription>
            {explanation.overview}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Step-by-step explanation */}
      <Card className="border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 flex-1">
              <Badge variant="outline">
                Step {currentStepIndex + 1} of {explanation.steps.length}
              </Badge>
              <CardTitle className="text-base">{currentStep?.title}</CardTitle>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-1 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
                disabled={currentStepIndex >= explanation.steps.length - 1}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentStepIndex >= explanation.steps.length - 1}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm leading-relaxed text-gray-700">
            {currentStep?.description}
          </p>
          
          {/* Truth table step */}
          {currentStep?.truthTableStep && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-900 mb-2">Example:</div>
              <div className="text-sm text-blue-800">
                {currentStep.truthTableStep.explanation}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Truth Table */}
      <Card className="border border-gray-200">
        <CardHeader className="cursor-pointer" onClick={() => setShowTruthTable(!showTruthTable)}>
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-base">Complete Truth Table</CardTitle>
            <Button variant="ghost" size="sm" type="button">
              {showTruthTable ? '▼' : '▶'}
            </Button>
          </div>
        </CardHeader>
        
        {showTruthTable && (
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-300">
                    {explanation.truthTable.inputs.map(input => (
                      <th key={input} className="text-left p-3 font-semibold bg-gray-50">{input}</th>
                    ))}
                    {explanation.truthTable.outputs.map(output => (
                      <th key={output} className="text-left p-3 font-semibold text-blue-600 bg-blue-50">{output}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {explanation.truthTable.rows.map((row, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      {explanation.truthTable.inputs.map(input => (
                        <td key={input} className="p-3 font-mono text-center">
                          {row.inputs[input] ? '1' : '0'}
                        </td>
                      ))}
                      {explanation.truthTable.outputs.map(output => (
                        <td key={output} className="p-3 font-mono text-center text-blue-600 font-semibold">
                          {row.outputs[output] ? '1' : '0'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Applications */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">Real-World Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {explanation.applications.map((app, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {app}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};