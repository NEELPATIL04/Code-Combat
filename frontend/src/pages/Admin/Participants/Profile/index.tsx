import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar, Trophy, FileText, TrendingUp } from 'lucide-react';
import AdminLayout from '../../../../components/layout/AdminLayout';

interface Contest {
    id: number;
    title: string;
    status: string;
    submissionsCount: number;
    score: number;
    date: string;
}

interface Participant {
    id: number;
    username: string;
    email: string;
    joinedAt: string;
    totalContests: number;
    totalSubmissions: number;
    successRate: number;
    contests: Contest[];
}

const mockParticipant: Participant = {
    id: 1,
    username: 'player1',
    email: 'player1@example.com',
    joinedAt: '2024-01-15',
    totalContests: 12,
    totalSubmissions: 45,
    successRate: 78,
    contests: [
        { id: 1, title: 'Binary Search Challenge', status: 'completed', submissionsCount: 5, score: 85, date: '2024-02-10' },
        { id: 2, title: 'Graph Traversal Battle', status: 'completed', submissionsCount: 3, score: 92, date: '2024-02-15' },
        { id: 3, title: 'Array Manipulation', status: 'active', submissionsCount: 2, score: 0, date: '2024-02-20' },
        { id: 4, title: 'Dynamic Programming', status: 'completed', submissionsCount: 4, score: 78, date: '2024-01-25' },
    ]
};

const ParticipantProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [participant, setParticipant] = useState<Participant | null>(null);

    useEffect(() => {
        setTimeout(() => setParticipant({ ...mockParticipant, id: Number(id) }), 300);
    }, [id]);

    const handleContestClick = (contestId: number) => {
        navigate(`/admin/participants/${id}/contest/${contestId}`);
    };

    if (!participant) return (
        <AdminLayout>
            <div className="p-12 text-center text-white/50">Loading...</div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="max-w-[1000px]">
                {/* Back Button */}
                <button
                    className="flex items-center gap-2 py-2.5 px-4.5 bg-transparent border border-white/10 text-white/70 rounded-full font-inherit text-[0.9rem] cursor-pointer mb-6 transition-all duration-200 hover:border-white/20 hover:text-white"
                    onClick={() => navigate('/admin/participants')}
                >
                    <ArrowLeft size={18} /> Back to Participants
                </button>

                {/* Profile Header */}
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-yellow-200/15 text-yellow-200 rounded-full flex items-center justify-center font-semibold text-[2rem]">
                        {participant.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-[1.75rem] font-semibold m-0 mb-3 bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                            {participant.username}
                        </h1>
                        <div className="flex gap-6 text-white/50 text-[0.9rem]">
                            <span className="flex items-center gap-2"><Mail size={14} /> {participant.email}</span>
                            <span className="flex items-center gap-2"><Calendar size={14} /> Joined {participant.joinedAt}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex gap-5 mb-8 max-md:flex-col">
                    <div className="flex-1 flex items-center gap-4 py-5 px-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-yellow-200">
                        <Trophy size={20} />
                        <div>
                            <span className="block text-2xl font-semibold text-white">{participant.totalContests}</span>
                            <span className="text-xs text-white/50 uppercase">Contests</span>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center gap-4 py-5 px-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-yellow-200">
                        <FileText size={20} />
                        <div>
                            <span className="block text-2xl font-semibold text-white">{participant.totalSubmissions}</span>
                            <span className="text-xs text-white/50 uppercase">Submissions</span>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center gap-4 py-5 px-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-yellow-200">
                        <TrendingUp size={20} />
                        <div>
                            <span className="block text-2xl font-semibold text-white">{participant.successRate}%</span>
                            <span className="text-xs text-white/50 uppercase">Success Rate</span>
                        </div>
                    </div>
                </div>

                {/* Assigned Contests Section */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">
                    <div className="flex justify-between items-center py-5 px-6 border-b border-white/[0.08]">
                        <h2 className="m-0 text-[1.1rem] font-medium text-white">Assigned Contests</h2>
                        <span className="text-[0.85rem] text-white/50">{participant.contests.length} contests</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-5 max-md:grid-cols-1">
                        {participant.contests.map(contest => (
                            <div
                                key={contest.id}
                                className="group bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 cursor-pointer transition-all duration-200 hover:border-yellow-200/30 hover:bg-yellow-200/[0.03]"
                                onClick={() => handleContestClick(contest.id)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="m-0 text-[1rem] font-medium text-white">{contest.title}</h3>
                                    <span className={`text-[0.7rem] py-1 px-2.5 rounded-full capitalize ${contest.status === 'completed'
                                            ? 'bg-emerald-500/15 text-emerald-500'
                                            : 'bg-blue-500/15 text-blue-400'
                                        }`}>
                                        {contest.status}
                                    </span>
                                </div>
                                <div className="flex gap-6 mb-4">
                                    <div>
                                        <span className="block text-[1.1rem] font-semibold text-white">{contest.submissionsCount}</span>
                                        <span className="text-[0.7rem] text-white/40 uppercase">Submissions</span>
                                    </div>
                                    <div>
                                        <span className="block text-[1.1rem] font-semibold text-white">{contest.score > 0 ? contest.score : '-'}</span>
                                        <span className="text-[0.7rem] text-white/40 uppercase">Score</span>
                                    </div>
                                    <div>
                                        <span className="block text-[1.1rem] font-semibold text-white">{contest.date}</span>
                                        <span className="text-[0.7rem] text-white/40 uppercase">Date</span>
                                    </div>
                                </div>
                                <div className="text-[0.85rem] text-yellow-200 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                    View Submissions →
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ParticipantProfile;
