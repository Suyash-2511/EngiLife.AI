import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Bell, Sun, Moon, Menu } from 'lucide-react';
import { AppRoute } from './types';
import { Dashboard } from './components/Dashboard';
import { StudyCompanion } from './components/Academic/StudyCompanion';
import { LabGenerator } from './components/Academic/LabGenerator';
import { KnowledgeVault } from './components/Academic/KnowledgeVault';
import { BudgetTracker } from './components/Life/BudgetTracker';
import { ResumeBuilder } from './components/Career/ResumeBuilder';
import { OnboardingTutorial } from './components/Onboarding/OnboardingTutorial';
import { AttendanceTracker } from './components/Academic/AttendanceTracker';
import { UserProfile } from './components/Profile/UserProfile';
import { FocusTimer } from './components/Tools/FocusTimer';
import { Sidebar } from './components/Layout/Sidebar';
import { BackgroundCanvas } from './components/Layout/BackgroundCanvas';
import { Login } from './components/Auth/Login';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useAppContext } from './context/AppContext';

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
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
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
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-500">Notifications</h3>
                {notifications.length > 0 && (
                  <button onClick={clearNotifications} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Clear</button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    All caught up!
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${!n.read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className={`text-sm ${!n.read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!n.read && <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5"></div>}
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
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="h-full"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path={`/${AppRoute.ACADEMIC}`} element={<PageWrapper><StudyCompanion /></PageWrapper>} />
        <Route path={`/${AppRoute.VAULT}`} element={<PageWrapper><KnowledgeVault /></PageWrapper>} />
        <Route path={`/${AppRoute.ATTENDANCE}`} element={<PageWrapper><AttendanceTracker /></PageWrapper>} />
        <Route path={`/${AppRoute.LABS}`} element={<PageWrapper><LabGenerator /></PageWrapper>} />
        <Route path={`/${AppRoute.LIFE}`} element={<PageWrapper><BudgetTracker /></PageWrapper>} />
        <Route path={`/${AppRoute.CAREER}`} element={<PageWrapper><ResumeBuilder /></PageWrapper>} />
        <Route path={`/${AppRoute.PROFILE}`} element={<PageWrapper><UserProfile /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

const MainLayout: React.FC = () => {
  const { user, setUser } = useAppContext();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('engiLife_onboarding_completed');
    if (!hasCompletedOnboarding) setShowOnboarding(true);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('engiLife_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <BackgroundCanvas />
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/90 dark:bg-slate-950/90 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary-100 selection:text-primary-900 transition-colors duration-300">
      <BackgroundCanvas />
      
      {showOnboarding && <OnboardingTutorial onComplete={completeOnboarding} />}
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onLogout={handleLogout} 
        user={user} 
      />
      
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden md:ml-72 transition-all duration-300">
        <header className="flex items-center justify-between p-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 dark:text-slate-300">
             <Menu size={24} />
          </button>
          <span className="font-bold text-lg">EngiLife</span>
          <div className="flex gap-2">
            <ThemeToggle />
            <NotificationBell />
          </div>
        </header>

        <main className="w-full max-w-7xl mx-auto p-4 md:p-8 pb-24">
           {/* Top Tools Row (Desktop) */}
           <div className="hidden md:flex justify-end gap-2 mb-6">
              <ThemeToggle />
              <NotificationBell />
           </div>

           <AnimatedRoutes />
        </main>
      </div>

      <FocusTimer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <MainLayout />
      </HashRouter>
    </AppProvider>
  );
}