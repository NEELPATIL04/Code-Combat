import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const mockContests = [
    { id: 1, title: 'Binary Search Challenge', status: 'active', participants: 24, difficulty: 'Medium' },
    { id: 2, title: 'Graph Traversal Battle', status: 'active', participants: 18, difficulty: 'Hard' },
];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [stats, setStats] = useState({ activeUsers: 0, battlesRunning: 0, totalSubmissions: 0 });

    useEffect(() => {
        setTimeout(() => {
            setContests(mockContests);
            setStats({ activeUsers: 1204, battlesRunning: 2, totalSubmissions: 8502 });
        }, 500);
    }, []);

    return (
        <div className="dashboard-container">
            <nav className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-icon">⚔️</div>
                    <h2>CODE COMBAT</h2>
                </div>
                <ul className="sidebar-menu">
                    <li className="active">
                        <span className="menu-icon">📊</span> Overview
                    </li>
                    <li onClick={() => navigate('/admin/my-contests')}>
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
                        <h1>BATTLE CONTROL</h1>
                        <p className="subtitle">Welcome back, Commander</p>
                    </div>
                    <div className="user-profile">
                        <div className="avatar">👤</div>
                        <span>ADMIN</span>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card gradient-1">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.activeUsers.toLocaleString()}</div>
                            <div className="stat-label">Active Users</div>
                        </div>
                        <div className="stat-trend">▲ 12%</div>
                    </div>
                    <div className="stat-card gradient-2">
                        <div className="stat-icon">⚔️</div>
                        <div className="stat-content">
                            <div className="stat-value">{contests.length}</div>
                            <div className="stat-label">Active Contests</div>
                        </div>
                        <div className="stat-trend live">● LIVE</div>
                    </div>
                    <div className="stat-card gradient-3">
                        <div className="stat-icon">📝</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalSubmissions.toLocaleString()}</div>
                            <div className="stat-label">Submissions</div>
                        </div>
                        <div className="stat-trend">▲ 5%</div>
                    </div>
                </div>

                <div className="content-section">
                    <div className="section-header">
                        <h2>🔥 ACTIVE CONTESTS</h2>
                        <button className="view-all-btn" onClick={() => navigate('/admin/my-contests')}>
                            View All →
                        </button>
                    </div>
                    <div className="contests-grid">
                        {contests.map((contest, i) => (
                            <div key={contest.id} className="contest-card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="contest-header">
                                    <span className="live-badge">
                                        <span className="pulse-dot"></span> LIVE
                                    </span>
                                    <span className={`difficulty ${contest.difficulty.toLowerCase()}`}>
                                        {contest.difficulty}
                                    </span>
                                </div>
                                <h3>{contest.title}</h3>
                                <div className="contest-footer">
                                    <div className="participants-count">
                                        <span>👥</span> {contest.participants} participants
                                    </div>
                                    <button className="enter-btn" onClick={() => navigate(`/admin/contest/${contest.id}`)}>
                                        Manage →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
