import React, { createContext, useContext, useState, useEffect } from 'react';
import { Subject, Task, ScheduleItem, Reminder, AppNotification, Habit, User, Achievement, Note, Flashcard } from '../types';
import { generateStudyPlan } from '../services/gemini';

interface AppContextType {
  user: User | null;
  setUser: (user: any) => void;
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
  // Life & Wallet
  budgetLimit: number;
  setBudgetLimit: (limit: number) => void;
  habits: Habit[];
  addHabit: (name: string) => void;
  toggleHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  // Vault
  notes: Note[];
  addNote: (title: string, content: string) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  awardXP: (amount: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'Task Slayer', description: 'Complete 10 tasks', icon: 'CheckCircle', unlocked: false },
  { id: '2', title: 'Perfect Week', description: 'Maintain 100% attendance for a week', icon: 'Calendar', unlocked: false },
  { id: '3', title: 'Night Owl', description: 'Complete a study session after 10 PM', icon: 'Moon', unlocked: true, dateUnlocked: '2023-10-15' },
  { id: '4', title: 'Big Spender', description: 'Track an expense over ₹1000', icon: 'Wallet', unlocked: false },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User State
  const [user, setUserState] = useState<User | null>(null);

  // Wrapper to handle raw user object from login and ensure structure
  const setUser = (userData: any) => {
    if (!userData) {
      setUserState(null);
      return;
    }
    // Merge with default gamification structure if missing
    setUserState({
      name: userData.name,
      email: userData.email,
      university: userData.university || 'Tech Institute',
      branch: userData.branch || 'Computer Science',
      semester: userData.semester || 1,
      xp: userData.xp || 0,
      level: userData.level || 1,
      achievements: userData.achievements || INITIAL_ACHIEVEMENTS,
      bio: userData.bio || 'Engineering student trying to survive.',
    });
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    setUserState({ ...user, ...updates });
  };

  const awardXP = (amount: number) => {
    if (!user) return;
    const newXP = user.xp + amount;
    const newLevel = Math.floor(newXP / 1000) + 1;
    
    // Check level up
    if (newLevel > user.level) {
      setNotifications(prev => [{
        id: Date.now().toString(),
        title: 'Level Up!',
        message: `Congratulations! You reached Level ${newLevel}`,
        timestamp: Date.now(),
        read: false,
        type: 'success'
      }, ...prev]);
    }

    setUserState({ ...user, xp: newXP, level: newLevel });
  };

