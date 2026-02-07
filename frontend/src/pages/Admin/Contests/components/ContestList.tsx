import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Users, Edit2, Trash2 } from 'lucide-react';
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
    const navigate = useNavigate();
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {loading && contests.length === 0 ? (
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
                    <p style={{ fontSize: '0.875rem' }}>Loading contests...</p>
                </div>
            ) : contests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#71717a' }}>
                    <p style={{ fontSize: '0.875rem' }}>No contests found</p>
                    <button
                        onClick={onCreate}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '16px',
                            padding: '10px 20px',
                            background: '#fafafa',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#09090b',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'opacity 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        <Plus size={16} /> Create your first contest
                    </button>
                </div>
            ) : (
                <div style={{
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}>
                    {/* Table Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 120px 100px 100px 100px 160px',
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
                        <span>Contest</span>
                        <span>Status</span>
                        <span>Difficulty</span>
                        <span style={{ textAlign: 'center' }}>Players</span>
                        <span style={{ textAlign: 'center' }}>Duration</span>
                        <span style={{ textAlign: 'right' }}>Actions</span>
                    </div>

                    {/* Table Rows */}
                    {contests.map((contest, index) => (
                        <div
                            key={contest.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 120px 100px 100px 100px 160px',
                                gap: '16px',
                                padding: '16px 24px',
                                borderTop: index === 0 ? 'none' : '1px solid #27272a',
                                alignItems: 'center',
                                transition: 'background 0.2s ease'
                            }}
                            onClick={() => navigate(`/admin/contests/${contest.id}`)}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            {/* Contest Cell */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    flexShrink: 0,
                                    background: contest.status === 'active' ? '#22c55e'
                                        : contest.status === 'upcoming' ? '#eab308'
                                            : '#71717a',
                                    boxShadow: contest.status === 'active' ? '0 0 8px rgba(34, 197, 94, 0.5)' : 'none'
                                }}></span>
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: '0.875rem', color: '#fafafa', marginBottom: '2px' }}>
                                        {contest.title}
                                    </div>
                                    {contest.isStarted && (
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '2px 8px',
                                            background: 'rgba(34, 197, 94, 0.1)',
                                            borderRadius: '4px',
                                            fontSize: '0.65rem',
                                            fontWeight: 600,
                                            color: '#22c55e',
                                            textTransform: 'uppercase'
                                        }}>
                                            In Progress
                                        </span>
                                    )}
                                </div>
                            </div>

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
                                    background: contest.status === 'active' ? 'rgba(34, 197, 94, 0.1)'
                                        : contest.status === 'upcoming' ? 'rgba(234, 179, 8, 0.1)'
                                            : 'rgba(113, 113, 122, 0.1)',
                                    color: contest.status === 'active' ? '#22c55e'
                                        : contest.status === 'upcoming' ? '#eab308'
                                            : '#71717a',
                                    textTransform: 'capitalize'
                                }}>
                                    {contest.status}
                                </span>
                            </span>

                            {/* Difficulty Cell */}
                            <span>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    width: '80px',
                                    background: contest.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.1)'
                                        : contest.difficulty === 'Medium' ? 'rgba(234, 179, 8, 0.1)'
                                            : 'rgba(239, 68, 68, 0.1)',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: contest.difficulty === 'Easy' ? '#22c55e'
                                        : contest.difficulty === 'Medium' ? '#eab308'
                                            : '#ef4444'
                                }}>
                                    {contest.difficulty}
                                </span>
                            </span>

                            {/* Players Cell */}
                            <span style={{ textAlign: 'center', color: '#fafafa', fontSize: '0.875rem' }}>
                                {contest.participantCount || 0}
                            </span>

                            {/* Duration Cell */}
                            <span style={{ textAlign: 'center', color: '#fafafa', fontSize: '0.875rem' }}>
                                {contest.duration}m
                            </span>

                            {/* Actions Cell */}
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                {!contest.isStarted && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onStart(contest.id); }}
                                        title="Start Contest"
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'transparent',
                                            border: '1px solid #27272a',
                                            borderRadius: '6px',
                                            color: '#22c55e',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#18181b'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <Play size={14} />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onManageParticipants(contest.id); }}
                                    title="Add Participants"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'transparent',
                                        border: '1px solid #27272a',
                                        borderRadius: '6px',
                                        color: '#3b82f6',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = '#18181b'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <Users size={14} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(contest); }}
                                    title="Edit Contest"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'transparent',
                                        border: '1px solid #27272a',
                                        borderRadius: '6px',
                                        color: '#a1a1aa',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = '#18181b'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(contest.id); }}
                                    title="Delete Contest"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'transparent',
                                        border: '1px solid #27272a',
                                        borderRadius: '6px',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = '#18181b'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )
            }
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div >
    );
};

export default ContestList;

