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
    isOpen, onClose, users, selectedUserIds, onToggleSelection, onAdd, loading, error
}) => {
    if (!isOpen) return null;

    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #27272a' }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fafafa' }}>Add Participants</h2>
                    <button onClick={onClose} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', borderRadius: '6px', color: '#71717a', cursor: 'pointer' }}><X size={18} /></button>
                </div>
                <div style={{ padding: '24px' }}>
                    {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.875rem' }}>{error}</div>}
                    {users.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#71717a' }}><p style={{ margin: 0, fontSize: '0.875rem' }}>No players available.</p></div>
                    ) : (
                        <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                            {users.map(user => (
                                <label key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', borderBottom: '1px solid #27272a', cursor: 'pointer', borderRadius: '6px' }}>
                                    <input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={() => onToggleSelection(user.id)} style={{ width: '18px', height: '18px', margin: 0, cursor: 'pointer', accentColor: '#fafafa' }} />
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ color: '#fafafa', fontWeight: 500, fontSize: '0.875rem' }}>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}</span>
                                        <span style={{ color: '#71717a', fontSize: '0.75rem' }}>{user.email}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 24px', borderTop: '1px solid #27272a' }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #27272a', borderRadius: '6px', color: '#a1a1aa', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={onAdd} disabled={selectedUserIds.length === 0 || loading} style={{ padding: '10px 24px', background: '#fafafa', border: 'none', borderRadius: '6px', color: '#09090b', fontSize: '0.875rem', fontWeight: 500, cursor: selectedUserIds.length === 0 || loading ? 'not-allowed' : 'pointer', opacity: selectedUserIds.length === 0 || loading ? 0.5 : 1 }}>{loading ? 'Adding...' : `Add ${selectedUserIds.length} Participant${selectedUserIds.length !== 1 ? 's' : ''}`}</button>
                </div>
            </div>
        </div>
    );
};

export default ParticipantsModal;
