import React, { useState, useEffect, ChangeEvent } from 'react';
import { Shield, Ban, Trash2, Plus, X } from 'lucide-react';

import { userAPI } from '../../../utils/api';

interface User {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    companySchool?: string;
    role: string;
    status: 'active' | 'banned';
}

interface UserFormData {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companySchool: string;
    role: string;
}

const ManageUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const [formData, setFormData] = useState<UserFormData>({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        companySchool: '',
        role: 'player',
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userAPI.getAll();
            setUsers(data.users || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const openModal = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            companySchool: '',
            role: 'player',
        });
        setShowModal(true);
        setError('');
    };

    const closeModal = () => {
        setShowModal(false);
        setError('');
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async () => {
        try {
            setError('');
            setLoading(true);

            if (!formData.username || !formData.email || !formData.password) {
                setError('Username, email, and password are required');
                return;
            }

            await userAPI.create(formData);
            await loadUsers();
            closeModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: number) => {
        try {
            await userAPI.toggleStatus(id);
            await loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle user status');
        }
    };

    const changeRole = async (id: number, role: string) => {
        try {
            await userAPI.update(id, { role });
            await loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to change role');
        }
    };

    const deleteUser = async (id: number) => {
        if (!confirm('Delete this user? This action cannot be undone.')) return;

        try {
            await userAPI.delete(id);
            await loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete user');
        }
    };

    // Get avatar color based on username
    const getAvatarColor = (username: string) => {
        const colors = ['#FBBF24', '#F59E0B', '#EAB308', '#FDE68A', '#FCD34D'];
        const index = username.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '14px 16px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1.5px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        color: '#ffffff',
        fontSize: '0.95rem',
        outline: 'none'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '10px',
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: '0.875rem',
        fontWeight: 600
    };

    return (
        <div>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
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
                            Manage Users
                        </h1>
                        <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.5)' }}>
                            Add, edit, or remove users
                        </p>
                    </div>
                    <button
                        onClick={openModal}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
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
                        <Plus size={18} /> Create User
                    </button>
                </header>

                {/* Error Banner */}
                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        {error}
                        <button
                            onClick={() => setError('')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && users.length === 0 ? (
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
                        <p>Loading users...</p>
                    </div>
                ) : (
                    /* Users List */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {users.map(user => (
                            <div
                                key={user.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    padding: '20px 24px',
                                    background: 'rgba(20, 20, 22, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '16px',
                                    opacity: user.status === 'banned' ? 0.6 : 1
                                }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: getAvatarColor(user.username),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 600,
                                    fontSize: '1.25rem',
                                    color: '#000000',
                                    flexShrink: 0
                                }}>
                                    {user.firstName
                                        ? user.firstName.charAt(0).toUpperCase()
                                        : user.username.charAt(0).toUpperCase()
                                    }
                                </div>

                                {/* User Info */}
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 500, color: '#ffffff' }}>
                                        {user.username}
                                    </h3>
                                    {user.firstName && user.lastName && (
                                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                                            {user.firstName} {user.lastName}
                                        </p>
                                    )}
                                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                                        {user.email}
                                    </p>
                                </div>

                                {/* Role Badge */}
                                <span style={{
                                    padding: '6px 14px',
                                    borderRadius: '100px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    textTransform: 'capitalize',
                                    background: user.role === 'admin' ? 'rgba(139, 92, 246, 0.15)'
                                        : user.role === 'super_admin' ? 'rgba(239, 68, 68, 0.15)'
                                            : 'rgba(16, 185, 129, 0.15)',
                                    color: user.role === 'admin' ? '#8b5cf6'
                                        : user.role === 'super_admin' ? '#ef4444'
                                            : '#10b981',
                                    border: user.role === 'admin' ? '1px solid rgba(139, 92, 246, 0.3)'
                                        : user.role === 'super_admin' ? '1px solid rgba(239, 68, 68, 0.3)'
                                            : '1px solid rgba(16, 185, 129, 0.3)'
                                }}>
                                    {user.role === 'super_admin' ? 'Super Admin' : user.role}
                                </span>

                                {/* Status Badge */}
                                <span style={{
                                    padding: '6px 14px',
                                    borderRadius: '100px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    background: user.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    color: user.status === 'active' ? '#10b981' : '#ef4444',
                                    border: user.status === 'active' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                                }}>
                                    {user.status === 'active' ? 'Active' : 'Banned'}
                                </span>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select
                                        value={user.role}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => changeRole(user.id, e.target.value)}
                                        style={{
                                            padding: '8px 12px',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            color: '#ffffff',
                                            fontSize: '0.85rem',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="player">Player</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                    <button
                                        onClick={() => toggleStatus(user.id)}
                                        title={user.status === 'active' ? 'Ban User' : 'Activate User'}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: user.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                                            border: user.status === 'active' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(251, 191, 36, 0.3)',
                                            borderRadius: '10px',
                                            color: user.status === 'active' ? '#10b981' : '#FBBF24',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {user.status === 'active' ? <Ban size={16} /> : <Shield size={16} />}
                                    </button>
                                    <button
                                        onClick={() => deleteUser(user.id)}
                                        title="Delete User"
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
                        ))}
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div
                    onClick={closeModal}
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
                            background: '#1a1f2e',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            width: '90%',
                            maxWidth: '550px',
                            maxHeight: '85vh',
                            overflowY: 'auto'
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
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#ffffff' }}>
                                Create New User
                            </h2>
                            <button
                                onClick={closeModal}
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
                            {/* Username */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Username *</label>
                                <input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter username..."
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            {/* First & Last Name */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label style={labelStyle}>First Name</label>
                                    <input
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="First name..."
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Last Name</label>
                                    <input
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Last name..."
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Email *</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email..."
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Password *</label>
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password..."
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            {/* Company/School */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Company / School Name</label>
                                <input
                                    name="companySchool"
                                    value={formData.companySchool}
                                    onChange={handleChange}
                                    placeholder="Company or school name..."
                                    style={inputStyle}
                                />
                            </div>

                            {/* Role */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >
                                    <option value="player">Player</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
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
                                onClick={closeModal}
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
                                onClick={handleCreateUser}
                                disabled={loading}
                                style={{
                                    padding: '12px 28px',
                                    background: 'rgba(253, 230, 138, 0.15)',
                                    border: '1.5px solid rgba(253, 230, 138, 0.5)',
                                    borderRadius: '10px',
                                    color: '#FDE68A',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.5 : 1
                                }}
                            >
                                {loading ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </div>
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

export default ManageUsers;
