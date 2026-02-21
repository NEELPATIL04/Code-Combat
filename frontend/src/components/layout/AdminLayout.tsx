import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Trophy, UserCog, Settings, LogOut, ChevronLeft, ChevronRight, Bot, Code } from 'lucide-react';
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
            { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin' },
            { icon: <Users size={18} />, label: 'Participants', path: '/admin/participants' },
            { icon: <Trophy size={18} />, label: 'Contests', path: '/admin/contests' },
            { icon: <Code size={18} />, label: 'Problems', path: '/admin/problems' },
            { icon: <UserCog size={18} />, label: 'Manage Users', path: '/admin/manage-users' },
            { icon: <Bot size={18} />, label: 'AI Usage', path: '/admin/ai-usage' },
            { icon: <Settings size={18} />, label: 'Settings', path: '/admin/settings' },
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

    const sidebarWidth = collapsed ? 72 : 240;

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#09090b',
            color: '#fafafa',
            fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', sans-serif"
        }}>
            {/* Sidebar */}
            <aside style={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${sidebarWidth}px`,
                background: '#09090b',
                borderRight: '1px solid #27272a',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                transition: 'width 0.2s ease',
                overflow: 'hidden',
            }}>

                {/* Sidebar Header */}
                <div style={{
                    height: '48px',
                    padding: collapsed ? '0' : '0 12px',
                    borderBottom: '1px solid #27272a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    gap: '12px'
                }}>
                    {/* Logo */}
                    {!collapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                                <circle cx="14" cy="14" r="12" stroke="#fafafa" strokeWidth="1.5" />
                                <circle cx="14" cy="14" r="5" fill="#fafafa" />
                            </svg>
                            <span style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: '#fafafa',
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
                            background: 'transparent',
                            border: '1px solid #27272a',
                            borderRadius: '6px',
                            color: '#71717a',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'background 0.2s ease, border-color 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#18181b';
                            e.currentTarget.style.borderColor = '#3f3f46';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = '#27272a';
                        }}
                    >
                        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{
                    flex: 1,
                    padding: '10px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}>
                    {menuSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {section.title && !collapsed && (
                                <div style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: '#71717a',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    padding: '8px 12px 8px'
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
                                        padding: collapsed ? '10px' : '8px 12px',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        background: isActive(item.path) ? '#27272a' : 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: isActive(item.path) ? '#fafafa' : '#a1a1aa',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        width: '100%',
                                        textAlign: 'left',
                                        transition: 'background 0.15s ease, color 0.15s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        if (!isActive(item.path)) {
                                            e.currentTarget.style.background = '#18181b';
                                            e.currentTarget.style.color = '#fafafa';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (!isActive(item.path)) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = '#a1a1aa';
                                        }
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
                    padding: '10px 8px',
                    borderTop: '1px solid #27272a',
                    marginTop: 'auto'
                }}>
                    <button
                        onClick={handleLogout}
                        title={collapsed ? 'Logout' : undefined}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: collapsed ? '10px' : '8px 12px',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#ef4444',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left',
                            transition: 'background 0.15s ease'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <LogOut size={18} />
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
                    padding: '16px 20px',
                    transition: 'margin-left 0.2s ease',
                    contain: 'style',
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

