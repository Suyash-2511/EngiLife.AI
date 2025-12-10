import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Plus, Trash2, TrendingUp, CheckCircle, Activity, Heart, Wallet, Target, Droplets, Moon, Dumbbell } from 'lucide-react';
import { Card } from '../Shared/Card';
import { Expense } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../Shared/Button';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const BudgetTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wallet' | 'wellness'>('wallet');
  const { budgetLimit, setBudgetLimit, habits, addHabit, toggleHabit, deleteHabit } = useAppContext();

  // Wallet State
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', category: 'Food', amount: 4500, date: '2023-10-01' },
    { id: '2', category: 'Transport', amount: 1200, date: '2023-10-05' },
    { id: '3', category: 'Books', amount: 2500, date: '2023-10-10' },
  ]);
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Food');
  const [editLimit, setEditLimit] = useState(false);
  const [tempLimit, setTempLimit] = useState(budgetLimit.toString());

  // Habit State
  const [newHabitName, setNewHabitName] = useState('');

  // Wallet Logic
  const addExpense = () => {
    if (!newAmount) return;
    const expense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(newAmount),
      category: newCategory,
      date: new Date().toISOString().split('T')[0]
    };
    setExpenses([...expenses, expense]);
    setNewAmount('');
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const chartData = expenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) existing.value += curr.amount;
    else acc.push({ name: curr.category, value: curr.amount });
    return acc;
  }, [] as { name: string; value: number }[]);

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

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button 
          onClick={() => setActiveTab('wallet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'wallet' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <Wallet size={18} /> Wallet
        </button>
        <button 
          onClick={() => setActiveTab('wellness')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'wellness' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <Heart size={18} /> Wellness
        </button>
      </div>

      {activeTab === 'wallet' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Overview */}
          <Card title="Monthly Budget Analysis" delay={0.1}>
            <div className="flex flex-col h-full">
               <div className="mb-6">
                 <div className="flex justify-between items-end mb-2">
                   <span className="text-sm font-medium text-slate-500">Budget Usage</span>
                   {editLimit ? (
                     <div className="flex gap-2">
                       <input 
                         type="number" 
                         value={tempLimit} 
                         onChange={(e) => setTempLimit(e.target.value)} 
                         className="w-24 px-2 py-1 text-sm border rounded bg-slate-50 dark:bg-slate-900 dark:text-white"
                       />
                       <Button size="sm" onClick={saveLimit}>Save</Button>
                     </div>
                   ) : (
                     <div className="text-right">
                       <span className="text-sm font-bold text-slate-800 dark:text-white">₹{totalSpent}</span>
                       <span className="text-xs text-slate-400 mx-1">/</span>
                       <span className="text-sm text-slate-500 cursor-pointer hover:text-primary-500 underline decoration-dotted" onClick={() => setEditLimit(true)}>
                         ₹{budgetLimit}
                       </span>
                     </div>
                   )}
                 </div>
                 <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${Math.min((totalSpent / budgetLimit) * 100, 100)}%` }}
                     transition={{ duration: 1, type: "spring", stiffness: 100 }}
                     className={`h-full rounded-full ${totalSpent > budgetLimit ? 'bg-red-500' : 'bg-primary-500'}`}
                   />
                 </div>
                 {totalSpent > budgetLimit && (
                    <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <Activity size={12}/> Over budget!
                    </motion.p>
                 )}
               </div>

               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="h-48 w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </Card>

          {/* Add Expense & History */}
          <div className="space-y-6">
            <Card title="Add Expense" delay={0.2}>
              <div className="flex gap-2">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500/20 bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Books</option>
                  <option>Entertainment</option>
                  <option>Other</option>
                </select>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="Amount"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500/20 bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                />
                <Button onClick={addExpense} icon={<Plus size={20} />} />
              </div>
            </Card>

            <Card title="Transactions" className="flex-1 max-h-[300px] overflow-y-auto" delay={0.3}>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                {expenses.slice().reverse().map((expense) => (
                  <motion.div 
                    key={expense.id} 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg group border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                        <TrendingUp size={16} className="text-primary-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white text-sm">{expense.category}</p>
                        <p className="text-xs text-slate-500">{expense.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">₹{expense.amount}</span>
                      <button onClick={() => deleteExpense(expense.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
                {expenses.length === 0 && <div className="text-center text-slate-400 text-sm py-4">No transactions yet</div>}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Habits List */}
          <Card title="Daily Habits">
             <div className="space-y-4">
               {habits.map(habit => (
                 <motion.div 
                   key={habit.id}
                   layout
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                     habit.completedToday 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-200'
                   }`}
                   onClick={() => toggleHabit(habit.id)}
                 >
                   <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                        habit.completedToday ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                      }`}>
                         {habit.completedToday && <CheckCircle size={14} className="text-white" />}
                      </div>
                      <div>
                        <p className={`font-medium ${habit.completedToday ? 'text-emerald-800 dark:text-emerald-300 line-through opacity-70' : 'text-slate-800 dark:text-white'}`}>
                          {habit.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">Current streak: {habit.streak} 🔥</p>
                      </div>
                   </div>
                   <button onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }} className="text-slate-300 hover:text-red-500 p-2">
                     <Trash2 size={16} />
                   </button>
                 </motion.div>
               ))}

               <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                  <input 
                    placeholder="New habit (e.g., Sleep 8h)" 
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                  />
                  <Button onClick={handleAddHabit} className="bg-emerald-600 hover:bg-emerald-700">Add</Button>
               </div>
             </div>
          </Card>

          {/* Wellness Summary */}
          <div className="space-y-6">
             <Card delay={0.2}>
                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                   <motion.div whileHover={{ scale: 1.05 }} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                      <Droplets className="text-blue-500 mb-2" size={24} />
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">4L</p>
                      <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Water Goal</p>
                   </motion.div>
                   <motion.div whileHover={{ scale: 1.05 }} className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                      <Moon className="text-purple-500 mb-2" size={24} />
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">7h 20m</p>
                      <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Avg Sleep</p>
                   </motion.div>
                   <motion.div whileHover={{ scale: 1.02 }} className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl col-span-2">
                      <div className="flex justify-between items-start">
                         <div>
                            <Target className="text-amber-500 mb-2" size={24} />
                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{Math.round((habits.filter(h => h.completedToday).length / Math.max(habits.length, 1)) * 100)}%</p>
                            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Daily Completion</p>
                         </div>
                         <Dumbbell size={48} className="text-amber-500/10" />
                      </div>
                   </motion.div>
                </div>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
};