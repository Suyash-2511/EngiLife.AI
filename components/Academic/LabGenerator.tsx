
import React, { useState } from 'react';
import { FileText, Download, RefreshCw, Printer, Clock, ChevronRight, MessageSquare, Code, BookOpen, HelpCircle, Sparkles, SlidersHorizontal, Settings } from 'lucide-react';
import { Card } from '../Shared/Card';
import { generateLabManual, generateVivaQuestions, generateCodeSnippet } from '../../services/gemini';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';

interface ManualHistory {
  id: string;
  experiment: string;
  branch: string;
  requirements?: string;
  content: string;
  code?: string;
  viva?: {question: string, answer: string}[];
  date: string;
}

const TOOLS_BY_BRANCH: Record<string, string[]> = {
  'Computer Science': ['Python', 'C++', 'Java', 'JavaScript', 'SQL', 'NoSQL', 'Docker', 'Linux', 'AWS'],
  'Mechanical': ['AutoCAD', 'SolidWorks', 'ANSYS', 'MATLAB', 'CATIA', 'Thermodynamics', 'Fluid Sim'],
  'Electrical': ['MATLAB', 'Simulink', 'Multisim', 'PSpice', 'LabVIEW', 'IoT', 'PLC'],
  'Civil': ['AutoCAD', 'Revit', 'STAAD.Pro', 'ETABS', 'ArcGIS', 'Surveying', 'Concrete Tech'],
  'Electronics': ['Verilog', 'VHDL', 'Arduino', 'Proteus', 'Raspberry Pi', 'Embedded C', 'PCB Design']
};

