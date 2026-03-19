import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, resendCode } = useAuth();
  
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Le code doit contenir 6 chiffres');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await verifyEmail(email, code);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { state: { message: 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.' } });
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    setResending(true);
    setError('');
    try {
      await resendCode(email);
      setTimer(60); // Attendre 1 minute avant de renvoyer
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email vérifié !</h1>
          <p className="text-gray-600 mb-6">
            Votre adresse email a été validée avec succès. Redirection vers la page de connexion...
          </p>
        </div>
      </div>
    );
  }

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
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
            <Mail size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Vérifiez votre email</h2>
          <p className="mt-2 text-gray-600">
            Nous avons envoyé un code de 6 chiffres à <br />
            <span className="font-semibold text-gray-900">{email}</span>
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
              <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                Code de vérification
              </label>
              <Input
                id="code"
                type="text"
                max={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-[1rem] font-bold h-14"
                autoFocus
                required
              />
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={loading || code.length !== 6}
              className="h-12 text-base font-semibold"
            >
              {loading ? 'Vérification...' : (
                <span className="flex items-center justify-center gap-2">
                  Vérifier <ArrowRight size={20} />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Vous n'avez pas reçu le code ?
            </p>
            <button
              onClick={handleResend}
              disabled={resending || timer > 0}
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold disabled:text-gray-400"
            >
              {resending ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <RefreshCw size={18} />
              )}
              {timer > 0 ? `Renvoyer le code (${timer}s)` : 'Renvoyer le code'}
            </button>
          </div>
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
