import React from 'react';
import { motion, Variants } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
  delay?: number;
  noPadding?: boolean;
}

const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: (delay: number) => ({ 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      delay: delay, 
      ease: [0.22, 1, 0.36, 1] 
    }
  }),
  hover: { 
    y: -8, 
    scale: 1.02,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 25,
      mass: 0.8
    }
  }
};

const glowVariants: Variants = {
  hover: {
    opacity: 0.8,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  title, 
  action, 
  delay = 0,
  noPadding = false
}) => {
  return (
    <motion.div
      custom={delay}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={twMerge(
        // Base glass styles
        "bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl backdrop-saturate-150",
        "border border-white/50 dark:border-white/10 rounded-2xl",
        "shadow-glass dark:shadow-glass-dark", 
        // We rely on framer-motion for the physical lift (y/scale), 
        // but we use CSS transition for the shadow intensity to keep it performant and theme-aware
        "hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-900/20",
        "overflow-hidden relative group transition-shadow duration-300",
        className
      )}
    >
      {/* Subtle liquid reflection gradient on top - animates on parent hover */}
      <motion.div 
        variants={glowVariants}
        className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/5 pointer-events-none z-0 opacity-0"
      />
      
      {(title || action) && (
        <div className="relative z-10 px-6 py-4 border-b border-white/30 dark:border-white/5 flex justify-between items-center bg-white/30 dark:bg-slate-900/20">
          {title && <h3 className="font-semibold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>}
          {action && <div className="flex items-center">{action}</div>}
        </div>
      )}
      <div className={twMerge("relative z-10", noPadding ? '' : 'p-6')}>
        {children}
      </div>
    </motion.div>
  );
};
