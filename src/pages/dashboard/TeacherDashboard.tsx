import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import type { LucideIcon } from 'lucide-react';
import {
  Users,
  TrendingUp,
  ExternalLink,
  Award,
  MessageSquare,
  Star,
  CheckCircle,
  Edit,
  Calendar,
  BookOpen,
  Trophy,
  Clock,
  Plus,
  Circle,
  ChevronRight
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { QuizManagementView } from './QuizManagementView';

function parseArr(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

interface Shift {
  id: string;
  subject: string;
  level: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  studentName?: string;
}

interface Course {
  id: string;
  title: string;
  subject: string;
  price: number;
  rating?: number;
}

function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <Icon size={32} className="text-gray-300" />
      </div>
      <h5 className="font-bold text-gray-700">{title}</h5>
      <p className="text-sm text-gray-400 max-w-xs mt-1">{description}</p>
    </div>
  );
}

export function TeacherDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('shifts-available');
  const [shifts] = useState<Shift[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [graphData] = useState<{ month: string; revenue: number }[]>([]);

  const certificationStatus = user?.teacherProfile?.validationStatus ?? 'PENDING';
  const isPremium = user?.teacherProfile?.isPremium ?? false;
  const rating = user?.teacherProfile?.rating ?? 1.0;
  const reviewCount = user?.teacherProfile?.reviewCount ?? 0;
  const totalStudents = user?.teacherProfile?.totalStudents ?? 0;
  const points = user?.teacherProfile?.points ?? 0;
  const specialty = user?.teacherProfile?.specialty ?? (parseArr(user?.teacherProfile?.subjects)[0] || 'Généraliste');
  const subjects = parseArr(user?.teacherProfile?.subjects);
  const levels = parseArr(user?.teacherProfile?.levels);

  const isProfileComplete = !!(
    user?.avatar &&
    user?.teacherProfile?.bio &&
    user?.teacherProfile?.pricePerMonth &&
    subjects.length > 0 &&
    levels.length > 0 &&
    user?.teacherProfile?.experience
  );

  const loadDashboardData = useCallback(async () => {
    try {
      const res = await api.get('/teachers/me/courses').catch(() => ({ data: null }));
      const data = (res as any)?.data;
      setCourses(data?.courses || data?.data || []);
    } catch { /* silently fail */ }
  }, []);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  const tabs = [
    { id: 'shifts-available', label: 'Shifts disponibles', icon: Calendar },
    { id: 'my-shifts', label: 'Mes shifts', icon: CheckCircle },
    { id: 'subscriptions', label: 'Abonnements', icon: Users },
    { id: 'my-courses', label: 'Mes cours', icon: BookOpen },
    { id: 'quizzes', label: 'Mes Quiz', icon: Trophy },
    { id: 'reviews', label: 'Avis', icon: Star },
  ];

  const getAvatarUrl = (avatar: string | null | undefined) => {
    if (!avatar) return null;
    if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
    return `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${avatar}`;
  };
  const avatarUrl = getAvatarUrl(user?.avatar);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0f172a] pt-12 pb-36 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] -ml-48 -mb-48" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Avatar + Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-primary-500 to-amber-500 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="relative w-32 h-32 rounded-full border-4 border-white/10 object-cover shadow-2xl"
                  />
                ) : (
                  <div className="relative w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border-4 border-white/10 backdrop-blur-xl shadow-2xl">
                    <span className="text-4xl font-black text-white">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-[#0f172a] shadow-lg" />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap mb-2">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                      {user?.firstName} {user?.lastName}
                    </h1>
                    <div className="flex gap-2">
                      {certificationStatus === 'VERIFIED' && (
                        <span className="bg-primary-500/20 text-primary-300 border border-primary-500/30 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 tracking-widest uppercase">
                          <Award size={12} /> CERTIFIÉ
                        </span>
                      )}
                      {isPremium && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 tracking-widest uppercase">
                          <Star size={12} /> PREMIUM
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-blue-200 text-lg font-semibold flex items-center justify-center md:justify-start gap-2">
                    <span className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/5">{specialty}</span>
                    <span className="opacity-50">•</span>
                    <span className="text-white/80">{user?.teacherProfile?.experience || 0} ans d'expérience</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 py-4 px-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
                  <div className="flex flex-col items-center md:items-start">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center text-amber-400">
                        <Star size={16} fill="currentColor" />
                      </div>
                      <span className="text-white font-black text-xl">{rating.toFixed(1)}</span>
                    </div>
                    <span className="text-blue-300 text-[10px] font-black uppercase tracking-widest">Note ({reviewCount} avis)</span>
                  </div>

                  <div className="w-px h-10 bg-white/10 hidden sm:block"></div>

                  <div className="flex flex-col items-center md:items-start">
                    <div className="flex items-center gap-2 mb-1">
                      <Users size={18} className="text-primary-400" />
                      <span className="text-white font-black text-xl">{totalStudents}</span>
                    </div>
                    <span className="text-blue-300 text-[10px] font-black uppercase tracking-widest">Élèves actifs</span>
                  </div>

                  <div className="w-px h-10 bg-white/10 hidden sm:block"></div>

                  <div className="flex flex-col items-center md:items-start">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy size={18} className="text-amber-400" />
                      <span className="text-white font-black text-xl">{points}</span>
                    </div>
                    <span className="text-blue-300 text-[10px] font-black uppercase tracking-widest">Points acquis</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-4 items-center w-full lg:w-auto mt-6 lg:mt-0 px-4 md:px-0">
              <Link to="/teacher/profile/edit" className="flex-1 lg:flex-none">
                <Button className="w-full bg-white/10 text-white border border-white/20 hover:bg-white/20 h-14 px-8 rounded-2xl font-black text-base shadow-xl backdrop-blur-md transition-all active:scale-95">
                  <Edit size={20} className="mr-3 text-blue-300" /> Modifier le profil
                </Button>
              </Link>
              
              <Link to={isProfileComplete ? `/teacher/${user?.id}` : "#"} target={isProfileComplete ? "_blank" : "_self"} className="flex-1 lg:flex-none">
                <Button 
                  onClick={!isProfileComplete ? () => alert("Profil incomplet") : undefined}
                  className={`w-full h-14 px-8 rounded-2xl font-black text-base transition-all active:scale-95 shadow-xl flex items-center justify-center ${
                  isProfileComplete 
                    ? "bg-primary-600 hover:bg-primary-700 text-white border-none shadow-primary-500/20" 
                    : "bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
                }`}>
                  <ExternalLink size={20} className="mr-3" /> Profil public
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="lg:w-2/3 space-y-8">
            {/* Evolution Graph */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Évolution de l'activité</h3>
                  <p className="text-sm text-gray-500">Suivi mensuel de vos revenus</p>
                </div>
              </div>
              {graphData.length > 0 ? (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={graphData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                    <TrendingUp size={28} className="text-blue-400" />
                  </div>
                  <p className="font-semibold text-gray-700">Pas encore de données</p>
                  <p className="text-sm text-gray-400 mt-1">Vos statistiques apparaîtront ici après vos premiers shifts.</p>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50/50 flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600 bg-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {activeTab === 'shifts-available' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 mb-2">Prochains shifts à prendre</h4>
                    {shifts.length > 0 ? shifts.map((shift) => (
                      <div key={shift.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary-100 hover:shadow-sm transition-all">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm">
                            {shift.subject.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{shift.subject} — {shift.level}</p>
                            {shift.studentName && <p className="text-xs text-gray-500 mt-0.5">Élève: {shift.studentName}</p>}
                            <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-gray-400">
                              <span className="flex items-center gap-1.5"><Calendar size={12} /> {shift.date}</span>
                              <span className="flex items-center gap-1.5"><Clock size={12} /> {shift.startTime} - {shift.endTime}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{shift.price.toLocaleString()} FCFA</p>
                          <Button size="sm" className="mt-2 text-xs px-4">Prendre ce shift</Button>
                        </div>
                      </div>
                    )) : (
                      <EmptyState icon={Calendar} title="Aucun shift disponible" description="Les shifts proposés par les parents apparaîtront ici." />
                    )}
                  </div>
                )}

                {activeTab === 'my-shifts' && (
                  <EmptyState icon={CheckCircle} title="Aucun shift accepté" description="Les shifts que vous avez acceptés apparaîtront ici." />
                )}

                {activeTab === 'subscriptions' && (
                  <EmptyState icon={Users} title="Aucun abonnement actif" description="Vos élèves abonnés apparaîtront ici." />
                )}

                {activeTab === 'my-courses' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900">Mes cours en vente</h4>
                      {certificationStatus === 'VERIFIED' && (
                        <Button size="sm" className="gap-2"><Plus size={16} /> Créer un cours</Button>
                      )}
                    </div>
                    {certificationStatus !== 'VERIFIED' ? (
                      <div className="p-5 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-4">
                        <Award size={24} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-800">Certification requise</p>
                          <p className="text-sm text-amber-700 mt-1">Votre profil doit être certifié par l'administration pour vendre des cours.</p>
                        </div>
                      </div>
                    ) : courses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses.map((course, i) => (
                          <div key={course.id || i} className="p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-3">
                              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase">{course.subject}</span>
                              {course.rating && (
                                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                  <Star size={12} fill="currentColor" /> {course.rating}
                                </div>
                              )}
                            </div>
                            <h5 className="font-bold text-gray-900 mb-4">{course.title}</h5>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                              <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Prix</p>
                                <p className="text-lg font-bold text-primary-600">{course.price?.toLocaleString()} FCFA</p>
                              </div>
                              <Button variant="outline" size="sm" className="text-xs">Gérer</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={BookOpen} title="Aucun cours publié" description="Créez votre premier cours pour commencer à vendre." />
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <EmptyState icon={Star} title="Aucun avis reçu" description="Les avis de vos élèves apparaîtront ici après leurs sessions." />
                )}

                {activeTab === 'quizzes' && (
                  <QuizManagementView />
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:w-1/3 space-y-8">
            {/* Account Status */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CheckCircle size={20} className="text-primary-600" /> État du compte
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Complétude du profil</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isProfileComplete ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {isProfileComplete ? '100%' : '60%'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${isProfileComplete ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: isProfileComplete ? '100%' : '60%' }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Détails du statut</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm">
                      {isProfileComplete ? <CheckCircle size={16} className="text-green-500" /> : <Circle size={16} className="text-gray-300" />}
                      <span className={isProfileComplete ? 'text-gray-700' : 'text-gray-400'}>Profil public et visible</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      {certificationStatus === 'VERIFIED' ? <CheckCircle size={16} className="text-green-500" /> : <Circle size={16} className="text-gray-300" />}
                      <span className={certificationStatus === 'VERIFIED' ? 'text-gray-700' : 'text-gray-400'}>Certifié par l'administration</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      {isPremium ? <CheckCircle size={16} className="text-green-500" /> : <Circle size={16} className="text-gray-300" />}
                      <span className={isPremium ? 'text-gray-700' : 'text-gray-400'}>Compte Premium actif</span>
                    </li>
                  </ul>
                </div>

                {!isProfileComplete && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <strong>Action requise :</strong> Complétez votre bio, vos matières, vos niveaux et vos tarifs pour être visible.
                    </p>
                  </div>
                )}

                <Link to="/teacher/profile/edit" className="block">
                  <Button variant="outline" className="w-full justify-between">
                    Gérer mon profil <ChevronRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Premium Card */}
            {!isPremium && (
              <div className="bg-gradient-to-br from-primary-600 to-blue-700 p-8 rounded-2xl shadow-lg text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Award size={20} /> Devenez Premium
                </h3>
                <p className="text-sm text-blue-100 mb-6 leading-relaxed">
                  Boostez votre visibilité, apparaissez en tête des recherches et accédez à des statistiques détaillées.
                </p>
                <Button className="w-full bg-white text-primary-700 hover:bg-white/90 border-none font-bold shadow-lg">
                  Passer Premium — 5 000 FCFA/mois
                </Button>
              </div>
            )}

            {/* Support */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Besoin d'aide ?</h4>
              <p className="text-xs text-gray-500 mb-4">Notre support est disponible 24/7.</p>
              <Button variant="outline" size="sm" className="text-xs w-full">Contacter le support</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
