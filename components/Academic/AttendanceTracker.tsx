import React, { useState, useMemo } from 'react';
import { 
  Plus, Check, X, Trash2, TrendingUp, Calculator, Bell, BellOff, 
  Clock, Pencil, Save, RotateCcw, AlertTriangle, Calendar, XCircle, 
  MoreHorizontal, ChevronRight, GraduationCap, ArrowRight, ShieldCheck, AlertOctagon, Activity, Eye, Play
} from 'lucide-react';
import { Card } from '../Shared/Card';
import { Button } from '../Shared/Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import { Subject } from '../../types';

// --- Logic Helpers ---

const getBunkStats = (attended: number, total: number, target: number) => {
  const currentPct = total === 0 ? 0 : attended / total;
  const targetRatio = target / 100;

  if (currentPct >= targetRatio) {
     const bunkable = Math.floor((attended - targetRatio * total) / targetRatio);
     return { 
       type: 'safe', 
       count: bunkable, 
       message: `Safe to bunk ${bunkable}`,
       longMessage: `You can safely skip ${bunkable} classes.`
     };
  } else {
     const catchup = Math.ceil((targetRatio * total - attended) / (1 - targetRatio));
     return { 
       type: 'danger', 
       count: catchup, 
       message: `Attend ${catchup} more`,
       longMessage: `Attend the next ${catchup} classes.`
     };
  }
};

const getProjection = (attended: number, total: number) => {
   const current = total > 0 ? (attended / total) * 100 : 0;
   const nextAttended = ((attended + 1) / (total + 1)) * 100;
   const nextMissed = (attended / (total + 1)) * 100;
   
   return {
      attendGain: (nextAttended - current).toFixed(1),
      missLoss: (current - nextMissed).toFixed(1)
   };
}

// --- UI Components ---

const CircularProgress = ({ value, size = 120, strokeWidth = 10, color = "text-emerald-500", subLabel, children }: { value: number; size?: number; strokeWidth?: number; color?: string; subLabel?: string; children?: React.ReactNode }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full transition-all duration-500">
        <circle
          className="text-slate-100 dark:text-slate-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${color} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center inset-0">
        {children || (
          <>
            <span className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{value}%</span>
            {subLabel && <span className="text-xs text-slate-400 font-medium font-mono mt-1">{subLabel}</span>}
          </>
        )}
      </div>
    </div>
  );
};

