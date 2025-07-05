'use client';

import { useState } from 'react';
import { clsx } from 'clsx';

interface BodyDiagramProps {
  measurements: Record<string, string>;
  unitPreference: 'metric' | 'imperial';
}

const measurementPoints = [
  { id: 'neck', label: 'Neck', x: 50, y: 18, color: 'text-blue-600' },
  { id: 'chest', label: 'Chest', x: 50, y: 28, color: 'text-green-600' },
  { id: 'waist', label: 'Waist', x: 50, y: 38, color: 'text-yellow-600' },
  { id: 'hips', label: 'Hips', x: 50, y: 48, color: 'text-purple-600' },
  { id: 'leftBicep', label: 'L. Bicep', x: 30, y: 32, color: 'text-red-600' },
  { id: 'rightBicep', label: 'R. Bicep', x: 70, y: 32, color: 'text-red-600' },
  { id: 'leftThigh', label: 'L. Thigh', x: 40, y: 62, color: 'text-indigo-600' },
  { id: 'rightThigh', label: 'R. Thigh', x: 60, y: 62, color: 'text-indigo-600' },
  { id: 'leftCalf', label: 'L. Calf', x: 40, y: 78, color: 'text-pink-600' },
  { id: 'rightCalf', label: 'R. Calf', x: 60, y: 78, color: 'text-pink-600' },
];

export function BodyDiagram({ measurements, unitPreference }: BodyDiagramProps) {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  const unit = unitPreference === 'metric' ? 'cm' : 'in';

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Body Measurements</h3>
      
      <div className="relative">
        {/* SVG Body Diagram - Muscular Male */}
        <svg viewBox="0 0 100 100" className="w-full h-80 bg-gray-50 dark:bg-[#262626] rounded-lg">
          {/* Head */}
          <ellipse cx="50" cy="12" rx="6" ry="8" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5"/>
          
          {/* Neck */}
          <rect x="47" y="20" width="6" height="4" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5"/>
          
          {/* Torso */}
          <path
            d="M42 24 L58 24 L60 26 L62 30 L62 42 L60 46 L58 48 L42 48 L40 46 L38 42 L38 30 L40 26 Z"
            fill="#e5e7eb"
            stroke="#9ca3af"
            strokeWidth="0.5"
          />
          
          {/* Arms */}
          <ellipse cx="32" cy="30" rx="4" ry="8" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5"/>
          <ellipse cx="68" cy="30" rx="4" ry="8" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5"/>
          
          {/* Forearms */}
          <ellipse cx="28" cy="42" rx="3" ry="6" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5"/>
          <ellipse cx="72" cy="42" rx="3" ry="6" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5"/>
          
          {/* Waist */}
          <rect x="44" y="48" width="12" height="8" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5"/>
          
          {/* Hips */}
          <ellipse cx="50" cy="58" rx="8" ry="4" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5"/>
          
          {/* Thighs */}
          <ellipse cx="45" cy="68" rx="4" ry="10" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5"/>
          <ellipse cx="55" cy="68" rx="4" ry="10" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5"/>
          
          {/* Calves */}
          <ellipse cx="44" cy="82" rx="3" ry="8" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5"/>
          <ellipse cx="56" cy="82" rx="3" ry="8" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5"/>
          
          {/* Muscle definition lines */}
          <path d="M46 26 Q50 28 54 26" stroke="#9ca3af" strokeWidth="0.3" fill="none"/>
          <path d="M44 32 Q50 34 56 32" stroke="#9ca3af" strokeWidth="0.3" fill="none"/>
          <path d="M46 38 Q50 40 54 38" stroke="#9ca3af" strokeWidth="0.3" fill="none"/>
          
          {/* Measurement points */}
          {measurementPoints.map((point) => {
            const hasValue = measurements[point.id] && measurements[point.id] !== '';
            const isHovered = hoveredPoint === point.id;
            
            return (
              <g key={point.id}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? 2.5 : 2}
                  fill={hasValue ? '#14b8a6' : '#6b7280'}
                  stroke="white"
                  strokeWidth="1"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPoint(point.id)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                
                {/* Measurement label */}
                {(isHovered || hasValue) && (
                  <g>
                    <rect
                      x={point.x - 10}
                      y={point.y - 8}
                      width="20"
                      height="6"
                      fill="white"
                      stroke="#e5e7eb"
                      strokeWidth="0.5"
                      rx="1"
                    />
                    <text
                      x={point.x}
                      y={point.y - 4}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-700"
                      style={{ fontSize: '2px' }}
                    >
                      {point.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Measurement Points</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {measurementPoints.map((point) => {
            const hasValue = measurements[point.id] && measurements[point.id] !== '';
            const value = measurements[point.id];
            
            return (
              <div
                key={point.id}
                className={clsx(
                  'flex items-center justify-between p-2 rounded-lg transition-colors',
                  hasValue ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700' : 'bg-gray-50 dark:bg-[#262626]'
                )}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={clsx(
                      'w-3 h-3 rounded-full',
                      hasValue ? 'bg-primary-500' : 'bg-gray-400'
                    )}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{point.label}</span>
                </div>
                {hasValue && (
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {value} {unit}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}