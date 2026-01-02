
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, Mail, BookOpen, GraduationCap, MapPin, 
  Award, Zap, CheckCircle, Calendar, Wallet, Moon, Edit2, Save, Shield, Smartphone, LogOut,
  Camera, TrendingUp, ListTodo, Star, Settings, Lock, Upload, X, ZoomIn, Move, Check, 
  Github, Linkedin, Globe, Twitter, Plus, ExternalLink, AlertTriangle, Trash2, Briefcase, Code, Layers, Sparkles
} from 'lucide-react';
import { Card } from '../Shared/Card';
import { Button } from '../Shared/Button';
import { useAppContext } from '../../context/AppContext';
import { Achievement, Project, Experience } from '../../types';
import { api } from '../../services/api';

// --- Image Cropper Component ---
const ImageCropper = ({ imageSrc, onCancel, onSave }: { imageSrc: string, onCancel: () => void, onSave: (base64: string) => void }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleSave = () => {
    if (!imgRef.current) return;

    const canvas = document.createElement('canvas');
    const size = 300; // Output size
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Draw Image
    const scaleFactor = size / 256; 
    
    ctx.translate(size/2, size/2);
    ctx.translate(offset.x * scaleFactor, offset.y * scaleFactor);
    ctx.scale(zoom, zoom);
    ctx.drawImage(imgRef.current, -imgRef.current.naturalWidth / 2, -imgRef.current.naturalHeight / 2);

    onSave(canvas.toDataURL('image/jpeg', 0.9));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden max-w-md w-full border border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-white">Adjust Profile Picture</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20}/></button>
        </div>
        
        <div className="p-6 flex flex-col items-center">
          <div 
            ref={containerRef}
            className="w-64 h-64 rounded-full overflow-hidden relative cursor-move ring-4 ring-primary-500/20 bg-slate-100 dark:bg-slate-950"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <Move className="text-white/50 opacity-0 group-hover:opacity-100" />
             </div>
             <img 
               ref={imgRef}
               src={imageSrc} 
               alt="Crop target"
               className="max-w-none absolute left-1/2 top-1/2 select-none"
               style={{ 
                 transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                 cursor: isDragging ? 'grabbing' : 'grab'
               }}
               draggable={false}
             />
          </div>

          <div className="w-full mt-6 space-y-2">
             <div className="flex justify-between text-xs text-slate-500 font-medium uppercase tracking-wider">
               <span>Zoom</span>
               <span>{Math.round(zoom * 100)}%</span>
             </div>
             <div className="flex items-center gap-3">
               <ZoomIn size={16} className="text-slate-400" />
               <input 
                 type="range" 
                 min="0.5" 
                 max="3" 
                 step="0.1" 
                 value={zoom}
                 onChange={(e) => setZoom(parseFloat(e.target.value))}
                 className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
               />
             </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
           <Button variant="ghost" onClick={onCancel}>Cancel</Button>
           <Button onClick={handleSave} icon={<Check size={18} />}>Save Picture</Button>
        </div>
      </div>
    </div>
  );
};

const AchievementIcon = ({ name, unlocked }: { name: string, unlocked: boolean }) => {
  const className = `w-8 h-8 ${unlocked ? 'text-white drop-shadow-md' : 'text-slate-400'}`;
  switch(name) {
      case 'CheckCircle': return <CheckCircle className={className} />;
      case 'Calendar': return <Calendar className={className} />;
      case 'Moon': return <Moon className={className} />;
      case 'Wallet': return <Wallet className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      default: return <Star className={className} />;
  }
};

