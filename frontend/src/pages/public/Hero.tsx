import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface Star {
    id: number;
    left: string;
    top: string;
    size: number;
    delay: number;
    duration: number;
}

const Hero: React.FC = () => {
    const navigate = useNavigate();

    const stars: Star[] = Array.from({ length: 200 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2
    }));

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden" style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            {/* Stars */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                {stars.map(star => (
                    <div
                        key={star.id}
                        className="absolute bg-white rounded-full animate-twinkle opacity-0"
                        style={{
                            left: star.left,
                            top: star.top,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            animationDelay: `${star.delay}s`,
                            animationDuration: `${star.duration}s`
                        }}
                    />
                ))}
            </div>

            {/* Gradient Overlay */}
            <div className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.12), transparent)' }}></div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-[100] py-5 px-10">
                <div className="max-w-[1200px] mx-auto flex justify-between items-center">
                    <a href="/" className="flex items-center gap-2.5 no-underline text-white font-semibold">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="url(#logoGrad)" strokeWidth="1.5" />
                            <circle cx="12" cy="12" r="4" fill="url(#logoGrad)" />
                            <defs>
                                <linearGradient id="logoGrad" x1="0" y1="0" x2="24" y2="24">
                                    <stop offset="0%" stopColor="#FDE68A" />
                                    <stop offset="100%" stopColor="#FBBF24" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">Code Combat</span>
                    </a>

                    <button
                        className="flex items-center gap-2 py-2.5 px-5 bg-transparent border border-white/20 text-white font-inherit text-[0.9rem] rounded-[100px] cursor-pointer transition-all duration-200 ease-in-out hover:bg-white/10 hover:border-white/30"
                        onClick={() => navigate('/login')}
                    >
                        Login <ArrowRight size={16} />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-[1] min-h-[60vh] flex flex-col justify-center items-center pt-40 px-10 pb-[60px] text-center">
                <h1 className="text-[4rem] font-medium leading-[1.1] m-0 mb-6 text-white/90">
                    Battles that spark with
                    <br />
                    <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">competitive intelligence.</span>
                </h1>

                <p className="text-[1.2rem] text-white/50 m-0 mb-10 max-w-[500px]">
                    The coding features you need to transport your skills from the little leagues to the big time.
                </p>

                <button
                    className="flex items-center gap-2.5 py-3.5 px-8 bg-yellow-200/10 border border-yellow-200/30 text-yellow-200 font-inherit text-[1rem] font-medium rounded-full cursor-pointer transition-all duration-200 ease-in-out hover:bg-yellow-200/20"
                    onClick={() => navigate('/login')}
                >
                    Get Started <ArrowRight size={18} />
                </button>
            </section>

            {/* Preview Section */}
            <div className="relative z-[1] px-10 pb-20">
                <div className="max-w-[900px] mx-auto">
                    <div className="bg-[rgba(20,20,20,0.8)] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="py-3 px-4 border-b border-white/10">
                            <div className="flex gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#ff5f57]"></span>
                                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
                                <span className="w-3 h-3 rounded-full bg-[#28c840]"></span>
                            </div>
                        </div>
                        <div className="p-[60px]">
                            <div className="h-[300px] bg-white/[0.02] border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center">
                                <span className="text-white/30">Your Product Screenshot</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
