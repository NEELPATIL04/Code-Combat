import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, Code } from 'lucide-react';
import AdminLayout from '../../../../components/layout/AdminLayout';
import './Submissions.css';

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
            case 'passed': return <CheckCircle size={16} className="status-icon passed" />;
            case 'failed': return <XCircle size={16} className="status-icon failed" />;
            default: return <Clock size={16} className="status-icon partial" />;
        }
    };

    if (!contestInfo) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="submissions-content">
                <button className="back-btn" onClick={() => navigate(`/admin/participants/${id}`)}>
                    <ArrowLeft size={18} /> Back to Profile
                </button>

                <div className="submissions-header">
                    <div>
                        <h1>{contestInfo.title}</h1>
                        <p className="subtitle">Submissions by {contestInfo.participantName}</p>
                    </div>
                    <div className="header-stats">
                        <div className="mini-stat">
                            <span className="value">{contestInfo.totalSubmissions}</span>
                            <span className="label">Submissions</span>
                        </div>
                        <div className="mini-stat">
                            <span className="value">{contestInfo.bestScore}</span>
                            <span className="label">Best Score</span>
                        </div>
                    </div>
                </div>

                <div className="submissions-layout">
                    <div className="submissions-list">
                        <div className="list-header">All Submissions</div>
                        {submissions.map(sub => (
                            <div
                                key={sub.id}
                                className={`submission-item ${selectedSubmission?.id === sub.id ? 'active' : ''}`}
                                onClick={() => setSelectedSubmission(sub)}
                            >
                                <div className="submission-main">
                                    {getStatusIcon(sub.status)}
                                    <div>
                                        <span className="submission-time">{sub.timestamp}</span>
                                        <span className={`submission-status ${sub.status}`}>{sub.status}</span>
                                    </div>
                                </div>
                                <div className="submission-meta">
                                    <span>{sub.runtime}</span>
                                    <span>{sub.memory}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="code-viewer">
                        {selectedSubmission && (
                            <>
                                <div className="viewer-header">
                                    <div className="file-info">
                                        <Code size={16} />
                                        <span>solution.ts</span>
                                    </div>
                                    <span className="language">{selectedSubmission.language}</span>
                                </div>
                                <div className="code-block">
                                    <pre><code>{selectedSubmission.code}</code></pre>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Submissions;
