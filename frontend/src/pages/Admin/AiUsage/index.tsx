
import React, { useState, useEffect } from 'react';
import {
    Activity,
    Server,
    Zap,
    Filter,
    Bot
} from 'lucide-react';
import { adminAPI } from '../../../utils/api';

const AiUsagePage: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadData();
    }, [page]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsData, logsData] = await Promise.all([
                adminAPI.getAiUsageStats(),
                adminAPI.getAiUsageLogs(page, 50)
            ]);
            setStats(statsData);
            setLogs(logsData.logs);
            setTotalPages(Math.ceil((logsData.total || 0) / 50)); // Assuming total returned or handled
        } catch (error) {
            console.error('Failed to load AI usage data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) {
        return <div className="p-8 text-center text-gray-400">Loading AI Usage Data...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bot className="text-purple-400" />
                AI Usage Tracking
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#1e1e24] border border-white/5 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Activity size={20} className="text-blue-400" />
                        </div>
                        <span className="text-xs font-mono text-gray-500">TOTAL REQUESTS</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats?.totalRequests || 0}</div>
                </div>

                <div className="bg-[#1e1e24] border border-white/5 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Zap size={20} className="text-purple-400" />
                        </div>
                        <span className="text-xs font-mono text-gray-500">TOKENS USED</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{(stats?.totalTokens || 0).toLocaleString()}</div>
                </div>

                <div className="bg-[#1e1e24] border border-white/5 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Server size={20} className="text-green-400" />
                        </div>
                        <span className="text-xs font-mono text-gray-500">BY PROVIDER</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Groq</span>
                            <span className="text-white font-mono">{stats?.byProvider?.groq || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Gemini</span>
                            <span className="text-white font-mono">{stats?.byProvider?.gemini || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e1e24] border border-white/5 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Filter size={20} className="text-orange-400" />
                        </div>
                        <span className="text-xs font-mono text-gray-500">BY PURPOSE</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Hints</span>
                            <span className="text-white font-mono">{stats?.byPurpose?.hint || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Solutions</span>
                            <span className="text-white font-mono">{stats?.byPurpose?.solution || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage Logs Table */}
            <div className="bg-[#1e1e24] border border-white/5 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-semibold text-white">Recent Activity</h3>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-sm disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-gray-400 text-sm py-1">Page {page}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-nowrap">
                        <thead className="bg-white/5 text-gray-400 text-xs font-mono uppercase">
                            <tr>
                                <th className="px-6 py-3 text-left">Timestamp</th>
                                <th className="px-6 py-3 text-left">User</th>
                                <th className="px-6 py-3 text-left">Provider</th>
                                <th className="px-6 py-3 text-left">Model</th>
                                <th className="px-6 py-3 text-left">Purpose</th>
                                <th className="px-6 py-3 text-right">Tokens</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {logs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-white/[0.02]">
                                    <td className="px-6 py-3 text-sm text-gray-400">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-white">
                                        {log.username || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-3 text-sm">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${log.provider === 'groq'
                                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {log.provider}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-300 font-mono text-xs">
                                        {log.model}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-300">
                                        {log.purpose}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-white font-mono text-right">
                                        {log.tokensUsed}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No recent activity
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AiUsagePage;
