import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ArrowLeft, Send, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
  id: string;
  senderId: string;
  senderRole: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar: string | null;
}

export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<Participant | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [liveRegionMessage, setLiveRegionMessage] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const getAvatarUrl = (avatar: string | null | undefined) => {
    if (!avatar) return null;
    if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
    return `${backendUrl}${avatar}`;
  };

  // Charger messages
  useEffect(() => {
    if (conversationId) {
      loadMessages();
      markAsRead();

      // Rafraîchir toutes les 5 secondes
      const interval = setInterval(() => {
        loadMessages(true);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [conversationId]);

  // Scroll auto vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadMessages(silent = false) {
    try {
      if (!silent) setLoading(true);

      const response = await api.get(`/messages/conversations/${conversationId}`);
      if (response.data.success) {
        setMessages(response.data.messages);
      }

      // Récupérer infos conversation
      const convResponse = await api.get('/messages/conversations');
      if (convResponse.data.success) {
        const conv = convResponse.data.conversations.find((c: any) => c.id === conversationId);
        if (conv) {
          setOtherUser(conv.otherUser);
        }
      }
    } catch (error) {
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function markAsRead() {
    try {
      await api.put(`/messages/conversations/${conversationId}/read`);
    } catch (error) {
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await api.post(`/messages/conversations/${conversationId}/messages`, {
        content: newMessage.trim(),
      });

      if (response.data.success) {
        setMessages([...messages, response.data.message]);
        setNewMessage('');
        setLiveRegionMessage('Message envoyé');
        setTimeout(() => setLiveRegionMessage(''), 100);

        // Focus sur input après envoi
        setTimeout(() => {
          messageInputRef.current?.focus();
        }, 100);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erreur lors de l\'envoi du message';
      setLiveRegionMessage(`Erreur: ${errorMsg}`);
      setTimeout(() => setLiveRegionMessage(''), 100);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Ouverture de la discussion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveRegionMessage}
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/messages"
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
            >
              <ArrowLeft size={20} />
            </Link>

            {otherUser && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-white shadow-sm">
                  {getAvatarUrl(otherUser.avatar) ? (
                    <img src={getAvatarUrl(otherUser.avatar)!} alt={otherUser.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-600 font-black text-sm">
                      {otherUser.firstName[0]}{otherUser.lastName[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-base font-black text-gray-900 leading-tight">
                    {otherUser.firstName} {otherUser.lastName}
                  </h1>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary-500">
                    {otherUser.role === 'TEACHER' ? 'Professeur' : 'Parent'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={32} />
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2">Dites bonjour !</h2>
              <p className="text-gray-500 font-medium">Lancez la discussion pour organiser vos séances.</p>
            </div>
          ) : (
            <div role="log" aria-label="Fil de la conversation" className="space-y-6">
              {messages.map((message, index) => {
                const isOwn = message.senderId === user?.id;
                const showAvatar = index === 0 || messages[index-1].senderId !== message.senderId;

                return (
                  <div key={message.id} className={`flex items-end gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar miniature sur le côté */}
                    <div className="w-8 h-8 flex-shrink-0 mb-1 opacity-0 sm:opacity-100">
                      {showAvatar && !isOwn && otherUser && (
                         <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100 border border-white shadow-sm">
                            {getAvatarUrl(otherUser.avatar) ? (
                              <img src={getAvatarUrl(otherUser.avatar)!} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-600 font-black text-[10px]">
                                {otherUser.firstName[0]}{otherUser.lastName[0]}
                              </div>
                            )}
                         </div>
                      )}
                    </div>

                    <div className={`max-w-[80%] sm:max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-5 py-3 rounded-[1.5rem] text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${
                          isOwn
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                        }`}
                      >
                        {message.content}
                      </div>
                      <time className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 px-1">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: fr })}
                      </time>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input Zone */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-100 px-6 py-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative flex items-end gap-3 bg-gray-50 p-2 rounded-[2rem] border border-gray-100 focus-within:bg-white focus-within:border-primary-100 transition-all shadow-inner">
            <textarea
              id="message-input"
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Écrivez votre message..."
              rows={1}
              className="flex-1 bg-transparent px-4 py-3 text-sm font-medium text-gray-700 outline-none resize-none max-h-32"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="w-12 h-12 flex items-center justify-center bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 text-white rounded-2xl shadow-lg shadow-primary-200 transition-all active:scale-90 flex-shrink-0"
            >
              {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send size={20} />}
            </button>
          </form>
          <div className="flex items-center justify-between mt-3 px-4">
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
               Entrée pour envoyer • Maj+Entrée pour passer à la ligne
             </p>
             <p className="text-[10px] font-black text-primary-300 uppercase tracking-widest flex items-center gap-1">
               <ShieldCheck size={12} /> Sécurisé par Kplonwé
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
