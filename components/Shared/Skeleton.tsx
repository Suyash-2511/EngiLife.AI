import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rectangular' }) => {
  const baseClasses = "animate-pulse bg-slate-200 dark:bg-slate-800";
  const variantClasses = {
    text: "h-4 rounded",
    rectangular: "rounded-xl",
    circular: "rounded-full"
  };

  return (
    <div className={twMerge(baseClasses, variantClasses[variant], className)} />
  );
};