import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  Award, BookOpen, User, Briefcase, Edit, FileText, Download,
  Star, MapPin, MessageSquare, Calendar, ShieldCheck,
  Mail, Phone
} from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

interface TeacherProfile {
  id: string;
  bio: string | null;
  subjects: string[];
  levels: string[];
  experience: number | null;
  education: string | null;
  certifications: string[];
  pricePerMonth: number | null;
  pricePerHour: number | null;
  validationStatus: string;
  rating: number;
  reviewCount: number;
  isPremium: boolean;
  city: string | null;
  isAvailable: boolean;
  totalStudents: number;
  specialty: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
  reviews: Review[];
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export function TeacherProfilePage() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'courses'>('about');

  const isOwnProfile = currentUser?.id === teacherId || currentUser?.teacherProfile?.id === teacherId || (profile && currentUser?.id === profile.user.id);
  const isTeacher = currentUser?.role === 'TEACHER';

  useEffect(() => {
    if (!teacherId || teacherId === 'undefined') {
      setLoading(false);
      setNotFound(true);
      return;
    }
    loadProfile();
    loadDocuments();
  }, [teacherId]);

  async function loadProfile() {
    try {
      setLoading(true);
      const response = await api.get(`/teachers/${teacherId}/profile`);
      if (response.data.success) {
        setProfile(response.data.profile);
        setNotFound(false);
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleMessageClick() {
    if (!currentUser) {
      navigate('/login', { state: { from: `/teacher/${teacherId}` } });
      return;
    }

    if (isOwnProfile) return;

    try {
      setSendingMessage(true);
      const res = await api.post('/messages/conversations', {
        participant2Id: profile?.user.id
      });
      
      if (res.data.success) {
        navigate(`/messages/${res.data.conversation.id}`);
      }
    } catch (err: any) {
      console.error('Erreur lors de la création de la conversation:', err);
      if (err.response?.data) {
        console.error('Détails erreur serveur:', err.response.data);
      }
      alert('Impossible de démarrer la conversation pour le moment.');
    } finally {
      setSendingMessage(false);
    }
  }

  async function loadDocuments() {
    try {
      const response = await api.get(`/teachers/${teacherId}/documents`);
      if (response.data.success) {
        setDocuments(response.data.documents || []);
      }
    } catch {
      setDocuments([]);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Professeur introuvable</h1>
        <p className="text-gray-500 mb-8">Désolé, nous ne parvenons pas à trouver ce profil.</p>
        <Link to="/teachers"><Button>Retour à la recherche</Button></Link>
      </div>
    );
  }

  const avatarUrl = profile.user.avatar
    ? (profile.user.avatar.startsWith('http') || profile.user.avatar.startsWith('data:')
      ? profile.user.avatar
      : `${BACKEND_URL}${profile.user.avatar}`)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden bg-gray-50 border-4 border-white shadow-lg">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={profile.user.firstName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-4xl font-bold">
                    {profile.user.firstName[0]}{profile.user.lastName[0]}
                  </div>
                )}
              </div>
              {profile.isAvailable && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-white rounded-full" title="Disponible"></div>
              )}
            </div>

