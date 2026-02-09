import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, AlertCircle } from 'lucide-react';

// Get API URL from environment
const LOCAL_BACKEND = import.meta.env.VITE_LOCAL_BACKEND_URL || 'http://localhost:5000/api';
const LIVE_BACKEND = import.meta.env.VITE_LIVE_BACKEND_URL || 'http://49.13.223.175:5000/api';
const backendMode = import.meta.env.VITE_BACKEND_MODE || 'local';
const API_URL = backendMode === 'live' ? LIVE_BACKEND : LOCAL_BACKEND;

interface Star {
    id: number;
    left: string;
    top: string;
    size: number;
    delay: number;
    duration: number;
}

interface AuthResponse {
    message: string;
    role: string;
    username: string;
    userId: number;
    email: string;
    token: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [emailError, setEmailError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
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

    // Clear errors when switching modes
    const toggleMode = () => {
        setIsRegisterMode(!isRegisterMode);
        setError('');
        setSuccess('');
        setEmailError('');
        setPasswordError('');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    // Validate email on change
    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEmail(val);
        if (val && !EMAIL_REGEX.test(val)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    // Validate confirm password
    const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setConfirmPassword(val);
        if (val && val !== password) {
            setPasswordError('Passwords do not match');
        } else {
            setPasswordError('');
        }
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPassword(val);
        if (confirmPassword && val !== confirmPassword) {
            setPasswordError('Passwords do not match');
        } else {
            setPasswordError('');
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Frontend validation for register
        if (isRegisterMode) {
            if (!EMAIL_REGEX.test(email)) {
                setError('Please enter a valid email address');
                setLoading(false);
                return;
            }
            if (username.length < 3) {
                setError('Username must be at least 3 characters');
                setLoading(false);
                return;
            }
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                setError('Username can only contain letters, numbers, and underscores');
                setLoading(false);
                return;
            }
            if (password.length < 8) {
                setError('Password must be at least 8 characters');
                setLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }
        }

        try {
            const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
            const body = isRegisterMode
                ? { username, email, password, role: 'player' }
                : { username, password };

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data: AuthResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || (isRegisterMode ? 'Registration failed' : 'Authentication failed'));
            }

            if (isRegisterMode) {
                // Auto-login after registration
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('username', data.username);
                sessionStorage.setItem('role', data.role);
                sessionStorage.setItem('userId', data.userId.toString());
                sessionStorage.setItem('email', data.email);
                navigate('/player');
            } else {
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('username', data.username);
                sessionStorage.setItem('role', data.role);
                sessionStorage.setItem('userId', data.userId.toString());
                sessionStorage.setItem('email', data.email);

                if (data.role === 'admin' || data.role === 'super_admin') {
                    navigate('/admin');
                } else {
                    navigate('/player');
                }
            }
        } catch (err) {
            console.error(`❌ ${isRegisterMode ? 'Register' : 'Login'} error:`, err);
            setError(err instanceof Error ? err.message : `${isRegisterMode ? 'Registration' : 'Login'} failed. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 14px',
        fontSize: '0.875rem',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        color: '#ffffff',
        outline: 'none',
        boxSizing: 'border-box' as const,
        transition: 'border-color 0.2s ease',
    };

    const inputErrorStyle: React.CSSProperties = {
        ...inputStyle,
        border: '1px solid rgba(239, 68, 68, 0.5)',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.75rem',
        textTransform: 'uppercase' as const,
        marginBottom: '8px',
        fontWeight: 500,
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: '0.1em',
    };

    const fieldErrorStyle: React.CSSProperties = {
        fontSize: '0.75rem',
        color: '#ef4444',
        marginTop: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
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

            {/* Container - 50/50 Split */}
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

                {/* Right Side - Form */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '60px',
                    background: 'rgba(20, 20, 20, 0.6)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                    overflowY: 'auto',
                }}>
                    {/* Form - centered */}
                    <form style={{ width: '100%', maxWidth: '400px', margin: 'auto' }} onSubmit={handleSubmit}>
                        {/* Toggle tabs */}
                        <div style={{
                            display: 'flex',
                            marginBottom: '28px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            borderRadius: '10px',
                            padding: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                        }}>
                            <button
                                type="button"
                                onClick={() => { if (isRegisterMode) toggleMode(); }}
                                style={{
                                    flex: 1,
                                    padding: '10px 16px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    background: !isRegisterMode ? 'rgba(253, 230, 138, 0.15)' : 'transparent',
                                    color: !isRegisterMode ? '#FDE68A' : 'rgba(255, 255, 255, 0.4)',
                                    boxShadow: !isRegisterMode ? '0 2px 8px rgba(253, 230, 138, 0.1)' : 'none',
                                }}
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                onClick={() => { if (!isRegisterMode) toggleMode(); }}
                                style={{
                                    flex: 1,
                                    padding: '10px 16px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    background: isRegisterMode ? 'rgba(253, 230, 138, 0.15)' : 'transparent',
                                    color: isRegisterMode ? '#FDE68A' : 'rgba(255, 255, 255, 0.4)',
                                    boxShadow: isRegisterMode ? '0 2px 8px rgba(253, 230, 138, 0.1)' : 'none',
                                }}
                            >
                                Create Account
                            </button>
                        </div>

                        <p style={{
                            fontSize: '0.875rem',
                            margin: '0 0 24px',
                            lineHeight: 1.5,
                            textAlign: 'center',
                            color: 'rgba(255, 255, 255, 0.5)'
                        }}>
                            {isRegisterMode
                                ? 'Create your player account to join the battle arena.'
                                : 'Enter your credentials to access the battle arena.'}
                        </p>

                        {/* Username */}
                        <div style={{ marginBottom: '18px' }}>
                            <label style={labelStyle}>CODENAME</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                placeholder={isRegisterMode ? 'Choose a codename (3+ chars)' : 'Enter your codename'}
                                required
                                style={inputStyle}
                                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(253, 230, 138, 0.4)'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
                            />
                        </div>

                        {/* Email - only for register */}
                        {isRegisterMode && (
                            <div style={{ marginBottom: '18px' }}>
                                <label style={labelStyle}>EMAIL</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        placeholder="your@email.com"
                                        required
                                        style={emailError ? inputErrorStyle : inputStyle}
                                        onFocus={(e) => {
                                            if (!emailError) e.currentTarget.style.borderColor = 'rgba(253, 230, 138, 0.4)';
                                        }}
                                        onBlur={(e) => {
                                            if (!emailError) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                        }}
                                    />
                                    {email && !emailError && (
                                        <Mail size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#34d399' }} />
                                    )}
                                </div>
                                {emailError && (
                                    <div style={fieldErrorStyle}>
                                        <AlertCircle size={12} />
                                        {emailError}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Password */}
                        <div style={{ marginBottom: '18px' }}>
                            <label style={labelStyle}>
                                {isRegisterMode ? 'PASSWORD (min 8 characters)' : 'ACCESS KEY'}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={isRegisterMode ? handlePasswordChange : (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                placeholder={isRegisterMode ? 'Create a strong password' : 'Enter your passkey'}
                                required
                                style={inputStyle}
                                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(253, 230, 138, 0.4)'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
                            />
                            {isRegisterMode && password && (
                                <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                                    {[1, 2, 3, 4].map((level) => (
                                        <div
                                            key={level}
                                            style={{
                                                flex: 1,
                                                height: '3px',
                                                borderRadius: '2px',
                                                background: password.length >= level * 3
                                                    ? password.length >= 12 ? '#22c55e'
                                                        : password.length >= 10 ? '#eab308'
                                                            : password.length >= 8 ? '#f97316'
                                                                : '#ef4444'
                                                    : 'rgba(255, 255, 255, 0.1)',
                                                transition: 'background 0.2s ease',
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password - only for register */}
                        {isRegisterMode && (
                            <div style={{ marginBottom: '18px' }}>
                                <label style={labelStyle}>CONFIRM PASSWORD</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    placeholder="Re-enter your password"
                                    required
                                    style={passwordError ? inputErrorStyle : inputStyle}
                                    onFocus={(e) => {
                                        if (!passwordError) e.currentTarget.style.borderColor = 'rgba(253, 230, 138, 0.4)';
                                    }}
                                    onBlur={(e) => {
                                        if (!passwordError) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    }}
                                />
                                {passwordError && (
                                    <div style={fieldErrorStyle}>
                                        <AlertCircle size={12} />
                                        {passwordError}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div style={{
                                padding: '10px 14px',
                                marginBottom: '16px',
                                fontSize: '0.85rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Success message */}
                        {success && (
                            <div style={{
                                padding: '10px 14px',
                                marginBottom: '16px',
                                fontSize: '0.85rem',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#34d399',
                                borderRadius: '8px',
                            }}>
                                {success}
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading || (isRegisterMode && (!!emailError || !!passwordError))}
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
                                cursor: loading || (isRegisterMode && (!!emailError || !!passwordError)) ? 'not-allowed' : 'pointer',
                                background: '#ffffff',
                                color: '#000000',
                                borderRadius: '8px',
                                marginTop: '8px',
                                opacity: loading || (isRegisterMode && (!!emailError || !!passwordError)) ? 0.5 : 1,
                                transition: 'opacity 0.2s ease',
                            }}
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" /> {isRegisterMode ? 'Creating Account...' : 'Authenticating...'}</>
                            ) : (
                                <>{isRegisterMode ? 'Create Account & Enter Arena' : 'Enter Arena'}</>
                            )}
                        </button>

                        {/* Toggle link */}
                        <p style={{
                            textAlign: 'center',
                            marginTop: '20px',
                            fontSize: '0.85rem',
                            color: 'rgba(255, 255, 255, 0.4)',
                        }}>
                            {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                type="button"
                                onClick={toggleMode}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#FDE68A',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    padding: 0,
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '3px',
                                }}
                            >
                                {isRegisterMode ? 'Login here' : 'Create one'}
                            </button>
                        </p>
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
