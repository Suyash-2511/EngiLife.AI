import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, Sparkles, Award, MessageSquare, Mic, Map, Target, ChevronRight, CheckCircle, Send, Star } from 'lucide-react';
import { Card } from '../Shared/Card';
import { Button } from '../Shared/Button';
import { generateResumeTips, generateInterviewQuestion, evaluateInterviewAnswer, generateCareerRoadmap } from '../../services/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

// --- Sub-Component: Resume Enhancement ---
const ResumeEnhancer = () => {
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!skills || !experience) return;
    setLoading(true);
    const skillList = skills.split(',').map(s => s.trim());
    const result = await generateResumeTips(skillList, experience);
    setSuggestions(result);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Technical Skills</label>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="React, Python, AWS..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 focus:ring-2 focus:ring-primary-500/20 outline-none dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Experience Summary</label>
          <textarea
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Built a web app for college..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 h-32 resize-none focus:ring-2 focus:ring-primary-500/20 outline-none dark:text-white"
          />
        </div>
        <Button
          onClick={handleGenerate}
          disabled={loading || !skills || !experience}
          className="w-full"
          icon={loading ? <Sparkles className="animate-spin" size={18} /> : <Award size={18} />}
        >
          Enhance Resume
        </Button>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800 h-full">
        <h4 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Briefcase size={18} className="text-primary-600" />
          AI Suggestions
        </h4>
        {suggestions ? (
          <div className="prose prose-sm dark:prose-invert">
            <ReactMarkdown>{suggestions}</ReactMarkdown>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-slate-400 text-sm text-center">
            Enter details to generate impact-driven bullet points.
          </div>
        )}
      </div>
    </div>
  );
};

// --- Sub-Component: Mock Interview ---
const MockInterview = () => {
  const [role, setRole] = useState('Software Engineer');
  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState<{role: 'ai' | 'user', text: string, feedback?: string, rating?: number}[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const startInterview = async () => {
    setLoading(true);
    setStarted(true);
    const q = await generateInterviewQuestion(role);
    setHistory([{ role: 'ai', text: q }]);
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    
    const userAns = currentAnswer;
    const lastQuestion = history[history.length - 1].text;
    
    // Optimistic Update
    setHistory(prev => [...prev, { role: 'user', text: userAns }]);
    setCurrentAnswer('');
    setLoading(true);

    const evalResult = await evaluateInterviewAnswer(lastQuestion, userAns);
    
    // Add feedback then next question
    setHistory(prev => {
        const newHist = [...prev];
        // Attach feedback to user's last message
        const lastUserMsgIndex = newHist.length - 1;
        newHist[lastUserMsgIndex] = { ...newHist[lastUserMsgIndex], feedback: evalResult.feedback, rating: evalResult.rating };
        return [...newHist, { role: 'ai', text: evalResult.nextQuestion }];
    });
    setLoading(false);
  };

  return (
    <div className="h-[500px] flex flex-col">
      {!started ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
             <Mic size={40} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">AI Mock Interview</h3>
            <p className="text-slate-500 mt-2 max-w-md">Practice behavioral and technical questions in a safe environment. Get instant feedback on your answers.</p>
          </div>
          <div className="flex gap-2 w-full max-w-xs">
            <input 
              value={role} 
              onChange={e => setRole(e.target.value)} 
              className="flex-1 px-4 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-800 dark:text-white"
              placeholder="Target Role (e.g. PM)"
            />
            <Button onClick={startInterview}>Start</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl mb-4 border border-slate-100 dark:border-slate-800">
            {history.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'ai' ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-none' : 'bg-primary-600 text-white rounded-tr-none'}`}>
                   <p className="text-sm">{msg.text}</p>
                </div>
                {msg.feedback && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 max-w-[85%] bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase">Feedback</span>
                      <div className="flex items-center gap-0.5">
                         <Star size={10} className="fill-yellow-500 text-yellow-500" />
                         <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500">{msg.rating}/10</span>
                      </div>
                    </div>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200/80 leading-relaxed">{msg.feedback}</p>
                  </motion.div>
                )}
              </div>
            ))}
            {loading && <div className="text-xs text-slate-400 animate-pulse pl-2">AI is thinking...</div>}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2">
            <input 
              value={currentAnswer}
              onChange={e => setCurrentAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitAnswer()}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 outline-none dark:text-white"
              placeholder="Type your answer..."
            />
            <Button onClick={submitAnswer} disabled={loading || !currentAnswer} icon={<Send size={18} />} />
          </div>
        </>
      )}
    </div>
  );
};

// --- Sub-Component: Career Roadmap ---
const CareerRoadmap = () => {
  const [role, setRole] = useState('');
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!role) return;
    setLoading(true);
    const result = await generateCareerRoadmap(role);
    setRoadmap(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
       <div className="flex gap-4 items-end">
          <div className="flex-1">
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dream Job Role</label>
             <input 
               value={role}
               onChange={e => setRole(e.target.value)}
               placeholder="e.g. Full Stack Developer, Data Scientist"
               className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-white"
             />
          </div>
          <Button onClick={generate} disabled={loading || !role} className="mb-[1px]" icon={loading ? <Sparkles className="animate-spin" /> : <Map />}>
             Generate Path
          </Button>
       </div>

       <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-8 py-2">
          {roadmap.length === 0 && !loading && (
             <div className="pl-8 text-slate-400 text-sm">Enter a role to visualize your path to success.</div>
          )}
          {roadmap.map((step, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="relative pl-8"
             >
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-primary-500 shadow-[0_0_0_4px_rgba(255,255,255,1)] dark:shadow-[0_0_0_4px_rgba(15,23,42,1)]"></div>
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                   <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800 dark:text-white text-lg">Step {step.step}: {step.title}</h4>
                      <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">{step.duration}</span>
                   </div>
                   <p className="text-sm text-slate-600 dark:text-slate-400">{step.topics}</p>
                </div>
             </motion.div>
          ))}
       </div>
    </div>
  );
};

// --- Main Component ---
export const ResumeBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resume' | 'interview' | 'roadmap'>('resume');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Career Center</h1>
         <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
            {(['resume', 'interview', 'roadmap'] as const).map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab 
                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                 }`}
               >
                 {tab === 'resume' && 'Resume Builder'}
                 {tab === 'interview' && 'Mock Interview'}
                 {tab === 'roadmap' && 'Roadmap'}
               </button>
            ))}
         </div>
      </div>

      <Card noPadding>
         <div className="p-6">
            <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
               >
                  {activeTab === 'resume' && <ResumeEnhancer />}
                  {activeTab === 'interview' && <MockInterview />}
                  {activeTab === 'roadmap' && <CareerRoadmap />}
               </motion.div>
            </AnimatePresence>
         </div>
      </Card>
    </div>
  );
};