const BadgeItem: React.FC<{ badge: Achievement }> = ({ badge }) => (
  <motion.div 
      whileHover={{ y: -5, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative group aspect-square flex flex-col items-center justify-center rounded-3xl p-4 transition-all duration-300 border-2 overflow-hidden ${
          badge.unlocked 
          ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 border-white/20 shadow-xl shadow-indigo-500/20' 
          : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
      }`}
  >
      {badge.unlocked && (
          <div className="absolute inset-0 bg-white/20 blur-xl group-hover:bg-white/30 transition-colors pointer-events-none" />
      )}
      
      {!badge.unlocked && (
          <div className="absolute top-3 right-3 text-slate-400">
              <Lock size={14} />
          </div>
      )}

      <div className="relative z-10 flex flex-col items-center text-center transform group-hover:scale-110 transition-transform duration-300">
          <div className={`p-4 rounded-2xl mb-3 shadow-inner ${badge.unlocked ? 'bg-white/20 backdrop-blur-md' : 'bg-slate-200 dark:bg-slate-800'}`}>
              <AchievementIcon name={badge.icon} unlocked={badge.unlocked} />
          </div>
          
          <h4 className={`font-black text-xs uppercase tracking-wider mb-1 ${badge.unlocked ? 'text-white' : 'text-slate-500'}`}>
              {badge.title}
          </h4>
          
          <div className="opacity-0 group-hover:opacity-100 absolute top-full mt-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-lg pointer-events-none transition-opacity z-20">
              {badge.description}
          </div>
      </div>

      {badge.unlocked && (
          <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] bg-gradient-to-br from-transparent via-white/20 to-transparent rotate-45 group-hover:animate-shine pointer-events-none" />
      )}
  </motion.div>
);

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark',
];

const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color}`}>
          <Icon size={24} />
      </div>
      <div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{value}</h3>
      </div>
  </div>
);

export const UserProfile: React.FC = () => {
  const { user, setUser, updateUserProfile, subjects, tasks } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'achievements' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    university: user?.university || '',
    branch: user?.branch || '',
    semester: user?.semester || 1,
    bio: user?.bio || '',
    cgpa: user?.cgpa || 0,
    skills: user?.skills || [],
    socialLinks: user?.socialLinks || {}
  });

  const [newSkill, setNewSkill] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState<Project>({ id: '', title: '', description: '', techStack: [] });
  const [newProjectStack, setNewProjectStack] = useState('');
  const [showExpForm, setShowExpForm] = useState(false);
  const [newExp, setNewExp] = useState<Experience>({ id: '', role: '', company: '', duration: '', description: '', type: 'Internship' });

  if (!user) return null;

  const xpForNextLevel = user.level * 1000;
  const progress = (user.xp % 1000) / 1000 * 100;
  
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const avgAttendance = subjects.length > 0 
      ? Math.round(subjects.reduce((acc, s) => acc + (s.total > 0 ? (s.attended / s.total) : 0), 0) / subjects.length * 100)
      : 0;

  const handleSave = () => {
    updateUserProfile(formData);
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setUser(null); 
    } catch (e) {
        console.error("Deletion failed", e);
        setIsDeleting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setUploadImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropSave = (base64: string) => {
    updateUserProfile({ avatar: base64 });
    setUploadImage(null);
  };

  const handleAddSkill = () => {
      const currentSkills = Array.isArray(formData.skills) ? formData.skills : [];
      if (newSkill.trim() && !currentSkills.includes(newSkill.trim())) {
          const updatedSkills = [...currentSkills, newSkill.trim()];
          setFormData({ ...formData, skills: updatedSkills });
          updateUserProfile({ skills: updatedSkills }); 
          setNewSkill('');
      }
  };

  const handleRemoveSkill = (skill: string) => {
      const currentSkills = Array.isArray(formData.skills) ? formData.skills : [];
      const updatedSkills = currentSkills.filter(s => s !== skill);
      setFormData({ ...formData, skills: updatedSkills });
      updateUserProfile({ skills: updatedSkills });
  };

  // ... (rest of the component logic remains similar but ensures safe array access) ...
  
  const handleAddProject = () => {
      if (!newProject.title) return;
      const project: Project = { 
          ...newProject, 
          id: Date.now().toString(),
          techStack: newProjectStack.split(',').map(s => s.trim()).filter(s => s) 
      };
      const updatedProjects = [...(user.projects || []), project];
      updateUserProfile({ projects: updatedProjects });
      setShowProjectForm(false);
      setNewProject({ id: '', title: '', description: '', techStack: [] });
      setNewProjectStack('');
  };

  const handleDeleteProject = (id: string) => {
      const updatedProjects = (user.projects || []).filter(p => p.id !== id);
      updateUserProfile({ projects: updatedProjects });
  };

  const handleAddExperience = () => {
      if (!newExp.role || !newExp.company) return;
      const experience: Experience = { ...newExp, id: Date.now().toString() };
      const updatedExperience = [...(user.experience || []), experience];
      updateUserProfile({ experience: updatedExperience });
      setShowExpForm(false);
      setNewExp({ id: '', role: '', company: '', duration: '', description: '', type: 'Internship' });
  };

  const handleDeleteExperience = (id: string) => {
      const updatedExperience = (user.experience || []).filter(e => e.id !== id);
      updateUserProfile({ experience: updatedExperience });
  };

  // ... (JSX rendering using safe access) ...
  // Ensure that mapped arrays are always arrays
  const skillsList = Array.isArray(formData.skills) ? formData.skills : [];
  const projectsList = Array.isArray(user.projects) ? user.projects : [];
  const experienceList = Array.isArray(user.experience) ? user.experience : [];
  const achievementsList = Array.isArray(user.achievements) ? user.achievements : [];

  return (
    <div className="space-y-6 pb-12">
      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
      {uploadImage && <ImageCropper imageSrc={uploadImage} onCancel={() => setUploadImage(null)} onSave={handleCropSave} />}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isDeleting && setShowDeleteConfirm(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-rose-100 dark:border-rose-900/30">
              <div className="p-8 text-center">
                 <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={40} className="text-rose-600 dark:text-rose-400" />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Delete Account Permanently?</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">This action <span className="font-bold text-rose-600 dark:text-rose-400">cannot be undone</span>. All your data will be erased.</p>
                 <div className="flex flex-col gap-3">
                    <Button variant="danger" className="w-full py-3.5" onClick={handleDeleteAccount} isLoading={isDeleting} icon={!isDeleting && <Trash2 size={18} />}>Delete My Data Forever</Button>
                    <button disabled={isDeleting} onClick={() => setShowDeleteConfirm(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-semibold transition-colors disabled:opacity-50">Wait, Keep My Account</button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative">
          <div className="h-64 rounded-3xl overflow-hidden relative shadow-lg shadow-primary-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-rose-500 to-indigo-600 animate-gradient-x"></div>
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
          <div className="relative px-6 sm:px-10 -mt-20 flex flex-col md:flex-row items-end md:items-center gap-6">
               <div className="relative group">
                   <div className="w-40 h-40 rounded-full border-4 border-white dark:border-slate-950 shadow-2xl overflow-hidden bg-white relative z-10 group">
                       <img src={user.avatar || AVATAR_OPTIONS[0]} alt="Avatar" className="w-full h-full object-cover" />
                       <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]">
                           <Camera className="text-white mb-1" />
                           <span className="text-white text-[10px] font-bold uppercase tracking-wider">Change</span>
                       </div>
                   </div>
                   <div className="absolute bottom-2 right-2 z-20 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-slate-950 rounded-full" title="Online" />
               </div>
               <div className="flex-1 pb-4 text-center md:text-left">
                   <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{user.name}</h1>
                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-slate-600 dark:text-slate-300">
                       <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-sm"><GraduationCap size={14} className="text-primary-500"/> {user.branch || 'Engineering'}</span>
                       <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-sm"><MapPin size={14} className="text-primary-500"/> {user.university || 'University'}</span>
                   </div>
               </div>
               <div className="pb-4 flex gap-3">
                   <Button variant={isEditing ? 'primary' : 'secondary'} onClick={() => activeTab === 'settings' ? handleSave() : setActiveTab('settings')} icon={<Settings size={18} />}>
                     {activeTab === 'settings' ? 'Save Changes' : 'Edit Profile'}
                   </Button>
               </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center md:justify-start border-b border-slate-200 dark:border-slate-800 px-4 overflow-x-auto scrollbar-hide">
          {['overview', 'portfolio', 'achievements', 'settings'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap capitalize ${activeTab === tab ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                  {tab === 'portfolio' ? 'Portfolio & CV' : tab === 'achievements' ? 'Badges & XP' : tab}
              </button>
          ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <StatCard icon={Zap} label="Current Level" value={user.level} color="bg-amber-500" />
                          <StatCard icon={TrendingUp} label="Avg Attendance" value={`${avgAttendance}%`} color="bg-emerald-500" />
                          <StatCard icon={ListTodo} label="Tasks Done" value={completedTasksCount} color="bg-primary-500" />
                      </div>
                      <Card title="About Me">
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{user.bio || "No bio added yet. Go to settings to tell us about yourself!"}</p>
                      </Card>
                      <Card title="Technical Arsenal">
                          {skillsList.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                  {skillsList.map((skill, i) => (
                                      <span key={i} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">{skill}</span>
                                  ))}
                              </div>
                          ) : (
                              <p className="text-slate-400 text-sm italic">No skills listed. Add them in settings.</p>
                          )}
                      </Card>
                  </div>
                  <div className="space-y-6">
                      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-700">
                          <div className="relative z-10 flex flex-col h-full justify-between min-h-[180px]">
                              <div>
                                  <h3 className="text-lg font-bold tracking-tight">ENGILIFE ID</h3>
                                  <p className="text-slate-400 text-[10px] uppercase tracking-widest">{user.id.slice(0,12)}</p>
                              </div>
                              <div>
                                  <div className="flex justify-between text-xs font-bold mb-2"><span>Level {user.level}</span><span className="text-slate-300">{user.xp} XP</span></div>
                                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-2"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-amber-400 to-orange-500"/></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </motion.div>
          )}

          {activeTab === 'portfolio' && (
              <motion.div key="portfolio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <Card title="Experience" action={<Button size="sm" variant="secondary" onClick={() => setShowExpForm(true)} icon={<Plus size={14}/>}>Add Role</Button>}>
                      {showExpForm && (
                          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                  <input placeholder="Role" value={newExp.role} onChange={e => setNewExp({...newExp, role: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none text-sm" />
                                  <input placeholder="Company" value={newExp.company} onChange={e => setNewExp({...newExp, company: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none text-sm" />
                              </div>
                              <div className="flex justify-end gap-2"><Button size="sm" onClick={handleAddExperience}>Save</Button></div>
                          </div>
                      )}
                      <div className="space-y-4">
                          {experienceList.length > 0 ? experienceList.map((exp) => (
                              <div key={exp.id} className="relative pl-6 pb-2 border-l border-slate-200 dark:border-slate-800 group">
                                  <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-primary-500"></div>
                                  <div className="flex justify-between items-start">
                                      <div><h4 className="font-bold text-slate-900 dark:text-white">{exp.role}</h4><p className="text-sm text-slate-500">{exp.company}</p></div>
                                      <button onClick={() => handleDeleteExperience(exp.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                                  </div>
                              </div>
                          )) : <p className="text-slate-400 text-sm italic">No experience added.</p>}
                      </div>
                  </Card>
                  <Card title="Projects" action={<Button size="sm" variant="secondary" onClick={() => setShowProjectForm(true)} icon={<Plus size={14}/>}>Add Project</Button>}>
                      {showProjectForm && (
                          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                              <input placeholder="Title" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="w-full px-3 py-2 mb-3 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none text-sm" />
                              <div className="flex justify-end gap-2"><Button size="sm" onClick={handleAddProject}>Save</Button></div>
                          </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {projectsList.length > 0 ? projectsList.map((proj) => (
                              <div key={proj.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative group">
                                  <button onClick={() => handleDeleteProject(proj.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                                  <h4 className="font-bold text-slate-900 dark:text-white">{proj.title}</h4>
                                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{proj.description}</p>
                              </div>
                          )) : <p className="col-span-full text-slate-400 text-sm italic text-center">No projects.</p>}
                      </div>
                  </Card>
                  <Card title="Skills Management">
                      <div className="flex flex-wrap gap-2 mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[60px]">
                          {skillsList.map((skill, i) => (
                              <span key={i} className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm flex items-center gap-2">
                                  {skill}
                                  <button onClick={() => handleRemoveSkill(skill)} className="text-slate-400 hover:text-red-500"><X size={14}/></button>
                              </span>
                          ))}
                          <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddSkill()} className="bg-transparent outline-none text-sm flex-1 min-w-[120px] placeholder:text-slate-400" placeholder="Type skill & Press Enter..." />
                      </div>
                  </Card>
              </motion.div>
          )}

          {activeTab === 'achievements' && (
              <motion.div key="achievements" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Card>
                      <div className="text-center mb-8"><h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Hall of Fame</h2><p className="text-slate-500 text-sm">Unlock badges by solving problems.</p></div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {achievementsList.map((badge) => <BadgeItem key={badge.id} badge={badge} />)}
                          {Array.from({ length: Math.max(0, 10 - achievementsList.length) }).map((_, i) => (
                              <div key={`locked-${i}`} className="aspect-square rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center opacity-50 grayscale">
                                  <div className="p-4 rounded-2xl bg-slate-200 dark:bg-slate-800 mb-2"><Lock size={20} className="text-slate-400" /></div>
                              </div>
                          ))}
                      </div>
                  </Card>
              </motion.div>
          )}

          {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card title="Edit Profile">
                      <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Full Name</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white outline-none text-sm" /></div>
                              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">University</label><input value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white outline-none text-sm" /></div>
                          </div>
                          <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Bio</label><textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white outline-none resize-none h-24 text-sm" /></div>
                          <div className="pt-4"><Button onClick={handleSave} className="w-full" icon={<Save size={18}/>}>Save Changes</Button></div>
                      </div>
                  </Card>
                  <div className="space-y-6">
                      <Card title="Security" action={<Shield size={18} className="text-emerald-500"/>}>
                          <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400"><Smartphone size={20}/></div>
                                      <div><p className="font-bold text-sm text-slate-900 dark:text-white">Two-Factor Auth</p></div>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" className="sr-only peer" checked={user.security.twoFactorEnabled} onChange={(e) => updateUserProfile({ security: { ...user.security, twoFactorEnabled: e.target.checked } })} />
                                      <motion.div className={`w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer-focus:outline-none peer relative`} animate={{ backgroundColor: user.security.twoFactorEnabled ? '#ea580c' : '' }}>
                                          <motion.div layout className="absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5" animate={{ x: user.security.twoFactorEnabled ? 20 : 0 }} />
                                      </motion.div>
                                  </label>
                              </div>
                          </div>
                      </Card>
                      <Card title="Danger Zone" className="border-red-100 dark:border-red-900/30">
                          <div className="flex flex-col gap-2">
                              <Button variant="danger" icon={<LogOut size={16}/>}>Log Out All Devices</Button>
                              <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} className="bg-red-100 text-red-700 hover:bg-red-200 border-transparent">Delete Account Permanently</Button>
                          </div>
                      </Card>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};
