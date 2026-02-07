import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
    label: string;
    path: string;
}

const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/player' },
    { label: 'Profile', path: '/profile' },
];

const ParticipantLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const isActive = (path: string): boolean => {
        if (path === '/player') return location.pathname === '/player';
        return location.pathname.startsWith(path);
    };

    const handleLogout = (): void => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0b',
            color: '#ffffff',
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
            {/* Horizontal Navbar */}
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '64px',
                background: '#111113',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 64px',
                zIndex: 1000
            }}>
                {/* Left Section - Logo + Navigation */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '32px'
                }}>
                    {/* Logo */}
                    <div
                        onClick={() => navigate('/player')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <circle cx="14" cy="14" r="12" stroke="url(#logoGradNav)" strokeWidth="1.5" />
                            <circle cx="14" cy="14" r="5" fill="url(#logoGradNav)" />
                            <defs>
                                <linearGradient id="logoGradNav" x1="0" y1="0" x2="28" y2="28">
                                    <stop offset="0%" stopColor="#FDE68A" />
                                    <stop offset="100%" stopColor="#F59E0B" />
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

                    {/* Navigation Links */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        {navItems.map(item => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                style={{
                                    padding: '6px 0',
                                    background: 'transparent',
                                    border: 'none',
                                    color: isActive(item.path) ? '#FDE68A' : 'rgba(255, 255, 255, 0.5)',
                                    fontSize: '0.9rem',
                                    fontWeight: isActive(item.path) ? 600 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive(item.path)) {
                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive(item.path)) {
                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                                    }
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Section - Profile */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: '200px',
                    justifyContent: 'flex-end'
                }}>
                    {/* User Profile Dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            style={{
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
                                border: 'none',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(253, 230, 138, 0.25)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <User size={18} style={{ color: '#0a0a0b' }} />
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <>
                                <div
                                    style={{
                                        position: 'fixed',
                                        inset: 0,
                                        zIndex: 1001
                                    }}
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 12px)',
                                    right: 0,
                                    width: '220px',
                                    background: '#1a1a1c',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    padding: '8px',
                                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
                                    zIndex: 1002
                                }}>
                                    {/* User Info */}
                                    <div style={{
                                        padding: '12px 14px',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                                        marginBottom: '8px'
                                    }}>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '0.95rem',
                                            fontWeight: 600,
                                            color: '#ffffff'
                                        }}>{user?.name || 'Participant'}</p>
                                        <p style={{
                                            margin: '4px 0 0',
                                            fontSize: '0.8rem',
                                            color: 'rgba(255, 255, 255, 0.5)'
                                        }}>{user?.email || 'user@example.com'}</p>
                                    </div>

                                    {/* Menu Items */}
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            navigate('/player/settings');
                                        }}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px 14px',
                                            background: 'transparent',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.color = '#ffffff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                        }}
                                    >
                                        <Settings size={18} />
                                        Settings
                                    </button>

                                    <div style={{
                                        height: '1px',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        margin: '8px 0'
                                    }} />

                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px 14px',
                                            background: 'transparent',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#f87171',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{
                paddingTop: '64px',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '1200px',
                    padding: '32px 40px'
                }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ParticipantLayout;
