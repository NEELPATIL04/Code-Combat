import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar, Trophy, FileText, TrendingUp } from 'lucide-react';
import AdminLayout from '../../../../components/layout/AdminLayout';
import './Profile.css';

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

    useEffect(() => {
        setTimeout(() => setParticipant({ ...mockParticipant, id: Number(id) }), 300);
    }, [id]);

    const handleContestClick = (contestId: number) => {
        navigate(`/admin/participants/${id}/contest/${contestId}`);
    };

    if (!participant) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="profile-content">
                <button className="back-btn" onClick={() => navigate('/admin/participants')}>
                    <ArrowLeft size={18} /> Back to Participants
                </button>

                <div className="profile-header">
                    <div className="profile-avatar">{participant.username.charAt(0).toUpperCase()}</div>
                    <div className="profile-info">
                        <h1>{participant.username}</h1>
                        <div className="profile-meta">
                            <span><Mail size={14} /> {participant.email}</span>
                            <span><Calendar size={14} /> Joined {participant.joinedAt}</span>
                        </div>
                    </div>
                </div>

                <div className="stats-row">
                    <div className="profile-stat">
                        <Trophy size={20} />
                        <div>
                            <span className="stat-value">{participant.totalContests}</span>
                            <span className="stat-label">Contests</span>
                        </div>
                    </div>
                    <div className="profile-stat">
                        <FileText size={20} />
                        <div>
                            <span className="stat-value">{participant.totalSubmissions}</span>
                            <span className="stat-label">Submissions</span>
                        </div>
                    </div>
                    <div className="profile-stat">
                        <TrendingUp size={20} />
                        <div>
                            <span className="stat-value">{participant.successRate}%</span>
                            <span className="stat-label">Success Rate</span>
                        </div>
                    </div>
                </div>

                <div className="section">
                    <div className="section-header">
                        <h2>Assigned Contests</h2>
                        <span className="count">{participant.contests.length} contests</span>
                    </div>
                    <div className="contests-grid">
                        {participant.contests.map(contest => (
                            <div
                                key={contest.id}
                                className="contest-card"
                                onClick={() => handleContestClick(contest.id)}
                            >
                                <div className="contest-top">
                                    <h3>{contest.title}</h3>
                                    <span className={`status ${contest.status}`}>{contest.status}</span>
                                </div>
                                <div className="contest-stats">
                                    <div>
                                        <span className="value">{contest.submissionsCount}</span>
                                        <span className="label">Submissions</span>
                                    </div>
                                    <div>
                                        <span className="value">{contest.score > 0 ? contest.score : '-'}</span>
                                        <span className="label">Score</span>
                                    </div>
                                    <div>
                                        <span className="value">{contest.date}</span>
                                        <span className="label">Date</span>
                                    </div>
                                </div>
                                <div className="view-submissions">View Submissions →</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ParticipantProfile;
