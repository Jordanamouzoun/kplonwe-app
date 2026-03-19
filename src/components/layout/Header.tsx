import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, Home, MessageSquare, Wallet, Settings, LogOut } from 'lucide-react';

function buildAvatarUrl(avatar: string | null | undefined): string | null {
  if (!avatar) return null;
  if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
  return `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${avatar}`;
}

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const avatarUrl = buildAvatarUrl(user?.avatar);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const publicLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Trouver un répétiteur', path: '/teachers' },
    { name: 'Forum', path: '/forum' },
    { name: 'Cours', path: '/courses' },
  ];

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          
          {/* Logo */}
          <Link
            to={user ? '/dashboard' : '/'}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <img 
              src="/logo-kplonwe.png" 
              alt="KPLONWE" 
              className="h-16 sm:h-20 md:h-24 w-auto object-contain transition-transform hover:scale-105"
            />
          </Link>

          {/* Center Navigation - Desktop (Clean & Airy) */}
          <nav className="hidden lg:flex items-center gap-10 absolute left-1/2 transform -translate-x-1/2">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-semibold text-[15px] transition-all hover:text-primary-600 relative py-2 ${
                  isActive(link.path) 
                    ? 'text-primary-600 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary-600 after:rounded-full' 
                    : 'text-gray-500 hover:translate-y-[-1px]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Section: Role Switches & Profile */}
          <div className="flex items-center gap-3 sm:gap-6">
            
            {user ? (
              <>

                {/* Desktop User Menu */}
                <div className="hidden lg:flex items-center gap-4 pl-4 border-l border-gray-100">
                  <div className="flex items-center gap-3 relative group">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary-50 ring-offset-2" />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <span className="text-white font-bold text-sm">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <div className="hidden xl:block">
                      <p className="text-sm font-bold text-gray-900 leading-none mb-1">{user.firstName}</p>
                      <p className="text-[10px] text-primary-600 font-bold uppercase tracking-wider">ACTIF</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Déconnexion"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              /* Non connecté - Desktop */
              <div className="hidden lg:flex items-center gap-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-700 text-white rounded-xl text-sm font-bold shadow-xl shadow-primary-600/20 hover:shadow-primary-600/40 hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2.5 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
              aria-label="Menu"
              type="button"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay + Panel */}
      {mobileMenuOpen && (
        <>
          {/* Overlay sombre cliquable */}
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Panel menu slide depuis la droite */}
          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden overflow-y-auto transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              
              {/* Header du panel */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                {user ? (
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-primary-700 font-bold text-lg">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-primary-600 font-semibold uppercase mt-0.5">{user.role}</p>
                    </div>
                  </div>
                ) : (
                  <div className="font-bold text-primary-600 text-lg">Menu</div>
                )}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-full transition-colors bg-gray-100/50"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-5 space-y-2 overflow-y-auto">
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Navigation Principale</h3>
                  {publicLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                        isActive(link.path) 
                          ? 'bg-primary-50 text-primary-700 font-bold' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600 font-medium'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </div>

                {user && (
                  <div className="mt-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Espace Personnel</h3>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Home size={18} />
                      <span>Tableau de bord</span>
                    </Link>
                    <Link
                      to="/messages"
                      className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <MessageSquare size={18} />
                      <span>Messages</span>
                    </Link>
                    {user?.role !== 'STUDENT' && (
                      <Link
                        to="/wallet"
                        className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Wallet size={18} />
                        <span>Portefeuille</span>
                      </Link>
                    )}
                  </div>
                )}
                
                <div className="border-t border-gray-100 my-4" />
                
                <Link
                  to="/settings/accessibility"
                  className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Paramètres</span>
                </Link>

                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium mt-2"
                    type="button"
                  >
                    <LogOut size={18} />
                    <span>Déconnexion</span>
                  </button>
                ) : (
                  <div className="mt-6 flex flex-col gap-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 text-center text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl font-bold transition-colors"
                    >
                      Se connecter
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 text-center text-white bg-primary-600 hover:bg-primary-700 rounded-xl font-bold shadow-md transition-colors"
                    >
                      S'inscrire
                    </Link>
                  </div>
                )}
              </nav>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 text-center">
                <img 
                  src="/logo-kplonwe.png" 
                  alt="KPLONWE" 
                  className="h-14 sm:h-16 w-auto mx-auto mb-3 object-contain opacity-80"
                />
                <p className="text-xs text-gray-400 font-medium">© 2026 Tous droits réservés.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
