import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Trophy, TrendingUp, CheckCircle2, Circle, Clock, Search, Filter } from 'lucide-react';

interface Problem {
    id: number;
    title: string;
    slug: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    tags: string[];
    companies: string[];
    totalSubmissions: number;
    acceptedSubmissions: number;
    acceptanceRate: string;
    isPremium: boolean;
    userStatus?: 'solved' | 'attempted' | null;
    userAttempts?: number;
}

interface UserStats {
    totalSolved: number;
    easy: number;
    medium: number;
    hard: number;
}

const ProblemsPage: React.FC = () => {
    const navigate = useNavigate();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [stats, setStats] = useState<UserStats>({ totalSolved: 0, easy: 0, medium: 0, hard: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        loadProblems();
        loadStats();
    }, [filterDifficulty]);

    const loadProblems = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            const params = new URLSearchParams();
            if (filterDifficulty !== 'all') params.append('difficulty', filterDifficulty);

            const response = await fetch(`/api/problems?${params.toString()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });

            if (!response.ok) throw new Error('Failed to load problems');

            const data = await response.json();
            setProblems(data.problems || []);
        } catch (error) {
            console.error('Failed to load problems:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/problems/stats', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) return;

            const data = await response.json();
            setStats(data.stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' };
            case 'Medium': return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: 'rgba(234, 179, 8, 0.2)' };
            case 'Hard': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' };
            default: return { bg: 'rgba(161, 161, 170, 0.1)', color: '#a1a1aa', border: 'rgba(161, 161, 170, 0.2)' };
        }
    };

    const getStatusIcon = (status?: string | null) => {
        if (status === 'solved') return <CheckCircle2 size={18} color="#22c55e" />;
        if (status === 'attempted') return <Circle size={18} color="#eab308" />;
        return <Circle size={18} color="#71717a" />;
    };

    const filteredProblems = problems.filter(problem => {
        const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'solved' && problem.userStatus === 'solved') ||
            (filterStatus === 'attempted' && problem.userStatus === 'attempted') ||
            (filterStatus === 'todo' && !problem.userStatus);
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0', color: '#a1a1aa' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #27272a',
                    borderTopColor: '#fafafa',
                    borderRadius: '50%',
                    margin: '0 auto 20px',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p>Loading problems...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 0' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#fafafa',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Code size={32} color="#fbbf24" />
                    Practice Problems
                </h1>
                <p style={{ color: '#a1a1aa', fontSize: '0.9375rem' }}>
                    Solve coding problems and improve your skills
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '32px'
            }}>
                <StatCard
                    icon={<Trophy size={20} color="#fbbf24" />}
                    label="Total Solved"
                    value={stats.totalSolved}
                    color="#fbbf24"
                />
                <StatCard
                    icon={<CheckCircle2 size={20} color="#22c55e" />}
                    label="Easy"
                    value={stats.easy}
                    color="#22c55e"
                />
                <StatCard
                    icon={<TrendingUp size={20} color="#eab308" />}
                    label="Medium"
                    value={stats.medium}
                    color="#eab308"
                />
                <StatCard
                    icon={<Code size={20} color="#ef4444" />}
                    label="Hard"
                    value={stats.hard}
                    color="#ef4444"
                />
            </div>

            {/* Filters */}
            <div style={{
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                background: '#18181b',
                                border: '1px solid #27272a',
                                borderRadius: '8px',
                                color: '#fafafa',
                                padding: '10px 12px 10px 38px',
                                fontSize: '0.875rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Difficulty Filter */}
                    <select
                        value={filterDifficulty}
                        onChange={(e) => setFilterDifficulty(e.target.value)}
                        style={{
                            background: '#18181b',
                            border: '1px solid #27272a',
                            borderRadius: '8px',
                            color: '#fafafa',
                            padding: '10px 36px 10px 12px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            background: '#18181b',
                            border: '1px solid #27272a',
                            borderRadius: '8px',
                            color: '#fafafa',
                            padding: '10px 36px 10px 12px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="solved">Solved</option>
                        <option value="attempted">Attempted</option>
                        <option value="todo">To Do</option>
                    </select>
                </div>
            </div>

            {/* Problems Table */}
            <div style={{
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#0a0a0b', borderBottom: '1px solid #27272a' }}>
                            <th style={thStyle}>Status</th>
                            <th style={{ ...thStyle, textAlign: 'left' }}>Title</th>
                            <th style={thStyle}>Difficulty</th>
                            <th style={thStyle}>Acceptance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProblems.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#71717a' }}>
                                    No problems found
                                </td>
                            </tr>
                        ) : (
                            filteredProblems.map((problem, idx) => {
                                const diffStyle = getDifficultyColor(problem.difficulty);
                                return (
                                    <tr
                                        key={problem.id}
                                        onClick={() => navigate(`/player/problems/${problem.slug}`)}
                                        style={{
                                            borderBottom: idx === filteredProblems.length - 1 ? 'none' : '1px solid #27272a',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                {getStatusIcon(problem.userStatus)}
                                            </div>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'left' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ color: '#fafafa', fontWeight: 500 }}>{problem.title}</span>
                                                {problem.isPremium && (
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        background: 'rgba(251, 191, 36, 0.1)',
                                                        color: '#fbbf24',
                                                        fontSize: '0.75rem',
                                                        borderRadius: '4px',
                                                        fontWeight: 600
                                                    }}>
                                                        PRO
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: '4px 12px',
                                                background: diffStyle.bg,
                                                color: diffStyle.color,
                                                border: `1px solid ${diffStyle.border}`,
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 500
                                            }}>
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ color: '#a1a1aa' }}>{problem.acceptanceRate}%</span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
    <div style={{
        background: '#09090b',
        border: '1px solid #27272a',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', marginBottom: '2px' }}>
                {label}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>
                {value}
            </div>
        </div>
    </div>
);

const thStyle: React.CSSProperties = {
    padding: '16px 24px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'center'
};

const tdStyle: React.CSSProperties = {
    padding: '20px 24px',
    fontSize: '0.875rem',
    textAlign: 'center'
};

export default ProblemsPage;
