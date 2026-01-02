import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Github, Chrome, Loader2, AlertCircle, User } from 'lucide-react';
import { api } from '../../services/api';
import { Logo } from '../Shared/Logo';

// --- Helper: Compact Syntax Terminal ---
const SystemBootFeed = () => {
    const [lines, setLines] = useState<string[]>([]);
    const feed = [
        "> [BOOT] ENGILIFE_OS v4.0.1",
        "> [AUTH] ENCRYPTION_LAYER: AES-512",
        "> [SYNC] CAMPUS_MESH_NODE_07... OK",
        "> [DATA] RECOVERING_SESSION... SUCCESS",
        "> [KERN] NEURAL_ADAPTOR LOADED [78ms]",
        "> [INFO] ALL_SYSTEMS_OPERATIONAL"
    ];

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < feed.length) {
                setLines(prev => [...prev, feed[i]].slice(-4));
                i++;
            } else {
                i = 0;
                setLines([]);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const getColor = (line: string) => {
        if (line?.includes('[BOOT]')) return 'text-primary-400';
        if (line?.includes('OK') || line?.includes('SUCCESS')) return 'text-emerald-400';
        return 'text-slate-500';
    };

    return (
        <div className="font-mono text-[9px] leading-relaxed select-none bg-black/40 p-3 rounded-xl border border-white/5 shadow-inner backdrop-blur-sm max-w-xs">
            {lines.map((line, idx) => (
                <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} key={line + idx} className={`flex gap-2 ${getColor(line)}`}>
                    <span className="opacity-20 shrink-0">{(idx + 1).toString().padStart(2, '0')}</span>
                    <span className="truncate">{line}</span>
                </motion.div>
            ))}
            <div className="animate-pulse inline-block w-1.5 h-2.5 bg-primary-500/40 ml-1 mt-0.5" />
        </div>
    );
};

interface LoginProps {
  onLogin: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (verificationRequired) {
        const { user, token } = await api.auth.verifyEmail(email, otp);
        localStorage.setItem('auth_token', token);
        onLogin(user);
      } else {
        if (isLogin) {
          const { user, token, verificationRequired: needsVerify } = await api.auth.login(email, password);
          if (needsVerify) {
            setVerificationRequired(true);
            setLoading(false);
            return;
          }
          if (token && user) {
            localStorage.setItem('auth_token', token);
            onLogin(user);
          }
        } else {
          // Signup
          const { user, verificationRequired: needsVerify } = await api.auth.signup(name, email, 'Computer Science', password);
          if (needsVerify) {
             setVerificationRequired(true);
             setLoading(false);
          } else {
             // Direct login if no verify needed (unlikely based on API but handling it)
             setIsLogin(true);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
      // Simulate social login for demo
      setLoading(true);
      try {
          const mockSocialUser = {
              provider,
              email: `demo.${provider}@example.com`,
              name: `Demo ${provider} User`,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`
          };
          const { user, token } = await api.auth.socialLogin(provider, mockSocialUser.email, mockSocialUser.name, mockSocialUser.avatar);
          localStorage.setItem('auth_token', token);
          onLogin(user);
      } catch (e) {
          setError("Social login failed");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-y-auto">
       <div className="w-full max-w-md relative z-10 py-10">
          <div className="text-center mb-8">
             <div className="inline-block mb-4">
                <Logo size="lg" />
             </div>
             <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
               {isLogin ? 'WELCOME BACK' : 'INITIALIZE PROTOCOL'}
             </h1>
             <p className="text-slate-400 text-sm">
               {isLogin ? 'Enter credentials to access neural link.' : 'Create your digital signature.'}
             </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
          >
             {/* Decorative Elements */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             
             {/* Tabs for Login/Register */}
             {!verificationRequired && (
                <div className="flex bg-black/20 p-1 rounded-xl mb-6 border border-white/5 relative">
                    <motion.div 
                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-lg shadow-sm"
                        animate={{ x: isLogin ? 4 : '100%' }}
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    <button 
                        onClick={() => setIsLogin(true)} 
                        className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors relative z-10 ${isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => setIsLogin(false)} 
                        className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors relative z-10 ${!isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
                    >
                        Register
                    </button>
                </div>
             )}

             {error && (
                <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
                   <AlertCircle size={16} /> {error}
                </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <AnimatePresence mode="wait">
                   {verificationRequired ? (
                      <motion.div 
                        key="otp"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                         <div className="text-center mb-4">
                            <p className="text-emerald-400 font-mono text-xs uppercase tracking-widest mb-2">Verification Code Sent</p>
                            <p className="text-slate-400 text-xs">Check your email for the OTP.</p>
                         </div>
                         <div className="relative group">
                            <input 
                              type="text" 
                              value={otp}
                              onChange={e => setOtp(e.target.value)}
                              placeholder="000000"
                              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-white outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-700"
                            />
                         </div>
                      </motion.div>
                   ) : (
                      <motion.div 
                         key="auth-form"
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -20 }}
                         className="space-y-4"
                      >
                         {!isLogin && (
                           <div className="relative group">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={18} />
                              <input 
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Full Name"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white outline-none focus:border-primary-500/50 transition-colors placeholder:text-slate-500"
                              />
                           </div>
                         )}
                         <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={18} />
                            <input 
                              type="email" 
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              placeholder="Email Address"
                              className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white outline-none focus:border-primary-500/50 transition-colors placeholder:text-slate-500"
                            />
                         </div>
                         <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={18} />
                            <input 
                              type="password" 
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              placeholder="Password"
                              className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white outline-none focus:border-primary-500/50 transition-colors placeholder:text-slate-500"
                            />
                         </div>
                      </motion.div>
                   )}
                </AnimatePresence>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6"
                >
                   {loading ? <Loader2 className="animate-spin" /> : (
                      <>
                        {verificationRequired ? 'Verify & Access' : (isLogin ? 'Access System' : 'Create Account')} <ArrowRight size={18} />
                      </>
                   )}
                </button>
             </form>

             {!verificationRequired && (
                <>
                   <div className="my-6 flex items-center gap-4">
                      <div className="h-px bg-white/5 flex-1" />
                      <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Or connect with</span>
                      <div className="h-px bg-white/5 flex-1" />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => handleSocialLogin('Google')} className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl py-2.5 flex items-center justify-center gap-2 transition-colors">
                         <Chrome size={18} className="text-white" /> <span className="text-xs font-bold text-white">Google</span>
                      </button>
                      <button onClick={() => handleSocialLogin('GitHub')} className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl py-2.5 flex items-center justify-center gap-2 transition-colors">
                         <Github size={18} className="text-white" /> <span className="text-xs font-bold text-white">GitHub</span>
                      </button>
                   </div>
                </>
             )}
          </motion.div>

          <div className="mt-8 flex justify-center">
             <SystemBootFeed />
          </div>
       </div>
    </div>
  );
};
