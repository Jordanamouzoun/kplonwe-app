import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { 
  ChevronLeft, Trophy, Clock, 
  User, BarChart, 
  Download, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface QuizResult {
  id: string;
  score: number;
  timeSpent: number;
  completedAt: string;
  student: {
    user: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}

export function QuizResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizInfo, setQuizInfo] = useState<any>(null);

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const [resResults, resQuiz] = await Promise.all([
        api.get(`/quizzes/${id}/results`),
        api.get(`/quizzes/${id}`)
      ]);
      
      if (resResults.data.success) setResults(resResults.data.data);
      if (resQuiz.data.success) setQuizInfo(resQuiz.data.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const averageScore = results.length > 0 
    ? results.reduce((acc, r) => acc + r.score, 0) / results.length 
    : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-6 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm uppercase tracking-widest">Retour au tableau de bord</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                  Résultats Quiz
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">
                  {quizInfo?.subject}
                </span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 leading-tight">
                {quizInfo?.title}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" className="gap-2 bg-white">
                <Download size={18} /> Exporter CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Participation</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-gray-900">{results.length}</p>
                <p className="text-xs text-gray-500 mt-1">Élèves ont terminé</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <User size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Score Moyen</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-gray-900">{averageScore.toFixed(1)}%</p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${averageScore}%` }} />
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                <Trophy size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Temps moyen</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-gray-900">
                  {results.length > 0 
                    ? Math.round(results.reduce((acc, r) => acc + r.timeSpent, 0) / results.length / 60)
                    : 0} min
                </p>
                <p className="text-xs text-gray-500 mt-1">Par tentative</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                <Clock size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm flex items-center gap-2">
              <BarChart size={18} className="text-primary-600" /> Détails des élèves
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Élève</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Temps</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {results.length > 0 ? results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border border-white shadow-sm">
                          {result.student.user.avatar ? (
                            <img src={result.student.user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-primary-600 text-xs">
                              {result.student.user.firstName[0]}{result.student.user.lastName[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            {result.student.user.firstName} {result.student.user.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${
                          result.score >= 80 ? 'text-green-600' : 
                          result.score >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {result.score}%
                        </span>
                        <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                          <div className={`h-full ${
                             result.score >= 80 ? 'bg-green-500' : 
                             result.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`} style={{ width: `${result.score}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-gray-600">
                        {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                      {format(new Date(result.completedAt), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-primary-600 hover:text-primary-700 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                        Détails <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      Aucun résultat pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
