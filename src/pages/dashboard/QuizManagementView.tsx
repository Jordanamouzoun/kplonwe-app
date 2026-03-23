import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { 
  Plus, Edit, Trash2, Send, BarChart2, 
  Users, BookOpen
} from 'lucide-react';
import type { Quiz } from '@/types/quiz.types';
import { QuizAssignmentModal } from './QuizAssignmentModal';

export function QuizManagementView() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentParams, setAssignmentParams] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quizzes');
      if (res.data.success) {
        setQuizzes(res.data.data);
      }
    } catch (error) {
      console.error('Erreur récupération quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes(quizzes.filter(q => q.id !== id));
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-gray-900">Mes Quiz</h4>
          <p className="text-sm text-gray-500">Gérez vos quiz et suivez les résultats de vos élèves</p>
        </div>
        <Link to="/quiz/create">
          <Button className="gap-2">
            <Plus size={18} /> Créer un quiz
          </Button>
        </Link>
      </div>

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
              {/* Cover Image Placeholder or Real */}
              <div className="h-32 bg-gray-100 relative">
                {quiz.coverImage ? (
                  <img src={quiz.coverImage} alt={quiz.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <BookOpen size={32} />
                  </div>
                )}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-black uppercase ${
                  quiz.status === 'PUBLISHED' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {quiz.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{quiz.subject}</span>
                  <h5 className="font-bold text-gray-900 mt-1 line-clamp-1">{quiz.title}</h5>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-500">
                    <HelpCircleIcon size={14} />
                    <span className="text-xs font-semibold">{quiz._count?.questions || 0} questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Users size={14} />
                    <span className="text-xs font-semibold">{quiz._count?.assignments || 0} assignés</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Link to={`/quiz/edit/${quiz.id}`}>
                      <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors" title="Modifier">
                        <Edit size={18} />
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(quiz.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors" 
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setAssignmentParams({ id: quiz.id, title: quiz.title })}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-bold hover:bg-primary-100 transition-all"
                      title="Assigner à des élèves"
                    >
                      <Send size={14} /> Assigner
                    </button>
                    <Link to={`/quiz/results/${quiz.id}`}>
                      <button 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all"
                        title="Voir les résultats"
                      >
                        <BarChart2 size={14} /> Résultats
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-gray-300" />
          </div>
          <h5 className="font-bold text-gray-700">Aucun quiz créé</h5>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            Commencez par créer votre premier quiz pour l'assigner à vos élèves.
          </p>
          <Link to="/quiz/create" className="mt-6 inline-block">
            <Button variant="outline">Créer mon premier quiz</Button>
          </Link>
        </div>
      )}

      {assignmentParams && (
        <QuizAssignmentModal 
          isOpen={!!assignmentParams}
          onClose={() => setAssignmentParams(null)}
          quizId={assignmentParams.id}
          quizTitle={assignmentParams.title}
        />
      )}
    </div>
  );
}

function HelpCircleIcon({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
