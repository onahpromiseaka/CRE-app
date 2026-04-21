import { useState, useEffect, useContext } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { User, Hash, Phone, Building, Briefcase, Mail, Moon, Sun, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ThemeContext } from '../App';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    if (!auth.currentUser) return;
    const fetch = async () => {
      const d = await getDoc(doc(db, 'users', auth.currentUser!.uid));
      setProfile(d.data());
    };
    fetch();
  }, []);

  if (!profile) return null;

  return (
    <div className="flex-1 p-4 bg-white dark:bg-black font-sans space-y-8">
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="w-24 h-24 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black flex items-center justify-center text-4xl font-black shadow-xl">
          {profile.fullName[0]}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight">{profile.fullName}</h2>
          <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">{profile.department}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-neutral-500 tracking-widest px-1">Credentials</h3>
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl border dark:border-neutral-800 border-neutral-100 overflow-hidden">
          <ProfileItem icon={<Hash size={18}/>} label="Reg Number" value={profile.registrationNumber} />
          <ProfileItem icon={<Briefcase size={18}/>} label="Specialization" value={profile.specialization} />
          <ProfileItem icon={<Mail size={18}/>} label="Email Address" value={profile.email} />
          <ProfileItem icon={<Phone size={18}/>} label="Contact" value={profile.phone} />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-neutral-500 tracking-widest px-1">Account Settings</h3>
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl border dark:border-neutral-800 border-neutral-100 overflow-hidden">
          <div 
            onClick={toggleTheme}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
                {theme === 'dark' ? <Moon size={18}/> : <Sun size={18}/>}
              </div>
              <span className="font-bold">Dark Mode</span>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-white' : 'bg-neutral-300'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${theme === 'dark' ? 'right-1 bg-black' : 'left-1 bg-white shadow-sm'}`} />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border-t dark:border-neutral-800 border-neutral-100">
            <div className="flex items-center gap-3 text-neutral-400">
              <div className="p-2 bg-white dark:bg-neutral-800 rounded-xl opacity-50">
                <ShieldCheck size={18}/>
              </div>
              <span className="font-bold">Two-Factor Auth</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Enabled</span>
          </div>
        </div>
      </div>

      <button 
        onClick={() => auth.signOut()}
        className="w-full py-4 text-red-500 font-black border border-red-500/20 rounded-2xl hover:bg-red-500/10 transition-colors"
      >
        Sign Out Securely
      </button>
    </div>
  );
}

function ProfileItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between p-4 border-b last:border-0 dark:border-neutral-800 border-neutral-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white dark:bg-neutral-800 rounded-xl shadow-sm text-neutral-500">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">{label}</span>
          <span className="font-bold">{value}</span>
        </div>
      </div>
      <ChevronRight size={16} className="text-neutral-500" />
    </div>
  );
}
