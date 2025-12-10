import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
  delay?: number;
  noPadding?: boolean;
}

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)" }}
      className={twMerge(
        "glass-panel rounded-2xl shadow-sm overflow-hidden transition-all duration-300 dark:shadow-none",
        className
      )}
    >
      {(title || action) && (
        <div className="px-6 py-5 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-center bg-white/40 dark:bg-slate-900/40">
          {title && <h3 className="font-semibold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>}
          {action && <div className="flex items-center">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </motion.div>
  );
};