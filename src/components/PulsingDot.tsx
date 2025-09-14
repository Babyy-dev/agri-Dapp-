import React from 'react';

interface PulsingDotProps {
  color?: 'green' | 'blue' | 'red' | 'amber' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

export function PulsingDot({ color = 'green', size = 'md' }: PulsingDotProps) {
  const colorClasses = {
    green: 'bg-green-400',
    blue: 'bg-blue-400',
    red: 'bg-red-400',
    amber: 'bg-amber-400',
    purple: 'bg-purple-400'
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="relative flex items-center justify-center">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-ping absolute opacity-60`}></div>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-breathe shadow-lg`} style={{
        boxShadow: `0 0 15px ${color === 'green' ? 'rgba(34, 197, 94, 0.6)' : color === 'blue' ? 'rgba(2, 132, 199, 0.6)' : color === 'red' ? 'rgba(220, 38, 38, 0.6)' : color === 'amber' ? 'rgba(217, 119, 6, 0.6)' : 'rgba(124, 58, 237, 0.6)'}`
      }}></div>
    </div>
  );
}