
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { Bell, Sun, Moon, Loader2 } from 'lucide-react';
import { AppRoute } from './types';
import { Dashboard } from './components/Dashboard';
import { StudyCompanion } from './components/Academic/StudyCompanion';
import { LabGenerator } from './components/Academic/LabGenerator';
import { KnowledgeVault } from './components/Academic/KnowledgeVault';
import { BudgetTracker } from './components/Life/BudgetTracker';
import { ResumeBuilder } from './components/Career/ResumeBuilder';
import { AttendanceTracker } from './components/Academic/AttendanceTracker';
import { UserProfile } from './components/Profile/UserProfile';
import { CommunityHub } from './components/Community/CommunityHub';
import { Sidebar } from './components/Layout/Sidebar';
import { BackgroundCanvas } from './components/Layout/BackgroundCanvas';
import { Login } from './components/Auth/Login';
import { BottomNav } from './components/Layout/BottomNav';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useAppContext } from './context/AppContext';
import { api } from './services/api';
import { Logo } from './components/Shared/Logo';

// --- Shared Components ---

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

const NotificationBell: React.FC = () => {
  const { notifications, markNotificationRead, clearNotifications } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-950"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">System Logs</h3>
                {notifications.length > 0 && (
                  <button onClick={clearNotifications} className="text-[10px] text-primary-600 font-black uppercase tracking-widest hover:underline">Flush All</button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs font-bold italic opacity-40 uppercase tracking-widest">
                    Null Logs
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${!n.read ? 'bg-primary-50/20 dark:bg-primary-900/10' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className={`text-sm ${!n.read ? 'font-black text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-medium leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-2 font-mono font-bold">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                        </div>
                        {!n.read && <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    className="h-full"
  >
    {children}
  </motion.div>
);

// --- Layouts ---

const EntrySplash: React.FC<{ onComplete: () => void; user: any }> = ({ onComplete, user }) => {
  const [bootText, setBootText] = useState("INITIALIZING SYSTEM KERNEL...");
  
  useEffect(() => {
    const sequence = [
      { text: "LOADING NEURAL MODULES...", delay: 800 },
      { text: "SYNCING CAMPUS MESH...", delay: 1600 },
      { text: "ESTABLISHING SECURE UPLINK...", delay: 2200 },
      { text: `WELCOME BACK, ${user?.name?.split(' ')[0].toUpperCase() || 'USER'}`, delay: 2800 }
    ];

    sequence.forEach(({ text, delay }) => {
      setTimeout(() => setBootText(text), delay);
    });

    const timer = setTimeout(onComplete, 3500);
    return () => clearTimeout(timer);
  }, [onComplete, user]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a090f] overflow-hidden"
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
         <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"
         />
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>
      
      <div className="flex flex-col items-center relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="mb-10"
        >
           <Logo size="xl" />
        </motion.div>

        <div className="text-center h-16">
          <motion.h2 
            className="text-3xl font-black text-white tracking-tighter mb-2"
          >
            ENGILIFE<span className="text-primary-500">.</span>AI
          </motion.h2>
          <motion.p 
            key={bootText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary-400 text-[10px] font-mono font-bold uppercase tracking-[0.3em]"
          >
            {bootText}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

const DashboardLayout: React.FC = () => {
  const { user, setUser } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  const handleLogout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent text-slate-900 dark:text-slate-100 font-sans selection:bg-primary-100 selection:text-primary-900 transition-colors duration-300">
      <AnimatePresence>
        {showSplash && <EntrySplash onComplete={() => setShowSplash(false)} user={user} />}
      </AnimatePresence>

      <BackgroundCanvas />
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onLogout={handleLogout} 
        user={user!} 
      />
      
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden md:ml-72 transition-all duration-300">
        <header className="flex items-center justify-between px-6 py-4 md:hidden sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <div className="flex items-center gap-3">
             <Logo size="sm" />
             <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white uppercase">EngiLife</span>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <NotificationBell />
          </div>
        </header>

        <main className="w-full max-w-7xl mx-auto p-6 md:p-10 pb-32 md:pb-24">
           <div className="hidden md:flex justify-end gap-3 mb-10">
              <ThemeToggle />
              <NotificationBell />
           </div>

           <AnimatePresence mode="wait">
             <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
                <Route path={AppRoute.ACADEMIC} element={<PageWrapper><StudyCompanion /></PageWrapper>} />
                <Route path={AppRoute.VAULT} element={<PageWrapper><KnowledgeVault /></PageWrapper>} />
                <Route path={AppRoute.ATTENDANCE} element={<PageWrapper><AttendanceTracker /></PageWrapper>} />
                <Route path={AppRoute.LABS} element={<PageWrapper><LabGenerator /></PageWrapper>} />
                <Route path={AppRoute.LIFE} element={<PageWrapper><BudgetTracker /></PageWrapper>} />
                <Route path={AppRoute.CAREER} element={<PageWrapper><ResumeBuilder /></PageWrapper>} />
                <Route path={AppRoute.COMMUNITY} element={<PageWrapper><CommunityHub /></PageWrapper>} />
                <Route path={AppRoute.PROFILE} element={<PageWrapper><UserProfile /></PageWrapper>} />
                <Route path="*" element={<Navigate to="/" replace />} />
             </Routes>
           </AnimatePresence>
        </main>
      </div>

      <BottomNav onOpenMenu={() => setSidebarOpen(true)} />
    </div>
  );
};

// --- App Container ---

const RouterContent: React.FC = () => {
  const { user, setUser, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a090f] overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)]"></div>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8 relative z-10">
              <Logo size="lg" />
              
              <div className="text-center">
                  <p className="text-white text-lg font-black tracking-tight mb-2">ENGILIFE</p>
                  <p className="text-primary-500 text-[10px] font-mono font-bold uppercase tracking-[0.4em] animate-pulse">Establishing Connection...</p>
              </div>
          </motion.div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? (
          <div className="relative min-h-screen bg-slate-950">
            <BackgroundCanvas />
            <Login onLogin={setUser} />
          </div>
        ) : <Navigate to="/" replace />} 
      />
      <Route 
        path="/*" 
        element={user ? <DashboardLayout /> : <Navigate to="/login" replace />} 
      />
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <RouterContent />
      </HashRouter>
    </AppProvider>
  );
}
