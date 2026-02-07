import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Code, Zap, Users, ChevronDown } from 'lucide-react';

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
    const [showNav, setShowNav] = useState(true);
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    useEffect(() => {
        let lastScrollY = 0;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Show nav if at the top or scrolling up, hide if scrolling down past hero
            if (currentScrollY < 100) {
                setShowNav(true);
            } else if (currentScrollY > lastScrollY) {
                setShowNav(false);
            } else {
                setShowNav(true);
            }
            
            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            {/* Stars Container - Only until Preview Section */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ top: 0, height: 'calc(100vh + 200px)' }}>
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

            {/* Gradient Overlay - Only until Preview Section */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{ 
                    background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.12), transparent)',
                    top: 0,
                    height: 'calc(100vh + 200px)'
                }}
            />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-100" style={{ 
                padding: '20px 40px',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                opacity: showNav ? 1 : 0,
                transform: showNav ? 'translateY(0)' : 'translateY(-100%)',
                pointerEvents: showNav ? 'auto' : 'none'
            }}>
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

            {/* About Us Section */}
            <section style={{ padding: '80px 40px', background: '#000000', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '28px'
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
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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

                    {/* 2x2 Grid Layout with Proper Spacing */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '28px',
                        maxWidth: '700px',
                        margin: '0 auto'
                    }}>
                        {/* Card 1 - Regular */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            padding: '28px 24px',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            minHeight: '180px'
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
                                <Code size={28} style={{ color: '#FDE68A' }} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', margin: '0 0 12px' }}>Premium Problems</h3>
                            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>Curated from easy to expert level problems</p>
                        </div>

                        {/* Card 2 - Regular */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            padding: '28px 24px',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            minHeight: '180px'
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
                                <Zap size={28} style={{ color: '#FDE68A' }} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', margin: '0 0 12px' }}>Real-time Rankings</h3>
                            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>Live leaderboards and instant updates</p>
                        </div>

                        {/* Card 3 - Regular */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            padding: '28px 24px',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            minHeight: '180px'
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
                                <Users size={28} style={{ color: '#FDE68A' }} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', margin: '0 0 12px' }}>Advanced Analytics</h3>
                            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>Track your progress and improvement</p>
                        </div>

                        {/* Card 4 - Regular */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            padding: '28px 24px',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            minHeight: '180px'
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
                                <Code size={28} style={{ color: '#FDE68A' }} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', margin: '0 0 12px' }}>AI-Powered Hints</h3>
                            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>Smart suggestions to guide your learning</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section style={{ padding: '80px 40px', background: '#000000', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{
                            fontSize: '3rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            margin: '0 0 24px'
                        }}>
                            Frequently Asked <span className="bg-linear-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">Questions</span>
                        </h2>
                        <p style={{
                            fontSize: '1.1rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            Find answers to common questions about Code Combat
                        </p>
                    </div>

                    {/* FAQ Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            {
                                question: 'How do I get started with Code Combat?',
                                answer: 'Simply create a free account, choose a contest, and start competing. No setup or installation required. You can write code directly in our browser-based editor.'
                            },
                            {
                                question: 'Are contests free to participate in?',
                                answer: 'Yes! All contests on Code Combat are completely free. We believe competitive programming should be accessible to everyone.'
                            },
                            {
                                question: 'What programming languages are supported?',
                                answer: 'We support a wide range of languages including Python, C++, Java, JavaScript, Go, Rust, and more. You can write in your preferred language.'
                            },
                            {
                                question: 'How are rankings calculated?',
                                answer: 'Rankings are determined by the number of problems solved correctly and the time taken to solve them. Faster solutions rank higher on the leaderboard.'
                            },
                            {
                                question: 'Can I view solutions after a contest?',
                                answer: 'Yes, after a contest ends, you can view your solutions, test cases, and explanations. Learn from others\' approaches as well.'
                            },
                            {
                                question: 'Is there a way to practice before contests?',
                                answer: 'Absolutely! We have a practice section with problems of varying difficulty levels where you can hone your skills anytime.'
                            }
                        ].map((faq, index) => (
                            <div
                                key={index}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <button
                                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                                    style={{
                                        width: '100%',
                                        padding: '20px 24px',
                                        background: expandedFAQ === index ? 'rgba(253, 230, 138, 0.05)' : 'transparent',
                                        border: 'none',
                                        color: '#ffffff',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (expandedFAQ !== index) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (expandedFAQ !== index) {
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    <span style={{ textAlign: 'left' }}>{faq.question}</span>
                                    <ChevronDown
                                        size={20}
                                        style={{
                                            color: '#FDE68A',
                                            flexShrink: 0,
                                            marginLeft: '16px',
                                            transition: 'transform 0.3s ease',
                                            transform: expandedFAQ === index ? 'rotate(180deg)' : 'rotate(0)'
                                        }}
                                    />
                                </button>
                                {expandedFAQ === index && (
                                    <div
                                        style={{
                                            padding: '20px 24px 24px',
                                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                            animation: 'slideDown 0.3s ease'
                                        }}
                                    >
                                        <p style={{
                                            fontSize: '0.95rem',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            margin: 0,
                                            lineHeight: 1.8,
                                            letterSpacing: '0.3px'
                                        }}>
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CSS Animations */}
                <style>{`
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
            </section>
        </div>
    );
};

export default Hero;
