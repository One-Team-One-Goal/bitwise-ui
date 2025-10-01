import React from 'react';
import type { Component, ConnectionPoint } from '../types/index';
import { COMPONENT_DEFINITIONS } from '../utils/componentFactory';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ComponentRendererProps {
  component: Component;
  isSelected: boolean;
  onMouseDown: (event: React.MouseEvent) => void;
  onConnectionPointClick: (connectionPointId: string) => void;
  onClick?: (event: React.MouseEvent) => void;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  isSelected,
  onMouseDown,
  onConnectionPointClick,
  onClick
}) => {
  const definition = COMPONENT_DEFINITIONS[component.type];

  const renderConnectionPoint = (point: ConnectionPoint, index: number) => {
    const isInput = point.type === 'input';
    
    return (
      <div
        key={point.id}
        className={`absolute cursor-pointer z-20 transition-all duration-200 group`}
        style={{
          left: isInput ? -8 : component.size.width - 8,
          top: ((index + 1) * component.size.height / (isInput ? component.inputs.length + 1 : component.outputs.length + 1)) - 8,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onConnectionPointClick(point.id);
        }}
        title={`${point.type} ${index + 1} - ${point.value ? 'HIGH (1)' : 'LOW (0)'}${point.connected ? ' (Connected)' : ' (Available)'}`}
      >
        {/* Hover ring */}
        <div
          className={`absolute inset-0 w-4 h-4 rounded-full border-2 transition-all duration-200 opacity-0 group-hover:opacity-100 scale-150 group-hover:scale-200 ${
            point.connected 
              ? 'border-green-400' 
              : point.value 
                ? 'border-red-400' 
                : 'border-blue-400'
          }`}
        />
        
        {/* Main connection point */}
        <div
          className={`relative w-4 h-4 rounded-full border-2 transition-all duration-200 group-hover:scale-125 ${
            point.connected 
              ? 'bg-green-500 border-green-600 shadow-lg shadow-green-500/50' 
              : point.value 
                ? 'bg-red-500 border-red-600 shadow-md shadow-red-500/50' 
                : 'bg-gray-200 border-gray-400 group-hover:bg-blue-200 group-hover:border-blue-500 group-hover:shadow-md group-hover:shadow-blue-500/30'
          }`}
        >
          {/* Inner glow for active states */}
          {(point.connected || point.value) && (
            <div
              className={`absolute inset-1 rounded-full animate-pulse ${
                point.connected ? 'bg-green-300' : 'bg-red-300'
              } opacity-60`}
            />
          )}
          
          {/* Value indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-bold transition-opacity duration-200 ${
              point.connected || point.value 
                ? 'text-white opacity-100' 
                : 'text-gray-600 opacity-0 group-hover:opacity-100'
            }`}>
              {point.value ? '1' : '0'}
            </span>
          </div>
        </div>

        {/* Connection status indicator */}
        {point.connected && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-white animate-pulse" />
        )}
      </div>
    );
  };

  const renderGateShape = () => {
    const { width, height } = component.size;
    
    switch (component.type) {
      case 'AND':
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* AND gate - flat left side, curved right side */}
            <path
              d={`M15,10 L${width-25},10 A${(width-40)/2},${(height-20)/2} 0 0,1 ${width-25},${height-10} L15,${height-10} Z`}
              fill="white"
              stroke={isSelected ? '#3b82f6' : 'black'}
              strokeWidth={isSelected ? "3" : "2"}
            />
            {/* Input connection points visual guide */}
            <line x1="15" y1={height/3} x2="8" y2={height/3} stroke="black" strokeWidth="1"/>
            <line x1="15" y1={2*height/3} x2="8" y2={2*height/3} stroke="black" strokeWidth="1"/>
            {/* Output connection point visual guide */}
            <line x1={width-15} y1={height/2} x2={width-8} y2={height/2} stroke="black" strokeWidth="1"/>
          </svg>
        );
      
      case 'OR':
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* OR gate - curved shield shape */}
            <path
              d={`M15,10 Q20,10 25,${height/2} Q20,${height-10} 15,${height-10} Q35,${height/2} ${width-15},${height/2} Q35,${height/2} 15,10`}
              fill="white"
              stroke={isSelected ? '#3b82f6' : 'black'}
              strokeWidth={isSelected ? "3" : "2"}
            />
            {/* Input connection points visual guide */}
            <line x1="18" y1={height/3 + 2} x2="8" y2={height/3} stroke="black" strokeWidth="1"/>
            <line x1="18" y1={2*height/3 - 2} x2="8" y2={2*height/3} stroke="black" strokeWidth="1"/>
            {/* Output connection point visual guide */}
            <line x1={width-15} y1={height/2} x2={width-8} y2={height/2} stroke="black" strokeWidth="1"/>
          </svg>
        );
      
      case 'NOT':
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* NOT gate - triangle with inversion bubble */}
            <polygon
              points={`15,10 ${width-20},${height/2} 15,${height-10}`}
              fill="white"
              stroke={isSelected ? '#3b82f6' : 'black'}
              strokeWidth={isSelected ? "3" : "2"}
            />
            {/* Inversion bubble */}
            <circle
              cx={width-12}
              cy={height/2}
              r="6"
              fill="white"
              stroke={isSelected ? '#3b82f6' : 'black'}
              strokeWidth={isSelected ? "3" : "2"}
            />
            {/* Input connection point visual guide */}
            <line x1="15" y1={height/2} x2="8" y2={height/2} stroke="black" strokeWidth="1"/>
            {/* Output connection point visual guide */}
            <line x1={width-6} y1={height/2} x2={width-2} y2={height/2} stroke="black" strokeWidth="1"/>
          </svg>
        );
      
      case 'NAND':
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* NAND gate - AND shape with inversion bubble */}
            <path
              d={`M15,10 L${width-30},10 A${(width-45)/2},${(height-20)/2} 0 0,1 ${width-30},${height-10} L15,${height-10} Z`}
              fill="white"
              stroke={isSelected ? '#3b82f6' : 'black'}
              strokeWidth={isSelected ? "3" : "2"}
            />
            {/* Inversion bubble */}
            <circle
              cx={width-15}
              cy={height/2}
              r="6"
              fill="white"
              stroke={isSelected ? '#3b82f6' : 'black'}
              strokeWidth={isSelected ? "3" : "2"}
            />
            {/* Input connection points visual guide */}
            <line x1="15" y1={height/3} x2="8" y2={height/3} stroke="black" strokeWidth="1"/>
            <line x1="15" y1={2*height/3} x2="8" y2={2*height/3} stroke="black" strokeWidth="1"/>
            {/* Output connection point visual guide */}
            <line x1={width-9} y1={height/2} x2={width-2} y2={height/2} stroke="black" strokeWidth="1"/>
          </svg>
        );
      
      case 'NOR':
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* NOR gate - OR shape with inversion bubble */}
            <path
              d={`M15,10 Q20,10 25,${height/2} Q20,${height-10} 15,${height-10} Q35,${height/2} ${width-20},${height/2} Q35,${height/2} 15,10`}
              fill="white"
              stroke="black"
              strokeWidth="2"
            />
            {/* Inversion bubble */}
            <circle
              cx={width-12}
              cy={height/2}
              r="6"
              fill="white"
              stroke="black"
              strokeWidth="2"
            />
            {/* Input connection points visual guide */}
            <line x1="18" y1={height/3 + 2} x2="8" y2={height/3} stroke="black" strokeWidth="1"/>
            <line x1="18" y1={2*height/3 - 2} x2="8" y2={2*height/3} stroke="black" strokeWidth="1"/>
            {/* Output connection point visual guide */}
            <line x1={width-6} y1={height/2} x2={width-2} y2={height/2} stroke="black" strokeWidth="1"/>
          </svg>
        );
      
      case 'XOR':
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* XOR gate - OR shape with additional curved line */}
            <path
              d={`M20,10 Q25,10 30,${height/2} Q25,${height-10} 20,${height-10} Q40,${height/2} ${width-15},${height/2} Q40,${height/2} 20,10`}
              fill="white"
              stroke="black"
              strokeWidth="2"
            />
            {/* Additional curved line for XOR */}
            <path
              d={`M10,10 Q15,${height/2} 10,${height-10}`}
              fill="none"
              stroke="black"
              strokeWidth="2"
            />
            {/* Input connection points visual guide */}
            <line x1="23" y1={height/3 + 3} x2="8" y2={height/3} stroke="black" strokeWidth="1"/>
            <line x1="23" y1={2*height/3 - 3} x2="8" y2={2*height/3} stroke="black" strokeWidth="1"/>
            {/* Output connection point visual guide */}
            <line x1={width-15} y1={height/2} x2={width-8} y2={height/2} stroke="black" strokeWidth="1"/>
          </svg>
        );
      
      case 'XNOR':
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* XNOR gate - XOR shape with inversion bubble */}
            <path
              d={`M20,10 Q25,10 30,${height/2} Q25,${height-10} 20,${height-10} Q40,${height/2} ${width-20},${height/2} Q40,${height/2} 20,10`}
              fill="white"
              stroke="black"
              strokeWidth="2"
            />
            {/* Additional curved line for XOR */}
            <path
              d={`M10,10 Q15,${height/2} 10,${height-10}`}
              fill="none"
              stroke="black"
              strokeWidth="2"
            />
            {/* Inversion bubble */}
            <circle
              cx={width-12}
              cy={height/2}
              r="6"
              fill="white"
              stroke="black"
              strokeWidth="2"
            />
            {/* Input connection points visual guide */}
            <line x1="23" y1={height/3 + 3} x2="8" y2={height/3} stroke="black" strokeWidth="1"/>
            <line x1="23" y1={2*height/3 - 3} x2="8" y2={2*height/3} stroke="black" strokeWidth="1"/>
            {/* Output connection point visual guide */}
            <line x1={width-6} y1={height/2} x2={width-2} y2={height/2} stroke="black" strokeWidth="1"/>
          </svg>
        );
      
      case 'BUFFER':
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* BUFFER gate - triangle (same as NOT but without bubble) */}
            <polygon
              points={`15,10 ${width-8},${height/2} 15,${height-10}`}
              fill="white"
              stroke="black"
              strokeWidth="2"
            />
            {/* Input connection point visual guide */}
            <line x1="15" y1={height/2} x2="8" y2={height/2} stroke="black" strokeWidth="1"/>
            {/* Output connection point visual guide */}
            <line x1={width-8} y1={height/2} x2={width-2} y2={height/2} stroke="black" strokeWidth="1"/>
          </svg>
        );
      
      default:
        // Generic complex component with proper styling
        return (
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 80 60" className="absolute inset-0">
              {/* Component body */}
              <rect
                x="5"
                y="5"
                width="70"
                height="50"
                rx="8"
                fill="white"
                stroke={isSelected ? '#3B82F6' : '#374151'}
                strokeWidth={isSelected ? "3" : "2"}
                className="transition-all duration-200"
              />
              
              {/* Component type label */}
              <text
                x="40"
                y="25"
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill={isSelected ? '#3B82F6' : '#374151'}
                className="transition-all duration-200"
              >
                {component.type.replace('_', ' ')}
              </text>
              
              {/* Circuit pattern decoration */}
              <g stroke={isSelected ? '#93C5FD' : '#9CA3AF'} strokeWidth="1" fill="none" opacity="0.5">
                <path d="M15 35 L25 35 L25 40 L35 40 L35 35 L45 35" />
                <circle cx="20" cy="35" r="1" fill={isSelected ? '#93C5FD' : '#9CA3AF'} />
                <circle cx="30" cy="40" r="1" fill={isSelected ? '#93C5FD' : '#9CA3AF'} />
                <circle cx="40" cy="35" r="1" fill={isSelected ? '#93C5FD' : '#9CA3AF'} />
              </g>
              
              {/* Selection indicator */}
              {isSelected && (
                <rect
                  x="3"
                  y="3"
                  width="74"
                  height="54"
                  rx="10"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  opacity="0.6"
                />
              )}
            </svg>
          </div>
        );
    }
  };

  const renderFlipFlop = () => {
    // Get input/output labels based on flip-flop type
    const getFFLabels = () => {
      switch (component.type) {
        case 'SR_FLIPFLOP':
          return { inputs: ['S', 'R', 'CLK'], outputs: ['Q', 'Q\''] };
        case 'D_FLIPFLOP':
          return { inputs: ['D', 'CLK'], outputs: ['Q', 'Q\''] };
        case 'JK_FLIPFLOP':
          return { inputs: ['J', 'K', 'CLK'], outputs: ['Q', 'Q\''] };
        case 'T_FLIPFLOP':
          return { inputs: ['T', 'CLK'], outputs: ['Q', 'Q\''] };
        default:
          return { inputs: [], outputs: [] };
      }
    };
    
    const labels = getFFLabels();
    const clockInputIndex = component.inputs.length - 1; // Clock is always last input
    
    return (
      <div className="relative w-full h-full">
        <svg width="100%" height="100%" viewBox="0 0 80 60" className="absolute inset-0">
          {/* Flip-flop body */}
          <rect
            x="5"
            y="5"
            width="70"
            height="50"
            rx="6"
            fill="white"
            stroke={isSelected ? '#3B82F6' : '#4B5563'}
            strokeWidth={isSelected ? "3" : "2"}
            className="transition-all duration-200"
          />
          
          {/* Flip-flop type label */}
          <text
            x="40"
            y="22"
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill={isSelected ? '#3B82F6' : '#1F2937'}
          >
            {component.type.replace('_FLIPFLOP', '')}
          </text>
          
          {/* FF label */}
          <text
            x="40"
            y="38"
            textAnchor="middle"
            fontSize="10"
            fill={isSelected ? '#3B82F6' : '#6B7280'}
          >
            FF
          </text>
          
          {/* Clock triangle indicator - rising edge symbol */}
          <polygon
            points="5,48 13,44 5,40"
            fill={component.inputs[clockInputIndex]?.value ? '#10B981' : (isSelected ? '#3B82F6' : '#374151')}
            className="transition-all duration-200"
          />
          
          {/* Input labels */}
          {labels.inputs.map((label, idx) => {
            const y = 15 + (idx * 15);
            const isClockInput = idx === clockInputIndex;
            return (
              <text
                key={`input-${idx}`}
                x={isClockInput ? "12" : "12"}
                y={y}
                textAnchor="start"
                fontSize="8"
                fontWeight="600"
                fill={component.inputs[idx]?.value ? '#10B981' : '#6B7280'}
                className="transition-colors duration-200"
              >
                {label}
              </text>
            );
          })}
          
          {/* Output labels */}
          {labels.outputs.map((label, idx) => {
            const y = 22 + (idx * 18);
            return (
              <text
                key={`output-${idx}`}
                x="66"
                y={y}
                textAnchor="end"
                fontSize="8"
                fontWeight="600"
                fill={component.outputs[idx]?.value ? '#EF4444' : '#6B7280'}
                className="transition-colors duration-200"
              >
                {label}
              </text>
            );
          })}
          
          {/* Input/Output pin indicators */}
          <g stroke={isSelected ? '#3B82F6' : '#6B7280'} strokeWidth="1" fill="none">
            {/* Input side indicators */}
            {component.inputs.map((_, idx) => {
              const y = 15 + (idx * 15);
              return <line key={`in-line-${idx}`} x1="5" y1={y} x2="8" y2={y} />;
            })}
            
            {/* Output side indicators */}
            {component.outputs.map((_, idx) => {
              const y = 20 + (idx * 18);
              return <line key={`out-line-${idx}`} x1="72" y1={y} x2="75" y2={y} />;
            })}
          </g>
          
          {/* Selection indicator */}
          {isSelected && (
            <rect
              x="3"
              y="3"
              width="74"
              height="54"
              rx="8"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="4 2"
              opacity="0.6"
            />
          )}
        </svg>
      </div>
    );
  };

  const renderInputControl = () => {
    
    switch (component.type) {
      case 'SWITCH':
        const isOn = component.outputs[0]?.value;
        return (
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 40 40" className="absolute inset-0">
              {/* Switch body */}
              <rect
                x="8"
                y="15"
                width="24"
                height="10"
                rx="5"
                fill={isOn ? '#10B981' : '#6B7280'}
                stroke={isSelected ? '#3B82F6' : '#374151'}
                strokeWidth="2"
              />
              
              {/* Switch toggle */}
              <circle
                cx={isOn ? 26 : 14}
                cy="20"
                r="6"
                fill="white"
                stroke={isSelected ? '#3B82F6' : '#374151'}
                strokeWidth="2"
                className="transition-all duration-200"
              />
              
              {/* Switch labels */}
              <text x="6" y="12" fontSize="6" fill="#374151">ON</text>
              <text x="30" y="32" fontSize="6" fill="#374151">OFF</text>
            </svg>
          </div>
        );
      
      case 'PUSH_BUTTON':
        const isPressed = component.outputs[0]?.value;
        return (
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 40 40" className="absolute inset-0">
              {/* Button base */}
              <rect
                x="5"
                y="5"
                width="30"
                height="30"
                rx="4"
                fill="#E5E7EB"
                stroke={isSelected ? '#3B82F6' : '#6B7280'}
                strokeWidth="2"
              />
              
              {/* Button top */}
              <circle
                cx="20"
                cy={isPressed ? "22" : "18"}
                r="8"
                fill={isPressed ? '#EF4444' : '#F87171'}
                stroke="#DC2626"
                strokeWidth="2"
                className="transition-all duration-100"
              />
              
              {/* Button reflection */}
              <circle
                cx="18"
                cy={isPressed ? "20" : "16"}
                r="3"
                fill="white"
                opacity="0.6"
                className="transition-all duration-100"
              />
            </svg>
          </div>
        );
      
      case 'CLOCK':
        const isClockHigh = component.outputs[0]?.value;
        return (
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 60 40" className="absolute inset-0">
              {/* Clock body */}
              <rect
                x="5"
                y="8"
                width="50"
                height="24"
                rx="6"
                fill={isClockHigh ? '#FEF08A' : '#E5E7EB'}
                stroke={isSelected ? '#3B82F6' : (isClockHigh ? '#F59E0B' : '#9CA3AF')}
                strokeWidth={isSelected ? "3" : "2"}
              />
              {/* Clock wave pattern */}
              <g stroke={isClockHigh ? '#DC2626' : '#6B7280'} strokeWidth="2" fill="none">
                <path d="M10 25 L15 25 L15 15 L20 15 L20 25 L25 25 L25 15 L30 15 L30 25 L35 25 L35 15 L40 15 L40 25 L45 25" />
              </g>
              {/* Clock label */}
              <text 
                x="30" 
                y="7" 
                textAnchor="middle" 
                fontSize="8" 
                fontWeight="bold" 
                fill={isSelected ? '#3B82F6' : '#374151'}
              >
                CLK
              </text>
            </svg>
            
            {/* Pulsing effect when active */}
            {isClockHigh && (
              <div className="absolute inset-1 rounded bg-yellow-300 opacity-30 animate-pulse pointer-events-none" />
            )}
          </div>
        );
      
      case 'HIGH_CONSTANT':
      case 'LOW_CONSTANT':
        const constantValue = component.outputs?.[0]?.value ?? (component.type === 'HIGH_CONSTANT');
        return (
          <div className="relative w-full h-full cursor-pointer group hover:scale-105 transition-transform">
            <svg width="100%" height="100%" viewBox="0 0 40 40" className="absolute inset-0">
              <circle
                cx="20"
                cy="20"
                r="16"
                fill={constantValue ? '#10B981' : '#6B7280'}
                stroke={isSelected ? '#3B82F6' : (constantValue ? '#059669' : '#4B5563')}
                strokeWidth="2"
              />
              <text x="20" y="26" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">
                {constantValue ? '1' : '0'}
              </text>
            </svg>
            {/* Hover hint */}
            <div className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="7" fill="white" stroke="#3B82F6" strokeWidth="1"/>
                <text x="8" y="11" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#3B82F6">⇄</text>
              </svg>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 60 40" className="absolute inset-0">
              {/* Input device body */}
              <rect
                x="5"
                y="5"
                width="50"
                height="30"
                rx="8"
                fill="#E0F2FE"
                stroke={isSelected ? '#3B82F6' : '#0EA5E9'}
                strokeWidth={isSelected ? "3" : "2"}
              />
              {/* Input indicator LED */}
              <circle
                cx="15"
                cy="20"
                r="3"
                fill={component.outputs?.[0]?.value ? '#10B981' : '#6B7280'}
              />
              {/* Input control shape speaks for itself */}
            </svg>
          </div>
        );
    }
  };

  const renderOutputControl = () => {
    switch (component.type) {
      case 'LED':
        const isLit = component.inputs[0]?.value;
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 48 64" 
              className="absolute inset-0"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Glow effect for when lit */}
                {isLit && (
                  <>
                    <radialGradient id={`ledGlow-${component.id}`} cx="50%" cy="35%" r="60%">
                      <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9"/>
                      <stop offset="40%" stopColor="#FCD34D" stopOpacity="0.6"/>
                      <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0"/>
                    </radialGradient>
                    <filter id={`blur-${component.id}`}>
                      <feGaussianBlur stdDeviation="3"/>
                    </filter>
                  </>
                )}
              </defs>
              
              {/* Outer glow aura when lit */}
              {isLit && (
                <circle
                  cx="24"
                  cy="22"
                  r="22"
                  fill={`url(#ledGlow-${component.id})`}
                  filter={`url(#blur-${component.id})`}
                />
              )}
              
              {/* Light bulb shape */}
              <g>
                {/* Main bulb body - classic round bulb shape */}
                <path
                  d="M24 8 C17 8 11 14 11 21 C11 25 12.5 28 15 31 L15 38 L33 38 L33 31 C35.5 28 37 25 37 21 C37 14 31 8 24 8 Z"
                  fill={isLit ? '#FDE047' : '#E5E7EB'}
                  stroke={isLit ? '#FACC15' : '#9CA3AF'}
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />
                
                {/* Glass shine highlight */}
                <ellipse
                  cx="20"
                  cy="16"
                  rx="5"
                  ry="7"
                  fill="white"
                  opacity={isLit ? "0.75" : "0.35"}
                  className="transition-opacity duration-300"
                />
                
                {/* Secondary highlight */}
                <ellipse
                  cx="28"
                  cy="20"
                  rx="2.5"
                  ry="3"
                  fill="white"
                  opacity={isLit ? "0.5" : "0.2"}
                  className="transition-opacity duration-300"
                />
                
                {/* Filament wires */}
                <path
                  d="M20 24 Q24 21 28 24 M20 27 Q24 24 28 27"
                  stroke={isLit ? '#EF4444' : '#9CA3AF'}
                  strokeWidth="1.2"
                  fill="none"
                  opacity={isLit ? "1" : "0.5"}
                  className="transition-all duration-300"
                />
                
                {/* Filament support */}
                <line x1="24" y1="20" x2="24" y2="30" 
                  stroke={isLit ? '#DC2626' : '#9CA3AF'} 
                  strokeWidth="0.8" 
                  opacity={isLit ? "0.8" : "0.4"}
                />
                
                {/* Neck/transition to base */}
                <path
                  d="M15 38 L15 42 L33 42 L33 38"
                  fill={isLit ? '#D6D3D1' : '#E5E7EB'}
                  stroke={isLit ? '#A8A29E' : '#9CA3AF'}
                  strokeWidth="1"
                />
                
                {/* Screw base */}
                <rect
                  x="16"
                  y="42"
                  width="16"
                  height="14"
                  rx="1"
                  fill={isLit ? '#A8A29E' : '#D1D5DB'}
                  stroke={isLit ? '#78716C' : '#9CA3AF'}
                  strokeWidth="1"
                />
                
                {/* Screw threads */}
                <line x1="16" y1="44" x2="32" y2="44" stroke={isLit ? '#57534E' : '#9CA3AF'} strokeWidth="0.8"/>
                <line x1="16" y1="47" x2="32" y2="47" stroke={isLit ? '#57534E' : '#9CA3AF'} strokeWidth="0.8"/>
                <line x1="16" y1="50" x2="32" y2="50" stroke={isLit ? '#57534E' : '#9CA3AF'} strokeWidth="0.8"/>
                <line x1="16" y1="53" x2="32" y2="53" stroke={isLit ? '#57534E' : '#9CA3AF'} strokeWidth="0.8"/>
                
                {/* Base contact */}
                <circle
                  cx="24"
                  cy="58"
                  r="4"
                  fill={isLit ? '#78716C' : '#9CA3AF'}
                  stroke={isLit ? '#57534E' : '#6B7280'}
                  strokeWidth="1"
                />
              </g>
            </svg>
            
            {/* Animated glow pulse when lit */}
            {isLit && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-yellow-300 opacity-40 animate-pulse pointer-events-none blur-sm" />
            )}
            
            {/* Selection border */}
            {isSelected && (
              <div className="absolute inset-[-3px] rounded-lg border-2 border-blue-500 pointer-events-none" />
            )}
          </div>
        );
      
      case 'SEVEN_SEGMENT':
        // 7-segment display with proper segment decoding
        // Inputs: [a, b, c, d, e, f, g] (7 segments)
        // Or: [BCD0, BCD1, BCD2, BCD3] for BCD mode (4 bits)
        const segments = component.inputs.map(i => i.value);
        
        // If 4 inputs, treat as BCD and convert to 7-segment pattern
        let segmentStates = segments;
        if (component.inputs.length === 4) {
          // Convert BCD (4 bits) to decimal value
          const bcdValue = segments.reduce((acc, bit, idx) => 
            acc + (bit ? Math.pow(2, 3 - idx) : 0), 0);
          
          // BCD to 7-segment decoder (segments: a, b, c, d, e, f, g)
          const bcdTo7Seg: Record<number, boolean[]> = {
            0: [true, true, true, true, true, true, false],    // 0
            1: [false, true, true, false, false, false, false], // 1
            2: [true, true, false, true, true, false, true],    // 2
            3: [true, true, true, true, false, false, true],    // 3
            4: [false, true, true, false, false, true, true],   // 4
            5: [true, false, true, true, false, true, true],    // 5
            6: [true, false, true, true, true, true, true],     // 6
            7: [true, true, true, false, false, false, false],  // 7
            8: [true, true, true, true, true, true, true],      // 8
            9: [true, true, true, true, false, true, true],     // 9
            10: [true, true, true, false, true, true, true],    // A
            11: [false, false, true, true, true, true, true],   // b
            12: [true, false, false, true, true, true, false],  // C
            13: [false, true, true, true, true, false, true],   // d
            14: [true, false, false, true, true, true, true],   // E
            15: [true, false, false, false, true, true, true],  // F
          };
          segmentStates = bcdTo7Seg[bcdValue] || bcdTo7Seg[0];
        }
        
        // Ensure we have exactly 7 segments
        while (segmentStates.length < 7) {
          segmentStates.push(false);
        }
        
        return (
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 60 90" className="absolute inset-0">
              {/* Display background */}
              <rect
                x="8"
                y="8"
                width="44"
                height="74"
                rx="4"
                fill="#1A1A1A"
                stroke={isSelected ? '#3B82F6' : '#2D2D2D'}
                strokeWidth={isSelected ? "3" : "2"}
              />
              
              {/* 7-Segment Display - Each segment is a polygon for authentic look */}
              <g>
                {/* Segment A (top) */}
                <polygon
                  points="20,15 40,15 38,17 22,17"
                  fill={segmentStates[0] ? '#FF3B30' : '#333333'}
                  className="transition-all duration-200"
                />
                
                {/* Segment B (top right) */}
                <polygon
                  points="41,16 43,18 43,38 41,40 39,38 39,18"
                  fill={segmentStates[1] ? '#FF3B30' : '#333333'}
                  className="transition-all duration-200"
                />
                
                {/* Segment C (bottom right) */}
                <polygon
                  points="41,42 43,44 43,64 41,66 39,64 39,44"
                  fill={segmentStates[2] ? '#FF3B30' : '#333333'}
                  className="transition-all duration-200"
                />
                
                {/* Segment D (bottom) */}
                <polygon
                  points="20,67 40,67 38,65 22,65"
                  fill={segmentStates[3] ? '#FF3B30' : '#333333'}
                  className="transition-all duration-200"
                />
                
                {/* Segment E (bottom left) */}
                <polygon
                  points="17,42 19,44 19,64 17,66 15,64 15,44"
                  fill={segmentStates[4] ? '#FF3B30' : '#333333'}
                  className="transition-all duration-200"
                />
                
                {/* Segment F (top left) */}
                <polygon
                  points="17,16 19,18 19,38 17,40 15,38 15,18"
                  fill={segmentStates[5] ? '#FF3B30' : '#333333'}
                  className="transition-all duration-200"
                />
                
                {/* Segment G (middle) */}
                <polygon
                  points="20,41 40,41 38,39 22,39 20,41"
                  fill={segmentStates[6] ? '#FF3B30' : '#333333'}
                  className="transition-all duration-200"
                />
              </g>
              
              {/* Glow effect when lit */}
              {segmentStates.some(s => s) && (
                <rect
                  x="8"
                  y="8"
                  width="44"
                  height="74"
                  rx="4"
                  fill="none"
                  stroke="#FF3B30"
                  strokeWidth="0.5"
                  opacity="0.3"
                  className="pointer-events-none"
                />
              )}
            </svg>
          </div>
        );

      case 'DIGITAL_DISPLAY':
        // Calculate decimal value from binary inputs (MSB first)
        const binaryValue = component.inputs.length > 0
          ? component.inputs.reduce((acc, input, i) => 
              acc + (input.value ? Math.pow(2, component.inputs.length - 1 - i) : 0), 0)
          : 0;
        
        const hasSignal = component.inputs?.some(input => input.value);
        const displayColor = hasSignal ? '#10B981' : '#4B5563';
        
        return (
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 100 50" className="absolute inset-0">
              {/* Display housing */}
              <rect
                x="5"
                y="5"
                width="90"
                height="40"
                rx="6"
                fill="#1A1A1A"
                stroke={isSelected ? '#3B82F6' : '#2D2D2D'}
                strokeWidth={isSelected ? "3" : "2"}
              />
              
              {/* LCD screen inset */}
              <rect
                x="10"
                y="10"
                width="80"
                height="30"
                rx="3"
                fill="#0F172A"
                stroke="#1E293B"
                strokeWidth="1"
              />
              
              {/* Binary representation (small, top) */}
              <text
                x="50"
                y="19"
                textAnchor="middle"
                fontSize="5"
                fontFamily="monospace"
                fill={displayColor}
                opacity="0.6"
              >
                {component.inputs.map(i => i.value ? '1' : '0').join('')}
              </text>
              
              {/* Decimal value (large, center) */}
              <text
                x="50"
                y="32"
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fontFamily="monospace"
                fill={displayColor}
                className="transition-colors duration-200"
              >
                {binaryValue}
              </text>
              
              {/* Bit count label */}
              <text
                x="88"
                y="42"
                textAnchor="end"
                fontSize="4"
                fill="#6B7280"
              >
                {component.inputs.length}bit
              </text>
              
              {/* Glow effect when active */}
              {hasSignal && (
                <rect
                  x="10"
                  y="10"
                  width="80"
                  height="30"
                  rx="3"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="0.5"
                  opacity="0.4"
                  className="pointer-events-none"
                />
              )}
            </svg>
          </div>
        );

      default:
        return (
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 60 40" className="absolute inset-0">
              {/* Output device body */}
              <rect
                x="5"
                y="5"
                width="50"
                height="30"
                rx="8"
                fill="#F0FDF4"
                stroke={isSelected ? '#3B82F6' : '#16A34A'}
                strokeWidth={isSelected ? "3" : "2"}
              />
              {/* Output indicator */}
              <circle
                cx="45"
                cy="20"
                r="3"
                fill={component.inputs?.[0]?.value ? '#EF4444' : '#6B7280'}
              />
              {/* Icon display */}
              <text 
                x="25" 
                y="25" 
                textAnchor="middle" 
                fontSize="12" 
                fontWeight="bold" 
                fill={isSelected ? '#3B82F6' : '#0F172A'}
              >
                {definition.icon}
              </text>
            </svg>
          </div>
        );
    }
  };

  const renderComponent = () => {
    switch (definition.category) {
      case 'gates':
        return renderGateShape();
      case 'flipflops':
        return renderFlipFlop();
      case 'inputs':
        return renderInputControl();
      case 'outputs':
        return renderOutputControl();
      default:
        return (
          <div
            className="w-full h-full bg-gray-100 border-2 border-gray-400 rounded"
            style={{ borderColor: isSelected ? '#3b82f6' : '#9ca3af' }}
          >
          </div>
        );
    }
  };

  const getComponentDescription = () => {
    const descriptions: Record<string, string> = {
      'AND': 'AND Gate - Output is HIGH only when all inputs are HIGH',
      'OR': 'OR Gate - Output is HIGH when any input is HIGH',
      'NOT': 'NOT Gate - Inverts the input signal',
      'NAND': 'NAND Gate - Output is LOW only when all inputs are HIGH',
      'NOR': 'NOR Gate - Output is LOW when any input is HIGH',
      'XOR': 'XOR Gate - Output is HIGH when inputs are different',
      'XNOR': 'XNOR Gate - Output is HIGH when inputs are the same',
      'BUFFER': 'Buffer Gate - Amplifies the input signal without changing logic',
      'SWITCH': 'Toggle Switch - Click to toggle between HIGH and LOW',
      'PUSH_BUTTON': 'Push Button - Momentary HIGH signal when pressed',
      'CLOCK': 'Clock Generator - Generates periodic square wave signal',
      'HIGH_CONSTANT': 'Logic HIGH - Always outputs 1',
      'LOW_CONSTANT': 'Logic LOW - Always outputs 0',
      'LED': 'Light Emitting Diode - Visual indicator for HIGH signals',
      'SEVEN_SEGMENT': '7-Segment Display - Shows digits 0-9 based on input pattern',
      'DIGITAL_DISPLAY': 'Digital Display - Shows binary number as decimal value',
      'SR_FLIPFLOP': 'SR Flip-Flop - Set-Reset memory element',
      'D_FLIPFLOP': 'D Flip-Flop - Data memory element with clock',
      'JK_FLIPFLOP': 'JK Flip-Flop - Universal flip-flop with no invalid state',
      'T_FLIPFLOP': 'T Flip-Flop - Toggle flip-flop changes state on clock',
      'HALF_ADDER': 'Half Adder - Adds two single bits producing sum and carry',
      'FULL_ADDER': 'Full Adder - Adds two bits and carry input producing sum and carry',
      'FOUR_BIT_ADDER': '4-Bit Adder - Adds two 4-bit binary numbers',
      'MULTIPLEXER_2TO1': '2-to-1 Multiplexer - Selects one of two inputs based on control signal',
      'DECODER_2TO4': '2-to-4 Decoder - Converts 2-bit input to 4-line output'
    };
    
    return descriptions[component.type] || `${component.type} - Digital circuit component`;
  };

  // Check if any inputs are connected
  const hasConnectedInputs = component.inputs.some(input => input.connected);
  const hasActiveInputs = component.inputs.some(input => input.connected && input.value);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`relative cursor-move select-none ${isSelected ? 'z-20' : 'z-10'} transition-all duration-200 hover:z-30`}
            style={{
              width: component.size.width,
              height: component.size.height,
              transform: `rotate(${component.rotation}deg)`
            }}
            onMouseDown={onMouseDown}
            onClick={onClick}
          >
            {/* Connected inputs indicator - greenish glow */}
            {hasConnectedInputs && (
              <div 
                className={`absolute -inset-1 rounded-lg transition-all duration-300 pointer-events-none ${
                  hasActiveInputs 
                    ? 'bg-green-400/20 shadow-lg shadow-green-400/30 ring-2 ring-green-400/40' 
                    : 'bg-emerald-300/15 ring-1 ring-emerald-400/30'
                }`}
                style={{
                  animation: hasActiveInputs ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                }}
              />
            )}
            
            {/* Component body */}
            {renderComponent()}
            
            {/* Input connection points */}
            {component.inputs.map((input, index) => renderConnectionPoint(input, index))}
            
            {/* Output connection points */}
            {component.outputs.map((output, index) => renderConnectionPoint(output, index))}
            
            {/* Component label */}
            {component.label && (
              <div className="absolute -bottom-6 left-0 text-xs text-gray-600 whitespace-nowrap">
                {component.label}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm">
          <div className="space-y-1">
            <p className="font-semibold">{definition.name}</p>
            <p className="text-sm text-muted-foreground">{getComponentDescription()}</p>
            {component.label && (
              <p className="text-xs text-muted-foreground">Label: {component.label}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};