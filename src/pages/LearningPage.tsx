import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { generateDailyLesson } from '../services/gemini';
import { GraduationCap, CheckCircle, ChevronRight, BookOpen, Brain, Trophy, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';

export default function LearningPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<any>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchUser = async () => {
      const d = await getDoc(doc(db, 'users', auth.currentUser!.uid));
      setUserProfile(d.data());
    };
    fetchUser();

    const q = query(collection(db, 'users', auth.currentUser.uid, 'lessons'), orderBy('dayNumber', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLessons(data);
      if (data.length > 0) {
        // Find the most recent lesson
        const latest = data[0];
        setCurrentLesson(latest);
      }
      setLoading(false);
    }, (error) => {
      console.error('Learning snapshot error:', error);
      if (error.code === 'permission-denied') {
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  const startNewDay = async () => {
    if (!auth.currentUser || !userProfile) return;
    setGenerating(true);
    
    try {
      const nextDay = lessons.length + 1;
      const lessonData = await generateDailyLesson(userProfile.specialization, nextDay);
      
      const lessonId = `day-${nextDay}`;
      const newLesson = {
        dayNumber: nextDay,
        title: lessonData.title || `Day ${nextDay}: ${userProfile.specialization}`,
        content: lessonData.content,
        completed: false,
        quiz: lessonData.quiz,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', auth.currentUser.uid, 'lessons', lessonId), newLesson);
      setCurrentLesson({ id: lessonId, ...newLesson });
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!currentLesson?.quiz || !auth.currentUser) return;
    
    let score = 0;
    currentLesson.quiz.questions.forEach((q: any, idx: number) => {
      if (quizAnswers[idx] === q.correct) score++;
    });

    const passed = score >= currentLesson.quiz.questions.length * 0.7;
    setQuizResult({ score, total: currentLesson.quiz.questions.length, passed });

    if (passed) {
      confetti();
      await updateDoc(doc(db, 'users', auth.currentUser.uid, 'lessons', currentLesson.id), {
        completed: true
      });
      // Update global user stats
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        'stats.lessonsCompleted': (userProfile?.stats?.lessonsCompleted || 0) + 1
      });
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto mb-2" /> Loading Pathway...</div>;

  const hasLessonToday = lessons.length > 0 && 
    new Date(lessons[0].createdAt).toDateString() === new Date().toDateString();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black p-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">Daily Pathway</h2>
          <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest">{userProfile?.specialization}</p>
        </div>
        <Trophy size={32} className="text-yellow-500" />
      </div>

      <AnimatePresence mode="wait">
        {!currentLesson || (!hasLessonToday && !currentLesson.completed) ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="p-8 bg-neutral-100 dark:bg-neutral-900 rounded-full">
              <Brain size={64} className="text-neutral-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Ready for Day {lessons.length + 1}?</h3>
              <p className="text-neutral-500 max-w-xs mx-auto">Click below to generate your personalized AI lesson based on your specialization.</p>
            </div>
            <button 
              onClick={startNewDay}
              disabled={generating}
              className="px-8 py-4 bg-neutral-900 dark:bg-white text-white dark:text-black font-black rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {generating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              Generate Today's Lesson
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="lesson"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 overflow-y-auto space-y-8"
          >
            {!quizMode ? (
              <div className="space-y-6 pb-24">
                <div className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border dark:border-neutral-800 border-neutral-100">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-neutral-500 mb-4 tracking-widest">
                    <BookOpen size={14} />
                    Day {currentLesson.dayNumber} Lesson
                  </div>
                  <h1 className="text-3xl font-black tracking-tight mb-6">{currentLesson.title}</h1>
                  <div className="prose dark:prose-invert prose-neutral max-w-none prose-p:leading-relaxed">
                    <ReactMarkdown>{currentLesson.content}</ReactMarkdown>
                  </div>
                </div>
                
                <button 
                  onClick={() => setQuizMode(true)}
                  className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-black font-black rounded-2xl flex items-center justify-center gap-3"
                >
                  Take Daily Quiz
                  <ChevronRight size={20} />
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <button onClick={() => setQuizMode(false)} className="text-sm font-bold flex items-center gap-2 text-neutral-500">
                  <ChevronRight size={18} className="rotate-180" /> Back to Lesson
                </button>
                
                <div className="space-y-8">
                  {currentLesson.quiz.questions.map((q: any, qIdx: number) => (
                    <div key={qIdx} className="space-y-4">
                      <p className="font-bold text-lg">{qIdx + 1}. {q.q}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((opt: string, oIdx: number) => (
                          <button 
                            key={oIdx}
                            onClick={() => {
                              const newAns = [...quizAnswers];
                              newAns[qIdx] = oIdx;
                              setQuizAnswers(newAns);
                            }}
                            className={`p-4 text-left rounded-2xl border-2 transition-all font-medium ${
                              quizAnswers[qIdx] === oIdx 
                                ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800' 
                                : 'border-neutral-100 dark:border-neutral-900 hover:border-neutral-200'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pb-24">
                  {quizResult ? (
                    <div className={`p-6 rounded-3xl text-center space-y-4 ${quizResult.passed ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'} border`}>
                      <h3 className="text-2xl font-black">{quizResult.passed ? 'Lesson Mastered!' : 'Try Again!'}</h3>
                      <p className="font-bold">Score: {quizResult.score} / {quizResult.total}</p>
                      {quizResult.passed ? (
                        <p className="text-sm">You have completed today's requirement. See you tomorrow!</p>
                      ) : (
                        <button onClick={() => setQuizResult(null)} className="px-6 py-2 bg-neutral-900 text-white rounded-xl text-sm font-bold">Retake Quiz</button>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={handleQuizSubmit}
                      disabled={quizAnswers.length < currentLesson.quiz.questions.length}
                      className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-black font-black rounded-2xl disabled:opacity-50"
                    >
                      Submit Evaluation
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Sparkles({ size }: any) {
  return (
    <motion.div 
      animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <GraduationCap size={size} />
    </motion.div>
  );
}
