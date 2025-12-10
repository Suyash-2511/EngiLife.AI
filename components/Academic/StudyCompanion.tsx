import React, { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, Atom, Cpu, Activity, Sparkles, MessageSquare, Trash2 } from 'lucide-react';
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

export const StudyCompanion: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [query, setQuery] = useState('');
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = query) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    const responseText = await explainConcept(userMsg.text, selectedBranch);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      text: `Chat cleared. How can I help you with **${selectedBranch}** now?`,
      timestamp: Date.now()
    }]);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      {/* Branch Selector */}
      <div className="flex justify-between items-center">
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide mask-fade-right max-w-[80%]">
          {BRANCHES.map((branch, i) => (
            <motion.button
              key={branch}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedBranch(branch)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                selectedBranch === branch
                  ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {branch}
            </motion.button>
          ))}
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Clear Chat"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-xl dark:shadow-none border-0 ring-1 ring-slate-200 dark:ring-slate-800">
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
                className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-5 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-800'
                }`}
              >
                {msg.role === 'model' ? (
                   <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:text-primary-600 dark:prose-code:text-primary-400 prose-code:px-1 prose-code:rounded">
                     <ReactMarkdown>{msg.text}</ReactMarkdown>
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
  );
};