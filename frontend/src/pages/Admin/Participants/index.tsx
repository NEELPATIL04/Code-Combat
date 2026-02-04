import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import './Participants.css';

interface Participant {
    id: number;
    username: string;
    email: string;
    avatar: string;
    contestsCount: number;
    submissionsCount: number;
    joinedAt: string;
    successRate: number;
}

const mockParticipants: Participant[] = [
    { id: 1, username: 'player1', email: 'player1@example.com', avatar: 'P', contestsCount: 12, submissionsCount: 45, joinedAt: '2024-01-15', successRate: 78 },
    { id: 2, username: 'player2', email: 'player2@example.com', avatar: 'P', contestsCount: 8, submissionsCount: 32, joinedAt: '2024-02-20', successRate: 65 },
    { id: 3, username: 'coder123', email: 'coder@example.com', avatar: 'C', contestsCount: 5, submissionsCount: 18, joinedAt: '2024-03-05', successRate: 82 },
    { id: 4, username: 'devmaster', email: 'dev@example.com', avatar: 'D', contestsCount: 3, submissionsCount: 10, joinedAt: '2024-03-10', successRate: 90 },
    { id: 5, username: 'algorithmguru', email: 'algo@example.com', avatar: 'A', contestsCount: 15, submissionsCount: 67, joinedAt: '2024-01-01', successRate: 88 },
];

const Participants: React.FC = () => {
    const navigate = useNavigate();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        setTimeout(() => setParticipants(mockParticipants), 300);
    }, []);

    const filteredParticipants = participants.filter(p =>
        p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRowClick = (id: number) => {
        navigate(`/admin/participants/${id}`);
    };

    return (
        <AdminLayout>
            <div className="participants-content">
                <header className="page-header">
                    <div>
                        <h1>Participants</h1>
                        <p className="page-subtitle">View and manage all participants</p>
                    </div>
                    <div className="header-stats">
                        <div className="mini-stat">
                            <span className="mini-value">{participants.length}</span>
                            <span className="mini-label">Total</span>
                        </div>
                    </div>
                </header>

                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search participants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="participants-table">
                    <div className="table-header">
                        <span>Participant</span>
                        <span>Contests</span>
                        <span>Submissions</span>
                        <span>Success Rate</span>
                        <span>Joined</span>
                        <span></span>
                    </div>
                    {filteredParticipants.map(participant => (
                        <div
                            key={participant.id}
                            className="table-row clickable"
                            onClick={() => handleRowClick(participant.id)}
                        >
                            <div className="participant-info">
                                <div className="avatar">{participant.username.charAt(0).toUpperCase()}</div>
                                <div>
                                    <span className="username">{participant.username}</span>
                                    <span className="email">{participant.email}</span>
                                </div>
                            </div>
                            <span className="stat-cell">{participant.contestsCount}</span>
                            <span className="stat-cell">{participant.submissionsCount}</span>
                            <span className="stat-cell success-rate">{participant.successRate}%</span>
                            <span className="date-cell">{participant.joinedAt}</span>
                            <span className="arrow-cell"><ChevronRight size={18} /></span>
                        </div>
                    ))}
                    {filteredParticipants.length === 0 && (
                        <div className="empty-state">No participants found</div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Participants;
