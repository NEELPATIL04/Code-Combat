import React from 'react';
import { Plus, Play, Users, Edit2, Trash2, X } from 'lucide-react';
import { Contest } from '../types';

interface ContestListProps {
    contests: Contest[];
    loading: boolean;
    onCreate: () => void;
    onEdit: (contest: Contest) => void;
    onDelete: (id: number) => void;
    onStart: (id: number) => void;
    onManageParticipants: (id: number) => void;
}

const ContestList: React.FC<ContestListProps> = ({
    contests,
    loading,
    onCreate,
    onEdit,
    onDelete,
    onStart,
    onManageParticipants
}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading && contests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255, 255, 255, 0.4)' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        border: '2px solid rgba(253, 230, 138, 0.2)',
                        borderTopColor: '#FDE68A',
                        borderRadius: '50%',
                        margin: '0 auto 16px',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p>Loading contests...</p>
                </div>
            ) : contests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255, 255, 255, 0.4)' }}>
                    <p>No contests found</p>
                    <button
                        onClick={onCreate}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '16px',
                            padding: '12px 24px',
                            background: 'rgba(253, 230, 138, 0.15)',
                            border: '1px solid rgba(253, 230, 138, 0.4)',
                            borderRadius: '100px',
                            color: '#FDE68A',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        <Plus size={18} /> Create your first contest
                    </button>
                </div>
            ) : (
                contests.map(contest => (
                    <div
                        key={contest.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '20px 24px',
                            background: 'rgba(20, 20, 22, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            transition: 'border-color 0.2s ease'
                        }}
                    >
                        {/* Left: Status dot + Title + Difficulty */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '300px' }}>
                            <span style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                flexShrink: 0,
                                background: contest.status === 'active' ? '#10b981'
                                    : contest.status === 'upcoming' ? '#FBBF24'
                                        : '#6b7280',
                                boxShadow: contest.status === 'active' ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none'
                            }}></span>
                            <div>
                                <h3 style={{
                                    margin: 0,
                                    marginBottom: '6px',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    color: '#ffffff'
                                }}>
                                    {contest.title}
                                </h3>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 12px',
                                    background: contest.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.15)'
                                        : contest.difficulty === 'Medium' ? 'rgba(16, 185, 129, 0.15)'
                                            : 'rgba(239, 68, 68, 0.15)',
                                    border: contest.difficulty === 'Easy' ? '1px solid rgba(16, 185, 129, 0.3)'
                                        : contest.difficulty === 'Medium' ? '1px solid rgba(16, 185, 129, 0.3)'
                                            : '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '100px',
                                    fontSize: '0.7rem',
                                    fontWeight: 500,
                                    color: contest.difficulty === 'Easy' ? '#10b981'
                                        : contest.difficulty === 'Medium' ? '#10b981'
                                            : '#ef4444'
                                }}>
                                    {contest.difficulty}
                                </span>
                                {contest.isStarted && (
                                    <span style={{
                                        marginLeft: '8px',
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        background: 'rgba(16, 185, 129, 0.2)',
                                        borderRadius: '100px',
                                        fontSize: '0.65rem',
                                        fontWeight: 600,
                                        color: '#10b981',
                                        textTransform: 'uppercase'
                                    }}>
                                        Started
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Middle: Stats */}
                        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                            <div style={{ textAlign: 'left' }}>
                                <span style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 600,
                                    color: '#ffffff'
                                }}>
                                    {contest.participantCount || 0}
                                </span>
                                <span style={{
                                    marginLeft: '4px',
                                    fontSize: '0.7rem',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    Players
                                </span>
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <span style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 600,
                                    color: '#FBBF24'
                                }}>
                                    {contest.duration}m
                                </span>
                                <span style={{
                                    marginLeft: '4px',
                                    fontSize: '0.7rem',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    Duration
                                </span>
                            </div>
                        </div>

                        {/* Right: Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {!contest.isStarted && (
                                <button
                                    onClick={() => onStart(contest.id)}
                                    title="Start Contest"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        borderRadius: '10px',
                                        color: '#10b981',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Play size={16} />
                                </button>
                            )}
                            <button
                                onClick={() => onManageParticipants(contest.id)}
                                title="Add Participants"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    borderRadius: '10px',
                                    color: '#3b82f6',
                                    cursor: 'pointer'
                                }}
                            >
                                <Users size={16} />
                            </button>
                            <button
                                onClick={() => onEdit(contest)}
                                title="Edit Contest"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '10px',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    cursor: 'pointer'
                                }}
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => onDelete(contest.id)}
                                title="Delete Contest"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '10px',
                                    color: '#ef4444',
                                    cursor: 'pointer'
                                }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default ContestList;
