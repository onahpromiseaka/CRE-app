import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { BarChart3, MessageSquare, Users, GraduationCap, Calendar, Activity, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export default function HistoryPage() {
  const [stats, setStats] = useState<any>(null);
  const [counts, setCounts] = useState({ chats: 0, lessons: 0 });

  useEffect(() => {
    if (!auth.currentUser) return;
    const fetch = async () => {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
      setStats(userDoc.data()?.stats || {});

      // Fetch extra counts
      const chatSnap = await getDocs(query(collection(db, 'chats'), where('participants', 'array-contains', auth.currentUser!.uid)));
      const lessonSnap = await getDocs(collection(db, 'users', auth.currentUser!.uid, 'lessons'));
      
      setCounts({
        chats: chatSnap.size,
        lessons: lessonSnap.size
      });
    };
    fetch();
  }, []);

  return (
    <div className="flex-1 bg-white dark:bg-black p-6 space-y-8 pb-24 font-sans">
      <div className="space-y-1">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">Insights</h2>
        <p className="text-[10px] font-black tracking-widest uppercase text-neutral-500">Your CRE Connect Analytics</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<MessageSquare className="text-blue-500"/>} 
          label="Messages" 
          value={stats?.messagesSent || 0} 
          sub="Lifetime"
        />
        <StatCard 
          icon={<Users className="text-purple-500"/>} 
          label="Connections" 
          value={counts.chats} 
          sub="Groups & Private"
        />
        <StatCard 
          icon={<GraduationCap className="text-green-500"/>} 
          label="Lessons" 
          value={stats?.lessonsCompleted || 0} 
          sub="Completed"
        />
        <StatCard 
          icon={<Calendar className="text-orange-500"/>} 
          label="Day Streak" 
          value={counts.lessons} 
          sub="Consistency"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase text-neutral-500 tracking-widest">Growth Progress</h3>
        <div className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border dark:border-neutral-800 border-neutral-100 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg"><Activity size={18}/></div>
              <span className="font-bold">Engagement Rate</span>
            </div>
            <span className="font-extrabold text-green-500">+12%</span>
          </div>
          
          <div className="space-y-4">
            <ProgressBar label="Tech Learning" progress={75} color="bg-blue-500" />
            <ProgressBar label="Network Activity" progress={45} color="bg-purple-500" />
            <ProgressBar label="Notes Productivity" progress={90} color="bg-green-500" />
          </div>
        </div>
      </div>

      <div className="p-6 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-3xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2"><Zap size={14} fill="currentColor"/> <span className="text-[10px] font-black uppercase tracking-widest">Elite Status</span></div>
          <h4 className="text-xl font-black italic tracking-tighter uppercase leading-none">Vanguard Member</h4>
        </div>
        <TrendingUp size={32} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="p-5 bg-neutral-50 dark:bg-neutral-900 border dark:border-neutral-800 border-neutral-100 rounded-3xl space-y-3"
    >
      <div className="p-2.5 w-fit rounded-xl bg-white dark:bg-neutral-800 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{label}</p>
        <p className="text-[9px] text-neutral-400 font-medium">{sub}</p>
      </div>
    </motion.div>
  );
}

function ProgressBar({ label, progress, color }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${progress}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}
