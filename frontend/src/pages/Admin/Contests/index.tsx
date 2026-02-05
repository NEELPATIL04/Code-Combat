import React, { useState, useEffect, ChangeEvent } from 'react';
import { Plus, Edit2, Trash2, X, Play, Users } from 'lucide-react';

import { contestAPI, userAPI } from '../../../utils/api';

interface Contest {
    id: number;
    title: string;
    description?: string;
    status: string;
    difficulty: string;
    duration: number;
    participantCount?: number;
    taskCount?: number;
    isStarted: boolean;
    createdAt?: string;
}

interface Task {
    title: string;
    description: string;
    difficulty: string;
    maxPoints: number;
    allowedLanguages: string[];
}

const SUPPORTED_LANGUAGES = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' },
    { id: 'csharp', name: 'C#' },
    { id: 'go', name: 'Go' },
    { id: 'rust', name: 'Rust' },
];

interface User {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
}

interface FormData {
    title: string;
    description: string;
    difficulty: string;
    duration: number;
    startPassword: string;
    tasks: Task[];
}

const Contests: React.FC = () => {
    const [contests, setContests] = useState<Contest[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showParticipantModal, setShowParticipantModal] = useState<boolean>(false);
    const [editingContest, setEditingContest] = useState<Contest | null>(null);
    const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
    const [selectedContestId, setSelectedContestId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchingDetails, setFetchingDetails] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        difficulty: 'Medium',
        duration: 60,
        startPassword: '',
        tasks: [],
    });

    const [taskInput, setTaskInput] = useState<Task>({
        title: '',
        description: '',
        difficulty: 'Medium',
        maxPoints: 100,
        allowedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
    });

    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

    useEffect(() => {
        loadContests();
        loadUsers();
    }, []);

    const loadContests = async () => {
        try {
            setLoading(true);
            const data = await contestAPI.getAll();
            setContests(data.contests || []);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load contests');
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await userAPI.getAll();
            // Filter only players for participant selection
            const players = data.users.filter((u: User) => u.role === 'player');
            setAllUsers(players);
        } catch (err) {
            console.error('Failed to load users:', err);
        }
    };

    const filteredContests = filter === 'all' ? contests : contests.filter(c => c.status === filter);

    const openModal = async (contest: Contest | null = null) => {
        if (contest) {
            console.log('Opening modal for contest:', contest);
            setEditingContest(contest);
            setFetchingDetails(true);
            setShowModal(true); // Show modal immediately with loading state

            // Initialize form with basic info first
            setFormData({
                title: contest.title,
                description: contest.description || '',
                difficulty: contest.difficulty,
                duration: contest.duration,
                startPassword: '',
                tasks: [], // Empty initially while fetching
            });

            // Fetch tasks for this contest
            try {
                console.log('Fetching tasks for contest ID:', contest.id);
                const data = await contestAPI.getById(contest.id);
                console.log('Received contest data:', data);

                // Update form with fetched tasks
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
            });
            setShowModal(true);
            setError('');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingContest(null);
        setEditingTaskIndex(null);
        setFormData({
            title: '',
            description: '',
            difficulty: 'Medium',
            duration: 60,
            startPassword: '',
            tasks: [],
        });
        setTaskInput({
            title: '',
            description: '',
            difficulty: 'Medium',
            maxPoints: 100,
            allowedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
        });
        setError('');
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'duration' ? Number(value) : value
        }));
    };

    const handleTaskInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTaskInput(prev => ({
            ...prev,
            [name]: name === 'maxPoints' ? Number(value) : value
        }));
    };

    const toggleLanguage = (langId: string) => {
        setTaskInput(prev => ({
            ...prev,
            allowedLanguages: prev.allowedLanguages.includes(langId)
                ? prev.allowedLanguages.filter(l => l !== langId)
                : [...prev.allowedLanguages, langId]
        }));
    };

    const addTask = () => {
        if (taskInput.title.trim() && taskInput.description.trim()) {
            setFormData(prev => {
                const newTasks = [...prev.tasks];
                if (editingTaskIndex !== null) {
                    newTasks[editingTaskIndex] = { ...taskInput };
                } else {
                    newTasks.push({ ...taskInput });
                }
                return { ...prev, tasks: newTasks };
            });

            setTaskInput({
                title: '',
                description: '',
                difficulty: 'Medium',
                maxPoints: 100,
                allowedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
            });
            setEditingTaskIndex(null);
        }
    };

    const editTask = (index: number) => {
        const taskToEdit = formData.tasks[index];
        setTaskInput({ ...taskToEdit });
        setEditingTaskIndex(index);
    };

    const removeTask = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tasks: prev.tasks.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        // Check for unsaved task input
        if (taskInput.title.trim() || taskInput.description.trim()) {
            setError('You have entered task details but not added the task. Please click "Add Task" first to include it.');
            return;
        }

        try {
            if (!formData.title.trim()) {
                setError('Contest title is required');
                return;
            }

            setError('');
            setLoading(true);

            const contestData = {
                title: formData.title,
                description: formData.description,
                difficulty: formData.difficulty,
                duration: formData.duration,
                startPassword: formData.startPassword || undefined,
                contestTasks: formData.tasks,
                participantIds: [],
            };

            console.log('Saving contest data:', contestData);
            console.log('Is editing?', !!editingContest);

            if (editingContest) {
                const response = await contestAPI.update(editingContest.id, contestData);
                console.log('Update response:', response);
                alert('Contest updated successfully!');
            } else {
                const response = await contestAPI.create(contestData);
                console.log('Create response:', response);
                alert('Contest created successfully!');
            }

            await loadContests();
            closeModal();
        } catch (err) {
            console.error('Save error:', err);
            setError(err instanceof Error ? err.message : 'Failed to save contest');
        } finally {
            setLoading(false);
        }
    };

    const deleteContest = async (id: number) => {
        if (!confirm('Delete this contest? This will also delete all associated tasks and participant assignments.')) return;

        try {
            await contestAPI.delete(id);
            await loadContests();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete contest');
        }
    };

    const startContest = async (id: number) => {
        if (!confirm('Start this contest? Participants will be able to begin.')) return;

        try {
            await contestAPI.start(id);
            await loadContests();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start contest');
        }
    };

    const openParticipantModal = (contestId: number) => {
        setSelectedContestId(contestId);
        setSelectedUserIds([]);
        setShowParticipantModal(true);
        setError('');
    };

    const toggleUserSelection = (userId: number) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const addParticipants = async () => {
        if (!selectedContestId || selectedUserIds.length === 0) {
            setError('Please select at least one participant');
            return;
        }

        try {
            setLoading(true);
            await contestAPI.addParticipants(selectedContestId, selectedUserIds);
            setShowParticipantModal(false);
            setSelectedUserIds([]);
            await loadContests();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add participants');
        } finally {
            setLoading(false);
        }
    };

    return (<div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loading && contests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255, 255, 255, 0.4)' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            border: '2px solid rgba(253, 230, 138, 0.2)',
                            borderTopColor: '#FDE68A',
                            borderRadius: '50%',
                            margin: '0 auto 16px',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <p>Loading contests...</p>
                    </div>
                ) : filteredContests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255, 255, 255, 0.4)' }}>
                        <p>No contests found</p>
                        <button
                            onClick={() => openModal()}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '16px',
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
                            <Plus size={18} /> Create your first contest
                        </button>
                    </div>
                ) : (
                    filteredContests.map(contest => (
                        <div
                            key={contest.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '20px 24px',
                                background: 'rgba(20, 20, 22, 0.6)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '16px',
                                transition: 'border-color 0.2s ease'
                            }}
                        >
                            {/* Left: Status dot + Title + Difficulty */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '300px' }}>
                                <span style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    flexShrink: 0,
                                    background: contest.status === 'active' ? '#10b981'
                                        : contest.status === 'upcoming' ? '#FBBF24'
                                            : '#6b7280',
                                    boxShadow: contest.status === 'active' ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none'
                                }}></span>
                                <div>
                                    <h3 style={{
                                        margin: 0,
                                        marginBottom: '6px',
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        color: '#ffffff'
                                    }}>
                                        {contest.title}
                                    </h3>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        background: contest.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.15)'
                                            : contest.difficulty === 'Medium' ? 'rgba(16, 185, 129, 0.15)'
                                                : 'rgba(239, 68, 68, 0.15)',
                                        border: contest.difficulty === 'Easy' ? '1px solid rgba(16, 185, 129, 0.3)'
                                            : contest.difficulty === 'Medium' ? '1px solid rgba(16, 185, 129, 0.3)'
                                                : '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '100px',
                                        fontSize: '0.7rem',
                                        fontWeight: 500,
                                        color: contest.difficulty === 'Easy' ? '#10b981'
                                            : contest.difficulty === 'Medium' ? '#10b981'
                                                : '#ef4444'
                                    }}>
                                        {contest.difficulty}
                                    </span>
                                    {contest.isStarted && (
                                        <span style={{
                                            marginLeft: '8px',
                                            display: 'inline-block',
                                            padding: '4px 12px',
                                            background: 'rgba(16, 185, 129, 0.2)',
                                            borderRadius: '100px',
                                            fontSize: '0.65rem',
                                            fontWeight: 600,
                                            color: '#10b981',
                                            textTransform: 'uppercase'
                                        }}>
                                            Started
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Middle: Stats */}
                            <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <span style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 600,
                                        color: '#ffffff'
                                    }}>
                                        {contest.participantCount || 0}
                                    </span>
                                    <span style={{
                                        marginLeft: '4px',
                                        fontSize: '0.7rem',
                                        color: 'rgba(255, 255, 255, 0.4)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        Players
                                    </span>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <span style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 600,
                                        color: '#FBBF24'
                                    }}>
                                        {contest.duration}m
                                    </span>
                                    <span style={{
                                        marginLeft: '4px',
                                        fontSize: '0.7rem',
                                        color: 'rgba(255, 255, 255, 0.4)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        Duration
                                    </span>
                                </div>
                            </div>

                            {/* Right: Action Buttons */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {!contest.isStarted && (
                                    <button
                                        onClick={() => startContest(contest.id)}
                                        title="Start Contest"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                            borderRadius: '10px',
                                            color: '#10b981',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Play size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={() => openParticipantModal(contest.id)}
                                    title="Add Participants"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        border: '1px solid rgba(59, 130, 246, 0.3)',
                                        borderRadius: '10px',
                                        color: '#3b82f6',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Users size={16} />
                                </button>
                                <button
                                    onClick={() => openModal(contest)}
                                    title="Edit Contest"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '10px',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => deleteContest(contest.id)}
                                    title="Delete Contest"
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
                    ))
                )}
            </div>
        </div>


        {/* Contest Modal */}
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
                        background: 'rgba(15, 19, 24, 0.98)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        width: '90%',
                        maxWidth: '650px',
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
                            {editingContest ? 'Edit Contest' : 'Create New Contest'}
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

                    {fetchingDetails ? (
                        <div style={{ padding: '48px', textAlign: 'center' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                border: '2px solid rgba(253, 230, 138, 0.2)',
                                borderTopColor: '#FDE68A',
                                borderRadius: '50%',
                                margin: '0 auto 16px',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading contest details...</p>
                        </div>
                    ) : (
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

                            {/* Title */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem', fontWeight: 600 }}>
                                    Title *
                                </label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Contest title..."
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        border: '1.5px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '10px',
                                        color: '#ffffff',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem', fontWeight: 600 }}>
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Contest description..."
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        border: '1.5px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '10px',
                                        color: '#ffffff',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        resize: 'vertical',
                                        minHeight: '90px'
                                    }}
                                />
                            </div>

                            {/* Difficulty & Duration */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem', fontWeight: 600 }}>
                                        Difficulty
                                    </label>
                                    <select
                                        name="difficulty"
                                        value={formData.difficulty}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px',
                                            background: '#1e2433',
                                            border: '1.5px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '10px',
                                            color: '#ffffff',
                                            fontSize: '0.95rem',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="Easy" style={{ background: '#1e2433', color: '#ffffff' }}>Easy</option>
                                        <option value="Medium" style={{ background: '#1e2433', color: '#ffffff' }}>Medium</option>
                                        <option value="Hard" style={{ background: '#1e2433', color: '#ffffff' }}>Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem', fontWeight: 600 }}>
                                        Duration (min) *
                                    </label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px',
                                            background: 'rgba(255, 255, 255, 0.04)',
                                            border: '1.5px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '10px',
                                            color: '#ffffff',
                                            fontSize: '0.95rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Start Password */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem', fontWeight: 600 }}>
                                    Start Password (optional)
                                </label>
                                <input
                                    type="password"
                                    name="startPassword"
                                    value={formData.startPassword}
                                    onChange={handleChange}
                                    placeholder="Password to start contest..."
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        border: '1.5px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '10px',
                                        color: '#ffffff',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Tasks Section */}
                            <div style={{ marginTop: '32px', paddingTop: '28px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#ffffff' }}>Tasks</h3>
                                    {formData.tasks.length > 0 && (
                                        <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                                            {formData.tasks.length} task{formData.tasks.length !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>

                                {/* Task Input Form */}
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    marginBottom: '18px'
                                }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <input
                                            name="title"
                                            value={taskInput.title}
                                            onChange={handleTaskInputChange}
                                            placeholder="Task title..."
                                            style={{
                                                width: '100%',
                                                padding: '14px 16px',
                                                background: 'rgba(255, 255, 255, 0.04)',
                                                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '10px',
                                                color: '#ffffff',
                                                fontSize: '0.95rem',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <textarea
                                            name="description"
                                            value={taskInput.description}
                                            onChange={handleTaskInputChange}
                                            placeholder="Task description..."
                                            rows={2}
                                            style={{
                                                width: '100%',
                                                padding: '14px 16px',
                                                background: 'rgba(255, 255, 255, 0.04)',
                                                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '10px',
                                                color: '#ffffff',
                                                fontSize: '0.95rem',
                                                outline: 'none',
                                                resize: 'vertical',
                                                minHeight: '70px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '14px', marginBottom: '16px' }}>
                                        <select
                                            name="difficulty"
                                            value={taskInput.difficulty}
                                            onChange={handleTaskInputChange}
                                            style={{
                                                width: '100%',
                                                padding: '14px 16px',
                                                background: '#1e2433',
                                                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '10px',
                                                color: '#ffffff',
                                                fontSize: '0.95rem',
                                                outline: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="Easy" style={{ background: '#1e2433', color: '#ffffff' }}>Easy</option>
                                            <option value="Medium" style={{ background: '#1e2433', color: '#ffffff' }}>Medium</option>
                                            <option value="Hard" style={{ background: '#1e2433', color: '#ffffff' }}>Hard</option>
                                        </select>
                                        <input
                                            type="number"
                                            name="maxPoints"
                                            value={taskInput.maxPoints}
                                            onChange={handleTaskInputChange}
                                            placeholder="Points"
                                            min="1"
                                            style={{
                                                width: '100%',
                                                padding: '14px 16px',
                                                background: 'rgba(255, 255, 255, 0.04)',
                                                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '10px',
                                                color: '#ffffff',
                                                fontSize: '0.95rem',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    {/* Allowed Languages */}
                                    <div style={{ marginBottom: '18px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', fontWeight: 500 }}>
                                            Allowed Languages
                                        </label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {SUPPORTED_LANGUAGES.map(lang => (
                                                <button
                                                    key={lang.id}
                                                    type="button"
                                                    onClick={() => toggleLanguage(lang.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '100px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                        border: taskInput.allowedLanguages.includes(lang.id)
                                                            ? '1px solid rgba(253, 230, 138, 0.5)'
                                                            : '1px solid rgba(255, 255, 255, 0.1)',
                                                        background: taskInput.allowedLanguages.includes(lang.id)
                                                            ? 'rgba(253, 230, 138, 0.2)'
                                                            : 'rgba(255, 255, 255, 0.05)',
                                                        color: taskInput.allowedLanguages.includes(lang.id)
                                                            ? '#FDE68A'
                                                            : 'rgba(255, 255, 255, 0.5)'
                                                    }}
                                                >
                                                    {lang.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addTask}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '10px 18px',
                                            background: 'rgba(253, 230, 138, 0.1)',
                                            border: '1.5px solid rgba(253, 230, 138, 0.35)',
                                            borderRadius: '10px',
                                            color: '#FDE68A',
                                            fontSize: '0.88rem',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {editingTaskIndex !== null ? <><Edit2 size={16} /> Update Task</> : <><Plus size={16} /> Add Task</>}
                                    </button>
                                </div>

                                {/* Task List */}
                                {formData.tasks.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '18px' }}>
                                        {formData.tasks.map((task, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    gap: '14px',
                                                    padding: '16px',
                                                    background: 'rgba(255, 255, 255, 0.04)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '10px'
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                        <strong style={{ color: '#FDE68A', fontSize: '0.98rem' }}>{task.title}</strong>
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            padding: '2px 8px',
                                                            borderRadius: '100px',
                                                            fontWeight: 500,
                                                            background: task.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.2)'
                                                                : task.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.2)'
                                                                    : 'rgba(239, 68, 68, 0.2)',
                                                            color: task.difficulty === 'Easy' ? '#34d399'
                                                                : task.difficulty === 'Medium' ? '#fbbf24'
                                                                    : '#f87171'
                                                        }}>
                                                            {task.difficulty}
                                                        </span>
                                                    </div>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500, marginBottom: '8px' }}>
                                                        {task.maxPoints} points
                                                    </span>
                                                    <p style={{ margin: '0 0 12px', color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                        {task.description}
                                                    </p>

                                                    {task.allowedLanguages && task.allowedLanguages.length > 0 && (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                                            {task.allowedLanguages.map(langId => (
                                                                <span
                                                                    key={langId}
                                                                    style={{
                                                                        padding: '2px 8px',
                                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.65rem',
                                                                        color: 'rgba(255, 255, 255, 0.6)'
                                                                    }}
                                                                >
                                                                    {SUPPORTED_LANGUAGES.find(l => l.id === langId)?.name || langId}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => editTask(index)}
                                                        title="Edit Task"
                                                        style={{
                                                            padding: '8px',
                                                            background: 'rgba(253, 230, 138, 0.1)',
                                                            border: '1px solid rgba(253, 230, 138, 0.25)',
                                                            borderRadius: '8px',
                                                            color: '#FDE68A',
                                                            cursor: 'pointer',
                                                            display: 'flex'
                                                        }}
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => removeTask(index)}
                                                        title="Remove Task"
                                                        style={{
                                                            padding: '8px',
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            border: '1px solid rgba(239, 68, 68, 0.25)',
                                                            borderRadius: '8px',
                                                            color: '#f87171',
                                                            cursor: 'pointer',
                                                            display: 'flex'
                                                        }}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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
                            onClick={handleSave}
                            disabled={loading || fetchingDetails}
                            style={{
                                padding: '12px 28px',
                                background: 'rgba(253, 230, 138, 0.15)',
                                border: '1.5px solid rgba(253, 230, 138, 0.5)',
                                borderRadius: '10px',
                                color: '#FDE68A',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                cursor: loading || fetchingDetails ? 'not-allowed' : 'pointer',
                                opacity: loading || fetchingDetails ? 0.5 : 1
                            }}
                        >
                            {loading ? 'Saving...' : editingContest ? 'Update Contest' : 'Create Contest'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Add Participants Modal */}
        {showParticipantModal && (
            <div
                onClick={() => setShowParticipantModal(false)}
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
                            onClick={() => setShowParticipantModal(false)}
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

                        {allUsers.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'rgba(255, 255, 255, 0.5)' }}>
                                <p style={{ margin: 0, lineHeight: 1.6 }}>
                                    No players available. Create players in the Manage Users page first.
                                </p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                {allUsers.map(user => (
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
                                            onChange={() => toggleUserSelection(user.id)}
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
                            onClick={() => setShowParticipantModal(false)}
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
                            onClick={addParticipants}
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
        )}

    </div>);
};

export default Contests;
