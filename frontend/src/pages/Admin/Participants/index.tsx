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
    status: 'active' | 'inactive';
}

const mockParticipants: Participant[] = [
    { id: 1, username: 'player1', email: 'player1@example.com', avatar: 'P', contestsCount: 12, submissionsCount: 45, joinedAt: '2024-01-15', successRate: 78, status: 'active' },
    { id: 2, username: 'player2', email: 'player2@example.com', avatar: 'P', contestsCount: 8, submissionsCount: 32, joinedAt: '2024-02-20', successRate: 65, status: 'active' },
    { id: 3, username: 'coder123', email: 'coder@example.com', avatar: 'C', contestsCount: 5, submissionsCount: 18, joinedAt: '2024-03-05', successRate: 82, status: 'inactive' },
    { id: 4, username: 'devmaster', email: 'dev@example.com', avatar: 'D', contestsCount: 3, submissionsCount: 10, joinedAt: '2024-03-10', successRate: 90, status: 'active' },
    { id: 5, username: 'algorithmguru', email: 'algo@example.com', avatar: 'A', contestsCount: 15, submissionsCount: 67, joinedAt: '2024-01-01', successRate: 88, status: 'active' },
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
                        <div className="mini-stat">
                            <span className="mini-value">{participants.filter(p => p.status === 'active').length}</span>
                            <span className="mini-label">Active</span>
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
                        <span>Email</span>
                        <span>Status</span>
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
                            <div className="participant-cell">
                                <div className="avatar">{participant.username.charAt(0).toUpperCase()}</div>
                                <span className="username">{participant.username}</span>
                            </div>
                            <span className="email-cell">{participant.email}</span>
                            <span className="status-cell">
                                <span className={`status-badge ${participant.status}`}>
                                    {participant.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </span>
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
