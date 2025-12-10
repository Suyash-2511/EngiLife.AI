import React, { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, Atom, Cpu, Activity, Sparkles, MessageSquare, Trash2, History, Brain, Lightbulb } from 'lucide-react';
import { Card } from '../Shared/Card';
import { explainConcept } from '../../services/gemini';
import { Message } from '../../types';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

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

export const StudyCompanion: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [query, setQuery] = useState('');
  const [learningMode, setLearningMode] = useState<'simple' | 'socratic'>('simple');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I'm your AI Engineering Tutor specialized in **${selectedBranch}**. \n\nAsk me any concept, formula, or problem you're stuck on.`,
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // History State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = query) => {
    if (!text.trim()) return;

    // Capture the current mode at the time of sending
    const currentMode = learningMode;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    const responseText = await explainConcept(userMsg.text, selectedBranch, currentMode);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now(),
      mode: currentMode // Store the mode used for this specific response
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const startNewChat = () => {
    if (messages.length > 1) {
       // Save current session
       const newSession: ChatSession = {
           id: Date.now().toString(),
           title: messages[1].text.substring(0, 30) + "...",
           messages: messages,
           branch: selectedBranch,
           date: new Date().toLocaleDateString()
       };
       setSessions([newSession, ...sessions]);
    }
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      text: `Chat cleared. How can I help you with **${selectedBranch}** now?`,
      timestamp: Date.now()
    }]);
  };

  const loadSession = (session: ChatSession) => {
      setMessages(session.messages);
      setSelectedBranch(session.branch);
      setShowHistory(false);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col relative">
      {/* Header Controls */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-xl transition-colors ${showHistory ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
            >
                <History size={20} />
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
            
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                    onClick={() => setLearningMode('simple')} 
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${learningMode === 'simple' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-white' : 'text-slate-500'}`}
                >
                    <BookOpen size={14}/> Explain
                </button>
                <button 
                    onClick={() => setLearningMode('socratic')} 
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${learningMode === 'socratic' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-white' : 'text-slate-500'}`}
                >
                    <Brain size={14}/> Socratic
                </button>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <select 
               value={selectedBranch}
               onChange={(e) => setSelectedBranch(e.target.value)}
               className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-white"
            >
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <button 
              onClick={startNewChat}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="New Chat"
            >
              <Trash2 size={18} />
            </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden gap-6">
          {/* Sidebar History (Collapsible) */}
          <AnimatePresence>
              {showHistory && (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }} 
                    animate={{ width: 250, opacity: 1 }} 
                    exit={{ width: 0, opacity: 0 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-lg z-10"
                  >
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-semibold text-sm text-slate-500 uppercase tracking-wider">
                          History
                      </div>
                      <div className="flex-1 overflow-y-auto p-2">
                          {sessions.length === 0 && <p className="text-center text-xs text-slate-400 mt-4">No previous chats.</p>}
                          {sessions.map(s => (
                              <button 
                                key={s.id} 
                                onClick={() => loadSession(s)}
                                className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-1"
                              >
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{s.title}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5 flex justify-between">
                                      <span>{s.branch}</span>
                                      <span>{s.date}</span>
                                  </p>
                              </button>
                          ))}
                      </div>
                  </motion.div>
              )}
          </AnimatePresence>

          <Card className="flex-1 flex flex-col overflow-hidden shadow-xl dark:shadow-none border-0 ring-1 ring-slate-200 dark:ring-slate-800" noPadding>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-6 p-6 bg-slate-50/50 dark:bg-slate-950/50">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] lg:max-w-[75%] rounded-2xl p-5 shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    {msg.role === 'model' ? (
                       <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:text-primary-600 dark:prose-code:text-primary-400 prose-code:px-1 prose-code:rounded">
                         <ReactMarkdown>{msg.text}</ReactMarkdown>
                         {msg.mode === 'socratic' && (
                             <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500 font-medium">
                                 <Lightbulb size={12} /> Socratic Mode: The AI is guiding you to the answer.
                             </div>
                         )}
                       </div>
                    ) : (
                       <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                    )}
                    <div className={`text-[10px] mt-2 opacity-60 text-right ${msg.role === 'user' ? 'text-primary-100' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-bl-none p-4 flex items-center gap-2 shadow-sm">
                    <Sparkles size={16} className="text-primary-500 animate-pulse" />
                    <span className="text-xs text-slate-500 font-medium">Thinking...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              {/* Quick Prompts */}
              <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
                {QUICK_PROMPTS[selectedBranch]?.map((prompt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + (i * 0.05) }}
                    onClick={() => handleSend(prompt)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-2 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={`Ask a question about ${selectedBranch}...`}
                  className="flex-1 pl-4 pr-12 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:text-white shadow-inner"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !query.trim()}
                  className="absolute right-2 top-2 p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105 shadow-md shadow-primary-500/20"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </Card>
      </div>
    </div>
  );
};