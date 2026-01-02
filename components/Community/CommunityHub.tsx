
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Heart, MessageCircle, Share2, Calendar, 
  MapPin, Users, UserPlus, Filter, Hash, MoreHorizontal,
  Trophy, Star, Rocket, Sparkles, Code, Clock, TrendingUp
} from 'lucide-react';
import { Card } from '../Shared/Card';
import { Button } from '../Shared/Button';

// --- Type Definitions ---

interface Post {
  id: number;
  user: {
    name: string;
    avatar: string;
    branch: string;
    year: string;
  };
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  time: string;
  codeSnippet?: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  tags: string[];
  image: string;
}

interface Mentor {
  id: number;
  name: string;
  role: string;
  expertise: string[];
  rating: number;
  students: number;
  avatar: string;
}

// --- Mock Data ---

const POSTS: Post[] = [
  {
    id: 1,
    user: { name: "Sarah Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", branch: "Computer Science", year: "3rd Year" },
    content: "Just shipped my first React Native app for the campus hackathon! 🚀 It tracks shuttle bus timings in real-time using WebSocket. Check out the repo below!",
    tags: ["React Native", "Hackathon", "Open Source"],
    likes: 124,
    comments: 18,
    time: "2h ago",
    codeSnippet: "const useBusLocation = () => {\n  const [loc, setLoc] = useState(null);\n  // WebSocket logic here...\n  return loc;\n}"
  },
  {
    id: 2,
    user: { name: "Rahul Verma", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul", branch: "Mechanical", year: "4th Year" },
    content: "Anyone participating in the BAJA SAE India this year? We're looking for a suspension lead for our ATV. DM if interested! 🏎️",
    tags: ["Automobile", "SAE", "Mechanical"],
    likes: 89,
    comments: 42,
    time: "5h ago"
  }
];

const EVENTS: Event[] = [
  {
    id: 1,
    title: "AI & Robotics Summit 2024",
    date: "MAR 15",
    time: "10:00 AM",
    location: "Main Auditorium",
    attendees: 340,
    tags: ["Workshop", "Tech"],
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 2,
    title: "Midnight Hack: FinTech",
    date: "MAR 22",
    time: "09:00 PM",
    location: "Innovation Hub",
    attendees: 120,
    tags: ["Hackathon", "Coding"],
    image: "https://images.unsplash.com/photo-1504384308090-c54be3852f92?auto=format&fit=crop&q=80&w=1000"
  }
];

const MENTORS: Mentor[] = [
  {
    id: 1,
    name: "Dr. Anjali Gupta",
    role: "Professor, AI Ethics",
    expertise: ["Machine Learning", "Research", "Python"],
    rating: 4.9,
    students: 120,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali"
  },
  {
    id: 2,
    name: "James Wilson",
    role: "Alumni @ Google",
    expertise: ["System Design", "Career Prep", "Cloud"],
    rating: 5.0,
    students: 85,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James"
  }
];

// --- Sub-Components ---

const PostCard: React.FC<{ post: Post }> = ({ post }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-3xl p-6 shadow-glass hover:shadow-lg transition-all duration-300"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img src={post.user.avatar} alt={post.user.name} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" />
          <div className="absolute -bottom-1 -right-1 bg-primary-500 text-[8px] text-white px-1.5 py-0.5 rounded-full font-bold border-2 border-white dark:border-slate-900">
            {post.user.year}
          </div>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">{post.user.name}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{post.user.branch} • {post.time}</p>
        </div>
      </div>
      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
        <MoreHorizontal size={20} />
      </button>
    </div>

    <div className="space-y-3 mb-4">
      <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
        {post.content}
      </p>
      {post.codeSnippet && (
        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto border border-slate-800">
          <pre className="text-xs font-mono text-emerald-400">{post.codeSnippet}</pre>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {post.tags.map(tag => (
          <span key={tag} className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-lg flex items-center gap-1">
            <Hash size={10} /> {tag}
          </span>
        ))}
      </div>
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-white/20 dark:border-slate-700/50">
      <div className="flex gap-4">
        <button className="flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors group">
          <Heart size={18} className="group-hover:fill-rose-500 transition-colors" />
          <span className="text-xs font-semibold">{post.likes}</span>
        </button>
        <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors">
          <MessageCircle size={18} />
          <span className="text-xs font-semibold">{post.comments}</span>
        </button>
      </div>
      <button className="text-slate-400 hover:text-primary-500 transition-colors">
        <Share2 size={18} />
      </button>
    </div>
  </motion.div>
);

const EventCard: React.FC<{ event: Event }> = ({ event }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="group relative overflow-hidden rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 shadow-glass"
  >
    <div className="h-32 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
      <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl px-3 py-1.5 text-center shadow-lg">
        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{event.date.split(' ')[0]}</span>
        <span className="block text-xl font-black text-slate-900 dark:text-white leading-none">{event.date.split(' ')[1]}</span>
      </div>
      <div className="absolute bottom-4 left-4 z-20">
        <div className="flex gap-2">
          {event.tags.map(tag => (
            <span key={tag} className="text-[10px] font-bold bg-white/20 text-white backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
    
    <div className="p-5">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{event.title}</h3>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Clock size={14} className="text-primary-500" />
          {event.time}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <MapPin size={14} className="text-primary-500" />
          {event.location}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Users size={14} className="text-primary-500" />
          {event.attendees} Registered
        </div>
      </div>
      <Button className="w-full text-xs font-bold py-2.5 shadow-lg shadow-primary-500/20">
        Register Now
      </Button>
    </div>
  </motion.div>
);

const MentorCard: React.FC<{ mentor: Mentor }> = ({ mentor }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="flex flex-col items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-3xl p-6 shadow-glass relative overflow-hidden"
  >
    {/* Decorative Background */}
    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary-500/10 to-indigo-500/10" />
    
    <div className="relative z-10 mb-4">
      <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl mx-auto rotate-3 group-hover:rotate-0 transition-transform duration-300">
        <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
      </div>
      <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg shadow-md flex items-center gap-1 border border-slate-100 dark:border-slate-700">
        <Star size={12} className="fill-amber-400 text-amber-400" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{mentor.rating}</span>
      </div>
    </div>

    <div className="text-center w-full mb-4">
      <h3 className="font-bold text-slate-900 dark:text-white text-lg">{mentor.name}</h3>
      <p className="text-xs text-primary-600 dark:text-primary-400 font-medium uppercase tracking-wide mb-3">{mentor.role}</p>
      
      <div className="flex flex-wrap justify-center gap-1.5 mb-4">
        {mentor.expertise.map(skill => (
          <span key={skill} className="text-[10px] px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {skill}
          </span>
        ))}
      </div>
    </div>

    <div className="mt-auto w-full grid grid-cols-2 gap-3">
      <Button variant="secondary" className="text-xs w-full justify-center">Profile</Button>
      <Button className="text-xs w-full justify-center">Connect</Button>
    </div>
  </motion.div>
);

// --- Main Component ---

export const CommunityHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'events' | 'mentors'>('feed');

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Mesh</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-md">
            Connect with fellow engineers, discover hackathons, and find your mentor in the global EngiLife network.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Search topics, events..." 
              className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all dark:text-white placeholder:text-slate-400"
            />
          </div>
          <Button className="shrink-0 w-12 h-12 !p-0 rounded-xl flex items-center justify-center shadow-xl shadow-primary-500/20">
            <Plus size={24} />
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 p-1.5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-2xl w-full md:w-fit overflow-x-auto scrollbar-hide">
        {[
          { id: 'feed', label: 'Buzz Feed', icon: Sparkles },
          { id: 'events', label: 'Events & Hacks', icon: Trophy },
          { id: 'mentors', label: 'Find Mentors', icon: Rocket },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all relative ${
              activeTab === tab.id 
                ? 'text-primary-600 dark:text-primary-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabCommunity"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <tab.icon size={16} /> {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'feed' && (
          <motion.div 
            key="feed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Main Feed */}
            <div className="lg:col-span-8 space-y-6">
              {POSTS.map(post => <PostCard key={post.id} post={post} />)}
            </div>

            {/* Sidebar Widgets */}
            <div className="lg:col-span-4 space-y-6">
              {/* Trending Topics */}
              <Card title="Trending Now" noPadding className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-0">
                <div className="p-4 space-y-4">
                  {[
                    { topic: "Generative AI", posts: "2.4k" },
                    { topic: "Quantum Computing", posts: "856" },
                    { topic: "Rust vs C++", posts: "1.2k" },
                    { topic: "Internships 2024", posts: "5.1k" }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-indigo-300 font-bold text-xs group-hover:bg-white/20 transition-colors">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">{item.topic}</p>
                          <p className="text-[10px] text-slate-400">{item.posts} posts</p>
                        </div>
                      </div>
                      <TrendingUp size={16} className="text-emerald-400" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Suggested Groups */}
              <Card title="Communities">
                <div className="space-y-4">
                  {[
                    { name: "Code & Coffee", members: 450, icon: Code, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { name: "Robotics Club", members: 320, icon: Rocket, color: "text-rose-500", bg: "bg-rose-500/10" },
                    { name: "Data Science Hub", members: 890, icon: Filter, color: "text-blue-500", bg: "bg-blue-500/10" }
                  ].map((group, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${group.bg} ${group.color}`}>
                          <group.icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{group.name}</p>
                          <p className="text-[10px] text-slate-500">{group.members} members</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'events' && (
          <motion.div 
            key="events"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {EVENTS.map(event => <EventCard key={event.id} event={event} />)}
            {EVENTS.map(event => <EventCard key={`dup-${event.id}`} event={{...event, id: event.id + 10}} />)}
          </motion.div>
        )}

        {activeTab === 'mentors' && (
          <motion.div 
            key="mentors"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {MENTORS.map(mentor => <MentorCard key={mentor.id} mentor={mentor} />)}
            {MENTORS.map(mentor => <MentorCard key={`dup-${mentor.id}`} mentor={{...mentor, id: mentor.id + 10}} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
