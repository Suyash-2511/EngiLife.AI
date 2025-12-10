import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, Check, X } from 'lucide-react';
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
    <motion.button 
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors backdrop-blur-sm"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </motion.button>
  );
};

const NotificationDropdown: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearNotifications } = useAppContext();
  
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-16 right-6 w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
    >
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
        {notifications.length > 0 && (
          <button onClick={clearNotifications} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Clear all</button>
        )}
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No new notifications
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              onClick={() => markNotificationRead(n.id)}
              className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${!n.read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className={`text-sm ${!n.read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5"></div>}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { notifications } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between md:justify-end bg-slate-50/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50"
    >
      <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg backdrop-blur-sm">
        <Menu size={24} />
      </button>
      <div className="flex items-center gap-4 relative">
        <ThemeToggle />
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNotifications(!showNotifications)}
          className={`relative p-2.5 rounded-full border shadow-sm transition-colors backdrop-blur-sm ${
             showNotifications 
             ? 'bg-primary-100 text-primary-600 border-primary-200' 
             : 'bg-white/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 ring-1 ring-red-500/30"></span>
          )}
        </motion.button>

        {/* Backdrop for mobile to close dropdown */}
        {showNotifications && (
           <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
        )}
        
        <AnimatePresence>
          {showNotifications && (
            <NotificationDropdown isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -15, scale: 0.98 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="h-full"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const { user } = useAppContext();
  
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, setUser } = useAppContext();
  const [showOnboarding, setShowOnboarding] = useState(false);

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
    // Changed bg to be transparent/subtle so canvas shows through
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950/80 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary-100 selection:text-primary-900 transition-colors duration-300 relative">
      <BackgroundCanvas />
      
      {showOnboarding && <OnboardingTutorial onComplete={completeOnboarding} />}
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onLogout={handleLogout}
        user={user}
      />
      
      <div className="md:ml-72 transition-all duration-300 min-h-screen flex flex-col relative z-10">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1">
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
