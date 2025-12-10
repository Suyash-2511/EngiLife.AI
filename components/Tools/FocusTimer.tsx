import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Timer, Coffee, Zap } from 'lucide-react';
import { Button } from '../Shared/Button';

export const FocusTimer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound or notify
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(mode === 'focus' ? "Focus Session Complete!" : "Break Over!", {
            body: mode === 'focus' ? "Time to take a break." : "Back to work!"
        });
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus' 
    ? 1 - (timeLeft / (25 * 60)) 
    : 1 - (timeLeft / (5 * 60));

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg shadow-primary-600/30 flex items-center justify-center hover:bg-primary-700 transition-colors"
          >
            <Timer size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Timer size={18} />
                <span className="font-semibold">Focus Mode</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <div className="flex justify-center gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                  onClick={() => switchMode('focus')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${mode === 'focus' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Zap size={12} /> Focus
                </button>
                <button 
                  onClick={() => switchMode('break')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${mode === 'break' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Coffee size={12} /> Break
                </button>
              </div>

              <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                    <motion.circle 
                        cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        className={mode === 'focus' ? "text-primary-500" : "text-emerald-500"}
                        strokeDasharray={2 * Math.PI * 88}
                        strokeDashoffset={2 * Math.PI * 88 * (1 - progress)}
                        strokeLinecap="round"
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-mono font-bold text-slate-800 dark:text-white tracking-tighter">
                      {formatTime(timeLeft)}
                    </span>
                    <span className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-medium">
                      {isActive ? 'Running' : 'Paused'}
                    </span>
                 </div>
              </div>

              <div className="flex justify-center gap-3">
                 <Button 
                   onClick={toggleTimer}
                   className={`w-12 h-12 rounded-full flex items-center justify-center !p-0 ${isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary-600 hover:bg-primary-700'}`}
                 >
                    {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                 </Button>
                 <Button 
                   variant="secondary" 
                   onClick={resetTimer}
                   className="w-12 h-12 rounded-full flex items-center justify-center !p-0"
                 >
                    <RotateCcw size={20} />
                 </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
