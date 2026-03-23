import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
  lastMessageAt: string;
}

export function MessagesListPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      setLoading(true);
      const response = await api.get('/messages/conversations');
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Erreur chargement messagerie:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    `${conv.otherUser.firstName} ${conv.otherUser.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const getAvatarUrl = (avatar: string | null | undefined) => {
    if (!avatar) return null;
    if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
    return `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${avatar}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Chargement de vos échanges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Messagerie</h1>
            <p className="text-lg text-gray-500 font-medium">
              Gérez vos conversations avec les {user?.role === 'TEACHER' ? 'parents et élèves' : 'professeurs'}.
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un nom..."
              className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium text-gray-700 outline-none"
            />
          </div>
        </header>

        {/* Liste conversations */}
        {filteredConversations.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-20 shadow-sm border border-gray-100 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mb-6">
              <MessageSquare size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              {searchQuery ? 'Aucun résultat' : 'Pas encore de messages'}
            </h2>
            <p className="text-gray-500 font-medium max-w-sm">
              {searchQuery
                ? `Nous n'avons trouvé personne correspondant à "${searchQuery}".`
                : 'Commencez vos premiers échanges en contactant un professeur depuis son profil.'}
            </p>
            {!searchQuery && (
              <Link to="/teachers" className="mt-8">
                <Button className="rounded-2xl px-8 py-6 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/10 transition-all active:scale-95">
                  Trouver un professeur
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation) => {
              const otherUser = conversation.otherUser;
              const lastMsg = conversation.lastMessage;
              const hasUnread = conversation.unreadCount > 0;
              
              return (
                <Link
                  key={conversation.id}
                  to={`/messages/${conversation.id}`}
                  className={`group relative flex items-center gap-6 p-6 bg-white rounded-[2rem] border-2 transition-all hover:shadow-xl hover:shadow-gray-200/50 ${
                    hasUnread ? 'border-primary-100' : 'border-transparent'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow-md">
                      {getAvatarUrl(otherUser.avatar) ? (
                        <img 
                          src={getAvatarUrl(otherUser.avatar)!} 
                          alt={otherUser.firstName} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-600 font-black text-xl">
                          {otherUser.firstName[0]}{otherUser.lastName[0]}
                        </div>
                      )}
                    </div>
                    {hasUnread && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-lg font-black text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                        {otherUser.firstName} {otherUser.lastName}
                      </h3>
                      {lastMsg && (
                        <time className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex-shrink-0">
                          {formatDistanceToNow(new Date(lastMsg.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </time>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                        {otherUser.role === 'TEACHER' ? 'Professeur' : 'Parent'}
                       </span>
                       {hasUnread && <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse"></span>}
                    </div>

                    {lastMsg ? (
                      <p className={`text-sm truncate leading-relaxed ${hasUnread ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>
                        {lastMsg.senderId === user?.id && <span className="text-primary-500 font-black mr-1">Vous :</span>}
                        {lastMsg.content}
                      </p>
                    ) : (
                      <p className="text-sm italic text-gray-400 font-medium">Lancer la discussion...</p>
                    )}
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 hidden sm:block">
                    <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                      <Search className="rotate-90" size={18} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
