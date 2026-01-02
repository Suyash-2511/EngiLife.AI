
import { User, Task, Subject, ScheduleItem, Note, Habit, SavingsGoal, Expense } from '../types';

// --- Configuration ---
// Set to TRUE for immediate in-browser functionality.
// Set to FALSE only when a real backend server is running on port 3001.
const USE_MOCK_BACKEND = true; 

// Use relative path for production (assumes Nginx/proxy handles /api routing)
// Or fallback to localhost for local dev if not served from same origin
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3001/api' 
  : '/api';

const SIMULATED_LATENCY = 600; // Increased latency slightly to feel more realistic

// --- Types ---
type ResourceType = 'tasks' | 'subjects' | 'schedule' | 'notes' | 'habits' | 'savingsGoals' | 'expenses';

// --- Helpers ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getLocal = <T>(key: string, def: T): T => {
  const item = localStorage.getItem(key);
  if (!item) return def;
  try {
      const parsed = JSON.parse(item);
      return (parsed === null || parsed === undefined) ? def : parsed;
  } catch (e) {
      console.warn(`Failed to parse local storage key "${key}", falling back to default.`);
      return def;
  }
};

const setLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- Real API Request Handler ---
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}), 
    ...options.headers,
  } as HeadersInit;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 401) {
            // window.location.href = '/login'; 
        }
        throw new Error(err.error || `API Error: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Request Failed: ${endpoint}`, error);
    throw error;
  }
}

