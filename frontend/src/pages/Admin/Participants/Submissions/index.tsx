import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, Code } from 'lucide-react';
import AdminLayout from '../../../../components/layout/AdminLayout';

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
            case 'passed': return <CheckCircle size={16} className="text-emerald-500" />;
            case 'failed': return <XCircle size={16} className="text-red-500" />;
            default: return <Clock size={16} className="text-amber-500" />;
        }
    };

    if (!contestInfo) return (
        <AdminLayout>
            <div className="p-12 text-center text-white/50">Loading...</div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="max-w-[1200px]">
                {/* Back Button */}
                <button
                    className="flex items-center gap-2 py-2.5 px-4.5 bg-transparent border border-white/10 text-white/70 rounded-full font-inherit text-[0.9rem] cursor-pointer mb-6 transition-all duration-200 hover:border-white/20 hover:text-white"
                    onClick={() => navigate(`/admin/participants/${id}`)}
                >
                    <ArrowLeft size={18} /> Back to Profile
                </button>

                {/* Submissions Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-[1.75rem] font-semibold m-0 mb-2 bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                            {contestInfo.title}
                        </h1>
                        <p className="text-white/50 m-0">Submissions by {contestInfo.participantName}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center py-3 px-5 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                            <span className="block text-xl font-semibold text-yellow-200">{contestInfo.totalSubmissions}</span>
                            <span className="text-[0.7rem] text-white/50 uppercase">Submissions</span>
                        </div>
                        <div className="text-center py-3 px-5 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                            <span className="block text-xl font-semibold text-yellow-200">{contestInfo.bestScore}</span>
                            <span className="text-[0.7rem] text-white/50 uppercase">Best Score</span>
                        </div>
                    </div>
                </div>

                {/* Submissions Layout */}
                <div className="grid grid-cols-[320px_1fr] gap-5 h-[calc(100vh-280px)] max-md:grid-cols-1 max-md:h-auto">
                    {/* Submissions List */}
                    <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col">
                        <div className="py-4 px-5 text-[0.8rem] text-white/50 uppercase tracking-wider border-b border-white/[0.08]">
                            All Submissions
                        </div>
                        <div className="flex flex-col overflow-y-auto">
                            {submissions.map(sub => (
                                <div
                                    key={sub.id}
                                    className={`py-4 px-5 border-b border-white/5 cursor-pointer transition-all duration-200 hover:bg-white/[0.02] ${selectedSubmission?.id === sub.id
                                            ? 'bg-yellow-200/5 border-l-[3px] border-l-yellow-200'
                                            : ''
                                        }`}
                                    onClick={() => setSelectedSubmission(sub)}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        {getStatusIcon(sub.status)}
                                        <div>
                                            <span className="block text-[0.9rem] font-medium text-white">{sub.timestamp}</span>
                                            <span className={`text-[0.75rem] capitalize ${sub.status === 'passed' ? 'text-emerald-500' :
                                                    sub.status === 'failed' ? 'text-red-500' :
                                                        'text-amber-500'
                                                }`}>
                                                {sub.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 text-[0.8rem] text-white/40 pl-7">
                                        <span>{sub.runtime}</span>
                                        <span>{sub.memory}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Code Viewer */}
                    <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col h-full max-md:min-h-[400px]">
                        {selectedSubmission && (
                            <>
                                <div className="flex justify-between items-center py-3.5 px-5 border-b border-white/[0.08]">
                                    <div className="flex items-center gap-2 text-white/70 text-[0.9rem]">
                                        <Code size={16} />
                                        <span>solution.ts</span>
                                    </div>
                                    <span className="text-[0.8rem] text-yellow-200 py-1 px-2.5 bg-yellow-200/10 rounded-full">
                                        {selectedSubmission.language}
                                    </span>
                                </div>
                                <div className="flex-1 p-5 overflow-auto bg-black/30">
                                    <pre className="m-0">
                                        <code className="font-mono text-[0.9rem] leading-relaxed text-white/85 whitespace-pre">
                                            {selectedSubmission.code}
                                        </code>
                                    </pre>
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
