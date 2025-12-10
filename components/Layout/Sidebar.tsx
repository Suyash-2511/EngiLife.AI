import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, Beaker, Heart, 
  Briefcase, X, ClipboardCheck, Archive, LogOut
} from 'lucide-react';
import { AppRoute } from '../../types';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { id: AppRoute.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: AppRoute.ATTENDANCE, label: 'Attendance', icon: <ClipboardCheck size={20} /> },
  { id: AppRoute.ACADEMIC, label: 'AI Tutor', icon: <BookOpen size={20} /> },
  { id: AppRoute.VAULT, label: 'Knowledge Vault', icon: <Archive size={20} /> },
  { id: AppRoute.LABS, label: 'Lab Assistant', icon: <Beaker size={20} /> },
  { id: AppRoute.LIFE, label: 'Life & Wallet', icon: <Heart size={20} /> },
  { id: AppRoute.CAREER, label: 'Career Prep', icon: <Briefcase size={20} /> },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user: { name: string; email: string };
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout, user }) => {
  const location = useLocation();
  const currentPath = location.pathname.replace('/', '') || AppRoute.DASHBOARD;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={clsx(
          "fixed top-0 left-0 z-50 h-screen w-72 border-r border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-950/90 backdrop-blur-xl transition-all duration-300 md:translate-x-0 shadow-2xl md:shadow-none flex flex-col justify-between",
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-8 pb-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <span className="text-white font-bold text-xl font-mono">E</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">EngiLife</h1>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">Student OS v2.1</span>
                  </div>
                </div>
                <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
             </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-mono">Menu</p>
            {NAV_ITEMS.map((item) => {
              const isActive = (currentPath === item.id || (currentPath === '' && item.id === AppRoute.DASHBOARD));
              return (
                <Link
                  key={item.id}
                  to={item.id === AppRoute.DASHBOARD ? '/' : `/${item.id}`}
                  onClick={() => window.innerWidth < 768 && onClose()}
                  className="relative group block"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className={clsx(
                    "relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-colors",
                    isActive ? 'text-primary-700 dark:text-primary-300 font-medium' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                  )}>
                    <span className={clsx(isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <Link to="/profile">
               <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl flex items-center gap-3 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors group relative cursor-pointer">
                 <div className="relative">
                   <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="User" className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm" />
                   <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                   <p className="text-xs text-slate-500 dark:text-slate-500 font-mono truncate">View Profile</p>
                 </div>
                 <button 
                   onClick={(e) => { e.preventDefault(); onLogout(); }}
                   className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors z-10"
                   title="Logout"
                 >
                   <LogOut size={16} />
                 </button>
               </div>
            </Link>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
