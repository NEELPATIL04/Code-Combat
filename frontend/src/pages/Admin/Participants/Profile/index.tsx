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
        navigate(`/admin/participants/${id}/contest/${contestId}`);
    };

    if (!participant) return (
        <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
            <div style={{
                width: '32px',
                height: '32px',
                border: '2px solid rgba(253, 230, 138, 0.2)',
                borderTopColor: '#FDE68A',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 1s linear infinite'
            }}></div>
            Loading...
        </div>
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Back Button */}
            <button
                onClick={() => navigate('/admin/participants')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '100px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    marginBottom: '24px'
                }}
            >
                <ArrowLeft size={18} /> Back to Participants
            </button>

            {/* Profile Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#FBBF24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '2rem',
                    color: '#000000'
                }}>
                    {participant.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        margin: 0,
                        marginBottom: '12px',
                        color: '#ffffff'
                    }}>
                        {participant.username}
                    </h1>
                    <div style={{ display: 'flex', gap: '24px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail size={14} /> {participant.email}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} /> Joined {participant.joinedAt}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px 24px',
                    background: 'rgba(20, 20, 22, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px'
                }}>
                    <Trophy size={20} style={{ color: '#FDE68A' }} />
                    <div>
                        <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 600, color: '#ffffff' }}>
                            {participant.totalContests}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>
                            Contests
                        </span>
                    </div>
                </div>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px 24px',
                    background: 'rgba(20, 20, 22, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px'
                }}>
                    <FileText size={20} style={{ color: '#FDE68A' }} />
                    <div>
                        <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 600, color: '#ffffff' }}>
                            {participant.totalSubmissions}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>
                            Submissions
                        </span>
                    </div>
                </div>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px 24px',
                    background: 'rgba(20, 20, 22, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px'
                }}>
                    <TrendingUp size={20} style={{ color: '#FDE68A' }} />
                    <div>
                        <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 600, color: '#FBBF24' }}>
                            {participant.successRate}%
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>
                            Success Rate
                        </span>
                    </div>
                </div>
            </div>

            {/* Assigned Contests Section */}
            <div style={{
                background: 'rgba(20, 20, 22, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                overflow: 'hidden'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500, color: '#ffffff' }}>
                        Assigned Contests
                    </h2>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                        {participant.contests.length} contests
                    </span>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    padding: '20px'
                }}>
                    {participant.contests.map(contest => (
                        <div
                            key={contest.id}
                            onClick={() => handleContestClick(contest.id)}
                            onMouseEnter={() => setHoveredCard(contest.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            style={{
                                background: hoveredCard === contest.id ? 'rgba(253, 230, 138, 0.03)' : 'rgba(255, 255, 255, 0.03)',
                                border: hoveredCard === contest.id ? '1px solid rgba(253, 230, 138, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '12px',
                                padding: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 500, color: '#ffffff' }}>
                                    {contest.title}
                                </h3>
                                <span style={{
                                    padding: '4px 10px',
                                    borderRadius: '100px',
                                    fontSize: '0.7rem',
                                    fontWeight: 500,
                                    textTransform: 'capitalize',
                                    background: contest.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                    color: contest.status === 'completed' ? '#10b981' : '#3b82f6'
                                }}>
                                    {contest.status}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                                <div>
                                    <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
                                        {contest.submissionsCount}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase' }}>
                                        Submissions
                                    </span>
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
                                        {contest.score > 0 ? contest.score : '-'}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase' }}>
                                        Score
                                    </span>
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
                                        {contest.date}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase' }}>
                                        Date
                                    </span>
                                </div>
                            </div>
                            <div style={{
                                fontSize: '0.85rem',
                                color: '#FDE68A',
                                opacity: hoveredCard === contest.id ? 1 : 0,
                                transition: 'opacity 0.2s ease'
                            }}>
                                View Submissions →
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ParticipantProfile;
