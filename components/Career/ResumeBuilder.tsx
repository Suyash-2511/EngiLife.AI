import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, CheckCircle, AlertTriangle, RefreshCw, 
  Briefcase, Search, ChevronRight, MessageSquare, Mic, 
  StopCircle, Play, Sparkles, BarChart3, TrendingUp, Send,
  Target, Award
} from 'lucide-react';
import { Card } from '../Shared/Card';
import { Button } from '../Shared/Button';
import { analyzeResume, generateJobMatches, generateInterviewQuestion, evaluateInterviewAnswer, generateInterviewReport } from '../../services/gemini';
import { useAppContext } from '../../context/AppContext';

const InterviewReport = ({ report, onRestart }: { report: any, onRestart: () => void }) => {
    const safeReport = report || {};
    const verdict = safeReport.verdict || "Pending";
    const overallScore = safeReport.overallScore || 0;
    const technicalScore = safeReport.technicalScore || 0;
    const communicationScore = safeReport.communicationScore || 0;
    const strengths = safeReport.strengths || [];
    const improvements = safeReport.improvements || [];
    const summary = safeReport.summary || "No summary available.";

    // Helper to safely check hire status
    const isHire = typeof verdict === 'string' && verdict?.includes("Hire");

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto custom-scrollbar p-6 rounded-2xl"
        >
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold mb-4">
                    <Sparkles size={14} /> Interview Analysis
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Performance Report</h2>
                <p className="text-slate-500 text-sm">Here's how you performed in your mock session.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Overall Score */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-100 dark:text-slate-700" />
                            <motion.circle 
                                cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="10" 
                                className={overallScore > 75 ? "text-emerald-500" : overallScore > 50 ? "text-amber-500" : "text-rose-500"}
                                strokeDasharray={351}
                                strokeDashoffset={351}
                                animate={{ strokeDashoffset: 351 - (351 * overallScore) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-slate-800 dark:text-white">{overallScore}</span>
                            <span className="text-[10px] uppercase text-slate-400 font-bold">Overall</span>
                        </div>
                    </div>
                    <div className={`mt-4 px-3 py-1 rounded-lg text-xs font-bold ${
                        isHire ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                        {verdict}
                    </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="md:col-span-2 grid grid-cols-1 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                            <BarChart3 size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">Technical Accuracy</span>
                                <span className="font-bold text-slate-900 dark:text-white">{technicalScore}/100</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${technicalScore}%` }}
                                    className="h-full bg-blue-500"
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                            <MessageSquare size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">Communication</span>
                                <span className="font-bold text-slate-900 dark:text-white">{communicationScore}/100</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${communicationScore}%` }}
                                    className="h-full bg-purple-500"
                                    transition={{ duration: 1, delay: 0.7 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6">
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Executive Summary</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {summary}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="text-emerald-500" size={18} /> Top Strengths
                    </h4>
                    <ul className="space-y-2">
                        {strengths.map((s: string, i: number) => (
                            <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></span>
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="text-amber-500" size={18} /> Growth Areas
                    </h4>
                    <ul className="space-y-2">
                        {improvements.map((s: string, i: number) => (
                            <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0"></span>
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-auto">
                <Button onClick={onRestart} className="w-full py-3">Start New Interview</Button>
            </div>
        </motion.div>
    );
};

export const ResumeBuilder: React.FC = () => {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState<'resume' | 'jobs' | 'interview'>('resume');
  
  // Resume State
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Job State
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [jobs, setJobs] = useState<any[]>([]);
  const [isSearchingJobs, setIsSearchingJobs] = useState(false);

  // Interview State
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewReport, setInterviewReport] = useState<any>(null);
  const [turnCount, setTurnCount] = useState(0);

  const handleAnalyzeResume = async () => {
    setIsAnalyzing(true);
    // Simulate skills extraction from text for now, or use user profile
    const skills = user?.skills || ['React', 'TypeScript'];
    const result = await analyzeResume(skills, resumeText || "Student with some projects");
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleFindJobs = async () => {
    setIsSearchingJobs(true);
    const skills = user?.skills || [];
    const result = await generateJobMatches(targetRole, skills);
    setJobs(result);
    setIsSearchingJobs(false);
  };

  const startInterview = async () => {
    setInterviewStarted(true);
    setMessages([]);
    setTurnCount(0);
    setInterviewReport(null);
    setIsProcessing(true);
    const q = await generateInterviewQuestion(targetRole, 'General');
    setMessages([{ role: 'ai', text: q }]);
    setIsProcessing(false);
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    
    const newHistory = [...messages, { role: 'user', text: currentAnswer }];
    setMessages(newHistory);
    setCurrentAnswer('');
    setIsProcessing(true);

    const lastQuestion = messages[messages.length - 1].text;
    const evaluation = await evaluateInterviewAnswer(lastQuestion, currentAnswer);
    
    const aiResponse = { 
        role: 'ai', 
        text: evaluation.nextQuestion, 
        feedback: evaluation.feedback,
        rating: evaluation.rating 
    };

    setMessages([...newHistory, aiResponse]);
    setTurnCount(prev => prev + 1);
    setIsProcessing(false);
  };

  const finishInterview = async () => {
      setIsProcessing(true);
      const report = await generateInterviewReport(messages);
      setInterviewReport(report);
      setIsProcessing(false);
  };

  return (
    <div className="h-[calc(100dvh-120px)] flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
         {[
            { id: 'resume', label: 'Resume Check', icon: FileText },
            { id: 'jobs', label: 'Job Match', icon: Briefcase },
            { id: 'interview', label: 'Mock Interview', icon: Mic },
         ].map(tab => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
               }`}
            >
               <tab.icon size={16} /> {tab.label}
            </button>
         ))}
      </div>

      <div className="flex-1 min-h-0">
          {activeTab === 'resume' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  <Card title="Resume Input" className="flex flex-col">
                      <textarea 
                         value={resumeText}
                         onChange={e => setResumeText(e.target.value)}
                         placeholder="Paste your resume summary or experience here..."
                         className="flex-1 w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl resize-none outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
                      />
                      <div className="mt-4 flex justify-end">
                          <Button onClick={handleAnalyzeResume} isLoading={isAnalyzing} icon={<Search size={16}/>}>Analyze</Button>
                      </div>
                  </Card>
                  <div className="h-full overflow-y-auto custom-scrollbar">
                      {analysis ? (
                          <div className="space-y-6">
                              <Card>
                                  <div className="flex items-center justify-between mb-6">
                                      <h3 className="text-lg font-bold">ATS Score</h3>
                                      <div className={`text-3xl font-black ${analysis.score >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{analysis.score}/100</div>
                                  </div>
                                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${analysis.score}%` }} 
                                        className={`h-full ${analysis.score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                      />
                                  </div>
                              </Card>
                              <Card title="Feedback">
                                  <ul className="space-y-3">
                                      {analysis.feedback.map((item: string, i: number) => (
                                          <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                                              <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                              {item}
                                          </li>
                                      ))}
                                  </ul>
                              </Card>
                              <Card title="Missing Keywords">
                                  <div className="flex flex-wrap gap-2">
                                      {analysis.keywords.map((kw: string, i: number) => (
                                          <span key={i} className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg border border-rose-100 dark:border-rose-900/30">{kw}</span>
                                      ))}
                                  </div>
                              </Card>
                          </div>
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400">
                              <FileText size={48} className="opacity-20 mb-4" />
                              <p>Paste your resume to get AI feedback</p>
                          </div>
                      )}
                  </div>
              </div>
          )}

          {activeTab === 'jobs' && (
             <div className="h-full flex flex-col gap-6">
                 <Card>
                     <div className="flex gap-4">
                         <div className="flex-1">
                             <label className="text-xs font-bold text-slate-500 uppercase">Target Role</label>
                             <input 
                                value={targetRole}
                                onChange={e => setTargetRole(e.target.value)}
                                className="w-full mt-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                             />
                         </div>
                         <div className="flex items-end">
                             <Button onClick={handleFindJobs} isLoading={isSearchingJobs} icon={<Briefcase size={18}/>}>Find Matches</Button>
                         </div>
                     </div>
                 </Card>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-4">
                     {jobs.map((job, i) => (
                         <motion.div 
                           key={i}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.1 }}
                         >
                             <Card className="h-full flex flex-col">
                                 <div className="flex justify-between items-start mb-4">
                                     <div>
                                         <h3 className="font-bold text-lg">{job.role}</h3>
                                         <p className="text-slate-500 text-sm">{job.company}</p>
                                     </div>
                                     <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                         job.match >= 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                     }`}>
                                         {job.match}% Match
                                     </div>
                                 </div>
                                 <div className="flex flex-wrap gap-2 mt-auto">
                                     {job.skills.slice(0, 3).map((s: string, j: number) => (
                                         <span key={j} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">{s}</span>
                                     ))}
                                     {job.skills.length > 3 && <span className="text-[10px] text-slate-400 self-center">+{job.skills.length - 3} more</span>}
                                 </div>
                             </Card>
                         </motion.div>
                     ))}
                 </div>
             </div>
          )}

          {activeTab === 'interview' && (
             <div className="h-full">
                 {!interviewStarted ? (
                     <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                         <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                             <Mic size={40} className="text-indigo-600 dark:text-indigo-400" />
                         </div>
                         <h2 className="text-2xl font-bold mb-3">AI Mock Interview</h2>
                         <p className="text-slate-500 mb-8">Practice behavioral and technical questions tailored to {targetRole}. Get real-time feedback.</p>
                         <Button size="lg" onClick={startInterview} icon={<Play size={20} />}>Start Session</Button>
                     </div>
                 ) : interviewReport ? (
                    <InterviewReport report={interviewReport} onRestart={startInterview} />
                 ) : (
                     <div className="h-full flex flex-col gap-4">
                         <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 custom-scrollbar">
                             {messages.map((msg, i) => (
                                 <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                 >
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                         {msg.role === 'ai' ? <Sparkles size={14}/> : <Briefcase size={14}/>}
                                     </div>
                                     <div className={`max-w-[80%] p-4 rounded-2xl ${
                                         msg.role === 'ai' 
                                         ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none' 
                                         : 'bg-indigo-600 text-white rounded-tr-none'
                                     }`}>
                                         <p className="text-sm leading-relaxed">{msg.text}</p>
                                         {msg.feedback && (
                                             <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                                 <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                                                     <CheckCircle size={12} /> Feedback (Rating: {msg.rating}/10)
                                                 </div>
                                                 <p className="text-xs opacity-80 italic">{msg.feedback}</p>
                                             </div>
                                         )}
                                     </div>
                                 </motion.div>
                             ))}
                             {isProcessing && (
                                 <div className="flex items-center gap-2 text-slate-400 text-sm pl-12">
                                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"/>
                                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"/>
                                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"/>
                                 </div>
                             )}
                         </div>

                         <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex gap-3">
                             <input 
                                value={currentAnswer}
                                onChange={e => setCurrentAnswer(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && submitAnswer()}
                                placeholder="Type your answer..."
                                className="flex-1 bg-transparent outline-none"
                                disabled={isProcessing}
                             />
                             {turnCount >= 3 ? (
                                 <Button variant="danger" onClick={finishInterview} icon={<StopCircle size={18}/>}>Finish</Button>
                             ) : (
                                 <Button onClick={submitAnswer} disabled={!currentAnswer || isProcessing} icon={<Send size={18}/>}>Send</Button>
                             )}
                         </div>
                     </div>
                 )}
             </div>
          )}
      </div>
    </div>
  );
};
