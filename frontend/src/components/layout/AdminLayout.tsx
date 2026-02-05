import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Trophy, UserCog, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MenuItem {
    icon: React.ReactNode;
    label: string;
    path: string;
}

interface MenuSection {
    title?: string;
    items: MenuItem[];
}

const menuSections: MenuSection[] = [
    {
        items: [
            { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
        ]
    },
    {
        items: [
            { icon: <Users size={20} />, label: 'Participants', path: '/admin/participants' },
            { icon: <Trophy size={20} />, label: 'Contests', path: '/admin/contests' },
            { icon: <UserCog size={20} />, label: 'Manage Users', path: '/admin/manage-users' },
            { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
        ]
    }
];

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [collapsed, setCollapsed] = useState<boolean>(false);

    const isActive = (path: string): boolean => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    const handleLogout = (): void => {
        logout();
        navigate('/login');
    };

    const sidebarWidth = collapsed ? 80 : 220;

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#0a0a0a',
            color: '#ffffff',
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
            {/* Sidebar */}
            <aside style={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${sidebarWidth}px`,
                background: '#0d0d0d',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                transition: 'width 0.3s ease-in-out'
            }}>

                {/* Sidebar Header */}
                <div style={{
                    height: '70px',
                    padding: collapsed ? '0' : '0 16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    gap: '12px'
                }}>
                    {/* Logo */}
                    {!collapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                                <circle cx="14" cy="14" r="12" stroke="url(#logoGrad)" strokeWidth="1.5" />
                                <circle cx="14" cy="14" r="5" fill="url(#logoGrad)" />
                                <defs>
                                    <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                                        <stop offset="0%" stopColor="#FDE68A" />
                                        <stop offset="100%" stopColor="#F59E0B" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span style={{
                                fontSize: '1rem',
                                fontWeight: 600,
                                background: 'linear-gradient(90deg, #FDE68A 0%, #FBBF24 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                whiteSpace: 'nowrap'
                            }}>Code Combat</span>
                        </div>
                    )}

                    {/* Collapse Button */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            color: 'rgba(255, 255, 255, 0.5)',
                            cursor: 'pointer',
                            flexShrink: 0
                        }}
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{
                    flex: 1,
                    padding: '20px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}>
                    {menuSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {section.title && !collapsed && (
                                <div style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    color: 'rgba(255, 255, 255, 0.3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    padding: '0 16px 8px'
                                }}>
                                    {section.title}
                                </div>
                            )}
                            {section.items.map(item => (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    title={collapsed ? item.label : undefined}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: collapsed ? '12px' : '10px 16px',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        background: isActive(item.path) ? 'rgba(253, 230, 138, 0.1)' : 'transparent',
                                        border: isActive(item.path) ? '1px solid rgba(253, 230, 138, 0.2)' : '1px solid transparent',
                                        borderRadius: '10px',
                                        color: isActive(item.path) ? '#FDE68A' : 'rgba(255, 255, 255, 0.6)',
                                        fontSize: '0.95rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        width: '100%',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {item.icon}
                                    {!collapsed && <span>{item.label}</span>}
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer - Logout */}
                <div style={{
                    padding: '20px 12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    marginTop: 'auto'
                }}>
                    <button
                        onClick={handleLogout}
                        title={collapsed ? 'Logout' : undefined}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: collapsed ? '12px' : '10px 16px',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            background: 'transparent',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '10px',
                            color: '#ef4444',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <LogOut size={20} />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main
                style={{
                    flex: 1,
                    minHeight: '100vh',
                    marginLeft: `${sidebarWidth}px`,
                    padding: '40px 48px',
                    transition: 'margin-left 0.3s ease-in-out'
                }}
            >
                <div style={{ width: '100%', maxWidth: '1400px' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
