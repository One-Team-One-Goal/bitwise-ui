import React from 'react';
import type { Component, ConnectionPoint } from '../types/index';
import { COMPONENT_DEFINITIONS } from '../utils/componentFactory';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ComponentRendererProps {
  component: Component;
  isSelected: boolean;
  onMouseDown: (event: React.MouseEvent) => void;
  onConnectionPointClick: (connectionPointId: string) => void;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  isSelected,
  onMouseDown,
  onConnectionPointClick
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
          
          {/* Clock triangle indicator */}
          {component.inputs.length > 2 && (
            <polygon
              points="5,48 13,44 5,40"
              fill={isSelected ? '#3B82F6' : '#374151'}
              className="transition-all duration-200"
            />
          )}
          
          {/* Input/Output pin indicators */}
          <g stroke={isSelected ? '#3B82F6' : '#6B7280'} strokeWidth="1" fill="none">
            {/* Input side indicators */}
            <line x1="5" y1="15" x2="15" y2="15" />
            <line x1="5" y1="30" x2="15" y2="30" />
            {component.inputs.length > 2 && <line x1="5" y1="45" x2="15" y2="45" />}
            
            {/* Output side indicators */}
            <line x1="65" y1="20" x2="75" y2="20" />
            <line x1="65" y1="40" x2="75" y2="40" />
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
        return (
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 40 40" className="absolute inset-0">
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="#10B981"
                stroke={isSelected ? '#3B82F6' : '#059669'}
                strokeWidth="2"
              />
              <text x="20" y="26" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">1</text>
            </svg>
          </div>
        );
      
      case 'LOW_CONSTANT':
        return (
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 40 40" className="absolute inset-0">
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="#6B7280"
                stroke={isSelected ? '#3B82F6' : '#4B5563'}
                strokeWidth="2"
              />
              <text x="20" y="26" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">0</text>
            </svg>
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
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 40 40" className="absolute inset-0">
              {/* Glowing aura - rendered first so it's behind */}
              {isLit && (
                <defs>
                  <radialGradient id={`ledGlow-${component.id}`} cx="50%" cy="40%" r="70%">
                    <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8"/>
                    <stop offset="50%" stopColor="#FCD34D" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0"/>
                  </radialGradient>
                  <filter id={`blur-${component.id}`}>
                    <feGaussianBlur stdDeviation="2"/>
                  </filter>
                </defs>
              )}
              
              {/* Outer glow when lit */}
              {isLit && (
                <circle
                  cx="20"
                  cy="16"
                  r="18"
                  fill={`url(#ledGlow-${component.id})`}
                  filter={`url(#blur-${component.id})`}
                />
              )}
              
              {/* Light bulb SVG */}
              <g transform="translate(8, 4)">
                {/* Bulb body */}
                <path
                  d="M12 2 C7 2 3 6 3 11 C3 14 4 16 6 18 L6 22 L18 22 L18 18 C20 16 21 14 21 11 C21 6 17 2 12 2 Z"
                  fill={isLit ? '#FBBF24' : '#E5E7EB'}
                  stroke={isLit ? '#F59E0B' : '#9CA3AF'}
                  strokeWidth="1.5"
                />
                
                {/* Glass highlight */}
                <ellipse
                  cx="10"
                  cy="8"
                  rx="3"
                  ry="4"
                  fill="white"
                  opacity={isLit ? "0.7" : "0.3"}
                />
                
                {/* Filament */}
                <path
                  d="M8 10 Q12 8 16 10 M8 12 Q12 10 16 12"
                  stroke={isLit ? '#DC2626' : '#9CA3AF'}
                  strokeWidth="1"
                  fill="none"
                  opacity={isLit ? "1" : "0.5"}
                />
                
                {/* Base/screw threads */}
                <rect
                  x="6"
                  y="22"
                  width="12"
                  height="8"
                  fill={isLit ? '#A3A3A3' : '#D1D5DB'}
                  stroke={isLit ? '#737373' : '#9CA3AF'}
                  strokeWidth="1"
                />
                <line x1="6" y1="24" x2="18" y2="24" stroke={isLit ? '#525252' : '#9CA3AF'} strokeWidth="0.5"/>
                <line x1="6" y1="26" x2="18" y2="26" stroke={isLit ? '#525252' : '#9CA3AF'} strokeWidth="0.5"/>
                <line x1="6" y1="28" x2="18" y2="28" stroke={isLit ? '#525252' : '#9CA3AF'} strokeWidth="0.5"/>
              </g>
            </svg>
            
            {/* Additional pulsing glow animation when lit */}
            {isLit && (
              <div className="absolute inset-1 rounded-full bg-yellow-300 opacity-30 animate-pulse pointer-events-none" />
            )}
            
            {/* Selection border */}
            {isSelected && (
              <div className="absolute inset-[-2px] rounded-lg border-2 border-blue-500 pointer-events-none" />
            )}
          </div>
        );
      
      case 'SEVEN_SEGMENT':
        // Simple 7-segment display representation
        return (
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 60 80" className="absolute inset-0">
              {/* Display background */}
              <rect
                x="10"
                y="10"
                width="40"
                height="60"
                rx="4"
                fill="#1F2937"
                stroke={isSelected ? '#3B82F6' : '#374151'}
                strokeWidth={isSelected ? "3" : "2"}
              />
              {/* 7-segment pattern (showing "8") */}
              <g stroke={component.inputs?.some(input => input.value) ? '#EF4444' : '#4B5563'} strokeWidth="2" fill="none">
                <line x1="20" y1="20" x2="40" y2="20" /> {/* top */}
                <line x1="20" y1="35" x2="40" y2="35" /> {/* middle */}
                <line x1="20" y1="50" x2="40" y2="50" /> {/* bottom */}
                <line x1="18" y1="22" x2="18" y2="33" /> {/* top left */}
                <line x1="42" y1="22" x2="42" y2="33" /> {/* top right */}
                <line x1="18" y1="37" x2="18" y2="48" /> {/* bottom left */}
                <line x1="42" y1="37" x2="42" y2="48" /> {/* bottom right */}
              </g>
            </svg>
          </div>
        );

      case 'DIGITAL_DISPLAY':
        return (
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 80 40" className="absolute inset-0">
              {/* Display screen */}
              <rect
                x="5"
                y="8"
                width="70"
                height="24"
                rx="4"
                fill="#1F2937"
                stroke={isSelected ? '#3B82F6' : '#374151'}
                strokeWidth={isSelected ? "3" : "2"}
              />
              {/* Display text */}
              <text
                x="40"
                y="24"
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill={component.inputs?.some(input => input.value) ? '#10B981' : '#6B7280'}
              >
                {component.inputs ? 
                  component.inputs.reduce((acc, input, i) => 
                    acc + (input.value ? Math.pow(2, component.inputs.length - 1 - i) : 0), 0) 
                  : '0'}
              </text>
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`absolute cursor-move select-none ${isSelected ? 'z-20' : 'z-10'} transition-all duration-200 hover:z-30`}
            style={{
              left: component.position.x,
              top: component.position.y,
              width: component.size.width,
              height: component.size.height,
              transform: `rotate(${component.rotation}deg)`
            }}
            onMouseDown={onMouseDown}
          >
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