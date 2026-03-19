import { useEffect, useRef, useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, GraduationCap, Users, ShieldCheck } from 'lucide-react';

// --- Animated Component Wrapper ---
function FadeInView({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = "" 
}: { 
  children: ReactNode, 
  delay?: number, 
  direction?: 'up' | 'down' | 'left' | 'right' | 'none',
  className?: string 
}) {
  const domRef = useRef<HTMLDivElement>(null);
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisible(true);
        domRef.current && observer.unobserve(domRef.current);
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  const getTranslate = () => {
    switch (direction) {
      case 'up': return 'translate-y-12';
      case 'down': return '-translate-y-12';
      case 'left': return 'translate-x-12';
      case 'right': return '-translate-x-12';
      case 'none': return '';
    }
  };

  return (
    <div
      ref={domRef}
      className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'opacity-100 translate-y-0 translate-x-0' : `opacity-0 ${getTranslate()}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans overflow-x-hidden selection:bg-primary-200 selection:text-primary-900">

      {/* ═══ EXPERT HERO SECTION ═══════════════════════════════════════════ */}
      <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-[90rem] mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start lg:pt-10">
          
          {/* Typography & CTA (Left) */}
          <div className="lg:col-span-6 2xl:col-span-5 z-10 pt-4 lg:pt-0">
            <div className="animate-[fade-in-up_0.5s_ease-out_forwards]">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary-50 rounded-full text-primary-800 font-semibold mb-6 lg:mb-8 border border-primary-100/50 backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fdb32a] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#fdb32a]"></span>
                </span>
                La nouvelle référence éducative
              </div>
            </div>

            <div className="animate-[fade-in-up_0.6s_ease-out_forwards]">
              <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold text-gray-900 leading-[1.05] tracking-tight mb-8">
                L'éducation qui révèle <span className="text-primary-600 block mt-2">votre potentiel.</span>
              </h1>
            </div>

            <div className="animate-[fade-in-up_0.7s_ease-out_forwards]">
              <p className="text-lg sm:text-2xl text-gray-500 mb-10 leading-relaxed font-light max-w-xl">
                Trouvez des répétiteurs passionnés et bénéficiez d'un accompagnement sur-mesure pour atteindre l'excellence scolaire au Bénin.
              </p>
            </div>

            <div className="animate-[fade-in-up_0.8s_ease-out_forwards]">
              <div className="flex flex-col sm:flex-row gap-5">
                <Link
                  to="/teachers"
                  className="flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.5)] hover:-translate-y-1"
                >
                  Trouver un répétiteur
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-3 bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-lg"
                >
                  S'inscrire comme prof
                </Link>
              </div>
            </div>
          </div>

          {/* Expert Aesthetic Image Collage (Right) */}
          <div className="lg:col-span-6 2xl:col-span-7 relative h-[500px] lg:h-[700px] hidden md:block">
            {/* Image 1: Top Right */}
            <FadeInView delay={300} direction="left" className="absolute top-0 right-0 w-[60%] h-[55%] z-20">
              <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.02] transition-transform duration-700">
                <img 
                  src="https://img.freepik.com/photos-gratuite/femme-africaine-enseignant-aux-enfants-classe_23-2148892564.jpg?semt=ais_hybrid&w=740&q=80" 
                  alt="Enseignante africaine avec ses élèves" 
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 to-transparent"></div>
              </div>
            </FadeInView>

            {/* Image 2: Bottom Left */}
            <FadeInView delay={500} direction="up" className="absolute bottom-10 left-0 w-[55%] h-[50%] z-30">
              <div className="w-full h-full rounded-3xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-4 border-white transform hover:scale-[1.02] transition-transform duration-700">
                <img 
                  src="https://st3.depositphotos.com/1037987/16666/i/450/depositphotos_166664800-stock-photo-kids-raising-hands-during-lesson.jpg" 
                  alt="Élèves levant la main" 
                  className="w-full h-full object-cover"
                />
              </div>
            </FadeInView>

            {/* Floating Badge */}
            <FadeInView delay={800} direction="none" className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 z-40">
              <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/50 animate-[float_4s_ease-in-out_infinite]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#fdb32a] flex items-center justify-center text-white">
                    <Star size={24} fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-extrabold text-2xl text-gray-900 leading-none">98%</p>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">de Réussite</p>
                  </div>
                </div>
              </div>
            </FadeInView>

            {/* Background Decorative Shape */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary-50 rounded-full blur-[100px] z-0"></div>
          </div>
        </div>
      </section>

      {/* ═══ HUMAN TOUCH & MISSION SECTION ════════════════════════════════ */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        {/* Abstract background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#fdb32a] rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <FadeInView direction="right">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
                <img 
                  src="https://img.freepik.com/photos-gratuite/groupe-enfants-africains-pretant-attention-classe_23-2148892516.jpg" 
                  alt="Enfants attentifs en classe" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary-900/20 mix-blend-multiply"></div>
              </div>
            </FadeInView>

            <div className="space-y-8">
              <FadeInView delay={100}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                  Parce que chaque enfant mérite <span className="text-[#fdb32a] italic">toute notre attention.</span>
                </h2>
              </FadeInView>
              
              <FadeInView delay={200}>
                <p className="text-xl text-gray-300 font-light leading-relaxed">
                  L'éducation n'est pas qu'une transmission de savoirs. C'est une question de confiance, de méthode et d'écoute. KPLONWE connecte des familles avec des enseignants qui comprennent véritablement les défis scolaires africains.
                </p>
              </FadeInView>

              <FadeInView delay={300}>
                <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-gray-800">
                  <div>
                    <h4 className="text-5xl font-black text-white mb-2">2.5k<span className="text-primary-500">+</span></h4>
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Familles Accompagnées</p>
                  </div>
                  <div>
                    <h4 className="text-5xl font-black text-white mb-2">500<span className="text-[#fdb32a]">+</span></h4>
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Experts Certifiés</p>
                  </div>
                </div>
              </FadeInView>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ EXPERT BENTO GRID FEATURES ═══════════════════════════════════ */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInView className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-primary-600 font-bold tracking-widest text-sm uppercase mb-4">L'excellence en action</h2>
          <h3 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Une approche centrée sur l'humain et la technologie.
          </h3>
        </FadeInView>

        <div className="grid md:grid-cols-3 gap-6 auto-rows-[300px]">
          
          {/* Card 1: Wide */}
          <FadeInView delay={100} className="md:col-span-2 bg-gray-50 rounded-[2.5rem] p-10 relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
            <ShieldCheck size={48} strokeWidth={1.5} className="text-primary-600 mb-8" />
            <h4 className="text-3xl font-bold text-gray-900 mb-4">Profils Rigoureusement Vérifiés</h4>
            <p className="text-lg text-gray-600 max-w-md">
              Nous rencontrons et certifions chaque répétiteur. Leurs diplômes, leur identité et leur pédagogie sont scrupuleusement analysés.
            </p>
          </FadeInView>

          {/* Card 2: Square Image */}
          <FadeInView delay={200} className="bg-primary-600 rounded-[2.5rem] relative overflow-hidden group">
            <img 
              src="https://i0.wp.com/oecd-development-matters.org/wp-content/uploads/2022/12/digitalisation-west-africa-education-development-matters-1220x675-1.jpg?fit=1200%2C675&ssl=1" 
              alt="Digitalisation" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/40 to-transparent p-10 flex flex-col justify-end">
              <h4 className="text-2xl font-bold text-white mb-2">Suivi Numérique</h4>
              <p className="text-primary-100">Des outils digitaux pour mesurer la progression au jour le jour.</p>
            </div>
          </FadeInView>

          {/* Card 3: Square */}
          <FadeInView delay={300} className="bg-white border border-gray-100 shadow-sm rounded-[2.5rem] p-10 hover:shadow-xl transition-all hover:border-primary-100">
            <GraduationCap size={48} strokeWidth={1.5} className="text-[#fdb32a] mb-8" />
            <h4 className="text-2xl font-bold text-gray-900 mb-4">Coaching d'Excellence</h4>
            <p className="text-gray-600">
              Des méthodes éprouvées pour préparer sereinement les examens nationaux.
            </p>
          </FadeInView>

          {/* Card 4: Wide */}
          <FadeInView delay={400} className="md:col-span-2 bg-[#fdb32a] rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="relative z-10 w-full md:w-2/3 h-full flex flex-col justify-center">
              <Users size={48} strokeWidth={1.5} className="text-gray-900 mb-8" />
              <h4 className="text-3xl font-bold text-gray-900 mb-4">Une Communauté Solidaire</h4>
              <p className="text-lg text-gray-900/80">
                Un forum d'entraide et un classement motivant pour que chaque élève trouve sa voie.
              </p>
            </div>
            {/* Decorative pattern */}
            <svg className="absolute -right-20 -bottom-20 w-96 h-96 text-white/20 transform rotate-12 group-hover:rotate-45 transition-transform duration-[2000ms]" fill="currentColor" viewBox="0 0 100 100">
              <path d="M50 0 L100 50 L50 100 L0 50 Z" />
            </svg>
          </FadeInView>

        </div>
      </section>

      {/* ═══ THEMATIC CTA WITH BANNER IMAGE ═══════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://assets.globalpartnership.org/s3fs-public/styles/standard_blog_banner/public/blog_post/image/11173216786_fbef7350ac_k.jpg?VersionId=DiLpqoIBDAEmXwFWHUVUASOx6RMj91pb&itok=Z5O7pEzt" 
            alt="Enfants dans une salle de classe" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-primary-900/80 backdrop-blur-sm"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <FadeInView>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight">
              Investissez dans leur <span className="text-[#fdb32a]">avenir.</span>
            </h2>
          </FadeInView>
          <FadeInView delay={200}>
            <p className="text-xl text-primary-100 mb-12 max-w-2xl mx-auto font-light">
              L'éducation a le pouvoir de changer des vies. Rejoignez la communauté KPLONWE aujourd'hui pour offrir ou donner le meilleur accompagnement possible.
            </p>
          </FadeInView>
          <FadeInView delay={300}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/register"
                className="bg-white text-gray-900 hover:bg-gray-100 px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl transition-all hover:scale-105"
              >
                Inscrire un élève
              </Link>
              <Link
                to="/register"
                className="bg-[#fdb32a] text-gray-900 hover:bg-[#eb9d13] px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl transition-all hover:scale-105"
              >
                Devenir répétiteur
              </Link>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* ═══ FOOTER ═══════════════════════════════════════════════════════ */}
      <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
            <div className="md:col-span-5">
              <img
                src="/logo-kplonwe.png"
                alt="KPLONWE"
                className="h-16 w-auto object-contain mb-8"
              />
              <p className="text-gray-500 max-w-sm text-lg leading-relaxed">
                Connecter les esprits brillants. La plateforme de mentorat et de soutien scolaire premium du Bénin.
              </p>
            </div>

            <div className="md:col-span-3 md:col-start-7">
              <h4 className="text-gray-900 font-bold mb-6 text-xl tracking-tight">Navigation</h4>
              <ul className="space-y-4">
                <li><Link to="/teachers" className="text-gray-500 hover:text-primary-600 transition-colors">Trouver un professeur</Link></li>
                <li><Link to="/ranking" className="text-gray-500 hover:text-primary-600 transition-colors">Le Classement</Link></li>
                <li><Link to="/forum" className="text-gray-500 hover:text-primary-600 transition-colors">Forum d'entraide</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-gray-900 font-bold mb-6 text-xl tracking-tight">Légal</h4>
              <ul className="space-y-4">
                <li><Link to="#" className="text-gray-500 hover:text-primary-600 transition-colors">Confidentialité</Link></li>
                <li><Link to="#" className="text-gray-500 hover:text-primary-600 transition-colors">CGU</Link></li>
                <li><Link to="#" className="text-gray-500 hover:text-primary-600 transition-colors">Mentions légales</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 font-medium text-sm">
              © 2026 KPLONWE. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
              Made with <Heart size={16} fill="currentColor" className="text-red-500 mx-1" /> in Bénin
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
