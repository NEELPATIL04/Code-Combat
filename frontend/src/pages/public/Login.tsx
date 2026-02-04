import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import './Login.css';

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

            // Store authentication data in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('role', data.role);

            console.log('✅ Login successful:', {
                username: data.username,
                role: data.role
            });

            // Redirect based on user role
            if (data.role === 'admin' || data.role === 'super_admin') {
                navigate('/admin');
            } else {
                navigate('/task');
            }
        } catch (err) {
            console.error('❌ Login error:', err);
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page dark">
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

            <div className="login-container">
                {/* Left Side - Logo and Welcome with Typing Animation */}
                <div className="login-left">
                    <div className="logo-section">
                        <svg className="logo-icon" width="32" height="32" viewBox="0 0 28 28" fill="none">
                            <circle cx="14" cy="14" r="12" stroke="url(#logoGrad)" strokeWidth="1.5" />
                            <circle cx="14" cy="14" r="5" fill="url(#logoGrad)" />
                            <defs>
                                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                                    <stop offset="0%" stopColor="#FDE68A" />
                                    <stop offset="100%" stopColor="#F59E0B" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="logo-text">Code Combat</span>
                    </div>

                    <div className="welcome-content">
                        <h1 className="welcome-title">
                            Welcome,
                            <br />
                            <span className="typed-text">
                                {typedText}
                                <span className="cursor">|</span>
                            </span>
                        </h1>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="login-right">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <p className="form-subtitle">
                            Enter your credentials to access the battle arena.
                        </p>

                        <div className="input-group">
                            <label>CODENAME</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                placeholder="Enter your codename"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>ACCESS KEY</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                placeholder="Enter your passkey"
                                required
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="login-cta" disabled={loading}>
                            {loading ? (
                                <><Loader2 size={18} className="spin" /> Authenticating...</>
                            ) : (
                                <>Enter Arena</>
                            )}
                        </button>
                    </form>

                    <p className="copyright-text">
                        © 2024 Code Combat. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
