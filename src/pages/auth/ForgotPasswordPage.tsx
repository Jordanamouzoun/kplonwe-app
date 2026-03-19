import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { KeyRound, ArrowRight, AlertCircle } from 'lucide-react';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      navigate(`/forgot-password/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du code de récupération');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <h1 className="text-3xl font-bold">
              <span className="text-primary-600">KPL</span>
              <span className="text-[#FDB32A]">O</span>
              <span className="text-primary-600">NWE</span>
            </h1>
          </Link>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <KeyRound size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Mot de passe oublié ?</h2>
          <p className="mt-2 text-gray-600">
            Entrez votre adresse email pour recevoir un code de récupération.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={loading || !email}
              className="h-12 text-base font-semibold"
            >
              {loading ? 'Envoi en cours...' : (
                <span className="flex items-center justify-center gap-2">
                  Recevoir le code <ArrowRight size={20} />
                </span>
              )}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
