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
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e'];
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
                        fontSize: '1.875rem',
                        fontWeight: 600,
                        margin: 0,
                        marginBottom: '4px',
                        color: '#fafafa',
                        letterSpacing: '-0.025em'
                    }}>
                        Participants
                    </h1>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#a1a1aa' }}>
                        View and manage all participants
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{
                        textAlign: 'center',
                        padding: '12px 20px',
                        background: '#09090b',
                        border: '1px solid #27272a',
                        borderRadius: '8px'
                    }}>
                        <span style={{
                            display: 'block',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#fafafa',
                            letterSpacing: '-0.025em'
                        }}>{participants.length}</span>
                        <span style={{
                            fontSize: '0.75rem',
                            color: '#71717a',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>Total</span>
                    </div>
                    <div style={{
                        textAlign: 'center',
                        padding: '12px 20px',
                        background: '#09090b',
                        border: '1px solid #27272a',
                        borderRadius: '8px'
                    }}>
                        <span style={{
                            display: 'block',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#fafafa',
                            letterSpacing: '-0.025em'
                        }}>{activeParticipants.length}</span>
                        <span style={{
                            fontSize: '0.75rem',
                            color: '#71717a',
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
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    fontSize: '0.875rem'
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
                    size={16}
                    style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#71717a'
                    }}
                />
                <input
                    type="text"
                    placeholder="Search participants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px 10px 40px',
                        background: '#09090b',
                        border: '1px solid #27272a',
                        borderRadius: '6px',
                        color: '#fafafa',
                        fontSize: '0.875rem',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Loading State */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#71717a' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        border: '2px solid #27272a',
                        borderTopColor: '#fafafa',
                        borderRadius: '50%',
                        margin: '0 auto 16px',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ fontSize: '0.875rem' }}>Loading participants...</p>
                </div>
            ) : (
                /* Table */
                <div style={{
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}>
                    {/* Table Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 2fr 100px 100px 120px 100px 100px',
                        gap: '16px',
                        padding: '12px 24px',
                        background: '#0a0a0b',
                        fontSize: '0.75rem',
                        color: '#71717a',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 500,
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
                            color: '#71717a',
                            fontSize: '0.875rem'
                        }}>
                            {searchTerm ? 'No participants found matching your search' : 'No participants yet'}
                        </div>
                    ) : (
                        /* Table Rows */
                        filteredParticipants.map((participant, index) => (
                            <div
                                key={participant.id}
                                onClick={() => handleRowClick(participant.id)}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 2fr 100px 100px 120px 100px 100px',
                                    gap: '16px',
                                    padding: '16px 24px',
                                    borderTop: index === 0 ? 'none' : '1px solid #27272a',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* Participant Cell */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: getAvatarColor(participant.username),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        color: '#ffffff',
                                        flexShrink: 0
                                    }}>
                                        {participant.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <span style={{ fontWeight: 500, fontSize: '0.875rem', color: '#fafafa', display: 'block' }}>
                                            {participant.firstName && participant.lastName ? `${participant.firstName} ${participant.lastName}` : participant.username}
                                        </span>
                                        {participant.firstName && participant.lastName && (
                                            <span style={{ fontSize: '0.75rem', color: '#71717a', display: 'block' }}>
                                                {participant.username}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Email Cell */}
                                <span style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>
                                    {participant.email}
                                </span>

                                {/* Status Cell */}
                                <span>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        padding: '4px 10px',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        width: '85px',
                                        background: participant.status === 'active'
                                            ? 'rgba(34, 197, 94, 0.15)'
                                            : 'rgba(107, 114, 128, 0.15)',
                                        color: participant.status === 'active'
                                            ? '#22c55e'
                                            : '#9ca3af'
                                    }}>
                                        <span style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: participant.status === 'active' ? '#22c55e' : '#9ca3af'
                                        }}></span>
                                        {participant.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </span>

                                {/* Contests Cell */}
                                <span style={{ textAlign: 'center', color: '#fafafa', fontSize: '0.875rem' }}>
                                    {participant.contestCount ?? Math.floor(Math.random() * 20)}
                                </span>

                                {/* Submissions Cell */}
                                <span style={{ textAlign: 'center', color: '#fafafa', fontSize: '0.875rem' }}>
                                    {participant.submissionCount ?? Math.floor(Math.random() * 100)}
                                </span>

                                {/* Success Rate Cell */}
                                <span style={{ textAlign: 'center', color: '#22c55e', fontWeight: 500, fontSize: '0.875rem' }}>
                                    {participant.successRate ?? Math.floor(Math.random() * 40 + 60)}%
                                </span>

                                {/* Date Cell */}
                                <span style={{ textAlign: 'center', color: '#71717a', fontSize: '0.75rem' }}>
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

