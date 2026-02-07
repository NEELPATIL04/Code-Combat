import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, Code, Brain, Lightbulb, Edit2, Save, X } from 'lucide-react';
import { adminAPI } from '../../../../utils/api';
import toast from 'react-hot-toast';

interface Submission {
    id: number;
    submittedAt: string;
    status: 'pending' | 'processing' | 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'runtime_error' | 'compilation_error' | 'internal_error';
    executionTime: number;
    memoryUsed: number;
    language: string;
    sourceCode: string;
    score: number;
    hintsUsed: number;
    usedSolution: boolean;
    passedTests: number;
    totalTests: number;
}

interface ContestInfo {
    title: string;
    participantName: string;
    totalSubmissions: number;
    bestScore: number;
}

const Submissions: React.FC = () => {
    const { id, contestId } = useParams<{ id: string; contestId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [contestInfo, setContestInfo] = useState<ContestInfo | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);

    // Edit Score State
    const [showEditScoreModal, setShowEditScoreModal] = useState(false);
    const [editingScore, setEditingScore] = useState<number>(0);
    const [updatingScore, setUpdatingScore] = useState(false);

    // Context-aware back navigation
    const fromContext = location.state?.from || 'profile';
    const backPath = fromContext === 'contest'
        ? `/admin/contests/${contestId}`
        : `/admin/participants/${id}`;
    const backLabel = fromContext === 'contest' ? 'Back to Contest' : 'Back to Profile';

    useEffect(() => {
        if (id && contestId) {
            loadSubmissions();
        }
    }, [id, contestId]);

    const loadSubmissions = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getParticipantSubmissions(Number(id), Number(contestId));
            const subData = response.data.submissions;

            setSubmissions(subData);
            if (subData.length > 0) {
                setSelectedSubmission(subData[0]);

                // Calculate stats
                const totalSubs = subData.length;
                // Simple max score logic for demo, ideally fetching user details or contest details
                const maxScore = Math.max(...subData.map((s: Submission) => s.score));

                setContestInfo({
                    title: `Contest #${contestId}`, // We might want to fetch actual contest title if available
                    participantName: `Participant #${id}`, // Similarly for name
                    totalSubmissions: totalSubs,
                    bestScore: maxScore
                });
            } else {
                setContestInfo({
                    title: `Contest #${contestId}`,
                    participantName: `Participant #${id}`,
                    totalSubmissions: 0,
                    bestScore: 0
                });
            }
        } catch (error) {
            console.error("Failed to load submissions:", error);
            toast.error("Failed to load submissions");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateScore = async () => {
        if (!selectedSubmission) return;

        try {
            setUpdatingScore(true);
            const response = await adminAPI.updateSubmissionScore(selectedSubmission.id, editingScore);

            // Update local state
            const updatedSub = response.data.submission;
            setSubmissions(prev => prev.map(s => s.id === updatedSub.id ? { ...s, score: updatedSub.score } : s));
            setSelectedSubmission(prev => prev?.id === updatedSub.id ? { ...prev, score: updatedSub.score } : prev);

            toast.success('Score updated successfully');
            setShowEditScoreModal(false);
        } catch (error) {
            console.error("Failed to update score:", error);
            toast.error("Failed to update score");
        } finally {
            setUpdatingScore(false);
        }
    };

    const openEditScoreModal = (submission: Submission) => {
        setEditingScore(submission.score);
        setSelectedSubmission(submission);
        setShowEditScoreModal(true);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted': return <CheckCircle size={16} style={{ color: '#22c55e' }} />;
            case 'wrong_answer': return <XCircle size={16} style={{ color: '#ef4444' }} />;
            case 'pending':
            case 'processing': return <Clock size={16} style={{ color: '#eab308' }} />;
            default: return <XCircle size={16} style={{ color: '#ef4444' }} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return '#22c55e';
            case 'wrong_answer': return '#ef4444';
            case 'pending':
            case 'processing': return '#eab308';
            default: return '#ef4444';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) return (
        <div style={{ padding: '48px', textAlign: 'center', color: '#71717a' }}>
            <div style={{ width: '32px', height: '32px', border: '2px solid #27272a', borderTopColor: '#fafafa', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ fontSize: '0.875rem' }}>Loading submissions...</span>
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
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 600, margin: 0, marginBottom: '4px', color: '#fafafa', letterSpacing: '-0.025em' }}>
                        {contestInfo?.title || 'Contest Details'}
                    </h1>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#a1a1aa' }}>
                        Submissions by {contestInfo?.participantName || 'Participant'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {[{ label: 'Submissions', value: contestInfo?.totalSubmissions || 0 }, { label: 'Best Score', value: contestInfo?.bestScore || 0 }].map((stat, i) => (
                        <div key={i} style={{ textAlign: 'center', padding: '12px 20px', background: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}>
                            <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: '#fafafa', letterSpacing: '-0.025em' }}>{stat.value}</span>
                            <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
                        </div>
                    ))}
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '16px', height: 'calc(100vh - 280px)' }}>
                {/* Submission List */}
                <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '14px 20px', fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #27272a', fontWeight: 500 }}>All Submissions</div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {submissions.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#52525b', fontSize: '0.875rem' }}>No submissions found</div>
                        ) : (
                            submissions.map(sub => (
                                <div key={sub.id} onClick={() => setSelectedSubmission(sub)} style={{ padding: '14px 20px', borderBottom: '1px solid #27272a', cursor: 'pointer', background: selectedSubmission?.id === sub.id ? 'rgba(255,255,255,0.02)' : 'transparent', borderLeft: selectedSubmission?.id === sub.id ? '2px solid #fafafa' : '2px solid transparent', transition: 'all 0.2s ease' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        {getStatusIcon(sub.status)}
                                        <div style={{ flex: 1 }}>
                                            <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#fafafa' }}>{formatDate(sub.submittedAt)}</span>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: '2px 8px',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 500,
                                                    textTransform: 'capitalize',
                                                    color: getStatusColor(sub.status),
                                                    background: `${getStatusColor(sub.status)}1a`,
                                                    border: `1px solid ${getStatusColor(sub.status)}33`
                                                }}>
                                                    {sub.status.replace('_', ' ')}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Score: {sub.score}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#71717a', paddingLeft: '28px', flexWrap: 'wrap' }}>
                                        <span title="Runtime">{sub.executionTime}ms</span>
                                        <span title="Memory">{Math.round(sub.memoryUsed / 1024)}MB</span>
                                        {sub.hintsUsed > 0 && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#eab308' }} title={`${sub.hintsUsed} Hints Used`}>
                                                <Lightbulb size={12} /> {sub.hintsUsed}
                                            </span>
                                        )}
                                        {sub.usedSolution && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#a855f7' }} title="AI Solution Used">
                                                <Brain size={12} /> AI
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Detailed View */}
                <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {selectedSubmission ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #27272a' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa', fontSize: '0.875rem' }}>
                                        <Code size={16} /><span>solution.{selectedSubmission.language === 'python' ? 'py' : selectedSubmission.language === 'javascript' ? 'js' : 'cpp'}</span>
                                    </div>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(59,130,246,0.15)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, color: '#3b82f6' }}>{selectedSubmission.language}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '0.875rem', color: '#fafafa', fontWeight: 600 }}>Score: {selectedSubmission.score}</span>
                                    <button
                                        onClick={() => openEditScoreModal(selectedSubmission)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}
                                    >
                                        <Edit2 size={12} /> Edit Score
                                    </button>
                                </div>
                            </div>

                            {/* AI Usage Banner if applicable */}
                            {(selectedSubmission.hintsUsed > 0 || selectedSubmission.usedSolution) && (
                                <div style={{ padding: '8px 16px', background: 'rgba(168, 85, 247, 0.1)', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
                                    {selectedSubmission.hintsUsed > 0 && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d8b4fe' }}>
                                            <Lightbulb size={14} /> Only partial points recommended (used {selectedSubmission.hintsUsed} hints)
                                        </span>
                                    )}
                                    {selectedSubmission.usedSolution && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc', fontWeight: 500 }}>
                                            <Brain size={14} /> AI Solution Used (0 points recommended)
                                        </span>
                                    )}
                                </div>
                            )}

                            <div style={{ flex: 1, padding: '20px', overflow: 'auto', background: 'rgba(0,0,0,0.3)' }}>
                                <pre style={{ margin: 0 }}><code style={{ fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.6, color: '#fafafa', whiteSpace: 'pre-wrap' }}>{selectedSubmission.sourceCode}</code></pre>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#52525b', fontSize: '0.875rem' }}>Select a submission to view details</div>
                    )}
                </div>
            </div>

            {/* Edit Score Modal */}
            {showEditScoreModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', padding: '24px', width: '400px', maxWidth: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#fafafa', fontSize: '1.25rem' }}>Edit Score</h3>
                            <button onClick={() => setShowEditScoreModal(false)} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '8px' }}>Score</label>
                            <input
                                type="number"
                                value={editingScore}
                                onChange={(e) => setEditingScore(parseInt(e.target.value) || 0)}
                                style={{ width: '100%', padding: '10px', background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', outline: 'none' }}
                            />
                            <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#71717a' }}>Manually adjusting the score will update the participant's total contest score.</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setShowEditScoreModal(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #27272a', borderRadius: '6px', color: '#a1a1aa', cursor: 'pointer' }}>Cancel</button>
                            <button
                                onClick={handleUpdateScore}
                                disabled={updatingScore}
                                style={{ padding: '8px 20px', background: '#2563eb', border: 'none', borderRadius: '6px', color: '#fff', cursor: updatingScore ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {updatingScore ? 'Saving...' : <><Save size={16} /> Save Score</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Submissions;
