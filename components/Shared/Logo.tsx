
import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', animated = true }) => {
  const dimensions = {
    sm: 24,
    md: 40,
    lg: 64,
    xl: 96
  };

  const dim = dimensions[size];
  const strokeWidth = size === 'sm' ? 8 : 6;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: dim, height: dim }}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        <defs>
          <linearGradient id="logo_grad_shared" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        
        {/* Outer Hexagon */}
        <motion.path 
          d="M50 5 L92 28 V72 L50 95 L8 72 V28 Z" 
          stroke="url(#logo_grad_shared)" 
          strokeWidth={strokeWidth} 
          strokeLinecap="round" 
          strokeLinejoin="round"
          initial={animated ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Inner Circuit/Structure - Represents 'E' and Connectivity */}
        <motion.path 
          d="M50 50 L50 20 M50 50 L76 65 M50 50 L24 65" 
          stroke="url(#logo_grad_shared)" 
          strokeWidth={strokeWidth} 
          strokeLinecap="round"
          initial={animated ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        />

        {/* Central Core Node */}
        <motion.circle 
          cx="50" cy="50" r={size === 'sm' ? 10 : 8} 
          fill="url(#logo_grad_shared)"
          initial={animated ? { scale: 0 } : { scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 1 }}
        />
        
        <motion.circle 
          cx="50" cy="50" r={size === 'sm' ? 4 : 3} 
          fill="white"
          initial={animated ? { scale: 0 } : { scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 1.2 }}
        />
      </svg>
      
      {/* Glow Effect */}
      {animated && (
        <motion.div 
          className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full -z-10"
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
};
