import React from 'react';
import type { Component, ConnectionPoint } from '../types';
import { COMPONENT_DEFINITIONS } from '../utils/componentFactory';

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
        className={`absolute w-3 h-3 rounded-full border-2 cursor-pointer z-10 transition-all duration-200 ${
          point.connected 
            ? 'bg-green-500 border-green-600 shadow-lg' 
            : point.value 
              ? 'bg-red-500 border-red-600 shadow-md' 
              : 'bg-gray-300 border-gray-400 hover:bg-blue-200 hover:border-blue-400'
        } hover:scale-125`}
        style={{
          left: isInput ? -6 : component.size.width - 6,
          top: ((index + 1) * component.size.height / (isInput ? component.inputs.length + 1 : component.outputs.length + 1)) - 6,
          boxShadow: point.connected ? '0 0 8px rgba(34, 197, 94, 0.5)' : point.value ? '0 0 6px rgba(239, 68, 68, 0.5)' : undefined
        }}
        onClick={(e) => {
          e.stopPropagation();
          onConnectionPointClick(point.id);
        }}
        title={`${point.type} ${index + 1} - ${point.value ? 'HIGH' : 'LOW'}${point.connected ? ' (Connected)' : ' (Available)'}`}
      />
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
              stroke="black"
              strokeWidth="2"
              style={{ borderColor: isSelected ? '#3b82f6' : 'black' }}
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
              stroke="black"
              strokeWidth="2"
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
              stroke="black"
              strokeWidth="2"
            />
            {/* Inversion bubble */}
            <circle
              cx={width-15}
              cy={height/2}
              r="6"
              fill="white"
              stroke="black"
              strokeWidth="2"
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
        // Generic rectangular component
        return (
          <div
            className="w-full h-full bg-white border-2 border-gray-400 rounded flex items-center justify-center text-sm font-semibold"
            style={{ borderColor: isSelected ? '#3b82f6' : '#9ca3af' }}
          >
            {definition.icon}
          </div>
        );
    }
  };

  const renderFlipFlop = () => {
    
    return (
      <div className="relative w-full h-full">
        <div
          className="w-full h-full bg-white border-2 border-gray-600 rounded flex flex-col items-center justify-center text-sm font-bold"
          style={{ borderColor: isSelected ? '#3b82f6' : '#4b5563' }}
        >
          <div className="text-lg">{definition.icon}</div>
          <div className="text-xs mt-1">{component.type.replace('_FLIPFLOP', '')}</div>
        </div>
        
        {/* Clock triangle indicator for flip-flops */}
        {component.inputs.length > 2 && (
          <div className="absolute left-0 bottom-2">
            <svg width="8" height="8" viewBox="0 0 8 8">
              <polygon points="0,0 8,4 0,8" fill="black" />
            </svg>
          </div>
        )}
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
        return (
          <div className="relative w-full h-full">
            <div
              className="w-full h-full bg-yellow-100 border-2 border-yellow-400 rounded flex items-center justify-center"
              style={{ borderColor: isSelected ? '#3b82f6' : '#fbbf24' }}
            >
              <div className="text-lg">⏱</div>
            </div>
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
          <div
            className="w-full h-full bg-blue-100 border-2 border-blue-400 rounded flex items-center justify-center text-sm font-bold"
            style={{ borderColor: isSelected ? '#3b82f6' : '#60a5fa' }}
          >
            {definition.icon}
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
              {/* Light bulb SVG */}
              <g transform="translate(8, 4)">
                {/* Bulb body */}
                <path
                  d="M12 2 C7 2 3 6 3 11 C3 14 4 16 6 18 L6 22 L18 22 L18 18 C20 16 21 14 21 11 C21 6 17 2 12 2 Z"
                  fill={isLit ? '#FEF08A' : '#E5E7EB'}
                  stroke={isLit ? '#F59E0B' : '#9CA3AF'}
                  strokeWidth="1.5"
                />
                {/* Filament */}
                <path
                  d="M8 10 Q12 8 16 10 M8 12 Q12 10 16 12"
                  stroke={isLit ? '#F59E0B' : '#9CA3AF'}
                  strokeWidth="1"
                  fill="none"
                />
                {/* Base/screw threads */}
                <rect
                  x="6"
                  y="22"
                  width="12"
                  height="8"
                  fill={isLit ? '#FCD34D' : '#D1D5DB'}
                  stroke={isLit ? '#F59E0B' : '#9CA3AF'}
                  strokeWidth="1"
                />
                <line x1="6" y1="24" x2="18" y2="24" stroke={isLit ? '#F59E0B' : '#9CA3AF'} strokeWidth="0.5"/>
                <line x1="6" y1="26" x2="18" y2="26" stroke={isLit ? '#F59E0B' : '#9CA3AF'} strokeWidth="0.5"/>
                <line x1="6" y1="28" x2="18" y2="28" stroke={isLit ? '#F59E0B' : '#9CA3AF'} strokeWidth="0.5"/>
              </g>
              
              {/* Glow effect when lit */}
              {isLit && (
                <g>
                  <circle cx="20" cy="16" r="15" fill="yellow" opacity="0.2"/>
                  <circle cx="20" cy="16" r="12" fill="yellow" opacity="0.1"/>
                </g>
              )}
            </svg>
            
            {/* Additional glow animation when lit */}
            {isLit && (
              <div className="absolute inset-0 rounded-full bg-yellow-300 opacity-20 animate-pulse pointer-events-none" />
            )}
            
            {/* Selection border */}
            <div 
              className={`absolute inset-0 rounded-full border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}
            />
          </div>
        );
      
      default:
        return (
          <div
            className="w-full h-full bg-green-100 border-2 border-green-400 rounded flex items-center justify-center text-sm font-bold"
            style={{ borderColor: isSelected ? '#3b82f6' : '#4ade80' }}
          >
            {definition.icon}
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
            className="w-full h-full bg-gray-100 border-2 border-gray-400 rounded flex items-center justify-center text-sm"
            style={{ borderColor: isSelected ? '#3b82f6' : '#9ca3af' }}
          >
            {definition.icon}
          </div>
        );
    }
  };

  return (
    <div
      className={`absolute cursor-move select-none ${isSelected ? 'z-20' : 'z-10'}`}
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
  );
};