
import React from 'react';

export enum AppRoute {
  DASHBOARD = 'dashboard',
  ACADEMIC = 'academic',
  ATTENDANCE = 'attendance',
  LABS = 'labs',
  VAULT = 'vault',
  LIFE = 'life',
  CAREER = 'career',
  COMMUNITY = 'community',
  PROFILE = 'profile'
}

export interface NavItem {
  id: AppRoute;
  label: string;
  icon: React.ReactNode;
}

export type WidgetId = 'stats_overview' | 'productivity' | 'tasks' | 'schedule' | 'quick_notes' | 'ai_assistant' | 'attendance_detail';

export interface DashboardWidget {
  id: WidgetId;
  label: string;
  enabled: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  unlocked: boolean;
  dateUnlocked?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  link?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
  type: 'Internship' | 'Full-time' | 'Part-time' | 'Freelance';
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  university?: string;
  branch?: string;
  semester?: number;
  bio?: string;
  avatar?: string;
  joinedDate: string;
  xp: number;
  level: number;
  cgpa?: number;
  streak: number;
  lastStreakUpdate?: string;
  skills?: string[];
  projects?: Project[];
  experience?: Experience[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    website?: string;
    twitter?: string;
  };
  achievements: Achievement[];
  security: {
    twoFactorEnabled: boolean;
    lastLogin: string;
  };
  preferences?: {
    budgetLimit: number;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
  mode?: 'simple' | 'socratic';
}

export interface Task {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  deadline: string;
  completed: boolean;
  category: 'Academic' | 'Personal' | 'Placement';
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  icon: string;
}

export interface LabExperiment {
  title: string;
  branch: string;
  objective: string;
  procedure?: string;
  safety?: string;
}

export interface Subject {
  id: string;
  name: string;
  attended: number;
  total: number;
  minPercent: number;
  progress: number; // Course completion percentage
  color?: string;
}

export interface ScheduleItem {
  id?: string;
  time: string;
  activity: string;
  type: 'Lecture' | 'Study' | 'Break' | 'Lab' | 'Exam';
  location?: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface Reminder {
  id: string;
  time: string; // HH:MM 24h format
  label: string;
  enabled: boolean;
  lastTriggered?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'info' | 'reminder' | 'success';
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  lastCompletedDate?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  mastered: boolean;
  // SRS Fields
  interval?: number; // Days until next review
  easeFactor?: number; // Multiplier
  dueDate?: string; // ISO Date string
  reviews?: number; // Total reviews count
}

export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: string;
  tags: string[];
  flashcards: Flashcard[];
}
