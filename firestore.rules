import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Plus, Trash2, Search, Edit3, Clock, ChevronRight, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'notes'),
      orderBy('updatedAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error('Notes snapshot error:', error);
      if (error.code === 'permission-denied') {
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  const createNote = async () => {
    if (!auth.currentUser) return;
    const newNote = {
      title: 'New Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const res = await addDoc(collection(db, 'users', auth.currentUser.uid, 'notes'), newNote);
    setSelectedNote({ id: res.id, ...newNote });
  };

  const updateNote = async (id: string, updates: any) => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    await updateDoc(doc(db, 'users', auth.currentUser.uid, 'notes', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    setTimeout(() => setIsSaving(false), 500);
  };

  const deleteNote = async (id: string) => {
    if (!auth.currentUser) return;
    await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'notes', id));
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full bg-white dark:bg-black font-sans relative overflow-hidden">
      {/* Sidebar List */}
      <div className={`flex-1 flex flex-col ${selectedNote ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">Vault</h2>
          <button onClick={createNote} className="p-3 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl shadow-lg">
            <Plus size={20} />
          </button>
        </div>

        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
            <input 
              placeholder="Search notes..."
              className="w-full h-11 pl-10 pr-4 bg-neutral-100 dark:bg-neutral-900 rounded-2xl outline-none focus:ring-1 focus:ring-neutral-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-24">
          {filteredNotes.map(note => (
            <motion.div 
              key={note.id}
              layoutId={note.id}
              onClick={() => setSelectedNote(note)}
              className="p-4 bg-neutral-50 dark:bg-neutral-900 border dark:border-neutral-800 border-neutral-100 rounded-3xl cursor-pointer hover:scale-[1.02] transition-transform group"
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold truncate pr-6">{note.title || 'Untitled Note'}</h3>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                  className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-500 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed mb-3">
                {note.content || 'Empty note...'}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                <Clock size={10} />
                {format(new Date(note.updatedAt), 'MMM dd, HH:mm')}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Editor Overlay/Side */}
      <AnimatePresence>
        {selectedNote && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute inset-0 bg-white dark:bg-black z-20 flex flex-col md:relative md:w-3/5 md:border-l dark:border-neutral-800 border-neutral-100"
          >
            <div className="p-4 border-b dark:border-neutral-900 border-neutral-100 flex items-center justify-between">
              <button 
                onClick={() => setSelectedNote(null)}
                className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-white transition-colors"
              >
                <ChevronRight size={18} className="rotate-180" /> Back
              </button>
              <div className="flex items-center gap-4">
                {isSaving && <span className="text-[10px] font-bold uppercase text-neutral-500 animate-pulse">Auto-saving...</span>}
                <button onClick={() => deleteNote(selectedNote.id)} className="p-2 text-neutral-500 hover:text-red-500">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col p-6 space-y-4">
              <input 
                className="text-3xl font-black bg-transparent outline-none tracking-tight"
                placeholder="Note Title"
                value={selectedNote.title}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedNote({...selectedNote, title: val});
                  updateNote(selectedNote.id, { title: val });
                }}
              />
              <textarea 
                className="flex-1 bg-transparent outline-none resize-none text-lg leading-relaxed placeholder:text-neutral-700"
                placeholder="Start writing..."
                value={selectedNote.content}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedNote({...selectedNote, content: val});
                  updateNote(selectedNote.id, { content: val });
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
