import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

import { contestAPI, userAPI } from '../../../utils/api';
import { Contest, User, FormData } from './types';
import ContestList from './components/ContestList';
import ParticipantsModal from './components/ParticipantsModal';
import ContestModal from './components/ContestModal';

const Contests: React.FC = () => {
    const [contests, setContests] = useState<Contest[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showParticipantModal, setShowParticipantModal] = useState<boolean>(false);
    const [editingContest, setEditingContest] = useState<Contest | null>(null);
    const [selectedContestId, setSelectedContestId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchingDetails, setFetchingDetails] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Form Data State
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        difficulty: 'Medium',
        duration: 60,
        startPassword: '',
        tasks: [],
        fullScreenMode: true,
    });

    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

    useEffect(() => {
        loadContests();
        loadUsers();
    }, []);

    const loadContests = async () => {
        setLoading(true);
        try {
            const data = await contestAPI.getAll();
            setContests(data.contests);
            setError('');
        } catch (err) {
            console.error('Failed to load contests:', err);
            setError('Failed to load contests. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await userAPI.getAll();
            setAllUsers(data.users.filter((u: User) => u.role === 'student'));
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const openModal = async (contest: Contest | null = null) => {
        if (contest) {
            setEditingContest(contest);
            setFetchingDetails(true);
            setShowModal(true);

            // Initialize form with basic info first
            setFormData({
                title: contest.title,
                description: contest.description || '',
                difficulty: contest.difficulty,
                duration: contest.duration,
                startPassword: '',
                tasks: [],
                fullScreenMode: contest.fullScreenMode !== undefined ? contest.fullScreenMode : true,
            });

            // Fetch tasks for this contest
            try {
                const data = await contestAPI.getById(contest.id);
                setFormData(prev => ({
                    ...prev,
                    tasks: data.contest.tasks || []
                }));
            } catch (err) {
                console.error('Failed to load contest tasks:', err);
                setError('Failed to load contest tasks. Please try again.');
            } finally {
                setFetchingDetails(false);
            }
        } else {
            setEditingContest(null);
            setFetchingDetails(false);
            setFormData({
                title: '',
                description: '',
                difficulty: 'Medium',
                duration: 60,
                startPassword: '',
                tasks: [],
                fullScreenMode: true,
            });
            setShowModal(true);
            setError('');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingContest(null);
        setFormData({
            title: '',
            description: '',
            difficulty: 'Medium',
            duration: 60,
            startPassword: '',
            tasks: [],
            fullScreenMode: true,
        });
        setError('');
    };

    const handleSave = async () => {
        if (!formData.title || !formData.duration) {
            alert('Please fill in valid Title and Duration');
            return;
        }

        setLoading(true);
        try {
            if (editingContest) {
                await contestAPI.update(editingContest.id, formData);
            } else {
                await contestAPI.create(formData);
            }
            closeModal();
            loadContests();
        } catch (err: any) {
            console.error('Failed to save contest:', err);
            setError(err.response?.data?.message || 'Failed to save contest');
        } finally {
            setLoading(false);
        }
    };

    const deleteContest = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this contest?')) {
            try {
                await contestAPI.delete(id);
                loadContests();
            } catch (err) {
                console.error('Failed to delete contest:', err);
                setError('Failed to delete contest');
            }
        }
    };

    const startContest = async (id: number) => {
        if (window.confirm('Are you sure you want to start this contest? This will make it active for all participants.')) {
            try {
                await contestAPI.start(id);
                loadContests();
            } catch (err) {
                console.error('Failed to start contest:', err);
                setError('Failed to start contest');
            }
        }
    };

    const openParticipantModal = (contestId: number) => {
        setSelectedContestId(contestId);
        setSelectedUserIds([]);
        setShowParticipantModal(true);
    };

    const toggleUserSelection = (userId: number) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const addParticipants = async () => {
        if (!selectedContestId || selectedUserIds.length === 0) return;

        setLoading(true);
        try {
            await contestAPI.addParticipants(selectedContestId, selectedUserIds);
            setShowParticipantModal(false);
            setSelectedUserIds([]);
            loadContests(); // Refresh stats
        } catch (err) {
            console.error('Failed to add participants:', err);
            setError('Failed to add participants');
        } finally {
            setLoading(false);
        }
    };

    const filteredContests = contests.filter(c => {
        if (filter === 'all') return true;
        return c.status === filter;
    });

    return (
        <div>
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
                            fontSize: '2rem',
                            fontWeight: 600,
                            margin: 0,
                            marginBottom: '8px',
                            color: '#ffffff'
                        }}>
                            My Contests
                        </h1>
                        <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.5)' }}>
                            Create and manage coding battles
                        </p>
                    </div>
                    <button
                        onClick={() => openModal()}
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
                        <Plus size={18} /> New Contest
                    </button>
                </header>

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

                {/* Filter Bar */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    {['all', 'active', 'upcoming', 'completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 20px',
                                background: filter === f ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                border: filter === f ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '100px',
                                color: filter === f ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Contests List */}
                <ContestList
                    contests={filteredContests}
                    loading={loading}
                    onCreate={() => openModal()}
                    onEdit={openModal}
                    onDelete={deleteContest}
                    onStart={startContest}
                    onManageParticipants={openParticipantModal}
                />
            </div>

            {/* Create/Edit Contest Modal */}
            <ContestModal
                isOpen={showModal}
                onClose={closeModal}
                isEditing={!!editingContest}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
                loading={loading}
                fetchingDetails={fetchingDetails}
            />

            {/* Add Participants Modal */}
            <ParticipantsModal
                isOpen={showParticipantModal}
                onClose={() => setShowParticipantModal(false)}
                users={allUsers}
                selectedUserIds={selectedUserIds}
                onToggleSelection={toggleUserSelection}
                onAdd={addParticipants}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default Contests;
