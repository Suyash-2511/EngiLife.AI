
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, Beaker, Heart, 
  Briefcase, X, ClipboardCheck, Archive, LogOut, Users, Settings
} from 'lucide-react';
import { AppRoute } from '../../types';
import clsx from 'clsx';
import { Logo } from '../Shared/Logo';

const NAV_ITEMS = [
  { id: '/', label: 'Dashboard', icon: LayoutDashboard },
  { id: `/${AppRoute.ATTENDANCE}`, label: 'Attendance', icon: ClipboardCheck },
  { id: `/${AppRoute.ACADEMIC}`, label: 'AI Tutor', icon: BookOpen },
  { id: `/${AppRoute.VAULT}`, label: 'Knowledge Vault', icon: Archive },
  { id: `/${AppRoute.LABS}`, label: 'Lab Assistant', icon: Beaker },
  { id: `/${AppRoute.LIFE}`, label: 'Life & Wallet', icon: Heart },
  { id: `/${AppRoute.CAREER}`, label: 'Career Prep', icon: Briefcase },
  { id: `/${AppRoute.COMMUNITY}`, label: 'Community', icon: Users },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user: { name: string; email: string };
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout, user }) => {
  const navigate = useNavigate();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <aside
        className={clsx(
          "fixed top-0 left-0 z-50 h-screen w-72 border-r border-slate-200/60 dark:border-slate-900 bg-white/80 dark:bg-slate-950/90 backdrop-blur-2xl flex flex-col justify-between shadow-2xl md:shadow-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <motion.div 
            className="flex flex-col h-full"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
          <div className="p-8 pb-4">
             <div className="flex items-center justify-between">
                <motion.div 
                  className="flex items-center gap-4 cursor-pointer" 
                  whileHover={{ scale: 1.02 }}
                  onClick={() => { onClose(); navigate('/'); }}
                >
                  <Logo size="md" />
                  <div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">EngiLife<span className="text-primary-500">.</span></h1>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Student OS</span>
                  </div>
                </motion.div>
                <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-rose-500 transition-all hover:scale-110">
                  <X size={20} />
                </button>
             </div>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
            <p className="px-5 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mb-4">Core Directory</p>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.id}
                to={item.id}
                onClick={() => window.innerWidth < 768 && onClose()}
                className={({ isActive }) => clsx(
                  "relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group overflow-hidden border border-transparent font-bold tracking-tight",
                  isActive ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border-primary-100 dark:border-primary-900/50' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <item.icon size={20} strokeWidth={2.5} className="relative z-10 transition-transform group-hover:scale-110" />
                <span className="relative z-10">{item.label}</span>
                <NavLink to={item.id} className={({ isActive }) => isActive ? "absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" : "hidden"} />
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-900">
             <motion.div 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => { onClose(); navigate('/profile'); }}
               className="bg-white/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 p-4 rounded-3xl flex items-center gap-4 hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-900 transition-all group relative cursor-pointer"
             >
               <div className="relative">
                 <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="User" className="w-11 h-11 rounded-2xl object-cover ring-2 ring-white dark:ring-slate-800 shadow-lg" />
                 <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-primary-500 transition-colors uppercase tracking-tighter">{user.name}</p>
                 <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest truncate">System Root</p>
               </div>
               <div className="flex flex-col gap-1">
                   <button onClick={(e) => { e.stopPropagation(); onClose(); navigate('/profile'); }} className="p-1.5 text-slate-400 hover:text-primary-500 transition-all">
                        <Settings size={16} />
                   </button>
                   <button onClick={(e) => { e.stopPropagation(); onLogout(); }} className="p-1.5 text-slate-400 hover:text-rose-600 transition-all hover:rotate-12">
                        <LogOut size={16} />
                   </button>
               </div>
             </motion.div>
          </div>
        </motion.div>
      </aside>
    </>
  );
};
