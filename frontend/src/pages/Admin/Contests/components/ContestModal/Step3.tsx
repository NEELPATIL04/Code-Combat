import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Circle, UserPlus, Users } from 'lucide-react';
import { FormData, User } from '../../types';
import { userAPI } from '../../../../../utils/api';

interface Step3Props {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    readOnly?: boolean;
}

const Step3: React.FC<Step3Props> = ({ formData, setFormData, readOnly = false }) => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await userAPI.getAll();
                // Filter users to only show active players
                setAllUsers(response.users.filter((u: User) => u.role === 'player' && u.status === 'active'));
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const toggleParticipant = (userId: number) => {
        if (readOnly) return;
        setFormData(prev => {
            const isSelected = prev.participants.includes(userId);
            if (isSelected) {
                return { ...prev, participants: prev.participants.filter(id => id !== userId) };
            } else {
                return { ...prev, participants: [...prev.participants, userId] };
            }
        });
    };

    const toggleAll = () => {
        if (readOnly) return;
        if (formData.participants.length === filteredUsers.length) {
            setFormData(prev => ({ ...prev, participants: [] }));
        } else {
            setFormData(prev => ({ ...prev, participants: filteredUsers.map(u => u.id) }));
        }
    };

    const filteredUsers = allUsers.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (`${user.firstName || ''} ${user.lastName || ''}`).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fafafa', margin: 0 }}>Select Participants</h3>
                    <p style={{ margin: '4px 0 0', color: '#71717a', fontSize: '0.75rem' }}>Choose who should be enrolled in this contest</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '6px', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 600 }}>
                    <Users size={14} />
                    {formData.participants.length} Selected
                </div>
            </div>

            <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                <input
                    type="text"
                    placeholder="Search by name, email, or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        background: '#09090b',
                        border: '1px solid #27272a',
                        borderRadius: '6px',
                        color: '#fafafa',
                        fontSize: '0.875rem',
                        outline: 'none'
                    }}
                />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #27272a', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #27272a', background: 'rgba(255,255,255,0.01)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Available Players ({filteredUsers.length})</span>
                    {!readOnly && (
                        <button
                            onClick={toggleAll}
                            style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                            {formData.participants.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                        </button>
                    )}
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <div style={{ width: '24px', height: '24px', border: '2px solid #27272a', borderTopColor: '#fafafa', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#71717a' }}>
                            <UserPlus size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>No players found</p>
                        </div>
                    ) : (
                        filteredUsers.map(user => {
                            const isSelected = formData.participants.includes(user.id);
                            return (
                                <div
                                    key={user.id}
                                    onClick={() => toggleParticipant(user.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #18181b',
                                        cursor: 'pointer',
                                        background: isSelected ? 'rgba(59,130,246,0.05)' : 'transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isSelected ? (
                                        <CheckCircle size={18} style={{ color: '#3b82f6' }} />
                                    ) : (
                                        <Circle size={18} style={{ color: '#27272a' }} />
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#fafafa' }}>
                                            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{user.email}</div>
                                    </div>
                                    {isSelected && <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 600 }}>Selected</span>}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Step3;
