
import React, { useState, useEffect } from 'react';
import {
    Trophy,
    Calendar,
    Target,
    Award
} from 'lucide-react';
import { userAPI } from '../../../utils/api';

interface ContestHistory {
    id: number;
    title: string;
    difficulty: string;
    score: number;
    rank?: number;
    startedAt: string;
    completedAt?: string;
}

const ProfilePage: React.FC = () => {
    const [history, setHistory] = useState<ContestHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalContests: 0,
        totalScore: 0,
        averageScore: 0,
        bestRank: '-'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await userAPI.getContestHistory();
            const contests = data.contests || [];
            setHistory(contests);

            // Calculate stats
            const totalScore = contests.reduce((acc: number, c: ContestHistory) => acc + (c.score || 0), 0);
            const avgScore = contests.length ? Math.round(totalScore / contests.length) : 0;
            const ranks = contests.map((c: ContestHistory) => c.rank).filter((r: number) => r && r > 0);
            const bestRank = ranks.length ? Math.min(...ranks) : '-';

            setStats({
                totalContests: contests.length,
                totalScore,
                averageScore: avgScore,
                bestRank: bestRank.toString()
            });

        } catch (error) {
            console.error('Failed to load profile', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-gray-500">
                Loading Profile...
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#1e1e24] border border-white/5 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                        <Trophy size={24} className="text-yellow-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.totalScore}</div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Score</div>
                    </div>
                </div>

                <div className="bg-[#1e1e24] border border-white/5 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                        <Target size={24} className="text-blue-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.totalContests}</div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Contests</div>
                    </div>
                </div>

                <div className="bg-[#1e1e24] border border-white/5 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                        <Award size={24} className="text-purple-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.bestRank}</div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Best Rank</div>
                    </div>
                </div>

                <div className="bg-[#1e1e24] border border-white/5 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                        <ActivityIcon size={24} className="text-green-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.averageScore}</div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Avg Score</div>
                    </div>
                </div>
            </div>

            {/* Contest History List */}
            <div className="bg-[#1e1e24] border border-white/5 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-lg font-bold text-white">Contest History</h2>
                </div>
                <div className="divide-y divide-white/5">
                    {history.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No contests participated in yet.
                        </div>
                    ) : (
                        history.map((contest) => (
                            <div key={contest.id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white mb-1">{contest.title}</h3>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(contest.startedAt).toLocaleDateString()}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${contest.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            contest.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                'bg-green-500/10 text-green-400 border-green-500/20'
                                            }`}>
                                            {contest.difficulty}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 uppercase">Score</div>
                                        <div className="font-mono text-xl font-bold text-yellow-400">{contest.score}</div>
                                    </div>
                                    <div className="text-right w-16">
                                        <div className="text-xs text-gray-500 uppercase">Rank</div>
                                        <div className="font-mono text-xl font-bold text-white">
                                            {contest.rank ? `#${contest.rank}` : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// Simple icon component helper if needed, or import Activity from lucide-react
const ActivityIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

export default ProfilePage;
