import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Check, Users, Calendar, Search } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  grade?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  quizTitle: string;
}

export function QuizAssignmentModal({ isOpen, onClose, quizId, quizTitle }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quizzes/students/linked');
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement élèves:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) return;
    try {
      setSaving(true);
      await api.post(`/quizzes/${quizId}/assign`, {
        studentIds: selectedIds,
        dueDate: dueDate || null
      });
      onClose();
      alert('Quiz assigné avec succès !');
    } catch (error) {
      alert("Erreur lors de l'assignation");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assigner le quiz">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-500 mb-1 font-medium">Quiz sélectionné</p>
          <p className="font-bold text-gray-900">{quizTitle}</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Date limite (optionnel)
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="date" 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-gray-700">
              Sélectionner les élèves ({selectedIds.length})
            </label>
            <button 
              onClick={() => setSelectedIds(selectedIds.length === students.length ? [] : students.map(s => s.id))}
              className="text-xs font-bold text-primary-600 hover:text-primary-700"
            >
              {selectedIds.length === students.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
          </div>

          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher un élève..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Chargement...</div>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div 
                  key={student.id}
                  onClick={() => toggleStudent(student.id)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                      {student.avatar ? (
                        <img src={student.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-primary-600 text-xs">
                          {student.firstName[0]}{student.lastName[0]}
                        </span>
                      )}
                    </div>
                    {selectedIds.includes(student.id) && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white">
                        <Check size={10} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{student.firstName} {student.lastName}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.grade || 'Niveau non spécifié'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Users size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Aucun élève trouvé</p>
                <p className="text-xs text-gray-400 mt-1">Les élèves que vous encadrez apparaîtront ici.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleAssign} 
            disabled={saving || selectedIds.length === 0}
          >
            {saving ? 'Assignation...' : `Confirmer (${selectedIds.length})`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
