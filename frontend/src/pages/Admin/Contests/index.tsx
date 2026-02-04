import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import './Contests.css';

interface Contest {
    id: number;
    title: string;
    status: string;
    participants: string[];
    difficulty: string;
    duration: number;
}

interface FormData {
    title: string;
    difficulty: string;
    duration: number;
    participants: string[];
}

const mockContests: Contest[] = [
    { id: 1, title: 'Binary Search Challenge', status: 'active', participants: ['player1', 'player2'], difficulty: 'Medium', duration: 60 },
    { id: 2, title: 'Graph Traversal Battle', status: 'active', participants: ['player1'], difficulty: 'Hard', duration: 90 },
    { id: 3, title: 'Array Manipulation', status: 'upcoming', participants: [], difficulty: 'Easy', duration: 45 },
];

const Contests: React.FC = () => {
    const [contests, setContests] = useState<Contest[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingContest, setEditingContest] = useState<Contest | null>(null);
    const [formData, setFormData] = useState<FormData>({ title: '', difficulty: 'Medium', duration: 60, participants: [] });
    const [participantInput, setParticipantInput] = useState<string>('');

    useEffect(() => { setTimeout(() => setContests(mockContests), 300); }, []);

    const filteredContests = filter === 'all' ? contests : contests.filter(c => c.status === filter);

    const openModal = (contest: Contest | null = null) => {
        if (contest) { setEditingContest(contest); setFormData({ ...contest }); }
        else { setEditingContest(null); setFormData({ title: '', difficulty: 'Medium', duration: 60, participants: [] }); }
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingContest(null); };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'duration' ? Number(value) : value }));
    };

    const addParticipant = () => {
        if (participantInput.trim() && !formData.participants.includes(participantInput.trim())) {
            setFormData(prev => ({ ...prev, participants: [...prev.participants, participantInput.trim()] }));
            setParticipantInput('');
        }
    };

    const removeParticipant = (p: string) => setFormData(prev => ({ ...prev, participants: prev.participants.filter(x => x !== p) }));

    const handleSave = () => {
        if (editingContest) setContests(prev => prev.map(c => c.id === editingContest.id ? { ...c, ...formData } : c));
        else setContests(prev => [...prev, { ...formData, id: Date.now(), status: 'upcoming' }]);
        closeModal();
    };

    const deleteContest = (id: number) => { if (confirm('Delete this contest?')) setContests(prev => prev.filter(c => c.id !== id)); };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); addParticipant(); } };

    return (
        <AdminLayout>
            <div className="contests-content">
                <header className="page-header">
                    <div><h1>My Contests</h1><p className="page-subtitle">Create and manage coding battles</p></div>
                    <button className="create-btn" onClick={() => openModal()}><Plus size={18} /> New Contest</button>
                </header>

                <div className="filter-bar">
                    {['all', 'active', 'upcoming', 'completed'].map(f => (
                        <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="contests-list">
                    {filteredContests.length === 0 ? (
                        <div className="empty-state"><p>No contests found</p><button className="create-btn" onClick={() => openModal()}><Plus size={18} /> Create your first contest</button></div>
                    ) : filteredContests.map(contest => (
                        <div key={contest.id} className="contest-row">
                            <div className="contest-info"><span className={`status-dot ${contest.status}`}></span><div><h3>{contest.title}</h3><span className="difficulty">{contest.difficulty}</span></div></div>
                            <div className="contest-stats"><div className="stat"><span className="stat-value">{contest.participants.length}</span><span className="stat-label">Players</span></div><div className="stat"><span className="stat-value">{contest.duration}m</span><span className="stat-label">Duration</span></div></div>
                            <div className="contest-actions"><button className="icon-btn edit" onClick={() => openModal(contest)}><Edit2 size={16} /></button><button className="icon-btn delete" onClick={() => deleteContest(contest.id)}><Trash2 size={16} /></button></div>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>{editingContest ? 'Edit Contest' : 'New Contest'}</h2><button className="close-btn" onClick={closeModal}><X size={20} /></button></div>
                        <div className="modal-body">
                            <div className="form-group"><label>Title</label><input name="title" value={formData.title} onChange={handleChange} placeholder="Contest title..." /></div>
                            <div className="form-row">
                                <div className="form-group"><label>Difficulty</label><select name="difficulty" value={formData.difficulty} onChange={handleChange}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                                <div className="form-group"><label>Duration (min)</label><input type="number" name="duration" value={formData.duration} onChange={handleChange} /></div>
                            </div>
                            <div className="form-group">
                                <label>Participants</label>
                                <div className="participant-input"><input value={participantInput} onChange={(e) => setParticipantInput(e.target.value)} placeholder="Add username..." onKeyPress={handleKeyPress} /><button type="button" onClick={addParticipant}><Plus size={18} /></button></div>
                                <div className="participants-list">{formData.participants.map(p => (<span key={p} className="participant-tag">{p} <button onClick={() => removeParticipant(p)}><X size={14} /></button></span>))}</div>
                            </div>
                        </div>
                        <div className="modal-footer"><button className="cancel-btn" onClick={closeModal}>Cancel</button><button className="save-btn" onClick={handleSave}>{editingContest ? 'Save Changes' : 'Create Contest'}</button></div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Contests;
