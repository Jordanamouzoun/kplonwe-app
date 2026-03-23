import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { 
  ArrowLeft, CheckCircle, 
  Clock, Trophy,
  ChevronRight, Play
} from 'lucide-react';
import type { Quiz } from '@/types/quiz.types';

export function QuizTakePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIdx, setCurrentIdx] = useState(-1); // -1 = Start screen
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'END'>('START');
  const [timeSpent, setTimeSpent] = useState(0);

  // Charger le quiz
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/quizzes/${id}/student`);
        if (res.data.success) {
          setQuiz(res.data.data);
        }
      } catch (err) {
        console.error('Erreur chargement quiz:', err);
        alert('Impossible de charger le quiz. Vérifiez qu\'il vous est bien assigné.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [id, navigate]);

  // Timer logic
  useEffect(() => {
    let timer: any;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else if (gameState === 'PLAYING' && timeLeft === 0) {
      // Temps écoulé pour cette question
      handleNext();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startQuiz = () => {
    setGameState('PLAYING');
    setCurrentIdx(0);
    const firstQ = quiz?.questions[0];
    setTimeLeft(firstQ?.duration || 0);
  };

  const handleAnswer = (answer: any) => {
    if (!quiz) return;
    const currentQ = quiz.questions[currentIdx];
    
    if (currentQ.type === 'MULTIPLE_CHOICE') {
      const currentAnswers = answers[currentQ.id] || [];
      const newAnswers = currentAnswers.includes(answer)
        ? currentAnswers.filter((a: any) => a !== answer)
        : [...currentAnswers, answer];
      setAnswers({ ...answers, [currentQ.id]: newAnswers });
    } else {
      setAnswers({ ...answers, [currentQ.id]: answer });
    }
  };

  const handleNext = useCallback(() => {
    if (!quiz) return;
    if (currentIdx < quiz.questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setTimeLeft(quiz.questions[nextIdx].duration || 0);
    } else {
      setGameState('END');
    }
  }, [currentIdx, quiz]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      const res = await api.post(`/quizzes/${id}/submit`, {
        answers: formattedAnswers,
        timeSpent
      });

      if (res.data.success) {
        navigate(`/quiz/results/${id}`);
      }
    } catch (err) {
      alert('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white font-black uppercase tracking-widest">Préparation du quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  // --- START SCREEN ---
  if (gameState === 'START') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 to-indigo-700 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-xl w-full">
          {quiz.coverImage && (
            <img src={quiz.coverImage} alt="" className="w-full h-48 object-cover rounded-2xl mb-8 shadow-2xl border-4 border-white/20" />
          )}
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">{quiz.title}</h1>
          <p className="text-blue-100 text-lg mb-8 opacity-90">{quiz.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Questions</p>
              <p className="text-2xl font-black">{quiz.questions.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Matière</p>
              <p className="text-2xl font-black">{quiz.subject}</p>
            </div>
          </div>

          <button 
            onClick={startQuiz}
            className="w-full bg-white text-primary-600 py-6 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 active:scale-95"
          >
            <Play size={24} fill="currentColor" /> COMMENCER !
          </button>
        </div>
      </div>
    );
  }

  // --- END SCREEN ---
  if (gameState === 'END') {
    return (
      <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full">
          <div className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Trophy size={48} className="text-indigo-900" />
          </div>
          <h1 className="text-4xl font-black mb-2">Quiz terminé !</h1>
          <p className="text-indigo-200 mb-10">Félicitations, vous avez répondu à toutes les questions.</p>
          
          <button 
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full bg-green-500 py-6 rounded-2xl font-black text-xl shadow-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-3"
          >
            {submitting ? 'Envoi en cours...' : 'VOIR MES RÉSULTATS'}
          </button>
        </div>
      </div>
    );
  }

  // --- PLAYING SCREEN ---
  const currentQ = quiz.questions[currentIdx];
  const progress = ((currentIdx + 1) / quiz.questions.length) * 100;
  const showTimer = currentQ.duration && currentQ.duration > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">{quiz.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Question</p>
            <p className="text-sm font-black text-gray-900">{currentIdx + 1}/{quiz.questions.length}</p>
          </div>

          {showTimer && (
            <div className={`
              flex items-center gap-2 px-4 py-1.5 rounded-full border-2 
              ${timeLeft <= 5 ? 'border-red-500 bg-red-50 text-red-600 animate-pulse' : 'border-gray-200 bg-gray-50 text-gray-600'}
            `}>
              <Clock size={16} />
              <span className="font-black text-lg tabular-nums">{timeLeft}s</span>
            </div>
          )}
        </div>

        <div className="w-24 text-right">
          <span className="text-xs font-black text-primary-600 uppercase tracking-widest">
            {currentQ.points} PTS
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full bg-primary-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Main Area */}
      <main className="flex-1 flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Question Image or Placeholder */}
          <div className="w-full md:w-1/2 aspect-video bg-white rounded-3xl shadow-lg overflow-hidden border-2 border-gray-100">
            {currentQ.coverImage ? (
              <img src={currentQ.coverImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <p className="text-4xl font-black text-gray-100 uppercase -rotate-12 italic">KPLONWÉ</p>
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 text-center md:text-left">
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
               <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                 {currentQ.question}
               </h3>
             </div>
          </div>
        </div>

        {/* Answers Container */}
        <div className="mt-8 flex-1">
          {currentQ.type === 'FREE_TEXT' ? (
            <div className="max-w-2xl mx-auto">
               <textarea
                 autoFocus
                 className="w-full p-6 text-xl font-bold bg-white border-4 border-gray-100 rounded-3xl shadow-xl focus:border-primary-500 focus:ring-0 transition-all placeholder:text-gray-200"
                 placeholder="Tapez votre réponse ici..."
                 rows={4}
                 value={answers[currentQ.id] || ''}
                 onChange={(e) => handleAnswer(e.target.value)}
               />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(currentQ.options || []).map((option: string, idx: number) => {
                const colors = [
                  'bg-red-500 hover:bg-red-600', 
                  'bg-blue-500 hover:bg-blue-600', 
                  'bg-amber-500 hover:bg-amber-600', 
                  'bg-green-500 hover:bg-green-600'
                ];
                const shapes = [
                  <div className="w-6 h-6 rotate-45 border-4 border-white" />,
                  <div className="w-6 h-6 rounded-full border-4 border-white" />,
                  <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-white" />,
                  <div className="w-6 h-6 border-4 border-white" />
                ];

                const colorIdx = idx % colors.length;
                const isSelected = currentQ.type === 'MULTIPLE_CHOICE' 
                  ? (answers[currentQ.id] || []).includes(String(idx))
                  : answers[currentQ.id] === String(idx);

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(String(idx))}
                    className={`
                      ${colors[colorIdx]} p-6 rounded-2xl shadow-lg flex items-center gap-4 text-left transition-all relative overflow-hidden group
                      ${isSelected ? 'ring-8 ring-indigo-300 scale-105 z-10' : 'hover:translate-y-[-4px] active:scale-95 opacity-90 hover:opacity-100'}
                    `}
                  >
                    <div className="bg-white/20 p-2 rounded-lg">
                      {shapes[colorIdx]}
                    </div>
                    <span className="text-white text-xl font-black flex-1 leading-tight">{option}</span>
                    {isSelected && (
                      <div className="bg-white rounded-full p-1 shadow-lg">
                        <CheckCircle size={24} className="text-green-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-auto pt-8 flex items-center justify-between">
           <div className="flex gap-4">
               {/* Precedent non utilisé car on avance forcement, Kahoot style */}
           </div>
           
           <button 
             onClick={handleNext}
             className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-primary-700 transition-colors flex items-center gap-2 group"
           >
             {currentIdx === quiz.questions.length - 1 ? 'FINALISER' : 'SUIVANT'}
             <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </main>
    </div>
  );
}
