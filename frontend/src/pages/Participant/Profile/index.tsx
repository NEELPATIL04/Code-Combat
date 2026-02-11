
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Trophy,
    Calendar,
    Target,
    Award,
    TrendingUp,
    Zap,
    User
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { userAPI } from '../../../utils/api';

interface ContestHistory {
    contestId: number;
    title: string;
    difficulty: string;
    score: number;
    rank?: number;
    startedAt: string;
    completedAt?: string;
}

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState<ContestHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalContests: 0,
        totalScore: 0,
        averageScore: 0,
        bestRank: '-'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await userAPI.getContestHistory();
            const contests = data.contests || [];
            setHistory(contests);

            const totalScore = contests.reduce((acc: number, c: ContestHistory) => acc + (c.score || 0), 0);
            const avgScore = contests.length ? Math.round(totalScore / contests.length) : 0;
            const ranks = contests.map((c: ContestHistory) => c.rank).filter((r: number) => r && r > 0);
            const bestRank = ranks.length ? Math.min(...ranks) : '-';

            setStats({
                totalContests: contests.length,
                totalScore,
                averageScore: avgScore,
                bestRank: bestRank.toString()
            });

        } catch (error) {
            console.error('Failed to load profile', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                color: 'rgba(255, 255, 255, 0.5)'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid rgba(253, 230, 138, 0.2)',
                    borderTopColor: '#FDE68A',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
            </div>
        );
    }

    return (
        <div style={{
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            {/* Header Section */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '32px 40px',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '32px'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <User size={40} style={{ color: '#0a0a0b' }} />
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{
                        fontSize: '1.8rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        margin: '0 0 8px'
                    }}>
                        {user?.name || 'Participant'}
                    </h1>
                    <p style={{
                        fontSize: '0.95rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        margin: '0 0 8px'
                    }}>
                        {user?.email || 'user@example.com'}
                    </p>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        margin: 0
                    }}>
                        Member since {user && new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                {/* Total Score Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(253, 230, 138, 0.15)',
                    borderRadius: '12px',
                    padding: '24px',
                    transition: 'all 0.3s ease'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(253, 230, 138, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(253, 230, 138, 0.3)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        e.currentTarget.style.borderColor = 'rgba(253, 230, 138, 0.15)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3 style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            color: 'rgba(255, 255, 255, 0.6)',
                            letterSpacing: '0.05em',
                            margin: 0
                        }}>Total Score</h3>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'rgba(253, 230, 138, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Trophy size={18} style={{ color: '#FDE68A' }} />
                        </div>
                    </div>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        color: '#FDE68A'
                    }}>
                        {stats.totalScore}
                    </div>
                </div>

                {/* Total Contests Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                    borderRadius: '12px',
                    padding: '24px',
                    transition: 'all 0.3s ease'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.15)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                            <h3 style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                color: 'rgba(255, 255, 255, 0.6)',
                                letterSpacing: '0.05em',
                                margin: '0 0 4px'
                            }}>Contests</h3>
                            <h3 style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                color: 'rgba(255, 255, 255, 0.6)',
                                letterSpacing: '0.05em',
                                margin: 0
                            }}>Participated</h3>
                        </div>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'rgba(59, 130, 246, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Target size={18} style={{ color: '#60a5fa' }} />
                        </div>
                    </div>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        color: '#60a5fa'
                    }}>
                        {stats.totalContests}
                    </div>
                </div>

                {/* Best Rank Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(168, 85, 247, 0.15)',
                    borderRadius: '12px',
                    padding: '24px',
                    transition: 'all 0.3s ease'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(168, 85, 247, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.15)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3 style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            color: 'rgba(255, 255, 255, 0.6)',
                            letterSpacing: '0.05em',
                            margin: 0
                        }}>Best Rank</h3>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'rgba(168, 85, 247, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Award size={18} style={{ color: '#c084fc' }} />
                        </div>
                    </div>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        color: '#c084fc'
                    }}>
                        {stats.bestRank === '-' ? '-' : `#${stats.bestRank}`}
                    </div>
                </div>

                {/* Average Score Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(34, 197, 94, 0.15)',
                    borderRadius: '12px',
                    padding: '24px',
                    transition: 'all 0.3s ease'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(34, 197, 94, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.15)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3 style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            color: 'rgba(255, 255, 255, 0.6)',
                            letterSpacing: '0.05em',
                            margin: 0
                        }}>Average Score</h3>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'rgba(34, 197, 94, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <TrendingUp size={18} style={{ color: '#22c55e' }} />
                        </div>
                    </div>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        color: '#22c55e'
                    }}>
                        {stats.averageScore}
                    </div>
                </div>
            </div>

            {/* Contest History Section */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Zap size={20} style={{ color: '#FDE68A' }} />
                    <h2 style={{
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        margin: 0
                    }}>
                        Contest History
                    </h2>
                </div>

                {/* Content */}
                <div>
                    {history.length === 0 ? (
                        <div style={{
                            padding: '80px 24px',
                            textAlign: 'center',
                            color: 'rgba(255, 255, 255, 0.4)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Trophy size={48} style={{ marginBottom: '24px', color: '#FDE68A', opacity: 0.3 }} />
                            <p style={{ fontSize: '0.95rem', margin: '0 0 8px', fontWeight: 500 }}>
                                No contests participated yet
                            </p>
                            <p style={{ fontSize: '0.85rem', margin: 0, opacity: 0.7 }}>
                                Start your first contest from My Contests section
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {history.map((contest, index) => (
                                <div
                                    key={contest.contestId}
                                    onClick={() => navigate(`/contest/${contest.contestId}/results`)}
                                    style={{
                                        padding: '16px 24px',
                                        borderBottom: index !== history.length - 1 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.15s ease',
                                        background: 'transparent',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(253, 230, 138, 0.03)';
                                        e.currentTarget.style.borderLeftColor = '#FDE68A';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.borderLeftColor = 'transparent';
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{
                                            fontSize: '0.95rem',
                                            fontWeight: 600,
                                            color: '#ffffff',
                                            margin: '0 0 8px'
                                        }}>
                                            {contest.title}
                                        </h4>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            fontSize: '0.85rem'
                                        }}>
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                color: 'rgba(255, 255, 255, 0.5)'
                                            }}>
                                                <Calendar size={14} />
                                                {new Date(contest.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span style={{
                                                padding: '3px 10px',
                                                borderRadius: '6px',
                                                fontWeight: 600,
                                                background: contest.difficulty === 'Hard' ? 'rgba(239, 68, 68, 0.15)' :
                                                    contest.difficulty === 'Medium' ? 'rgba(251, 191, 36, 0.15)' :
                                                        'rgba(34, 197, 94, 0.15)',
                                                color: contest.difficulty === 'Hard' ? '#f87171' :
                                                    contest.difficulty === 'Medium' ? '#fbbf24' :
                                                        '#22c55e'
                                            }}>
                                                {contest.difficulty}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '40px',
                                        marginLeft: '24px'
                                    }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                color: 'rgba(255, 255, 255, 0.5)',
                                                marginBottom: '4px'
                                            }}>
                                                Score
                                            </div>
                                            <div style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 700,
                                                color: '#FDE68A'
                                            }}>
                                                {contest.score}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', minWidth: '60px' }}>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                color: 'rgba(255, 255, 255, 0.5)',
                                                marginBottom: '4px'
                                            }}>
                                                Rank
                                            </div>
                                            <div style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 700,
                                                color: contest.rank ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'
                                            }}>
                                                {contest.rank ? `#${contest.rank}` : '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
