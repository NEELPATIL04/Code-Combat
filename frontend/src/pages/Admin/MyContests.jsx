import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyContests.css';

const mockContests = [
    { id: 1, title: 'Binary Search Challenge', status: 'active', participants: ['player1', 'player2'], difficulty: 'Medium', duration: 60 },
    { id: 2, title: 'Graph Traversal Battle', status: 'active', participants: ['player1'], difficulty: 'Hard', duration: 90 },
    { id: 3, title: 'Array Manipulation', status: 'upcoming', participants: [], difficulty: 'Easy', duration: 45 },
];

const MyContests = () => {
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [filter, setFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingContest, setEditingContest] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', difficulty: 'Medium', duration: 60, participants: [] });
    const [participantInput, setParticipantInput] = useState('');

    useEffect(() => {
        setTimeout(() => setContests(mockContests), 300);
    }, []);

    const filteredContests = filter === 'all' ? contests : contests.filter(c => c.status === filter);

    const openModal = (contest = null) => {
        if (contest) {
            setEditingContest(contest);
            setFormData({ ...contest });
        } else {
            setEditingContest(null);
            setFormData({ title: '', description: '', difficulty: 'Medium', duration: 60, participants: [] });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingContest(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addParticipant = () => {
        if (participantInput.trim() && !formData.participants.includes(participantInput.trim())) {
            setFormData(prev => ({ ...prev, participants: [...prev.participants, participantInput.trim()] }));
            setParticipantInput('');
        }
    };

    const removeParticipant = (p) => {
        setFormData(prev => ({ ...prev, participants: prev.participants.filter(x => x !== p) }));
    };

    const handleSave = () => {
        if (editingContest) {
            setContests(prev => prev.map(c => c.id === editingContest.id ? { ...c, ...formData } : c));
        } else {
            const newContest = { ...formData, id: Date.now(), status: 'upcoming' };
            setContests(prev => [...prev, newContest]);
        }
        closeModal();
    };

    const deleteContest = (id) => {
        if (confirm('Delete this contest?')) {
            setContests(prev => prev.filter(c => c.id !== id));
        }
    };

    return (
        <div className="dashboard-container">
            <nav className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-icon">⚔️</div>
                    <h2>CODE COMBAT</h2>
                </div>
                <ul className="sidebar-menu">
                    <li onClick={() => navigate('/admin-dashboard')}>
                        <span className="menu-icon">📊</span> Overview
                    </li>
                    <li className="active">
                        <span className="menu-icon">🏆</span> My Contests
                    </li>
                    <li><span className="menu-icon">📈</span> Leaderboard</li>
                    <li><span className="menu-icon">⚙️</span> Settings</li>
                </ul>
                <div className="sidebar-footer">
                    <button onClick={() => navigate('/')} className="logout-btn">
                        <span>🚪</span> LOGOUT
                    </button>
                </div>
            </nav>

            <main className="main-content">
                <header className="top-bar">
                    <div>
                        <h1>MY CONTESTS</h1>
                        <p className="subtitle">Manage your coding battles</p>
                    </div>
                    <button className="create-btn glow-btn" onClick={() => openModal()}>
                        <span>+</span> NEW CONTEST
                    </button>
                </header>

                <div className="filter-bar">
                    {['all', 'active', 'upcoming', 'completed'].map(f => (
                        <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
                            {f.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="contests-list">
                    {filteredContests.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📭</span>
                            <p>No contests found</p>
                            <button onClick={() => openModal()}>Create your first contest</button>
                        </div>
                    ) : (
                        filteredContests.map(contest => (
                            <div key={contest.id} className="contest-row animate-in">
                                <div className="contest-info">
                                    <span className={`status-dot ${contest.status}`}></span>
                                    <div>
                                        <h3>{contest.title}</h3>
                                        <span className={`difficulty ${contest.difficulty.toLowerCase()}`}>{contest.difficulty}</span>
                                    </div>
                                </div>
                                <div className="contest-stats">
                                    <div className="stat">
                                        <span className="stat-value">{contest.participants.length}</span>
                                        <span className="stat-label">Players</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-value">{contest.duration}m</span>
                                        <span className="stat-label">Duration</span>
                                    </div>
                                </div>
                                <div className="contest-actions">
                                    <button className="edit-btn" onClick={() => openModal(contest)}>✏️ Edit</button>
                                    <button className="delete-btn" onClick={() => deleteContest(contest.id)}>🗑️</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingContest ? 'EDIT CONTEST' : 'NEW CONTEST'}</h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Title</label>
                                <input name="title" value={formData.title} onChange={handleChange} placeholder="Contest title..." />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Difficulty</label>
                                    <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                                        <option>Easy</option>
                                        <option>Medium</option>
                                        <option>Hard</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Duration (min)</label>
                                    <input type="number" name="duration" value={formData.duration} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Participants</label>
                                <div className="participant-input">
                                    <input
                                        value={participantInput}
                                        onChange={e => setParticipantInput(e.target.value)}
                                        placeholder="Add username..."
                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
                                    />
                                    <button type="button" onClick={addParticipant}>ADD</button>
                                </div>
                                <div className="participants-list">
                                    {formData.participants.map(p => (
                                        <span key={p} className="participant-tag">
                                            {p} <button onClick={() => removeParticipant(p)}>×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={closeModal}>Cancel</button>
                            <button className="save-btn glow-btn" onClick={handleSave}>
                                {editingContest ? 'Save Changes' : 'Create Contest'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyContests;
