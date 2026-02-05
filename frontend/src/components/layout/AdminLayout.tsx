import React, { useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Trophy, UserCog, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './AdminLayout.css';

interface MenuItem {
    icon: ReactNode;
    label: string;
    path: string;
}

interface MenuSection {
    title?: string;
    items: MenuItem[];
}

interface AdminLayoutProps {
    children: ReactNode;
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

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
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

    return (
        <div className={`admin-layout dark ${collapsed ? 'collapsed' : ''}`}>
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <circle cx="14" cy="14" r="12" stroke="url(#logoGrad)" strokeWidth="1.5" />
                            <circle cx="14" cy="14" r="5" fill="url(#logoGrad)" />
                            <defs>
                                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                                    <stop offset="0%" stopColor="#FDE68A" />
                                    <stop offset="100%" stopColor="#F59E0B" />
                                </linearGradient>
                            </defs>
                        </svg>
                        {!collapsed && <span>Code Combat</span>}
                    </div>
                    <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="nav-section">
                            {section.title && !collapsed && (
                                <div className="section-title">{section.title}</div>
                            )}
                            {section.items.map(item => (
                                <button
                                    key={item.path}
                                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                                    onClick={() => navigate(item.path)}
                                    title={collapsed ? item.label : undefined}
                                >
                                    {item.icon}
                                    {!collapsed && <span>{item.label}</span>}
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item logout" onClick={handleLogout} title={collapsed ? 'Logout' : undefined}>
                        <LogOut size={20} />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
