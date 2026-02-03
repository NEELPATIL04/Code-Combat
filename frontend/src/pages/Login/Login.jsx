import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Authentication Failed');
            }

            const { role } = data;
            if (role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/task');
            }
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="animated-bg">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
            </div>

            <div className="login-card">
                <div className="logo-section">
                    <span className="logo-icon">⚔️</span>
                    <h1>CODE COMBAT</h1>
                    <p className="tagline">Enter the Battle Arena</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">
                            <span className="label-icon">👤</span> CODENAME
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your codename"
                            autoComplete="off"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">
                            <span className="label-icon">🔑</span> ACCESS KEY
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your passkey"
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <span className="loading-text">
                                <span className="spinner"></span> AUTHENTICATING...
                            </span>
                        ) : (
                            <span>INITIATE LOGIN →</span>
                        )}
                    </button>
                </form>

                <div className="footer-text">
                    <p>Ready to battle? Enter the arena.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
