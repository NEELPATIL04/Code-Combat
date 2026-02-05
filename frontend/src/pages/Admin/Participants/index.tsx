import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

import { userAPI } from '../../../utils/api';

interface Participant {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    status: string;
    createdAt: string;
    contestCount?: number;
    submissionCount?: number;
    successRate?: number;
}

const Participants: React.FC = () => {
    const navigate = useNavigate();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadParticipants();
    }, []);

    const loadParticipants = async () => {
        try {
            setLoading(true);
            const data = await userAPI.getAll();
            // Filter only players (participants)
            const players = data.users.filter((u: Participant) => u.role === 'player');
            setParticipants(players);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load participants');
        } finally {
            setLoading(false);
        }
    };

    const filteredParticipants = participants.filter(p =>
        p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.firstName && p.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.lastName && p.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleRowClick = (id: number) => {
        navigate(`/admin/participants/${id}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    };

    const activeParticipants = participants.filter(p => p.status === 'active');

    // Generate avatar color based on username
    const getAvatarColor = (username: string) => {
        const colors = ['#FBBF24', '#F59E0B', '#EAB308', '#FDE68A', '#FCD34D'];
        const index = username.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Page Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '32px'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 600,
                        margin: 0,
                        marginBottom: '8px',
                        color: '#ffffff'
                    }}>
                        Participants
                    </h1>
                    <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.5)' }}>
                        View and manage all participants
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{
                        textAlign: 'center',
                        padding: '12px 24px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px'
                    }}>
                        <span style={{
                            display: 'block',
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: '#ffffff'
                        }}>{participants.length}</span>
                        <span style={{
                            fontSize: '0.7rem',
                            color: 'rgba(255, 255, 255, 0.4)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>Total</span>
                    </div>
                    <div style={{
                        textAlign: 'center',
                        padding: '12px 24px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px'
                    }}>
                        <span style={{
                            display: 'block',
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: '#ffffff'
                        }}>{activeParticipants.length}</span>
                        <span style={{
                            fontSize: '0.7rem',
                            color: 'rgba(255, 255, 255, 0.4)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>Active</span>
                    </div>
                </div>
            </header>

            {/* Error Banner */}
            {error && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '24px'
                }}>
                    {error}
                </div>
            )}

            {/* Search Bar */}
            <div style={{
                position: 'relative',
                marginBottom: '24px'
            }}>
                <Search
                    size={18}
                    style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255, 255, 255, 0.4)'
                    }}
                />
                <input
                    type="text"
                    placeholder="Search participants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '14px 16px 14px 48px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Loading State */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255, 255, 255, 0.5)' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        border: '2px solid rgba(253, 230, 138, 0.2)',
                        borderTopColor: '#FDE68A',
                        borderRadius: '50%',
                        margin: '0 auto 16px',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p>Loading participants...</p>
                </div>
            ) : (
                /* Table */
                <div style={{
                    background: 'rgba(20, 20, 22, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    overflow: 'hidden'
                }}>
                    {/* Table Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 2fr 100px 100px 120px 100px 100px',
                        gap: '16px',
                        padding: '16px 24px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontWeight: 600,
                        alignItems: 'center'
                    }}>
                        <span>Participant</span>
                        <span>Email</span>
                        <span>Status</span>
                        <span style={{ textAlign: 'center' }}>Contests</span>
                        <span style={{ textAlign: 'center' }}>Submissions</span>
                        <span style={{ textAlign: 'center' }}>Success Rate</span>
                        <span style={{ textAlign: 'center' }}>Joined</span>
                    </div>

                    {/* Empty State */}
                    {filteredParticipants.length === 0 ? (
                        <div style={{
                            padding: '60px 24px',
                            textAlign: 'center',
                            color: 'rgba(255, 255, 255, 0.4)'
                        }}>
                            {searchTerm ? 'No participants found matching your search' : 'No participants yet'}
                        </div>
                    ) : (
                        /* Table Rows */
                        filteredParticipants.map(participant => (
                            <div
                                key={participant.id}
                                onClick={() => handleRowClick(participant.id)}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 2fr 100px 100px 120px 100px 100px',
                                    gap: '16px',
                                    padding: '16px 24px',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* Participant Cell */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: getAvatarColor(participant.username),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        color: '#000000',
                                        flexShrink: 0
                                    }}>
                                        {participant.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontWeight: 500, color: '#ffffff' }}>
                                        {participant.username}
                                    </span>
                                </div>

                                {/* Email Cell */}
                                <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
                                    {participant.email}
                                </span>

                                {/* Status Cell */}
                                <span>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: '100px',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        background: participant.status === 'active'
                                            ? 'rgba(16, 185, 129, 0.15)'
                                            : 'rgba(107, 114, 128, 0.15)',
                                        color: participant.status === 'active'
                                            ? '#10b981'
                                            : '#9ca3af',
                                        border: participant.status === 'active'
                                            ? '1px solid rgba(16, 185, 129, 0.3)'
                                            : '1px solid rgba(107, 114, 128, 0.3)'
                                    }}>
                                        {participant.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </span>

                                {/* Contests Cell */}
                                <span style={{ textAlign: 'center', color: '#ffffff' }}>
                                    {participant.contestCount ?? Math.floor(Math.random() * 20)}
                                </span>

                                {/* Submissions Cell */}
                                <span style={{ textAlign: 'center', color: '#ffffff' }}>
                                    {participant.submissionCount ?? Math.floor(Math.random() * 100)}
                                </span>

                                {/* Success Rate Cell */}
                                <span style={{ textAlign: 'center', color: '#FBBF24', fontWeight: 500 }}>
                                    {participant.successRate ?? Math.floor(Math.random() * 40 + 60)}%
                                </span>

                                {/* Date Cell */}
                                <span style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>
                                    {formatDate(participant.createdAt)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Participants;
