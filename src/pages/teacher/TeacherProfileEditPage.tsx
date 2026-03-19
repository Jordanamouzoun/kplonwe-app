import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { Save, AlertCircle, CheckCircle, Camera, Upload, ExternalLink, FileText, Loader2 } from 'lucide-react';

const SUBJECTS = [
  'Mathématiques', 'Français', 'Anglais', 'Physique', 'Chimie',
  'SVT', 'Histoire-Géo', 'Philosophie', 'Espagnol', 'Allemand',
  'Informatique', 'Économie', 'Arts', 'Musique', 'Sport'
];

const LEVELS = [
  'Primaire', 'Collège', 'Lycée', 'Université', 'Formation professionnelle'
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
  const [documents, setDocuments] = useState<{ id: string; name: string; url: string }[]>([]);

  const [formData, setFormData] = useState({
    bio: '',
    subjects: [] as string[],
    levels: [] as string[],
    experience: 0,
    pricePerMonth: 0,
    pricePerHour: 0,
    specialty: '',
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
      const res = await api.get('/teachers/me/profile');
      const profile = res.data?.profile || res.data;
      if (profile) {
        setFormData({
          bio: profile.bio || '',
          subjects: profile.subjects || [],
          levels: profile.levels || [],
          experience: profile.experience || 0,
          pricePerMonth: profile.pricePerMonth || 0,
          pricePerHour: profile.pricePerHour || 0,
          specialty: profile.specialty || '',
        });
        setDocuments(profile.documents || []);
      }
    } catch (err) {
      console.error('Erreur:', err);
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
    formdata.append('document', file);

    setUploadingDoc(true);
    setError('');
    try {
      const res = await api.post('/teachers/upload-document', formdata, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const doc = res.data?.data?.document || res.data?.document;
      if (doc) {
        setDocuments(prev => [...prev, doc]);
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
      setTimeout(() => navigate('/dashboard'), 2000);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 size={24} className="animate-spin" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Modifier mon profil</h1>
            <p className="text-sm sm:text-base text-gray-600">Complétez votre profil pour augmenter votre visibilité</p>
          </div>
          <Link
            to={`/teacher/${user?.id}`}
            target="_blank"
            className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 border border-primary-100 px-4 py-2 rounded-xl transition-all hover:bg-primary-100"
          >
            <ExternalLink size={16} /> Voir mon profil public
          </Link>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* === Photo de profil === */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-6">Photo de profil</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-100 shadow-md" />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-blue-100 rounded-full flex items-center justify-center shadow-inner">
                  <span className="text-primary-700 font-bold text-2xl">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 w-9 h-9 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-50"
              >
                {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500 mt-1">Formats acceptés : JPG, PNG (max 5 Mo)</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? 'Upload...' : 'Changer la photo'}
              </Button>
            </div>
          </div>
        </div>

        {/* === Form === */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-6">

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Biographie *</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Présentez-vous en quelques lignes..."
              rows={4}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm sm:text-base"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 caractères</p>
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Spécialité *</label>
            <Input
              type="text"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              placeholder="Professeur de Mathématiques"
              required
            />
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Matières enseignées *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUBJECTS.map((subject) => (
                <label
                  key={subject}
                  className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all text-sm ${
                    formData.subjects.includes(subject) ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.subjects.includes(subject)}
                    onChange={() => toggleSubject(subject)}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300"
                  />
                  <span className="font-medium text-gray-900">{subject}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Levels */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Niveaux enseignés *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LEVELS.map((level) => (
                <label
                  key={level}
                  className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all text-sm ${
                    formData.levels.includes(level) ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.levels.includes(level)}
                    onChange={() => toggleLevel(level)}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300"
                  />
                  <span className="font-medium text-gray-900">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Années d'expérience *</label>
              <Input
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                placeholder="5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prix / mois (FCFA) *</label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={formData.pricePerMonth}
                onChange={(e) => setFormData({ ...formData, pricePerMonth: parseInt(e.target.value) || 0 })}
                placeholder="50000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prix / heure (FCFA)</label>
              <Input
                type="number"
                min="0"
                step="500"
                value={formData.pricePerHour}
                onChange={(e) => setFormData({ ...formData, pricePerHour: parseInt(e.target.value) || 0 })}
                placeholder="5000"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="order-2 sm:order-1">
              Annuler
            </Button>
            <Button type="submit" disabled={saving} className="order-1 sm:order-2 sm:flex-1">
              {saving ? (
                <span className="flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin" /> Enregistrement...</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><Save size={18} /> Enregistrer les modifications</span>
              )}
            </Button>
          </div>
        </form>

        {/* === Documents === */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Documents professionnels</h2>
              <p className="text-xs text-gray-500 mt-1">Diplômes, CV, certifications visibles sur votre profil public</p>
            </div>
            <Button
              type="button"
              size="sm"
              className="gap-2"
              onClick={() => docInputRef.current?.click()}
              disabled={uploadingDoc}
            >
              {uploadingDoc ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploadingDoc ? 'Upload...' : 'Ajouter un document'}
            </Button>
            <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={handleDocumentUpload} />
          </div>

          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Visible sur votre profil public</p>
                  </div>
                  <a href={`${backendUrl}${doc.url}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                    <ExternalLink size={16} />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-gray-200 rounded-xl">
              <Upload size={32} className="text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">Aucun document ajouté</p>
              <p className="text-xs text-gray-400 mt-1">Ajoutez votre CV, vos diplômes ou certifications pour rassurer les parents.</p>
              <Button type="button" variant="outline" size="sm" className="mt-4 gap-2" onClick={() => docInputRef.current?.click()}>
                <Upload size={14} /> Choisir un fichier
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
