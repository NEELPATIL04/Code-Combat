import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

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
        <div className="hero-page">
            <div className="stars-container">
                {stars.map(star => (
                    <div
                        key={star.id}
                        className="star"
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

            <div className="gradient-overlay"></div>

            <nav className="nav">
                <div className="nav-inner">
                    <a href="/" className="nav-logo">
                        <svg className="logo-icon" width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <circle cx="14" cy="14" r="12" stroke="url(#logoGrad)" strokeWidth="1.5" />
                            <circle cx="14" cy="14" r="5" fill="url(#logoGrad)" />
                            <defs>
                                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                                    <stop offset="0%" stopColor="#FDE68A" />
                                    <stop offset="100%" stopColor="#F59E0B" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span>Code Combat</span>
                    </a>

                    <div className="nav-links">
                        <button className="nav-btn" onClick={() => navigate('/login')}>
                            Login <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </nav>

            <section className="hero">
                <h1 className="hero-title">
                    Battles that spark with
                    <br />
                    <span className="title-highlight">competitive intelligence.</span>
                </h1>

                <p className="hero-subtitle">
                    The coding features you need to transport your skills from the little leagues to the big time.
                </p>

                <button className="hero-cta" onClick={() => navigate('/login')}>
                    Get Started <ArrowRight size={18} />
                </button>
            </section>

            <div className="preview-section">
                <div className="preview-container">
                    <div className="preview-frame">
                        <div className="preview-header">
                            <div className="window-dots">
                                <span className="dot dot-red"></span>
                                <span className="dot dot-yellow"></span>
                                <span className="dot dot-green"></span>
                            </div>
                        </div>
                        <div className="preview-content">
                            <div className="preview-placeholder">
                                <div className="placeholder-text">Your Product Screenshot</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
