import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar, Trophy, FileText, TrendingUp } from 'lucide-react';

interface Contest {
    id: number;
    title: string;
    status: string;
    submissionsCount: number;
    score: number;
    date: string;
}

interface Participant {
    id: number;
    username: string;
    email: string;
    joinedAt: string;
    totalContests: number;
    totalSubmissions: number;
    successRate: number;
    contests: Contest[];
}

const mockParticipant: Participant = {
    id: 1,
    username: 'player1',
    email: 'player1@example.com',
    joinedAt: '2024-01-15',
    totalContests: 12,
    totalSubmissions: 45,
    successRate: 78,
    contests: [
        { id: 1, title: 'Binary Search Challenge', status: 'completed', submissionsCount: 5, score: 85, date: '2024-02-10' },
        { id: 2, title: 'Graph Traversal Battle', status: 'completed', submissionsCount: 3, score: 92, date: '2024-02-15' },
        { id: 3, title: 'Array Manipulation', status: 'active', submissionsCount: 2, score: 0, date: '2024-02-20' },
        { id: 4, title: 'Dynamic Programming', status: 'completed', submissionsCount: 4, score: 78, date: '2024-01-25' },
    ]
};

const ParticipantProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    useEffect(() => {
        setTimeout(() => setParticipant({ ...mockParticipant, id: Number(id) }), 300);
    }, [id]);

    const handleContestClick = (contestId: number) => {
        navigate(`/admin/participants/${id}/contest/${contestId}`, { state: { from: 'profile' } });
    };

    if (!participant) return (
        <div style={{ padding: '48px', textAlign: 'center', color: '#71717a' }}>
            <div style={{ width: '32px', height: '32px', border: '2px solid #27272a', borderTopColor: '#fafafa', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ fontSize: '0.875rem' }}>Loading...</span>
        </div>
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <button onClick={() => navigate('/admin/participants')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'transparent', border: '1px solid #27272a', borderRadius: '6px', color: '#a1a1aa', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '24px', transition: 'all 0.15s ease' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#18181b'; e.currentTarget.style.color = '#fafafa'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa'; }}
            >
                <ArrowLeft size={16} /> Back to Participants
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1.75rem', color: '#ffffff' }}>
                    {participant.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 600, margin: 0, marginBottom: '8px', color: '#fafafa', letterSpacing: '-0.025em' }}>{participant.username}</h1>
                    <div style={{ display: 'flex', gap: '20px', color: '#71717a', fontSize: '0.875rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {participant.email}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Joined {participant.joinedAt}</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {[
                    { icon: Trophy, label: 'Contests', value: participant.totalContests, color: '#fafafa' },
                    { icon: FileText, label: 'Submissions', value: participant.totalSubmissions, color: '#fafafa' },
                    { icon: TrendingUp, label: 'Success Rate', value: `${participant.successRate}%`, color: '#22c55e' }
                ].map((stat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', background: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}>
                        <stat.icon size={20} style={{ color: '#71717a' }} />
                        <div>
                            <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 600, color: stat.color, letterSpacing: '-0.025em' }}>{stat.value}</span>
                            <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #27272a' }}>
                    <h2 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#fafafa' }}>Assigned Contests</h2>
                    <span style={{ fontSize: '0.75rem', color: '#71717a' }}>{participant.contests.length} contests</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #27272a', background: 'rgba(255,255,255,0.01)' }}>
                                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 500, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contest Name</th>
                                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 500, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 500, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submissions</th>
                                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 500, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</th>
                                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 500, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 500, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {participant.contests.map((contest, index) => (
                                <tr
                                    key={contest.id}
                                    onMouseEnter={() => setHoveredCard(contest.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    style={{
                                        borderBottom: index === participant.contests.length - 1 ? 'none' : '1px solid #18181b',
                                        background: hoveredCard === contest.id ? 'rgba(255,255,255,0.02)' : 'transparent',
                                        transition: 'background 0.2s ease'
                                    }}
                                >
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#fafafa' }}>{contest.title}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 10px',
                                            borderRadius: '9999px',
                                            fontSize: '0.7rem',
                                            fontWeight: 500,
                                            background: contest.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)',
                                            color: contest.status === 'completed' ? '#22c55e' : '#3b82f6',
                                            border: `1px solid ${contest.status === 'completed' ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)'}`
                                        }}>
                                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: contest.status === 'completed' ? '#22c55e' : '#3b82f6' }}></span>
                                            {contest.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>{contest.submissionsCount}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: contest.score > 0 ? '#fafafa' : '#71717a' }}>{contest.score > 0 ? `${contest.score} pts` : '-'}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#71717a' }}>{contest.date}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleContestClick(contest.id)}
                                            style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                color: '#3b82f6',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            View Submissions →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default ParticipantProfile;
