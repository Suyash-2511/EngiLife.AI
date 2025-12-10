import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, Clock, Zap, ArrowRight, Activity, 
  TrendingUp, Calendar, MoreHorizontal, Award, BookOpen, RefreshCw, Pencil, Trash2, Plus, Save, X
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card } from './Shared/Card';
import { Button } from './Shared/Button';
import { useAppContext } from '../context/AppContext';
import { Task, ScheduleItem } from '../types';

const WEEKLY_DATA = [
  { day: 'Mon', hours: 4, efficiency: 85 },
  { day: 'Tue', hours: 6, efficiency: 70 },
  { day: 'Wed', hours: 5, efficiency: 90 },
  { day: 'Thu', hours: 7, efficiency: 65 },
  { day: 'Fri', hours: 4, efficiency: 80 },
  { day: 'Sat', hours: 8, efficiency: 95 },
  { day: 'Sun', hours: 3, efficiency: 60 },
];

export const Dashboard: React.FC = () => {
  const { 
    user, 
    tasks, updateTask, deleteTask,
    subjects, 
    schedule, addScheduleItem, updateScheduleItem, deleteScheduleItem,
    toggleTaskCompletion, 
    cycleTaskPriority,
    generateSmartSchedule,
    isGeneratingSchedule
  } = useAppContext();

  // Calculate stats from live data
  const totalClasses = subjects.reduce((acc, sub) => acc + sub.total, 0);
  const totalAttended = subjects.reduce((acc, sub) => acc + sub.attended, 0);
  const attendancePercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
  
  const pendingDeadlines = tasks.filter(t => !t.completed).length;

  // Edit Task State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskEditValues, setTaskEditValues] = useState<Partial<Task>>({});

  // Edit Schedule State
  const [editingScheduleIndex, setEditingScheduleIndex] = useState<number | null>(null);
  const [scheduleEditValues, setScheduleEditValues] = useState<Partial<ScheduleItem>>({});
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [newScheduleItem, setNewScheduleItem] = useState<ScheduleItem>({
    time: '09:00',
    activity: '',
    type: 'Lecture',
    status: 'upcoming'
  });

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskEditValues({ ...task });
  };

  const saveTask = () => {
    if (editingTaskId && taskEditValues) {
      updateTask(editingTaskId, taskEditValues);
      setEditingTaskId(null);
    }
  };

  const startEditingSchedule = (index: number, item: ScheduleItem) => {
    setEditingScheduleIndex(index);
    setScheduleEditValues({ ...item });
  };

  const saveSchedule = (index: number) => {
    if (scheduleEditValues) {
      updateScheduleItem(index, scheduleEditValues as ScheduleItem);
      setEditingScheduleIndex(null);
    }
  };

  const handleAddSchedule = () => {
    if (newScheduleItem.activity) {
      addScheduleItem(newScheduleItem);
      setIsAddingSchedule(false);
      setNewScheduleItem({ time: '09:00', activity: '', type: 'Lecture', status: 'upcoming' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row justify-between items-end gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-primary-600 dark:text-primary-400">{user?.name}</span>. You have {pendingDeadlines} pending tasks.
          </p>
        </div>
        <div className="flex gap-2">
            <span className="text-sm font-mono text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group" noPadding delay={0.1}>
             <div className="absolute right-0 top-0 w-24 h-24 bg-primary-500/10 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500"></div>
             <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg">
                        <CheckCircle size={20} />
                    </div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Attendance</span>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{attendancePercentage}%</span>
                    <span className="text-xs text-emerald-500 font-medium mb-1.5 flex items-center">
                        <TrendingUp size={12} className="mr-0.5" /> Live
                    </span>
                </div>
             </div>
             <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
                 <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${attendancePercentage}%` }} 
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-primary-500" 
                 />
             </div>
        </Card>

        <Card className="relative overflow-hidden group" noPadding delay={0.2}>
             <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500"></div>
             <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        <Award size={20} />
                    </div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">CGPA</span>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">8.4</span>
                    <span className="text-xs text-emerald-500 font-medium mb-1.5">Top 15%</span>
                </div>
             </div>
             <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
                 <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: "84%" }} 
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    className="h-full bg-emerald-500" 
                 />
             </div>
        </Card>

        <Card className="relative overflow-hidden group" noPadding delay={0.3}>
             <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500"></div>
             <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                        <Clock size={20} />
                    </div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Deadlines</span>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{pendingDeadlines}</span>
                    <span className="text-xs text-amber-500 font-medium mb-1.5">Due soon</span>
                </div>
             </div>
             <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
                 <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${Math.min(pendingDeadlines * 20, 100)}%` }} 
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                    className="h-full bg-amber-500" 
                 />
             </div>
        </Card>

        <Card className="relative overflow-hidden group" noPadding delay={0.4}>
             <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500"></div>
             <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Zap size={20} />
                    </div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Study Streak</span>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">12</span>
                    <span className="text-xs text-blue-500 font-medium mb-1.5">Days</span>
                </div>
             </div>
             <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
                 <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: "100%" }} 
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
                    className="h-full bg-blue-500" 
                 />
             </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Charts & Tasks */}
        <div className="lg:col-span-2 space-y-8">
            {/* Study Activity Chart */}
            <Card title="Weekly Study Performance" className="min-h-[350px]" delay={0.5}>
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ duration: 1, delay: 0.8 }}
                    className="h-[280px] w-full mt-4"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={WEEKLY_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="hours" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            </Card>

            {/* Tasks List with Edit Support */}
            <Card title="Upcoming Deadlines" action={<Button variant="ghost" size="sm">See All</Button>} delay={0.6}>
                <div className="space-y-4">
                    <AnimatePresence>
                    {tasks.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="text-center py-8 text-slate-400 text-sm"
                        >
                            No pending tasks. Great job!
                        </motion.div>
                    )}
                    {tasks.map(task => (
                    <motion.div 
                        key={task.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                        className={`flex items-center p-4 rounded-xl border transition-colors group relative ${
                          task.completed 
                            ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-60' 
                            : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800'
                        }`}
                    >
                        {editingTaskId === task.id ? (
                           <div className="flex-1 flex gap-2 items-center">
                              <input 
                                className="flex-1 px-2 py-1 border rounded bg-slate-50 dark:bg-slate-900 dark:text-white" 
                                value={taskEditValues.title} 
                                onChange={(e) => setTaskEditValues({...taskEditValues, title: e.target.value})}
                              />
                              <input 
                                className="w-32 px-2 py-1 border rounded bg-slate-50 dark:bg-slate-900 dark:text-white" 
                                value={taskEditValues.deadline} 
                                onChange={(e) => setTaskEditValues({...taskEditValues, deadline: e.target.value})}
                              />
                              <Button size="sm" onClick={saveTask}><Save size={14}/></Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingTaskId(null)}><X size={14}/></Button>
                           </div>
                        ) : (
                          <>
                            <motion.div 
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); cycleTaskPriority(task.id); }}
                              className={`w-1 h-12 rounded-full mr-4 cursor-pointer transition-colors ${
                                task.priority === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                                task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} title="Click to cycle priority" 
                            />
                            
                            <div className="flex-1 cursor-pointer" onClick={() => toggleTaskCompletion(task.id)}>
                                <h4 className={`font-medium transition-all ${task.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                  {task.title}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <span className="flex items-center gap-1"><Calendar size={12}/> {task.deadline}</span>
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">{task.category}</span>
                                </div>
                            </div>

                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" onClick={() => startEditingTask(task)}><Pencil size={14} /></Button>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => deleteTask(task.id)}><Trash2 size={14} /></Button>
                            </div>

                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => toggleTaskCompletion(task.id)}
                              className={task.completed ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}
                            >
                                <CheckCircle size={18} fill={task.completed ? "currentColor" : "none"} />
                            </Button>
                          </>
                        )}
                    </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
            </Card>
        </div>

        {/* Right Column: Course Progress & Timeline */}
        <div className="space-y-8">
            {/* Course Progress */}
            <Card title="Course Progress" delay={0.7}>
                <div className="space-y-6">
                    {subjects.map((course, i) => (
                        <div key={course.id}>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-2">{course.name}</span>
                                <span className="font-mono text-slate-500 dark:text-slate-400">{course.progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${course.progress}%` }}
                                    transition={{ duration: 1.5, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                                    className={`h-full rounded-full ${course.color || 'bg-slate-500'}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Editable Timeline / Schedule */}
            <Card 
              title="Today's Schedule" 
              delay={0.8}
              action={
                <div className="flex gap-2">
                   <Button variant="ghost" size="sm" onClick={() => setIsAddingSchedule(!isAddingSchedule)} title="Add Item">
                      <Plus size={16} />
                   </Button>
                   <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={generateSmartSchedule}
                      disabled={isGeneratingSchedule}
                      title="Generate schedule with AI"
                    >
                      <RefreshCw size={16} className={isGeneratingSchedule ? "animate-spin" : ""} />
                    </Button>
                </div>
              }
            >
                 <div className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-6 py-2">
                    <AnimatePresence>
                    {isAddingSchedule && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 pl-6 space-y-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg overflow-hidden"
                      >
                         <div className="flex gap-2">
                            <input className="w-20 px-2 py-1 text-sm border rounded bg-white dark:bg-slate-800 dark:text-white" type="time" value={newScheduleItem.time} onChange={e => setNewScheduleItem({...newScheduleItem, time: e.target.value})} />
                            <input className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-slate-800 dark:text-white" placeholder="Activity" value={newScheduleItem.activity} onChange={e => setNewScheduleItem({...newScheduleItem, activity: e.target.value})} />
                         </div>
                         <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={handleAddSchedule}>Add</Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsAddingSchedule(false)}>Cancel</Button>
                         </div>
                      </motion.div>
                    )}
                    
                    {schedule.length === 0 && !isAddingSchedule && (
                      <p className="text-sm text-slate-400 italic pl-6">No schedule. Add items or generate with AI.</p>
                    )}
                    
                    {schedule.map((item, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative pl-6 group"
                    >
                        <span className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 transition-colors ${
                            item.status === 'current' ? 'bg-primary-500 border-primary-500 shadow-lg shadow-primary-500/40' : 
                            item.status === 'completed' ? 'bg-slate-300 border-slate-300' : 
                            'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                        }`}></span>
                        
                        {editingScheduleIndex === i ? (
                           <div className="flex gap-2 items-center">
                              <input className="w-16 text-xs px-1 border rounded" value={scheduleEditValues.time} onChange={e => setScheduleEditValues({...scheduleEditValues, time: e.target.value})} />
                              <input className="flex-1 text-xs px-1 border rounded" value={scheduleEditValues.activity} onChange={e => setScheduleEditValues({...scheduleEditValues, activity: e.target.value})} />
                              <Button size="sm" onClick={() => saveSchedule(i)}><Save size={12}/></Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingScheduleIndex(null)}><X size={12}/></Button>
                           </div>
                        ) : (
                          <div className="flex justify-between items-start">
                               <div>
                                  <h4 className={`font-medium text-sm ${item.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-white'}`}>
                                      {item.activity}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.type} {item.location && `• ${item.location}`}</p>
                               </div>
                               <div className="flex items-center gap-2">
                                 <span className="font-mono text-xs text-slate-400">{item.time}</span>
                                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEditingSchedule(i, item)} className="text-slate-400 hover:text-primary-500"><Pencil size={12}/></button>
                                    <button onClick={() => deleteScheduleItem(i)} className="text-slate-400 hover:text-red-500"><Trash2 size={12}/></button>
                                 </div>
                               </div>
                          </div>
                        )}
                    </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};