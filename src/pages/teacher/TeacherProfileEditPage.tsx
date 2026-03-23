import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Save, AlertCircle, CheckCircle, Camera, Upload, 
  ExternalLink, FileText, Loader2, MapPin, Calendar,
  ShieldCheck, Info, X, BookOpen, Check, GraduationCap
} from 'lucide-react';

const SUBJECTS = [
  'Mathématiques', 'Français', 'Anglais', 'Physique', 'Chimie',
  'SVT', 'Histoire Géo', 'Philosophie', 'Espagnol', 'Allemand',
  'Informatique', 'Économie', 'Arts', 'Musique', 'Sport'
];

const LEVELS = [
  'Primaire', 'Collège', 'Lycée', 'Université', 'Formation professionnelle'
];

const CITIES = [
  'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Ouidah'
];

export function TeacherProfileEditPage() {
  const navigate = useNavigate();
  const { user, refreshProfile, updateUserAvatar } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState<{ id: string; name: string; filePath: string }[]>([]);

  const [formData, setFormData] = useState({
    bio: '',
    subjects: [] as string[],
    levels: [] as string[],
    experience: 0,
    pricePerMonth: 0,
    pricePerHour: 0,
    specialty: '',
    city: '',
    isAvailable: true,
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const getAvatarUrl = (avatar: string | null | undefined) => {
    if (!avatar) return null;
    if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
    return `${backendUrl}${avatar}`;
  };
  const avatarUrl = getAvatarUrl(user?.avatar);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      // On utilise l'ID du professeur ou "me" si on est connecté
      const res = await api.get('/teachers/me/profile');
      const p = res.data?.profile;
      
      if (p) {
        setFormData({
          bio: p.bio || '',
          subjects: Array.isArray(p.subjects) ? p.subjects : [],
          levels: Array.isArray(p.levels) ? p.levels : [],
          experience: p.experience || 0,
          pricePerMonth: p.pricePerMonth || 0,
          pricePerHour: p.pricePerHour || 0,
          specialty: p.specialty || '',
          city: p.city || '',
          isAvailable: p.isAvailable !== undefined ? p.isAvailable : true,
        });
        setDocuments(p.documents || []);
      }
    } catch (err: any) {
      console.error('Erreur chargement profil:', err);
      setError('Impossible de charger vos informations personnelles. Veuillez vérifier votre connexion ou réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formdata = new FormData();
    formdata.append('avatar', file);

    setUploadingAvatar(true);
    setError('');
    try {
      const res = await api.post('/teachers/upload-avatar', formdata, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const avatarPath = res.data?.data?.avatar || res.data?.avatar;
      if (avatarPath) {
        updateUserAvatar(avatarPath);
        setSuccess('Photo de profil mise à jour !');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'upload de l\'avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formdata = new FormData();
    formdata.append('file', file);

    setUploadingDoc(true);
    setError('');
    try {
      const res = await api.post('/teachers/documents', formdata, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const doc = res.data?.data?.document || res.data?.document;
      if (doc) {
        setDocuments(prev => [doc, ...prev]);
        setSuccess('Document ajouté avec succès !');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'upload du document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.put('/teachers/profile', formData);
      setSuccess('Profil mis à jour avec succès !');
      await refreshProfile();
      // On laisse le temps de voir le message de succès
      setTimeout(() => {
        setSuccess('');
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const toggleSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const toggleLevel = (level: string) => {
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter(l => l !== level)
        : [...prev.levels, level]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-primary-600" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Préparation de l'éditeur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Modifier mon profil</h1>
            <p className="text-lg text-gray-500 font-medium">Personnalisez votre présence sur Kplonwé pour attirer plus d'élèves.</p>
          </div>
          <Link to={`/teacher/${user?.id}`} target="_blank" className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary-50 text-primary-600 rounded-2xl font-black uppercase tracking-widest text-xs shadow-sm hover:shadow-md transition-all">
            <ExternalLink size={16} /> Aperçu public
          </Link>
        </div>

        {/* Global Notifications */}
        {success && (
          <div className="mb-8 bg-green-50 border-2 border-green-100 rounded-[2rem] p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-100">
              <CheckCircle size={24} />
            </div>
            <p className="font-bold text-green-800">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-8 bg-red-50 border-2 border-red-100 rounded-[2rem] p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-100">
              <AlertCircle size={24} />
            </div>
            <p className="font-bold text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* == PHOTO & IDENTITY == */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-10">
            <div className="relative group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] overflow-hidden bg-gray-100 border-4 border-white shadow-2xl relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-4xl font-black">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-white" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-4 -right-4 w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary-200 transition-all hover:scale-110 active:scale-95"
              >
                <Camera size={20} />
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            
            <div className="flex-1 text-center sm:text-left">
               <h3 className="text-2xl font-black text-gray-900 mb-2">{user?.firstName} {user?.lastName}</h3>
               <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-6">Expert Répétiteur sur Kplonwé</p>
               <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                  <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all font-bold cursor-pointer ${formData.isAvailable ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'}`} onClick={() => setFormData({...formData, isAvailable: !formData.isAvailable})}>
                    <div className={`w-3 h-3 rounded-full ${formData.isAvailable ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-gray-300'}`}></div>
                    {formData.isAvailable ? 'Disponible maintenant' : 'En pause'}
                  </div>
               </div>
            </div>
          </div>

          {/* == BIOGRAPHY & SPECIALTY == */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10 space-y-8">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <Info size={22} className="text-primary-600" /> Présentation Générale
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Spécialité Principale *</label>
                  <Input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="Ex: Professeur de Mathématiques & Physique"
                    className="p-4 rounded-2xl border-gray-100 font-bold"
                    required
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Ancrage Local (Ville) *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-200" size={18} />
                    <select 
                      value={formData.city} 
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-primary-100 focus:outline-none transition-all outline-none font-bold text-gray-700 appearance-none"
                      required
                    >
                      <option value="">Sélectionnez votre ville</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
               </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Biographie & Approche Pédagogique *</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Racontez votre parcours, vos méthodes et ce qui fait de vous un excellent coach..."
                rows={6}
                required
                className="w-full p-6 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:border-primary-100 focus:outline-none transition-all outline-none font-medium text-gray-700 resize-none leading-relaxed"
              />
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-300 px-2 mt-1">
                <span>{formData.bio.length} / 500 caractères</span>
                {formData.bio.length < 50 && <span className="text-orange-300">Minimum 50 pour être visible</span>}
              </div>
            </div>
          </div>

          {/* == SKILLS & LEVELS == */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10">
              <h2 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-3">
                <BookOpen size={20} className="text-primary-600" /> Matières enseignées
              </h2>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={`px-4 py-3 rounded-xl border-2 font-bold text-xs transition-all ${
                      formData.subjects.includes(subject) 
                        ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-100' 
                        : 'bg-white border-gray-50 text-gray-400 hover:border-primary-100'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10">
              <h2 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-3">
                <GraduationCap size={20} className="text-primary-600" /> Niveaux couverts
              </h2>
              <div className="space-y-3">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggleLevel(level)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                      formData.levels.includes(level) 
                        ? 'bg-gray-900 border-gray-900 text-white' 
                        : 'bg-gray-50 border-transparent text-gray-400'
                    }`}
                  >
                    {level}
                    {formData.levels.includes(level) && <Check size={18} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* == TARIFICATION == */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10">
            <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <Calendar size={22} className="text-primary-600" /> Vos Tarifs
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
               <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Expérience (ans) *</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                    className="p-5 rounded-2xl border-gray-100 font-bold bg-gray-50"
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Prix mensuel (FCFA) *</label>
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.pricePerMonth}
                    onChange={(e) => setFormData({ ...formData, pricePerMonth: parseInt(e.target.value) || 0 })}
                    className="p-5 rounded-2xl border-gray-100 font-bold bg-primary-50 text-primary-600"
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Prix horaire (Optionnel)</label>
                  <Input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.pricePerHour}
                    onChange={(e) => setFormData({ ...formData, pricePerHour: parseInt(e.target.value) || 0 })}
                    className="p-5 rounded-2xl border-gray-100 font-bold bg-gray-50"
                  />
               </div>
            </div>
          </div>

          {/* == DOCUMENTS == */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Documentation</h2>
                  <p className="text-sm text-gray-400 font-medium">Ajoutez vos diplômes pour obtenir le badge <span className="text-yellow-600 font-bold uppercase text-[10px]">Profil Certifié</span></p>
                </div>
                <Button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  disabled={uploadingDoc}
                  className="rounded-2xl px-6 py-4 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-100 transition-all hover:scale-105 active:scale-95"
                >
                  {uploadingDoc ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} className="mr-2" />}
                  {uploadingDoc ? 'Chargement...' : 'Déposer un fichier'}
                </Button>
                <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={handleDocumentUpload} />
             </div>

             {documents.length > 0 ? (
               <div className="grid sm:grid-cols-2 gap-4">
                 {documents.map((doc) => (
                   <div key={doc.id} className="flex items-center justify-between p-5 bg-gray-50 border border-gray-100 rounded-3xl group transition-all hover:bg-white hover:shadow-xl">
                     <div className="flex items-center gap-4 min-w-0">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm">
                         <FileText size={20} />
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm font-black text-gray-900 truncate">{doc.name}</p>
                         <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mt-1 group-hover:block hidden">Vérification en cours</p>
                       </div>
                     </div>
                     <button type="button" className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                       <X size={18} />
                     </button>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/30">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Upload size={32} className="text-gray-200" />
                  </div>
                  <p className="text-gray-900 font-black uppercase tracking-widest text-xs">Aucun document transmis</p>
                  <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">Veuillez uploader au moins un diplôme ou une pièce d'identité pour la validation.</p>
               </div>
             )}
          </div>

          {/* STICKY ACTIONS */}
          <div className="sticky bottom-6 z-50 pt-10">
            <div className="max-w-2xl mx-auto bg-gray-900/90 backdrop-blur-2xl p-4 rounded-[2rem] shadow-2xl border border-white/10 flex items-center justify-between gap-4">
               <button 
                type="button" 
                onClick={() => navigate('/dashboard')}
                className="px-8 py-5 text-white/50 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all"
               >
                Annuler
               </button>
               <Button 
                type="submit" 
                disabled={saving} 
                className="flex-1 py-7 rounded-[1.5rem] bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all"
               >
                {saving ? (
                  <span className="flex items-center gap-2 animate-pulse"><Loader2 size={24} className="animate-spin" /> Traitement...</span>
                ) : (
                  <span className="flex items-center gap-2"><Save size={20} /> Enregistrer mes informations</span>
                )}
               </Button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-gray-400 font-black uppercase tracking-widest">
              <ShieldCheck size={14} className="text-green-500" /> Modification Sécurisée
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
