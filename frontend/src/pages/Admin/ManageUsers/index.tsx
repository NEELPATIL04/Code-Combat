import React, { useState, useEffect, ChangeEvent } from 'react';
import { Shield, Ban, Trash2, Plus, X } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
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

    return (
        <AdminLayout>
            <div className="max-w-[1000px]">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-semibold m-0 mb-2 bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                            Manage Users
                        </h1>
                        <p className="text-white/50 m-0">Add, edit, or remove users</p>
                    </div>
                    <button
                        className="flex items-center gap-2 py-3 px-5 bg-yellow-200/10 border border-yellow-200/30 text-yellow-200 rounded-full font-medium text-sm cursor-pointer transition-all duration-200 hover:bg-yellow-200/20"
                        onClick={openModal}
                    >
                        <Plus size={18} /> Create User
                    </button>
                </header>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 flex justify-between items-center">
                        {error}
                        <button onClick={() => setError('')} className="bg-transparent border-none text-red-500 cursor-pointer"><X size={16} /></button>
                    </div>
                )}

                {loading && users.length === 0 ? (
                    <div className="text-center py-10 text-white/50"><p>Loading users...</p></div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {users.map(user => (
                            <div key={user.id} className={`flex items-center gap-5 p-5 bg-white/[0.02] border border-white/[0.08] rounded-xl transition-all duration-200 hover:border-white/15 ${user.status === 'banned' ? 'opacity-60' : ''}`}>
                                <div className="w-12 h-12 bg-yellow-200/15 text-yellow-200 rounded-full flex items-center justify-center font-semibold text-xl flex-shrink-0">
                                    {user.firstName
                                        ? user.firstName.charAt(0).toUpperCase()
                                        : user.username.charAt(0).toUpperCase()
                                    }
                                </div>
                                <div className="flex-1">
                                    <h3 className="m-0 text-base font-medium text-white">{user.username}</h3>
                                    {user.firstName && user.lastName && (
                                        <p className="mt-1 text-[0.85rem] text-white/50">{user.firstName} {user.lastName}</p>
                                    )}
                                    <p className="mt-1 text-[0.85rem] text-white/50">{user.email}</p>
                                    {user.companySchool && (
                                        <p className="mt-1 text-[0.85rem] text-white/50">{user.companySchool}</p>
                                    )}
                                </div>
                                <div className="flex gap-3 items-center">
                                    <select
                                        value={user.role}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => changeRole(user.id, e.target.value)}
                                        className="py-2 px-3 bg-white/5 border border-white/10 rounded-lg text-white font-inherit focus:outline-none focus:border-yellow-200/30"
                                    >
                                        <option value="player">Player</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                    <button
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 border ${user.status === 'active'
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
                                                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20'
                                            }`}
                                        onClick={() => toggleStatus(user.id)}
                                        title={user.status === 'active' ? 'Ban User' : 'Activate User'}
                                    >
                                        {user.status === 'active' ? <Ban size={16} /> : <Shield size={16} />}
                                    </button>
                                    <button
                                        className="w-9 h-9 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-red-500/20"
                                        onClick={() => deleteUser(user.id)}
                                        title="Delete User"
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
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] animate-fade-in" onClick={closeModal}>
                    <div className="bg-[#1a1f2e] border border-white/10 rounded-xl w-[90%] max-w-[550px] max-h-[85vh] overflow-y-auto shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center py-6 px-7 border-b border-white/[0.08]">
                            <h2 className="m-0 text-xl font-semibold text-white">Create New User</h2>
                            <button className="bg-white/5 border-none text-white/60 cursor-pointer flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 hover:bg-white/10 hover:text-white" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-7">
                            <div className="mb-6">
                                <label className="block mb-2.5 text-white/85 text-sm font-semibold">Username *</label>
                                <input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter username..."
                                    required
                                    className="w-full py-3.5 px-4 bg-white/[0.04] border-[1.5px] border-white/10 rounded-[10px] text-white font-inherit text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-yellow-200/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(253,230,138,0.1)] placeholder:text-white/35"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block mb-2.5 text-white/85 text-sm font-semibold">First Name</label>
                                    <input
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="First name..."
                                        className="w-full py-3.5 px-4 bg-white/[0.04] border-[1.5px] border-white/10 rounded-[10px] text-white font-inherit text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-yellow-200/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(253,230,138,0.1)] placeholder:text-white/35"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2.5 text-white/85 text-sm font-semibold">Last Name</label>
                                    <input
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Last name..."
                                        className="w-full py-3.5 px-4 bg-white/[0.04] border-[1.5px] border-white/10 rounded-[10px] text-white font-inherit text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-yellow-200/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(253,230,138,0.1)] placeholder:text-white/35"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block mb-2.5 text-white/85 text-sm font-semibold">Email *</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email..."
                                    required
                                    className="w-full py-3.5 px-4 bg-white/[0.04] border-[1.5px] border-white/10 rounded-[10px] text-white font-inherit text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-yellow-200/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(253,230,138,0.1)] placeholder:text-white/35"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block mb-2.5 text-white/85 text-sm font-semibold">Password *</label>
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password..."
                                    required
                                    className="w-full py-3.5 px-4 bg-white/[0.04] border-[1.5px] border-white/10 rounded-[10px] text-white font-inherit text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-yellow-200/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(253,230,138,0.1)] placeholder:text-white/35"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block mb-2.5 text-white/85 text-sm font-semibold">Company / School Name</label>
                                <input
                                    name="companySchool"
                                    value={formData.companySchool}
                                    onChange={handleChange}
                                    placeholder="Company or school name..."
                                    className="w-full py-3.5 px-4 bg-white/[0.04] border-[1.5px] border-white/10 rounded-[10px] text-white font-inherit text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-yellow-200/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(253,230,138,0.1)] placeholder:text-white/35"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block mb-2.5 text-white/85 text-sm font-semibold">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full py-3.5 px-4 bg-white/[0.04] border-[1.5px] border-white/10 rounded-[10px] text-white font-inherit text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-yellow-200/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(253,230,138,0.1)]"
                                >
                                    <option value="player">Player</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3.5 py-6 px-7 border-t border-white/[0.08] bg-white/[0.02]">
                            <button
                                className="py-3 px-6 bg-transparent border-[1.5px] border-white/15 text-white/70 rounded-[10px] cursor-pointer font-medium text-[0.95rem] transition-all duration-200 hover:bg-white/5 hover:border-white/25 hover:text-white"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="py-3 px-7 bg-gradient-to-br from-yellow-200/20 to-amber-400/15 border-[1.5px] border-yellow-200/50 text-yellow-200 rounded-[10px] cursor-pointer font-semibold text-[0.95rem] transition-all duration-200 hover:bg-gradient-to-br hover:from-yellow-200/25 hover:to-amber-400/20 hover:border-yellow-200/60 hover:shadow-[0_0_20px_rgba(253,230,138,0.15)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                                onClick={handleCreateUser}
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ManageUsers;
