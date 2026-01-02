
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  Plus, Trash2, TrendingUp, TrendingDown, Activity, Heart, Wallet, Target, 
  Droplets, Moon, Dumbbell, Coffee, BookOpen, Bus, Gamepad2, ShoppingBag, 
  Plane, Laptop, Zap, Home, Stethoscope, Wifi, Gift, Utensils, Coins, Check,
  ShoppingBasket, GraduationCap, Shirt, PenTool, ArrowRight, CreditCard,
  MoreHorizontal, PlusCircle
} from 'lucide-react';
import { Card } from '../Shared/Card';
import { Expense, SavingsGoal } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../Shared/Button';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#ec4899', '#06b6d4'];

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'Food': return <Utensils size={16} />;
        case 'Transport': return <Bus size={16} />;
        case 'Shopping': return <ShoppingBag size={16} />;
        case 'Entertainment': return <Gamepad2 size={16} />;
        case 'Health': return <Stethoscope size={16} />;
        case 'Social': return <Gift size={16} />;
        default: return <Zap size={16} />;
    }
};

const EXPENSE_CATEGORIES = [
    'Food', 'Groceries', 'Transport', 'Rent', 
    'Utilities', 'Education', 'Entertainment', 
    'Shopping', 'Health', 'Travel'
];

export const BudgetTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wallet' | 'wellness'>('wallet');
  const { 
      user, budgetLimit, setBudgetLimit, habits, addHabit, toggleHabit, deleteHabit,
      savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
      expenses, addExpense: addExpenseContext, deleteExpense: deleteExpenseContext
  } = useAppContext();

  // Wallet Form State
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Food');
  const [editLimit, setEditLimit] = useState(false);
  const [tempLimit, setTempLimit] = useState(budgetLimit.toString());

  // Habit Form State
  const [newHabitName, setNewHabitName] = useState('');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  // Wallet Logic
  const handleAddExpense = () => {
    if (!newAmount) return;
    const expense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(newAmount),
      category: newCategory,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    addExpenseContext(expense);
    setNewAmount('');
  };

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remainingBudget = budgetLimit - totalSpent;
  const spendPercentage = Math.min((totalSpent / budgetLimit) * 100, 100);

  const chartData = expenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) existing.value += curr.amount;
    else acc.push({ name: curr.category, value: curr.amount });
    return acc;
  }, [] as { name: string; value: number }[]);
  
  chartData.sort((a, b) => b.value - a.value);

  const saveLimit = () => {
    setBudgetLimit(parseInt(tempLimit) || 0);
    setEditLimit(false);
  };

  // Habit Logic
  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    addHabit(newHabitName);
    setNewHabitName('');
  };

  const handleAddGoal = () => {
      if(!newGoalName || !newGoalTarget) return;
      addSavingsGoal({
          id: Date.now().toString(),
          name: newGoalName,
          targetAmount: parseInt(newGoalTarget),
          currentAmount: 0,
          color: 'bg-indigo-500',
          icon: 'Target'
      });
      setNewGoalName('');
      setNewGoalTarget('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Life OS</h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Manage your finances and personal growth.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
           <button 
             onClick={() => setActiveTab('wallet')}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
               activeTab === 'wallet' 
               ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
               : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
             }`}
           >
             <Wallet size={18} /> Wallet
           </button>
           <button 
             onClick={() => setActiveTab('wellness')}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
               activeTab === 'wellness' 
               ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
               : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
             }`}
           >
             <Heart size={18} /> Wellness
           </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'wallet' ? (
          <motion.div 
            key="wallet"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: Card & Analytics */}
            <div className="lg:col-span-8 space-y-8">
               {/* Digital Card */}
               <div className="relative h-64 w-full rounded-3xl overflow-hidden shadow-2xl group transition-transform hover:scale-[1.01]">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500"></div>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  
                  {/* Glass Gloss */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>

                  <div className="relative z-10 p-8 flex flex-col justify-between h-full text-white">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-indigo-100 text-xs font-bold uppercase tracking-[0.2em] mb-1">Student Budget</p>
                           <div className="flex items-center gap-2">
                              {editLimit ? (
                                 <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg p-1">
                                    <span className="pl-2">₹</span>
                                    <input 
                                       type="number" 
                                       value={tempLimit} 
                                       onChange={e => setTempLimit(e.target.value)}
                                       className="bg-transparent border-none outline-none text-white w-24 font-mono font-bold"
                                       autoFocus
                                    />
                                    <button onClick={saveLimit} className="p-1 bg-white text-indigo-600 rounded-md"><Check size={14}/></button>
                                 </div>
                              ) : (
                                 <h2 className="text-4xl font-mono font-bold tracking-tight">₹{budgetLimit.toLocaleString()}</h2>
                              )}
                              {!editLimit && (
                                 <button onClick={() => setEditLimit(true)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-indigo-100">
                                    <TrendingUp size={16} />
                                 </button>
                              )}
                           </div>
                        </div>
                        <CreditCard size={32} className="opacity-80" />
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-end text-sm font-medium">
                           <span className="text-indigo-100">Spent: ₹{totalSpent}</span>
                           <span className="text-indigo-100">{spendPercentage.toFixed(0)}% Used</span>
                        </div>
                        <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden backdrop-blur-sm">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${spendPercentage}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                           />
                        </div>
                        <div className="flex justify-between items-center">
                           <p className="font-mono text-sm tracking-widest opacity-80">**** **** **** {user?.id.slice(0,4) || '1234'}</p>
                           <p className="font-bold tracking-wider uppercase text-sm">{user?.name}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Quick Add & Goals Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quick Expense */}
                  <Card title="Quick Transaction" className="h-full">
                     <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                           {EXPENSE_CATEGORIES.slice(0, 6).map(cat => (
                              <button
                                 key={cat}
                                 onClick={() => setNewCategory(cat)}
                                 className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                    newCategory === cat 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' 
                                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-indigo-100'
                                 }`}
                              >
                                 <div className="mb-1">{getCategoryIcon(cat)}</div>
                                 <span className="text-[10px] font-bold">{cat}</span>
                              </button>
                           ))}
                        </div>
                        <div className="flex gap-2">
                           <div className="relative flex-1">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                              <input 
                                 type="number"
                                 value={newAmount}
                                 onChange={e => setNewAmount(e.target.value)}
                                 placeholder="0.00"
                                 className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-800 dark:text-white"
                              />
                           </div>
                           <Button onClick={handleAddExpense} className="px-6 rounded-xl" icon={<Plus size={20} />}>
                              Pay
                           </Button>
                        </div>
                     </div>
                  </Card>

                  {/* Spending Breakdown */}
                  <Card title="Analytics" className="h-full">
                     <div className="h-48 relative flex items-center justify-center">
                        {expenses.length > 0 ? (
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                 <Pie
                                    data={chartData}
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                 >
                                    {chartData.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                 </Pie>
                                 <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff', fontSize: '12px' }}
                                    formatter={(value: number) => `₹${value}`}
                                 />
                              </PieChart>
                           </ResponsiveContainer>
                        ) : (
                           <div className="text-slate-400 text-xs text-center">No data yet</div>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                           <span className="text-2xl font-bold text-slate-800 dark:text-white">₹{totalSpent}</span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                        </div>
                     </div>
                  </Card>
               </div>

               {/* Savings Pods */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white">Savings Pods</h3>
                     <div className="flex gap-2">
                        <input 
                           placeholder="New Goal" 
                           value={newGoalName}
                           onChange={e => setNewGoalName(e.target.value)}
                           className="w-32 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                        />
                        <input 
                           placeholder="Target" 
                           type="number"
                           value={newGoalTarget}
                           onChange={e => setNewGoalTarget(e.target.value)}
                           className="w-20 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                        />
                        <button onClick={handleAddGoal} className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                           <Plus size={16} />
                        </button>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                     {savingsGoals.map(goal => {
                        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                        return (
                           <div key={goal.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group">
                              <button onClick={() => deleteSavingsGoal(goal.id)} className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                              <div className="flex justify-between items-start mb-4">
                                 <div className={`p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400`}>
                                    <Target size={20} />
                                 </div>
                                 <span className="text-xs font-bold text-slate-400">{progress.toFixed(0)}%</span>
                              </div>
                              <h4 className="font-bold text-slate-900 dark:text-white mb-1">{goal.name}</h4>
                              <p className="text-xs text-slate-500 mb-4">₹{goal.currentAmount} / ₹{goal.targetAmount}</p>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-indigo-500 rounded-full"
                                 />
                              </div>
                              <div className="flex justify-between gap-2">
                                 <button onClick={() => updateSavingsGoal(goal.id, goal.currentAmount + 100)} className="flex-1 py-1.5 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors">
                                    + ₹100
                                 </button>
                                 <button onClick={() => updateSavingsGoal(goal.id, goal.currentAmount + 500)} className="flex-1 py-1.5 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors">
                                    + ₹500
                                 </button>
                              </div>
                           </div>
                        );
                     })}
                     {savingsGoals.length === 0 && (
                        <div className="col-span-full py-8 text-center text-slate-400 text-sm italic border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                           Create a pod to start saving for your dreams.
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Right Column: Feed */}
            <div className="lg:col-span-4">
               <Card title="Recent Activity" className="h-[600px] flex flex-col" noPadding>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                     <AnimatePresence>
                        {expenses.slice().reverse().map((expense, i) => (
                           <motion.div 
                              key={expense.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                           >
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                    {getCategoryIcon(expense.category)}
                                 </div>
                                 <div>
                                    <p className="font-bold text-sm text-slate-800 dark:text-white">{expense.category}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{expense.date}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="font-bold text-sm text-slate-900 dark:text-white">-₹{expense.amount}</p>
                                 <button onClick={() => deleteExpenseContext(expense.id)} className="text-[10px] text-rose-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                                    Refund
                                 </button>
                              </div>
                           </motion.div>
                        ))}
                     </AnimatePresence>
                     {expenses.length === 0 && <p className="text-center text-slate-400 text-sm mt-10">No transactions yet.</p>}
                  </div>
               </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="wellness"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
             {/* Stats Cards */}
             <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div whileHover={{ y: -5 }} className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                      <Droplets size={24} />
                   </div>
                   <div>
                      <p className="text-xs font-bold uppercase text-blue-600/70 tracking-wider">Hydration</p>
                      <h3 className="text-2xl font-black text-blue-800 dark:text-blue-200">1.2L <span className="text-sm font-medium opacity-60">/ 3L</span></h3>
                   </div>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-3xl border border-purple-100 dark:border-purple-900/30 flex items-center gap-4">
                   <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600">
                      <Moon size={24} />
                   </div>
                   <div>
                      <p className="text-xs font-bold uppercase text-purple-600/70 tracking-wider">Rest</p>
                      <h3 className="text-2xl font-black text-purple-800 dark:text-purple-200">7h 20m</h3>
                   </div>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-4">
                   <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600">
                      <Target size={24} />
                   </div>
                   <div>
                      <p className="text-xs font-bold uppercase text-amber-600/70 tracking-wider">Daily Goals</p>
                      <h3 className="text-2xl font-black text-amber-800 dark:text-amber-200">85%</h3>
                   </div>
                </motion.div>
             </div>

             {/* Habit Tracker */}
             <div className="lg:col-span-8">
                <Card title="Habit Protocol" className="min-h-[400px]">
                   <div className="space-y-3 mt-4">
                      {habits.length === 0 && (
                         <div className="text-center py-10">
                            <Dumbbell size={40} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 font-medium">No habits initialized.</p>
                            <p className="text-slate-400 text-sm">Start small, achieve big.</p>
                         </div>
                      )}
                      {habits.map(habit => (
                         <motion.div 
                           key={habit.id}
                           layout
                           className={`group flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                              habit.completedToday 
                              ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30' 
                              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900'
                           }`}
                           onClick={() => toggleHabit(habit.id)}
                         >
                            <div className="flex items-center gap-4">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                  habit.completedToday 
                                  ? 'bg-emerald-500 border-emerald-500 text-white scale-110' 
                                  : 'border-slate-300 dark:border-slate-600 text-transparent group-hover:border-indigo-400'
                               }`}>
                                  <Check size={16} strokeWidth={4} />
                               </div>
                               <div>
                                  <h4 className={`font-bold text-lg ${habit.completedToday ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-70' : 'text-slate-800 dark:text-white'}`}>
                                     {habit.name}
                                  </h4>
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                     <span className="text-orange-500">🔥</span> {habit.streak} Day Streak
                                  </p>
                               </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                               <Trash2 size={18} />
                            </button>
                         </motion.div>
                      ))}
                   </div>
                   
                   <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                      <input 
                         placeholder="New habit (e.g. Read 10 pages)" 
                         value={newHabitName}
                         onChange={e => setNewHabitName(e.target.value)}
                         className="flex-1 px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white font-medium"
                         onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                      />
                      <Button onClick={handleAddHabit} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-6">
                         <Plus size={20} />
                      </Button>
                   </div>
                </Card>
             </div>

             {/* Motivation / Extra */}
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                   <div className="relative z-10">
                      <h3 className="text-xl font-black mb-2">Daily Zen</h3>
                      <p className="text-indigo-100 font-medium leading-relaxed italic">
                         "Discipline is doing what needs to be done, even if you don't want to do it."
                      </p>
                      <div className="mt-4 flex gap-2">
                         <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-3/4"></div>
                         </div>
                      </div>
                   </div>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
                   <h4 className="font-bold text-slate-800 dark:text-white mb-4">Suggested Habits</h4>
                   <div className="space-y-2">
                      {['Drink 2L Water', '30m Coding', 'Read 15m', 'No Sugar'].map(h => (
                         <button key={h} onClick={() => addHabit(h)} className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-400 font-medium text-sm flex items-center justify-between group transition-colors">
                            {h}
                            <PlusCircle size={16} className="opacity-0 group-hover:opacity-100 text-indigo-500" />
                         </button>
                      ))}
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
