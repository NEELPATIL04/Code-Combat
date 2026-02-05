import React, { useState, useEffect } from 'react';
import { Users, Trophy, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Contest {
    id: number;
    title: string;
    status: string;
    participants: number;
}

interface Stats {
    activeUsers: number;
    totalContests: number;
    totalSubmissions: number;
    successRate: number;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats>({ activeUsers: 0, totalContests: 0, totalSubmissions: 0, successRate: 0 });
    const [recentContests, setRecentContests] = useState<Contest[]>([]);

    useEffect(() => {
        setTimeout(() => {
            setStats({ activeUsers: 1204, totalContests: 15, totalSubmissions: 8502, successRate: 72 });
            setRecentContests([
                { id: 1, title: 'Binary Search Challenge', status: 'active', participants: 24 },
                { id: 2, title: 'Graph Traversal Battle', status: 'active', participants: 18 },
                { id: 3, title: 'Array Manipulation', status: 'upcoming', participants: 0 },
            ]);
        }, 300);
    }, []);

    const statCards = [
        { icon: <Users size={24} />, value: stats.activeUsers.toLocaleString(), label: 'ACTIVE USERS' },
        { icon: <Trophy size={24} />, value: stats.totalContests, label: 'TOTAL CONTESTS' },
        { icon: <FileText size={24} />, value: stats.totalSubmissions.toLocaleString(), label: 'SUBMISSIONS' },
        { icon: <CheckCircle size={24} />, value: `${stats.successRate}%`, label: 'SUCCESS RATE' },
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Page Header */}
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 600,
                    margin: 0,
                    color: '#ffffff'
                }}>
                    Dashboard
                </h1>
                <p style={{ margin: 0, fontSize: '1rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                    Welcome back, Commander
                </p>
            </header>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '24px',
                marginBottom: '40px'
            }}>
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '16px'
                        }}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(253, 230, 138, 0.1)',
                            borderRadius: '12px',
                            color: '#FDE68A'
                        }}>
                            {card.icon}
                        </div>
                        <div>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 600,
                                color: '#ffffff',
                                lineHeight: 1,
                                marginBottom: '8px'
                            }}>
                                {card.value}
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'rgba(255, 255, 255, 0.4)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {card.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Contests Section */}
            <div style={{
                background: 'rgba(20, 20, 22, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                overflow: 'hidden'
            }}>
                {/* Section Header */}
                <div style={{
                    padding: '24px 32px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#ffffff' }}>
                        Recent Contests
                    </h2>
                    <button
                        onClick={() => navigate('/admin/contests')}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        View More
                    </button>
                </div>

                {/* Table Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    gap: '24px',
                    padding: '20px 32px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    <span>Contest</span>
                    <span>Status</span>
                    <span>Participants</span>
                </div>

                {/* Table Rows */}
                {recentContests.map(contest => (
                    <div
                        key={contest.id}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr',
                            gap: '24px',
                            padding: '20px 32px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            alignItems: 'center'
                        }}
                    >
                        <span style={{ fontWeight: 500, fontSize: '1rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                            {contest.title}
                        </span>
                        <span>
                            <span style={{
                                display: 'inline-block',
                                fontSize: '0.75rem',
                                padding: '6px 16px',
                                borderRadius: '100px',
                                textTransform: 'capitalize',
                                fontWeight: 500,
                                background: contest.status === 'active'
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : 'rgba(251, 191, 36, 0.15)',
                                color: contest.status === 'active'
                                    ? '#10b981'
                                    : '#fbbf24',
                                border: contest.status === 'active'
                                    ? '1px solid rgba(16, 185, 129, 0.3)'
                                    : '1px solid rgba(251, 191, 36, 0.3)'
                            }}>
                                {contest.status === 'active' ? 'Active' : 'Upcoming'}
                            </span>
                        </span>
                        <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                            {contest.participants}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
