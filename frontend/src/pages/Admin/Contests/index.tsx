import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

import { contestAPI, userAPI } from '../../../utils/api';
import { Contest, User, FormData } from './types';
import ContestList from './components/ContestList';
import ContestModal from './components/ContestModal';

const Contests: React.FC = () => {
    const [contests, setContests] = useState<Contest[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingContest, setEditingContest] = useState<Contest | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchingDetails, setFetchingDetails] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [modalInitialStep, setModalInitialStep] = useState<number>(1);

    // Form Data State
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        difficulty: 'Medium',
        duration: 60,
        startPassword: '',
        tasks: [],
        fullScreenMode: true,
        participants: [],
    });

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
            setUsers(data.users.filter((u: User) => u.role === 'player' && u.status === 'active'));
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const openModal = async (contest: Contest | null = null, initialStep: number = 1) => {
        setModalInitialStep(initialStep);
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
                participants: [],
            });

            // Fetch tasks and participants for this contest
            try {
                const data = await contestAPI.getById(contest.id);
                setFormData(prev => ({
                    ...prev,
                    tasks: data.contest.tasks || [],
                    participants: data.contest.participants?.map((p: any) => p.id) || []
                }));
            } catch (err) {
                console.error('Failed to load contest details:', err);
                setError('Failed to load contest details. Please try again.');
            } finally {
                setFetchingDetails(false);
            }
        } else {
            setEditingContest(null);
            setReadOnly(false);
            setFetchingDetails(false);
            setFormData({
                title: '',
                description: '',
                difficulty: 'Medium',
                duration: 60,
                startPassword: '',
                tasks: [],
                fullScreenMode: true,
                participants: [],
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
            participants: [],
        });
        setModalInitialStep(1);
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
        const contest = contests.find(c => c.id === contestId);
        if (contest) {
            openModal(contest, 3);
        }
    };

    const filteredContests = contests.filter(c => {
        if (filter === 'all') return true;
        return c.status === filter;
    });

    return (
        <div>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
                            My Contests
                        </h1>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#a1a1aa' }}>
                            Create and manage coding battles
                        </p>
                    </div>
                    <button
                        onClick={() => openModal()}
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
                        <Plus size={16} /> New Contest
                    </button>
                </header>

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

                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    {['all', 'active', 'upcoming', 'completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 16px',
                                background: filter === f ? '#27272a' : 'transparent',
                                border: filter === f ? 'none' : '1px solid #27272a',
                                borderRadius: '6px',
                                color: filter === f ? '#fafafa' : '#a1a1aa',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                <ContestList
                    contests={filteredContests}
                    loading={loading}
                    onCreate={() => openModal()}
                    onEdit={(c) => openModal(c)}
                    onDelete={deleteContest}
                    onStart={startContest}
                    onManageParticipants={openParticipantModal}
                    onView={(contest) => {
                        setEditingContest(contest);
                        setReadOnly(true);
                        setFetchingDetails(true);
                        setShowModal(true);
                        setFormData({
                            title: contest.title,
                            description: contest.description || '',
                            difficulty: contest.difficulty,
                            duration: contest.duration,
                            startPassword: '',
                            tasks: [],
                            fullScreenMode: contest.fullScreenMode !== undefined ? contest.fullScreenMode : true,
                        });
                        contestAPI.getById(contest.id).then(data => {
                            setFormData(prev => ({
                                ...prev,
                                tasks: data.contest.tasks || []
                            }));
                        }).catch(err => {
                            console.error('Failed to load contest tasks:', err);
                            setError('Failed to load contest tasks.');
                        }).finally(() => {
                            setFetchingDetails(false);
                        });
                    }}
                />
            </div>

            <ContestModal
                isOpen={showModal}
                onClose={closeModal}
                isEditing={!!editingContest}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
                loading={loading}
                fetchingDetails={fetchingDetails}
                initialStep={modalInitialStep}
            />
        </div>
    );
};

export default Contests;
