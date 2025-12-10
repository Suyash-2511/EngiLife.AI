import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ArrowRight, Lock, Mail, User, 
  ScanFace, Github, Chrome, Check, ShieldCheck, GraduationCap 
} from 'lucide-react';

interface LoginProps {
  onLogin: (user: { name: string; email: string }) => void;
}

// --- Helper: Password Strength Meter ---
const PasswordStrengthMeter = ({ password }: { password: string }) => {
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 5) score++;
    if (pass.length > 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // Max 5
  };

  const strength = getStrength(password);
  const colors = ['bg-slate-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-primary-600'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Secure'];

  if (!password) return null;

  return (
    <div className="space-y-1 mt-2">
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div 
            key={level} 
            className={`h-full flex-1 rounded-full transition-colors duration-300 ${strength >= level ? colors[strength] : 'bg-slate-100 dark:bg-slate-800'}`} 
          />
        ))}
      </div>
      <p className={`text-[10px] font-medium text-right ${strength < 3 ? 'text-red-500' : 'text-emerald-500'}`}>
        {labels[strength]}
      </p>
    </div>
  );
};

// --- Helper: Face ID Scanner Animation ---
const FaceIDScanner = ({ onComplete }: { onComplete: () => void }) => {
  const [status, setStatus] = useState<'scanning' | 'success'>('scanning');

  useEffect(() => {
    const timer = setTimeout(() => setStatus('success'), 2000);
    const complete = setTimeout(onComplete, 3000);
    return () => { clearTimeout(timer); clearTimeout(complete); };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative w-32 h-32">
        {/* Scanner Box */}
        <svg className="absolute inset-0 w-full h-full text-primary-500" viewBox="0 0 100 100">
          <path d="M10,30 V10 H30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M70,10 H90 V30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M10,70 V90 H30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M90,70 V90 H70" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          {status === 'scanning' ? (
            <motion.div 
              key="scan"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <ScanFace size={64} className="text-primary-400 opacity-50" />
              <motion.div 
                className="absolute w-full h-1 bg-primary-400 shadow-[0_0_15px_rgba(139,92,246,0.8)]"
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ scale: 0.5, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 rounded-2xl"
            >
              <div className="bg-emerald-500 rounded-full p-2 shadow-lg shadow-emerald-500/30">
                <Check size={48} className="text-white" strokeWidth={3} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-6 text-sm font-medium tracking-wider uppercase text-slate-500 animate-pulse">
        {status === 'scanning' ? 'Verifying Biometrics...' : 'Identity Confirmed'}
      </p>
    </div>
  );
};

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'faceid'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('Computer Science');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin({ name: name || 'Engineering Student', email });
      setLoading(false);
    }, 1500);
  };

  const startFaceID = () => {
    setMode('faceid');
  };

  return (
    <div className="min-h-screen w-full flex bg-transparent"> {/* Made transparent */}
      {/* Visual Side (Left) - Glass Panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12">
        <div className="relative z-20 max-w-lg text-slate-800 dark:text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl p-10 rounded-3xl border border-white/20 shadow-2xl"
          >
            <div className="w-14 h-14 bg-gradient-to-tr from-primary-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-8 shadow-glow ring-1 ring-white/20 backdrop-blur-md">
              <span className="text-3xl font-bold font-mono text-white">E</span>
            </div>
            <h1 className="text-5xl font-bold mb-6 tracking-tight leading-tight">
              The OS for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500 dark:from-primary-400 dark:to-indigo-300">Future Engineers.</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
              Seamlessly integrate your academic, financial, and career goals into one intelligent ecosystem.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-5 hover:bg-white/50 dark:hover:bg-white/10 transition-colors">
                <ShieldCheck className="text-emerald-500 dark:text-emerald-400 mb-2" size={24} />
                <span className="text-2xl font-bold block mb-1">Secure</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">End-to-End Encrypted</span>
              </div>
              <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-5 hover:bg-white/50 dark:hover:bg-white/10 transition-colors">
                <GraduationCap className="text-primary-600 dark:text-primary-400 mb-2" size={24} />
                <span className="text-2xl font-bold block mb-1">Smart</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI-Powered Tutor</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Side (Right) - Glass Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-3xl border border-white/40 dark:border-slate-800 shadow-2xl">
          <AnimatePresence mode="wait">
            {mode === 'faceid' ? (
              <motion.div 
                key="faceid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center"
              >
                <FaceIDScanner onComplete={() => onLogin({ name: 'Alex Johnson', email: 'alex@engilife.edu' })} />
                <button 
                  onClick={() => setMode('login')}
                  className="mt-8 text-sm text-slate-500 hover:text-primary-600 underline"
                >
                  Cancel and use password
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center lg:text-left mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {mode === 'login' ? 'Welcome Back' : 'Join EngiLife'}
                  </h2>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">
                    {mode === 'login' ? 'Enter your credentials to access your dashboard.' : 'Start your engineering journey today.'}
                  </p>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors dark:text-white shadow-sm">
                    <Chrome size={20} className="text-slate-900 dark:text-white" /> 
                    <span className="text-sm font-medium">Google</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors dark:text-white shadow-sm">
                    <Github size={20} className="text-slate-900 dark:text-white" /> 
                    <span className="text-sm font-medium">GitHub</span>
                  </button>
                </div>

                <div className="relative flex items-center gap-4 mb-8">
                  <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                  <span className="text-xs text-slate-400 uppercase font-medium">Or continue with</span>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {mode === 'signup' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-5">
                      <div className="relative group">
                        <User className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white shadow-sm"
                        />
                      </div>
                      <div className="relative group">
                        <GraduationCap className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                        <select
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white appearance-none shadow-sm"
                        >
                          <option>Computer Science</option>
                          <option>Mechanical Engineering</option>
                          <option>Electrical Engineering</option>
                          <option>Civil Engineering</option>
                        </select>
                        <ChevronRight className="absolute right-3 top-3.5 text-slate-400 pointer-events-none rotate-90" size={16} />
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Student Email"
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white shadow-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white shadow-sm"
                      />
                    </div>
                    {mode === 'signup' && <PasswordStrengthMeter password={password} />}
                  </div>

                  {mode === 'login' && (
                    <div className="flex justify-between items-center text-sm">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                        <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                        Remember me
                      </label>
                      <button type="button" className="text-primary-600 hover:text-primary-700 font-medium">Forgot Password?</button>
                    </div>
                  )}

                  <div className="pt-2 space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed group active:scale-[0.98]"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {mode === 'login' ? 'Sign In' : 'Create Account'}
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                    
                    {mode === 'login' && (
                       <button
                         type="button"
                         onClick={startFaceID}
                         className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-all"
                       >
                         <ScanFace size={20} /> Login with Face ID
                       </button>
                    )}
                  </div>
                </form>

                <div className="text-center mt-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                    <button 
                      onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                      className="ml-2 font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                    >
                      {mode === 'login' ? 'Sign up' : 'Log in'}
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
