import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  Plus, Trash2, TrendingUp, CheckCircle, Activity, Heart, Wallet, Target, 
  Droplets, Moon, Dumbbell, Coffee, BookOpen, Bus, Gamepad2, ShoppingBag, 
  Plane, Laptop, Zap, Home, Stethoscope, Wifi, Gift, Utensils, Coins
} from 'lucide-react';
import { Card } from '../Shared/Card';
import { Expense, SavingsGoal } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../Shared/Button';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'Food': return <Utensils size={16} />;
        case 'Transport': return <Bus size={16} />;
        case 'Books': return <BookOpen size={16} />;
        case 'Entertainment': return <Gamepad2 size={16} />;
        case 'Shopping': return <ShoppingBag size={16} />;
        case 'Rent': return <Home size={16} />;
        case 'Health': return <Stethoscope size={16} />;
        case 'Utilities': return <Wifi size={16} />;
        case 'Social': return <Gift size={16} />;
        default: return <Zap size={16} />;
    }
};

const getGoalIcon = (icon: string) => {
    switch(icon) {
        case 'Laptop': return <Laptop size={20} />;
        case 'Plane': return <Plane size={20} />;
        case 'Game': return <Gamepad2 size={20} />;
        case 'Home': return <Home size={20} />;
        default: return <Target size={20} />;
    }
}

export const BudgetTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wallet' | 'wellness'>('wallet');
  const { 
      budgetLimit, setBudgetLimit, habits, addHabit, toggleHabit, deleteHabit,
      savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal
  } = useAppContext();

  // Wallet State
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', category: 'Food', amount: 450, date: '2023-10-01' },
    { id: '2', category: 'Transport', amount: 120, date: '2023-10-05' },
    { id: '3', category: 'Books', amount: 2500, date: '2023-10-10' },
  ]);
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Food');
  const [editLimit, setEditLimit] = useState(false);
  const [tempLimit, setTempLimit] = useState(budgetLimit.toString());

  // Habit State
  const [newHabitName, setNewHabitName] = useState('');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

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
  const remainingBudget = budgetLimit - totalSpent;

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

  const handleAddGoal = () => {
      if(!newGoalName || !newGoalTarget) return;
      addSavingsGoal({
          id: Date.now().toString(),
          name: newGoalName,
          targetAmount: parseInt(newGoalTarget),
          currentAmount: 0,
          color: 'bg-primary-500',
          icon: 'Target'
      });
      setNewGoalName('');
      setNewGoalTarget('');
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
          {/* Main Financial Overview */}
          <Card noPadding className="lg:col-span-2 p-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                 <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Budget</h3>
                        <div className="flex items-center gap-3">
                           <h2 className="text-4xl font-mono font-bold text-slate-900 dark:text-white">₹{budgetLimit}</h2>
                           <button onClick={() => setEditLimit(!editLimit)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400">
                               <TrendingUp size={18}/>
                           </button>
                        </div>
                        {editLimit && (
                            <div className="flex gap-2 mt-2">
                                <input className="border rounded px-2 py-1 text-sm bg-slate-50 dark:bg-slate-900 dark:text-white" type="number" value={tempLimit} onChange={e => setTempLimit(e.target.value)} />
                                <Button size="sm" onClick={saveLimit}>Save</Button>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-8">
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Spent</p>
                            <p className="text-xl font-semibold text-rose-500">₹{totalSpent}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Remaining</p>
                            <p className="text-xl font-semibold text-emerald-500">₹{remainingBudget}</p>
                        </div>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${remainingBudget < 0 ? 'bg-rose-500' : 'bg-primary-500'}`} 
                          style={{ width: `${Math.min((totalSpent/budgetLimit)*100, 100)}%` }}
                        ></div>
                    </div>
                 </div>

                 {/* Pie Chart */}
                 <div className="h-64 relative">
                    {expenses.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                   contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#333' }}
                                   formatter={(value: number) => `₹${value}`}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle"
                                    formatter={(value, entry: any) => <span className="text-xs text-slate-600 dark:text-slate-400 ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                            Add expenses to see breakdown
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                        <span className="text-xs font-bold text-slate-400 uppercase">Expenses</span>
                    </div>
                 </div>
             </div>
          </Card>

          {/* Savings Goals */}
          <Card title="Savings Goals" className="flex flex-col">
             <div className="flex-1 space-y-6">
                {savingsGoals.map(goal => {
                    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                    return (
                        <div key={goal.id} className="group relative">
                             <div className="flex justify-between items-end mb-2">
                                 <div className="flex items-center gap-3">
                                     <div className={`p-2 rounded-xl ${goal.color} bg-opacity-10 text-primary-600`}>
                                         {getGoalIcon(goal.icon)}
                                     </div>
                                     <div>
                                         <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 block">{goal.name}</span>
                                         <span className="text-[10px] text-slate-400">{progress.toFixed(0)}% Achieved</span>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <span className="text-sm font-bold text-slate-800 dark:text-white">₹{goal.currentAmount}</span>
                                     <span className="text-[10px] text-slate-400 mx-1">/</span>
                                     <span className="text-xs text-slate-500">₹{goal.targetAmount}</span>
                                 </div>
                             </div>
                             
                             <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className={`absolute top-0 left-0 h-full ${goal.color}`}
                                 />
                             </div>

                             <div className="mt-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                 <button 
                                     onClick={() => updateSavingsGoal(goal.id, Math.min(goal.currentAmount + 100, goal.targetAmount))}
                                     className="flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-400 hover:text-emerald-600 border border-slate-200 dark:border-slate-700"
                                 >
                                     <Coins size={10} /> +100
                                 </button>
                                 <button 
                                     onClick={() => updateSavingsGoal(goal.id, Math.min(goal.currentAmount + 500, goal.targetAmount))}
                                     className="flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-400 hover:text-emerald-600 border border-slate-200 dark:border-slate-700"
                                 >
                                     <Coins size={10} /> +500
                                 </button>
                                 <button onClick={() => deleteSavingsGoal(goal.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                                     <Trash2 size={14} />
                                 </button>
                             </div>
                        </div>
                    );
                })}
                
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                     <input 
                         placeholder="Goal Name" 
                         className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white"
                         value={newGoalName}
                         onChange={e => setNewGoalName(e.target.value)}
                     />
                     <input 
                         placeholder="Target ₹" 
                         type="number"
                         className="w-24 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white"
                         value={newGoalTarget}
                         onChange={e => setNewGoalTarget(e.target.value)}
                     />
                     <Button size="sm" onClick={handleAddGoal} disabled={!newGoalName || !newGoalTarget}>Add</Button>
                </div>
             </div>
          </Card>

          {/* Transactions */}
          <div className="space-y-6">
            <Card title="Add Expense">
              <div className="flex gap-2">
                <div className="relative">
                    <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500/20 bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white h-full"
                    >
                        <option>Food</option>
                        <option>Transport</option>
                        <option>Books</option>
                        <option>Entertainment</option>
                        <option>Shopping</option>
                        <option>Rent</option>
                        <option>Health</option>
                        <option>Utilities</option>
                        <option>Social</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </div>
                </div>
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

            <Card title="Transactions" className="flex-1 max-h-[300px] overflow-y-auto">
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                {expenses.slice().reverse().map((expense) => (
                  <motion.div 
                    key={expense.id} 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-lg group border-b border-slate-50 dark:border-slate-800 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                        {getCategoryIcon(expense.category)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white text-sm">{expense.category}</p>
                        <p className="text-[10px] text-slate-500">{expense.date}</p>
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