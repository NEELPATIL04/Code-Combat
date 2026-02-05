import React, { useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Trophy, UserCog, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

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
        <div className="flex min-h-screen bg-[#0a0a0a] text-white font-['Geist',system-ui,sans-serif]">
            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 bottom-0 bg-[#0f0f0f] border-r border-white/[0.06] flex flex-col z-[1000] transition-all duration-300 ease-out ${collapsed ? 'w-20' : 'w-64'
                } max-md:w-20 max-md:-translate-x-full max-md:show:translate-x-0`}>

                {/* Sidebar Header */}
                <div className={`h-16 px-5 border-b border-white/[0.06] flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between'
                    }`}>
                    {/* Logo */}
                    <div className={`flex items-center gap-3 text-white overflow-hidden transition-opacity duration-200 ${collapsed ? 'hidden' : ''
                        }`}>
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
                        {!collapsed && (
                            <span className="text-[1.1rem] font-semibold bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent whitespace-nowrap">
                                Code Combat
                            </span>
                        )}
                    </div>

                    {/* Collapse Button */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`flex items-center justify-center flex-shrink-0 relative z-[1001] transition-all duration-200 ${collapsed
                                ? 'w-8 h-8 bg-transparent border-none'
                                : 'w-7 h-7 bg-white/5 border border-white/10 text-white/50 rounded-md hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-5 px-3 flex flex-col gap-6 overflow-y-auto overflow-x-hidden">
                    {menuSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="flex flex-col gap-1">
                            {section.title && !collapsed && (
                                <div className="text-[0.7rem] font-bold text-white/30 uppercase tracking-widest px-4 pb-2 whitespace-nowrap">
                                    {section.title}
                                </div>
                            )}
                            {section.items.map(item => (
                                <button
                                    key={item.path}
                                    className={`flex items-center gap-3 py-2.5 px-4 border border-transparent rounded-xl font-medium text-[0.9rem] cursor-pointer transition-all duration-200 text-left w-full ${collapsed ? 'justify-center px-3' : ''
                                        } ${isActive(item.path)
                                            ? 'bg-yellow-400/10 text-yellow-200 border-yellow-400/20'
                                            : 'bg-transparent text-white/50 hover:bg-white/[0.04] hover:text-white/90'
                                        }`}
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

                {/* Sidebar Footer - Logout */}
                <div className="p-4 border-t border-white/[0.06] mt-auto">
                    <button
                        className={`flex items-center gap-3 py-2.5 px-4 bg-red-500/5 border border-red-500/10 text-red-400/80 rounded-xl font-medium text-[0.9rem] cursor-pointer transition-all duration-200 text-left w-full hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 ${collapsed ? 'justify-center px-3' : ''
                            }`}
                        onClick={handleLogout}
                        title={collapsed ? 'Logout' : undefined}
                    >
                        <LogOut size={20} />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 min-w-0 py-10 px-10 relative z-[1] transition-all duration-300 ease-in-out ${collapsed ? 'ml-20' : 'ml-[260px]'
                } max-lg:py-8 max-lg:px-8 max-md:ml-0 max-md:p-6`}>
                <div className="max-w-[1600px] mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
