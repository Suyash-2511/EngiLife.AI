import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, Mail, BookOpen, GraduationCap, MapPin, 
  Award, Zap, CheckCircle, Calendar, Wallet, Moon, Edit2, Save, Shield, Smartphone, LogOut
} from 'lucide-react';
import { Card } from '../Shared/Card';
import { Button } from '../Shared/Button';
import { useAppContext } from '../../context/AppContext';
import { Achievement } from '../../types';

export const UserProfile: React.FC = () => {
  const { user, updateUserProfile } = useAppContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    university: user?.university || '',
    branch: user?.branch || '',
    semester: user?.semester || 1,
    bio: user?.bio || '',
  });

  if (!user) return null;

  // XP Progress Calculation
  const xpForNextLevel = user.level * 1000;
  const progress = (user.xp % 1000) / 1000 * 100;

  const handleSave = () => {
    updateUserProfile(formData);
    setIsEditing(false);
  };

  const AchievementIcon = ({ name, unlocked }: { name: string, unlocked: boolean }) => {
    const className = `w-6 h-6 ${unlocked ? 'text-white' : 'text-slate-400'}`;
    switch(name) {
        case 'CheckCircle': return <CheckCircle className={className} />;
        case 'Calendar': return <Calendar className={className} />;
        case 'Moon': return <Moon className={className} />;
        case 'Wallet': return <Wallet className={className} />;
        default: return <Award className={className} />;
    }
  };

  const AVATAR_OPTIONS = [
      `https://ui-avatars.com/api/?name=${user.name}&background=random`,
      `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`,
      `https://api.dicebear.com/7.x/lorelei/svg?seed=${user.name}`,
      `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`,
      `https://api.dicebear.com/7.x/micah/svg?seed=${user.name}`,
  ];

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <Card noPadding className="overflow-visible">
        <div className="relative h-48 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-t-2xl">
          <div className="absolute -bottom-16 left-8 flex items-end group">
            <div className="relative cursor-pointer">
               <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-full p-1.5 shadow-xl transition-transform transform group-hover:scale-105">
                  <img 
                    src={user.avatar || AVATAR_OPTIONS[0]} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover bg-slate-200"
                  />
                  {/* Avatar Edit Overlay */}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 className="text-white" size={24} />
                  </div>
               </div>
               <div className="absolute bottom-2 right-2 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-xs font-bold text-white" title="Online">
               </div>
               
               {/* Simplified Avatar Picker (Desktop hover interaction simulation) */}
               <div className="absolute top-full mt-2 left-0 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-3 grid grid-cols-5 gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-20 border border-slate-200 dark:border-slate-800">
                   {AVATAR_OPTIONS.map((url, i) => (
                       <button 
                         key={i} 
                         onClick={() => updateUserProfile({ avatar: url })}
                         className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-primary-500"
                       >
                           <img src={url} className="w-full h-full object-cover" alt="avatar option" />
                       </button>
                   ))}
               </div>
            </div>
            <div className="mb-4 ml-4 hidden md:block text-white">
               <h1 className="text-3xl font-bold">{user.name}</h1>
               <p className="opacity-90">{user.branch} • Sem {user.semester}</p>
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
             <div className="bg-white/10 backdrop-blur-md rounded-lg p-1 flex">
                 <button onClick={() => setActiveTab('profile')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === 'profile' ? 'bg-white text-primary-600 shadow' : 'text-white hover:bg-white/10'}`}>Profile</button>
                 <button onClick={() => setActiveTab('security')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === 'security' ? 'bg-white text-primary-600 shadow' : 'text-white hover:bg-white/10'}`}>Security</button>
             </div>
          </div>
        </div>

        <div className="mt-20 px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
           {activeTab === 'profile' ? (
             <>
               {/* Left: Bio & Stats */}
               <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="md:hidden">
                     <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
                     <p className="text-slate-500">{user.branch}</p>
                  </div>

                  <div className="flex justify-end">
                     <Button 
                        variant={isEditing ? 'primary' : 'secondary'} 
                        size="sm"
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        icon={isEditing ? <Save size={16}/> : <Edit2 size={16}/>}
                     >
                        {isEditing ? 'Save Details' : 'Edit Details'}
                     </Button>
                  </div>

                  {isEditing ? (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                           <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-slate-500 uppercase">University</label>
                           <input value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} className="w-full px-3 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-slate-500 uppercase">Branch</label>
                           <input value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full px-3 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-slate-500 uppercase">Semester</label>
                           <input type="number" value={formData.semester} onChange={e => setFormData({...formData, semester: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div className="col-span-full space-y-1">
                           <label className="text-xs font-bold text-slate-500 uppercase">Bio</label>
                           <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-3 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white resize-none h-20" />
                        </div>
                     </motion.div>
                  ) : (
                     <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">About Me</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{user.bio}</p>
                        
                        <div className="flex flex-wrap gap-4 mt-6">
                           <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                              <GraduationCap size={16} className="text-primary-500" />
                              <span>{user.university}</span>
                           </div>
                           <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                              <BookOpen size={16} className="text-primary-500" />
                              <span>Semester {user.semester}</span>
                           </div>
                           <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                              <Mail size={16} className="text-primary-500" />
                              <span>{user.email}</span>
                           </div>
                           <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                              <Calendar size={16} className="text-primary-500" />
                              <span>Joined {user.joinedDate}</span>
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               {/* Right: Gamification */}
               <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="text-center">
                     <div className="inline-block p-1 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 mb-2">
                        <div className="bg-white dark:bg-slate-900 rounded-full px-4 py-1 text-xs font-bold text-amber-600 dark:text-amber-500">
                           LEVEL {user.level}
                        </div>
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Scholar</h3>
                     <p className="text-xs text-slate-500 uppercase tracking-widest">{user.xp} Total XP</p>
                  </div>

                  <div className="space-y-2">
                     <div className="flex justify-between text-xs font-medium text-slate-500">
                        <span>Progress to Lvl {user.level + 1}</span>
                        <span>{user.xp % 1000} / 1000 XP</span>
                     </div>
                     <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${progress}%` }} 
                          className="h-full bg-primary-500 rounded-full"
                        />
                     </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                     <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Award size={18} className="text-amber-500" /> Achievements
                     </h4>
                     <div className="grid grid-cols-4 gap-2">
                        {user.achievements.map((badge) => (
                           <div key={badge.id} className="group relative flex flex-col items-center">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                 badge.unlocked 
                                 ? 'bg-gradient-to-br from-primary-500 to-indigo-600 shadow-lg shadow-primary-500/30' 
                                 : 'bg-slate-200 dark:bg-slate-800 grayscale opacity-50'
                              }`}>
                                 <AchievementIcon name={badge.icon} unlocked={badge.unlocked} />
                              </div>
                              
                              {/* Tooltip */}
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 bg-slate-900 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                                 <p className="font-bold mb-0.5">{badge.title}</p>
                                 <p className="text-slate-300 text-[10px]">{badge.description}</p>
                                 {badge.unlocked && <p className="text-emerald-400 text-[10px] mt-1">Unlocked!</p>}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
             </>
           ) : (
             <div className="col-span-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-2xl mx-auto space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="text-emerald-500" /> Security Settings
                    </h3>
                    
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600">
                                <Smartphone size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h4>
                                <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={user.security.twoFactorEnabled}
                                onChange={(e) => updateUserProfile({ security: { ...user.security, twoFactorEnabled: e.target.checked } })}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                        <h4 className="font-bold mb-4">Login History</h4>
                        <div className="flex justify-between items-center text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                            <span>Last active session</span>
                            <span className="text-slate-500 font-mono">{new Date(user.security.lastLogin).toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end">
                       <Button variant="danger" icon={<LogOut size={16}/>}>Log Out All Devices</Button>
                    </div>
                </div>
             </div>
           )}
        </div>
      </Card>
    </div>
  );
};