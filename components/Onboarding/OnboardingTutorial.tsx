import React, { useState } from 'react';
import { BookOpen, Plus, ArrowRight, X } from 'lucide-react';
import { Card } from '../Shared/Card';
import { Button } from '../Shared/Button';
import { useAppContext } from '../../context/AppContext';
import { motion } from 'framer-motion';

export const OnboardingTutorial: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { addSubject } = useAppContext();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (sub: string) => {
    setSubjects(subjects.filter(s => s !== sub));
  };

  const handleFinish = () => {
    subjects.forEach(sub => addSubject(sub, 75)); // Default 75% target
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-4 backdrop-blur-md">
      <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         className="w-full max-w-lg"
      >
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
           <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <BookOpen size={32} className="text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Let's get you set up</h2>
              <p className="text-slate-500 text-sm">Add your current semester subjects to initialize the Attendance Tracker and AI Tutor.</p>
           </div>

           <div className="space-y-4 mb-8">
              <form onSubmit={handleAddSubject} className="flex gap-2">
                 <input 
                   value={newSubject}
                   onChange={e => setNewSubject(e.target.value)}
                   placeholder="e.g. Data Structures"
                   className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/50"
                   autoFocus
                 />
                 <Button type="submit" icon={<Plus size={20} />} className="w-12 h-full !p-0 flex items-center justify-center" />
              </form>

              <div className="flex flex-wrap gap-2 min-h-[100px] content-start">
                 {subjects.length === 0 && (
                    <div className="w-full text-center text-slate-400 text-xs italic py-4">
                       No subjects added yet.
                    </div>
                 )}
                 {subjects.map(sub => (
                    <motion.span 
                      key={sub}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold flex items-center gap-2"
                    >
                       {sub}
                       <button onClick={() => handleRemoveSubject(sub)} className="text-slate-400 hover:text-rose-500"><X size={14} /></button>
                    </motion.span>
                 ))}
              </div>
           </div>

           <Button onClick={handleFinish} className="w-full py-3.5" disabled={subjects.length === 0}>
              Complete Setup <ArrowRight size={18} />
           </Button>
        </Card>
      </motion.div>
    </div>
  );
};
