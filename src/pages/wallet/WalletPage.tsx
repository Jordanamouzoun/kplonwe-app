import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  Wallet, TrendingUp, TrendingDown, Plus, ArrowUpRight,
  ArrowDownLeft, Smartphone
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND';
  amount: number;
  description: string;
  createdAt: string;
  status: string;
}

export function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [recharging, setRecharging] = useState(false);

  useEffect(() => { loadWallet(); }, []);

  async function loadWallet() {
    try {
      setLoading(true);
      const res = await api.get('/wallet');
      setBalance(res.data?.balance || 0);
      setTransactions(res.data?.transactions || []);
    } catch (err) {
      console.error('Erreur wallet:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRecharge() {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 100) {
      alert('Montant minimum de recharge: 100 FCFA');
      return;
    }

    try {
      setRecharging(true);
      // On utilise 'FEDAPAY' par défaut comme demandé par l'utilisateur
      const res = await api.post('/payments/recharge', {
        amount: numAmount,
        method: 'FEDAPAY'
      });

      if (res.data?.success && res.data.data.url) {
        // Rediriger vers la page de paiement FedaPay
        window.location.href = res.data.data.url;
      } else {
        throw new Error('Erreur lors de la création de la transaction');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Une erreur est survenue lors de la recharge');
    } finally {
      setRecharging(false);
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <ArrowDownLeft className="text-green-600" size={20} />;
      case 'WITHDRAWAL': return <ArrowUpRight className="text-red-600" size={20} />;
      case 'PAYMENT': return <ArrowUpRight className="text-orange-600" size={20} />;
      case 'REFUND': return <ArrowDownLeft className="text-blue-600" size={20} />;
      default: return <Wallet size={20} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT': case 'REFUND': return 'text-green-600';
      case 'WITHDRAWAL': case 'PAYMENT': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Mon portefeuille</h1>
          <p className="text-sm sm:text-base text-gray-600">Gérez vos transactions et rechargez votre compte</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 sm:w-40 sm:h-40 bg-yellow-300/20 rounded-full blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="text-white/80" size={20} />
              <span className="text-white/80 text-xs sm:text-sm font-medium">Solde disponible</span>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8">
              {balance.toLocaleString()} <span className="text-xl sm:text-2xl text-white/80">FCFA</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowRechargeModal(true)}
                variant="primary"
                className="!bg-white !text-primary-700 hover:!bg-gray-50 shadow-lg border-none"
              >
                <Plus size={18} className="mr-2" />
                Recharger
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <ArrowUpRight size={18} className="mr-2" />
                Retirer
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <span className="text-xs sm:text-sm text-gray-600">Reçus</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">—</p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-red-600" size={20} />
              </div>
              <span className="text-xs sm:text-sm text-gray-600">Dépensés</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">—</p>
          </div>

          <div className="col-span-2 lg:col-span-2">
            <div className="bg-primary-50 border border-primary-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 h-full flex flex-col justify-center">
              <p className="text-sm text-primary-800 mb-2">
                🎉 Premier rechargement ? Recevez <strong>500 FCFA de bonus</strong> !
              </p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Historique des transactions</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-600 text-sm sm:text-base">Aucune transaction pour le moment</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 sm:p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">{tx.description}</p>
                        <p className={`font-bold text-base sm:text-lg ${getTransactionColor(tx.type)}`}>
                          {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : '-'}
                          {tx.amount.toLocaleString()} FCFA
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recharge Modal */}
        {showRechargeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Recharger mon compte</h3>
                <button
                  onClick={() => setShowRechargeModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Montant (FCFA)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="5000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    * Des frais de plateforme de 15% seront appliqués.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Résumé</p>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Montant brut</span>
                      <span className="font-medium text-gray-900">{parseFloat(amount || '0').toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frais (15%)</span>
                      <span className="font-medium text-red-600">-{Math.round(parseFloat(amount || '0') * 0.15).toLocaleString()} FCFA</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                      <span className="text-gray-900">Solde net crédité</span>
                      <span className="text-primary-600">{Math.round(parseFloat(amount || '0') * 0.85).toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Moyen de paiement</p>

                  <button 
                    onClick={handleRecharge}
                    disabled={recharging || !amount}
                    className="w-full flex items-center gap-3 p-4 border-2 border-primary-500 bg-primary-50 rounded-lg hover:bg-primary-100 transition disabled:opacity-50"
                  >
                    <Smartphone className="text-primary-600" size={24} />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 italic">Payer avec FedaPay</p>
                      <p className="text-xs text-gray-600">MoMo, Moov, Carte (Bénin & Togo)</p>
                    </div>
                  </button>
                </div>

                <Button 
                  onClick={handleRecharge} 
                  disabled={recharging || !amount}
                  fullWidth 
                  className="mt-6"
                >
                  {recharging ? 'Traitement...' : 'Payer maintenant'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
