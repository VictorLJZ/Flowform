"use client"

import React from 'react';

interface ConnectionLineProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

/**
 * Custom connection line component for ReactFlow
 * Renders a pulsing dotted line with arrowhead when creating connections
 */
export const CustomConnectionLine: React.FC<ConnectionLineProps> = ({ 
  fromX, 
  fromY, 
  toX, 
  toY 
}) => {
  // Calculate the control points for a bezier curve
  const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
  const controlDistance = Math.min(80, distance * 0.25);
  
  const controlPointX1 = fromX + controlDistance;
  const controlPointY1 = fromY;
  const controlPointX2 = toX - controlDistance;
  const controlPointY2 = toY;
  
  // Calculate the direction for the arrowhead
  const dx = toX - controlPointX2;
  const dy = toY - controlPointY2;
  const angle = Math.atan2(dy, dx);
  
  // Arrow dimensions
  const arrowLength = 12;
  const arrowWidth = 8;
  
  // Calculate arrowhead points
  const arrowPoint1X = toX - arrowLength * Math.cos(angle) + arrowWidth * Math.sin(angle);
  const arrowPoint1Y = toY - arrowLength * Math.sin(angle) - arrowWidth * Math.cos(angle);
  const arrowPoint2X = toX - arrowLength * Math.cos(angle) - arrowWidth * Math.sin(angle);
  const arrowPoint2Y = toY - arrowLength * Math.sin(angle) + arrowWidth * Math.cos(angle);
  
  // Use pure black for connection lines with higher opacity
  const connectorColor = 'rgba(0, 0, 0, 0.9)';
  
  return (
    <g>
      {/* Draw the bezier path */}
      <path
        d={`M ${fromX} ${fromY} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${toX} ${toY}`}
        fill="none"
        className="animated-connection-path"
        style={{
          stroke: connectorColor,
          strokeWidth: 2.5,
          strokeDasharray: '5, 5',
          animation: 'flowDash 1s linear infinite',
        }}
      />
      
      {/* Draw the arrowhead */}
      <polygon 
        points={`${toX},${toY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`} 
        fill={connectorColor}
      />
    </g>
  );
}; 