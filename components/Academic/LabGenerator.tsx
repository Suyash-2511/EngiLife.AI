import React, { useState } from 'react';
import { FileText, Download, RefreshCw, Printer, Clock, ChevronRight, MessageSquare, Code, BookOpen, HelpCircle } from 'lucide-react';
import { Card } from '../Shared/Card';
import { generateLabManual, generateVivaQuestions, generateCodeSnippet } from '../../services/gemini';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';

interface ManualHistory {
  id: string;
  experiment: string;
  branch: string;
  content: string;
  code?: string;
  viva?: {question: string, answer: string}[];
  date: string;
}

export const LabGenerator: React.FC = () => {
  const { awardXP } = useAppContext();
  const [activeTab, setActiveTab] = useState<'manual' | 'viva' | 'code'>('manual');
  
  const [experiment, setExperiment] = useState('');
  const [branch, setBranch] = useState('Computer Science');
  const [loading, setLoading] = useState(false);
  
  // Current Content State
  const [manual, setManual] = useState('');
  const [code, setCode] = useState('');
  const [viva, setViva] = useState<{question: string, answer: string}[]>([]);
  
  const [history, setHistory] = useState<ManualHistory[]>([]);
  const [vivaRevealed, setVivaRevealed] = useState<number[]>([]);

  const handleGenerate = async () => {
    if (!experiment) return;
    setLoading(true);
    setActiveTab('manual');
    setVivaRevealed([]);
    
    // Parallel generation
    const [manualRes, codeRes, vivaRes] = await Promise.all([
        generateLabManual(experiment, branch),
        generateCodeSnippet(experiment),
        generateVivaQuestions(experiment, branch)
    ]);
    
    setManual(manualRes);
    setCode(codeRes);
    setViva(vivaRes);
    
    const newItem: ManualHistory = {
      id: Date.now().toString(),
      experiment,
      branch,
      content: manualRes,
      code: codeRes,
      viva: vivaRes,
      date: new Date().toLocaleDateString()
    };
    
    setHistory(prev => [newItem, ...prev]);
    setLoading(false);
    awardXP(50);
  };

  const loadHistory = (item: ManualHistory) => {
      setExperiment(item.experiment);
      setBranch(item.branch);
      setManual(item.content);
      setCode(item.code || '');
      setViva(item.viva || []);
      setVivaRevealed([]);
  };

  const toggleVivaAnswer = (index: number) => {
      if (vivaRevealed.includes(index)) {
          setVivaRevealed(vivaRevealed.filter(i => i !== index));
      } else {
          setVivaRevealed([...vivaRevealed, index]);
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      {/* Left Sidebar: Controls & History */}
      <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
        <Card title="Lab Parameters" delay={0.1}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white dark:bg-slate-900 dark:text-white"
              >
                <option>Computer Science</option>
                <option>Mechanical</option>
                <option>Electrical</option>
                <option>Civil</option>
                <option>Electronics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Experiment Title</label>
              <textarea
                value={experiment}
                onChange={(e) => setExperiment(e.target.value)}
                placeholder="e.g., Implementation of Dijkstra's Algorithm"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 h-24 resize-none focus:ring-2 focus:ring-primary-500/20 outline-none bg-white dark:bg-slate-900 dark:text-white"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !experiment}
              className="w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-primary-500/20"
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <FileText size={18} />}
              Generate Record
            </button>
          </div>
        </Card>

        {/* History List */}
        <Card className="flex-1 flex flex-col min-h-0" title="Recent Manuals" noPadding delay={0.2}>
           <div className="overflow-y-auto flex-1 p-2">
             <AnimatePresence>
             {history.length === 0 ? (
               <div className="text-center text-slate-400 py-8 text-sm">No recent manuals</div>
             ) : (
               history.map((item) => (
                 <motion.button 
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onClick={() => loadHistory(item)}
                    className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                 >
                    <div className="flex justify-between items-start">
                       <h4 className="font-medium text-slate-700 dark:text-slate-200 text-sm line-clamp-1">{item.experiment}</h4>
                       <ChevronRight size={14} className="text-slate-300 group-hover:text-primary-500 mt-1" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">{item.branch}</span>
                       <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10}/> {item.date}</span>
                    </div>
                 </motion.button>
               ))
             )}
             </AnimatePresence>
           </div>
        </Card>
      </div>

      {/* Right Content */}
      <div className="lg:col-span-8 h-full flex flex-col">
        <Card className="flex-1 flex flex-col min-h-0 relative bg-white dark:bg-slate-900" noPadding delay={0.3}>
          {/* Tabs & Toolbar */}
          <div className="p-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
             <div className="flex gap-1">
                 <button 
                    onClick={() => setActiveTab('manual')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'manual' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                 >
                    <BookOpen size={16} /> Manual
                 </button>
                 <button 
                    onClick={() => setActiveTab('code')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'code' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                 >
                    <Code size={16} /> Code
                 </button>
                 <button 
                    onClick={() => setActiveTab('viva')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'viva' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                 >
                    <HelpCircle size={16} /> Viva Voce
                 </button>
             </div>
             
             {manual && (
                <button className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                   <Printer size={18} />
                </button>
             )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-[#0d1117]">
             {!manual ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                 <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <FileText size={32} className="opacity-20" />
                 </div>
                 <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">Ready to Generate</h3>
                 <p className="text-center max-w-sm mt-2 text-sm">Enter experiment details to generate a comprehensive lab manual, source code, and viva questions.</p>
               </div>
             ) : (
                <>
                   {activeTab === 'manual' && (
                     <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-h2:border-b prose-h2:pb-2 prose-h2:mt-8 prose-h2:text-primary-700 dark:prose-h2:text-primary-400 prose-code:text-primary-600 dark:prose-code:text-primary-300 prose-code:bg-slate-50 dark:prose-code:bg-slate-800/50 prose-code:px-1 prose-code:rounded prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:shadow-lg">
                        <div className="border-b-2 border-slate-800 dark:border-slate-600 pb-4 mb-8">
                           <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-serif m-0">{experiment}</h1>
                           <p className="text-slate-500 dark:text-slate-400 font-serif italic mt-2 m-0">{branch} Engineering • Lab Record</p>
                        </div>
                        <ReactMarkdown>{manual}</ReactMarkdown>
                     </motion.article>
                   )}

                   {activeTab === 'code' && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                           <Code className="text-primary-600" /> Source Code
                        </h2>
                        {code ? (
                           <div className="relative">
                              <pre className="p-6 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto text-sm font-mono border border-slate-700 shadow-inner">
                                <ReactMarkdown>{code}</ReactMarkdown>
                              </pre>
                           </div>
                        ) : (
                           <p className="text-slate-500 italic">No code snippet available for this experiment.</p>
                        )}
                     </motion.div>
                   )}

                   {activeTab === 'viva' && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                           <HelpCircle className="text-primary-600" /> Viva Questions
                        </h2>
                        <div className="space-y-4">
                           {viva.map((item, i) => (
                              <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                                 <button 
                                    onClick={() => toggleVivaAnswer(i)}
                                    className="w-full text-left p-4 font-medium text-slate-800 dark:text-slate-200 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                 >
                                    <span className="flex gap-3">
                                       <span className="text-primary-500 font-bold">Q{i+1}.</span> {item.question}
                                    </span>
                                    <ChevronRight size={16} className={`transition-transform ${vivaRevealed.includes(i) ? 'rotate-90' : ''}`} />
                                 </button>
                                 <AnimatePresence>
                                    {vivaRevealed.includes(i) && (
                                       <motion.div 
                                          initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                          className="overflow-hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800"
                                       >
                                          <div className="p-4 pl-10 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                             {item.answer}
                                          </div>
                                       </motion.div>
                                    )}
                                 </AnimatePresence>
                              </div>
                           ))}
                           {viva.length === 0 && <p className="text-slate-500 italic">No questions generated.</p>}
                        </div>
                     </motion.div>
                   )}
                </>
             )}
          </div>
        </Card>
      </div>
    </div>
  );
};