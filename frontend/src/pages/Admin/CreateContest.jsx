import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateContest.css';

const CreateContest = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Medium',
        duration: 60,
        participants: []
    });
    const [participantInput, setParticipantInput] = useState('');
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addParticipant = () => {
        if (participantInput.trim()) {
            setFormData(prev => ({
                ...prev,
                participants: [...prev.participants, participantInput.trim()]
            }));
            setParticipantInput('');
        }
    };

    const removeParticipant = (index) => {
        setFormData(prev => ({
            ...prev,
            participants: prev.participants.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Contest created:', formData);
        alert('Contest created successfully!');
        navigate('/admin/my-contests');
    };

    return (
        <div className="dashboard-container">
            <nav className="sidebar">
                <div className="sidebar-header">
                    <h2>COMMAND CENTER</h2>
                </div>
                <ul className="sidebar-menu">
                    <li onClick={() => navigate('/admin-dashboard')}>Overview</li>
                    <li className="active">Create Contest</li>
                    <li onClick={() => navigate('/admin/my-contests')}>My Contests</li>
                    <li>Leaderboard</li>
                    <li>Settings</li>
                </ul>
                <div className="sidebar-footer">
                    <button onClick={() => navigate('/')} className="logout-btn">LOGOUT</button>
                </div>
            </nav>

            <main className="main-content">
                <header className="top-bar">
                    <h1>CREATE CONTEST</h1>
                </header>

                <form className="create-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3>CONTEST DETAILS</h3>

                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Binary Search Challenge"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the contest..."
                                rows={4}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Difficulty</label>
                                <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Duration (minutes)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    min={5}
                                    max={180}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>PARTICIPANTS</h3>
                        <div className="participant-input">
                            <input
                                type="text"
                                value={participantInput}
                                onChange={(e) => setParticipantInput(e.target.value)}
                                placeholder="Enter username to add"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
                            />
                            <button type="button" onClick={addParticipant} className="add-btn">ADD</button>
                        </div>

                        <div className="participants-list">
                            {formData.participants.length === 0 ? (
                                <p className="no-participants">No participants added yet</p>
                            ) : (
                                formData.participants.map((p, i) => (
                                    <div key={i} className="participant-tag">
                                        {p}
                                        <button type="button" onClick={() => removeParticipant(i)}>×</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>CANCEL</button>
                        <button type="submit" className="submit-btn" disabled={saving}>
                            {saving ? 'CREATING...' : 'CREATE CONTEST'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CreateContest;
