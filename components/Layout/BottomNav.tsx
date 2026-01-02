import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, Heart, Briefcase, Menu, Grid } from 'lucide-react';
import { AppRoute } from '../../types';

interface BottomNavProps {
  onOpenMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMenu }) => {
  const navItems = [
    { id: '', label: 'Home', icon: LayoutDashboard },
    { id: AppRoute.ACADEMIC, label: 'Tutor', icon: BookOpen },
    { id: AppRoute.LIFE, label: 'Life', icon: Heart },
    { id: AppRoute.CAREER, label: 'Career', icon: Briefcase },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={`/${item.id}`}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-colors ${
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative p-1">
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-200" style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }} />
                    {isActive && (
                        <motion.div 
                            layoutId="bottomNavIndicator"
                            className="absolute -top-1 right-0 w-1.5 h-1.5 rounded-full bg-primary-500"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                </div>
                <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 active:scale-95 transition-transform"
        >
          <div className="p-1">
             <Grid size={22} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-semibold tracking-wide">More</span>
        </button>
      </div>
    </div>
  );
};