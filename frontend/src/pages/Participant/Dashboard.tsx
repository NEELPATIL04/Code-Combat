import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Trophy, Play, Lock, LogOut } from 'lucide-react';
import { contestAPI } from '../../utils/api';

interface Contest {
    id: number;
    title: string;
    description?: string;
    status: string;
    difficulty: string;
    duration: number;
    isStarted: boolean;
    hasStarted?: boolean;
    startedAt?: string;
    score?: number;
    startPassword?: string;
}

const ParticipantDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
    const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
    const [password, setPassword] = useState<string>('');

    useEffect(() => {
        loadMyContests();
    }, []);

    const loadMyContests = async () => {
        try {
            setLoading(true);
            const data = await contestAPI.getMyContests();
            setContests(data.contests || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load contests');
        } finally {
            setLoading(false);
        }
    };

    const handleStartContest = (contest: Contest) => {
        // Check if contest is started by admin
        if (!contest.isStarted) {
            alert('This contest has not been started yet. Please wait for the admin to start it.');
            return;
        }

        // If contest has password, show password modal
        if (contest.startPassword && !contest.hasStarted) {
            setSelectedContest(contest);
            setShowPasswordModal(true);
        } else {
            // Navigate to contest tasks
            navigate(`/contest/${contest.id}`);
        }
    };

    const handlePasswordSubmit = async () => {
        if (!selectedContest) return;

        try {
            // Verify password on backend (you'll need to implement this endpoint)
            // For now, just navigate to the contest
            setShowPasswordModal(false);
            navigate(`/contest/${selectedContest.id}`);
        } catch (err) {
            setError('Invalid password');
        }
    };

    const getDifficultyColorClass = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'bg-emerald-500';
            case 'Medium': return 'bg-amber-500';
            case 'Hard': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusBadge = (contest: Contest) => {
        if (!contest.isStarted) {
            return <span className="py-1 px-3 rounded-md text-xs font-semibold uppercase bg-white/10 text-white/50">Not Started</span>;
        } else if (contest.hasStarted) {
            return <span className="py-1 px-3 rounded-md text-xs font-semibold uppercase bg-yellow-400/20 text-yellow-400">In Progress</span>;
        } else if (contest.status === 'completed') {
            return <span className="py-1 px-3 rounded-md text-xs font-semibold uppercase bg-blue-500/20 text-blue-400">Completed</span>;
        } else {
            return <span className="py-1 px-3 rounded-md text-xs font-semibold uppercase bg-emerald-500/20 text-emerald-400">Ready to Start</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl text-white mb-2 font-bold bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">My Contests</h1>
                    <p className="text-white/50 text-base">Your assigned coding challenges</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-white font-medium">{sessionStorage.getItem('username')}</span>
                    <button
                        onClick={() => { sessionStorage.clear(); navigate('/'); }}
                        className="py-2 px-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg cursor-pointer transition-all duration-300 hover:bg-red-500/20 flex items-center gap-2"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-16 text-white/40">
                    <p>Loading contests...</p>
                </div>
            ) : contests.length === 0 ? (
                <div className="text-center py-16 text-white/40">
                    <Trophy size={64} className="mx-auto mb-4 text-white/20" />
                    <h2 className="text-2xl text-white mb-2 font-semibold">No Contests Assigned</h2>
                    <p>You don't have any contests assigned yet. Please contact your administrator.</p>
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
                    {contests.map(contest => (
                        <div key={contest.id} className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/30">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-white text-xl m-0 font-semibold">{contest.title}</h3>
                                {getStatusBadge(contest)}
                            </div>

                            {contest.description && (
                                <p className="text-white/50 text-[0.9rem] leading-relaxed mb-4 line-clamp-2">{contest.description}</p>
                            )}

                            <div className="flex gap-4 mb-4 pb-4 border-b border-white/10">
                                <div className="flex items-center gap-2 text-white/50 text-[0.9rem]">
                                    <Clock size={16} className="text-white/30" />
                                    <span>{contest.duration} minutes</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/50 text-[0.9rem]">
                                    <span className={`py-1 px-3 rounded-md text-xs font-semibold text-white ${getDifficultyColorClass(contest.difficulty)}`}>
                                        {contest.difficulty}
                                    </span>
                                </div>
                            </div>

                            {contest.hasStarted && contest.score !== undefined && (
                                <div className="flex items-center gap-2 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg mb-4 text-yellow-400 font-semibold">
                                    <Trophy size={20} />
                                    <span>Score: {contest.score} points</span>
                                </div>
                            )}

                            <button
                                className={`w-full py-3 bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 text-yellow-200 border border-yellow-400/30 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${(!contest.isStarted || contest.status === 'completed') ? 'opacity-50 cursor-not-allowed bg-white/5 from-transparent to-transparent text-white/30 border-white/10' : 'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-400/20 hover:bg-yellow-400/25'
                                    }`}
                                onClick={() => handleStartContest(contest)}
                                disabled={!contest.isStarted || contest.status === 'completed'}
                            >
                                {!contest.isStarted ? (
                                    <>
                                        <Lock size={18} />
                                        Waiting for Admin
                                    </>
                                ) : contest.hasStarted ? (
                                    <>
                                        <Play size={18} />
                                        Continue Contest
                                    </>
                                ) : (
                                    <>
                                        <Play size={18} />
                                        Start Contest
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Password Modal */}
            {showPasswordModal && selectedContest && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] animate-fade-in" onClick={() => setShowPasswordModal(false)}>
                    <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl w-[90%] max-w-[500px] shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-white m-0 text-2xl font-bold">Enter Contest Password</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-white/50 mb-4">This contest requires a password to start.</p>
                            <div className="mb-4">
                                <label className="block text-white font-medium mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password..."
                                    className="w-full p-3 bg-white/[0.04] border border-white/10 rounded-lg text-white text-base placeholder:text-white/30 focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/30 transition-colors"
                                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 flex gap-4 justify-end">
                            <button
                                className="py-3 px-6 bg-transparent border border-white/20 text-white/60 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/10 hover:text-white"
                                onClick={() => setShowPasswordModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="py-3 px-6 bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 border border-yellow-400/30 text-yellow-200 rounded-lg font-semibold cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20"
                                onClick={handlePasswordSubmit}
                            >
                                Start Contest
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParticipantDashboard;
