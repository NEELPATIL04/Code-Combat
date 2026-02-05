import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface Star {
    id: number;
    left: string;
    top: string;
    size: number;
    delay: number;
    duration: number;
}

interface LoginResponse {
    message: string;
    role: string;
    username: string;
    token: string;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [typedText, setTypedText] = useState<string>('');
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [wordIndex, setWordIndex] = useState<number>(0);

    const words = ['Commander', 'Player'];

    const stars: Star[] = Array.from({ length: 150 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2
    }));

    // Typing animation effect
    useEffect(() => {
        const currentWord = words[wordIndex];
        const typingSpeed = isDeleting ? 50 : 100;
        const pauseTime = isDeleting ? 500 : 2000;

        const timer = setTimeout(() => {
            if (!isDeleting) {
                if (typedText.length < currentWord.length) {
                    setTypedText(currentWord.substring(0, typedText.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), pauseTime);
                }
            } else {
                if (typedText.length > 0) {
                    setTypedText(currentWord.substring(0, typedText.length - 1));
                } else {
                    setIsDeleting(false);
                    setWordIndex((prev) => (prev + 1) % words.length);
                }
            }
        }, typingSpeed);

        return () => clearTimeout(timer);
    }, [typedText, isDeleting, wordIndex, words]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data: LoginResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Authentication Failed');
            }

            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('username', data.username);
            sessionStorage.setItem('role', data.role);

            if (data.role === 'admin' || data.role === 'super_admin') {
                navigate('/admin');
            } else {
                navigate('/player');
            }
        } catch (err) {
            console.error('❌ Login error:', err);
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                background: '#000000',
                color: '#ffffff',
                fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif"
            }}
        >
            {/* Stars */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
                {stars.map(star => (
                    <div
                        key={star.id}
                        className="animate-twinkle"
                        style={{
                            position: 'absolute',
                            background: '#ffffff',
                            borderRadius: '50%',
                            opacity: 0,
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
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 0,
                background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.12), transparent)'
            }} />

            {/* Login Container - 50/50 Split */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                height: '100vh',
                display: 'flex',
                alignItems: 'stretch'
            }}>
                {/* Left Side - Logo and Welcome */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '60px',
                    position: 'relative'
                }}>
                    {/* Logo Section */}
                    <div style={{ position: 'absolute', top: '40px', left: '60px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                            <circle cx="14" cy="14" r="12" stroke="url(#logoGrad)" strokeWidth="1.5" />
                            <circle cx="14" cy="14" r="5" fill="url(#logoGrad)" />
                            <defs>
                                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                                    <stop offset="0%" stopColor="#FDE68A" />
                                    <stop offset="100%" stopColor="#FBBF24" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span style={{
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            background: 'linear-gradient(90deg, #FDE68A 0%, #FBBF24 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>Code Combat</span>
                    </div>

                    {/* Welcome Content */}
                    <div style={{ maxWidth: '600px' }}>
                        <h1 style={{ fontSize: '4rem', fontWeight: 600, lineHeight: 1.2, margin: '0 0 24px', color: '#ffffff' }}>
                            Welcome,
                            <br />
                            <span style={{
                                display: 'inline-block',
                                minWidth: '300px',
                                background: 'linear-gradient(90deg, #FDE68A 0%, #FBBF24 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                {typedText}
                                <span style={{ color: '#FDE68A', marginLeft: '4px', animation: 'blink 1s step-end infinite' }}>|</span>
                            </span>
                        </h1>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '60px',
                    background: 'rgba(20, 20, 20, 0.6)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    {/* Form - centered */}
                    <form style={{ width: '100%', maxWidth: '400px', margin: 'auto' }} onSubmit={handleSubmit}>
                        <p style={{
                            fontSize: '0.875rem',
                            margin: '0 0 24px',
                            lineHeight: 1.5,
                            textAlign: 'center',
                            color: 'rgba(255, 255, 255, 0.5)'
                        }}>
                            Enter your credentials to access the battle arena.
                        </p>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                marginBottom: '8px',
                                fontWeight: 500,
                                color: 'rgba(255, 255, 255, 0.5)',
                                letterSpacing: '0.1em'
                            }}>CODENAME</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                placeholder="Enter your codename"
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    fontSize: '0.875rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                marginBottom: '8px',
                                fontWeight: 500,
                                color: 'rgba(255, 255, 255, 0.5)',
                                letterSpacing: '0.1em'
                            }}>ACCESS KEY</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                placeholder="Enter your passkey"
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    fontSize: '0.875rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {error && (
                            <div style={{
                                padding: '10px',
                                marginBottom: '16px',
                                fontSize: '0.875rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                                borderRadius: '8px'
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px 16px',
                                border: 'none',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                background: '#ffffff',
                                color: '#000000',
                                borderRadius: '8px',
                                marginTop: '8px',
                                opacity: loading ? 0.5 : 1
                            }}
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" /> Authenticating...</>
                            ) : (
                                <>Enter Arena</>
                            )}
                        </button>
                    </form>

                    {/* Copyright - at bottom */}
                    <p style={{
                        width: '100%',
                        maxWidth: '400px',
                        margin: '0 auto',
                        paddingBottom: '20px',
                        fontSize: '0.75rem',
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.4)'
                    }}>
                        © 2024 Code Combat. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
