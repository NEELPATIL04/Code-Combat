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
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#eab308', '#22c55e'];
        const index = username.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 14px',
        background: '#09090b',
        border: '1px solid #27272a',
        borderRadius: '6px',
        color: '#fafafa',
        fontSize: '0.875rem',
        outline: 'none'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '8px',
        color: '#a1a1aa',
        fontSize: '0.875rem',
        fontWeight: 500
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
                            fontSize: '1.875rem',
                            fontWeight: 600,
                            margin: 0,
                            marginBottom: '4px',
                            color: '#fafafa',
                            letterSpacing: '-0.025em'
                        }}>
                            Manage Users
                        </h1>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#a1a1aa' }}>
                            Add, edit, or remove users
                        </p>
                    </div>
                    <button
                        onClick={openModal}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
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
                        <Plus size={16} /> Create User
                    </button>
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
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                        <button
                            onClick={() => setError('')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && users.length === 0 ? (
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
                        <p style={{ fontSize: '0.875rem' }}>Loading users...</p>
                    </div>
                ) : (
                    /* Users List */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {users.map(user => (
                            <div
                                key={user.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px 20px',
                                    background: '#09090b',
                                    border: '1px solid #27272a',
                                    borderRadius: '12px',
                                    opacity: user.status === 'banned' ? 0.6 : 1,
                                    transition: 'background 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#09090b'}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: getAvatarColor(user.username),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    color: '#ffffff',
                                    flexShrink: 0
                                }}>
                                    {user.firstName
                                        ? user.firstName.charAt(0).toUpperCase()
                                        : user.username.charAt(0).toUpperCase()
                                    }
                                </div>

                                {/* User Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#fafafa' }}>
                                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                                    </h3>
                                    {user.firstName && user.lastName && (
                                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#71717a' }}>
                                            {user.username}
                                        </p>
                                    )}
                                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#71717a' }}>
                                        {user.email}
                                    </p>
                                </div>

                                {/* Role Badge */}
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    textTransform: 'capitalize',
                                    width: '110px',
                                    background: user.role === 'admin' ? 'rgba(139, 92, 246, 0.15)'
                                        : user.role === 'super_admin' ? 'rgba(239, 68, 68, 0.15)'
                                            : 'rgba(34, 197, 94, 0.15)',
                                    color: user.role === 'admin' ? '#8b5cf6'
                                        : user.role === 'super_admin' ? '#ef4444'
                                            : '#22c55e'
                                }}>
                                    <span style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: user.role === 'admin' ? '#8b5cf6'
                                            : user.role === 'super_admin' ? '#ef4444'
                                                : '#22c55e'
                                    }}></span>
                                    {user.role === 'super_admin' ? 'Super Admin' : user.role}
                                </span>

                                {/* Status Badge */}
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
                                    background: user.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    color: user.status === 'active' ? '#22c55e' : '#ef4444'
                                }}>
                                    <span style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: user.status === 'active' ? '#22c55e' : '#ef4444'
                                    }}></span>
                                    {user.status === 'active' ? 'Active' : 'Banned'}
                                </span>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select
                                        value={user.role}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => changeRole(user.id, e.target.value)}
                                        style={{
                                            padding: '8px 12px',
                                            background: '#09090b',
                                            border: '1px solid #27272a',
                                            borderRadius: '6px',
                                            color: '#fafafa',
                                            fontSize: '0.75rem',
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
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'transparent',
                                            border: '1px solid #27272a',
                                            borderRadius: '6px',
                                            color: user.status === 'active' ? '#22c55e' : '#eab308',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = '#18181b'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {user.status === 'active' ? <Ban size={16} /> : <Shield size={16} />}
                                    </button>
                                    <button
                                        onClick={() => deleteUser(user.id)}
                                        title="Delete User"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'transparent',
                                            border: '1px solid #27272a',
                                            borderRadius: '6px',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = '#18181b'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
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
                            background: '#09090b',
                            border: '1px solid #27272a',
                            borderRadius: '12px',
                            width: '90%',
                            maxWidth: '500px',
                            maxHeight: '85vh',
                            overflowY: 'auto'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px 24px',
                            borderBottom: '1px solid #27272a'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fafafa' }}>
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
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: '#71717a',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px' }}>
                            {/* Username */}
                            <div style={{ marginBottom: '20px' }}>
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
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
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
                            <div style={{ marginBottom: '20px' }}>
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
                            <div style={{ marginBottom: '20px' }}>
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
                            <div style={{ marginBottom: '20px' }}>
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
                            <div style={{ marginBottom: '20px' }}>
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
                            gap: '12px',
                            padding: '20px 24px',
                            borderTop: '1px solid #27272a'
                        }}>
                            <button
                                onClick={closeModal}
                                style={{
                                    padding: '10px 20px',
                                    background: 'transparent',
                                    border: '1px solid #27272a',
                                    borderRadius: '6px',
                                    color: '#a1a1aa',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#18181b';
                                    e.currentTarget.style.color = '#fafafa';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#a1a1aa';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateUser}
                                disabled={loading}
                                style={{
                                    padding: '10px 24px',
                                    background: '#fafafa',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: '#09090b',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.5 : 1,
                                    transition: 'opacity 0.15s ease'
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

