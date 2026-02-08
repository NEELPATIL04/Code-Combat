import React, { useState, useEffect, useCallback } from 'react';
import { Activity, AlertTriangle, Info, RefreshCw, Filter, Users, Monitor } from 'lucide-react';
import { useSocket } from '../../../../context/SocketContext';
import VideoFeed from '../../../../components/VideoFeed';

interface ActivityLogsProps {
    contestId: number;
}

interface ActivityLog {
    id: number;
    contestId: number;
    userId: number;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    activityType: string;
    activityData: any;
    severity: 'normal' | 'warning' | 'alert';
    timestamp: string;
}

interface ActivityStats {
    totalActivities: number;
    byType: Record<string, number>;
    bySeverity: {
        normal: number;
        warning: number;
        alert: number;
    };
    activeUsers: number;
}

const ActivityLogs: React.FC<ActivityLogsProps> = ({ contestId }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [stats, setStats] = useState<ActivityStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');

    // Live Monitoring
    const { socket } = useSocket();
    const [activeParticipants, setActiveParticipants] = useState<{ socketId: string, userId: string }[]>([]);
    const [viewMode, setViewMode] = useState<'logs' | 'monitor'>('logs');

    useEffect(() => {
        if (!socket) return;
        socket.emit('join-monitor', { contestId });

        const handleActiveParticipants = (participants: { socketId: string, userId: string }[]) => {
            setActiveParticipants(participants);
        };

        const handleParticipantJoined = ({ userId, socketId }: { userId: string, socketId: string }) => {
            setActiveParticipants(prev => {
                if (prev.find(p => p.socketId === socketId)) return prev;
                return [...prev, { userId, socketId }];
            });
        };

        const handleParticipantLeft = ({ socketId }: { socketId: string }) => {
            setActiveParticipants(prev => prev.filter(p => p.socketId !== socketId));
        };

        const handleNewActivity = () => {
            loadLogs();
            loadStats();
        };

        socket.on('active-participants', handleActiveParticipants);
        socket.on('participant-joined', handleParticipantJoined);
        socket.on('participant-left', handleParticipantLeft);
        socket.on('new-activity', handleNewActivity);

        return () => {
            socket.off('active-participants', handleActiveParticipants);
            socket.off('participant-joined', handleParticipantJoined);
            socket.off('participant-left', handleParticipantLeft);
            socket.off('new-activity', handleNewActivity);
        };
    }, [socket, contestId]);

    const loadLogs = useCallback(async () => {
        try {
            const token = sessionStorage.getItem('token');
            const params = new URLSearchParams();
            if (filterSeverity !== 'all') params.append('severity', filterSeverity);
            if (filterType !== 'all') params.append('activityType', filterType);

            const response = await fetch(`/api/contests/${contestId}/activity?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to load logs');

            const data = await response.json();
            if (data.success) {
                setLogs(data.logs || []);
            }
        } catch (error) {
            console.error('Failed to load activity logs:', error);
        } finally {
            setLoading(false);
        }
    }, [contestId, filterSeverity, filterType]);

    const loadStats = useCallback(async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`/api/contests/${contestId}/activity/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to load stats');

            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to load activity stats:', error);
        }
    }, [contestId]);

    useEffect(() => {
        loadLogs();
        loadStats();
    }, [loadLogs, loadStats]);

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            loadLogs();
            loadStats();
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, [autoRefresh, loadLogs, loadStats]);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'alert': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' };
            case 'warning': return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: 'rgba(234, 179, 8, 0.2)' };
            default: return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' };
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'contest_joined': return '🎯';
            case 'screen_shift': return '🚨';
            case 'task_submitted': return '✅';
            case 'ai_hint_requested': return '💡';
            case 'contest_completed': return '🏆';
            case 'copy_attempt': return '📋';
            default: return '📌';
        }
    };

    const formatActivityType = (type: string) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (seconds < 60) return `${seconds}s ago`;
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const uniqueTypes = Array.from(new Set(logs.map(log => log.activityType)));

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#a1a1aa' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #27272a',
                    borderTopColor: '#fafafa',
                    borderRadius: '50%',
                    margin: '0 auto 20px',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p>Loading activity logs...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header with Stats */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: '#fafafa',
                            margin: '0 0 8px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <Activity size={24} /> Activity Logs
                        </h2>
                        <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.875rem' }}>
                            Real-time monitoring of participant activities
                        </p>
                    </div>
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        style={{
                            padding: '8px 16px',
                            background: autoRefresh ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                            border: '1px solid',
                            borderColor: autoRefresh ? 'rgba(34, 197, 94, 0.2)' : '#27272a',
                            borderRadius: '6px',
                            color: autoRefresh ? '#22c55e' : '#a1a1aa',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <RefreshCw size={14} style={{ animation: autoRefresh ? 'spin 2s linear infinite' : 'none' }} />
                        {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
                    </button>
                </div>

                {/* View Mode Tabs */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #27272a' }}>
                    <button
                        onClick={() => setViewMode('logs')}
                        style={{
                            padding: '12px 24px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: viewMode === 'logs' ? '2px solid #3b82f6' : '2px solid transparent',
                            color: viewMode === 'logs' ? '#3b82f6' : '#a1a1aa',
                            fontSize: '0.9375rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            marginBottom: '-1px'
                        }}
                    >
                        <Activity size={18} /> Activity Logs
                    </button>
                    <button
                        onClick={() => setViewMode('monitor')}
                        style={{
                            padding: '12px 24px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: viewMode === 'monitor' ? '2px solid #ec4899' : '2px solid transparent',
                            color: viewMode === 'monitor' ? '#ec4899' : '#a1a1aa',
                            fontSize: '0.9375rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            marginBottom: '-1px'
                        }}
                    >
                        <Monitor size={18} /> Live Monitor
                        <span style={{
                            background: '#27272a',
                            color: '#fafafa',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                        }}>
                            {activeParticipants.length}
                        </span>
                    </button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '16px',
                        marginBottom: '20px'
                    }}>
                        <StatCard
                            icon={<Activity size={18} color="#3b82f6" />}
                            label="Total Activities"
                            value={stats.totalActivities}
                        />
                        <StatCard
                            icon={<Users size={18} color="#22c55e" />}
                            label="Active Users"
                            value={stats.activeUsers}
                        />
                        <StatCard
                            icon={<AlertTriangle size={18} color="#eab308" />}
                            label="Warnings"
                            value={stats.bySeverity.warning}
                        />
                        <StatCard
                            icon={<AlertTriangle size={18} color="#ef4444" />}
                            label="Alerts"
                            value={stats.bySeverity.alert}
                        />
                    </div>
                )}

                {/* Filters */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* View Mode Toggles */}
                    <div style={{ display: 'flex', background: '#18181b', borderRadius: '6px', padding: '2px', border: '1px solid #27272a', marginRight: '12px' }}>
                        <button
                            onClick={() => setViewMode('logs')}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '4px',
                                background: viewMode === 'logs' ? '#27272a' : 'transparent',
                                color: viewMode === 'logs' ? '#fff' : '#a1a1aa',
                                border: 'none',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Activity size={14} /> Logs
                        </button>
                        <button
                            onClick={() => setViewMode('monitor')}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '4px',
                                background: viewMode === 'monitor' ? '#27272a' : 'transparent',
                                color: viewMode === 'monitor' ? '#fff' : '#a1a1aa',
                                border: 'none',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Monitor size={14} /> Live Monitor
                        </button>
                    </div>

                    {viewMode === 'logs' && (
                        <>
                            <Filter size={16} color="#71717a" />
                            <select
                                value={filterSeverity}
                                onChange={(e) => setFilterSeverity(e.target.value)}
                                style={{
                                    background: '#18181b',
                                    border: '1px solid #27272a',
                                    borderRadius: '6px',
                                    color: '#fafafa',
                                    padding: '8px 12px',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="all">All Severities</option>
                                <option value="normal">Normal</option>
                                <option value="warning">Warning</option>
                                <option value="alert">Alert</option>
                            </select>

                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                style={{
                                    background: '#18181b',
                                    border: '1px solid #27272a',
                                    borderRadius: '6px',
                                    color: '#fafafa',
                                    padding: '8px 12px',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="all">All Activity Types</option>
                                {uniqueTypes.map(type => (
                                    <option key={type} value={type}>{formatActivityType(type)}</option>
                                ))}
                            </select>
                        </>
                    )}
                </div>
            </div>

            {viewMode === 'logs' ? (
                /* Logs List */
                <div style={{
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}>
                    {logs.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#71717a' }}>
                            <Info size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                            <p style={{ margin: 0 }}>No activity logs found. Logs will appear here as participants interact with the contest.</p>
                        </div>
                    ) : (
                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            {logs.map((log, index) => {
                                const severityStyle = getSeverityColor(log.severity);
                                const displayName = log.firstName && log.lastName
                                    ? `${log.firstName} ${log.lastName}`
                                    : log.username || 'Unknown User';

                                return (
                                    <div
                                        key={log.id}
                                        style={{
                                            padding: '16px 20px',
                                            borderBottom: index === logs.length - 1 ? 'none' : '1px solid #27272a',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '16px',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                                            {getActivityIcon(log.activityType)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ color: '#fafafa', fontWeight: 500, fontSize: '0.9375rem' }}>
                                                    {formatActivityType(log.activityType)}
                                                </span>
                                                <span style={{ color: '#71717a', fontSize: '0.75rem' }}>
                                                    {formatTimestamp(log.timestamp)}
                                                </span>
                                            </div>
                                            <div style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '8px' }}>
                                                {displayName} • User ID: {log.userId}
                                            </div>
                                            {log.activityData && Object.keys(log.activityData).length > 0 && (
                                                <div style={{
                                                    background: '#18181b',
                                                    border: '1px solid #27272a',
                                                    borderRadius: '6px',
                                                    padding: '8px 10px',
                                                    fontSize: '0.8125rem',
                                                    color: '#71717a',
                                                    fontFamily: 'monospace',
                                                    marginTop: '8px'
                                                }}>
                                                    {JSON.stringify(log.activityData, null, 2)}
                                                </div>
                                            )}
                                        </div>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            background: severityStyle.bg,
                                            color: severityStyle.color,
                                            border: `1px solid ${severityStyle.border}`,
                                            textTransform: 'uppercase',
                                            flexShrink: 0
                                        }}>
                                            {log.severity}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                /* Live Monitor Grid */
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '16px'
                }}>
                    {activeParticipants.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: '#71717a', background: '#09090b', borderRadius: '12px', border: '1px solid #27272a' }}>
                            <Monitor size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                            <p style={{ margin: 0 }}>No active participants connected.</p>
                        </div>
                    ) : (
                        activeParticipants.map(p => (
                            <VideoFeed
                                key={p.socketId}
                                socket={socket!}
                                targetSocketId={p.socketId}
                                userId={p.userId}
                                isLarge={false}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
    <div style={{
        background: '#09090b',
        border: '1px solid #27272a',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    }}>
        <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', marginBottom: '2px' }}>
                {label}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fafafa' }}>
                {value}
            </div>
        </div>
    </div>
);

export default ActivityLogs;
