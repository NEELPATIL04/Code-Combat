import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Home, Code, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
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
            { icon: <Home size={20} />, label: 'Dashboard', path: '/player' },
            { icon: <Code size={20} />, label: 'My Tasks', path: '/task' },
        ]
    }
];

const ParticipantLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [collapsed, setCollapsed] = useState<boolean>(false);

    const isActive = (path: string): boolean => {
        if (path === '/player') return location.pathname === '/player';
        return location.pathname.startsWith(path);
    };

    const handleLogout = (): void => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dark flex min-h-screen bg-background text-foreground font-['Geist',system-ui,sans-serif]">
            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 bottom-0 bg-sidebar border-r border-sidebar-border flex flex-col z-[1000] transition-all duration-300 ease-in-out backdrop-blur-xl ${collapsed ? 'w-20' : 'w-[260px]'
                } max-md:w-20 max-md:-translate-x-full max-md:show:translate-x-0`}>

                {/* Sidebar Header */}
                <div className={`h-[70px] px-5 border-b border-white/[0.08] flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between'
                    }`}>
                    {/* Logo */}
                    <div className={`flex items-center gap-3 text-white overflow-hidden transition-opacity duration-200 ${collapsed ? 'hidden' : ''
                        }`}>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <circle cx="14" cy="14" r="12" stroke="url(#logoGrad)" strokeWidth="1.5" />
                            <circle cx="14" cy="14" r="5" fill="url(#logoGrad)" />
                            <defs>
                                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                                    <stop offset="0%" stopColor="#8A2BE2" />
                                    <stop offset="100%" stopColor="#4B0082" />
                                </linearGradient>
                            </defs>
                        </svg>
                        {!collapsed && (
                            <span className="text-[1.1rem] font-semibold bg-gradient-to-r from-purple-200 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
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
                                    className={`flex items-center gap-3 py-2.5 px-4 border border-transparent rounded-lg font-medium text-[0.95rem] cursor-pointer transition-all duration-200 text-left w-full ${collapsed ? 'justify-center p-3' : ''
                                        } ${isActive(item.path)
                                            ? 'bg-purple-500/10 text-purple-200 border-purple-500/20'
                                            : 'bg-transparent text-white/60 hover:bg-white/5 hover:text-white'
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
                <div className="p-5 border-t border-white/[0.08] mt-auto">
                    <button
                        className={`flex items-center gap-3 py-2.5 px-4 bg-transparent border border-red-500/20 text-red-500 rounded-lg font-medium text-[0.95rem] cursor-pointer transition-all duration-200 text-left w-full hover:bg-red-500/10 hover:text-red-400 ${collapsed ? 'justify-center p-3' : ''
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
            <main className={`flex-1 py-10 px-8 relative z-[1] transition-all duration-300 ease-in-out ${collapsed ? 'ml-20' : 'ml-[260px]'
                } max-lg:py-8 max-lg:px-6 max-md:ml-0 max-md:p-4`}>
                <div className="w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ParticipantLayout;
