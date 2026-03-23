import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Plus, Trash2, Save, Image as ImageIcon, 
  Clock, ChevronRight, ChevronLeft,
  CheckCircle2, Circle, Type, Layout,
  Send, X
} from 'lucide-react';
import type { Quiz, QuizQuestion, QuestionType, PointsType } from '@/types/quiz.types';

const QUESTION_TYPES: { type: QuestionType; label: string; icon: any }[] = [
  { type: 'SINGLE_CHOICE', label: 'Choix unique', icon: Circle },
  { type: 'MULTIPLE_CHOICE', label: 'Choix multiple', icon: CheckCircle2 },
  { type: 'FREE_TEXT', label: 'Texte libre', icon: Type },
];

const POINTS_TYPES: { type: PointsType; label: string; color: string }[] = [
  { type: 'STANDARD', label: 'Standard', color: 'bg-blue-100 text-blue-700' },
  { type: 'DOUBLE', label: 'Points doubles', color: 'bg-orange-100 text-orange-700' },
  { type: 'NONE', label: 'Pas de points', color: 'bg-gray-100 text-gray-700' },
];

const TIME_LIMITS = [5, 10, 20, 30, 60, 90, 120, 240, 0]; // 0 = illimité

export function QuizCreatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!id;

  // State du Quiz
  const [quiz, setQuiz] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    subject: '',
    coverImage: '',
    status: 'DRAFT',
  });

  // State des Questions
  const [questions, setQuestions] = useState<Partial<QuizQuestion>[]>([
    {
      question: '',
      type: 'SINGLE_CHOICE',
      options: ['', ''],
      correctAnswer: '0',
      points: 1,
      pointsType: 'STANDARD',
      duration: 20,
      order: 0
    }
  ]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger le quiz si on est en mode édition
  useEffect(() => {
    if (id) {
      const fetchQuiz = async () => {
        try {
          const res = await api.get(`/quizzes/${id}`);
          if (res.data.success) {
            const data = res.data.data;
            setQuiz({
              title: data.title,
              description: data.description,
              subject: data.subject,
              coverImage: data.coverImage,
              status: data.status,
            });
            setQuestions(data.questions.map((q: any) => {
              let opts = q.options;
              if (typeof opts === 'string') {
                try { opts = JSON.parse(opts); } catch (e) { opts = null; }
              }
              return {
                ...q,
                options: Array.isArray(opts) && opts.length > 0 ? opts : ['', '']
              };
            }));
          }
        } catch (error) {
          console.error('Erreur chargement quiz:', error);
        }
      };
      fetchQuiz();
    }
  }, [id]);

  const activeQuestion = questions[activeIdx];

  const updateActiveQuestion = (fields: Partial<QuizQuestion>) => {
    const updated = [...questions];
    updated[activeIdx] = { ...updated[activeIdx], ...fields };
    setQuestions(updated);
  };

  const addQuestion = () => {
    const newQuestion: Partial<QuizQuestion> = {
      question: '',
      type: 'SINGLE_CHOICE',
      options: ['', ''],
      correctAnswer: '0',
      points: 1,
      pointsType: 'STANDARD',
      duration: 20,
      order: questions.length
    };
    setQuestions([...questions, newQuestion]);
    setActiveIdx(questions.length);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    if (activeIdx >= updated.length) setActiveIdx(updated.length - 1);
  };

  const handleImageUpload = async (file: File, type: 'quiz' | 'question') => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/quizzes/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        if (type === 'quiz') {
          setQuiz({ ...quiz, coverImage: res.data.data.url });
        } else {
          updateActiveQuestion({ coverImage: res.data.data.url });
        }
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
    }
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!quiz.title || !quiz.subject) {
      alert('Veuillez remplir le titre et la matière');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...quiz,
        status,
        questions: questions.map((q, i) => ({
          ...q,
          order: i,
          options: q.type === 'FREE_TEXT' ? null : (Array.isArray(q.options) && q.options.length > 0 ? q.options : ['', '']),
        }))
      };

      if (isEditMode) {
        await api.put(`/quizzes/${id}`, payload);
      } else {
        await api.post('/quizzes', payload);
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-64px)] bg-[#f2f2f2] font-sans lg:overflow-hidden">
      
      {/* ── SIDEBAR : Sommaire des questions ── */}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-r border-gray-200 flex flex-col shadow-sm z-10 hidden md:flex">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="font-bold text-gray-700">Questions</span>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{questions.length}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {questions.map((q, idx) => (
            <div 
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`relative group cursor-pointer p-3 rounded-lg border-2 transition-all ${
                activeIdx === idx 
                  ? 'border-primary-500 bg-primary-50 shadow-sm' 
                  : 'border-transparent bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xs font-bold text-gray-400 mt-0.5">{idx + 1}</span>
                <div className="flex-1 truncate">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {q.question || "Pas de texte..."}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={10} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400">{q.duration === 0 ? '∞' : `${q.duration}s`}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeQuestion(idx); }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          
          <button 
            onClick={addQuestion}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 hover:bg-white transition-all"
          >
            <Plus size={24} className="mb-1" />
            <span className="text-xs font-bold uppercase tracking-wider">Ajouter</span>
          </button>
        </div>
      </aside>
      
      {/* Mobile Question List (horizontal) */}
      <div className="md:hidden flex overflow-x-auto p-4 gap-3 bg-white border-b border-gray-200">
          {questions.map((_, idx) => (
             <button
               key={idx}
               onClick={() => setActiveIdx(idx)}
               className={`shrink-0 w-10 h-10 rounded-lg border-2 font-bold ${
                 activeIdx === idx ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-gray-50'
               }`}
             >
               {idx + 1}
             </button>
          ))}
          <button onClick={addQuestion} className="shrink-0 w-10 h-10 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <Plus size={18} />
          </button>
      </div>

      {/* ── CONTENU PRINCIPAL : Éditeur ── */}
      <main className="flex-1 overflow-y-auto relative flex flex-col items-center p-4 md:p-8">
        
        {/* Header de l'éditeur */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary-400 overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              {quiz.coverImage ? (
                <img src={quiz.coverImage} className="w-full h-full object-cover" alt="Cover" />
              ) : (
                <ImageIcon className="text-gray-300 group-hover:text-primary-400" size={24} />
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'quiz')}
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Titre du Quiz..."
                className="text-2xl font-black text-gray-800 bg-transparent border-none focus:ring-0 placeholder-gray-300 w-full"
                value={quiz.title}
                onChange={(e) => setQuiz({...quiz, title: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Matière (ex: Mathématiques)"
                className="text-sm font-bold text-primary-600 bg-transparent border-none focus:ring-0 placeholder-primary-200"
                value={quiz.subject}
                onChange={(e) => setQuiz({...quiz, subject: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="bg-white" onClick={() => handleSave('DRAFT')} disabled={loading}>
              <Save size={18} className="mr-2" /> Brouillon
            </Button>
            <Button onClick={() => handleSave('PUBLISHED')} disabled={loading}>
              {loading ? 'Publication...' : <>Publier <Send size={18} className="ml-2" /></>}
            </Button>
          </div>
        </div>

        {/* Carte de Question (Kahoot Style) */}
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl mb-8 border border-gray-100">
          <div className="p-8 space-y-8">
            {/* Titre de la question */}
            <textarea 
              placeholder="Saisissez votre question ici..."
              rows={2}
              className="w-full text-center text-3xl font-bold text-gray-800 bg-transparent border-none focus:ring-0 placeholder-gray-200 resize-none px-4 py-2 bg-gray-50 rounded-xl leading-relaxed"
              value={activeQuestion?.question || ''}
              onChange={(e) => updateActiveQuestion({ question: e.target.value })}
            />

            {/* Zone Media (Image de la question) */}
            <div className="flex justify-center relative group">
              <div 
                className="w-full max-w-md aspect-video bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-primary-400 transition-all overflow-hidden"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleImageUpload(file, 'question');
                  };
                  input.click();
                }}
              >
                {activeQuestion?.coverImage ? (
                  <img src={activeQuestion.coverImage} className="w-full h-full object-cover" alt="Q Cover" />
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4 text-primary-500 group-hover:scale-110 transition-transform">
                      <ImageIcon size={32} />
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Ajouter un média</p>
                  </>
                )}
              </div>
              {activeQuestion?.coverImage && (
                <button 
                  onClick={(e) => { e.stopPropagation(); updateActiveQuestion({ coverImage: '' }); }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Réponses */}
            <div className="space-y-6 min-h-[150px] bg-gray-50/30 p-4 rounded-2xl border border-dashed border-gray-100">
              {!activeQuestion ? (
                <div className="p-8 text-center text-gray-400">Sélectionnez une question</div>
              ) : activeQuestion.type !== 'FREE_TEXT' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(activeQuestion.options || []).map((opt, oIdx) => {
                      const isCorrect = activeQuestion.type === 'MULTIPLE_CHOICE'
                        ? (activeQuestion.correctAnswer || '').split(',').includes(String(oIdx))
                        : String(activeQuestion.correctAnswer) === String(oIdx);

                      return (
                        <div 
                          key={oIdx}
                          className={`relative flex items-center p-1 rounded-xl border-4 transition-all ${
                            isCorrect
                              ? 'border-green-400 bg-white shadow-md'
                              : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200'
                          }`}
                        >
                          <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-black text-white shrink-0 ${
                            oIdx % 4 === 0 ? 'bg-red-500' : 
                            oIdx % 4 === 1 ? 'bg-blue-500' : 
                            oIdx % 4 === 2 ? 'bg-orange-500' : 'bg-green-500'
                          }`}>
                            {oIdx % 4 === 0 ? '▲' : oIdx % 4 === 1 ? '◆' : oIdx % 4 === 2 ? '●' : '■'}
                          </div>
                          <input 
                            type="text" 
                            placeholder={`Réponse ${oIdx + 1}`}
                            className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-gray-700 px-4 py-3 placeholder-gray-300"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...activeQuestion.options!];
                              newOpts[oIdx] = e.target.value;
                              updateActiveQuestion({ options: newOpts });
                            }}
                          />
                          <div className="flex items-center gap-1 pr-2">
                             <button 
                                onClick={() => {
                                  let newCorrect;
                                  if (activeQuestion.type === 'MULTIPLE_CHOICE') {
                                    const current = (activeQuestion.correctAnswer || '').split(',').filter(v => v !== '');
                                    if (current.includes(String(oIdx))) {
                                      newCorrect = current.filter(v => v !== String(oIdx)).join(',');
                                    } else {
                                      newCorrect = [...current, String(oIdx)].join(',');
                                    }
                                  } else {
                                    newCorrect = String(oIdx);
                                  }
                                  updateActiveQuestion({ correctAnswer: newCorrect });
                                }}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isCorrect
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-gray-300 hover:border-green-400 text-transparent'
                                }`}
                              >
                                <CheckCircle2 size={18} />
                              </button>
                              {activeQuestion.options!.length > 2 && (
                                <button 
                                  onClick={() => {
                                    const newOpts = activeQuestion.options!.filter((_, i) => i !== oIdx);
                                    // Ajuster correctAnswer si besoin
                                    let newCorrect = activeQuestion.correctAnswer;
                                    if (activeQuestion.type === 'MULTIPLE_CHOICE') {
                                      const current = (activeQuestion.correctAnswer || '').split(',').filter(v => v !== '');
                                      newCorrect = current
                                        .map(v => parseInt(v))
                                        .filter(v => v !== oIdx)
                                        .map(v => v > oIdx ? String(v - 1) : String(v))
                                        .join(',');
                                    } else {
                                      const currentVal = parseInt(activeQuestion.correctAnswer || '0');
                                      if (currentVal === oIdx) newCorrect = '0';
                                      else if (currentVal > oIdx) newCorrect = String(currentVal - 1);
                                    }
                                    updateActiveQuestion({ options: newOpts, correctAnswer: newCorrect });
                                  }}
                                  className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                  <X size={16} />
                                </button>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button 
                    onClick={() => {
                      const newOpts = [...(activeQuestion.options || []), ''];
                      updateActiveQuestion({ options: newOpts });
                    }}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 font-bold hover:border-primary-400 hover:text-primary-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Ajouter une proposition
                  </button>
                </>
              ) : (
                <div className="col-span-2 p-8 bg-gray-50 rounded-2xl border-4 border-dashed border-gray-200 text-center">
                  <p className="text-gray-400 font-bold mb-4">L'élève devra saisir sa réponse dans un champ texte.</p>
                  <Input 
                    label="Réponse correcte attendue"
                    value={activeQuestion.correctAnswer}
                    onChange={(e) => updateActiveQuestion({ correctAnswer: e.target.value })}
                    placeholder="Ex: Napoléon"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Boutons de navigation rapide */}
        <div className="flex gap-4">
          <button 
            disabled={activeIdx === 0}
            onClick={() => setActiveIdx(activeIdx - 1)}
            className="p-3 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md disabled:opacity-30"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            disabled={activeIdx === questions.length - 1}
            onClick={() => setActiveIdx(activeIdx + 1)}
            className="p-3 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md disabled:opacity-30"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </main>

      {/* ── PANEL DROIT : Paramètres de la question ── */}
      <aside className="w-full lg:w-80 bg-white border-t lg:border-l border-gray-200 p-6 flex flex-col shadow-sm">
        <h2 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-wider">
          <Layout size={20} className="text-primary-500" /> Paramètres
        </h2>

        <div className="space-y-8 flex-1 overflow-y-auto pr-2">
          {!activeQuestion ? (
            <div className="p-8 text-center text-gray-400">Aucune question active</div>
          ) : (
            <>
              {/* Type de Question */}
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-3 block tracking-widest">Type de question</label>
                <div className="space-y-2">
                  {QUESTION_TYPES.map(qt => (
                    <button 
                      key={qt.type}
                      onClick={() => updateActiveQuestion({ type: qt.type })}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        activeQuestion.type === qt.type
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                          : 'border-gray-100 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${activeQuestion.type === qt.type ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <qt.icon size={18} />
                      </div>
                      <span className="font-bold text-sm">{qt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Limite de temps */}
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-3 block tracking-widest">Temps imparti</label>
                <div className="bg-gray-50 p-2 rounded-xl grid grid-cols-3 gap-1">
                  {TIME_LIMITS.map(t => (
                    <button 
                      key={t}
                      onClick={() => updateActiveQuestion({ duration: t })}
                      className={`py-2 text-xs font-black rounded-lg transition-all ${
                        activeQuestion.duration === t
                          ? 'bg-white shadow-md text-primary-600 border border-primary-100'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {t === 0 ? 'Illimité' : `${t}s`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Points */}
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-3 block tracking-widest">Attribution des points</label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <input 
                      type="number"
                      className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-primary-500 focus:ring-0 font-black text-center text-lg"
                      value={activeQuestion.points || 0}
                      onChange={(e) => updateActiveQuestion({ points: parseFloat(e.target.value) || 0, pointsType: 'STANDARD' })}
                    />
                    <span className="font-black text-gray-400 uppercase text-xs">PTS</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {POINTS_TYPES.map(pt => (
                      <button 
                        key={pt.type}
                        onClick={() => updateActiveQuestion({ 
                          pointsType: pt.type, 
                          points: pt.type === 'DOUBLE' ? ((activeQuestion.points || 0) * 2) : pt.type === 'NONE' ? 0 : activeQuestion.points 
                        })}
                        className={`p-2 rounded-xl border-2 text-center transition-all ${
                          activeQuestion.pointsType === pt.type
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-100 text-gray-400 font-bold'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase">{pt.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer simple du panel */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
          <Button variant="outline" className="w-full text-xs font-black uppercase tracking-widest" onClick={() => setShowSettings(true)}>
            Description du quiz
          </Button>
          <p className="text-[10px] text-gray-400 text-center">Toutes les modifications sont enregistrées localement</p>
        </div>
      </aside>

      {/* ── MODAL : Description / Paramètres Globaux ── */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-800">Paramètres du Quiz</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            
            <div className="space-y-6">
              <Input 
                label="Titre"
                value={quiz.title}
                onChange={(e) => setQuiz({...quiz, title: e.target.value})}
              />
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full border-gray-200 rounded-lg focus:ring-primary-500 h-24"
                  value={quiz.description}
                  onChange={(e) => setQuiz({...quiz, description: e.target.value})}
                ></textarea>
              </div>
              <Input 
                label="Matière"
                value={quiz.subject}
                onChange={(e) => setQuiz({...quiz, subject: e.target.value})}
              />
              
              <Button className="w-full h-14 text-lg font-black" onClick={() => setShowSettings(false)}>
                Terminer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
