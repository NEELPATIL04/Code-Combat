import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Code, Zap, Users } from 'lucide-react';

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
            {/* Stars Container - Only in Hero Section */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ top: 0, bottom: 'auto', height: '100vh' }}>
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

            {/* Gradient Overlay - Only in Hero Section */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{ 
                    background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.12), transparent)',
                    top: 0,
                    bottom: 'auto',
                    height: '100vh'
                }}
            />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-100" style={{ padding: '20px 40px' }}>
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
                        <span className="bg-linear-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">Code Combat</span>
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
                className="relative z-1 flex flex-col justify-center items-center text-center"
                style={{ minHeight: '100vh', padding: '160px 40px 60px' }}
            >
                <h1
                    className="text-white/90"
                    style={{ fontSize: '4rem', fontWeight: 500, lineHeight: 1.1, margin: '0 0 24px' }}
                >
                    Battles that spark with
                    <br />
                    <span className="bg-linear-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">competitive intelligence.</span>
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
            <div style={{ padding: '60px 40px', background: '#0a0a0b', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div
                        style={{
                            background: 'rgba(20, 20, 20, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <div className="flex gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }}></span>
                                <span className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }}></span>
                                <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }}></span>
                            </div>
                        </div>
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

            {/* About Us Section */}
            <section style={{ padding: '80px 40px', background: '#0a0a0b', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{
                            fontSize: '3rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            margin: '0 0 24px'
                        }}>
                            About <span className="bg-linear-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">Code Combat</span>
                        </h2>
                        <p style={{
                            fontSize: '1.1rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            We're building the ultimate platform for competitive programmers to battle, learn, and grow together.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '32px'
                    }}>
                        {[
                            { icon: Code, title: 'Real Battles', desc: 'Compete in real-time contests against programmers from around the world. Test your skills and climb the leaderboards.' },
                            { icon: Zap, title: 'Instant Feedback', desc: 'Get instant feedback on your solutions with detailed explanations, test cases, and optimization tips to improve faster.' },
                            { icon: Users, title: 'Community', desc: 'Join a thriving community of passionate developers, share solutions, and learn from the best coders worldwide.' }
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '16px',
                                    padding: '40px 32px',
                                    transition: 'all 0.3s ease'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(253, 230, 138, 0.05)';
                                        e.currentTarget.style.borderColor = 'rgba(253, 230, 138, 0.2)';
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '12px',
                                        background: 'rgba(253, 230, 138, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <Icon size={28} style={{ color: '#FDE68A' }} />
                                    </div>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#ffffff', margin: '0 0 12px' }}>{item.title}</h3>
                                    <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>{item.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Why Choose Code Combat Section */}
            <section style={{ padding: '80px 40px', background: '#0a0a0b', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{
                            fontSize: '3rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            margin: '0 0 24px'
                        }}>
                            Why Choose <span className="bg-linear-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">Code Combat?</span>
                        </h2>
                        <p style={{
                            fontSize: '1.1rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            Everything you need to become an elite competitive programmer
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '32px'
                    }}>
                        {[
                            { title: 'Premium Problem Set', desc: 'Curated from easy to expert level problems' },
                            { title: 'Real-time Rankings', desc: 'Live leaderboards and instant updates' },
                            { title: 'Advanced Analytics', desc: 'Track your progress and improvement' },
                            { title: 'AI-Powered Hints', desc: 'Smart suggestions to guide your learning' }
                        ].map((item, i) => (
                            <div key={i} style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '16px',
                                padding: '40px 32px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                transition: 'all 0.3s ease',
                                borderLeft: '4px solid rgba(253, 230, 138, 0.3)'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(253, 230, 138, 0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(253, 230, 138, 0.2)';
                                    e.currentTarget.style.borderLeftColor = 'rgba(253, 230, 138, 0.6)';
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                    e.currentTarget.style.borderLeftColor = 'rgba(253, 230, 138, 0.3)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <CheckCircle2 size={20} style={{ color: '#FDE68A', minWidth: '20px' }} />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>{item.title}</h3>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0, marginLeft: '32px' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ready to Level Up Section */}
            <section style={{ padding: '80px 40px 100px', background: '#0a0a0b', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                        <h2 style={{
                            fontSize: '3.5rem',
                            fontWeight: 600,
                            color: '#ffffff',
                            margin: '0 0 40px',
                            lineHeight: 1.2
                        }}>
                            Ready to<br />
                            <span className="bg-linear-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">Level Up?</span>
                        </h2>

                        <div style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            padding: '50px 40px',
                            marginBottom: '40px',
                            backdropFilter: 'blur(10px)',
                            borderLeft: '4px solid rgba(253, 230, 138, 0.3)'
                        }}>
                            <p style={{
                                fontSize: '1.15rem',
                                color: 'rgba(255, 255, 255, 0.7)',
                                margin: 0,
                                lineHeight: 1.6,
                                maxWidth: '700px',
                                marginLeft: 'auto',
                                marginRight: 'auto'
                            }}>
                                Join thousands of competitive programmers already mastering algorithms, climbing rankings, and building their coding careers on Code Combat.
                            </p>
                        </div>

                        <button
                            className="flex items-center gap-2.5 bg-yellow-200/10 text-yellow-200 cursor-pointer transition-all duration-300 ease-in-out hover:bg-yellow-200/20 hover:scale-105 mx-auto"
                            style={{ padding: '16px 48px', border: '1px solid rgba(253, 230, 138, 0.3)', borderRadius: '100px', fontSize: '1.05rem', fontWeight: 600 }}
                            onClick={() => navigate('/login')}
                        >
                            Start Your Journey Now <ArrowRight size={20} />
                        </button>

                        <p style={{
                            fontSize: '0.9rem',
                            color: 'rgba(255, 255, 255, 0.4)',
                            margin: '32px 0 0',
                            letterSpacing: '0.5px'
                        }}>
                            No credit card required • Free to start
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Hero;
