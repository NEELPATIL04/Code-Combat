import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Code2, Zap, Trophy, Users, Terminal } from 'lucide-react';

const Hero: React.FC = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        { 
            icon: <Code2 className="w-6 h-6" />, 
            title: 'Live Execution', 
            desc: 'Run code in real-time with instant output feedback.' 
        },
        { 
            icon: <Zap className="w-6 h-6" />, 
            title: 'High Performance', 
            desc: 'Optimized environment for low-latency coding battles.' 
        },
        { 
            icon: <Trophy className="w-6 h-6" />, 
            title: 'Global Rankings', 
            desc: 'Climb the leaderboards and prove your mastery.' 
        },
        { 
            icon: <Users className="w-6 h-6" />, 
            title: 'Multiplayer', 
            desc: 'Challenge friends or match with rivals worldwide.' 
        },
    ];

    return (
        <div className="min-h-screen bg-[#020202] text-white selection:bg-yellow-500/30 selection:text-yellow-200 font-sans">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/5 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* Navbar */}
            <header 
                className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
                    scrolled 
                        ? 'bg-[#0a0a0a]/80 backdrop-blur-md border-white/10 py-3' 
                        : 'bg-transparent border-transparent py-5'
                }`}
            >
                <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-bold shadow-lg shadow-yellow-500/20 group-hover:shadow-yellow-500/40 transition-all">
                            <Terminal size={18} strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white group-hover:text-white/90 transition-colors">
                            CodeCombat
                        </span>
                    </a>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/login')}
                            className="hidden sm:flex text-sm font-medium text-white/60 hover:text-white transition-colors"
                        >
                            Log in
                        </button>
                        <button 
                            onClick={() => navigate('/login')}
                            className="h-9 px-5 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            Get Started <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative pt-32 pb-20">
                {/* Hero Content */}
                <section className="container mx-auto px-6 max-w-7xl flex flex-col items-center text-center">
                    
                    {/* Announcement Pill */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
                        <span className="flex h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        <span className="text-xs font-medium text-white/80 tracking-wide uppercase">Season 1 Now Live</span>
                    </div>

                    {/* Headline */}
                    <h1 className="max-w-4xl text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                        Master code through <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500">
                            competitive battles
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="max-w-2xl text-lg text-white/50 mb-10 leading-relaxed antialiased">
                        Step into the arena where your coding skills are the only weapon you need. 
                        Compete in real-time, solve complex algorithms, and climb the global ranks.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-24">
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto h-12 px-8 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-base transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.5)]"
                        >
                            Start Battling Now
                        </button>
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto h-12 px-8 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium text-base border border-white/10 transition-all backdrop-blur-sm"
                        >
                            View Leaderboard
                        </button>
                    </div>

                    {/* Code Window Preview */}
                    <div className="w-full max-w-5xl mx-auto relative perspective-1000 group">
                        {/* Glow effect focusing on the code window */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                        
                        <div className="relative bg-[#0F0F0F] rounded-xl border border-white/10 shadow-2xl overflow-hidden transform transition-transform duration-700 hover:scale-[1.01]">
                            {/* Window Title Bar */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50"></div>
                                    </div>
                                    <span className="ml-3 text-xs text-white/30 font-mono">contest-arena.ts</span>
                                </div>
                                <div className="text-xs text-white/20 font-mono">ReadOnly</div>
                            </div>
                            
                            {/* Editor Content */}
                            <div className="p-6 md:p-8 overflow-hidden text-left bg-[#0A0A0A]">
                                <div className="font-mono text-sm md:text-base leading-relaxed">
                                    <div className="flex">
                                        <span className="w-8 text-white/10 select-none text-right mr-4">1</span>
                                        <p><span className="text-pink-400">interface</span> <span className="text-yellow-200">Player</span> {'{'}</p>
                                    </div>
                                    <div className="flex">
                                        <span className="w-8 text-white/10 select-none text-right mr-4">2</span>
                                        <p className="pl-4"><span className="text-blue-300">id</span>: <span className="text-green-300">string</span>;</p>
                                    </div>
                                    <div className="flex">
                                        <span className="w-8 text-white/10 select-none text-right mr-4">3</span>
                                        <p className="pl-4"><span className="text-blue-300">rank</span>: <span className="text-green-300">number</span>;</p>
                                    </div>
                                    <div className="flex">
                                        <span className="w-8 text-white/10 select-none text-right mr-4">4</span>
                                        <p>{'}'}</p>
                                    </div>
                                    <div className="flex h-4"><span className="w-8 text-white/10 select-none text-right mr-4">5</span></div>
                                    <div className="flex">
                                        <span className="w-8 text-white/10 select-none text-right mr-4">6</span>
                                        <p><span className="text-pink-400">function</span> <span className="text-purple-300">calculateVictory</span>(<span className="text-orange-300">p1</span>: <span className="text-yellow-200">Player</span>, <span className="text-orange-300">p2</span>: <span className="text-yellow-200">Player</span>): <span className="text-green-300">boolean</span> {'{'}</p>
                                    </div>
                                    <div className="flex">
                                        <span className="w-8 text-white/10 select-none text-right mr-4">7</span>
                                        <p className="pl-4"><span className="text-gray-500">// Join the battle to reveal the algorithm...</span></p>
                                    </div>
                                    <div className="flex">
                                        <span className="w-8 text-white/10 select-none text-right mr-4">8</span>
                                        <p className="pl-4"><span className="text-pink-400">return</span> <span className="text-orange-300">p1</span>.<span className="text-blue-300">rank</span> &gt; <span className="text-orange-300">p2</span>.<span className="text-blue-300">rank</span>;</p>
                                    </div>
                                    <div className="flex">
                                        <span className="w-8 text-white/10 select-none text-right mr-4">9</span>
                                        <p>{'}'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="container mx-auto px-6 max-w-7xl py-20 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-colors group">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 flex items-center justify-center text-yellow-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-white/5 py-10 bg-[#050505]">
                <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-white/30">
                    <p>© 2024 CodeCombat Inc.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Hero;
