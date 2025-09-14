import React, { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function AnimatedCard({ children, className = '', hover = true, delay = 0 }: AnimatedCardProps) {
  return (
    <div
      className={`
        bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-gray-100/50
        ${hover ? 'interactive-card animate-smooth-hover neon-green' : ''}
        animate-slide-reveal
        ${className}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}