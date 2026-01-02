import React, { useState, useMemo } from 'react';
import { 
  Plus, Check, X, Trash2, TrendingUp, Calculator, 
  RotateCcw, AlertTriangle, ShieldCheck, AlertOctagon, 
  Activity, Target, Filter, ArrowUpDown, MoreVertical, Edit2, Info,
  MinusCircle, PlusCircle
} from 'lucide-react';
import { Card } from '../Shared/Card';
import { Button } from '../Shared/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import { Subject } from '../../types';

// --- Logic Helpers ---

const calculateStats = (attended: number, total: number, target: number) => {
  if (total === 0) return { pct: 0, status: 'neutral', count: 0, label: 'No classes yet' };
  
  const pct = (attended / total) * 100;
  const targetRate = Math.min(target, 99.99) / 100;

  if (pct >= target) {
    // Safe margin
    const margin = Math.floor((attended / targetRate) - total);
    return { 
      pct,
      status: 'safe', 
      count: margin, 
      label: margin > 0 ? `Safe to bunk ${margin}` : `On the edge` 
    };
  } else {
    // Recovery
    const needed = Math.ceil((targetRate * total - attended) / (1 - targetRate));
    return { 
      pct,
      status: 'danger', 
      count: Math.max(0, needed), 
      label: `Attend next ${Math.max(0, needed)}` 
    };
  }
};

// --- Components ---

const ProgressBar = ({ value, target, className }: { value: number, target: number, className?: string }) => {
  const boundedValue = Math.min(Math.max(value, 0), 100);
  let colorClass = 'bg-rose-500';
  if (value >= target) colorClass = 'bg-emerald-500';
  else if (value >= target - 5) colorClass = 'bg-amber-500';

  return (
    <div className={`h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${className}`}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${boundedValue}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`h-full ${colorClass}`}
      />
    </div>
  );
};

interface SubjectCardProps {
  subject: Subject;
  onUpdate: (id: string, attended: number, total: number) => void;
  onDelete: (id: string) => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ 
  subject, 
  onUpdate, 
  onDelete 
}) => {
  const [showEdit, setShowEdit] = useState(false);
  const [editValues, setEditValues] = useState({ attended: subject.attended, total: subject.total });

  const stats = calculateStats(subject.attended, subject.total, subject.minPercent);

  // Simplified Interaction Logic
  const handleMarkPresent = () => {
    onUpdate(subject.id, subject.attended + 1, subject.total + 1);
  };
  const handleMarkAbsent = () => {
    onUpdate(subject.id, subject.attended, subject.total + 1);
  };
  
  // Undo Logic (Simple Decrement)
  const manualDecrementAttended = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(subject.id, Math.max(0, subject.attended - 1), Math.max(0, subject.total - 1));
  };

  const manualDecrementAbsent = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(subject.id, subject.attended, Math.max(0, subject.total - 1));
  };

  const handleManualSave = () => {
    onUpdate(subject.id, editValues.attended, editValues.total);
    setShowEdit(false);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <Card className={`h-full flex flex-col justify-between transition-all duration-300 ${stats.status === 'danger' ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-emerald-500'}`} noPadding>
        {/* Content Section */}
        <div>
            {/* Card Header */}
            <div className="p-5 pb-2 flex justify-between items-start">
              <div className="flex-1 min-w-0 mr-4">
                 <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate" title={subject.name}>{subject.name}</h3>
                 <div className="flex items-center gap-2 mt-1">
                     <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                         stats.status === 'safe' 
                         ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900' 
                         : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900'
                     }`}>
                         {Math.round(stats.pct)}%
                     </span>
                     <span className="text-xs text-slate-400">Target: {subject.minPercent}%</span>
                 </div>
              </div>
              <div className="relative">
                 <button onClick={() => setShowEdit(!showEdit)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    {showEdit ? <X size={18} /> : <Edit2 size={18} />}
                 </button>
              </div>
            </div>

            {/* Manual Edit Overlay */}
            <AnimatePresence>
              {showEdit && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-5 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800 overflow-hidden"
                >
                   <div className="py-4 space-y-3">
                      <div className="flex gap-4">
                         <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Attended</label>
                            <input 
                              type="number" min="0" 
                              value={editValues.attended}
                              onChange={e => setEditValues({...editValues, attended: parseInt(e.target.value) || 0})}
                              className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                         </div>
                         <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Total</label>
                            <input 
                              type="number" min="0" 
                              value={editValues.total}
                              onChange={e => setEditValues({...editValues, total: parseInt(e.target.value) || 0})}
                              className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                         </div>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                         <button onClick={() => onDelete(subject.id)} className="text-xs text-red-500 hover:underline flex items-center gap-1"><Trash2 size={12}/> Delete</button>
                         <Button size="sm" onClick={handleManualSave}>Save</Button>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats Visuals */}
            <div className="px-5 py-4 space-y-3">
               <ProgressBar value={stats.pct} target={subject.minPercent} />
               
               <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                     <Activity size={14} />
                     <span>{subject.attended} / {subject.total} Classes</span>
                  </div>
                  <div className={`font-medium ${stats.status === 'safe' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                     {stats.label}
                  </div>
               </div>
            </div>
        </div>

        {/* Distinct Action Footer */}
        <div className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30">
            <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-800">
                 {/* Present Button */}
                 <div className="relative group p-2 flex items-center justify-center gap-2">
                     <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleMarkPresent}
                        className="flex-1 py-3 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-500 font-bold hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all shadow-sm hover:shadow"
                     >
                        <Check size={18} strokeWidth={3} /> Present
                     </motion.button>
                     <button 
                        onClick={manualDecrementAttended}
                        className="absolute top-1 right-1 p-1 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Undo Present (-1)"
                     >
                        <MinusCircle size={14} />
                     </button>
                 </div>

                 {/* Absent Button */}
                 <div className="relative group p-2 flex items-center justify-center gap-2">
                     <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleMarkAbsent}
                        className="flex-1 py-3 flex items-center justify-center gap-2 text-rose-600 dark:text-rose-500 font-bold hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all shadow-sm hover:shadow"
                     >
                        <X size={18} strokeWidth={3} /> Absent
                     </motion.button>
                     <button 
                        onClick={manualDecrementAbsent}
                        className="absolute top-1 right-1 p-1 text-slate-300 hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Undo Absent (-1)"
                     >
                        <MinusCircle size={14} />
                     </button>
                 </div>
            </div>
        </div>
      </Card>
    </motion.div>
  );
};