export const LabGenerator: React.FC = () => {
  const { awardXP } = useAppContext();
  
  // Mobile Tab State (Config vs Result)
  const [mobileView, setMobileView] = useState<'config' | 'result'>('config');
  
  const [activeTab, setActiveTab] = useState<'manual' | 'viva' | 'code'>('manual');
  const [experiment, setExperiment] = useState('');
  const [branch, setBranch] = useState('Computer Science');
  const [requirements, setRequirements] = useState('');
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
        generateLabManual(experiment, branch, requirements),
        generateCodeSnippet(experiment, requirements),
        generateVivaQuestions(experiment, branch, requirements)
    ]);
    
    setManual(manualRes);
    setCode(codeRes);
    setViva(vivaRes);
    
    const newItem: ManualHistory = {
      id: Date.now().toString(),
      experiment,
      branch,
      requirements,
      content: manualRes,
      code: codeRes,
      viva: vivaRes,
      date: new Date().toLocaleDateString()
    };
    
    setHistory(prev => [newItem, ...prev]);
    setLoading(false);
    awardXP(50);
    // Switch to result view on mobile after generation
    setMobileView('result');
  };

  const loadHistory = (item: ManualHistory) => {
      setExperiment(item.experiment);
      setBranch(item.branch);
      setRequirements(item.requirements || '');
      setManual(item.content);
      setCode(item.code || '');
      setViva(item.viva || []);
      setVivaRevealed([]);
      setMobileView('result');
  };

  const toggleVivaAnswer = (index: number) => {
      if (vivaRevealed.includes(index)) {
          setVivaRevealed(vivaRevealed.filter(i => i !== index));
      } else {
          setVivaRevealed([...vivaRevealed, index]);
      }
  };

  const addConstraint = (tool: string) => {
      const reqs = requirements || '';
      if (reqs.includes(tool)) return;
      setRequirements(prev => prev ? `${prev}, ${tool}` : tool);
  };

  return (
    <div className="h-[calc(100dvh-140px)] flex flex-col lg:grid lg:grid-cols-12 gap-6 relative">
      
      {/* Mobile Tab Toggle */}
      <div className="lg:hidden flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4 shrink-0">
          <button 
            onClick={() => setMobileView('config')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mobileView === 'config' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-white' : 'text-slate-500'}`}
          >
            Configuration
          </button>
          <button 
            onClick={() => setMobileView('result')}
            disabled={!manual}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mobileView === 'result' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-white' : 'text-slate-500 disabled:opacity-50'}`}
          >
            Output
          </button>
      </div>

      {/* Left Sidebar: Controls & History */}
      <div className={`lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden ${mobileView === 'result' ? 'hidden lg:flex' : 'flex'}`}>
        <Card title="Lab Config" delay={0.1} action={<SlidersHorizontal size={16} className="text-slate-400"/>}>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Branch</label>
              <div className="relative">
                <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 dark:bg-slate-900 dark:text-white text-sm appearance-none"
                >
                    <option>Computer Science</option>
                    <option>Mechanical</option>
                    <option>Electrical</option>
                    <option>Civil</option>
                    <option>Electronics</option>
                </select>
                <ChevronRight className="absolute right-3 top-3 text-slate-400 pointer-events-none rotate-90" size={14}/>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Experiment Title</label>
              <textarea
                value={experiment}
                onChange={(e) => setExperiment(e.target.value)}
                placeholder="e.g., Dijkstra's Algorithm Implementation"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2.5 h-20 resize-none focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                 <label className="block text-xs font-bold text-slate-500 uppercase">Constraints & Tools</label>
                 <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Optional</span>
              </div>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Specific languages, tools, or hardware requirements..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2.5 h-20 resize-none focus:ring-2 focus:ring-primary-500/20 outline-none bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
              />
              
              {/* Quick Tools Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {TOOLS_BY_BRANCH[branch]?.map(tool => (
                      <button
                        key={tool}
                        onClick={() => addConstraint(tool)}
                        disabled={(requirements || '').includes(tool)}
                        className={`text-[10px] px-2 py-1 rounded-md transition-colors border ${
                            (requirements || '').includes(tool)
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-100 dark:border-primary-800'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
                        }`}
                      >
                         + {tool}
                      </button>
                  ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !experiment}
              className="w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-primary-500/20 active:scale-[0.98]"
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Generate Record
            </button>
          </div>
        </Card>

        {/* History List */}
        <Card className="flex-1 flex flex-col min-h-0" title="History" noPadding delay={0.2}>
           <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
             <AnimatePresence>
             {history.length === 0 ? (
               <div className="text-center text-slate-400 py-8 text-xs flex flex-col items-center gap-2">
                   <Clock size={24} className="opacity-20" />
                   No recent manuals
               </div>
             ) : (
               history.map((item) => (
                 <motion.button 
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onClick={() => loadHistory(item)}
                    className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg group transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                 >
                    <div className="flex justify-between items-start">
                       <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm line-clamp-1">{item.experiment}</h4>
                       <ChevronRight size={14} className="text-slate-300 group-hover:text-primary-500 mt-1" />
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                       <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-medium">{item.branch}</span>
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
      <div className={`lg:col-span-8 h-full flex flex-col ${mobileView === 'config' ? 'hidden lg:flex' : 'flex'}`}>
        <Card className="flex-1 flex flex-col min-h-0 relative bg-white dark:bg-slate-900 overflow-hidden" noPadding delay={0.3}>
          {/* Tabs & Toolbar */}
          <div className="p-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm overflow-x-auto">
             <div className="flex gap-1 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
                 <button 
                    onClick={() => setActiveTab('manual')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'manual' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                 >
                    <BookOpen size={14} /> Manual
                 </button>
                 <button 
                    onClick={() => setActiveTab('code')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'code' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                 >
                    <Code size={14} /> Code
                 </button>
                 <button 
                    onClick={() => setActiveTab('viva')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'viva' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                 >
                    <HelpCircle size={14} /> Viva
                 </button>
             </div>
             
             {manual && (
                <button className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0" title="Print Manual">
                   <Printer size={18} />
                </button>
             )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white dark:bg-[#0d1117] custom-scrollbar">
             {!manual ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                 <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                    <FileText size={40} className="opacity-20" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">Ready to Generate</h3>
                 <p className="text-center max-w-sm mt-2 text-sm text-slate-500">
                    Provide your experiment details and constraints to generate a structured lab record, source code, and viva questions instantly.
                 </p>
               </div>
             ) : (
                <>
                   {activeTab === 'manual' && (
                     <motion.article 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-xl prose-h2:border-b prose-h2:pb-2 prose-h2:mt-8 prose-h2:text-primary-600 dark:prose-h2:text-primary-400 prose-code:text-primary-600 dark:prose-code:text-primary-300 prose-code:bg-slate-50 dark:prose-code:bg-slate-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:shadow-lg prose-pre:rounded-xl"
                     >
                        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
                           <h1 className="m-0 text-slate-900 dark:text-white text-2xl md:text-3xl">{experiment}</h1>
                           <div className="flex flex-wrap gap-2 mt-4">
                               <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">{branch}</span>
                               {requirements && (
                                   <span className="text-xs font-bold px-2 py-1 rounded bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800">
                                       {requirements.length > 30 ? requirements.substring(0,30) + '...' : requirements}
                                   </span>
                               )}
                           </div>
                        </div>
                        <ReactMarkdown>{manual}</ReactMarkdown>
                     </motion.article>
                   )}

                   {activeTab === 'code' && (
                     <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Code className="text-primary-600" /> Implementation
                            </h2>
                            <button className="text-xs font-bold text-primary-600 hover:underline">Copy Code</button>
                        </div>
                        {code ? (
                           <div className="relative group">
                              <pre className="p-6 rounded-2xl bg-[#1e1e1e] text-[#d4d4d4] overflow-x-auto text-sm font-mono shadow-inner border border-slate-700/50">
                                <ReactMarkdown>{code}</ReactMarkdown>
                              </pre>
                           </div>
                        ) : (
                           <div className="p-8 text-center text-slate-500 italic border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                               No code snippet available for this experiment.
                           </div>
                        )}
                     </motion.div>
                   )}

                   {activeTab === 'viva' && (
                     <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                           <HelpCircle className="text-primary-600" /> Viva Voce
                        </h2>
                        <div className="space-y-3">
                           {viva.map((item, i) => (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={i} 
                                className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm"
                              >
                                 <button 
                                    onClick={() => toggleVivaAnswer(i)}
                                    className="w-full text-left p-4 font-semibold text-slate-800 dark:text-slate-200 flex justify-between items-start hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors gap-4"
                                 >
                                    <span className="flex gap-3">
                                       <span className="text-primary-500 font-bold shrink-0">Q{i+1}.</span> 
                                       <span className="leading-snug">{item.question}</span>
                                    </span>
                                    <ChevronRight size={18} className={`text-slate-400 shrink-0 transition-transform duration-300 ${vivaRevealed.includes(i) ? 'rotate-90' : ''}`} />
                                 </button>
                                 <AnimatePresence>
                                    {vivaRevealed.includes(i) && (
                                       <motion.div 
                                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto' }} exit={{ height: 0, opacity: 0 }}
                                          className="overflow-hidden bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800"
                                       >
                                          <div className="p-4 pl-12 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                             {item.answer}
                                          </div>
                                       </motion.div>
                                    )}
                                 </AnimatePresence>
                              </motion.div>
                           ))}
                           {viva.length === 0 && <p className="text-slate-500 italic text-center p-8">No questions generated.</p>}
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
