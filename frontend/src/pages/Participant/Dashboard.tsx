import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock,
    Trophy,
    Lock,
    ArrowRight,
    CheckCircle2,
    Timer,
    ChevronRight
} from 'lucide-react';
import { contestAPI } from '../../utils/api';

interface Contest {
    id: number;
    title: string;
    description?: string;
    status: string;
    difficulty: string;
    duration: number;
    isStarted: boolean;
    hasStarted?: boolean;
    startedAt?: string;
    score?: number;
    startPassword?: string;
}

const ParticipantDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
    const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
    const [password, setPassword] = useState<string>('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const contestsData = await contestAPI.getMyContests();
            setContests(contestsData.contests || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Separate active and completed contests
    const activeContests = contests.filter(c => c.status !== 'completed');
    const completedContests = contests.filter(c => c.status === 'completed');

    const handleStartContest = (contest: Contest) => {
        if (!contest.isStarted) {
            alert('This contest has not been started yet. Please wait for the admin to start it.');
            return;
        }

        if (contest.startPassword && !contest.hasStarted) {
            setSelectedContest(contest);
            setShowPasswordModal(true);
        } else {
            navigate(`/contest/${contest.id}`);
        }
    };

    const handlePasswordSubmit = async () => {
        if (!selectedContest) return;
        try {
            setShowPasswordModal(false);
            navigate(`/contest/${selectedContest.id}`);
        } catch (err) {
            setError('Invalid password');
        }
    };

    const getDifficultyStyles = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy':
                return {
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                };
            case 'Medium':
                return {
                    background: 'rgba(251, 191, 36, 0.15)',
                    color: '#fbbf24',
                    border: '1px solid rgba(251, 191, 36, 0.3)'
                };
            case 'Hard':
                return {
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                };
            default:
                return {
                    background: 'rgba(148, 163, 184, 0.15)',
                    color: '#94a3b8',
                    border: '1px solid rgba(148, 163, 184, 0.3)'
                };
        }
    };

    const getStatusBadge = (contest: Contest) => {
        const baseStyle: React.CSSProperties = {
            padding: '3px 8px',
            borderRadius: '100px',
            fontSize: '0.6rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
        };

        if (!contest.isStarted) {
            return (
                <span style={{
                    ...baseStyle,
                    background: 'rgba(148, 163, 184, 0.15)',
                    color: '#94a3b8',
                    border: '1px solid rgba(148, 163, 184, 0.3)'
                }}>
                    Pending
                </span>
            );
        } else if (contest.hasStarted) {
            return (
                <span style={{
                    ...baseStyle,
                    background: 'rgba(251, 191, 36, 0.15)',
                    color: '#fbbf24',
                    border: '1px solid rgba(251, 191, 36, 0.3)'
                }}>
                    In Progress
                </span>
            );
        } else {
            return (
                <span style={{
                    ...baseStyle,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                    Ready
                </span>
            );
        }
    };

    if (loading) {
        return (
            <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 0',
                color: 'rgba(255, 255, 255, 0.5)'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid rgba(253, 230, 138, 0.2)',
                    borderTopColor: '#FDE68A',
                    borderRadius: '50%',
                    marginBottom: '14px',
                    animation: 'spin 1s linear infinite'
                }} />
                <p style={{ fontSize: '0.85rem', margin: 0 }}>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto'
        }}>
            {/* Error Message */}
            {error && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#f87171',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '0.8rem'
                }}>
                    {error}
                </div>
            )}

            {/* Vertical Stacked Layout */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                {/* Current Contests Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '20px 24px'
                }}>
                    {/* Header with Count Badge */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Timer size={18} style={{ color: '#FDE68A' }} />
                            <h3 style={{
                                margin: 0,
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: '#ffffff'
                            }}>Current Contests</h3>
                        </div>
                        {/* Count Badge */}
                        <div style={{
                            background: 'rgba(253, 230, 138, 0.12)',
                            border: '1px solid rgba(253, 230, 138, 0.25)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span style={{
                                fontSize: '1rem',
                                fontWeight: 700,
                                color: '#FDE68A'
                            }}>{activeContests.length}</span>
                            <span style={{
                                fontSize: '0.7rem',
                                color: 'rgba(253, 230, 138, 0.8)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.03em'
                            }}>Tasks</span>
                        </div>
                    </div>

                    {/* Contest List */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        {activeContests.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '32px 16px',
                                color: 'rgba(255, 255, 255, 0.4)'
                            }}>
                                <Trophy size={32} style={{ marginBottom: '12px', color: '#FDE68A' }} />
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>No active contests</p>
                            </div>
                        ) : (
                            activeContests.map(contest => (
                                <div
                                    key={contest.id}
                                    onClick={() => handleStartContest(contest)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 16px',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(253, 230, 138, 0.3)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginBottom: '6px'
                                        }}>
                                            <h4 style={{
                                                margin: 0,
                                                fontSize: '0.9rem',
                                                fontWeight: 600,
                                                color: '#ffffff',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>{contest.title}</h4>
                                            {getStatusBadge(contest)}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '0.75rem',
                                                color: 'rgba(255, 255, 255, 0.5)'
                                            }}>
                                                <Clock size={12} />
                                                {contest.duration} min
                                            </span>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '100px',
                                                fontSize: '0.65rem',
                                                fontWeight: 600,
                                                ...getDifficultyStyles(contest.difficulty)
                                            }}>
                                                {contest.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ marginLeft: '12px' }}>
                                        {!contest.isStarted ? (
                                            <Lock size={16} style={{ color: 'rgba(148, 163, 184, 0.6)' }} />
                                        ) : (
                                            <ChevronRight size={18} style={{ color: '#FDE68A' }} />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Contest History Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '20px 24px'
                }}>
                    {/* Header with Count Badge */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckCircle2 size={18} style={{ color: '#34d399' }} />
                            <h3 style={{
                                margin: 0,
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: '#ffffff'
                            }}>Contest History</h3>
                        </div>
                        {/* Count Badge */}
                        <div style={{
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span style={{
                                fontSize: '1rem',
                                fontWeight: 700,
                                color: '#34d399'
                            }}>{completedContests.length}</span>
                            <span style={{
                                fontSize: '0.7rem',
                                color: 'rgba(16, 185, 129, 0.8)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.03em'
                            }}>Done</span>
                        </div>
                    </div>

                    {/* History List */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        {completedContests.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '32px 16px',
                                color: 'rgba(255, 255, 255, 0.4)'
                            }}>
                                <Trophy size={32} style={{ marginBottom: '12px', color: '#34d399' }} />
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>No completed contests</p>
                                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', opacity: 0.7 }}>
                                    Complete contests to see them here
                                </p>
                            </div>
                        ) : (
                            completedContests.map(contest => (
                                <div
                                    key={contest.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 16px',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                        borderRadius: '10px'
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{
                                            margin: 0,
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            color: '#ffffff',
                                            marginBottom: '4px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>{contest.title}</h4>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '100px',
                                                fontSize: '0.65rem',
                                                fontWeight: 600,
                                                ...getDifficultyStyles(contest.difficulty)
                                            }}>
                                                {contest.difficulty}
                                            </span>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                color: 'rgba(255, 255, 255, 0.5)'
                                            }}>
                                                {contest.duration} min
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        background: 'rgba(253, 230, 138, 0.12)',
                                        border: '1px solid rgba(253, 230, 138, 0.25)',
                                        borderRadius: '8px'
                                    }}>
                                        <Trophy size={14} style={{ color: '#FDE68A' }} />
                                        <span style={{
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            color: '#FDE68A'
                                        }}>{contest.score || 0}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && selectedContest && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(6px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000
                    }}
                    onClick={() => setShowPasswordModal(false)}
                >
                    <div
                        style={{
                            background: '#111113',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '14px',
                            width: '90%',
                            maxWidth: '340px',
                            overflow: 'hidden',
                            boxShadow: '0 16px 32px rgba(0, 0, 0, 0.4)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '14px 18px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                color: '#ffffff'
                            }}>Enter Password</h2>
                        </div>
                        <div style={{ padding: '14px 18px' }}>
                            <p style={{
                                margin: '0 0 12px',
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: '0.8rem',
                                lineHeight: 1.4
                            }}>
                                Enter the password from your administrator.
                            </p>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password..."
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '6px',
                                    color: '#ffffff',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(253, 230, 138, 0.5)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                            />
                        </div>
                        <div style={{
                            padding: '12px 18px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                style={{
                                    padding: '6px 14px',
                                    background: 'transparent',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '6px',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordSubmit}
                                style={{
                                    padding: '6px 16px',
                                    background: 'rgba(253, 230, 138, 0.1)',
                                    border: '1px solid rgba(253, 230, 138, 0.25)',
                                    borderRadius: '6px',
                                    color: '#FDE68A',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                Start <ArrowRight size={11} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParticipantDashboard;
