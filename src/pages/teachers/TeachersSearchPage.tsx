import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { 
  Search, Star, MapPin, SlidersHorizontal, 
  ArrowRight, Briefcase, X, Filter, UserPlus, Check, Award
} from 'lucide-react';

interface Teacher {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  subjects: string[];
  levels: string[];
  experience: number;
  pricePerMonth: number | null;
  pricePerHour: number | null;
  rating: number;
  reviewCount: number;
  validationStatus: string;
  isPremium: boolean;
  city: string | null;
  isAvailable: boolean;
  specialty?: string;
  bio?: string;
}

const SUBJECTS_OPTIONS = [
  'Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Français', 
  'Anglais', 'Espagnol', 'Histoire', 'Géographie', 'Philosophie', 
  'Économie', 'Informatique'
];

const CITIES_OPTIONS = [
  'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Ouidah'
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export function TeachersSearchPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [isAvailable, setIsAvailable] = useState(searchParams.get('isAvailable') === 'true');

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedTeachers, setAddedTeachers] = useState<Record<string, boolean>>({});
  const [addingTeacher, setAddingTeacher] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const isParent = user?.role === 'PARENT';

  const loadTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (subject) params.append('subject', subject);
      if (city) params.append('city', city);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating) params.append('minRating', minRating);
      if (isAvailable) params.append('isAvailable', 'true');

      const response = await api.get(`/teachers/search?${params.toString()}`);
      if (response.data.success) {
        setTeachers(response.data.teachers);
      }
    } catch (error) {
      console.error('Erreur chargement professeurs:', error);
    } finally {
      setLoading(false);
    }
  }, [q, subject, city, minPrice, maxPrice, minRating, isAvailable]);

  useEffect(() => {
    loadTeachers();
    const newParams = new URLSearchParams();
    if (q) newParams.set('q', q);
    if (subject) newParams.set('subject', subject);
    if (city) newParams.set('city', city);
    if (minPrice) newParams.set('minPrice', minPrice);
    if (maxPrice) newParams.set('maxPrice', maxPrice);
    if (minRating) newParams.set('minRating', minRating);
    if (isAvailable) newParams.set('isAvailable', 'true');
    setSearchParams(newParams);
  }, [q, subject, city, minPrice, maxPrice, minRating, isAvailable, loadTeachers, setSearchParams]);

  const handleAddTeacher = async (teacherId: string) => {
    if (!isParent || addingTeacher) return;
    setAddingTeacher(teacherId);
    try {
      await api.post(`/teachers/${teacherId}/add`);
      setAddedTeachers(prev => ({ ...prev, [teacherId]: true }));
    } catch {
      setAddedTeachers(prev => ({ ...prev, [teacherId]: true }));
    } finally {
      setAddingTeacher(null);
    }
  };

  const resetFilters = () => {
    setQ('');
    setSubject('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setIsAvailable(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-gray-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Trouver un répétiteur</h1>
              <p className="text-gray-500 font-medium">Explorez les meilleurs profils certifiés au Bénin.</p>
            </div>
            <div className="w-full md:w-96 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher par nom..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ── FILTERS SIDEBAR ── */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-28 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal size={18} /> Filtres
                </h3>
                <button onClick={resetFilters} className="text-xs font-semibold text-primary-600 hover:text-primary-700">Effacer</button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Matière</label>
                  <select 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none font-medium text-gray-700"
                  >
                    <option value="">Toutes</option>
                    {SUBJECTS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ville</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none font-medium text-gray-700 appearance-none"
                    >
                      <option value="">Toutes</option>
                      {CITIES_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Budget Max (FCFA)</label>
                  <input 
                    type="number"
                    placeholder="Ex: 50000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Note Minimale</label>
                  <div className="flex gap-2">
                    {[4, 3].map(n => (
                      <button
                        key={n}
                        onClick={() => setMinRating(minRating === n.toString() ? '' : n.toString())}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border transition-all text-sm font-bold ${
                          minRating === n.toString() 
                            ? 'bg-yellow-50 border-yellow-400 text-yellow-700' 
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {n}+ <Star size={14} className={minRating === n.toString() ? 'fill-current' : ''} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium text-gray-700">Disponible immédiat.</span>
                  <button
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${isAvailable ? 'bg-primary-600' : 'bg-gray-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isAvailable ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* ── RESULTS ── */}
          <main className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                <span className="text-gray-900 font-bold">{teachers.length}</span> professeurs trouvés
              </p>
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 shadow-sm"
              >
                <Filter size={18} /> Filtres
              </button>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
              </div>
            ) : teachers.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Aucun résultat</h3>
                <p className="text-gray-500 mb-6">Essayez de modifier vos critères de recherche.</p>
                <Button onClick={resetFilters} variant="outline">Réinitialiser</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {teachers.map(teacher => (
                  <div key={teacher.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 transition-all group">
                    <div className="flex flex-col md:flex-row gap-6">
                      
                      {/* Avatar */}
                      <Link to={`/teacher/${teacher.id}`} className="relative flex-shrink-0 mx-auto md:mx-0">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                          {teacher.user.avatar ? (
                            <img 
                              src={teacher.user.avatar.startsWith('http') ? teacher.user.avatar : `${BACKEND_URL}${teacher.user.avatar}`} 
                              alt={teacher.user.firstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary-200">
                              {teacher.user.firstName[0]}
                            </div>
                          )}
                        </div>
                        {teacher.isAvailable && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full" title="Disponible"></div>
                        )}
                      </Link>

                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Link to={`/teacher/${teacher.id}`} className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors">
                                {teacher.user.firstName} {teacher.user.lastName}
                              </Link>
                              {teacher.isPremium && (
                                <span className="p-1 bg-yellow-100 text-yellow-700 rounded-md" title="Profil Certifié">
                                  <Award size={14} />
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider">
                              {teacher.specialty || 'Enseignant Qualifié'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                            <Star size={14} className="text-yellow-400 fill-current" />
                            <span className="text-sm font-bold text-gray-900">{teacher.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-gray-500">
                          {teacher.city && (
                            <div className="flex items-center gap-1.5">
                              <MapPin size={14} className="text-gray-400" /> {teacher.city}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Briefcase size={14} className="text-gray-400" /> {teacher.experience || 0} ans d'expérience
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {teacher.bio || "Enseignant dédié à la progression de chaque élève grâce à une méthodologie adaptée et rigoureuse."}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {teacher.subjects.slice(0, 3).map(s => (
                            <span key={s} className="px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-[11px] font-bold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Side Info / Price */}
                      <div className="w-full md:w-48 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                        <div className="mb-4 text-center md:text-left">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dès</p>
                          <div className="flex items-baseline justify-center md:justify-start gap-1">
                            <span className="text-2xl font-bold text-gray-900">{teacher.pricePerMonth?.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">XOF/mois</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Link to={`/teacher/${teacher.id}`} className="block">
                            <Button className="w-full text-xs font-bold py-2.5 rounded-lg group/btn">
                              Voir profil <ArrowRight size={14} className="ml-1 inline group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                          {isParent && (
                            <button
                              onClick={(e) => { e.preventDefault(); handleAddTeacher(teacher.id); }}
                              disabled={!!addedTeachers[teacher.id] || addingTeacher === teacher.id}
                              className={`w-full py-2.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                                addedTeachers[teacher.id]
                                  ? 'bg-green-50 border-green-200 text-green-700'
                                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {addedTeachers[teacher.id] ? <><Check size={14} /> Ajouté</> : <><UserPlus size={14} /> Ajouter</>}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[60] bg-gray-900/60 backdrop-blur-sm flex items-end">
          <div className="w-full bg-white rounded-t-[2rem] p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Filtres</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-50 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-6 pb-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Matière</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none font-medium">
                  <option value="">Toutes</option>
                  {SUBJECTS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Ville</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none font-medium">
                  <option value="">Toutes</option>
                  {CITIES_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Button onClick={() => setShowMobileFilters(false)} className="w-full py-4 rounded-xl font-bold">Voir les résultats</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
