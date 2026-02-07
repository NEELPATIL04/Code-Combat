import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock,
    Trophy,
    Lock,
    ArrowRight,
    Timer,
    ChevronRight,
    Calendar,
    Filter
} from 'lucide-react';
import { contestAPI } from '../../utils/api';

interface Contest {
    id: number;
    title: string;
    description?: string;
    status: string;
    difficulty: string;
    duration: number;
    isStarted: boolean; // This usually means "user has started"
    hasStarted?: boolean; // This usually means "admin has started" or "schedule reached"
    startedAt?: string;
    score?: number;
    startPassword?: string;
    scheduledStartTime?: string;
    endTime?: string;
}

const ParticipantDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
    const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
    const [password, setPassword] = useState<string>('');
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [activeFilter, setActiveFilter] = useState<'live' | 'completed' | 'expired'>('live');

    useEffect(() => {
        loadData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
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

    // Filter based on active filter
    const filteredContests =
        activeFilter === 'live' ? activeContests :
        activeFilter === 'completed' ? completedContests :
        completedContests; // 'expired' also shows completed

    const getTimeRemaining = (targetDate: string) => {
        const total = Date.parse(targetDate) - currentTime.getTime();
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const days = Math.floor(total / (1000 * 60 * 60 * 24));

        return {
            total,
            days,
            hours,
            minutes,
            seconds
        };
    };

    const formatCountdown = (targetDate: string) => {
        const t = getTimeRemaining(targetDate);
        if (t.total <= 0) return null;

        if (t.days > 0) return `${t.days}d ${t.hours}h`;
        if (t.hours > 0) return `${t.hours}h ${t.minutes}m`;
        return `${t.minutes}m ${t.seconds}s`;
    };

    const isContestOpen = (contest: Contest) => {
        // If it's already started by user, it's open
        if (contest.isStarted) return true;

        // If scheduled start time exists
        if (contest.scheduledStartTime) {
            const startDate = new Date(contest.scheduledStartTime);
            if (currentTime < startDate) return false;
        }

        // If scheduled end time exists and we are past it
        if (contest.endTime) {
            const endDate = new Date(contest.endTime);
            if (currentTime > endDate) return false;
        }

        // Check generic "hasStarted" flag from admin (if manual start used)
        if (contest.hasStarted === false && !contest.scheduledStartTime) return false;

        return true;
    };

    const handleStartContest = (contest: Contest) => {
        if (!isContestOpen(contest)) {
            // If it's closed because it hasn't started yet
            if (contest.scheduledStartTime && new Date(contest.scheduledStartTime) > currentTime) {
                alert(`Contest starts in ${formatCountdown(contest.scheduledStartTime)}`);
                return;
            }
            // If it's closed because it ended
            if (contest.endTime && new Date(contest.endTime) < currentTime) {
                alert('This contest has ended.');
                return;
            }

            if (!contest.isStarted && contest.hasStarted === false) {
                alert('This contest has not been started yet. Please wait for the admin to start it.');
                return;
            }
        }

        if (contest.startPassword && !contest.isStarted) {
            setSelectedContest(contest);
            setShowPasswordModal(true);
        } else {
            navigate(`/contest/${contest.id}`);
        }
    };

    const handlePasswordSubmit = async () => {
        if (!selectedContest) return;
        try {
            // Verify password via API or just start if logic is client-side (usually API)
            // Ideally we call startContest API here if needed, but navigation usually triggers check
            await contestAPI.startContest(selectedContest.id, password);
            setShowPasswordModal(false);
            navigate(`/contest/${selectedContest.id}`);
        } catch (err) {
            setError('Invalid password');
        }
    };

    // ... (keep getDifficultyStyles)
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
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        };

        if (contest.isStarted) {
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
        }

        // Scheduled
        if (contest.scheduledStartTime) {
            const startDate = new Date(contest.scheduledStartTime);
            if (currentTime < startDate) {
                const countdown = formatCountdown(contest.scheduledStartTime);
                return (
                    <span style={{
                        ...baseStyle,
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                        <Timer size={10} />
                        Starts in {countdown}
                    </span>
                );
            }
        }

        // Ended
        if (contest.endTime && new Date(contest.endTime) < currentTime) {
            return (
                <span style={{
                    ...baseStyle,
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                    Ended
                </span>
            );
        }

        if (!contest.hasStarted && !contest.scheduledStartTime) {
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
        }

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

            {/* My Contests - Unified List with Filter */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px 24px'
            }}>
                {/* Header with Filter Buttons */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Timer size={18} style={{ color: '#FDE68A' }} />
                        <h3 style={{
                            margin: 0,
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: '#ffffff'
                        }}>My Contests</h3>
                    </div>

                    {/* Filter Buttons */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        padding: '4px 6px'
                    }}>
                        <Filter size={14} style={{ color: '#FDE68A', marginLeft: '6px' }} />
                        <button
                            onClick={() => setActiveFilter('live')}
                            style={{
                                padding: '6px 10px',
                                background: activeFilter === 'live' ? 'rgba(253, 230, 138, 0.15)' : 'transparent',
                                border: activeFilter === 'live' ? '1px solid rgba(253, 230, 138, 0.25)' : 'none',
                                borderRadius: '6px',
                                color: activeFilter === 'live' ? '#FDE68A' : 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (activeFilter !== 'live') {
                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeFilter !== 'live') {
                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                                }
                            }}
                        >
                            Live ({activeContests.length})
                        </button>
                        <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.1)' }} />
                        <button
                            onClick={() => setActiveFilter('completed')}
                            style={{
                                padding: '6px 10px',
                                background: activeFilter === 'completed' ? 'rgba(253, 230, 138, 0.15)' : 'transparent',
                                border: activeFilter === 'completed' ? '1px solid rgba(253, 230, 138, 0.25)' : 'none',
                                borderRadius: '6px',
                                color: activeFilter === 'completed' ? '#FDE68A' : 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (activeFilter !== 'completed') {
                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeFilter !== 'completed') {
                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                                }
                            }}
                        >
                            Completed ({completedContests.length})
                        </button>
                        <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.1)' }} />
                        <button
                            onClick={() => setActiveFilter('expired')}
                            style={{
                                padding: '6px 10px',
                                background: activeFilter === 'expired' ? 'rgba(253, 230, 138, 0.15)' : 'transparent',
                                border: activeFilter === 'expired' ? '1px solid rgba(253, 230, 138, 0.25)' : 'none',
                                borderRadius: '6px',
                                color: activeFilter === 'expired' ? '#FDE68A' : 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                marginRight: '6px'
                            }}
                            onMouseEnter={(e) => {
                                if (activeFilter !== 'expired') {
                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeFilter !== 'expired') {
                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                                }
                            }}
                        >
                            Expired ({completedContests.length})
                        </button>
                    </div>
                </div>

                {/* Contests List */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    {filteredContests.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: 'rgba(255, 255, 255, 0.4)'
                        }}>
                            <Trophy size={40} style={{ marginBottom: '12px', color: '#FDE68A', opacity: 0.5 }} />
                            <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 500 }}>
                                No {activeFilter === 'live' ? 'live' : activeFilter === 'completed' ? 'completed' : 'expired'} contests
                            </p>
                            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>
                                {activeFilter === 'live'
                                    ? 'Check back soon for new contests'
                                    : 'No contests to display'}
                            </p>
                        </div>
                    ) : (
                        filteredContests.map(contest => {
                            const isOpen = isContestOpen(contest);
                            return (
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
                                        transition: 'all 0.15s ease',
                                        opacity: isOpen ? 1 : 0.7
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
                                            gap: '12px',
                                            flexWrap: 'wrap'
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
                                            {contest.scheduledStartTime && (
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '0.75rem',
                                                    color: 'rgba(255, 255, 255, 0.5)'
                                                }}>
                                                    <Calendar size={12} />
                                                    {new Date(contest.scheduledStartTime).toLocaleDateString()}
                                                </span>
                                            )}
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
                                        {!isOpen ? (
                                            <Lock size={16} style={{ color: 'rgba(148, 163, 184, 0.6)' }} />
                                        ) : (
                                            <ChevronRight size={18} style={{ color: '#FDE68A' }} />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
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
                        {/* ... keep modal content ... */}
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
