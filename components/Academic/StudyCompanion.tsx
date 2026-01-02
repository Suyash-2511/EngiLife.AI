
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, BookOpen, Atom, Cpu, Activity, Sparkles, MessageSquare, 
  Trash2, History, Brain, Lightbulb, Image as ImageIcon, X, 
  Volume2, Copy, Save, Check, Paperclip, Loader2, Mic, MicOff, StopCircle, ArrowUp
} from 'lucide-react';
import { Card } from '../Shared/Card';
import { explainConcept } from '../../services/gemini';
import { Message } from '../../types';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';

const BRANCHES = ['Computer Science', 'Mechanical', 'Civil', 'Electrical', 'Electronics'];

const QUICK_PROMPTS: Record<string, string[]> = {
  'Computer Science': ['Explain Big O Notation', 'REST API vs GraphQL', 'How does a compiler work?', 'Explain Deadlocks'],
  'Mechanical': ['Bernoulli’s Principle', 'Laws of Thermodynamics', 'Gear Ratios explained', 'Stress vs Strain'],
  'Civil': ['Tensile Strength', 'Types of Foundations', 'Concrete curing process', 'Fluid Mechanics basics'],
  'Electrical': ['Kirchhoff’s Laws', 'AC vs DC Motor', 'Power Factor Correction', 'Transformers explained'],
  'Electronics': ['How a Transistor works', 'Op-Amp basics', 'Digital Logic Gates', 'Microcontroller architecture']
};

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  branch: string;
  date: string;
}

interface MessageExtended extends Message {
  image?: string;
}

