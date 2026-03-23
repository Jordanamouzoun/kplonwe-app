import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap, Clock, ArrowRight, CheckCircle, Globe, Lightbulb, Atom, BookOpen, Code, Quote } from 'lucide-react';

export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const categories = [
    { id: 'maths', name: 'Mathématiques', icon: <GraduationCap />, color: 'bg-blue-500' },
    { id: 'english', name: 'Anglais', icon: <Globe />, color: 'bg-indigo-500' },
    { id: 'physics', name: 'Physique-Chimie', icon: <AtomIcon />, color: 'bg-amber-500' },
    { id: 'french', name: 'Français', icon: <BookOpenIcon />, color: 'bg-rose-500' },
    { id: 'it', name: 'Informatique', icon: <CodeIcon />, color: 'bg-emerald-500' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/teachers?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/teachers');
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/teachers?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-white font-cinematic selection:bg-primary-100 selection:text-primary-900 overflow-x-hidden">
      
      {/* SECTION 1: HERO IMMERSIF (CINÉMATIQUE) */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Image with Cinematic Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero_cinematic.png" 
            alt="Education au Bénin" 
            className="w-full h-full object-cover scale-105 animate-pulse-slow object-[80%_center]"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/90"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center lg:text-left flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 animate-cinematic">

            <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
              Propulsez votre <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-blue-200">réussite</span> dès <br />
              aujourd'hui.
            </h1>
            
            <p className="text-lg lg:text-xl text-white/80 max-w-xl mb-10 font-medium leading-relaxed">
              KPLONWE connecte les meilleurs enseignants du Bénin avec les élèves qui rêvent de grandeur. Une éducation authentique, humaine et sans compromis.
            </p>

            {/* Premium Integrated Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-white rounded-2xl shadow-2xl p-2 gap-2">
                <div className="flex-1 flex items-center px-4 gap-3 border-r border-gray-100">
                  <Search className="text-gray-400" size={24} />
                  <input 
                    type="text" 
                    placeholder="Quelle matière souhaitez-vous maîtriser ?"
                    className="w-full py-4 text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none text-base sm:text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-black text-base transition-all flex items-center gap-2 shadow-lg shadow-primary-600/20 active:scale-95"
                >
                  Chercher
                  <ArrowRight size={20} />
                </button>
              </div>
            </form>

            <div className="mt-8 flex items-center gap-8 text-white/60">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">2k+</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">Répétiteurs</span>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">24/7</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">Accompagnement</span>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">Cotonou</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">Siège social</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CATEGORIES (MINIMALIST) */}
      <section className="py-24 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div className="animate-cinematic">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tighter">Nos univers de savoir.</h2>
              <p className="text-lg text-gray-500 font-medium max-w-xl">Explorez les disciplines les plus demandées par les parents et élèves à Fidjrossè, Cadjehoun et Porto-Novo.</p>
            </div>
            <button 
              onClick={() => navigate('/teachers')}
              className="group flex items-center gap-2 text-primary-600 font-black text-lg hover:gap-4 transition-all"
            >
              Voir tout le catalogue
              <ArrowRight size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-gray-50 bg-gray-50/50 hover:bg-white hover:border-primary-500 hover:-translate-y-2 transition-all duration-300 animate-cinematic`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${cat.color} text-white group-hover:scale-110 group-hover:rotate-12 transition-transform`}>
                  {cat.icon}
                </div>
                <span className="font-black text-gray-900 text-center tracking-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: REEL MOMENT D'APPRENTISSAGE (STORYTELLING) */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative animate-cinematic">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-600/20 blur-[80px] rounded-full"></div>
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 group">
              <img 
                src="/community_authentic.png" 
                alt="Parents et élèves" 
                className="w-full h-auto scale-100 group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent"></div>
            </div>
            {/* Real Quote Overlay */}
            <div className="absolute -bottom-10 -right-6 lg:-right-12 glass-dark p-6 rounded-3xl max-w-xs border border-white/20 shadow-2xl animate-cinematic delay-500">
               <Quote className="text-primary-400 mb-4" size={32} />
               <p className="text-sm font-bold italic mb-4 leading-relaxed">"Grâce à M. Dossou, ma fille a enfin compris les bases de l'anglais. C'est le meilleur investissement pour son avenir."</p>
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500"></div>
                 <div>
                   <p className="text-xs font-black">Mme Soglo</p>
                   <p className="text-[10px] text-white/50 uppercase tracking-widest font-black">Mère d'élève, Cotonou</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="animate-cinematic delay-300">
            <h2 className="text-5xl lg:text-7xl font-black mb-10 tracking-tighter leading-none italic uppercase">
              Plus qu'une plateforme, <br />
              <span className="text-primary-500">une famille.</span>
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6 items-start group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-primary-600 group-hover:border-primary-500 transition-all duration-300">
                  <CheckCircle size={24} className="text-primary-400 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black mb-2">Enseignants vérifiés</h3>
                  <p className="text-gray-400 font-medium">Chaque dossier est analysé avec soin. Diplômes, casier judiciaire et pédagogie sont au cœur de notre sélection.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-300">
                  <Lightbulb size={24} className="text-blue-400 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black mb-2">Méthodes modernes</h3>
                  <p className="text-gray-400 font-medium">Nos répétiteurs utilisent des techniques interactives pour redonner le goût de l'étude à votre enfant.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all duration-300">
                  <Clock size={24} className="text-indigo-400 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black mb-2">Suivi rigoureux</h3>
                  <p className="text-gray-400 font-medium">Recevez des rapports réguliers sur la progression de votre enfant via votre tableau de bord.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FINAL CTA (CIMEMATIC) */}
      <section className="py-24 relative overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 animate-cinematic">
            <h2 className="text-5xl lg:text-7xl font-black text-gray-900 mb-8 tracking-tighter leading-none">
              L'avenir se construit <br />
              <span className="text-gradient">ici et maintenant.</span>
            </h2>
            <p className="text-xl text-gray-500 font-medium mb-12 max-w-lg leading-relaxed">
              Donnez à votre enfant les outils pour briller au Bénin et à l'international. Rejoignez les milliers de familles qui nous font confiance.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <button 
                onClick={() => navigate('/register')}
                className="px-10 py-5 bg-primary-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary-600/30 hover:shadow-primary-600/50 hover:scale-105 transition-all active:scale-95"
              >
                Commencer l'aventure
              </button>
              <button 
                onClick={() => navigate('/teachers')}
                className="px-10 py-5 bg-white border-2 border-primary-600 text-primary-600 rounded-2xl font-black text-lg hover:bg-primary-50 transition-all"
              >
                Explorer les profils
              </button>
            </div>
          </div>
          <div className="flex-1 relative animate-cinematic delay-300">
             <div className="relative z-10 rounded-[3rem] overflow-hidden rotate-2 shadow-2xl border-4 border-white">
                <img src="/african_classroom.png" alt="Élève béninois" className="w-full h-auto" />
             </div>
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full -z-10 blur-[50px]"></div>
             <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-primary-100 rounded-full -z-10 blur-[70px]"></div>
          </div>
        </div>
      </section>

      {/* FOOTER PREVIEW (CLEAN) */}
      <footer className="py-20 bg-gray-50 border-t border-gray-100">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <img src="/logo-kplonwe.png" alt="KPLONWE" className="h-20 mx-auto mb-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-4">Made with pride in Cotonou, Bénin.</p>
            <div className="flex items-center justify-center gap-6 text-gray-400 font-black text-xs uppercase tracking-tighter">
               <a href="#" className="hover:text-primary-600 transition-colors">Confidentialité</a>
               <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
               <a href="#" className="hover:text-primary-600 transition-colors">Conditions</a>
               <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
               <a href="#" className="hover:text-primary-600 transition-colors">Aide</a>
            </div>
         </div>
      </footer>
    </div>
  );
}

// Icons for categories (Missing in Lucide set or custom for design)
function AtomIcon() {
  return <Atom size={32} />;
}

function BookOpenIcon() {
  return <BookOpen size={32} />;
}

function CodeIcon() {
  return <Code size={32} />;
}