// --- Main Container ---

export const AttendanceTracker: React.FC = () => {
  const { 
    subjects, addSubject, updateSubjectStats, deleteSubject, updateAttendance
  } = useAppContext();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [filter, setFilter] = useState<'all' | 'critical' | 'safe'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'attendance'>('attendance');

  // New Subject Form State
  const [initialAttended, setInitialAttended] = useState('');
  const [initialTotal, setInitialTotal] = useState('');
  const [targetPercent, setTargetPercent] = useState(75);

  const handleQuickAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newSubjectName.trim()) return;
    addSubject(
      newSubjectName, 
      targetPercent, 
      parseInt(initialAttended) || 0, 
      parseInt(initialTotal) || 0
    );
    setNewSubjectName('');
    setInitialAttended('');
    setInitialTotal('');
    setIsAdding(false);
  };

  const filteredSubjects = useMemo(() => {
    let result = [...subjects];
    
    // Filter
    if (filter === 'critical') {
      result = result.filter(s => {
        const pct = s.total > 0 ? (s.attended/s.total)*100 : 100;
        return pct < s.minPercent;
      });
    } else if (filter === 'safe') {
      result = result.filter(s => {
        const pct = s.total > 0 ? (s.attended/s.total)*100 : 0;
        return pct >= s.minPercent;
      });
    }

    // Sort
    if (sortBy === 'attendance') {
      result.sort((a, b) => {
        const pctA = a.total > 0 ? a.attended/a.total : 0;
        const pctB = b.total > 0 ? b.attended/b.total : 0;
        return pctA - pctB; // Low attendance first
      });
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [subjects, filter, sortBy]);

  const overallPct = subjects.length > 0 
    ? Math.round((subjects.reduce((acc, s) => acc + s.attended, 0) / Math.max(subjects.reduce((acc, s) => acc + s.total, 0), 1)) * 100) 
    : 100;

  const lowAttendanceCount = subjects.filter(s => (s.total > 0 ? (s.attended/s.total)*100 : 100) < s.minPercent).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Stats */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
         <Card className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none" noPadding>
            <div className="p-6 flex items-center justify-between h-full">
               <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Overall Attendance</p>
                  <h2 className="text-4xl font-bold font-mono text-white">{overallPct}%</h2>
                  <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                     {lowAttendanceCount === 0 ? <ShieldCheck className="text-emerald-400" size={16}/> : <AlertTriangle className="text-rose-400" size={16}/>}
                     {lowAttendanceCount === 0 ? "All subjects safe" : `${lowAttendanceCount} subjects need attention`}
                  </p>
               </div>
               <div className="w-20 h-20 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                  <Activity size={32} className="text-white/80" />
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                     <circle cx="36" cy="36" r="34" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/20" />
                     <circle 
                        cx="36" cy="36" r="34" fill="none" stroke="currentColor" strokeWidth="4" 
                        className={overallPct >= 75 ? "text-emerald-500" : "text-rose-500"}
                        strokeDasharray={213}
                        strokeDashoffset={213 - (213 * overallPct) / 100}
                        strokeLinecap="round"
                     />
                  </svg>
               </div>
            </div>
         </Card>

         <div className="flex gap-2 flex-col justify-center">
            <button 
               onClick={() => {
                   if (window.confirm("Mark ALL subjects as Present for today?")) {
                       subjects.forEach(s => updateAttendance(s.id, true));
                   }
               }}
               className="h-full px-6 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-2"
            >
               <Check size={20} strokeWidth={3} /> Mark All Present
            </button>
         </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
         <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
               <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}>All</button>
               <button onClick={() => setFilter('critical')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filter === 'critical' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500'}`}>Critical</button>
               <button onClick={() => setFilter('safe')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filter === 'safe' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}>Safe</button>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <button onClick={() => setSortBy(sortBy === 'name' ? 'attendance' : 'name')} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
               <ArrowUpDown size={14} /> {sortBy === 'name' ? 'Name' : 'Attendance'}
            </button>
         </div>
         <Button size="sm" onClick={() => setIsAdding(true)} icon={<Plus size={16}/>}>Add Subject</Button>
      </div>

      {/* Quick Add Form */}
      <AnimatePresence>
         {isAdding && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
               <Card className="bg-slate-50 dark:bg-slate-900 border-dashed border-2 border-slate-300 dark:border-slate-700">
                  <form onSubmit={handleQuickAdd} className="flex flex-wrap gap-4 items-end">
                     <div className="flex-1 min-w-[200px]">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Subject Name</label>
                        <input autoFocus value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="e.g. Thermodynamics" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50" />
                     </div>
                     <div className="w-24">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Attended</label>
                        <input type="number" value={initialAttended} onChange={e => setInitialAttended(e.target.value)} placeholder="0" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50" />
                     </div>
                     <div className="w-24">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Total</label>
                        <input type="number" value={initialTotal} onChange={e => setInitialTotal(e.target.value)} placeholder="0" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50" />
                     </div>
                     <div className="w-32">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Target %</label>
                        <select value={targetPercent} onChange={e => setTargetPercent(Number(e.target.value))} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50">
                           <option value={75}>75%</option>
                           <option value={80}>80%</option>
                           <option value={85}>85%</option>
                           <option value={60}>60%</option>
                        </select>
                     </div>
                     <div className="flex gap-2">
                        <Button type="submit" disabled={!newSubjectName}>Add</Button>
                        <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                     </div>
                  </form>
               </Card>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Subject Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         <AnimatePresence>
            {filteredSubjects.map(subject => (
               <SubjectCard 
                  key={subject.id} 
                  subject={subject} 
                  onUpdate={updateSubjectStats}
                  onDelete={deleteSubject}
               />
            ))}
         </AnimatePresence>
         {filteredSubjects.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter size={24} className="opacity-50" />
               </div>
               <p>No subjects found for this filter.</p>
               <button onClick={() => setFilter('all')} className="text-primary-500 font-medium text-sm mt-2 hover:underline">Clear Filters</button>
            </div>
         )}
      </div>
    </div>
  );
};