  // Subjects State (Attendance)
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Data Structures', attended: 24, total: 28, minPercent: 75, progress: 70, color: 'bg-primary-500' },
    { id: '2', name: 'Thermodynamics', attended: 12, total: 18, minPercent: 75, progress: 45, color: 'bg-amber-500' },
    { id: '3', name: 'Eng. Mathematics III', attended: 38, total: 40, minPercent: 80, progress: 85, color: 'bg-emerald-500' },
    { id: '4', name: 'Digital Logic', attended: 15, total: 15, minPercent: 75, progress: 55, color: 'bg-blue-500' },
  ]);

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Fluid Mechanics Assignment', priority: 'High', deadline: 'Today, 17:00', completed: false, category: 'Academic' },
    { id: '2', title: 'Placement Mock Test', priority: 'Medium', deadline: 'Tomorrow', completed: false, category: 'Placement' },
    { id: '3', title: 'Hostel Mess Fee', priority: 'High', deadline: 'Fri, Oct 24', completed: false, category: 'Personal' },
  ]);

  // Schedule State
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { time: '09:00', activity: 'Data Structures', type: 'Lecture', location: '304', status: 'completed' },
    { time: '11:00', activity: 'Physics Lab', type: 'Lab', location: 'Block B', status: 'current' },
    { time: '14:00', activity: 'Library Session', type: 'Study', location: 'Central', status: 'upcoming' },
  ]);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  // Reminders & Notifications
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', time: '17:00', label: 'Log Daily Attendance', enabled: true },
    { id: '2', time: '21:00', label: 'Review tomorrow\'s schedule', enabled: true }
  ]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Life Section
  const [budgetLimit, setBudgetLimit] = useState(5000);
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', name: 'Drink 3L Water', streak: 4, completedToday: false },
    { id: '2', name: 'Solve 1 LeetCode', streak: 12, completedToday: true },
    { id: '3', name: 'Read 20 mins', streak: 0, completedToday: false },
  ]);

  // Knowledge Vault (Notes)
  const [notes, setNotes] = useState<Note[]>([]);

  // Persistence
  useEffect(() => {
    const storedUser = localStorage.getItem('engiLife_user');
    if (storedUser) {
        // Parse and ensure structure
        const parsed = JSON.parse(storedUser);
        setUser({ 
            ...parsed, 
            xp: parsed.xp || 0, 
            level: parsed.level || 1, 
            achievements: parsed.achievements || INITIAL_ACHIEVEMENTS 
        });
    }

    const storedNotes = localStorage.getItem('engiLife_notes');
    if (storedNotes) setNotes(JSON.parse(storedNotes));
    
    // Request notification permission on load
    if ("Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('engiLife_user', JSON.stringify(user));
    else localStorage.removeItem('engiLife_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('engiLife_notes', JSON.stringify(notes));
  }, [notes]);

  // Check habits reset on new day
  useEffect(() => {
    const today = new Date().toDateString();
    setHabits(prev => prev.map(habit => {
      if (habit.lastCompletedDate && habit.lastCompletedDate !== today) {
        return { ...habit, completedToday: false };
      }
      return habit;
    }));
  }, []);

  // Reminder Logic Loop
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const todayDate = now.toDateString();

      setReminders(prevReminders => {
        let hasUpdates = false;
        const updatedReminders = prevReminders.map(reminder => {
          if (reminder.enabled && reminder.time === currentTime && reminder.lastTriggered !== todayDate) {
            const newNotification: AppNotification = {
              id: Date.now().toString(),
              title: 'Reminder',
              message: reminder.label,
              timestamp: Date.now(),
              read: false,
              type: 'reminder'
            };
            setNotifications(prev => [newNotification, ...prev]);
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("EngiLife Reminder", { body: reminder.label });
            }
            hasUpdates = true;
            return { ...reminder, lastTriggered: todayDate };
          }
          return reminder;
        });
        return hasUpdates ? updatedReminders : prevReminders;
      });
    };
    const timer = setInterval(checkReminders, 10000);
    return () => clearInterval(timer);
  }, []);

  // Actions - Subjects
  const addSubject = (name: string, target: number, attended: number = 0, total: number = 0) => {
    setSubjects([...subjects, {
      id: Date.now().toString(),
      name,
      attended,
      total,
      minPercent: target,
      progress: 0,
      color: 'bg-slate-500'
    }]);
  };

  const updateAttendance = (id: string, present: boolean) => {
    if (present) awardXP(10); // Gamification Hook
    setSubjects(prev => prev.map(sub => 
      sub.id === id ? { ...sub, attended: present ? sub.attended + 1 : sub.attended, total: sub.total + 1 } : sub
    ));
  };

  const updateSubjectStats = (id: string, attended: number, total: number) => {
    setSubjects(prev => prev.map(sub => 
      sub.id === id ? { ...sub, attended, total } : sub
    ));
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(sub => sub.id !== id));
  };

  // Actions - Tasks
  const addTask = (task: Task) => setTasks([...tasks, task]);

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        if (!t.completed) awardXP(50); // Gamification Hook: Task Done
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const cycleTaskPriority = (id: string) => {
    const priorities: Task['priority'][] = ['Low', 'Medium', 'High'];
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const currentIndex = priorities.indexOf(t.priority);
        const nextPriority = priorities[(currentIndex + 1) % 3];
        return { ...t, priority: nextPriority };
      }
      return t;
    }));
  };

  // Actions - Schedule
  const addScheduleItem = (item: ScheduleItem) => {
    setSchedule(prev => [...prev, item].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const updateScheduleItem = (index: number, item: ScheduleItem) => {
    const newSchedule = [...schedule];
    newSchedule[index] = item;
    setSchedule(newSchedule.sort((a, b) => a.time.localeCompare(b.time)));
  };

  const deleteScheduleItem = (index: number) => {
    setSchedule(prev => prev.filter((_, i) => i !== index));
  };

  const generateSmartSchedule = async () => {
    setIsGeneratingSchedule(true);
    const subjectNames = subjects.map(s => s.name);
    const taskTitles = tasks.filter(t => !t.completed).map(t => t.title);
    const aiSchedule = await generateStudyPlan(subjectNames, taskTitles, 8);
    if (aiSchedule && aiSchedule.length > 0) {
      setSchedule(aiSchedule);
    }
    setIsGeneratingSchedule(false);
  };

  // Actions - Reminders
  const addReminder = (time: string, label: string) => {
    setReminders(prev => [...prev, {
      id: Date.now().toString(),
      time,
      label,
      enabled: true
    }]);
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Actions - Habits
  const addHabit = (name: string) => {
    setHabits(prev => [...prev, {
      id: Date.now().toString(),
      name,
      streak: 0,
      completedToday: false
    }]);
  };

  const toggleHabit = (id: string) => {
    const today = new Date().toDateString();
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const wasCompleted = h.completedToday;
        if (!wasCompleted) awardXP(25); // Gamification Hook: Habit
        return {
          ...h,
          completedToday: !wasCompleted,
          streak: wasCompleted ? h.streak : h.streak + 1, // Simple streak logic, usually would act on date diff
          lastCompletedDate: !wasCompleted ? today : h.lastCompletedDate
        };
      }
      return h;
    }));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  // Actions - Notes
  const addNote = (title: string, content: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: title || 'Untitled Note',
      content,
      lastModified: new Date().toLocaleDateString(),
      tags: [],
      flashcards: []
    };
    setNotes([newNote, ...notes]);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, lastModified: new Date().toLocaleDateString() } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <AppContext.Provider value={{
      user, setUser, updateUserProfile,
      subjects, addSubject, updateAttendance, updateSubjectStats, deleteSubject,
      tasks, addTask, updateTask, deleteTask, toggleTaskCompletion, cycleTaskPriority,
      schedule, addScheduleItem, updateScheduleItem, deleteScheduleItem, generateSmartSchedule, isGeneratingSchedule,
      reminders, addReminder, deleteReminder, toggleReminder,
      notifications, markNotificationRead, clearNotifications,
      budgetLimit, setBudgetLimit, habits, addHabit, toggleHabit, deleteHabit,
      notes, addNote, updateNote, deleteNote, awardXP
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
