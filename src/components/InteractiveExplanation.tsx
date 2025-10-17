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
  },
  SR_LATCH: {
    circuitType: 'SR_LATCH',
    title: 'SR Latch (Set-Reset)',
    overview: 'An SR latch is a basic memory element that can store one bit of information. It has two inputs (Set and Reset) and maintains its state until changed.',
    steps: [
      {
        id: 'intro',
        title: 'Circuit Overview',
        description: 'The SR latch uses two cross-coupled NOR or NAND gates. When Set=1, output Q=1. When Reset=1, output Q=0. When both are 0, it maintains the previous state.',
        highlightComponents: []
      },
      {
        id: 'set',
        title: 'Set Operation',
        description: 'When Set input is HIGH (1), the latch sets Q to 1 and Q̄ to 0, regardless of the previous state.',
        highlightComponents: ['NOR_SET'],
        truthTableStep: {
          inputs: { S: true, R: false },
          outputs: { Q: true, Qbar: false },
          explanation: 'S=1, R=0: Latch is SET, Q=1'
        }
      },
      {
        id: 'reset',
        title: 'Reset Operation',
        description: 'When Reset input is HIGH (1), the latch resets Q to 0 and Q̄ to 1, clearing the stored value.',
        highlightComponents: ['NOR_RESET'],
        truthTableStep: {
          inputs: { S: false, R: true },
          outputs: { Q: false, Qbar: true },
          explanation: 'S=0, R=1: Latch is RESET, Q=0'
        }
      },
      {
        id: 'hold',
        title: 'Hold State',
        description: 'When both inputs are LOW (0), the latch maintains its previous output, effectively "remembering" the last stored bit.',
        highlightComponents: [],
        truthTableStep: {
          inputs: { S: false, R: false },
          outputs: { Q: false, Qbar: false },
          explanation: 'S=0, R=0: Maintains previous state (Memory)'
        }
      }
    ],
    truthTable: {
      inputs: ['S', 'R'],
      outputs: ['Q', 'Q̄'],
      rows: [
        { inputs: { S: false, R: false }, outputs: { Q: false, Qbar: false } },
        { inputs: { S: true, R: false }, outputs: { Q: true, Qbar: false } },
        { inputs: { S: false, R: true }, outputs: { Q: false, Qbar: true } },
        { inputs: { S: true, R: true }, outputs: { Q: false, Qbar: false } }
      ]
    },
    applications: ['Memory cells', 'Debouncing circuits', 'Switch contact bounce elimination', 'Control systems']
  },
  D_FLIP_FLOP: {
    circuitType: 'D_FLIP_FLOP',
    title: 'D Flip-Flop (Data/Delay)',
    overview: 'A D flip-flop captures the value of the D input at a specific clock edge and holds it stable until the next clock edge. It\'s the most common type of flip-flop.',
    steps: [
      {
        id: 'intro',
        title: 'Circuit Overview',
        description: 'The D flip-flop has two inputs: Data (D) and Clock (CLK). It transfers the D input to output Q on the rising edge of the clock.',
        highlightComponents: []
      },
      {
        id: 'clock_edge',
        title: 'Clock Edge Detection',
        description: 'The flip-flop is edge-triggered. It only responds to the rising edge (0→1 transition) of the clock signal, not the level.',
        highlightComponents: ['CLOCK_DETECTOR'],
        truthTableStep: {
          inputs: { D: true, CLK: true },
          outputs: { Q: true, Qbar: false },
          explanation: 'On CLK rising edge: D=1 is captured, Q=1'
        }
      },
      {
        id: 'data_storage',
        title: 'Data Storage',
        description: 'The value of D at the clock edge is stored and appears at Q. Changes in D between clock edges have no effect.',
        highlightComponents: ['SR_LATCH'],
        truthTableStep: {
          inputs: { D: false, CLK: true },
          outputs: { Q: false, Qbar: true },
          explanation: 'On CLK rising edge: D=0 is captured, Q=0'
        }
      }
    ],
    truthTable: {
      inputs: ['D', 'CLK'],
      outputs: ['Q', 'Q̄'],
      rows: [
        { inputs: { D: false, CLK: false }, outputs: { Q: false, Qbar: false } },
        { inputs: { D: false, CLK: true }, outputs: { Q: false, Qbar: true } },
        { inputs: { D: true, CLK: false }, outputs: { Q: false, Qbar: false } },
        { inputs: { D: true, CLK: true }, outputs: { Q: true, Qbar: false } }
      ]
    },
    applications: ['Registers', 'Shift registers', 'Memory elements', 'State machines', 'Data synchronization']
  },
  JK_FLIP_FLOP: {
    circuitType: 'JK_FLIP_FLOP',
    title: 'JK Flip-Flop',
    overview: 'The JK flip-flop is a universal flip-flop that can be configured as SR, D, or T flip-flop. It has no invalid states unlike the SR latch.',
    steps: [
      {
        id: 'intro',
        title: 'Circuit Overview',
        description: 'The JK flip-flop has J (set), K (reset), and Clock inputs. When J=K=1, it toggles the output, eliminating the invalid state problem of SR latches.',
        highlightComponents: []
      },
      {
        id: 'set',
        title: 'Set Operation',
        description: 'When J=1 and K=0 on clock edge, the output is SET to 1, similar to SR latch.',
        highlightComponents: ['AND_J'],
        truthTableStep: {
          inputs: { J: true, K: false, CLK: true },
          outputs: { Q: true, Qbar: false },
          explanation: 'J=1, K=0: Sets Q=1 on clock edge'
        }
      },
      {
        id: 'reset',
        title: 'Reset Operation',
        description: 'When J=0 and K=1 on clock edge, the output is RESET to 0.',
        highlightComponents: ['AND_K'],
        truthTableStep: {
          inputs: { J: false, K: true, CLK: true },
          outputs: { Q: false, Qbar: true },
          explanation: 'J=0, K=1: Resets Q=0 on clock edge'
        }
      },
      {
        id: 'toggle',
        title: 'Toggle Operation',
        description: 'When J=1 and K=1 on clock edge, the output toggles (flips to opposite state). This is the unique feature of JK flip-flop.',
        highlightComponents: ['FEEDBACK'],
        truthTableStep: {
          inputs: { J: true, K: true, CLK: true },
          outputs: { Q: true, Qbar: false },
          explanation: 'J=1, K=1: Toggles Q (0→1 or 1→0)'
        }
      }
    ],
    truthTable: {
      inputs: ['J', 'K', 'CLK'],
      outputs: ['Q', 'Q̄'],
      rows: [
        { inputs: { J: false, K: false, CLK: true }, outputs: { Q: false, Qbar: false } },
        { inputs: { J: false, K: true, CLK: true }, outputs: { Q: false, Qbar: true } },
        { inputs: { J: true, K: false, CLK: true }, outputs: { Q: true, Qbar: false } },
        { inputs: { J: true, K: true, CLK: true }, outputs: { Q: true, Qbar: true } }
      ]
    },
    applications: ['Counters', 'Frequency dividers', 'Shift registers', 'State machines', 'Control logic']
  },
  T_FLIP_FLOP: {
    circuitType: 'T_FLIP_FLOP',
    title: 'T Flip-Flop (Toggle)',
    overview: 'The T flip-flop toggles its output when the T input is HIGH on a clock edge. It\'s primarily used in counters and frequency division.',
    steps: [
      {
        id: 'intro',
        title: 'Circuit Overview',
        description: 'The T flip-flop has Toggle (T) and Clock inputs. When T=1 on clock edge, the output toggles. When T=0, it holds the current state.',
        highlightComponents: []
      },
      {
        id: 'hold',
        title: 'Hold Operation',
        description: 'When T=0 on clock edge, the flip-flop maintains its previous output value.',
        highlightComponents: [],
        truthTableStep: {
          inputs: { T: false, CLK: true },
          outputs: { Q: false, Qbar: false },
          explanation: 'T=0: Holds previous state'
        }
      },
      {
        id: 'toggle',
        title: 'Toggle Operation',
        description: 'When T=1 on clock edge, the output flips to its opposite value. If Q=0, it becomes 1. If Q=1, it becomes 0.',
        highlightComponents: ['XOR_TOGGLE'],
        truthTableStep: {
          inputs: { T: true, CLK: true },
          outputs: { Q: true, Qbar: false },
          explanation: 'T=1: Toggles Q (Q = !Q)'
        }
      }
    ],
    truthTable: {
      inputs: ['T', 'CLK'],
      outputs: ['Q', 'Q̄'],
      rows: [
        { inputs: { T: false, CLK: true }, outputs: { Q: false, Qbar: false } },
        { inputs: { T: true, CLK: true }, outputs: { Q: true, Qbar: false } }
      ]
    },
    applications: ['Binary counters', 'Frequency dividers', 'Clock generation', 'Ripple counters']
  },
  MULTIPLEXER_2TO1: {
    circuitType: 'MULTIPLEXER_2TO1',
    title: '2-to-1 Multiplexer',
    overview: 'A multiplexer selects one of multiple input signals and forwards it to a single output line. The 2:1 MUX selects between two inputs based on a select signal.',
    steps: [
      {
        id: 'intro',
        title: 'Circuit Overview',
        description: 'The 2:1 MUX has inputs I0, I1, select signal S, and output Y. When S=0, Y=I0. When S=1, Y=I1.',
        highlightComponents: []
      },
      {
        id: 'select_0',
        title: 'Select Input 0',
        description: 'When select S=0, the multiplexer connects input I0 to the output Y. Input I1 is ignored.',
        highlightComponents: ['AND_0', 'NOT_S'],
        truthTableStep: {
          inputs: { I0: true, I1: false, S: false },
          outputs: { Y: true },
          explanation: 'S=0: Output Y = I0 = 1'
        }
      },
      {
        id: 'select_1',
        title: 'Select Input 1',
        description: 'When select S=1, the multiplexer connects input I1 to the output Y. Input I0 is ignored.',
        highlightComponents: ['AND_1'],
        truthTableStep: {
          inputs: { I0: false, I1: true, S: true },
          outputs: { Y: true },
          explanation: 'S=1: Output Y = I1 = 1'
        }
      },
      {
        id: 'or_gate',
        title: 'Output Combination',
        description: 'An OR gate combines the outputs from both AND gates, ensuring only the selected input reaches the output.',
        highlightComponents: ['OR_OUT']
      }
    ],
    truthTable: {
      inputs: ['I0', 'I1', 'S'],
      outputs: ['Y'],
      rows: [
        { inputs: { I0: false, I1: false, S: false }, outputs: { Y: false } },
        { inputs: { I0: false, I1: true, S: false }, outputs: { Y: false } },
        { inputs: { I0: true, I1: false, S: false }, outputs: { Y: true } },
        { inputs: { I0: true, I1: true, S: false }, outputs: { Y: true } },
        { inputs: { I0: false, I1: false, S: true }, outputs: { Y: false } },
        { inputs: { I0: false, I1: true, S: true }, outputs: { Y: true } },
        { inputs: { I0: true, I1: false, S: true }, outputs: { Y: false } },
        { inputs: { I0: true, I1: true, S: true }, outputs: { Y: true } }
      ]
    },
    applications: ['Data routing', 'Signal selection', 'Arithmetic units', 'Memory addressing', 'Bus systems']
  },
  DECODER_2TO4: {
    circuitType: 'DECODER_2TO4',
    title: '2-to-4 Decoder',
    overview: 'A decoder converts binary code to one-hot output. The 2:4 decoder takes 2 inputs and activates one of 4 outputs based on the input combination.',
    steps: [
      {
        id: 'intro',
        title: 'Circuit Overview',
        description: 'The 2:4 decoder has inputs A and B, and outputs Y0, Y1, Y2, Y3. Each input combination activates exactly one output.',
        highlightComponents: []
      },
      {
        id: 'decode_00',
        title: 'Decode 00',
        description: 'When A=0, B=0 (binary 00), output Y0 is activated (Y0=1) while all others remain 0.',
        highlightComponents: ['AND_Y0'],
        truthTableStep: {
          inputs: { A: false, B: false },
          outputs: { Y0: true, Y1: false, Y2: false, Y3: false },
          explanation: 'A=0, B=0: Activates Y0'
        }
      },
      {
        id: 'decode_01',
        title: 'Decode 01',
        description: 'When A=0, B=1 (binary 01), output Y1 is activated (Y1=1) while all others remain 0.',
        highlightComponents: ['AND_Y1'],
        truthTableStep: {
          inputs: { A: false, B: true },
          outputs: { Y0: false, Y1: true, Y2: false, Y3: false },
          explanation: 'A=0, B=1: Activates Y1'
        }
      },
      {
        id: 'decode_10',
        title: 'Decode 10',
        description: 'When A=1, B=0 (binary 10), output Y2 is activated (Y2=1) while all others remain 0.',
        highlightComponents: ['AND_Y2'],
        truthTableStep: {
          inputs: { A: true, B: false },
          outputs: { Y0: false, Y1: false, Y2: true, Y3: false },
          explanation: 'A=1, B=0: Activates Y2'
        }
      },
      {
        id: 'decode_11',
        title: 'Decode 11',
        description: 'When A=1, B=1 (binary 11), output Y3 is activated (Y3=1) while all others remain 0.',
        highlightComponents: ['AND_Y3'],
        truthTableStep: {
          inputs: { A: true, B: true },
          outputs: { Y0: false, Y1: false, Y2: false, Y3: true },
          explanation: 'A=1, B=1: Activates Y3'
        }
      }
    ],
    truthTable: {
      inputs: ['A', 'B'],
      outputs: ['Y0', 'Y1', 'Y2', 'Y3'],
      rows: [
        { inputs: { A: false, B: false }, outputs: { Y0: true, Y1: false, Y2: false, Y3: false } },
        { inputs: { A: false, B: true }, outputs: { Y0: false, Y1: true, Y2: false, Y3: false } },
        { inputs: { A: true, B: false }, outputs: { Y0: false, Y1: false, Y2: true, Y3: false } },
        { inputs: { A: true, B: true }, outputs: { Y0: false, Y1: false, Y2: false, Y3: true } }
      ]
    },
    applications: ['Address decoding', 'Memory selection', 'Device selection', 'Instruction decoding', 'Output enable control']
  },
  FOUR_BIT_ADDER: {
    circuitType: 'FOUR_BIT_ADDER',
    title: '4-Bit Binary Adder',
    overview: 'A 4-bit adder adds two 4-bit binary numbers by cascading four full adders. The carry output of each full adder feeds into the carry input of the next.',
    steps: [
      {
        id: 'intro',
        title: 'Circuit Overview',
        description: 'The 4-bit adder consists of four full adders connected in series. Each adds one bit position and passes the carry to the next higher bit.',
        highlightComponents: []
      },
      {
        id: 'lsb',
        title: 'Least Significant Bit (Bit 0)',
        description: 'The first full adder adds A0 + B0 + Cin (usually 0), producing Sum0 and Carry0.',
        highlightComponents: ['FA0'],
        truthTableStep: {
          inputs: { A0: true, B0: true, Cin: false },
          outputs: { S0: false, C0: true },
          explanation: 'Bit 0: 1+1+0 = 10 (S0=0, Carry=1)'
        }
      },
      {
        id: 'bit1',
        title: 'Bit 1 Addition',
        description: 'The second full adder adds A1 + B1 + Carry0 from the previous stage.',
        highlightComponents: ['FA1']
      },
      {
        id: 'bit2',
        title: 'Bit 2 Addition',
        description: 'The third full adder adds A2 + B2 + Carry1 from the previous stage.',
        highlightComponents: ['FA2']
      },
      {
        id: 'msb',
        title: 'Most Significant Bit (Bit 3)',
        description: 'The fourth full adder adds A3 + B3 + Carry2, producing Sum3 and the final Carry-out.',
        highlightComponents: ['FA3']
      }
    ],
    truthTable: {
      inputs: ['A[3:0]', 'B[3:0]', 'Cin'],
      outputs: ['Sum[3:0]', 'Cout'],
      rows: [
        { inputs: { A: false, B: false, Cin: false }, outputs: { Sum: false, Cout: false } }
      ]
    },
    applications: ['Arithmetic logic units (ALU)', 'Calculators', 'Processors', 'Digital signal processing']
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
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default
  
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
    <div className="space-y-3">
      {/* Collapsible Header */}
      <Card className="border border-gray-200">
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors p-3"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Interactive Explanation</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isExpanded ? '▼' : '▶'}
            </Button>
          </div>
          {!isExpanded && (
            <CardDescription className="text-xs mt-1">
              Click to learn about {explanation.title}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-3 animate-in slide-in-from-top-2">
          {/* Overview */}
          <Card className="border border-gray-200">
            <CardHeader className="p-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4" />
                {explanation.title}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {explanation.overview}
              </CardDescription>
            </CardHeader>
          </Card>

      {/* Step-by-step explanation */}
      <Card className="border border-gray-200">
        <CardHeader className="p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {currentStepIndex + 1}/{explanation.steps.length}
              </Badge>
              <CardTitle className="text-sm truncate">{currentStep?.title}</CardTitle>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handlePlayPause}
                disabled={currentStepIndex >= explanation.steps.length - 1}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleNext}
                disabled={currentStepIndex >= explanation.steps.length - 1}
                title="Next step"
              >
                <SkipForward className="h-3 w-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleReset}
                title="Reset"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-3 pt-0">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {currentStep?.description}
          </p>
          
          {/* Truth table step */}
          {currentStep?.truthTableStep && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
              <div className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">Example:</div>
              <div className="text-xs text-blue-800 dark:text-blue-400">
                {currentStep.truthTableStep.explanation}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Truth Table */}
      <Card className="border border-gray-200">
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors p-3" 
          onClick={() => setShowTruthTable(!showTruthTable)}
        >
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-sm">Complete Truth Table</CardTitle>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" type="button">
              {showTruthTable ? '▼' : '▶'}
            </Button>
          </div>
        </CardHeader>
        
        {showTruthTable && (
          <CardContent className="p-3 pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-700">
                    {explanation.truthTable.inputs.map(input => (
                      <th key={input} className="text-left p-2 font-semibold bg-muted text-xs">{input}</th>
                    ))}
                    {explanation.truthTable.outputs.map(output => (
                      <th key={output} className="text-left p-2 font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 text-xs">{output}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {explanation.truthTable.rows.map((row, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-800 hover:bg-muted/50">
                      {explanation.truthTable.inputs.map(input => (
                        <td key={input} className="p-2 font-mono text-center">
                          {row.inputs[input] ? '1' : '0'}
                        </td>
                      ))}
                      {explanation.truthTable.outputs.map(output => (
                        <td key={output} className="p-2 font-mono text-center text-blue-600 dark:text-blue-400 font-semibold">
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
        <CardHeader className="p-3">
          <CardTitle className="text-sm">Real-World Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex flex-wrap gap-1.5">
            {explanation.applications.map((app, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {app}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
        </div>
      )}
    </div>
  );
};