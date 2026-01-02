
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Subject, Task, ScheduleItem, Reminder, AppNotification, Habit, User, Achievement, Note, SavingsGoal, DashboardWidget, Expense } from '../types';
import { generateStudyPlan } from '../services/gemini';
import { api } from '../services/api';

interface AppContextType {
  user: User | null;
  setUser: (user: any) => void;
  isLoading: boolean; // Auth loading
  isDataLoading: boolean; // Data fetching loading
  updateUserProfile: (updates: Partial<User>) => void;
  subjects: Subject[];
  addSubject: (name: string, target: number, attended?: number, total?: number) => void;
  updateAttendance: (id: string, present: boolean) => void;
  updateSubjectStats: (id: string, attended: number, total: number) => void;
  deleteSubject: (id: string) => void;
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  cycleTaskPriority: (id: string) => void;
  schedule: ScheduleItem[];
  addScheduleItem: (item: ScheduleItem) => void;
  updateScheduleItem: (index: number, item: ScheduleItem) => void;
  deleteScheduleItem: (index: number) => void;
  generateSmartSchedule: () => Promise<void>;
  isGeneratingSchedule: boolean;
  reminders: Reminder[];
  addReminder: (time: string, label: string) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  budgetLimit: number;
  setBudgetLimit: (limit: number) => void;
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  habits: Habit[];
  addHabit: (name: string) => void;
  toggleHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: SavingsGoal) => void;
  updateSavingsGoal: (id: string, amount: number) => void;
  deleteSavingsGoal: (id: string) => void;
  notes: Note[];
  addNote: (title: string, content: string) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  awardXP: (amount: number) => void;
  // Widget State
  dashboardWidgets: DashboardWidget[];
  updateDashboardWidgets: (widgets: DashboardWidget[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'stats_overview', label: 'Stats Overview', enabled: true },
  { id: 'tasks', label: 'Upcoming Deadlines', enabled: true },
  { id: 'schedule', label: 'Today\'s Schedule', enabled: true },
  { id: 'productivity', label: 'Task Priority Chart', enabled: true },
  { id: 'attendance_detail', label: 'Course Progress', enabled: true },
  { id: 'quick_notes', label: 'Quick Notes', enabled: false },
  { id: 'ai_assistant', label: 'AI Assistant', enabled: false },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true); // Auth loading
  const [isDataLoading, setIsDataLoading] = useState(false); // Content loading
  const [user, setUserState] = useState<User | null>(null);

  // Data States
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // Dashboard Widget State
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  
  // Local Only States (Non-Persistent for now or simple localstorage)
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [budgetLimit, setBudgetLimitState] = useState(5000);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  // --- Initialization & Data Fetching ---
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      
      // Load widgets
      const storedWidgets = localStorage.getItem('engiLife_widgets');
      if (storedWidgets) {
          try {
             const parsed = JSON.parse(storedWidgets);
             if (Array.isArray(parsed)) setDashboardWidgets(parsed);
          } catch(e) {
             console.warn("Failed to parse stored widgets, using defaults.");
          }
      }

      if (token) {
         try {
             // Verify session with backend to get FRESH user data
             const freshUser = await api.auth.verifySession();
             setUserState(freshUser);
             
             // Sync budget limit from user profile if exists
             if (freshUser.preferences?.budgetLimit) {
                 setBudgetLimitState(freshUser.preferences.budgetLimit);
             }
             
             // Auth success, stop blocking UI
             setIsLoading(false); 

             // Now fetch data
             setIsDataLoading(true);
             await loadAllData();
             setIsDataLoading(false);

         } catch(e) {
             console.error("Session verification failed", e);
             api.auth.logout();
             setUserState(null);
             setIsLoading(false);
         }
      } else {
          setIsLoading(false);
      }
    };
    initApp();
  }, []);

  const loadAllData = async () => {
     try {
         const [fetchedTasks, fetchedSubjects, fetchedSchedule, fetchedNotes, fetchedHabits, fetchedGoals, fetchedExpenses] = await Promise.all([
             api.tasks.list(),
             api.subjects.list(),
             api.schedule.list(),
             api.notes.list(),
             api.habits.list(),
             api.savingsGoals.list(),
             api.expenses.list()
         ]);

         setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
         setSubjects(Array.isArray(fetchedSubjects) ? fetchedSubjects : []);
         setSchedule(Array.isArray(fetchedSchedule) ? fetchedSchedule : []);
         setNotes(Array.isArray(fetchedNotes) ? fetchedNotes : []);
         setHabits(Array.isArray(fetchedHabits) ? fetchedHabits : []);
         setSavingsGoals(Array.isArray(fetchedGoals) ? fetchedGoals : []);
         setExpenses(Array.isArray(fetchedExpenses) ? fetchedExpenses : []);

     } catch (e) {
         console.error("Failed to fetch data:", e);
         // Fallback to empty arrays in case of total failure
         setTasks([]); setSubjects([]); setSchedule([]); setNotes([]); setHabits([]); setSavingsGoals([]); setExpenses([]);
     }
  };

  const setUser = (userData: any) => {
    if (!userData) {
      setUserState(null);
      api.auth.logout();
      setTasks([]); setSubjects([]); setSchedule([]); setNotes([]); setExpenses([]);
      return;
    }
    setUserState(userData);
    
    // Set budget limit if present in new user data
    if (userData.preferences?.budgetLimit) {
        setBudgetLimitState(userData.preferences.budgetLimit);
    } else {
        setBudgetLimitState(5000); // Default if not set
    }

    localStorage.setItem('engiLife_user', JSON.stringify(userData));
    // Trigger data load on login
    setIsDataLoading(true);
    loadAllData().finally(() => setIsDataLoading(false));
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return;
    try {
        const updatedUser = await api.auth.updateProfile(updates);
        setUserState(updatedUser);
    } catch (e) {
        console.error(e);
    }
  };
  
  const updateDashboardWidgets = (widgets: DashboardWidget[]) => {
      setDashboardWidgets(widgets);
      localStorage.setItem('engiLife_widgets', JSON.stringify(widgets));
  };

  const awardXP = async (amount: number) => {
    if (!user) return;
    const newXP = user.xp + amount;
    const newLevel = Math.floor(newXP / 1000) + 1;
    
    if (newLevel > user.level) {
      setNotifications(prev => [{
        id: Date.now().toString(), title: 'Level Up!', message: `Congratulations! You reached Level ${newLevel}`, timestamp: Date.now(), read: false, type: 'success'
      }, ...prev]);
    }
    await updateUserProfile({ xp: newXP, level: newLevel });
  };

  // --- CRUD Functions ---
  const addSubject = async (name: string, target: number, attended: number = 0, total: number = 0) => {
    try {
        const newSubject = { id: Date.now().toString(), name, attended, total, minPercent: target, progress: 0, color: 'bg-slate-500' };
        const saved = await api.subjects.create(newSubject);
        setSubjects(prev => [...prev, saved]);
    } catch(e) { console.error(e); }
  };
  const updateAttendance = async (id: string, present: boolean) => {
    const subject = subjects.find(s => s.id === id);
    if (!subject) return;
    try {
        const updates = { attended: present ? subject.attended + 1 : subject.attended, total: subject.total + 1 };
        const updated = await api.subjects.update(id, updates);
        setSubjects(prev => prev.map(s => s.id === id ? updated : s));
        if (present) awardXP(10);
    } catch(e) { console.error(e); }
  };
  const updateSubjectStats = async (id: string, attended: number, total: number) => {
    try {
        const updated = await api.subjects.update(id, { attended, total });
        setSubjects(prev => prev.map(s => s.id === id ? updated : s));
    } catch(e) { console.error(e); }
  };
  const deleteSubject = async (id: string) => {
    try {
        await api.subjects.delete(id);
        setSubjects(prev => prev.filter(s => s.id !== id));
    } catch(e) { console.error(e); }
  };
  const addTask = async (task: Task) => {
    try {
        const saved = await api.tasks.create(task);
        setTasks(prev => [...prev, saved]);
    } catch(e) { console.error(e); }
  };
  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
        const updated = await api.tasks.update(id, updates);
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch(e) { console.error(e); }
  };
  const deleteTask = async (id: string) => {
    try {
        await api.tasks.delete(id);
        setTasks(prev => prev.filter(t => t.id !== id));
    } catch(e) { console.error(e); }
  };
  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if(!task) return;
    try {
        const updated = await api.tasks.update(id, { completed: !task.completed });
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
        if (!task.completed) awardXP(50);
    } catch(e) { console.error(e); }
  };
  const cycleTaskPriority = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if(!task) return;
    const priorities: Task['priority'][] = ['Low', 'Medium', 'High'];
    const nextPriority = priorities[(priorities.indexOf(task.priority) + 1) % 3];
    try {
        const updated = await api.tasks.update(id, { priority: nextPriority });
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch(e) { console.error(e); }
  };
  const addScheduleItem = async (item: ScheduleItem) => {
    try {
        const itemWithId = { ...item, id: item.id || Date.now().toString() };
        const saved = await api.schedule.create(itemWithId);
        setSchedule(prev => [...prev, saved].sort((a, b) => a.time.localeCompare(b.time)));
    } catch(e) { console.error(e); }
  };
  const updateScheduleItem = async (index: number, item: ScheduleItem) => {
      if (!item.id) return; 
      try {
          const updated = await api.schedule.update(item.id, item);
          setSchedule(prev => {
              const newSchedule = [...prev];
              newSchedule[index] = updated;
              return newSchedule.sort((a, b) => a.time.localeCompare(b.time));
          });
      } catch(e) { console.error(e); }
  };
  const deleteScheduleItem = async (index: number) => {
      const item = schedule[index];
      if (!item.id) return;
      try {
          await api.schedule.delete(item.id);
          setSchedule(prev => prev.filter((_, i) => i !== index));
      } catch(e) { console.error(e); }
  };
  const generateSmartSchedule = async () => {
    setIsGeneratingSchedule(true);
    try {
        const aiSchedule = await generateStudyPlan(subjects.map(s => s.name), tasks.filter(t => !t.completed).map(t => t.title), 8);
        if (aiSchedule?.length) {
            const newItems = [];
            for (const item of aiSchedule) {
                const saved = await api.schedule.create({ ...item, id: Date.now().toString() + Math.random() });
                newItems.push(saved);
            }
            setSchedule(prev => [...prev, ...newItems].sort((a,b) => a.time.localeCompare(b.time)));
        }
    } catch(e) { console.error(e); }
    setIsGeneratingSchedule(false);
  };
  const addNote = async (title: string, content: string) => {
      try {
          const newNote = { id: Date.now().toString(), title: title || 'Untitled', content, lastModified: new Date().toLocaleDateString(), tags: [], flashcards: [] };
          const saved = await api.notes.create(newNote);
          setNotes(prev => [saved, ...prev]);
      } catch(e) { console.error(e); }
  };
  const updateNote = async (id: string, updates: Partial<Note>) => {
      try {
          const updated = await api.notes.update(id, { ...updates, lastModified: new Date().toLocaleDateString() });
          setNotes(prev => prev.map(n => n.id === id ? updated : n));
      } catch(e) { console.error(e); }
  };
  const deleteNote = async (id: string) => {
      try {
          await api.notes.delete(id);
          setNotes(prev => prev.filter(n => n.id !== id));
      } catch(e) { console.error(e); }
  };
  const addHabit = async (name: string) => {
      try {
          const newHabit = { id: Date.now().toString(), name, streak: 0, completedToday: false };
          const saved = await api.habits.create(newHabit);
          setHabits(prev => [...prev, saved]);
      } catch(e) { console.error(e); }
  };
  const toggleHabit = async (id: string) => {
      const habit = habits.find(h => h.id === id);
      if(!habit) return;
      const today = new Date().toDateString();
      try {
          const updates = { 
              completedToday: !habit.completedToday,
              streak: !habit.completedToday ? habit.streak + 1 : habit.streak,
              lastCompletedDate: !habit.completedToday ? today : habit.lastCompletedDate
          };
          const updated = await api.habits.update(id, updates);
          setHabits(prev => prev.map(h => h.id === id ? updated : h));
          if (!habit.completedToday) awardXP(25);
      } catch(e) { console.error(e); }
  };
  const deleteHabit = async (id: string) => {
      try {
          await api.habits.delete(id);
          setHabits(prev => prev.filter(h => h.id !== id));
      } catch(e) { console.error(e); }
  };
  const addSavingsGoal = async (goal: SavingsGoal) => {
      try {
          const saved = await api.savingsGoals.create(goal);
          setSavingsGoals(prev => [...prev, saved]);
      } catch(e) { console.error(e); }
  };
  const updateSavingsGoal = async (id: string, amount: number) => {
      try {
          const updated = await api.savingsGoals.update(id, { currentAmount: amount });
          setSavingsGoals(prev => prev.map(g => g.id === id ? updated : g));
      } catch(e) { console.error(e); }
  };
  const deleteSavingsGoal = async (id: string) => {
      try {
          await api.savingsGoals.delete(id);
          setSavingsGoals(prev => prev.filter(g => g.id !== id));
      } catch(e) { console.error(e); }
  };
  const addExpense = async (expense: Expense) => {
      try {
          const saved = await api.expenses.create(expense);
          setExpenses(prev => [...prev, saved]);
      } catch(e) { console.error(e); }
  };
  const deleteExpense = async (id: string) => {
      try {
          await api.expenses.delete(id);
          setExpenses(prev => prev.filter(e => e.id !== id));
      } catch(e) { console.error(e); }
  };

  const addReminder = (time: string, label: string) => setReminders(prev => [...prev, { id: Date.now().toString(), time, label, enabled: true }]);
  const deleteReminder = (id: string) => setReminders(prev => prev.filter(r => r.id !== id));
  const toggleReminder = (id: string) => setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const clearNotifications = () => setNotifications([]);

  useEffect(() => {
    const timer = setInterval(() => {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        const todayDate = now.toDateString();
        
        setReminders(prevReminders => {
            let hasUpdates = false;
            const updated = prevReminders.map(r => {
                if (r.enabled && r.time === currentTime && r.lastTriggered !== todayDate) {
                    setNotifications(prev => [{ id: Date.now().toString(), title: 'Reminder', message: r.label, timestamp: Date.now(), read: false, type: 'reminder' }, ...prev]);
                    hasUpdates = true;
                    return { ...r, lastTriggered: todayDate };
                }
                return r;
            });
            return hasUpdates ? updated : prevReminders;
        });
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const setBudgetLimit = (limit: number) => {
      setBudgetLimitState(limit);
      // Persist to user profile
      if (user) {
          updateUserProfile({
              preferences: {
                  ...user.preferences,
                  budgetLimit: limit
              }
          });
      }
  };

  return (
    <AppContext.Provider value={{
      user, setUser, updateUserProfile, isLoading, isDataLoading,
      subjects, addSubject, updateAttendance, updateSubjectStats, deleteSubject,
      tasks, addTask, updateTask, deleteTask, toggleTaskCompletion, cycleTaskPriority,
      schedule, addScheduleItem, updateScheduleItem, deleteScheduleItem, generateSmartSchedule, isGeneratingSchedule,
      reminders, addReminder, deleteReminder, toggleReminder,
      notifications, markNotificationRead, clearNotifications,
      budgetLimit, setBudgetLimit, habits, addHabit, toggleHabit, deleteHabit,
      savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
      expenses, addExpense, deleteExpense,
      notes, addNote, updateNote, deleteNote, awardXP,
      dashboardWidgets, updateDashboardWidgets
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
