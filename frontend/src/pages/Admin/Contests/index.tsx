import React, { useState, useEffect, ChangeEvent } from 'react';
import { Plus, Edit2, Trash2, X, Play, Users } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
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
}

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
    const [selectedContestId, setSelectedContestId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
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

            // Fetch tasks for this contest
            let contestTasks: Task[] = [];
            try {
                console.log('Fetching tasks for contest ID:', contest.id);
                const data = await contestAPI.getById(contest.id);
                console.log('Received contest data:', data);
                contestTasks = data.contest.tasks || [];
                console.log('Contest tasks:', contestTasks);
            } catch (err) {
                console.error('Failed to load contest tasks:', err);
            }

            const formDataToSet = {
                title: contest.title,
                description: contest.description || '',
                difficulty: contest.difficulty,
                duration: contest.duration,
                startPassword: '',
                tasks: contestTasks,
            };
            console.log('Setting form data:', formDataToSet);
            setFormData(formDataToSet);
        } else {
            setEditingContest(null);
            setFormData({
                title: '',
                description: '',
                difficulty: 'Medium',
                duration: 60,
                startPassword: '',
                tasks: [],
            });
        }
        setShowModal(true);
        setError('');
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
        });
        setTaskInput({
            title: '',
            description: '',
            difficulty: 'Medium',
            maxPoints: 100,
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

    const addTask = () => {
        if (taskInput.title.trim() && taskInput.description.trim()) {
            setFormData(prev => ({
                ...prev,
                tasks: [...prev.tasks, { ...taskInput }]
            }));
            setTaskInput({
                title: '',
                description: '',
                difficulty: 'Medium',
                maxPoints: 100,
            });
        }
    };

    const removeTask = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tasks: prev.tasks.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
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

    return (
        <AdminLayout>
            <div className="max-w-[1000px]">
                {/* Page Header */}
                <header className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-semibold m-0 mb-2 bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                            My Contests
                        </h1>
                        <p className="text-white/50 m-0">Create and manage coding battles</p>
                    </div>
                    <button
                        className="flex items-center gap-2 py-3 px-6 bg-yellow-200/10 border border-yellow-200/30 text-yellow-200 rounded-full font-medium text-[0.9rem] cursor-pointer transition-all duration-200 hover:bg-yellow-200/20"
                        onClick={() => openModal()}
                    >
                        <Plus size={18} /> New Contest
                    </button>
                </header>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 flex justify-between items-center">
                        {error}
                        <button className="bg-transparent border-none text-red-500 cursor-pointer" onClick={() => setError('')}><X size={16} /></button>
                    </div>
                )}

                {/* Filter Bar */}
                <div className="flex gap-2 mb-6">
                    {['all', 'upcoming', 'active', 'completed'].map(f => (
                        <button
                            key={f}
                            className={`py-2 px-4.5 bg-transparent border border-white/10 rounded-full text-white/50 font-inherit text-[0.85rem] cursor-pointer transition-all duration-200 hover:border-white/20 hover:text-white ${filter === f ? 'bg-white/10 border-white/20 text-white' : ''
                                }`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Contests List */}
                <div className="flex flex-col gap-3">
                    {loading && contests.length === 0 ? (
                        <div className="text-center py-15 text-white/40"><p>Loading contests...</p></div>
                    ) : filteredContests.length === 0 ? (
                        <div className="text-center py-15 text-white/40">
                            <p>No contests found</p>
                            <button
                                className="mt-4 flex items-center gap-2 py-3 px-6 bg-yellow-200/10 border border-yellow-200/30 text-yellow-200 rounded-full font-medium text-[0.9rem] cursor-pointer mx-auto transition-all duration-200 hover:bg-yellow-200/20"
                                onClick={() => openModal()}
                            >
                                <Plus size={18} /> Create your first contest
                            </button>
                        </div>
                    ) : (
                        filteredContests.map(contest => (
                            <div key={contest.id} className="flex items-center justify-between py-5 px-6 bg-white/[0.02] border border-white/[0.08] rounded-xl transition-all duration-200 hover:border-white/15">
                                <div className="flex items-center gap-4">
                                    <span className={`w-2.5 h-2.5 rounded-full ${contest.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                            contest.status === 'upcoming' ? 'bg-amber-500' :
                                                'bg-gray-500'
                                        }`}></span>
                                    <div>
                                        <h3 className="text-[1rem] font-medium m-0 mb-1 text-white">{contest.title}</h3>
                                        <span className="text-[0.75rem] text-white/40 py-0.5 px-2 bg-white/5 rounded-full mr-2">
                                            {contest.difficulty}
                                        </span>
                                        {contest.isStarted && <span className="text-[0.7rem] py-0.5 px-2.5 bg-emerald-500/20 text-emerald-500 rounded-full font-semibold uppercase">Started</span>}
                                    </div>
                                </div>
                                <div className="flex gap-8">
                                    <div className="text-center">
                                        <span className="block text-[1.25rem] font-semibold text-yellow-200">{contest.participantCount || 0}</span>
                                        <span className="text-[0.7rem] text-white/40 uppercase">Players</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-[1.25rem] font-semibold text-yellow-200">{contest.taskCount || 0}</span>
                                        <span className="text-[0.7rem] text-white/40 uppercase">Tasks</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-[1.25rem] font-semibold text-yellow-200">{contest.duration}m</span>
                                        <span className="text-[0.7rem] text-white/40 uppercase">Duration</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!contest.isStarted && (
                                        <button
                                            className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
                                            onClick={() => startContest(contest.id)}
                                            title="Start Contest"
                                        >
                                            <Play size={16} />
                                        </button>
                                    )}
                                    <button
                                        className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 bg-blue-500/10 border border-blue-500/30 text-blue-500 hover:bg-blue-500/20"
                                        onClick={() => openParticipantModal(contest.id)}
                                        title="Add Participants"
                                    >
                                        <Users size={16} />
                                    </button>
                                    <button
                                        className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                                        onClick={() => openModal(contest)}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20"
                                        onClick={() => deleteContest(contest.id)}
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
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] animate-fade-in" onClick={closeModal}>
                    <div className="bg-[#1a1f2e] border border-white/10 rounded-xl w-[90%] max-w-[650px] max-h-[85vh] overflow-y-auto shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center py-6 px-7 border-b border-white/[0.08]">
                            <h2 className="m-0 text-[1.4rem] font-semibold text-white">{editingContest ? 'Edit Contest' : 'Create New Contest'}</h2>
                            <button className="bg-white/5 border-none text-white/60 cursor-pointer flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 hover:bg-white/10 hover:text-white" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-7">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3.5 rounded-[10px] mb-6 text-[0.9rem] flex items-center gap-2.5">
                                    {error}
                                </div>
                            )}

                            <div className="mb-6">
                                <label className="block mb-2.5 text-white/85 text-[0.9rem] font-semibold">Title *</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Contest title..."
                                    required
                                    className="w-full py-3.5 px-4 bg-white/[0.04] border-[1.5px] border-white/10 rounded-[10px] text-white font-inherit text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-yellow-200/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(253,230,138,0.1)] placeholder:text-white/35"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block mb-2.5 text-white/85 text-[0.9rem] font-semibold">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Contest description..."
                                    rows={3}
                                    className="w-full py-3.5 px-4 bg-white/[0.04] border-[1.5px] border-white/10 rounded-[10px] text-white font-inherit text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-yellow-200/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(253,230,138,0.1)] placeholder:text-white/35 resize-y min-h-[90px] leading-relaxed"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4.5 mb-6">
                                <div>
                                    <label className="block mb-2.5 text-white/85 text-[0.9rem] font-semibold">Difficulty</label>
                                    <select
                                        name="difficulty"
                                        value={formData.difficulty}
                                        onChange={handleChange}
                                        className="w-full py-3.5 px-4 bg-white/[0.04] border-[1.5px] border-white/10 rounded-[10px] text-white font-inherit text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-yellow-200/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(253,230,138,0.1)]"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-2.5 text-white/85 text-[0.9rem] font-semibold">Duration (min) *</label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                        className="w-full py-3.5 px-4 bg-white/[0.04] border-[1.5px] border-white/10 rounded-[10px] text-white font-inherit text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-yellow-200/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(253,230,138,0.1)]"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block mb-2.5 text-white/85 text-[0.9rem] font-semibold">Start Password (optional)</label>
                                <input
                                    type="password"
                                    name="startPassword"
                                    value={formData.startPassword}
                                    onChange={handleChange}
                                    placeholder="Password to start contest..."
                                    className="w-full py-3.5 px-4 bg-white/[0.04] border-[1.5px] border-white/10 rounded-[10px] text-white font-inherit text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-yellow-200/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(253,230,138,0.1)] placeholder:text-white/35"
                                />
                            </div>

                            <div className="mt-8 pt-7 border-t border-white/10">
                                <div className="flex justify-between items-center mb-4.5">
                                    <h3 className="m-0 text-[1.05rem] font-semibold text-white">Tasks</h3>
                                    {formData.tasks.length > 0 && (
                                        <span className="text-[0.85rem] text-white/50">{formData.tasks.length} task{formData.tasks.length !== 1 ? 's' : ''}</span>
                                    )}
                                </div>
                                <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 mb-4.5">
                                    <div className="mb-4">
                                        <input
                                            name="title"
                                            value={taskInput.title}
                                            onChange={handleTaskInputChange}
                                            placeholder="Task title..."
                                            className="w-full py-3.5 px-4 bg-white/[0.04] border-[1.5px] border-white/10 rounded-[10px] text-white font-inherit text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-yellow-200/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(253,230,138,0.1)] placeholder:text-white/35"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <textarea
                                            name="description"
                                            value={taskInput.description}
                                            onChange={handleTaskInputChange}
                                            placeholder="Task description..."
                                            rows={2}
                                            className="w-full py-3.5 px-4 bg-white/[0.04] border-[1.5px] border-white/10 rounded-[10px] text-white font-inherit text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-yellow-200/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(253,230,138,0.1)] placeholder:text-white/35 resize-y min-h-[90px] leading-relaxed"
                                        />
                                    </div>
                                    <div className="grid grid-cols-[1.2fr_120px] gap-3.5 items-end mb-4">
                                        <div>
                                            <select
                                                name="difficulty"
                                                value={taskInput.difficulty}
                                                onChange={handleTaskInputChange}
                                                className="w-full py-3.5 px-4 bg-white/[0.04] border-[1.5px] border-white/10 rounded-[10px] text-white font-inherit text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-yellow-200/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(253,230,138,0.1)]"
                                            >
                                                <option value="Easy">Easy</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Hard">Hard</option>
                                            </select>
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                name="maxPoints"
                                                value={taskInput.maxPoints}
                                                onChange={handleTaskInputChange}
                                                placeholder="Points"
                                                min="1"
                                                className="w-full py-3.5 px-4 bg-white/[0.04] border-[1.5px] border-white/10 rounded-[10px] text-white font-inherit text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-yellow-200/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(253,230,138,0.1)]"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addTask}
                                        className="py-2.5 px-4.5 bg-yellow-200/10 border-[1.5px] border-yellow-200/35 text-yellow-200 rounded-[10px] cursor-pointer flex items-center gap-2 font-inherit text-[0.88rem] font-semibold w-full justify-center transition-all duration-200 hover:bg-yellow-200/20 hover:border-yellow-200/45"
                                    >
                                        <Plus size={16} /> Add Task
                                    </button>
                                </div>

                                {formData.tasks.length > 0 && (
                                    <div className="flex flex-col gap-3 mt-4.5">
                                        {formData.tasks.map((task, index) => (
                                            <div key={index} className="flex justify-between items-start gap-3.5 p-4 bg-white/[0.04] border border-white/10 rounded-[10px] transition-all duration-200 hover:border-white/20 hover:bg-white/5">
                                                <div className="flex-1">
                                                    <strong className="text-yellow-200 text-[0.98rem] block mb-1">{task.title}</strong>
                                                    <span className="text-white/55 text-[0.82rem] font-normal"> - {task.difficulty} • {task.maxPoints} points</span>
                                                    <p className="mt-2 mb-0 text-white/65 text-[0.88rem] leading-relaxed">{task.description}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeTask(index)}
                                                    className="bg-red-500/10 border border-red-500/25 text-red-400 rounded-lg p-2 cursor-pointer flex transition-all duration-200 flex-shrink-0 hover:bg-red-500/20 hover:border-red-500/35"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : editingContest ? 'Update Contest' : 'Create Contest'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Participants Modal */}
            {showParticipantModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] animate-fade-in" onClick={() => setShowParticipantModal(false)}>
                    <div className="bg-[#1a1f2e] border border-white/10 rounded-xl w-[90%] max-w-[550px] max-h-[85vh] overflow-y-auto shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center py-6 px-7 border-b border-white/[0.08]">
                            <h2 className="m-0 text-[1.4rem] font-semibold text-white">Add Participants</h2>
                            <button className="bg-white/5 border-none text-white/60 cursor-pointer flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 hover:bg-white/10 hover:text-white" onClick={() => setShowParticipantModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-7">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3.5 rounded-[10px] mb-6 text-[0.9rem] flex items-center gap-2.5">
                                    {error}
                                </div>
                            )}

                            {allUsers.length === 0 ? (
                                <div className="text-center py-12 px-6 text-white/50">
                                    <p className="m-0 leading-relaxed">No players available. Create players in the Manage Users page first.</p>
                                </div>
                            ) : (
                                <div className="max-h-[420px] overflow-y-auto -m-2 p-2">
                                    {allUsers.map(user => (
                                        <label key={user.id} className="flex items-center gap-3.5 py-3.5 px-4 border-b border-white/5 cursor-pointer transition-all duration-200 rounded-lg hover:bg-white/[0.04] last:border-b-0">
                                            <input
                                                type="checkbox"
                                                checked={selectedUserIds.includes(user.id)}
                                                onChange={() => toggleUserSelection(user.id)}
                                                className="w-5 h-5 m-0 cursor-pointer accent-yellow-200"
                                            />
                                            <div className="flex-1 flex flex-col gap-1.5">
                                                <span className="text-white font-medium text-[0.95rem]">
                                                    {user.firstName && user.lastName
                                                        ? `${user.firstName} ${user.lastName}`
                                                        : user.username
                                                    }
                                                </span>
                                                <span className="text-white/50 text-[0.85rem]">{user.email}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3.5 py-6 px-7 border-t border-white/[0.08] bg-white/[0.02]">
                            <button
                                className="py-3 px-6 bg-transparent border-[1.5px] border-white/15 text-white/70 rounded-[10px] cursor-pointer font-medium text-[0.95rem] transition-all duration-200 hover:bg-white/5 hover:border-white/25 hover:text-white"
                                onClick={() => setShowParticipantModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="py-3 px-7 bg-gradient-to-br from-yellow-200/20 to-amber-400/15 border-[1.5px] border-yellow-200/50 text-yellow-200 rounded-[10px] cursor-pointer font-semibold text-[0.95rem] transition-all duration-200 hover:bg-gradient-to-br hover:from-yellow-200/25 hover:to-amber-400/20 hover:border-yellow-200/60 hover:shadow-[0_0_20px_rgba(253,230,138,0.15)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                                onClick={addParticipants}
                                disabled={selectedUserIds.length === 0 || loading}
                            >
                                {loading ? 'Adding...' : `Add ${selectedUserIds.length} Participant${selectedUserIds.length !== 1 ? 's' : ''}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Contests;
