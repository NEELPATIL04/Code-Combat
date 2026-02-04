import React, { useState, useEffect, ChangeEvent } from 'react';
import { Shield, Ban, Trash2 } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import './ManageUsers.css';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    status: 'active' | 'banned';
}

const mockUsers: User[] = [
    { id: 1, username: 'player1', email: 'player1@example.com', role: 'participant', status: 'active' },
    { id: 2, username: 'player2', email: 'player2@example.com', role: 'participant', status: 'active' },
    { id: 3, username: 'coder123', email: 'coder@example.com', role: 'participant', status: 'banned' },
];

const ManageUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => { setTimeout(() => setUsers(mockUsers), 300); }, []);

    const toggleStatus = (id: number) => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'banned' : 'active' } : u));
    const changeRole = (id: number, role: string) => setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    const deleteUser = (id: number) => { if (confirm('Delete this user?')) setUsers(prev => prev.filter(u => u.id !== id)); };

    return (
        <AdminLayout>
            <div className="manage-content">
                <header className="page-header"><h1>Manage Users</h1><p className="page-subtitle">Add, edit, or remove users</p></header>
                <div className="users-grid">
                    {users.map(user => (
                        <div key={user.id} className={`user-card ${user.status}`}>
                            <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                            <div className="user-info"><h3>{user.username}</h3><p>{user.email}</p></div>
                            <div className="user-controls">
                                <select value={user.role} onChange={(e: ChangeEvent<HTMLSelectElement>) => changeRole(user.id, e.target.value)}>
                                    <option value="participant">Participant</option><option value="admin">Admin</option>
                                </select>
                                <button className={`status-toggle ${user.status}`} onClick={() => toggleStatus(user.id)}>{user.status === 'active' ? <Ban size={16} /> : <Shield size={16} />}</button>
                                <button className="delete-btn" onClick={() => deleteUser(user.id)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default ManageUsers;
