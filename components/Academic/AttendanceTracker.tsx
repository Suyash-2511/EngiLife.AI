import React, { useState, useMemo } from 'react';
import { 
  Plus, Check, X, Trash2, TrendingUp, Calculator, Bell, BellOff, 
  Clock, Pencil, Save, RotateCcw, AlertTriangle, Calendar, XCircle, 
  MoreHorizontal, ChevronRight, GraduationCap, ArrowRight, ShieldCheck, AlertOctagon, Activity
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
       longMessage: `You can safely skip ${bunkable} more classes.`
     };
  } else {
     const catchup = Math.ceil((targetRatio * total - attended) / (1 - targetRatio));
     return { 
       type: 'danger', 
       count: catchup, 
       message: `Attend ${catchup} more`,
       longMessage: `Attend the next ${catchup} classes to reach ${target}%.`
     };
  }
};

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

const AttendanceHeatmap = () => {
  // Generate last 4 weeks of dummy data
  const days = Array.from({ length: 28 }, (_, i) => {
    const val = Math.random();
    // Simulate weekends
    if (i % 7 === 5 || i % 7 === 6) return 'bg-slate-100 dark:bg-slate-800/50';
    return val > 0.8 ? 'bg-emerald-500' : val > 0.4 ? 'bg-emerald-400/60' : val > 0.2 ? 'bg-rose-500/60' : 'bg-slate-200 dark:bg-slate-800';
  });

  return (
    <div className="flex gap-1.5 h-8 items-end">
      {days.map((color, i) => (
        <motion.div 
          key={i} 
          initial={{ height: '20%' }}
          animate={{ height: '100%' }}
          transition={{ delay: i * 0.02 }}
          className={`w-1.5 rounded-sm ${color}`} 
          title={`Day ${i+1}`} 
        />
      ))}
    </div>
  );
};

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
    subjects, addSubject, updateAttendance, updateSubjectStats, deleteSubject,
    reminders, addReminder, deleteReminder
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

  const totalClasses = subjects.reduce((acc, curr) => acc + curr.total, 0);
  const totalAttended = subjects.reduce((acc, curr) => acc + curr.attended, 0);
  const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
  
  const subjectsAtRisk = subjects.filter(s => {
      const pct = s.total > 0 ? (s.attended / s.total) * 100 : 0;
      return pct < s.minPercent;
  }).length;

  const chartData = [
    { name: 'Attended', value: totalAttended },
    { name: 'Missed', value: totalClasses - totalAttended },
  ];
  const COLORS = ['#10b981', '#f43f5e'];

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
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

             <div className="p-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                <div className="flex flex-col justify-between">
                    <div>
                        <h3 className="text-slate-400 font-semibold text-xs uppercase tracking-widest flex items-center gap-2 mb-2">
                            <TrendingUp size={14} className="text-emerald-400" /> Overall Health
                        </h3>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className={`text-6xl font-bold font-mono tracking-tighter ${overallPercentage >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {overallPercentage}
                            </span>
                            <span className="text-2xl font-bold text-slate-500">%</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
                           You are currently <strong>{overallPercentage >= 75 ? 'on track' : 'at risk'}</strong>. 
                           {overallPercentage >= 75 ? ' Keep maintaining your streak!' : ' You need to attend more classes to reach the safe zone.'}
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-700/50">
                       <div>
                          <p className="text-xs text-slate-500 mb-1">Total</p>
                          <p className="text-xl font-bold font-mono">{totalClasses}</p>
                       </div>
                       <div>
                          <p className="text-xs text-emerald-500/70 mb-1">Present</p>
                          <p className="text-xl font-bold font-mono text-emerald-400">{totalAttended}</p>
                       </div>
                       <div>
                          <p className="text-xs text-rose-500/70 mb-1">Absent</p>
                          <p className="text-xl font-bold font-mono text-rose-400">{totalClasses - totalAttended}</p>
                       </div>
                    </div>
                </div>
                
                <div className="flex flex-col justify-between items-center md:items-end">
                   <div className="w-32 h-32 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <Activity size={24} className="text-slate-600" />
                        </div>
                   </div>
                   <div className="w-full mt-auto text-right">
                       <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Monthly Activity</p>
                       <AttendanceHeatmap />
                   </div>
                </div>
             </div>
        </Card>

        {/* Intelligence Card */}
        <Card title="Quick Insights" className="flex flex-col">
            <div className="flex-1 space-y-4">
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${subjectsAtRisk > 0 ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'}`}>
                    <div className={`p-2 rounded-lg ${subjectsAtRisk > 0 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'}`}>
                        {subjectsAtRisk > 0 ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
                    </div>
                    <div>
                        <h4 className={`font-semibold ${subjectsAtRisk > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                           {subjectsAtRisk > 0 ? 'Attention Needed' : 'All Systems Good'}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                           {subjectsAtRisk > 0 
                             ? `${subjectsAtRisk} subjects are below your target threshold. Consider prioritizing them.` 
                             : 'You are maintaining a healthy attendance record across all subjects.'}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                   <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Smart Suggestions</h4>
                   <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                       <Calculator size={14} className="text-primary-500" />
                       <span>To reach 85% overall, attend next 4 classes.</span>
                   </div>
                </div>
            </div>
        </Card>
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial="hidden" animate="show"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
      >
        {subjects.map(subject => {
          const percentage = subject.total > 0 ? Math.round((subject.attended / subject.total) * 100) : 0;
          const isSafe = percentage >= subject.minPercent;
          const bunkStats = getBunkStats(subject.attended, subject.total, subject.minPercent);

          return (
            <motion.div key={subject.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <Card className="h-full flex flex-col justify-between hover:shadow-lg transition-all duration-300 group cursor-pointer border border-transparent hover:border-primary-200 dark:hover:border-slate-700" noPadding>
                <div onClick={() => setSelectedSubjectId(subject.id)} className="p-5 flex-1 relative">
                    {/* Bunk Monitor Badge */}
                    <div className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded-full border ${bunkStats.type === 'safe' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'}`}>
                       {bunkStats.message}
                    </div>

                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg truncate pr-20 mb-6" title={subject.name}>{subject.name}</h3>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                           <CircularProgress 
                               value={percentage} 
                               size={80} 
                               strokeWidth={8}
                               color={isSafe ? 'text-emerald-500' : 'text-rose-500'}
                           />
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between items-center text-sm mb-1">
                              <span className="text-slate-500">Target</span>
                              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{subject.minPercent}%</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">Attended</span>
                              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{subject.attended}/{subject.total}</span>
                           </div>
                           <div className="mt-3 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
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
        
        {/* Quick Add Card at the end of grid */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
           <button 
             onClick={() => setIsAddMode(true)}
             className="w-full h-full min-h-[220px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all flex flex-col items-center justify-center gap-3 group text-slate-400 hover:text-primary-500"
           >
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                 <Plus size={24} />
              </div>
              <span className="font-medium">Add Subject</span>
           </button>
        </motion.div>
      </motion.div>
    </div>
  );
};