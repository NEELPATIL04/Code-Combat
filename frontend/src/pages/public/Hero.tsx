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
        <div
            className="min-h-screen bg-black text-white relative"
            style={{
                fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                overflowX: 'hidden',
                width: '100%',
                maxWidth: '100vw'
            }}
        >
            {/* Stars Container */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {stars.map(star => (
                    <div
                        key={star.id}
                        className="absolute bg-white rounded-full opacity-0 animate-twinkle"
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
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.12), transparent)' }}
            />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-[100]" style={{ padding: '20px 40px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">Code Combat</span>
                    </a>

                    <button
                        className="flex items-center gap-2 bg-transparent text-white cursor-pointer transition-all duration-200 ease-in-out hover:bg-white/10 hover:border-white/30"
                        style={{ padding: '10px 20px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px', fontSize: '0.9rem' }}
                        onClick={() => navigate('/login')}
                    >
                        Login <ArrowRight size={16} />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section
                className="relative z-[1] flex flex-col justify-center items-center text-center"
                style={{ minHeight: '60vh', padding: '160px 40px 60px' }}
            >
                <h1
                    className="text-white/90"
                    style={{ fontSize: '4rem', fontWeight: 500, lineHeight: 1.1, margin: '0 0 24px' }}
                >
                    Battles that spark with
                    <br />
                    <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">competitive intelligence.</span>
                </h1>

                <p
                    className="text-white/50"
                    style={{ fontSize: '1.2rem', margin: '0 0 40px', maxWidth: '500px' }}
                >
                    The coding features you need to transport your skills from the little leagues to the big time.
                </p>

                <button
                    className="flex items-center gap-2.5 bg-yellow-200/10 text-yellow-200 cursor-pointer transition-all duration-200 ease-in-out hover:bg-yellow-200/20"
                    style={{ padding: '14px 32px', border: '1px solid rgba(253, 230, 138, 0.3)', borderRadius: '100px', fontSize: '1rem', fontWeight: 500 }}
                    onClick={() => navigate('/login')}
                >
                    Get Started <ArrowRight size={18} />
                </button>
            </section>

            {/* Preview Section */}
            <div className="relative z-[1]" style={{ padding: '0 40px 80px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div
                        style={{
                            background: 'rgba(20, 20, 20, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Preview Header */}
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <div className="flex gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }}></span>
                                <span className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }}></span>
                                <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }}></span>
                            </div>
                        </div>
                        {/* Preview Content */}
                        <div style={{ padding: '60px' }}>
                            <div
                                className="flex items-center justify-center"
                                style={{
                                    height: '300px',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '2px dashed rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px'
                                }}
                            >
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
