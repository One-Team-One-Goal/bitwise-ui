import React, { useState } from 'react';
import { 
  BookOpen, 
  Lightbulb, 
  Zap, 
  GraduationCap,
  ChevronRight,
  Play,
  Sparkles,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  topics: string[];
  icon: React.ElementType;
}

interface ExampleCircuit {
  id: string;
  name: string;
  description: string;
  category: string;
  componentCount: number;
}

interface QuickActionsMenuProps {
  onLoadLesson: (lessonId: string) => void;
  onLoadExample: (exampleId: string) => void;
  onClose: () => void;
}

const LESSONS: Lesson[] = [
  {
    id: 'logic-gates-101',
    title: 'Logic Gates 101',
    description: 'Learn the fundamentals of digital logic gates: AND, OR, NOT, and how they form the basis of all digital circuits.',
    difficulty: 'beginner',
    duration: '15 min',
    topics: ['Basic Gates', 'Truth Tables', 'Gate Symbols'],
    icon: Zap
  },
  {
    id: 'building-adder',
    title: 'Building an Adder',
    description: 'Discover how to combine logic gates to create a half adder and full adder circuit for binary addition.',
    difficulty: 'beginner',
    duration: '20 min',
    topics: ['Half Adder', 'Full Adder', 'Binary Math'],
    icon: Sparkles
  },
  {
    id: 'flipflops-memory',
    title: 'Flip-Flops & Memory',
    description: 'Understand sequential logic, memory storage, and how flip-flops can store state in digital circuits.',
    difficulty: 'intermediate',
    duration: '25 min',
    topics: ['SR Flip-Flop', 'D Flip-Flop', 'Clock Signals'],
    icon: BookOpen
  },
  {
    id: 'multiplexers-decoders',
    title: 'Multiplexers & Decoders',
    description: 'Learn about data selection and routing using multiplexers and how decoders convert binary to specific outputs.',
    difficulty: 'intermediate',
    duration: '20 min',
    topics: ['MUX', 'DEMUX', 'Decoders', 'Data Routing'],
    icon: GraduationCap
  },
  {
    id: 'creating-counters',
    title: 'Creating Counters',
    description: 'Build binary counters using flip-flops and understand how sequential circuits can count and create patterns.',
    difficulty: 'advanced',
    duration: '30 min',
    topics: ['Binary Counter', 'Clock Division', 'State Machines'],
    icon: Play
  }
];

const EXAMPLE_CIRCUITS: ExampleCircuit[] = [
  {
    id: 'simple-and-gate',
    name: 'Simple AND Gate Demo',
    description: 'Basic demonstration of AND gate with two switches and an LED',
    category: 'Basic Gates',
    componentCount: 4
  },
  {
    id: 'xor-gate-demo',
    name: 'XOR Gate Circuit',
    description: 'XOR gate built from basic gates showing equivalence',
    category: 'Basic Gates',
    componentCount: 6
  },
  {
    id: 'half-adder-complete',
    name: 'Half Adder Circuit',
    description: 'Complete half adder with inputs, logic gates, and LED outputs',
    category: 'Arithmetic',
    componentCount: 8
  },
  {
    id: 'full-adder-complete',
    name: 'Full Adder Circuit',
    description: 'Full adder with carry input and comprehensive wiring',
    category: 'Arithmetic',
    componentCount: 12
  },
  {
    id: 'sr-flipflop-demo',
    name: 'SR Flip-Flop Demo',
    description: 'Interactive SR flip-flop with set, reset, and clock inputs',
    category: 'Sequential Logic',
    componentCount: 7
  },
  {
    id: '2to1-mux',
    name: '2:1 Multiplexer',
    description: 'Data selector showing how multiplexers route signals',
    category: 'Combinational',
    componentCount: 10
  },
  {
    id: '2to4-decoder',
    name: '2:4 Decoder Circuit',
    description: 'Binary decoder converting 2-bit input to 4 outputs',
    category: 'Combinational',
    componentCount: 9
  },
  {
    id: '7segment-display',
    name: '7-Segment Display Demo',
    description: 'BCD to 7-segment decoder showing digits',
    category: 'Displays',
    componentCount: 8
  }
];

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  onLoadLesson,
  onLoadExample,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'examples'>('lessons');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-primary" />
                Quick Start
              </CardTitle>
              <CardDescription className="mt-1">
                Choose a guided lesson or load an example circuit to begin learning
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

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === 'lessons' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('lessons')}
              className="flex-1"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Interactive Lessons
            </Button>
            <Button
              variant={activeTab === 'examples' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('examples')}
              className="flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              Example Circuits
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 min-h-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 sm:p-6">
              {activeTab === 'lessons' ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    📚 Step-by-step interactive lessons to master digital circuit design
                  </p>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    {LESSONS.map((lesson) => {
                      const IconComponent = lesson.icon;
                      return (
                        <Card 
                          key={lesson.id}
                          className="cursor-pointer hover:shadow-lg transition-all hover:border-primary group"
                          onClick={() => {
                            onLoadLesson(lesson.id);
                            onClose();
                          }}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                  <IconComponent className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <CardTitle className="text-base line-clamp-1">
                                    {lesson.title}
                                  </CardTitle>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${difficultyColors[lesson.difficulty]}`}
                                    >
                                      {lesson.difficulty}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {lesson.duration}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                            </div>
                          </CardHeader>
                          <CardContent className="pb-4">
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {lesson.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {lesson.topics.map((topic) => (
                                <Badge 
                                  key={topic} 
                                  variant="secondary" 
                                  className="text-xs"
                                >
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    ⚡ Pre-built circuits ready to explore and modify
                  </p>
                  
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {EXAMPLE_CIRCUITS.map((circuit) => (
                      <Card 
                        key={circuit.id}
                        className="cursor-pointer hover:shadow-md transition-all hover:border-primary group"
                        onClick={() => {
                          onLoadExample(circuit.id);
                          onClose();
                        }}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-sm line-clamp-2 group-hover:text-primary transition-colors">
                              {circuit.name}
                            </CardTitle>
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                          </div>
                          <Badge variant="outline" className="text-xs w-fit">
                            {circuit.category}
                          </Badge>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {circuit.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {circuit.componentCount} components
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
