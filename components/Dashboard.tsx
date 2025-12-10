import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, Clock, Zap, ArrowRight, Activity, 
  TrendingUp, Calendar, MoreHorizontal, Award, BookOpen, RefreshCw, Pencil, Trash2, Plus, Save, X, Target
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

  // Calculate stats
  const totalClasses = subjects.reduce((acc, sub) => acc + sub.total, 0);
  const totalAttended = subjects.reduce((acc, sub) => acc + sub.attended, 0);
  const attendancePercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
  const pendingDeadlines = tasks.filter(t => !t.completed).length;

  // Edit States
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskEditValues, setTaskEditValues] = useState<Partial<Task>>({});
  const [editingScheduleIndex, setEditingScheduleIndex] = useState<number | null>(null);
  const [scheduleEditValues, setScheduleEditValues] = useState<Partial<ScheduleItem>>({});
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [newScheduleItem, setNewScheduleItem] = useState<ScheduleItem>({
    time: '09:00', activity: '', type: 'Lecture', status: 'upcoming'
  });

  // Handlers
  const startEditingTask = (task: Task) => { setEditingTaskId(task.id); setTaskEditValues({ ...task }); };
  const saveTask = () => { if (editingTaskId && taskEditValues) { updateTask(editingTaskId, taskEditValues); setEditingTaskId(null); } };
  const startEditingSchedule = (index: number, item: ScheduleItem) => { setEditingScheduleIndex(index); setScheduleEditValues({ ...item }); };
  const saveSchedule = (index: number) => { if (scheduleEditValues) { updateScheduleItem(index, scheduleEditValues as ScheduleItem); setEditingScheduleIndex(null); } };
  const handleAddSchedule = () => { if (newScheduleItem.activity) { addScheduleItem(newScheduleItem); setIsAddingSchedule(false); setNewScheduleItem({ time: '09:00', activity: '', type: 'Lecture', status: 'upcoming' }); } };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
         <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
               Overview for <span className="font-semibold text-primary-600 dark:text-primary-400">{user?.name}</span>
            </p>
         </div>
         <div className="flex gap-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm flex items-center gap-2">
               <Calendar size={16} className="text-primary-500" />
               {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
         </div>
      </div>

      {/* KPI Grid - Structured Geometry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <Card noPadding className="relative overflow-hidden group">
            <div className="p-5 flex flex-col h-full justify-between">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{attendancePercentage}%</h3>
                  </div>
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                     <Target size={20} />
                  </div>
               </div>
               <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600" style={{ width: `${attendancePercentage}%` }}></div>
               </div>
            </div>
         </Card>

         <Card noPadding className="relative overflow-hidden group">
            <div className="p-5 flex flex-col h-full justify-between">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">CGPA</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">8.4</h3>
                  </div>
                  <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-teal-600 dark:text-teal-400">
                     <Award size={20} />
                  </div>
               </div>
               <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-4 flex items-center gap-1">
                  <TrendingUp size={12} /> Top 15% of class
               </p>
            </div>
         </Card>

         <Card noPadding className="relative overflow-hidden group">
            <div className="p-5 flex flex-col h-full justify-between">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deadlines</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{pendingDeadlines}</h3>
                  </div>
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                     <Clock size={20} />
                  </div>
               </div>
               <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-4">
                  Pending tasks
               </p>
            </div>
         </Card>

         <Card noPadding className="relative overflow-hidden group">
            <div className="p-5 flex flex-col h-full justify-between">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Study Streak</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">12 <span className="text-sm font-normal text-slate-500">days</span></h3>
                  </div>
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                     <Zap size={20} />
                  </div>
               </div>
               <div className="flex gap-1 mt-4">
                  {[1,1,1,1,0].map((v,i) => (
                     <div key={i} className={`h-1.5 w-full rounded-full ${v ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                  ))}
               </div>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Chart Area */}
         <div className="lg:col-span-2 space-y-6">
            <Card title="Productivity Analytics" className="min-h-[300px]">
               <div className="h-[250px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={WEEKLY_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                           <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip 
                           contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                           cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area type="monotone" dataKey="hours" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </Card>

            <Card title="Priority Tasks" action={<Button variant="ghost" size="sm">Add New</Button>}>
               <div className="space-y-3">
                  {tasks.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No tasks pending.</p>}
                  {tasks.map(task => (
                     <motion.div 
                        layout
                        key={task.id} 
                        className={`group flex items-center p-3 rounded-lg border transition-all ${
                           task.completed 
                           ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-60' 
                           : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700'
                        }`}
                     >
                        {editingTaskId === task.id ? (
                           <div className="flex-1 flex gap-2 items-center">
                              <input className="flex-1 px-2 py-1 text-sm border rounded bg-slate-50 dark:bg-slate-900 dark:text-white" value={taskEditValues.title} onChange={(e) => setTaskEditValues({...taskEditValues, title: e.target.value})} />
                              <Button size="sm" onClick={saveTask}><Save size={14}/></Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingTaskId(null)}><X size={14}/></Button>
                           </div>
                        ) : (
                           <>
                              <button 
                                 onClick={() => toggleTaskCompletion(task.id)}
                                 className={`mr-3 transition-colors ${task.completed ? 'text-primary-500' : 'text-slate-300 hover:text-primary-500'}`}
                              >
                                 <CheckCircle size={20} fill={task.completed ? "currentColor" : "none"} />
                              </button>
                              
                              <div className="flex-1 cursor-pointer" onClick={() => startEditingTask(task)}>
                                 <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-white'}`}>
                                    {task.title}
                                 </p>
                                 <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                       task.priority === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                       task.priority === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                       'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                    }`}>
                                       {task.priority}
                                    </span>
                                    <span className="text-xs text-slate-400">{task.deadline}</span>
                                 </div>
                              </div>
                              <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                                 <Trash2 size={16} />
                              </button>
                           </>
                        )}
                     </motion.div>
                  ))}
               </div>
            </Card>
         </div>

         {/* Sidebar Area */}
         <div className="space-y-6">
             <Card 
               title="Today's Schedule" 
               action={
                  <div className="flex gap-1">
                     <button onClick={() => setIsAddingSchedule(!isAddingSchedule)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Plus size={16}/></button>
                     <button onClick={generateSmartSchedule} className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded ${isGeneratingSchedule ? 'animate-spin' : ''}`}><RefreshCw size={16}/></button>
                  </div>
               }
            >
               <div className="space-y-4">
                  {isAddingSchedule && (
                     <div className="flex gap-2 mb-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <input className="w-16 text-xs p-1 rounded border" type="time" value={newScheduleItem.time} onChange={e => setNewScheduleItem({...newScheduleItem, time: e.target.value})} />
                        <input className="flex-1 text-xs p-1 rounded border" placeholder="Activity" value={newScheduleItem.activity} onChange={e => setNewScheduleItem({...newScheduleItem, activity: e.target.value})} />
                        <button onClick={handleAddSchedule} className="text-primary-600"><Save size={14}/></button>
                     </div>
                  )}
                  {schedule.length === 0 && <div className="text-center text-slate-400 text-xs py-4">No classes today.</div>}
                  <div className="relative pl-4 border-l border-slate-200 dark:border-slate-800 space-y-6">
                     {schedule.map((item, i) => (
                        <div key={i} className="relative">
                           <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
                              item.status === 'current' ? 'bg-primary-500 border-primary-500 ring-4 ring-primary-100 dark:ring-primary-900/20' : 
                              item.status === 'completed' ? 'bg-slate-300 border-slate-300' : 'bg-white border-primary-500'
                           }`}></div>
                           <div>
                              <p className="text-xs font-mono text-slate-500 mb-0.5">{item.time}</p>
                              <h4 className="text-sm font-medium text-slate-800 dark:text-white">{item.activity}</h4>
                              <p className="text-xs text-slate-400">{item.type} • {item.location}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </Card>

            <Card title="Course Progress">
               <div className="space-y-4">
                  {subjects.slice(0, 3).map(sub => (
                     <div key={sub.id}>
                        <div className="flex justify-between text-xs mb-1.5">
                           <span className="font-medium text-slate-700 dark:text-slate-300 truncate w-32">{sub.name}</span>
                           <span className="text-slate-500">{sub.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <div className={`h-full rounded-full ${sub.color || 'bg-slate-500'}`} style={{ width: `${sub.progress}%` }}></div>
                        </div>
                     </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => {}}>View All Courses</Button>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
};