// --- Mock Backend Implementation ---
// Acts exactly like a persistent server but lives in the browser
class MockBackend {
  private generateToken(userId: string): string {
      const payload = { sub: userId, iat: Date.now(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }; 
      return btoa(JSON.stringify(payload));
  }

  private getUserIdFromToken(token: string): string | null {
      if (!token || typeof token !== 'string') return null;
      try {
          if (token.startsWith('mock-jwt-') && !token.includes('{')) return null; 
          
          const decoded = atob(token);
          const payload = JSON.parse(decoded);
          if (payload.exp < Date.now()) return null;
          return payload.sub;
      } catch (e) {
          return null;
      }
  }

  private getCurrentUserId(): string | null {
      const userStr = localStorage.getItem('engiLife_user');
      if (userStr) {
          try {
              const user = JSON.parse(userStr);
              if (user.id) return user.id;
          } catch {}
      }
      const token = localStorage.getItem('auth_token');
      if (token) {
          return this.getUserIdFromToken(token);
      }
      return null;
  }

  // --- Streak Logic Helper ---
  private calculateStreakUpdates(user: User): { streak: number, lastStreakUpdate: string } {
      const now = new Date();
      const todayStr = now.toDateString();
      
      const lastUpdateStr = user.lastStreakUpdate ? new Date(user.lastStreakUpdate).toDateString() : null;
      
      // If already updated today, do nothing
      if (lastUpdateStr === todayStr) {
          return { streak: user.streak, lastStreakUpdate: user.lastStreakUpdate || now.toISOString() };
      }

      // Check if yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      let newStreak = 1;
      
      // If last update was yesterday, increment. Otherwise (gap > 1 day), reset to 1.
      if (lastUpdateStr === yesterdayStr) {
          newStreak = (user.streak || 0) + 1;
      }

      return {
          streak: newStreak,
          lastStreakUpdate: now.toISOString()
      };
  }

  async login(creds: any): Promise<{ user?: User, token?: string, verificationRequired?: boolean }> {
    await sleep(SIMULATED_LATENCY);
    const users = getLocal<User[]>('engiLife_users_db', []);
    const existing = users.find(u => u.email === creds.email);
    
    if (existing) {
        // Handle 2FA or unverified email
        if (existing.emailVerified === false || existing.security.twoFactorEnabled) {
             const otp = generateOTP();
             const otpData = { code: otp, expires: Date.now() + 5 * 60 * 1000 };
             
             // Update user with OTP
             const updatedUsers = users.map(u => u.id === existing.id ? { ...u, otp: otpData } : u);
             setLocal('engiLife_users_db', updatedUsers);

             console.group('%c 🔐 REAL-TIME OTP SIMULATION', 'color: #10b981; font-weight: bold; font-size: 14px;');
             console.log(`Sending OTP to: ${creds.email}`);
             console.log(`%c CODE: ${otp}`, 'color: #f59e0b; font-weight: bold; font-size: 20px; border: 2px dashed #f59e0b; padding: 4px;');
             console.groupEnd();

             return { verificationRequired: true };
        }

        // Standard Login + Streak Update
        const now = new Date();
        const streakData = this.calculateStreakUpdates(existing);
        
        const updatedUser = {
            ...existing,
            ...streakData,
            security: { ...existing.security, lastLogin: now.toISOString() }
        };

        const updatedUsers = users.map(u => u.id === existing.id ? updatedUser : u);
        setLocal('engiLife_users_db', updatedUsers);
        setLocal('engiLife_user', updatedUser);
        
        return { user: updatedUser, token: this.generateToken(updatedUser.id) };
    }
    throw new Error('User not found. Please sign up.');
  }

  async signup(data: any): Promise<{ user: User, verificationRequired: boolean }> {
     await sleep(SIMULATED_LATENCY);
     const users = getLocal<User[]>('engiLife_users_db', []);
     if (users.find(u => u.email === data.email)) throw new Error('User exists');

     const otp = generateOTP();
     const otpData = { code: otp, expires: Date.now() + 5 * 60 * 1000 };

     const newUser: any = {
        id: 'user_' + Date.now(),
        name: data.name,
        email: data.email,
        emailVerified: false, 
        branch: data.branch || 'Computer Science',
        university: 'Tech Institute',
        semester: 1,
        xp: 0,
        level: 1,
        cgpa: 0,
        streak: 1,
        lastStreakUpdate: new Date().toISOString(),
        skills: [],
        socialLinks: {},
        achievements: [],
        bio: 'Engineering Student',
        joinedDate: new Date().toLocaleDateString(),
        security: { twoFactorEnabled: false, lastLogin: new Date().toISOString() },
        preferences: { budgetLimit: 5000 },
        otp: otpData // Store OTP for verification
     };
     
     users.push(newUser);
     setLocal('engiLife_users_db', users);

     console.group('%c 🔐 REAL-TIME OTP SIMULATION', 'color: #10b981; font-weight: bold; font-size: 14px;');
     console.log(`Sending Verification Email to: ${data.email}`);
     console.log(`%c CODE: ${otp}`, 'color: #f59e0b; font-weight: bold; font-size: 20px; border: 2px dashed #f59e0b; padding: 4px;');
     console.groupEnd();

     return { user: newUser, verificationRequired: true };
  }

  async verifyEmail(email: string, code: string): Promise<{ user: User, token: string }> {
      await sleep(SIMULATED_LATENCY);
      
      const users = getLocal<any[]>('engiLife_users_db', []);
      const index = users.findIndex(u => u.email === email);
      
      if (index === -1) throw new Error('User not found');
      
      const user = users[index];

      // REAL Verification Logic
      if (!user.otp || !user.otp.code) throw new Error("No active OTP found. Login again.");
      if (Date.now() > user.otp.expires) throw new Error("OTP Expired.");
      if (user.otp.code !== code) throw new Error("Invalid Code.");

      // Success
      const streakData = this.calculateStreakUpdates(user);
      
      const updatedUser = {
          ...user,
          ...streakData,
          emailVerified: true,
          otp: undefined,
          security: { ...user.security, lastLogin: new Date().toISOString() }
      };
      
      users[index] = updatedUser;
      setLocal('engiLife_users_db', users);
      setLocal('engiLife_user', updatedUser);
      
      return { user: updatedUser, token: this.generateToken(user.id) };
  }

  async verifySession(): Promise<User> {
      await sleep(SIMULATED_LATENCY);
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("No session token");

      let userId = this.getUserIdFromToken(token);
      
      if (!userId) {
          const cachedUser = getLocal<User | null>('engiLife_user', null);
          if (cachedUser && cachedUser.id) userId = cachedUser.id;
      }

      if (!userId) {
          localStorage.removeItem('auth_token');
          throw new Error("Session expired");
      }

      const users = getLocal<User[]>('engiLife_users_db', []);
      const index = users.findIndex(u => u.id === userId);
      
      if (index !== -1) {
          // Perform streak update even on session verify (auto-login)
          const user = users[index];
          const streakData = this.calculateStreakUpdates(user);
          const updatedUser = { ...user, ...streakData };
          
          // Only write if changes happened
          if (updatedUser.streak !== user.streak || updatedUser.lastStreakUpdate !== user.lastStreakUpdate) {
              users[index] = updatedUser;
              setLocal('engiLife_users_db', users);
          }
          
          setLocal('engiLife_user', updatedUser);
          return updatedUser;
      }
      
      throw new Error("User not found in database");
  }

  async socialLogin(data: any): Promise<{ user: User, token: string }> {
      await sleep(SIMULATED_LATENCY);
      const users = getLocal<User[]>('engiLife_users_db', []);
      const index = users.findIndex(u => u.email === data.email);
      const now = new Date();

      let user;
      
      if (index === -1) {
          user = {
            id: 'user_' + Date.now(),
            name: data.name,
            email: data.email,
            emailVerified: true,
            branch: 'Computer Science',
            university: 'Tech Institute',
            semester: 1,
            xp: 0,
            level: 1,
            cgpa: 0,
            streak: 1,
            lastStreakUpdate: now.toISOString(),
            skills: [],
            socialLinks: {},
            achievements: [],
            bio: `Joined via ${data.provider}`,
            avatar: data.avatar,
            joinedDate: now.toLocaleDateString(),
            security: { twoFactorEnabled: false, lastLogin: now.toISOString() },
            preferences: { budgetLimit: 5000 }
          };
          users.push(user);
      } else {
          // Update existing
          user = users[index];
          const streakData = this.calculateStreakUpdates(user);
          user = { 
              ...user, 
              ...streakData,
              security: { ...user.security, lastLogin: now.toISOString() } 
          };
          users[index] = user;
      }
      
      setLocal('engiLife_users_db', users);
      setLocal('engiLife_user', user);
      
      return { user, token: this.generateToken(user.id) };
  }

  async list<T>(resource: ResourceType): Promise<T[]> {
      await sleep(SIMULATED_LATENCY);
      const userId = this.getCurrentUserId();
      if (!userId) return []; 

      let allItems = getLocal<any[]>(`engiLife_${resource}`, []);
      
      // Auto-Migration
      let hasChanges = false;
      allItems = allItems.map(item => {
          if (!item.userId) {
              item.userId = userId;
              hasChanges = true;
          }
          return item;
      });

      if (hasChanges) setLocal(`engiLife_${resource}`, allItems);
      
      return allItems.filter(item => item.userId === userId);
  }

  async create<T>(resource: ResourceType, item: T): Promise<T> {
      await sleep(SIMULATED_LATENCY);
      const userId = this.getCurrentUserId();
      if (!userId) throw new Error("User not authenticated");

      const list = getLocal<any[]>(`engiLife_${resource}`, []);
      const newItem = { ...item, userId };
      list.push(newItem);
      setLocal(`engiLife_${resource}`, list);
      return newItem as T;
  }

  async update<T>(resource: ResourceType, id: string, updates: Partial<T>): Promise<T> {
      await sleep(SIMULATED_LATENCY);
      const userId = this.getCurrentUserId();
      if (!userId) throw new Error("User not authenticated");

      const list = getLocal<any[]>(`engiLife_${resource}`, []);
      const index = list.findIndex((i: any) => i.id === id);
      
      if (index === -1) throw new Error('Not found');
      if (list[index].userId && list[index].userId !== userId) throw new Error('Unauthorized');

      const updated = { ...list[index], ...updates };
      list[index] = updated;
      setLocal(`engiLife_${resource}`, list);
      return updated as T;
  }

  async delete(resource: ResourceType, id: string): Promise<void> {
      await sleep(SIMULATED_LATENCY);
      const userId = this.getCurrentUserId();
      if (!userId) throw new Error("User not authenticated");

      const list = getLocal<any[]>(`engiLife_${resource}`, []);
      const item = list.find(i => i.id === id);
      
      if (!item) return; 
      if (item.userId && item.userId !== userId) throw new Error('Unauthorized');

      const newList = list.filter(i => i.id !== id);
      setLocal(`engiLife_${resource}`, newList);
  }
}

const mock = new MockBackend();

// --- Resource Factory ---
const createResourceAPI = <T>(resourceName: ResourceType) => ({
    list: async (): Promise<T[]> => {
        if (USE_MOCK_BACKEND) return mock.list<T>(resourceName);
        return request<T[]>(`/${resourceName}`);
    },
    create: async (item: T): Promise<T> => {
        if (USE_MOCK_BACKEND) return mock.create<T>(resourceName, item);
        return request<T>(`/${resourceName}`, { method: 'POST', body: JSON.stringify(item) });
    },
    update: async (id: string, updates: Partial<T>): Promise<T> => {
        if (USE_MOCK_BACKEND) return mock.update<T>(resourceName, id, updates);
        return request<T>(`/${resourceName}/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    },
    delete: async (id: string): Promise<void> => {
        if (USE_MOCK_BACKEND) return mock.delete(resourceName, id);
        return request<void>(`/${resourceName}/${id}`, { method: 'DELETE' });
    }
});

// --- Public API ---
export const api = {
  auth: {
    login: async (email: string, password: string) => {
      if (USE_MOCK_BACKEND) return mock.login({ email, password });
      return request<{user: User, token: string, verificationRequired?: boolean}>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    },
    signup: async (name: string, email: string, branch: string, password: string) => {
      if (USE_MOCK_BACKEND) return mock.signup({ name, email, branch, password });
      return request<{user: User, verificationRequired: boolean}>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, branch, password })
      });
    },
    verifyEmail: async (email: string, code: string) => {
        if (USE_MOCK_BACKEND) return mock.verifyEmail(email, code);
        return request<{user: User, token: string}>('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ email, code })
        });
    },
    socialLogin: async (provider: string, email: string, name: string, avatar: string) => {
        if (USE_MOCK_BACKEND) return mock.socialLogin({ provider, email, name, avatar });
        return request<{user: User, token: string}>('/auth/social-login', {
            method: 'POST',
            body: JSON.stringify({ provider, email, name, avatar })
        });
    },
    updateProfile: async (updates: Partial<User>) => {
        if (USE_MOCK_BACKEND) {
             const userId = mock['getCurrentUserId'](); 
             const users = getLocal<User[]>('engiLife_users_db', []);
             const index = users.findIndex(u => u.id === userId);
             
             if (index === -1) throw new Error("Session expired. Please login again.");
             
             const updated = { ...users[index], ...updates };
             users[index] = updated;
             setLocal('engiLife_users_db', users);
             setLocal('engiLife_user', updated);
             return updated;
        }
        return request<User>('/auth/update', { method: 'POST', body: JSON.stringify(updates) });
    },
    verifySession: async () => {
        if (USE_MOCK_BACKEND) return mock.verifySession();
        return request<User>('/auth/me'); 
    },
    logout: async () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('engiLife_user');
    }
  },

  tasks: createResourceAPI<Task>('tasks'),
  subjects: createResourceAPI<Subject>('subjects'),
  schedule: createResourceAPI<ScheduleItem>('schedule'),
  notes: createResourceAPI<Note>('notes'),
  habits: createResourceAPI<Habit>('habits'),
  savingsGoals: createResourceAPI<SavingsGoal>('savingsGoals'),
  expenses: createResourceAPI<Expense>('expenses'),
};
