import React, { useState, useEffect } from 'react';
import { Users, Trophy, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/layout/AdminLayout';

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
    const navigate = useNavigate();
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
            <div className="w-full">
                {/* Page Header */}
                <header className="mb-10">
                    <h1 className="text-4xl font-bold m-0 mb-2 bg-gradient-to-r from-yellow-200 to-yellow-600 bg-clip-text text-transparent tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-white/60 m-0 text-lg font-normal">Welcome back, Commander</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                    {/* Active Users */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-[20px] p-6 flex flex-col items-start gap-4 transition-all duration-300 ease-in-out backdrop-blur-[10px] relative overflow-hidden hover:-translate-y-1 hover:border-yellow-200/20 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
                        <div className="w-12 h-12 flex items-center justify-center bg-yellow-200/10 rounded-xl text-yellow-200 mb-2 flex-shrink-0">
                            <Users size={24} />
                        </div>
                        <div className="flex flex-col gap-2 w-full items-start justify-start">
                            <div className="text-4xl font-semibold text-white leading-none tracking-tight">
                                {stats.activeUsers.toLocaleString()}
                            </div>
                            <div className="text-base text-white/50 font-medium">Active Users</div>
                        </div>
                    </div>

                    {/* Total Contests */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-[20px] p-6 flex flex-col items-start gap-4 transition-all duration-300 ease-in-out backdrop-blur-[10px] relative overflow-hidden hover:-translate-y-1 hover:border-yellow-200/20 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
                        <div className="w-12 h-12 flex items-center justify-center bg-yellow-200/10 rounded-xl text-yellow-200 mb-2 flex-shrink-0">
                            <Trophy size={24} />
                        </div>
                        <div className="flex flex-col gap-2 w-full items-start justify-start">
                            <div className="text-4xl font-semibold text-white leading-none tracking-tight">
                                {stats.totalContests}
                            </div>
                            <div className="text-base text-white/50 font-medium">Total Contests</div>
                        </div>
                    </div>

                    {/* Submissions */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-[20px] p-6 flex flex-col items-start gap-4 transition-all duration-300 ease-in-out backdrop-blur-[10px] relative overflow-hidden hover:-translate-y-1 hover:border-yellow-200/20 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
                        <div className="w-12 h-12 flex items-center justify-center bg-yellow-200/10 rounded-xl text-yellow-200 mb-2 flex-shrink-0">
                            <FileText size={24} />
                        </div>
                        <div className="flex flex-col gap-2 w-full items-start justify-start">
                            <div className="text-4xl font-semibold text-white leading-none tracking-tight">
                                {stats.totalSubmissions.toLocaleString()}
                            </div>
                            <div className="text-base text-white/50 font-medium">Submissions</div>
                        </div>
                    </div>

                    {/* Success Rate */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-[20px] p-6 flex flex-col items-start gap-4 transition-all duration-300 ease-in-out backdrop-blur-[10px] relative overflow-hidden hover:-translate-y-1 hover:border-yellow-200/20 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
                        <div className="w-12 h-12 flex items-center justify-center bg-yellow-200/10 rounded-xl text-yellow-200 mb-2 flex-shrink-0">
                            <CheckCircle size={24} />
                        </div>
                        <div className="flex flex-col gap-2 w-full items-start justify-start">
                            <div className="text-4xl font-semibold text-white leading-none tracking-tight">
                                {stats.successRate}%
                            </div>
                            <div className="text-base text-white/50 font-medium">Success Rate</div>
                        </div>
                    </div>
                </div>

                {/* Recent Contests Section */}
                <div className="bg-[rgba(20,20,22,0.6)] border border-white/[0.08] rounded-3xl overflow-hidden backdrop-blur-xl">
                    {/* Section Header */}
                    <div className="py-6 px-8 border-b border-white/[0.08] flex justify-between items-center">
                        <h2 className="m-0 text-xl font-semibold text-white">Recent Contests</h2>
                        <button
                            onClick={() => navigate('/admin/contests')}
                            className="bg-transparent border border-white/10 text-white/70 py-2 px-4 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-white/5 hover:text-white hover:border-white/20"
                        >
                            View More
                        </button>
                    </div>

                    {/* Contests Table */}
                    <div className="p-0">
                        {/* Table Header */}
                        <div className="grid grid-cols-[2fr_1fr_1fr] gap-6 py-5 px-8 bg-white/[0.02] text-[0.85rem] font-semibold text-white/50 uppercase tracking-wider">
                            <span>Contest</span>
                            <span>Status</span>
                            <span>Participants</span>
                        </div>

                        {/* Table Rows */}
                        {recentContests.map(contest => (
                            <div
                                key={contest.id}
                                className="grid grid-cols-[2fr_1fr_1fr] gap-6 py-5 px-8 border-t border-white/5 items-center transition-colors duration-200 hover:bg-white/[0.03]"
                            >
                                <span className="font-medium text-base text-white/90">{contest.title}</span>
                                <span className={`text-xs py-1.5 px-4 rounded-full capitalize w-fit font-medium ${contest.status === 'active'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : contest.status === 'upcoming'
                                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                    }`}>
                                    {contest.status}
                                </span>
                                <span className="text-white/90">{contest.participants}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
