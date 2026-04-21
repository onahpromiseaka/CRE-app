import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, addDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Users, User, MessageSquare, UserPlus, MessageSquarePlus, Filter, Hash, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import ContactsModal from '../components/modals/ContactsModal';

export default function ChatList() {
  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab ] = useState('All'); // All, Friends, Groups
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch Chats
    const qChats = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', auth.currentUser.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubChats = onSnapshot(qChats, async (snap) => {
      try {
        const chatData = await Promise.all(snap.docs.map(async (d) => {
          const data = d.data();
          let name = data.name;
          if (data.type === 'private') {
            const otherId = data.participants.find((id: string) => id !== auth.currentUser?.uid);
            if (otherId) {
              const otherDoc = await getDoc(doc(db, 'users', otherId));
              if (otherDoc.exists()) name = otherDoc.data().fullName;
            }
          }
          return { id: d.id, ...data, displayName: name };
        }));
        setChats(chatData);
        setLoading(false);
      } catch (err) { console.warn(err); }
    }, (error) => setLoading(false));

    // Fetch Contacts for categorization
    const qContacts = query(collection(db, 'users', auth.currentUser.uid, 'contacts'));
    const unsubContacts = onSnapshot(qContacts, (snap) => {
      setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubChats(); unsubContacts(); };
  }, []);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

  // Smart Filtering
  const filteredDisplay = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    // Filter chats based on tab and search
    let results = chats.filter(chat => {
      const matchesSearch = chat.displayName?.toLowerCase().includes(term) || 
                          chat.lastMessage?.toLowerCase().includes(term);
      const matchesTab = activeTab === 'All' || 
                        (activeTab === 'Groups' && chat.type === 'group') ||
                        (activeTab === 'Friends' && chat.type === 'private');
      return matchesSearch && matchesTab;
    });

    return results;
  }, [chats, searchTerm, activeTab]);

  // People & Groups discovery for search results
  const discoveredPeople = useMemo(() => {
    if (!searchTerm) return [];
    return contacts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [contacts, searchTerm]);

  const handleCreateGroup = async () => {
    if (!auth.currentUser || !groupName.trim() || selectedUsers.length === 0) return;
    try {
      const participants = [auth.currentUser.uid, ...selectedUsers.map(u => u.id)];
      const newChat = await addDoc(collection(db, 'chats'), {
        name: groupName,
        participants,
        type: 'group',
        lastMessage: 'Group created',
        lastMessageAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser.uid
      });
      setIsGroupModalOpen(false);
      navigate(`/chats/${newChat.id}`);
    } catch (error) { console.error(error); }
  };

  const handleSearchGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const q = query(collection(db, 'users'), where('email', '>=', searchTerm.trim().toLowerCase()), where('email', '<=', searchTerm.trim().toLowerCase() + '\uf8ff'));
    const snap = await getDocs(q);
    setSearchResults(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.id !== auth.currentUser?.uid));
  };

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-4 border-neutral-900 dark:border-white border-t-transparent rounded-full" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 animate-pulse">Syncing Encrypted Logs...</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black relative font-sans">
      {/* Search & Categories */}
      <div className="p-6 pb-2 space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={18} />
          <input 
            placeholder="Search People, Groups, Messages..." 
            className="w-full h-12 pl-12 pr-4 bg-neutral-100 dark:bg-neutral-900 rounded-[22px] outline-none border-2 border-transparent focus:border-neutral-200 dark:focus:border-neutral-800 transition-all font-bold placeholder:text-neutral-400 placeholder:font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearchGlobal(e)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {['All', 'Friends', 'Groups'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black scale-105' 
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Search Contexts Labels */}
        {searchTerm && (
          <div className="py-2 space-y-4">
            {discoveredPeople.length > 0 && (
              <div className="space-y-2">
                <h4 className="px-2 text-[9px] font-black uppercase text-neutral-400 tracking-widest flex items-center gap-2">
                   <User size={10} /> People
                </h4>
                {discoveredPeople.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-all">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold">{p.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{p.name}</p>
                      <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{p.isRegistered ? 'On CRE Connect ✅' : 'Invite to CRE'}</p>
                    </div>
                    {p.isRegistered && <button onClick={() => navigate(`/chats/${p.id}`)} className="p-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl"><Mail size={14} /></button>}
                  </div>
                ))}
              </div>
            )}
            
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="px-2 text-[9px] font-black uppercase text-neutral-400 tracking-widest flex items-center gap-2">
                   <Hash size={10} /> Global Discovery
                </h4>
                {searchResults.map(u => (
                  <div key={u.id} onClick={() => navigate(`/profile/${u.id}`)} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-3xl cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold">{u.fullName[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{u.fullName}</p>
                      <p className="text-[10px] text-neutral-500 font-medium">{u.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="h-px bg-neutral-100 dark:bg-neutral-900 my-4" />
            <h4 className="px-2 text-[9px] font-black uppercase text-neutral-400 tracking-widest">Conversations</h4>
          </div>
        )}

        {filteredDisplay.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="p-8 bg-neutral-50 dark:bg-neutral-900 rounded-[40px] opacity-20">
              <MessageSquare size={48} />
            </div>
            <p className="text-neutral-400 text-sm font-bold uppercase tracking-widest">Spectral silence</p>
          </div>
        ) : (
          filteredDisplay.map(chat => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={chat.id}
            >
              <Link 
                to={`/chats/${chat.id}`}
                className="flex items-center gap-4 px-3 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all rounded-[32px] mb-1 group"
              >
                <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center font-black text-2xl border-2 dark:border-neutral-800 border-neutral-100 group-hover:scale-110 transition-transform">
                  {chat.type === 'group' ? <Users size={28} /> : (chat.displayName?.[0] || '?')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-black tracking-tight truncate pr-2 text-neutral-900 dark:text-white uppercase italic text-sm">{chat.displayName}</h3>
                    <span className="text-[9px] text-neutral-400 font-black uppercase tracking-widest">
                      {chat.lastMessageAt && formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {chat.type === 'group' && <span className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-[8px] font-bold text-neutral-500 uppercase">G</span>}
                    <p className="text-xs text-neutral-400 font-medium truncate italic leading-none">{chat.lastMessage}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      {/* Modern Multi-Action FAB */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {isAddMenuOpen && (
            <>
              <motion.button
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                onClick={() => { setIsContactsOpen(true); setIsAddMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 border dark:border-neutral-800 border-neutral-100 rounded-2xl shadow-xl hover:scale-105 transition-all group"
              >
                <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">New Chat</span>
                <div className="p-2 bg-neutral-100 dark:bg-white dark:text-black rounded-lg">
                  <UserPlus size={16} />
                </div>
              </motion.button>
              
              <motion.button
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ delay: 0.05 }}
                onClick={() => { setIsGroupModalOpen(true); setIsAddMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 border dark:border-neutral-800 border-neutral-100 rounded-2xl shadow-xl hover:scale-105 transition-all group"
              >
                <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">Create Group</span>
                <div className="p-2 bg-neutral-100 dark:bg-white dark:text-black rounded-lg">
                  <Users size={16} />
                </div>
              </motion.button>
            </>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
          className={`p-5 rounded-3xl shadow-2xl transition-all duration-300 z-50 ${
            isAddMenuOpen 
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-black rotate-45' 
              : 'bg-neutral-900 text-white dark:bg-white dark:text-black hover:scale-110 active:scale-95'
          }`}
        >
          {isAddMenuOpen ? <Plus size={32} /> : <MessageSquarePlus size={32} />}
        </button>
      </div>

      <ContactsModal isOpen={isContactsOpen} onClose={() => setIsContactsOpen(false)} />
      
      {/* Group Modal - Cleaned up to match modern theme */}
      <AnimatePresence>
        {isGroupModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsGroupModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-[40px] p-8 shadow-2xl border dark:border-neutral-800">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6">Forge Group</h2>
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Codename</label>
                  <input placeholder="ENTER GROUP NAME" className="w-full h-14 px-6 bg-neutral-50 dark:bg-neutral-800 rounded-2xl outline-none border-2 border-transparent focus:border-neutral-100 dark:focus:border-neutral-700 font-bold" value={groupName} onChange={e => setGroupName(e.target.value)} />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Participants</label>
                   <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto no-scrollbar p-1">
                      {contacts.filter(c => c.isRegistered).map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => selectedUsers.some(u => u.id === c.uid) ? setSelectedUsers(selectedUsers.filter(u => u.id !== c.uid)) : setSelectedUsers([...selectedUsers, {id: c.uid, fullName: c.name}])}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${selectedUsers.some(u => u.id === c.uid) ? 'bg-neutral-900 text-white dark:bg-white dark:text-black scale-105' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}
                        >
                          {c.name}
                        </button>
                      ))}
                      {contacts.filter(c => c.isRegistered).length === 0 && <p className="text-[10px] text-neutral-500 font-medium">Add some contacts to the vault first.</p>}
                   </div>
                </div>

                <button onClick={handleCreateGroup} disabled={!groupName.trim() || selectedUsers.length === 0} className="w-full h-16 bg-neutral-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest rounded-2xl disabled:opacity-30 shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Establish Link</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
