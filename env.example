import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, getDoc, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ChevronLeft, Send, Image as ImageIcon, Paperclip, Mic, Phone, Video, MoreVertical, Smile, File, ExternalLink, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function ChatDetail() {
  const { id } = useParams();
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const playSentSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
      audio.volume = 0.2;
      audio.play();
    } catch (e) {}
  };

  useEffect(() => {
    if (!id || !auth.currentUser) return;

    const unsubChat = onSnapshot(doc(db, 'chats', id), async (d) => {
      if (d.exists()) {
        const data = d.data();
        setChat(data);
        
        if (data.type === 'private') {
          const otherId = data.participants.find((p: string) => p !== auth.currentUser?.uid);
          const otherDoc = await getDoc(doc(db, 'users', otherId));
          if (otherDoc.exists()) {
            setOtherUser(otherDoc.data());
          }
        }
      }
    }, (error) => {
      console.error('Chat doc snapshot error:', error);
    });

    const q = query(
      collection(db, 'chats', id, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubMessages = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error('Messages list snapshot error:', error);
      if (error.code === 'permission-denied') {
        setLoading(false);
      }
    });

    return () => {
      unsubChat();
      unsubMessages();
    };
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !id || !auth.currentUser) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    playSentSound();

    try {
      const type = 'text'; // Default
      const payLoad: any = {
        senderId: auth.currentUser.uid,
        content: messageContent,
        type,
        createdAt: new Date().toISOString(),
        readBy: [auth.currentUser.uid]
      };

      await addDoc(collection(db, 'chats', id, 'messages'), payLoad);

      await updateDoc(doc(db, 'chats', id), {
        lastMessage: messageContent,
        lastMessageAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(error);
    }
  };

  const mockUpload = async (type: 'image' | 'file') => {
    if (!id || !auth.currentUser) return;
    const isImage = type === 'image';
    const content = isImage 
      ? `https://picsum.photos/seed/${Math.random()}/800/600` 
      : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    
    playSentSound();
    try {
      await addDoc(collection(db, 'chats', id, 'messages'), {
        senderId: auth.currentUser.uid,
        content,
        type,
        fileName: isImage ? 'image.jpg' : 'document.pdf',
        fileSize: isImage ? '240 KB' : '1.2 MB',
        createdAt: new Date().toISOString(),
        readBy: [auth.currentUser.uid]
      });
      await updateDoc(doc(db, 'chats', id), {
        lastMessage: isImage ? '📷 Image' : '📄 File',
        lastMessageAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return null;

  return (
    <div className="flex flex-col h-[100dvh] bg-[#efeae2] dark:bg-black">
      {/* Header */}
      <header className="flex items-center px-4 py-2 border-b dark:border-neutral-900 border-neutral-200 bg-white dark:bg-neutral-900 z-10">
        <button onClick={() => navigate('/chats')} className="p-2 -ml-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-1 items-center gap-3 ml-2">
          <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold">
            {otherUser?.fullName?.[0] || 'G'}
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">{otherUser?.fullName || 'Group Chat'}</h3>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"><Video size={20}/></button>
          <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"><Phone size={20}/></button>
          <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"><MoreVertical size={20}/></button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => {
          const isOwn = msg.senderId === auth.currentUser?.uid;
          const showTime = i === 0 || format(new Date(messages[i-1].createdAt), 'HH:mm') !== format(new Date(msg.createdAt), 'HH:mm');

          return (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}
            >
              <div className={`max-w-[80%] px-4 py-2.5 rounded-3xl relative shadow-sm transition-all hover:shadow-md ${
                isOwn 
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black rounded-tr-none' 
                  : 'bg-neutral-100 dark:bg-neutral-800 dark:text-white rounded-tl-none'
              }`}>
        {msg.type === 'image' ? (
          <div className="space-y-2">
            <img 
              src={msg.content} 
              alt="Sent" 
              className="rounded-lg max-w-full h-auto" 
              referrerPolicy="no-referrer"
            />
            {msg.caption && <p className="text-sm">{msg.caption}</p>}
          </div>
        ) : msg.type === 'file' ? (
          <div className="flex items-center gap-3 p-2 bg-neutral-100/10 rounded-xl">
            <div className="p-2 bg-neutral-100/20 rounded-lg">
              <File size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{msg.fileName || 'Attached File'}</p>
              <p className="text-[10px] opacity-60 uppercase">{msg.fileSize || 'Unknown size'}</p>
            </div>
            <a href={msg.content} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-full">
              <Download size={16} />
            </a>
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{msg.content}</p>
        )}
        <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-400'}`}>
                  <span className="text-[10px]">{format(new Date(msg.createdAt), 'HH:mm')}</span>
                  {isOwn && (
                    <span className="text-[10px] font-bold">✓✓</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-2"
          >
            <div className="bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-2xl flex gap-1 items-center">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-neutral-900 border-t dark:border-neutral-900 border-neutral-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
          <div className="flex gap-1">
            <button onClick={() => mockUpload('file')} type="button" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"><Paperclip size={20}/></button>
          </div>
          <div className="flex-1 relative">
            <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"><Smile size={20}/></button>
            <input 
              placeholder="Type a message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="w-full h-12 pl-12 pr-12 bg-neutral-100 dark:bg-neutral-800 rounded-full outline-none focus:ring-1 focus:ring-neutral-500 transition-all font-medium"
            />
            <button onClick={() => mockUpload('image')} type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"><ImageIcon size={20}/></button>
          </div>
          {newMessage.trim() ? (
            <motion.button 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              type="submit" 
              className="p-3 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full shadow-lg hover:opacity-90 active:scale-90 transition-all"
            >
              <Send size={22} />
            </motion.button>
          ) : (
            <button type="button" className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
              <Mic size={22} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
