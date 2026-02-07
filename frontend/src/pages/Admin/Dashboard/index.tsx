import React, { useState, useEffect } from 'react';
import { Users, Trophy, FileText, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
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

interface StatCard {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    trend: string;
    trendUp: boolean;
    description: string;
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

    const statCards: StatCard[] = [
        {
            icon: <Users size={16} />,
            value: stats.activeUsers.toLocaleString(),
            label: 'Active Users',
            trend: '+12.5%',
            trendUp: true,
            description: 'Trending up this month'
        },
        {
            icon: <Trophy size={16} />,
            value: stats.totalContests,
            label: 'Total Contests',
            trend: '-20%',
            trendUp: false,
            description: 'Down from last period'
        },
        {
            icon: <FileText size={16} />,
            value: stats.totalSubmissions.toLocaleString(),
            label: 'Submissions',
            trend: '+12.5%',
            trendUp: true,
            description: 'Strong submission rate'
        },
        {
            icon: <CheckCircle size={16} />,
            value: `${stats.successRate}%`,
            label: 'Success Rate',
            trend: '+4.5%',
            trendUp: true,
            description: 'Steady performance increase'
        },
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Page Header */}
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{
                    fontSize: '1.875rem',
                    fontWeight: 600,
                    margin: 0,
                    color: '#fafafa',
                    letterSpacing: '-0.025em'
                }}>
                    Dashboard
                </h1>
                <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '0.875rem',
                    color: '#a1a1aa'
                }}>
                    Welcome back, Commander
                </p>
            </header>

            {/* Stats Grid - Shadcn Style */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '32px'
            }}>
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        style={{
                            background: '#09090b',
                            border: '1px solid #27272a',
                            borderRadius: '12px',
                            padding: '20px 24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}
                    >
                        {/* Card Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#a1a1aa'
                            }}>
                                {card.label}
                            </span>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                color: card.trendUp ? '#22c55e' : '#ef4444',
                                background: card.trendUp ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                border: card.trendUp ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                                {card.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {card.trend}
                            </span>
                        </div>

                        {/* Value */}
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: '#fafafa',
                            lineHeight: 1,
                            letterSpacing: '-0.025em'
                        }}>
                            {card.value}
                        </div>

                        {/* Description */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.75rem',
                            color: '#71717a'
                        }}>
                            {card.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {card.description}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Contests Section - Shadcn Style */}
            <div style={{
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                overflow: 'hidden'
            }}>
                {/* Section Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #27272a',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#fafafa',
                        letterSpacing: '-0.025em'
                    }}>
                        Recent Contests
                    </h2>
                    <button
                        onClick={() => navigate('/admin/contests')}
                        style={{
                            background: '#fafafa',
                            border: 'none',
                            color: '#09090b',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'opacity 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        View More
                    </button>
                </div>

                {/* Table Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    gap: '16px',
                    padding: '12px 24px',
                    background: '#0a0a0b',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: '#71717a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    <span>Contest</span>
                    <span>Status</span>
                    <span>Participants</span>
                </div>

                {/* Table Rows */}
                {recentContests.map((contest, index) => (
                    <div
                        key={contest.id}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr',
                            gap: '16px',
                            padding: '16px 24px',
                            borderTop: index === 0 ? 'none' : '1px solid #27272a',
                            alignItems: 'center',
                            transition: 'background 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <span style={{
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            color: '#fafafa'
                        }}>
                            {contest.title}
                        </span>
                        <span>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                fontSize: '0.75rem',
                                padding: '4px 10px',
                                borderRadius: '9999px',
                                textTransform: 'capitalize',
                                fontWeight: 500,
                                width: '85px',
                                background: contest.status === 'active'
                                    ? 'rgba(34, 197, 94, 0.15)'
                                    : 'rgba(250, 204, 21, 0.15)',
                                color: contest.status === 'active'
                                    ? '#22c55e'
                                    : '#facc15'
                            }}>
                                <span style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: contest.status === 'active' ? '#22c55e' : '#facc15'
                                }}></span>
                                {contest.status === 'active' ? 'Active' : 'Upcoming'}
                            </span>
                        </span>
                        <span style={{
                            color: '#a1a1aa',
                            fontSize: '0.875rem'
                        }}>
                            {contest.participants}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
