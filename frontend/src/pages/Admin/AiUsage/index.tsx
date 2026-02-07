
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
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Page Header */}
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{
                    fontSize: '1.875rem',
                    fontWeight: 600,
                    margin: 0,
                    color: '#fafafa',
                    letterSpacing: '-0.025em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Bot color="#a1a1aa" size={32} />
                    AI Usage Tracking
                </h1>
                <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '0.875rem',
                    color: '#a1a1aa'
                }}>
                    Monitor AI token usage and activity
                </p>
            </header>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '32px'
            }}>
                {/* Total Requests */}
                <div style={{
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa' }}>Total Requests</span>
                        <div style={{ padding: '8px', background: '#27272a', borderRadius: '8px' }}>
                            <Activity size={16} color="#a1a1aa" />
                        </div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fafafa', lineHeight: 1, letterSpacing: '-0.025em' }}>
                        {stats?.totalRequests || 0}
                    </div>
                </div>

                {/* Tokens Used */}
                <div style={{
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa' }}>Tokens Used</span>
                        <div style={{ padding: '8px', background: '#27272a', borderRadius: '8px' }}>
                            <Zap size={16} color="#a1a1aa" />
                        </div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fafafa', lineHeight: 1, letterSpacing: '-0.025em' }}>
                        {(stats?.totalTokens || 0).toLocaleString()}
                    </div>
                </div>

                {/* By Provider */}
                <div style={{
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa' }}>By Provider</span>
                        <div style={{ padding: '8px', background: '#27272a', borderRadius: '8px' }}>
                            <Server size={16} color="#a1a1aa" />
                        </div>
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

                {/* By Purpose */}
                <div style={{
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa' }}>By Purpose</span>
                        <div style={{ padding: '8px', background: '#27272a', borderRadius: '8px' }}>
                            <Filter size={16} color="#a1a1aa" />
                        </div>
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
            <div style={{
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #27272a',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#fafafa',
                        letterSpacing: '-0.025em'
                    }}>Recent Activity</h3>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-sm disabled:opacity-50 text-white transition-colors"
                        >
                            Prev
                        </button>
                        <span className="text-gray-400 text-sm py-1">Page {page}</span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-sm disabled:opacity-50 text-white transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {/* Grid Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(180px, 1fr) minmax(150px, 1fr) minmax(120px, 1fr) minmax(200px, 2fr) minmax(150px, 1fr) minmax(100px, 1fr)',
                        gap: '16px',
                        padding: '12px 24px',
                        background: '#0a0a0b',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: '#71717a',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        <span>Timestamp</span>
                        <span>User</span>
                        <span>Provider</span>
                        <span>Model</span>
                        <span>Purpose</span>
                        <span style={{ textAlign: 'right' }}>Tokens</span>
                    </div>

                    {/* Grid Body */}
                    <div className="divide-y divide-white/5">
                        {logs.map((log: any) => (
                            <div
                                key={log.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'minmax(180px, 1fr) minmax(150px, 1fr) minmax(120px, 1fr) minmax(200px, 2fr) minmax(150px, 1fr) minmax(100px, 1fr)',
                                    gap: '16px',
                                    padding: '16px 24px',
                                    alignItems: 'center',
                                    borderTop: '1px solid #27272a',
                                    fontSize: '0.875rem'
                                }}
                                className="hover:bg-white/[0.02] transition-colors"
                            >
                                <span className="text-gray-400">
                                    {new Date(log.timestamp).toLocaleString()}
                                </span>
                                <span className="text-white font-medium">
                                    {log.username || 'Unknown'}
                                </span>
                                <span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${log.provider === 'groq'
                                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {log.provider}
                                    </span>
                                </span>
                                <span className="text-gray-300 font-mono text-xs">
                                    {log.model}
                                </span>
                                <span className="text-gray-300">
                                    {log.purpose}
                                </span>
                                <span className="text-white font-mono text-right">
                                    {log.tokensUsed}
                                </span>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <div className="px-6 py-8 text-center text-gray-500 border-t border-white/5">
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiUsagePage;
