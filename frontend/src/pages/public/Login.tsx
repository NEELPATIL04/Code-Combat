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
                // Typing forward
                if (typedText.length < currentWord.length) {
                    setTypedText(currentWord.substring(0, typedText.length + 1));
                } else {
                    // Pause before deleting
                    setTimeout(() => setIsDeleting(true), pauseTime);
                }
            } else {
                // Deleting
                if (typedText.length > 0) {
                    setTypedText(currentWord.substring(0, typedText.length - 1));
                } else {
                    // Move to next word
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
            // Call backend API for authentication
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data: LoginResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Authentication Failed');
            }

            // Store authentication data in sessionStorage (allows multiple sessions per PC)
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('username', data.username);
            sessionStorage.setItem('role', data.role);

            console.log('✅ Login successful:', {
                username: data.username,
                role: data.role
            });

            // Redirect based on user role
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
        <div className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen overflow-hidden bg-[#0a0a0a] text-white" style={{ fontFamily: "'Geist', 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            {/* Stars */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                {stars.map(star => (
                    <div
                        key={star.id}
                        className="absolute bg-white rounded-full opacity-0"
                        style={{
                            left: star.left,
                            top: star.top,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            animation: `twinkle ${star.duration}s ease-in-out infinite`,
                            animationDelay: `${star.delay}s`
                        }}
                    />
                ))}
            </div>

            {/* Gradient Overlay */}
            <div className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.12), transparent)' }}></div>

            {/* Login Container - 50/50 Split */}
            <div className="relative z-[1] h-screen flex">
                {/* Left Side - Logo and Welcome with Typing Animation */}
                <div className="flex-1 flex flex-col justify-center px-16 py-12 relative overflow-hidden">
                    {/* Logo Section */}
                    <div className="absolute top-10 left-16 flex items-center gap-3">
                        <svg className="flex-shrink-0" width="32" height="32" viewBox="0 0 28 28" fill="none">
                            <circle cx="14" cy="14" r="12" stroke="url(#logoGrad)" strokeWidth="1.5" />
                            <circle cx="14" cy="14" r="5" fill="url(#logoGrad)" />
                            <defs>
                                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                                    <stop offset="0%" stopColor="#FDE68A" />
                                    <stop offset="100%" stopColor="#FBBF24" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="text-[1.1rem] font-semibold" style={{
                            background: 'linear-gradient(90deg, #FDE68A 0%, #FBBF24 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>Code Combat</span>
                    </div>

                    {/* Welcome Content */}
                    <div className="max-w-[550px]">
                        <h1 className="text-[3.5rem] font-bold leading-[1.15] m-0 mb-5 text-white">
                            Welcome,
                            <br />
                            <span className="inline-block min-w-[300px]" style={{
                                background: 'linear-gradient(90deg, #FDE68A 0%, #FBBF24 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                {typedText}
                                <span className="ml-1" style={{ color: '#FDE68A', animation: 'blink 1s step-end infinite' }}>|</span>
                            </span>
                        </h1>

                        <p className="text-[1.2rem] m-0 leading-[1.6] text-white/50">
                            Enter the arena and prove your coding mastery.
                        </p>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex-1 flex flex-col justify-center items-center px-16 py-12 overflow-hidden bg-[#111111] border-l border-white/10">
                    {/* Form - centered */}
                    <form className="w-full max-w-[380px]" onSubmit={handleSubmit}>
                        <p className="text-[0.875rem] m-0 mb-6 leading-[1.5] text-center text-white/50">
                            Enter your credentials to access the battle arena.
                        </p>

                        <div className="mb-5">
                            <label className="block text-[0.75rem] uppercase mb-2 font-medium text-white/50 tracking-[0.1em]">CODENAME</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                placeholder="Enter your codename"
                                required
                                className="w-full py-2.5 px-3.5 text-[0.875rem] transition-all duration-200 ease-in-out focus:outline-none bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50"
                            />
                        </div>

                        <div className="mb-5">
                            <label className="block text-[0.75rem] uppercase mb-2 font-medium text-white/50 tracking-[0.1em]">ACCESS KEY</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                placeholder="Enter your passkey"
                                required
                                className="w-full py-2.5 px-3.5 text-[0.875rem] transition-all duration-200 ease-in-out focus:outline-none bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50"
                            />
                        </div>

                        {error && (
                            <div className="p-2.5 mb-4 text-[0.875rem] bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-yellow-400/30 bg-yellow-400/10 text-yellow-200 text-[0.875rem] font-medium cursor-pointer transition-all duration-200 ease-in-out mt-2 rounded-lg hover:bg-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin-slow" /> Authenticating...</>
                            ) : (
                                <>Enter Arena</>
                            )}
                        </button>
                    </form>

                    <p className="text-[0.75rem] text-center text-white/40 mt-8">
                        © 2024 Code Combat. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
