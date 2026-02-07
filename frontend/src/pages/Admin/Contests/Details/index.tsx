import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Users,
    Trophy,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Search,
    Info,
    Activity,
    Clock,
    BarChart3,
    Eye
} from 'lucide-react';
import { contestAPI } from '../../../../utils/api';

interface ParticipantPerformance {
    id: number;
    userId: number;
    username: string | null;
    email: string | null;
    firstName?: string | null;
    lastName?: string | null;
    hasStarted: boolean;
    startedAt: string | null;
    score: number;
}

interface ContestDetailsData {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    duration: number;
    status: string;
    isStarted: boolean;
    fullScreenMode: boolean;
    createdAt: string;
    tasks: any[];
    participants: ParticipantPerformance[];
}

const ContestDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [contest, setContest] = useState<ContestDetailsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadContestDetails();
    }, [id]);

    const loadContestDetails = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await contestAPI.getById(parseInt(id));
            setContest(data.contest);
            setError('');
        } catch (err: any) {
            console.error('Failed to load contest details:', err);
            setError('Failed to load contest details. It may have been deleted.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not started';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';

        return date.toLocaleString('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredParticipants = contest?.participants.filter(p => {
        const term = searchTerm.toLowerCase();
        return (p.username?.toLowerCase().includes(term) ?? false) ||
            (p.email?.toLowerCase().includes(term) ?? false) ||
            (p.firstName?.toLowerCase().includes(term) ?? false) ||
            (p.lastName?.toLowerCase().includes(term) ?? false);
    }) || [];

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
                <p>Loading contest details...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error || !contest) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
                <h2 style={{ color: '#fafafa', marginBottom: '8px' }}>Error</h2>
                <p style={{ color: '#a1a1aa', marginBottom: '24px' }}>{error || 'Contest not found'}</p>
                <button
                    onClick={() => navigate('/admin/contests')}
                    style={{
                        padding: '10px 20px',
                        background: '#27272a',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fafafa',
                        cursor: 'pointer'
                    }}
                >
                    Back to Contests
                </button>
            </div>
        );
    }

    const createdOn = contest.createdAt ? new Date(contest.createdAt).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : 'Unknown';

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Navigation Header */}
            <div style={{ marginBottom: '24px' }}>
                <button
                    onClick={() => navigate('/admin/contests')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#a1a1aa',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        padding: '8px 0',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fafafa'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}
                >
                    <ChevronLeft size={16} /> Back to Contests
                </button>
            </div>

            {/* Bento Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px',
                marginBottom: '40px'
            }}>
                {/* Main Contest Info (2x1) */}
                <div style={{
                    gridColumn: 'span 2',
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <h1 style={{
                                fontSize: '1.75rem',
                                fontWeight: 600,
                                margin: 0,
                                color: '#fafafa',
                                letterSpacing: '-0.025em'
                            }}>
                                {contest.title}
                            </h1>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                background: contest.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(113, 113, 122, 0.1)',
                                color: contest.status === 'active' ? '#22c55e' : '#71717a',
                                border: `1px solid ${contest.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(113, 113, 122, 0.2)'}`
                            }}>
                                {contest.status}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa' }}>
                                <BarChart3 size={16} />
                                <span style={{ fontSize: '0.9375rem' }}>{contest.difficulty}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa' }}>
                                <Clock size={16} />
                                <span style={{ fontSize: '0.9375rem' }}>{contest.duration} mins</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa' }}>
                                <Activity size={16} />
                                <span style={{ fontSize: '0.9375rem' }}>{contest.tasks?.length || 0} Tasks</span>
                            </div>
                        </div>
                    </div>
                    {/* Decorative Background Icon */}
                    <Trophy size={120} style={{
                        position: 'absolute',
                        right: '-20px',
                        bottom: '-20px',
                        opacity: 0.03,
                        color: '#fafafa',
                        transform: 'rotate(-15deg)'
                    }} />
                </div>

                {/* Total Participants (1x1) */}
                <StatCard
                    icon={<Users size={20} color="#3b82f6" />}
                    label="Total Participants"
                    value={contest.participants.length}
                />

                {/* Started (1x1) */}
                <StatCard
                    icon={<CheckCircle2 size={20} color="#22c55e" />}
                    label="Active Players"
                    value={contest.participants.filter(p => p.hasStarted).length}
                />

                {/* Description (2x1) */}
                <div style={{
                    gridColumn: 'span 2',
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#71717a', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Info size={14} /> Description
                    </div>
                    <p style={{
                        color: '#a1a1aa',
                        margin: 0,
                        lineHeight: 1.6,
                        fontSize: '0.9375rem',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                    }}>
                        {contest.description || 'No description provided for this contest.'}
                    </p>
                </div>

                {/* Average Score (1x1) */}
                <StatCard
                    icon={<Trophy size={20} color="#eab308" />}
                    label="Average Score"
                    value={contest.participants.length > 0
                        ? (contest.participants.reduce((acc, p) => acc + p.score, 0) / contest.participants.length).toFixed(1)
                        : '0'}
                />

                {/* Created On (1x1) */}
                <StatCard
                    icon={<Calendar size={20} color="#a1a1aa" />}
                    label="Created On"
                    value={createdOn}
                    nowrap={true}
                />
            </div>

            {/* Performance Table Section */}
            <div style={{
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: '16px',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid #27272a',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, color: '#fafafa', fontSize: '1.125rem', fontWeight: 600 }}>Participant Performance</h3>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                        <input
                            type="text"
                            placeholder="Filter participants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                background: '#18181b',
                                border: '1px solid #27272a',
                                borderRadius: '8px',
                                color: '#fafafa',
                                padding: '10px 12px 10px 38px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                width: '280px',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#27272a'}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#0a0a0b', borderBottom: '1px solid #27272a' }}>
                                <th style={thStyle}>Participant</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Started At</th>
                                <th style={thStyle}>Score</th>
                                <th style={thStyle}>Performance</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredParticipants.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#71717a' }}>
                                        No participants match your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredParticipants.map((p, idx) => (
                                    <tr key={p.id} style={{
                                        borderBottom: idx === filteredParticipants.length - 1 ? 'none' : '1px solid #27272a',
                                        transition: 'background 0.2s'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={tdStyle}>
                                            <div
                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                                                onClick={() => navigate(`/admin/participants/${p.userId}`)}
                                                onMouseEnter={(e) => {
                                                    const target = e.currentTarget.querySelector('.username-text') as HTMLElement;
                                                    if (target) target.style.color = '#3b82f6';
                                                }}
                                                onMouseLeave={(e) => {
                                                    const target = e.currentTarget.querySelector('.username-text') as HTMLElement;
                                                    if (target) target.style.color = '#fafafa';
                                                }}
                                            >
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '10px',
                                                    background: '#18181b',
                                                    border: '1px solid #27272a',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    color: '#fafafa'
                                                }}>
                                                    {(p.username || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="username-text" style={{ color: '#fafafa', fontWeight: 500, transition: 'color 0.2s' }}>
                                                        {p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : (p.username || 'Deleted User')}
                                                    </div>
                                                    <div style={{ color: '#71717a', fontSize: '0.75rem' }}>{p.email || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '4px 10px',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                background: p.hasStarted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(113, 113, 122, 0.1)',
                                                color: p.hasStarted ? '#22c55e' : '#71717a'
                                            }}>
                                                <span style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    background: p.hasStarted ? '#22c55e' : '#71717a'
                                                }}></span>
                                                {p.hasStarted ? 'Active' : 'Not Started'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ color: '#a1a1aa', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                                {formatDate(p.startedAt)}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ color: '#fafafa', fontWeight: 600, fontSize: '1rem' }}>
                                                {p.score} <span style={{ color: '#71717a', fontSize: '0.75rem', fontWeight: 400 }}>pts</span>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ width: '140px', height: '6px', background: '#18181b', borderRadius: '4px', overflow: 'hidden', border: '1px solid #27272a' }}>
                                                <div style={{
                                                    width: `${Math.min(100, (p.score / ((contest.tasks?.length || 0) * 100 || 1)) * 100)}%`,
                                                    height: '100%',
                                                    background: '#3b82f6',
                                                    borderRadius: '4px',
                                                    transition: 'width 0.5s ease-out'
                                                }}></div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => navigate(`/admin/participants/${p.userId}/contest/${contest.id}`, { state: { from: 'contest' } })}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid #27272a',
                                                    borderRadius: '6px',
                                                    color: '#a1a1aa',
                                                    padding: '6px 10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = '#3b82f6';
                                                    e.currentTarget.style.color = '#3b82f6';
                                                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#27272a';
                                                    e.currentTarget.style.color = '#a1a1aa';
                                                    e.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                <Eye size={14} /> View Submissions
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    nowrap?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, nowrap }) => (
    <div style={{
        background: '#09090b',
        border: '1px solid #27272a',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        cursor: 'default'
    }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#27272a';
            e.currentTarget.style.background = '#09090b';
        }}
    >
        <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 600 }}>
                {label}
            </div>
            <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#fafafa',
                letterSpacing: '-0.025em',
                whiteSpace: nowrap ? 'nowrap' : 'normal'
            }}>
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
    letterSpacing: '0.05em'
};

const tdStyle: React.CSSProperties = {
    padding: '20px 24px',
    fontSize: '0.875rem'
};

export default ContestDetails;
