import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, Code } from 'lucide-react';

interface Submission {
    id: number;
    timestamp: string;
    status: 'passed' | 'failed' | 'partial';
    runtime: string;
    memory: string;
    language: string;
    code: string;
}

interface ContestInfo {
    title: string;
    participantName: string;
    totalSubmissions: number;
    bestScore: number;
}

const mockSubmissions: Submission[] = [
    { id: 1, timestamp: '2024-02-15 14:32:45', status: 'passed', runtime: '45ms', memory: '12.4MB', language: 'TypeScript', code: 'function search(nums: number[], target: number): number {\n  let left = 0, right = nums.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}' },
    { id: 2, timestamp: '2024-02-15 14:28:12', status: 'partial', runtime: '52ms', memory: '12.8MB', language: 'TypeScript', code: 'function search(nums: number[], target: number): number {\n  for (let i = 0; i < nums.length; i++) {\n    if (nums[i] === target) return i;\n  }\n  return -1;\n}' },
    { id: 3, timestamp: '2024-02-15 14:15:33', status: 'failed', runtime: 'N/A', memory: 'N/A', language: 'TypeScript', code: 'function search(nums: number[], target: number): number {\n  return nums.indexOf(target);\n}' },
];

const mockContestInfo: ContestInfo = { title: 'Binary Search Challenge', participantName: 'player1', totalSubmissions: 3, bestScore: 85 };

const Submissions: React.FC = () => {
    const { id, contestId } = useParams<{ id: string; contestId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [contestInfo, setContestInfo] = useState<ContestInfo | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    // Context-aware back navigation
    const fromContext = location.state?.from || 'profile';
    const backPath = fromContext === 'contest'
        ? `/admin/contests/${contestId}`
        : `/admin/participants/${id}`;
    const backLabel = fromContext === 'contest' ? 'Back to Contest' : 'Back to Profile';

    useEffect(() => {
        setTimeout(() => { setSubmissions(mockSubmissions); setContestInfo(mockContestInfo); setSelectedSubmission(mockSubmissions[0]); }, 300);
    }, [id, contestId]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'passed': return <CheckCircle size={16} style={{ color: '#22c55e' }} />;
            case 'failed': return <XCircle size={16} style={{ color: '#ef4444' }} />;
            default: return <Clock size={16} style={{ color: '#eab308' }} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'passed': return '#22c55e';
            case 'failed': return '#ef4444';
            default: return '#eab308';
        }
    };

    if (!contestInfo) return (
        <div style={{ padding: '48px', textAlign: 'center', color: '#71717a' }}>
            <div style={{ width: '32px', height: '32px', border: '2px solid #27272a', borderTopColor: '#fafafa', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ fontSize: '0.875rem' }}>Loading...</span>
        </div>
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <button
                    onClick={() => navigate(backPath)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        background: 'transparent',
                        border: '1px solid #27272a',
                        borderRadius: '6px',
                        color: '#a1a1aa',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#18181b'; e.currentTarget.style.color = '#fafafa'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa'; }}
                >
                    <ArrowLeft size={16} /> {backLabel}
                </button>
            </div>

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 600, margin: 0, marginBottom: '4px', color: '#fafafa', letterSpacing: '-0.025em' }}>{contestInfo.title}</h1>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#a1a1aa' }}>Submissions by {contestInfo.participantName}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {[{ label: 'Submissions', value: contestInfo.totalSubmissions }, { label: 'Best Score', value: contestInfo.bestScore }].map((stat, i) => (
                        <div key={i} style={{ textAlign: 'center', padding: '12px 20px', background: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}>
                            <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: '#fafafa', letterSpacing: '-0.025em' }}>{stat.value}</span>
                            <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
                        </div>
                    ))}
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px', height: 'calc(100vh - 280px)' }}>
                <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '14px 20px', fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #27272a', fontWeight: 500 }}>All Submissions</div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {submissions.map(sub => (
                            <div key={sub.id} onClick={() => setSelectedSubmission(sub)} style={{ padding: '14px 20px', borderBottom: '1px solid #27272a', cursor: 'pointer', background: selectedSubmission?.id === sub.id ? 'rgba(255,255,255,0.02)' : 'transparent', borderLeft: selectedSubmission?.id === sub.id ? '2px solid #fafafa' : '2px solid transparent', transition: 'all 0.2s ease' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                    {getStatusIcon(sub.status)}
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#fafafa' }}>{sub.timestamp}</span>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '85px',
                                            padding: '2px 8px',
                                            marginTop: '4px',
                                            borderRadius: '9999px',
                                            fontSize: '0.7rem',
                                            fontWeight: 500,
                                            textTransform: 'capitalize',
                                            color: getStatusColor(sub.status),
                                            background: `${getStatusColor(sub.status)}1a`, // Adding 10% opacity for background
                                            border: `1px solid ${getStatusColor(sub.status)}33` // Adding 20% opacity for border
                                        }}>
                                            {sub.status}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#71717a', paddingLeft: '28px' }}>
                                    <span>{sub.runtime}</span><span>{sub.memory}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {selectedSubmission && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #27272a' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa', fontSize: '0.875rem' }}>
                                    <Code size={16} /><span>solution.ts</span>
                                </div>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(59,130,246,0.15)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, color: '#3b82f6' }}>{selectedSubmission.language}</span>
                            </div>
                            <div style={{ flex: 1, padding: '20px', overflow: 'auto', background: 'rgba(0,0,0,0.3)' }}>
                                <pre style={{ margin: 0 }}><code style={{ fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.6, color: '#fafafa', whiteSpace: 'pre' }}>{selectedSubmission.code}</code></pre>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Submissions;
