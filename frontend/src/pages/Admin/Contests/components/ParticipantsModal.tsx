import React from 'react';
import { X } from 'lucide-react';
import { User } from '../types';

interface ParticipantsModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    selectedUserIds: number[];
    onToggleSelection: (userId: number) => void;
    onAdd: () => void;
    loading: boolean;
    error: string;
}

const ParticipantsModal: React.FC<ParticipantsModalProps> = ({
    isOpen,
    onClose,
    users,
    selectedUserIds,
    onToggleSelection,
    onAdd,
    loading,
    error
}) => {
    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'rgba(15, 19, 24, 0.98)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    width: '90%',
                    maxWidth: '550px',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
                }}
            >
                {/* Modal Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '24px 28px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: '#ffffff' }}>
                        Add Participants
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '28px' }}>
                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#f87171',
                            padding: '14px',
                            borderRadius: '10px',
                            marginBottom: '24px',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {users.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'rgba(255, 255, 255, 0.5)' }}>
                            <p style={{ margin: 0, lineHeight: 1.6 }}>
                                No players available. Create players in the Manage Users page first.
                            </p>
                        </div>
                    ) : (
                        <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                            {users.map(user => (
                                <label
                                    key={user.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        padding: '14px 16px',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                        cursor: 'pointer',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedUserIds.includes(user.id)}
                                        onChange={() => onToggleSelection(user.id)}
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            margin: 0,
                                            cursor: 'pointer',
                                            accentColor: '#FDE68A'
                                        }}
                                    />
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <span style={{ color: '#ffffff', fontWeight: 500, fontSize: '0.95rem' }}>
                                            {user.firstName && user.lastName
                                                ? `${user.firstName} ${user.lastName}`
                                                : user.username
                                            }
                                        </span>
                                        <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>
                                            {user.email}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '14px',
                    padding: '24px 28px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.02)'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '12px 24px',
                            background: 'transparent',
                            border: '1.5px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '10px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onAdd}
                        disabled={selectedUserIds.length === 0 || loading}
                        style={{
                            padding: '12px 28px',
                            background: 'rgba(253, 230, 138, 0.15)',
                            border: '1.5px solid rgba(253, 230, 138, 0.5)',
                            borderRadius: '10px',
                            color: '#FDE68A',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            cursor: selectedUserIds.length === 0 || loading ? 'not-allowed' : 'pointer',
                            opacity: selectedUserIds.length === 0 || loading ? 0.5 : 1
                        }}
                    >
                        {loading ? 'Adding...' : `Add ${selectedUserIds.length} Participant${selectedUserIds.length !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParticipantsModal;