            {/* Title & Stats */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">{profile.user.firstName} {profile.user.lastName}</h1>
                  {profile.isPremium && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                      <Award size={14} /> Profil Certifié
                    </span>
                  )}
                </div>
                <p className="text-lg font-semibold text-primary-600">{profile.specialty || 'Enseignant qualifié'}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Star size={18} className="text-yellow-400 fill-current" />
                  <span className="text-gray-900 font-bold">{profile.rating.toFixed(1)}</span>
                  <span>({profile.reviewCount} avis)</span>
                </div>
                {profile.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={18} className="text-gray-400" />
                    <span>{profile.city}</span>
                  </div>
                )}
                {profile.experience && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase size={18} className="text-gray-400" />
                    <span>{profile.experience} ans d'expérience</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {profile.isAvailable ? (
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Disponible
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-50 text-gray-500 text-xs font-bold rounded-lg border border-gray-100 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div> Indisponible
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions Desktop */}
            {!isTeacher && !isOwnProfile && (
              <div className="hidden lg:block w-72 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Budget mensuel</p>
                  <p className="text-3xl font-bold text-gray-900">{profile.pricePerMonth?.toLocaleString()} <span className="text-sm font-medium text-gray-500">XOF</span></p>
                </div>
                <div className="space-y-3">
                  <Button className="w-full py-4 font-bold rounded-xl shadow-lg shadow-primary-500/10">Prendre un cours</Button>
                  <Button 
                    variant="outline" 
                    className="w-full py-4 font-bold rounded-xl bg-white hover:bg-gray-50 transition-all border-gray-200"
                    onClick={handleMessageClick}
                    disabled={sendingMessage}
                  >
                    {sendingMessage ? 'Ouverture...' : 'Envoyer un Message'}
                  </Button>
                </div>
              </div>
            )}

            {isOwnProfile && (
              <div className="md:self-start">
                <Link to="/teacher/profile/edit">
                  <Button variant="outline" className="gap-2 bg-white"><Edit size={16} /> Modifier mon profil</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1 space-y-6">
            <div className="bg-white border-b border-gray-200 flex gap-8">
              {[
                { id: 'about', label: 'À propos', icon: User },
                { id: 'reviews', label: 'Avis clients', icon: MessageSquare },
                { id: 'courses', label: 'Cours', icon: BookOpen }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 border-b-2 font-bold text-sm flex items-center gap-2 transition-all ${
                    activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <tab.icon size={18} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="py-2">
              {activeTab === 'about' && (
                <div className="space-y-10 bg-white p-8 rounded-2xl border border-gray-200">
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Email de contact</h4>
                      <div className="flex items-center gap-3 text-gray-900 font-bold">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary-600">
                          <Mail size={18} />
                        </div>
                        {profile.user.email}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Téléphone</h4>
                      <div className="flex items-center gap-3 text-gray-900 font-bold">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-green-600">
                          <Phone size={18} />
                        </div>
                        {profile.user.phone || 'Non renseigné'}
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Biographie</h3>
                    {profile.bio ? (
                      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                    ) : (
                      <p className="text-gray-400 italic">Aucune biographie disponible.</p>
                    )}
                  </section>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <section>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Formation & Études</h4>
                      <p className="text-gray-900 font-medium">{profile.education || 'Non renseigné'}</p>
                    </section>
                    <section>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Matières enseignées</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.subjects.map(s => <span key={s} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-bold">{s}</span>)}
                      </div>
                    </section>
                  </div>

                  <section>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Niveaux scolaires</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.levels.map(l => <span key={l} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-bold">{l}</span>)}
                    </div>
                  </section>

                  {profile.certifications.length > 0 && (
                    <section>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Certifications</h4>
                      <div className="space-y-3">
                        {profile.certifications.map(c => (
                          <div key={c} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                            <Award size={16} className="text-yellow-400" /> {c}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Documents vérifiés</h3>
                    {documents.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {documents.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <FileText className="text-primary-600 flex-shrink-0" size={20} />
                              <span className="text-sm font-bold text-gray-900 truncate">{doc.originalName}</span>
                            </div>
                            <a href={`${BACKEND_URL}${doc.filePath}`} target="_blank" className="text-gray-400 hover:text-primary-600"><Download size={18} /></a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">Aucun document partagé publiquement.</p>
                    )}
                  </section>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-2xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-8">Avis des parents & élèves</h3>
                    {profile.reviews && profile.reviews.length > 0 ? (
                      <div className="space-y-8">
                        {profile.reviews.map(review => (
                          <div key={review.id} className="flex gap-4 border-b border-gray-50 pb-8 last:border-0 last:pb-0">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0">
                              {review.author?.avatar && <img src={review.author.avatar.startsWith('http') ? review.author.avatar : `${BACKEND_URL}${review.author.avatar}`} className="w-full h-full object-cover rounded-xl" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-gray-900">{review.author?.firstName} {review.author?.lastName}</h4>
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < review.rating ? 'fill-current' : 'text-gray-100'} />)}
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm leading-relaxed">"{review.comment}"</p>
                              <p className="text-[11px] text-gray-400 mt-2 font-medium">{new Date(review.createdAt).toLocaleDateString('fr-FR')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Star size={32} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">Aucun avis pour le moment.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'courses' && (
                <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
                  <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Bientôt disponible</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">Ce professeur n'a pas encore publié de cours en ligne.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Desktop (Support) */}
          <aside className="lg:w-80 space-y-6">
            {!isTeacher && !isOwnProfile && (
              <div className="bg-primary-600 text-white p-8 rounded-2xl shadow-xl shadow-primary-200">
                <MessageSquare className="mb-4 text-white/80" size={32} />
                <h4 className="text-lg font-bold mb-2">Besoin d'un prof ?</h4>
                <p className="text-primary-100 text-sm mb-6 leading-relaxed">Laissez-nous vous aider à trouver le répétiteur idéal gratuitement.</p>
                <Link to="/contact">
                  <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white hover:text-primary-600 font-bold py-4">Parler à un conseiller</Button>
                </Link>
              </div>
            )}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ShieldCheck size={18} className="text-green-500" /> Confiance Kplonwé</h4>
              <ul className="space-y-3 text-xs font-medium text-gray-500 leading-relaxed">
                <li className="flex gap-2">✓ Paiement sécurisé via FedaPay</li>
                <li className="flex gap-2">✓ Professeurs qualifiés et vérifiés</li>
                <li className="flex gap-2">✓ Suivi pédagogique inclus</li>
              </ul>
            </div>
          </aside>

        </div>
      </div>

      {/* Mobile Actions Modal */}
      {!isTeacher && !isOwnProfile && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-40 flex gap-4">
          <Button className="flex-1 py-4 font-bold rounded-xl shadow-lg shadow-primary-500/10">Inscrire mon enfant</Button>
          <Button variant="outline" className="w-14 h-14 bg-white border-2 p-0 rounded-xl flex items-center justify-center"><MessageSquare size={20} /></Button>
        </div>
      )}
    </div>
  );
}