const AttendanceCalendar = ({ attended, total }: { attended: number, total: number }) => {
   // Simulating a pattern based on percentage
   const days = Array.from({ length: 30 }, (_, i) => {
       const isPast = i < total;
       if (!isPast) return 'future';
       // Approximate the distribution based on attended count
       // This is a visual approximation since we don't store exact dates
       const chance = attended / total;
       return Math.random() < chance ? 'present' : 'absent';
   });

   return (
       <div className="grid grid-cols-7 gap-1.5 mt-2">
           {days.map((status, i) => (
               <div 
                  key={i} 
                  className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-all hover:scale-110 ${
                      status === 'future' ? 'bg-slate-50 dark:bg-slate-800 text-slate-300' :
                      status === 'present' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-200 dark:border-emerald-800' :
                      'bg-rose-100 dark:bg-rose-900/30 text-rose-600 border border-rose-200 dark:border-rose-800'
                  }`}
               >
                  {status === 'future' ? '' : i + 1}
               </div>
           ))}
       </div>
   )
}

// --- Modal Component ---

const SubjectDetailModal = ({ 
  subject, 
  onClose, 
  onUpdate, 
  onDelete 
}: { 
  subject: Subject; 
  onClose: () => void; 
  onUpdate: (id: string, attended: number, total: number) => void;
  onDelete: (id: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator'>('overview');
  const [editValues, setEditValues] = useState({ attended: subject.attended, total: subject.total });
  const [simulatedClasses, setSimulatedClasses] = useState(0); 
  
  const percentage = subject.total > 0 ? Math.round((subject.attended / subject.total) * 100) : 0;
  const target = subject.minPercent;
  const bunkStats = getBunkStats(subject.attended, subject.total, subject.minPercent);

  // Simulation Logic
  const simTotal = subject.total + Math.abs(simulatedClasses);
  const simAttended = subject.attended + (simulatedClasses > 0 ? simulatedClasses : 0);
  const simPercent = Math.round((simAttended / simTotal) * 100);

  const handleSaveEdit = () => {
    onUpdate(subject.id, editValues.attended, editValues.total);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
           <div>
             <h2 className="text-xl font-bold text-slate-900 dark:text-white">{subject.name}</h2>
             <p className="text-sm text-slate-500">Attendance Analysis</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
             <X size={20} />
           </button>
        </div>

        <div className="p-6 space-y-6">
           <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                Overview
              </button>
              <button 
                 onClick={() => setActiveTab('simulator')}
                 className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'simulator' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                Simulator
              </button>
           </div>

           {activeTab === 'overview' ? (
             <div className="space-y-6">
                <div className="flex items-center gap-6">
                   <CircularProgress value={percentage} size={100} strokeWidth={8} color={percentage >= target ? "text-emerald-500" : "text-rose-500"} />
                   <div className="flex-1 space-y-3">
                      <div className={`p-3 rounded-xl border ${bunkStats.type === 'safe' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'}`}>
                         <p className={`text-sm font-medium ${bunkStats.type === 'safe' ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
                           {bunkStats.longMessage}
                         </p>
                      </div>
                      <div className="flex gap-4 text-sm">
                         <div>
                            <span className="block text-slate-400 text-xs uppercase">Attended</span>
                            <span className="font-mono font-bold text-lg text-slate-800 dark:text-white">{subject.attended}</span>
                         </div>
                         <div>
                            <span className="block text-slate-400 text-xs uppercase">Total</span>
                            <span className="font-mono font-bold text-lg text-slate-800 dark:text-white">{subject.total}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <Calendar size={14} /> Class Log (Simulated)
                    </h4>
                    <AttendanceCalendar attended={subject.attended} total={subject.total} />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                   <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Quick Fix</h4>
                   <div className="flex gap-3">
                      <div className="flex-1">
                         <label className="text-xs text-slate-500 mb-1 block">Attended</label>
                         <input 
                           type="number" 
                           className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-white"
                           value={editValues.attended}
                           onChange={(e) => setEditValues({...editValues, attended: parseInt(e.target.value) || 0})}
                         />
                      </div>
                      <div className="flex-1">
                         <label className="text-xs text-slate-500 mb-1 block">Total</label>
                         <input 
                           type="number" 
                           className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-white"
                           value={editValues.total}
                           onChange={(e) => setEditValues({...editValues, total: parseInt(e.target.value) || 0})}
                         />
                      </div>
                      <div className="flex items-end">
                         <Button onClick={handleSaveEdit} icon={<Save size={16} />}>Save</Button>
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="text-center py-2">
                   <div className="flex items-center justify-center gap-8 mb-6">
                      <div className="text-center opacity-50 scale-90">
                         <p className="text-xs uppercase font-bold text-slate-400">Current</p>
                         <p className="text-2xl font-mono font-bold">{percentage}%</p>
                      </div>
                      <ArrowRight className="text-slate-300" />
                      <div className="text-center scale-110">
                         <p className="text-xs uppercase font-bold text-primary-500">Projected</p>
                         <p className={`text-4xl font-mono font-bold ${simPercent >= target ? 'text-emerald-500' : 'text-rose-500'}`}>
                           {simPercent}%
                         </p>
                      </div>
                   </div>

                   <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between text-sm font-medium mb-2">
                         <span className="text-rose-500">Miss {Math.abs(Math.min(simulatedClasses, 0))}</span>
                         <span className="text-emerald-500">Attend {Math.max(simulatedClasses, 0)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="-10" 
                        max="10" 
                        step="1"
                        value={simulatedClasses}
                        onChange={(e) => setSimulatedClasses(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-2">
                         <span>-10 Classes</span>
                         <span className="font-bold text-slate-800 dark:text-white">0</span>
                         <span>+10 Classes</span>
                      </div>
                   </div>
                   
                   <p className="mt-6 text-xs text-slate-400 italic">
                        {simulatedClasses > 0 ? `Attending the next ${simulatedClasses} classes...` : 
                         simulatedClasses < 0 ? `Missing the next ${Math.abs(simulatedClasses)} classes...` : "Adjust slider to simulate."}
                   </p>
                </div>
             </div>
           )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-between">
           <button 
             onClick={() => onDelete(subject.id)}
             className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
           >
             <Trash2 size={16} /> Delete
           </button>
           <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </motion.div>
    </motion.div>
  );
};


// --- Main Attendance Tracker Component ---

export const AttendanceTracker: React.FC = () => {
  const { 
    subjects, addSubject, updateAttendance, updateSubjectStats, deleteSubject
  } = useAppContext();
  
  const [isAddMode, setIsAddMode] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [targetPercent, setTargetPercent] = useState(75);
  const [initialAttended, setInitialAttended] = useState('');
  const [initialTotal, setInitialTotal] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const selectedSubject = useMemo(() => subjects.find(s => s.id === selectedSubjectId), [subjects, selectedSubjectId]);

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    const attended = initialAttended ? parseInt(initialAttended) : 0;
    const total = initialTotal ? parseInt(initialTotal) : 0;
    addSubject(newSubject, targetPercent, attended, total);
    setNewSubject('');
    setInitialAttended('');
    setInitialTotal('');
    setIsAddMode(false);
  };

  const handleMarkAllPresent = () => {
    subjects.forEach(sub => updateAttendance(sub.id, true));
  };

  const safeToBunkSubjects = subjects.filter(s => {
      const stats = getBunkStats(s.attended, s.total, s.minPercent);
      return stats.type === 'safe' && stats.count > 0;
  });

  return (
    <div className="space-y-8 pb-8">
      <AnimatePresence>
        {selectedSubject && (
          <SubjectDetailModal 
            subject={selectedSubject} 
            onClose={() => setSelectedSubjectId(null)}
            onUpdate={updateSubjectStats}
            onDelete={(id) => { deleteSubject(id); setSelectedSubjectId(null); }}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Attendance Manager</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track, simulate, and optimize your academic presence.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" onClick={handleMarkAllPresent} icon={<Check size={16} />}>Mark All Present</Button>
           <Button onClick={() => setIsAddMode(true)} icon={<Plus size={16} />}>New Subject</Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats Card */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-slate-800 relative overflow-hidden" noPadding>
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
             <div className="p-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                <div className="flex flex-col justify-between">
                    <div>
                        <h3 className="text-slate-400 font-semibold text-xs uppercase tracking-widest flex items-center gap-2 mb-2">
                            <Activity size={14} className="text-emerald-400" /> Bunk Monitor
                        </h3>
                        <div className="space-y-4">
                            {safeToBunkSubjects.length > 0 ? (
                                <div>
                                    <p className="text-2xl font-bold mb-1">Safe to skip today</p>
                                    <div className="flex flex-wrap gap-2">
                                        {safeToBunkSubjects.slice(0, 3).map(s => {
                                             const stats = getBunkStats(s.attended, s.total, s.minPercent);
                                             return (
                                                 <div key={s.id} className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-medium text-emerald-300 flex items-center gap-1">
                                                     {s.name} <span className="bg-emerald-500 text-slate-900 px-1 rounded text-[10px]">{stats.count}</span>
                                                 </div>
                                             );
                                        })}
                                        {safeToBunkSubjects.length > 3 && <span className="text-xs text-slate-400 self-center">+{safeToBunkSubjects.length - 3} more</span>}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xl font-bold text-rose-300">No safe bunks available!</p>
                                    <p className="text-sm text-slate-400 mt-1">You need to attend more classes to build a buffer.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-700/50 mt-4">
                       <p className="text-xs text-slate-400">
                          Tip: Maintaining 80% is safer than 75% for emergencies.
                       </p>
                    </div>
                </div>
                
                <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl border border-white/10 p-4">
                   <h4 className="text-sm font-semibold mb-4 text-slate-300">Overall Attendance Health</h4>
                   <div className="relative w-32 h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Safe', value: subjects.filter(s => (s.attended/s.total) >= (s.minPercent/100)).length },
                                        { name: 'Risk', value: subjects.filter(s => (s.attended/s.total) < (s.minPercent/100)).length }
                                    ]}
                                    cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={5}
                                    dataKey="value" stroke="none"
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#f43f5e" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                           <span className="text-2xl font-bold">{Math.round((subjects.reduce((acc, s) => acc + s.attended, 0) / Math.max(subjects.reduce((acc, s) => acc + s.total, 0), 1)) * 100)}%</span>
                           <span className="text-[10px] text-slate-400 uppercase">Avg</span>
                        </div>
                   </div>
                </div>
             </div>
        </Card>

        {/* Quick Add / Sim Card */}
        <div className="space-y-6">
            <button 
                onClick={() => setIsAddMode(true)}
                className="w-full h-full min-h-[200px] rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all flex flex-col items-center justify-center gap-3 group text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
            >
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                    <Plus size={32} />
                </div>
                <span className="font-bold text-lg">Add New Subject</span>
            </button>
        </div>
      </div>

      {/* Add Subject Form (Collapsible) */}
      <AnimatePresence>
        {isAddMode && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
             <Card className="bg-slate-50 dark:bg-slate-900 border-dashed border-2 border-slate-200 dark:border-slate-800">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full space-y-1">
                       <label className="text-xs font-semibold text-slate-500 uppercase">Subject Name</label>
                       <input 
                         value={newSubject} onChange={e => setNewSubject(e.target.value)} 
                         placeholder="e.g. Applied Physics" 
                         className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                       />
                    </div>
                    <div className="w-full md:w-32 space-y-1">
                       <label className="text-xs font-semibold text-slate-500 uppercase">Attended</label>
                       <input 
                         type="number" value={initialAttended} onChange={e => setInitialAttended(e.target.value)} placeholder="0"
                         className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                       />
                    </div>
                    <div className="w-full md:w-32 space-y-1">
                       <label className="text-xs font-semibold text-slate-500 uppercase">Total</label>
                       <input 
                         type="number" value={initialTotal} onChange={e => setInitialTotal(e.target.value)} placeholder="0"
                         className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                       />
                    </div>
                    <div className="w-full md:w-32 space-y-1">
                       <label className="text-xs font-semibold text-slate-500 uppercase">Target %</label>
                       <select 
                         value={targetPercent} onChange={e => setTargetPercent(Number(e.target.value))}
                         className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                       >
                         <option value={75}>75%</option>
                         <option value={80}>80%</option>
                         <option value={85}>85%</option>
                       </select>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                       <Button onClick={handleAddSubject} className="flex-1 md:flex-none">Add Subject</Button>
                       <Button variant="ghost" onClick={() => setIsAddMode(false)} className="md:flex-none">Cancel</Button>
                    </div>
                </div>
             </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden" animate="show"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
      >
        {subjects.map(subject => {
          const percentage = subject.total > 0 ? Math.round((subject.attended / subject.total) * 100) : 0;
          const isSafe = percentage >= subject.minPercent;
          const bunkStats = getBunkStats(subject.attended, subject.total, subject.minPercent);
          const projection = getProjection(subject.attended, subject.total);

          return (
            <motion.div key={subject.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <Card className="h-full flex flex-col justify-between hover:shadow-lg transition-all duration-300 group cursor-pointer border border-transparent hover:border-primary-200 dark:hover:border-slate-700" noPadding>
                <div onClick={() => setSelectedSubjectId(subject.id)} className="p-5 flex-1 relative">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg truncate pr-4 flex-1" title={subject.name}>{subject.name}</h3>
                        <div className={`text-[10px] font-bold px-2 py-1 rounded-full border whitespace-nowrap ${bunkStats.type === 'safe' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'}`}>
                           {bunkStats.message}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                           <CircularProgress 
                               value={percentage} 
                               size={70} 
                               strokeWidth={6}
                               color={isSafe ? 'text-emerald-500' : 'text-rose-500'}
                           />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                <div className="text-center flex-1 border-r border-slate-200 dark:border-slate-700">
                                    <p className="text-[10px] text-slate-400 uppercase">Present</p>
                                    <p className="font-bold text-slate-800 dark:text-white">{subject.attended}</p>
                                </div>
                                <div className="text-center flex-1">
                                    <p className="text-[10px] text-slate-400 uppercase">Total</p>
                                    <p className="font-bold text-slate-800 dark:text-white">{subject.total}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                                <span className="flex items-center gap-1"><Play size={10} className="fill-emerald-500 text-emerald-500" /> +{projection.attendGain}%</span>
                                <span className="flex items-center gap-1"><Play size={10} className="fill-rose-500 text-rose-500 rotate-180" /> -{projection.missLoss}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 border-t border-slate-100 dark:border-slate-800 divide-x divide-slate-100 dark:divide-slate-800">
                  <button 
                    className="py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-center gap-2"
                    onClick={(e) => { e.stopPropagation(); updateAttendance(subject.id, true); }}
                  >
                    <Check size={16} /> Present
                  </button>
                  <button 
                    className="py-3 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center justify-center gap-2"
                    onClick={(e) => { e.stopPropagation(); updateAttendance(subject.id, false); }}
                  >
                    <X size={16} /> Absent
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};