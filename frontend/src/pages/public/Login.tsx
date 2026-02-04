import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
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
    role: string;
    message?: string;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const stars: Star[] = Array.from({ length: 150 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2
    }));

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data: LoginResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Authentication Failed');
            }

            const { role } = data;
            if (role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/task');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
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
                </div>
            </nav>

            <section className="login-section">
                <h1 className="login-title">
                    Welcome back,
                    <br />
                    <span className="title-highlight">Commander.</span>
                </h1>

                <p className="login-subtitle">
                    Enter your credentials to access the battle arena.
                </p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label><User size={14} /> CODENAME</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                            placeholder="Enter your codename"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label><KeyRound size={14} /> ACCESS KEY</label>
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
                            <>Enter Arena <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>
            </section>
        </div>
    );
};

export default Login;