export const StudyCompanion: React.FC = () => {
  const { user, addNote } = useAppContext();
  const [selectedBranch, setSelectedBranch] = useState(user?.branch || BRANCHES[0]);
  const [query, setQuery] = useState('');
  const [learningMode, setLearningMode] = useState<'simple' | 'socratic'>('simple');
  const [messages, setMessages] = useState<MessageExtended[]>([]); // Empty initially to show Zero State
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // History State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Media State
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // --- Voice Recognition Setup ---
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        setQuery(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setQuery('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, attachedImage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle Image Upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAttachedImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (text: string = query) => {
    if ((!text.trim() && !attachedImage)) return;

    // Stop listening if active
    if (isListening) recognitionRef.current?.stop();

    const currentMode = learningMode;
    const currentImage = attachedImage;

    const userMsg: MessageExtended = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      image: currentImage || undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setAttachedImage(null);
    setIsLoading(true);

    const responseText = await explainConcept(
        userMsg.text, 
        selectedBranch, 
        currentMode,
        currentImage || undefined
    );

    const aiMsg: MessageExtended = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now(),
      mode: currentMode
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const startNewChat = () => {
    if (messages.length > 0) {
       const newSession: ChatSession = {
           id: Date.now().toString(),
           title: messages[0].text.substring(0, 30) + "...",
           messages: messages,
           branch: selectedBranch,
           date: new Date().toLocaleDateString()
       };
       setSessions([newSession, ...sessions]);
    }
    setMessages([]);
    setAttachedImage(null);
  };

  const loadSession = (session: ChatSession) => {
      setMessages(session.messages);
      setSelectedBranch(session.branch);
      setShowHistory(false);
  };

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  const handleSaveToVault = (text: string) => {
      const title = text.split('\n')[0].replace(/[#*]/g, '').trim().substring(0, 40) || 'AI Conversation';
      addNote(`Saved: ${title}`, text);
  };

  const handleSpeak = (text: string, id: string) => {
      if (speakingId === id) {
          window.speechSynthesis.cancel();
          setSpeakingId(null);
      } else {
          window.speechSynthesis.cancel();
          // Strip markdown for speech
          const cleanText = text.replace(/[*#`_]/g, '');
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.onend = () => setSpeakingId(null);
          setSpeakingId(id);
          window.speechSynthesis.speak(utterance);
      }
  };

  return (
    <div className="flex h-[calc(100dvh-120px)] gap-4 overflow-hidden relative">
      {/* --- Sidebar History (Responsive Drawer) --- */}
      <AnimatePresence mode="wait">
        {showHistory && (
          <>
            {/* Backdrop for Mobile */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHistory(false)}
                className="md:hidden fixed inset-0 bg-slate-950/80 z-20 backdrop-blur-sm"
            />
            
            <motion.aside 
                initial={{ x: -280, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                exit={{ x: -280, opacity: 0 }}
                className="absolute md:relative left-0 top-0 bottom-0 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 rounded-r-3xl md:rounded-3xl shadow-2xl z-30 flex flex-col overflow-hidden"
            >
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Archives</span>
                    <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {sessions.length === 0 && (
                        <div className="text-center py-10 opacity-50">
                            <History size={32} className="mx-auto mb-2 stroke-1" />
                            <p className="text-xs">No past conversations.</p>
                        </div>
                    )}
                    {sessions.map(s => (
                        <button 
                            key={s.id} 
                            onClick={() => loadSession(s)}
                            className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
                        >
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{s.title}</p>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">{s.branch}</span>
                                <span className="text-[10px] text-slate-400">{s.date}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- Main Chat Area --- */}
      <div className="flex-1 flex flex-col h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/50 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        
        {/* Chat Header */}
        <header className="px-4 md:px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-2.5 rounded-xl transition-all ${showHistory ? 'bg-primary-100 text-primary-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
                >
                    <History size={18} />
                </button>
                
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>

                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-800 dark:text-white tracking-tight">AI Tutor</span>
                        <span className="hidden md:inline text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full font-bold">BETA</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span className="hidden md:inline">Specialized in</span>
                        <select 
                           value={selectedBranch}
                           onChange={(e) => setSelectedBranch(e.target.value)}
                           className="bg-transparent font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:underline max-w-[120px] md:max-w-none truncate"
                        >
                            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button 
                        onClick={() => setLearningMode('simple')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${learningMode === 'simple' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <BookOpen size={14}/> <span className="hidden md:inline">Explain</span>
                    </button>
                    <button 
                        onClick={() => setLearningMode('socratic')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${learningMode === 'socratic' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Brain size={14}/> <span className="hidden md:inline">Socratic</span>
                    </button>
                </div>
                <button 
                  onClick={startNewChat}
                  className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 size={18} />
                </button>
            </div>
        </header>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth custom-scrollbar">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/20 dark:to-indigo-900/20 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-primary-500/10">
                        <Sparkles size={40} className="text-primary-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                        Engineering Assistant
                    </h2>
                    <p className="text-slate-500 max-w-sm mb-8 text-sm">
                        I can help you solve complex problems, understand core concepts in <span className="font-bold text-slate-700 dark:text-slate-300">{selectedBranch}</span>, or prepare for exams.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                        {QUICK_PROMPTS[selectedBranch]?.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(prompt)}
                                className="p-4 text-left bg-white dark:bg-slate-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/10 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all group"
                            >
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{prompt}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                messages.map((msg) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id}
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                            msg.role === 'model' 
                            ? 'bg-gradient-to-br from-indigo-500 to-primary-500 border-transparent text-white' 
                            : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
                        }`}>
                            {msg.role === 'model' ? <Sparkles size={14} /> : <span className="text-xs font-bold">YOU</span>}
                        </div>

                        <div className={`flex flex-col max-w-[85%] lg:max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            {msg.image && (
                                <div className="mb-2 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
                                    <img src={msg.image} alt="Uploaded" className="max-h-64 object-contain bg-slate-50 dark:bg-slate-900" />
                                </div>
                            )}
                            
                            <div className={`rounded-2xl p-4 md:p-5 shadow-sm relative ${
                                msg.role === 'user'
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-tr-none'
                                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                            }`}>
                                {msg.role === 'model' ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-code:text-primary-600 dark:prose-code:text-primary-400 prose-pre:bg-slate-900 dark:prose-pre:bg-black prose-pre:rounded-xl">
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        {msg.mode === 'socratic' && (
                                            <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500 font-bold bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg">
                                                <Lightbulb size={14} /> Socratic Method Active
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                                )}
                            </div>

                            {/* Message Actions */}
                            {msg.role === 'model' && (
                                <div className="flex items-center gap-2 mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleSpeak(msg.text, msg.id)}
                                        className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${speakingId === msg.id ? 'text-primary-500' : 'text-slate-400'}`}
                                    >
                                        {speakingId === msg.id ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                                    </button>
                                    <button 
                                        onClick={() => handleCopy(msg.text)}
                                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-colors"
                                    >
                                        <Copy size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleSaveToVault(msg.text)}
                                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors"
                                    >
                                        <Save size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))
            )}
            
            {isLoading && (
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-primary-500 flex items-center justify-center shrink-0 text-white">
                        <Sparkles size={14} className="animate-spin" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none p-4 border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative z-10">
            {attachedImage && (
                <div className="absolute bottom-full left-6 mb-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-2">
                    <img src={attachedImage} alt="Preview" className="h-12 w-12 rounded-lg object-cover" />
                    <span className="text-xs font-bold text-slate-500">Image attached</span>
                    <button onClick={() => setAttachedImage(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><X size={14}/></button>
                </div>
            )}

            <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[24px] p-2 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all shadow-inner">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageSelect}
                />
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-3 rounded-full transition-colors shrink-0 ${attachedImage ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                >
                    <ImageIcon size={20} />
                </button>

                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder={isListening ? "Listening..." : "Ask anything..."}
                    className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-base md:text-sm max-h-32 resize-none custom-scrollbar dark:text-white placeholder:text-slate-400"
                    rows={1}
                    style={{ minHeight: '44px' }}
                />

                <div className="flex items-center gap-1 shrink-0 pb-1">
                    <button
                        onClick={toggleListening}
                        className={`p-3 rounded-full transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                    >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    <button
                        onClick={() => handleSend()}
                        disabled={isLoading || (!query.trim() && !attachedImage)}
                        className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg"
                    >
                        {isLoading ? <StopCircle size={20} /> : <ArrowUp size={20} strokeWidth={3} />}
                    </button>
                </div>
            </div>
            
            <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                AI can make mistakes. Verify important formulas.
            </p>
        </div>
      </div>
    </div>
  );
};
