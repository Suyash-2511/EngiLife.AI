
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, Clock, Zap, Activity, TrendingUp, Calendar, Award, 
  ListTodo, AlertCircle, Settings2, Sparkles, Send, RefreshCw, Sun, Moon, Cloud, 
  Book, GripVertical, Code, Brain, Target, Quote, ChevronRight, ArrowUpRight, Check,
  PenLine, Trash2, Flag, Plus, GraduationCap, User, Briefcase, Layers, MoreHorizontal
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Radar, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, Tooltip, YAxis, CartesianGrid, XAxis
} from 'recharts';
import { Card } from './Shared/Card';
import { Skeleton } from './Shared/Skeleton';
import { useAppContext } from '../context/AppContext';
import { WidgetId, Task } from '../types';
import { explainConcept } from '../services/gemini';

// --- Types & Constants ---

const QUOTES = [
    { text: "Scientists investigate that which already is; Engineers create that which has never been.", author: "Albert Einstein" },
    { text: "The way to succeed is to double your failure rate.", author: "Thomas J. Watson" },
    { text: "Strive for perfection in everything you do.", author: "Henry Royce" },
    { text: "Engineering is the closest thing to magic that exists in the world.", author: "Elon Musk" },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

// --- Helper Components ---

const MetricCard = ({ title, value, subtext, icon, trend, color, delay, isLoading }: any) => (
    <motion.div 
        variants={itemVariants}
        whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
        className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 ${isLoading ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' : 'bg-white dark:bg-slate-900/60 backdrop-blur-xl border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md'}`}
    >
        {isLoading ? (
            <div className="flex flex-col h-full justify-between relative z-10">
                <div className="space-y-2">
                    <Skeleton className="w-1/2 h-3" />
                    <Skeleton className="w-3/4 h-8" />
                </div>
                <div className="mt-4 flex justify-between">
                    <Skeleton className="w-1/3 h-3" />
                    <Skeleton className="w-1/4 h-5 rounded-full" />
                </div>
            </div>
        ) : (
            <>
                <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}>
                    {icon}
                </div>
                <div className="flex flex-col h-full justify-between relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
                            {trend && (
                                <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                    <TrendingUp size={10} className="mr-1" /> {trend}
                                </span>
                            )}
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
                    </div>
                    <div className="mt-4">
                        <p className={`text-xs font-medium flex items-center gap-1.5 ${color.replace('text-', 'text-opacity-80 text-')}`}>
                            {subtext}
                        </p>
                    </div>
                </div>
                {/* Decorative Gradient Blob */}
                <div className={`absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br ${color.replace('text-', 'from-').replace('500', '500/10')} to-transparent rounded-full blur-2xl pointer-events-none`}></div>
            </>
        )}
    </motion.div>
);

// --- Widgets ---

const GreetingWidget = () => {
    const { user } = useAppContext();
    const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const hour = time.getHours();
    let greeting = "Welcome back";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    return (
        <motion.div variants={itemVariants} className="col-span-full mb-2">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 p-1">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                        {greeting}, <br className="md:hidden"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500">{user?.name.split(' ')[0]}</span>
                        <span className="text-3xl">.</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400 text-sm max-w-xl">
                        <Quote size={14} className="rotate-180 shrink-0 text-primary-400" />
                        <p className="italic font-medium line-clamp-1">{quote.text}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900/50 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm self-start md:self-auto">
                    <div className="text-right">
                        <p className="text-xl font-mono font-bold text-slate-800 dark:text-white leading-none">
                            {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                            {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="text-primary-500">
                        {hour > 6 && hour < 18 ? <Sun size={24} /> : <Moon size={24} />}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const AcademicRadarWidget = () => {
    const { subjects, isDataLoading } = useAppContext();
    
    const data = subjects.map(s => ({
        subject: s.name.substring(0, 3).toUpperCase(),
        fullSubject: s.name,
        attendance: s.total > 0 ? (s.attended / s.total) * 100 : 0,
        target: s.minPercent,
        mastery: 60 + Math.random() * 30 
    }));

    // Pad data to ensure triangle shape at minimum
    if (data.length < 3) {
        while(data.length < 3) {
            data.push({ subject: `S${data.length+1}`, fullSubject: 'Placeholder', attendance: 0, target: 75, mastery: 50 });
        }
    }

    return (
        <Card title="Performance Radar" className="h-full min-h-[320px]" noPadding>
            {isDataLoading ? (
                <div className="h-64 w-full flex items-center justify-center p-8">
                    <Skeleton variant="circular" className="w-48 h-48" />
                </div>
            ) : (
                <div className="h-[280px] w-full relative mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                            <PolarGrid stroke="#94a3b8" strokeOpacity={0.15} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Attendance"
                                dataKey="attendance"
                                stroke="#f97316"
                                strokeWidth={2}
                                fill="#f97316"
                                fillOpacity={0.2}
                            />
                            <Radar
                                name="Mastery"
                                dataKey="mastery"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fill="#6366f1"
                                fillOpacity={0.2}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }}
                                itemStyle={{ fontSize: '12px' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-4 w-full flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <div className="w-2 h-2 rounded-full bg-primary-500"></div> Attendance
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Mastery
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

const FocusTimelineWidget = () => {
    const { schedule, generateSmartSchedule, isGeneratingSchedule, isDataLoading } = useAppContext();
    const todaySchedule = schedule.slice(0, 8); // Increased limit as we have more space

    return (
        <Card 
            title="Today's Circuit" 
            className="h-full flex flex-col" 
            action={
                <motion.button
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                    onClick={generateSmartSchedule}
                    disabled={isGeneratingSchedule || isDataLoading}
                    className="p-2 -mr-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-primary-600 dark:text-primary-400 transition-colors"
                    title="Generate AI Schedule"
                >
                    {isGeneratingSchedule ? <RefreshCw size={16} className="animate-spin"/> : <Sparkles size={16}/>}
                </motion.button>
            }
        >
            <div className="flex-1 relative pl-6 space-y-0 py-2 overflow-y-auto custom-scrollbar">
                {/* Vertical Line */}
                <div className="absolute left-[35px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-slate-200 via-primary-200 to-slate-200 dark:from-slate-800 dark:via-primary-900/50 dark:to-slate-800 rounded-full"></div>
                
                {isDataLoading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4 items-center pl-2">
                                <Skeleton className="w-12 h-4" />
                                <Skeleton className="flex-1 h-12 rounded-xl" />
                            </div>
                        ))}
                    </div>
                ) : todaySchedule.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-4 py-8">
                        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                            <Calendar size={20} className="opacity-50" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium text-slate-600 dark:text-slate-300">Nothing scheduled.</p>
                            <p className="text-xs opacity-70 mt-1">Enjoy your free time!</p>
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={generateSmartSchedule}
                            disabled={isGeneratingSchedule}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-lg text-xs font-bold hover:shadow-lg shadow-primary-500/20 transition-all"
                        >
                            {isGeneratingSchedule ? <RefreshCw size={14} className="animate-spin"/> : <Sparkles size={14}/>}
                            Auto-Plan Day
                        </motion.button>
                    </div>
                ) : (
                    todaySchedule.map((item, i) => {
                        const isCurrent = item.status === 'current';
                        return (
                            <div key={i} className={`relative pl-8 py-3 group ${isCurrent ? 'opacity-100' : 'opacity-70 hover:opacity-100'} transition-opacity`}>
                                {/* Node Dot */}
                                <div className={`absolute left-[29px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-[3px] z-10 transition-all ${
                                    isCurrent 
                                    ? 'bg-primary-600 border-white dark:border-slate-900 ring-4 ring-primary-500/20 scale-110' 
                                    : 'bg-slate-200 dark:bg-slate-800 border-white dark:border-slate-950'
                                }`}></div>
                                
                                <div className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                                    isCurrent 
                                    ? 'bg-white dark:bg-slate-800/80 border-primary-200 dark:border-primary-900 shadow-md shadow-primary-500/5' 
                                    : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50'
                                }`}>
                                    <div className="w-12 text-right shrink-0">
                                        <span className={`text-xs font-bold font-mono ${isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`}>
                                            {item.time}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-bold truncate ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {item.activity}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 rounded-md">
                                                {item.type}
                                            </span>
                                            {item.location && (
                                                <span className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                                                    • {item.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </Card>
    );
};

const StudyHeatmapWidget = () => {
    const data = [
        { day: 'Mon', hours: 2.5 },
        { day: 'Tue', hours: 4.2 },
        { day: 'Wed', hours: 1.5 },
        { day: 'Thu', hours: 5.0 },
        { day: 'Fri', hours: 3.8 },
        { day: 'Sat', hours: 6.5 },
        { day: 'Sun', hours: 2.0 },
    ];

    return (
        <Card title="Study Hours" className="h-full">
            <div className="h-28 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip 
                            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff', fontSize: '12px' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="hours" 
                            stroke="#8b5cf6" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorHours)" 
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold mt-1 px-2">
                <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
            </div>
        </Card>
    );
};

const AIAssistantMiniWidget = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAppContext();

    const handleAsk = async () => {
        if (!query.trim()) return;
        setLoading(true);
        const res = await explainConcept(query, user?.branch || 'General');
        setResponse(res);
        setLoading(false);
    };

    return (
        <Card className="h-full bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-0 shadow-lg relative overflow-hidden group" noPadding>
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/30 transition-colors duration-500"></div>
            
            <div className="p-5 flex flex-col h-full relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-indigo-500/20 rounded-lg backdrop-blur-md border border-indigo-500/30">
                        <Sparkles size={16} className="text-indigo-300" />
                    </div>
                    <h3 className="font-bold text-sm tracking-wide">AI Tutor</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto mb-3 min-h-[80px] text-sm text-indigo-100/80 custom-scrollbar pr-2">
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="w-full h-2 bg-white/10" />
                            <Skeleton className="w-3/4 h-2 bg-white/10" />
                            <Skeleton className="w-5/6 h-2 bg-white/10" />
                        </div>
                    ) : response ? (
                        <p className="leading-relaxed text-xs">{response.substring(0, 150)}{response.length > 150 ? '...' : ''}</p>
                    ) : (
                        <p className="opacity-50 italic text-xs">Ask me about {user?.branch || 'engineering'} concepts...</p>
                    )}
                </div>

                <div className="relative group/input">
                    <input 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                        placeholder="Type query..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs placeholder:text-indigo-200/30 outline-none focus:bg-black/40 focus:border-indigo-500/50 transition-all text-white pr-10"
                    />
                    <button 
                        onClick={handleAsk}
                        disabled={loading || !query}
                        className="absolute right-2 top-2 p-1 text-indigo-300 hover:text-white transition-colors disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={14}/> : <Send size={14}/>}
                    </button>
                </div>
            </div>
        </Card>
    );
};

const QuickMemoWidget = () => {
    const [note, setNote] = useState(() => localStorage.getItem('engiLife_quick_memo') || '');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setNote(val);
        localStorage.setItem('engiLife_quick_memo', val);
    };

    return (
        <Card title="Scratchpad" className="h-full flex flex-col" action={<div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.6)]"></div>}>
            <div className="flex-1 mt-2 relative group h-full">
                <textarea 
                    value={note}
                    onChange={handleChange}
                    placeholder="// Jot down quick ideas..."
                    className="w-full h-full resize-none bg-yellow-50/50 dark:bg-yellow-950/20 border-l-2 border-yellow-200 dark:border-yellow-900 p-4 text-sm text-slate-700 dark:text-yellow-100/90 placeholder:text-slate-400/50 focus:outline-none font-mono leading-relaxed custom-scrollbar"
                />
                <div className="absolute bottom-4 right-4 text-yellow-400/50 pointer-events-none">
                    <PenLine size={16} />
                </div>
            </div>
        </Card>
    );
}

export const Dashboard: React.FC = () => {
  const { subjects, user, isDataLoading } = useAppContext();
  
  // Calculate top-level metrics
  const totalClasses = subjects.reduce((acc, sub) => acc + sub.total, 0);
  const totalAttended = subjects.reduce((acc, sub) => acc + sub.attended, 0);
  const attendancePct = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  return (
    <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 pb-12"
    >
       <GreetingWidget />

       {/* Top Metrics Row - Modern Bento Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           <MetricCard 
              title="Attendance" 
              value={`${attendancePct}%`} 
              subtext={attendancePct >= 75 ? "Safe Zone" : "Warning: Low"}
              icon={<Activity size={24}/>}
              trend={attendancePct >= 75 ? "Good" : "Risk"}
              color="text-emerald-500"
              isLoading={isDataLoading}
           />
           <MetricCard 
              title="CGPA" 
              value={user?.cgpa || '0.0'}
              subtext="Current Sem"
              icon={<Award size={24}/>}
              color="text-indigo-500"
              isLoading={isDataLoading}
           />
           <MetricCard 
              title="Streak" 
              value={`${user?.streak || 0}`}
              subtext="Days Active"
              icon={<Zap size={24}/>}
              color="text-blue-500"
              isLoading={isDataLoading}
           />
       </div>

       {/* Main Layout Grid - Mobile Stacked, Desktop Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Academics */}
          <div className="lg:col-span-4 flex flex-col gap-6">
              <AcademicRadarWidget />
              <div className="h-64">
                  <StudyHeatmapWidget />
              </div>
          </div>

          {/* Middle Column: Productivity - Expanded Focus Timeline */}
          <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="h-[450px] lg:h-full lg:min-h-[450px]">
                  <FocusTimelineWidget />
              </div>
          </div>

          {/* Right Column: Tools */}
          <div className="lg:col-span-3 flex flex-col gap-6">
              <div className="h-72">
                  <AIAssistantMiniWidget />
              </div>
              <div className="flex-1 min-h-[250px]">
                  <QuickMemoWidget />
              </div>
          </div>
       </div>
    </motion.div>
  );
};
