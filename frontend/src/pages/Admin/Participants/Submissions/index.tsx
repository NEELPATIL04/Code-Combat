import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const mockContestInfo: ContestInfo = {
    title: 'Binary Search Challenge',
    participantName: 'player1',
    totalSubmissions: 3,
    bestScore: 85
};

const Submissions: React.FC = () => {
    const { id, contestId } = useParams<{ id: string; contestId: string }>();
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [contestInfo, setContestInfo] = useState<ContestInfo | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    useEffect(() => {
        setTimeout(() => {
            setSubmissions(mockSubmissions);
            setContestInfo(mockContestInfo);
            setSelectedSubmission(mockSubmissions[0]);
        }, 300);
    }, [id, contestId]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'passed': return <CheckCircle size={16} style={{ color: '#10b981' }} />;
            case 'failed': return <XCircle size={16} style={{ color: '#ef4444' }} />;
            default: return <Clock size={16} style={{ color: '#f59e0b' }} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'passed': return '#10b981';
            case 'failed': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    if (!contestInfo) return (
        <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
            <div style={{
                width: '32px',
                height: '32px',
                border: '2px solid rgba(253, 230, 138, 0.2)',
                borderTopColor: '#FDE68A',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 1s linear infinite'
            }}></div>
            Loading...
        </div>
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Back Button */}
            <button
                onClick={() => navigate(`/admin/participants/${id}`)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '100px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    marginBottom: '24px'
                }}
            >
                <ArrowLeft size={18} /> Back to Profile
            </button>

            {/* Submissions Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '24px'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        margin: 0,
                        marginBottom: '8px',
                        color: '#ffffff'
                    }}>
                        {contestInfo.title}
                    </h1>
                    <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.5)' }}>
                        Submissions by {contestInfo.participantName}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{
                        textAlign: 'center',
                        padding: '12px 20px',
                        background: 'rgba(20, 20, 22, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px'
                    }}>
                        <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 600, color: '#FBBF24' }}>
                            {contestInfo.totalSubmissions}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>
                            Submissions
                        </span>
                    </div>
                    <div style={{
                        textAlign: 'center',
                        padding: '12px 20px',
                        background: 'rgba(20, 20, 22, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px'
                    }}>
                        <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 600, color: '#FBBF24' }}>
                            {contestInfo.bestScore}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>
                            Best Score
                        </span>
                    </div>
                </div>
            </header>

            {/* Submissions Layout */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '320px 1fr',
                gap: '20px',
                height: 'calc(100vh - 280px)'
            }}>
                {/* Submissions List */}
                <div style={{
                    background: 'rgba(20, 20, 22, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        padding: '16px 20px',
                        fontSize: '0.8rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                        All Submissions
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {submissions.map(sub => (
                            <div
                                key={sub.id}
                                onClick={() => setSelectedSubmission(sub)}
                                style={{
                                    padding: '16px 20px',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                    cursor: 'pointer',
                                    background: selectedSubmission?.id === sub.id ? 'rgba(253, 230, 138, 0.05)' : 'transparent',
                                    borderLeft: selectedSubmission?.id === sub.id ? '3px solid #FDE68A' : '3px solid transparent',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    {getStatusIcon(sub.status)}
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#ffffff' }}>
                                            {sub.timestamp}
                                        </span>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            textTransform: 'capitalize',
                                            color: getStatusColor(sub.status)
                                        }}>
                                            {sub.status}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)', paddingLeft: '28px' }}>
                                    <span>{sub.runtime}</span>
                                    <span>{sub.memory}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Code Viewer */}
                <div style={{
                    background: 'rgba(20, 20, 22, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                }}>
                    {selectedSubmission && (
                        <>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '14px 20px',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                                    <Code size={16} />
                                    <span>solution.ts</span>
                                </div>
                                <span style={{
                                    padding: '4px 10px',
                                    background: 'rgba(253, 230, 138, 0.1)',
                                    borderRadius: '100px',
                                    fontSize: '0.8rem',
                                    color: '#FDE68A'
                                }}>
                                    {selectedSubmission.language}
                                </span>
                            </div>
                            <div style={{
                                flex: 1,
                                padding: '20px',
                                overflow: 'auto',
                                background: 'rgba(0, 0, 0, 0.3)'
                            }}>
                                <pre style={{ margin: 0 }}>
                                    <code style={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.9rem',
                                        lineHeight: 1.6,
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        whiteSpace: 'pre'
                                    }}>
                                        {selectedSubmission.code}
                                    </code>
                                </pre>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Submissions;
