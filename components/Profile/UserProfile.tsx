import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, Mail, BookOpen, GraduationCap, MapPin, 
  Award, Zap, CheckCircle, Calendar, Wallet, Moon, Edit2, Save
} from 'lucide-react';
import { Card } from '../Shared/Card';
import { Button } from '../Shared/Button';
import { useAppContext } from '../../context/AppContext';
import { Achievement } from '../../types';

export const UserProfile: React.FC = () => {
  const { user, updateUserProfile } = useAppContext();
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

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <Card noPadding className="overflow-visible">
        <div className="relative h-48 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-t-2xl">
          <div className="absolute -bottom-16 left-8 flex items-end">
            <div className="relative">
               <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-full p-1.5 shadow-xl">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
               </div>
               <div className="absolute bottom-2 right-2 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-xs font-bold text-white" title="Online">
               </div>
            </div>
            <div className="mb-4 ml-4 hidden md:block text-white">
               <h1 className="text-3xl font-bold">{user.name}</h1>
               <p className="opacity-90">{user.branch} • Sem {user.semester}</p>
            </div>
          </div>
          <div className="absolute top-4 right-4">
             <Button 
                variant={isEditing ? 'primary' : 'secondary'} 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                icon={isEditing ? <Save size={16}/> : <Edit2 size={16}/>}
             >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
             </Button>
          </div>
        </div>

        <div className="mt-20 px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left: Bio & Stats */}
           <div className="lg:col-span-2 space-y-8">
              <div className="md:hidden">
                 <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
                 <p className="text-slate-500">{user.branch}</p>
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
                    </div>
                 </div>
              )}
           </div>

           {/* Right: Gamification */}
           <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-6">
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
        </div>
      </Card>
    </div>
  );
};
