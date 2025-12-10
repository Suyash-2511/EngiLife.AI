import React, { useState } from 'react';
import { FileText, Download, RefreshCw, Printer, Clock, ChevronRight } from 'lucide-react';
import { Card } from '../Shared/Card';
import { generateLabManual } from '../../services/gemini';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface ManualHistory {
  id: string;
  experiment: string;
  branch: string;
  content: string;
  date: string;
}

export const LabGenerator: React.FC = () => {
  const [experiment, setExperiment] = useState('');
  const [branch, setBranch] = useState('Computer Science');
  const [manual, setManual] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ManualHistory[]>([]);

  const handleGenerate = async () => {
    if (!experiment) return;
    setLoading(true);
    const result = await generateLabManual(experiment, branch);
    setManual(result);
    
    const newItem: ManualHistory = {
      id: Date.now().toString(),
      experiment,
      branch,
      content: result,
      date: new Date().toLocaleDateString()
    };
    
    setHistory(prev => [newItem, ...prev]);
    setLoading(false);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${experiment} - Lab Manual</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; }
              h1 { border-bottom: 2px solid #000; padding-bottom: 10px; }
              h2 { color: #333; margin-top: 20px; text-transform: uppercase; font-size: 14px; border-bottom: 1px solid #ccc; }
              ul, ol { margin-left: 20px; }
              code { background: #f0f0f0; padding: 2px 5px; font-family: monospace; }
              pre { background: #f0f0f0; padding: 10px; border-radius: 5px; overflow-x: auto; }
            </style>
          </head>
          <body>
            <h1>Experiment: ${experiment}</h1>
            <p><strong>Branch:</strong> ${branch}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <hr/>
            ${document.getElementById('markdown-content')?.innerHTML || ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
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
              Generate Manual
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
                    onClick={() => { setManual(item.content); setExperiment(item.experiment); }}
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

      {/* Right Content: The Manual */}
      <div className="lg:col-span-8 h-full flex flex-col">
        <Card className="flex-1 flex flex-col min-h-0 relative bg-white dark:bg-slate-900" noPadding delay={0.3}>
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
             <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary-600" />
                <h3 className="font-semibold text-slate-800 dark:text-white">Lab Record Preview</h3>
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={handlePrint} 
                  disabled={!manual}
                  className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50" 
                  title="Print / Save PDF"
                >
                   <Printer size={18} />
                </button>
             </div>
          </div>

          {/* Paper View */}
          <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-[#0d1117]">
             {manual ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto" id="markdown-content">
                  {/* Paper Header Simulation */}
                  <div className="border-b-2 border-slate-800 dark:border-slate-600 pb-4 mb-8 flex justify-between items-end">
                     <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">{experiment}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-serif italic mt-1">{branch} Engineering • Lab Record</p>
                     </div>
                     <div className="text-right">
                        <div className="text-xs font-mono text-slate-400 border border-slate-300 dark:border-slate-700 px-2 py-1 rounded">
                           Date: {new Date().toLocaleDateString()}
                        </div>
                     </div>
                  </div>

                  {/* Markdown Content */}
                  <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-h2:border-b prose-h2:pb-2 prose-h2:mt-8 prose-h2:text-primary-700 dark:prose-h2:text-primary-400 prose-code:text-primary-600 dark:prose-code:text-primary-300 prose-code:bg-slate-50 dark:prose-code:bg-slate-800/50 prose-code:px-1 prose-code:rounded prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:shadow-lg">
                    <ReactMarkdown>{manual}</ReactMarkdown>
                  </article>

                  {/* Viva Section Highlight */}
                  <div className="mt-12 p-6 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-xl">
                     <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-500 mb-2">Viva Voce Prep</h3>
                     <p className="text-sm text-yellow-700 dark:text-yellow-400/80 italic">
                        Review the questions generated above to prepare for your lab evaluation.
                     </p>
                  </div>
               </motion.div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                 <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <FileText size={32} className="opacity-20" />
                 </div>
                 <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">No Manual Generated</h3>
                 <p className="text-center max-w-sm mt-2 text-sm">Enter the experiment details on the left to generate a comprehensive lab manual with theory, code, and viva questions.</p>
               </div>
             )}
          </div>
        </Card>
      </div>
    </div>
  );
};