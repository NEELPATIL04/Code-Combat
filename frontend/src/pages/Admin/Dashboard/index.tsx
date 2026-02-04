import React, { useState, useEffect } from 'react';
import { Users, Trophy, FileText, CheckCircle } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import './Dashboard.css';

interface Contest {
    id: number;
    title: string;
    status: string;
    participants: number;
}

interface Stats {
    activeUsers: number;
    totalContests: number;
    totalSubmissions: number;
    successRate: number;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats>({ activeUsers: 0, totalContests: 0, totalSubmissions: 0, successRate: 0 });
    const [recentContests, setRecentContests] = useState<Contest[]>([]);

    useEffect(() => {
        setTimeout(() => {
            setStats({ activeUsers: 1204, totalContests: 15, totalSubmissions: 8502, successRate: 72 });
            setRecentContests([
                { id: 1, title: 'Binary Search Challenge', status: 'active', participants: 24 },
                { id: 2, title: 'Graph Traversal Battle', status: 'active', participants: 18 },
                { id: 3, title: 'Array Manipulation', status: 'upcoming', participants: 0 },
            ]);
        }, 300);
    }, []);

    return (
        <AdminLayout>
            <div className="dashboard-content">
                <header className="page-header">
                    <h1>Dashboard</h1>
                    <p className="page-subtitle">Welcome back, Commander</p>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon"><Users size={24} /></div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.activeUsers.toLocaleString()}</div>
                            <div className="stat-label">Active Users</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><Trophy size={24} /></div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.totalContests}</div>
                            <div className="stat-label">Total Contests</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><FileText size={24} /></div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.totalSubmissions.toLocaleString()}</div>
                            <div className="stat-label">Submissions</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><CheckCircle size={24} /></div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.successRate}%</div>
                            <div className="stat-label">Success Rate</div>
                        </div>
                    </div>
                </div>

                <div className="section">
                    <div className="section-header"><h2>Recent Contests</h2></div>
                    <div className="contests-table">
                        <div className="table-header">
                            <span>Contest</span>
                            <span>Status</span>
                            <span>Participants</span>
                        </div>
                        {recentContests.map(contest => (
                            <div key={contest.id} className="table-row">
                                <span className="contest-title">{contest.title}</span>
                                <span className={`status-badge ${contest.status}`}>{contest.status}</span>
                                <span>{contest.participants}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
