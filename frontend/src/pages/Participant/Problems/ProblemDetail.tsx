import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
    ArrowLeft, Play, Send, CheckCircle2, XCircle, Clock, Cpu,
    ChevronDown, Lightbulb, Tag, BarChart3, Loader2
} from 'lucide-react';

interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
}

interface Problem {
    id: number;
    title: string;
    slug: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    tags: any[];
    hints: any[];
    starterCode: Record<string, string> | null;
    testCases: TestCase[];
    totalSubmissions: number;
    acceptedSubmissions: number;
    acceptanceRate: string;
    userProgress: any;
}

interface TestResult {
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    time?: string;
    memory?: string;
    error?: string;
}

const LANGUAGE_MAP: Record<string, { id: number; label: string; monacoLang: string }> = {
    javascript: { id: 63, label: 'JavaScript', monacoLang: 'javascript' },
    python: { id: 71, label: 'Python 3', monacoLang: 'python' },
    cpp: { id: 54, label: 'C++', monacoLang: 'cpp' },
    java: { id: 62, label: 'Java', monacoLang: 'java' },
    typescript: { id: 74, label: 'TypeScript', monacoLang: 'typescript' },
};

const ProblemDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');
    const [outputTab, setOutputTab] = useState<'testcases' | 'result'>('testcases');
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [showHints, setShowHints] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ status: string; passed: number; total: number; time?: string; memory?: string } | null>(null);

    // Load problem
    useEffect(() => {
        if (!slug) return;
        loadProblem();
    }, [slug]);

    const loadProblem = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            const res = await fetch(`/api/problems/${slug}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error('Problem not found');
            const data = await res.json();
            setProblem(data.problem);

            // Set starter code
            const starter = data.problem.starterCode;
            if (starter && starter[language]) {
                setCode(starter[language]);
            } else if (starter) {
                const firstLang = Object.keys(starter)[0];
                if (firstLang) {
                    setLanguage(firstLang);
                    setCode(starter[firstLang]);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load problem');
        } finally {
            setLoading(false);
        }
    };

    // Change language -> update starter code
    const handleLanguageChange = useCallback((lang: string) => {
        setLanguage(lang);
        if (problem?.starterCode && problem.starterCode[lang]) {
            setCode(problem.starterCode[lang]);
        }
        setTestResults([]);
        setSubmitResult(null);
    }, [problem]);

    // Run code against visible test cases
    const handleRun = async () => {
        if (!problem || !code.trim()) return;
        setRunning(true);
        setTestResults([]);
        setSubmitResult(null);
        setOutputTab('result');

        try {
            const token = sessionStorage.getItem('token');
            const visibleTests = (problem.testCases || []).filter((tc: any) => !tc.isHidden);

            const results: TestResult[] = [];

            for (const tc of visibleTests.slice(0, 3)) {
                const res = await fetch('/api/submissions/run', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: JSON.stringify({
                        code,
                        language,
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                    }),
                });
                const data = await res.json();

                const actual = (data.stdout || '').trim();
                const expected = (tc.expectedOutput || '').trim();

                results.push({
                    passed: actual === expected && !data.stderr && data.status?.id !== 5,
                    input: tc.input,
                    expected,
                    actual: data.stderr || data.compile_output || actual || 'No output',
                    time: data.time,
                    memory: data.memory,
                    error: data.stderr || data.compile_output || undefined,
                });
            }

            setTestResults(results);
        } catch (err) {
            console.error('Run error:', err);
            setTestResults([{ passed: false, input: '', expected: '', actual: 'Error running code', error: 'Network error' }]);
        } finally {
            setRunning(false);
        }
    };

    // Submit code
    const handleSubmit = async () => {
        if (!problem || !code.trim()) return;
        setSubmitting(true);
        setSubmitResult(null);
        setTestResults([]);
        setOutputTab('result');

        try {
            const token = sessionStorage.getItem('token');
            const allTests = problem.testCases || [];
            let passed = 0;
            let totalTime = 0;
            let totalMemory = 0;
            const results: TestResult[] = [];

            for (const tc of allTests) {
                const res = await fetch('/api/submissions/run', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: JSON.stringify({
                        code,
                        language,
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                    }),
                });
                const data = await res.json();

                const actual = (data.stdout || '').trim();
                const expected = (tc.expectedOutput || '').trim();
                const isPassed = actual === expected && !data.stderr && data.status?.id !== 5;

                if (isPassed) passed++;
                if (data.time) totalTime += parseFloat(data.time);
                if (data.memory) totalMemory += parseFloat(data.memory);

                if (!tc.isHidden) {
                    results.push({
                        passed: isPassed,
                        input: tc.input,
                        expected,
                        actual: data.stderr || data.compile_output || actual || 'No output',
                        time: data.time,
                        memory: data.memory,
                        error: data.stderr || data.compile_output || undefined,
                    });
                }
            }

            const status = passed === allTests.length ? 'accepted' : 'wrong_answer';

            // Save submission to backend
            await fetch(`/api/problems/${problem.id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify({
                    code,
                    language,
                    status,
                    testCasesPassed: passed,
                    totalTestCases: allTests.length,
                    executionTime: totalTime > 0 ? `${totalTime.toFixed(3)}s` : undefined,
                    memoryUsed: totalMemory > 0 ? `${(totalMemory / 1024).toFixed(2)} MB` : undefined,
                }),
            });

            setTestResults(results);
            setSubmitResult({
                status,
                passed,
                total: allTests.length,
                time: totalTime > 0 ? `${totalTime.toFixed(3)}s` : undefined,
                memory: totalMemory > 0 ? `${(totalMemory / 1024).toFixed(2)} MB` : undefined,
            });

            // Reload problem for updated stats
            loadProblem();
        } catch (err) {
            console.error('Submit error:', err);
            setSubmitResult({ status: 'error', passed: 0, total: 0 });
        } finally {
            setSubmitting(false);
        }
    };

    // Load submissions
    const loadSubmissions = async () => {
        if (!problem) return;
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`/api/problems/${problem.id}/submissions`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data.submissions || []);
            }
        } catch (err) {
            console.error('Failed to load submissions:', err);
        }
    };

    useEffect(() => {
        if (activeTab === 'submissions' && problem) loadSubmissions();
    }, [activeTab, problem]);

    const getDiffColor = (d: string) => {
        if (d === 'Easy') return '#22c55e';
        if (d === 'Medium') return '#eab308';
        return '#ef4444';
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#09090b', color: '#a1a1aa' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
                    <p>Loading problem...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (error || !problem) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#09090b', color: '#ef4444' }}>
                <div style={{ textAlign: 'center' }}>
                    <XCircle size={32} style={{ marginBottom: '12px' }} />
                    <p>{error || 'Problem not found'}</p>
                    <button
                        onClick={() => navigate('/player/problems')}
                        style={{ marginTop: '16px', padding: '8px 16px', background: '#27272a', color: '#fafafa', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        Back to Problems
                    </button>
                </div>
            </div>
        );
    }

    const visibleTestCases = (problem.testCases || []).filter((tc: any) => !tc.isHidden);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#09090b', color: '#fafafa' }}>
            {/* Top Bar */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 16px', borderBottom: '1px solid #27272a', background: '#0a0a0b',
                height: '48px', flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/player/problems')}
                        style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                    >
                        <ArrowLeft size={16} /> Problems
                    </button>
                    <span style={{ color: '#27272a' }}>|</span>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{problem.title}</span>
                    <span style={{
                        padding: '2px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
                        background: `${getDiffColor(problem.difficulty)}18`, color: getDiffColor(problem.difficulty),
                        border: `1px solid ${getDiffColor(problem.difficulty)}30`,
                    }}>
                        {problem.difficulty}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Language selector */}
                    <div style={{ position: 'relative' }}>
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            style={{
                                background: '#18181b', border: '1px solid #27272a', borderRadius: '6px',
                                color: '#fafafa', padding: '5px 28px 5px 10px', fontSize: '0.8rem', outline: 'none', cursor: 'pointer',
                                appearance: 'none',
                            }}
                        >
                            {Object.entries(LANGUAGE_MAP).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#71717a' }} />
                    </div>
                    <button
                        onClick={handleRun}
                        disabled={running || submitting}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 14px',
                            background: '#18181b', border: '1px solid #27272a', borderRadius: '6px',
                            color: '#22c55e', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                            opacity: running || submitting ? 0.5 : 1,
                        }}
                    >
                        {running ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={14} />}
                        Run
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={running || submitting}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 14px',
                            background: '#22c55e', border: 'none', borderRadius: '6px',
                            color: '#000', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                            opacity: running || submitting ? 0.5 : 1,
                        }}
                    >
                        {submitting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                        Submit
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left Panel - Description */}
                <div style={{ width: '40%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #27272a' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #27272a', background: '#0a0a0b' }}>
                        <button
                            onClick={() => setActiveTab('description')}
                            style={{
                                padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
                                color: activeTab === 'description' ? '#fafafa' : '#71717a',
                                borderBottom: activeTab === 'description' ? '2px solid #fbbf24' : '2px solid transparent',
                                fontSize: '0.82rem', fontWeight: 500,
                            }}
                        >
                            Description
                        </button>
                        <button
                            onClick={() => setActiveTab('submissions')}
                            style={{
                                padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
                                color: activeTab === 'submissions' ? '#fafafa' : '#71717a',
                                borderBottom: activeTab === 'submissions' ? '2px solid #fbbf24' : '2px solid transparent',
                                fontSize: '0.82rem', fontWeight: 500,
                            }}
                        >
                            Submissions
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                        {activeTab === 'description' ? (
                            <div>
                                {/* Description */}
                                <div
                                    style={{ fontSize: '0.875rem', lineHeight: 1.7, color: '#d4d4d8' }}
                                    dangerouslySetInnerHTML={{ __html: problem.description }}
                                />

                                {/* Tags */}
                                {problem.tags && (problem.tags as string[]).length > 0 && (
                                    <div style={{ marginTop: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#71717a', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                            <Tag size={12} /> Topics
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {(problem.tags as string[]).map((tag, i) => (
                                                <span key={i} style={{
                                                    padding: '3px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid #27272a',
                                                    borderRadius: '6px', fontSize: '0.75rem', color: '#a1a1aa',
                                                }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Hints */}
                                {problem.hints && (problem.hints as string[]).length > 0 && (
                                    <div style={{ marginTop: '20px' }}>
                                        <button
                                            onClick={() => setShowHints(!showHints)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
                                                color: '#fbbf24', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, padding: 0,
                                            }}
                                        >
                                            <Lightbulb size={14} />
                                            {showHints ? 'Hide Hints' : `Show Hints (${(problem.hints as string[]).length})`}
                                        </button>
                                        {showHints && (
                                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {(problem.hints as string[]).map((hint, i) => (
                                                    <div key={i} style={{
                                                        padding: '10px 14px', background: 'rgba(251,191,36,0.05)',
                                                        border: '1px solid rgba(251,191,36,0.15)', borderRadius: '8px',
                                                        fontSize: '0.82rem', color: '#d4d4d8',
                                                    }}>
                                                        <strong style={{ color: '#fbbf24' }}>Hint {i + 1}:</strong> {hint}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Stats */}
                                <div style={{
                                    marginTop: '24px', display: 'flex', gap: '20px', padding: '14px',
                                    background: 'rgba(255,255,255,0.02)', border: '1px solid #27272a', borderRadius: '8px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <BarChart3 size={14} color="#71717a" />
                                        <span style={{ fontSize: '0.78rem', color: '#71717a' }}>Acceptance:</span>
                                        <span style={{ fontSize: '0.78rem', color: '#fafafa', fontWeight: 500 }}>{problem.acceptanceRate}%</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Send size={14} color="#71717a" />
                                        <span style={{ fontSize: '0.78rem', color: '#71717a' }}>Submissions:</span>
                                        <span style={{ fontSize: '0.78rem', color: '#fafafa', fontWeight: 500 }}>{problem.totalSubmissions}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Submissions Tab */
                            <div>
                                {submissions.length === 0 ? (
                                    <p style={{ color: '#71717a', textAlign: 'center', paddingTop: '40px', fontSize: '0.875rem' }}>No submissions yet</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {submissions.map((sub: any) => (
                                            <div key={sub.id} style={{
                                                padding: '12px 16px', background: 'rgba(255,255,255,0.02)',
                                                border: '1px solid #27272a', borderRadius: '8px',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {sub.status === 'accepted' ? (
                                                        <CheckCircle2 size={16} color="#22c55e" />
                                                    ) : (
                                                        <XCircle size={16} color="#ef4444" />
                                                    )}
                                                    <span style={{
                                                        fontSize: '0.82rem', fontWeight: 500,
                                                        color: sub.status === 'accepted' ? '#22c55e' : '#ef4444',
                                                    }}>
                                                        {sub.status === 'accepted' ? 'Accepted' : 'Wrong Answer'}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: '#71717a' }}>
                                                        {sub.language}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#71717a' }}>
                                                    <span>{sub.testCasesPassed}/{sub.totalTestCases} passed</span>
                                                    {sub.executionTime && <span><Clock size={12} style={{ marginRight: '3px' }} />{sub.executionTime}</span>}
                                                    <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Editor + Output */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Code Editor */}
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Editor
                            height="100%"
                            language={LANGUAGE_MAP[language]?.monacoLang || 'javascript'}
                            value={code}
                            onChange={(val) => setCode(val || '')}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                padding: { top: 12, bottom: 12 },
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                lineNumbers: 'on',
                                renderLineHighlight: 'line',
                                automaticLayout: true,
                            }}
                        />
                    </div>

                    {/* Output Panel */}
                    <div style={{
                        height: '220px', borderTop: '1px solid #27272a', display: 'flex', flexDirection: 'column',
                        flexShrink: 0, background: '#0a0a0b',
                    }}>
                        {/* Output Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #27272a', padding: '0 12px' }}>
                            <button
                                onClick={() => setOutputTab('testcases')}
                                style={{
                                    padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer',
                                    color: outputTab === 'testcases' ? '#fafafa' : '#71717a', fontSize: '0.78rem', fontWeight: 500,
                                    borderBottom: outputTab === 'testcases' ? '2px solid #fbbf24' : '2px solid transparent',
                                }}
                            >
                                Test Cases
                            </button>
                            <button
                                onClick={() => setOutputTab('result')}
                                style={{
                                    padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer',
                                    color: outputTab === 'result' ? '#fafafa' : '#71717a', fontSize: '0.78rem', fontWeight: 500,
                                    borderBottom: outputTab === 'result' ? '2px solid #fbbf24' : '2px solid transparent',
                                }}
                            >
                                Result {testResults.length > 0 && `(${testResults.filter(r => r.passed).length}/${testResults.length})`}
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                            {outputTab === 'testcases' ? (
                                /* Test Cases Preview */
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {visibleTestCases.length === 0 ? (
                                        <p style={{ color: '#71717a', fontSize: '0.82rem' }}>No visible test cases</p>
                                    ) : (
                                        visibleTestCases.slice(0, 3).map((tc, i) => (
                                            <div key={i} style={{
                                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
                                                padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px',
                                                border: '1px solid #1e1e1e',
                                            }}>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: '#71717a', marginBottom: '4px', textTransform: 'uppercase' }}>Input</div>
                                                    <pre style={{ fontSize: '0.78rem', color: '#d4d4d8', margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{tc.input}</pre>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: '#71717a', marginBottom: '4px', textTransform: 'uppercase' }}>Expected</div>
                                                    <pre style={{ fontSize: '0.78rem', color: '#d4d4d8', margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{tc.expectedOutput}</pre>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                /* Results */
                                <div>
                                    {/* Submit result banner */}
                                    {submitResult && (
                                        <div style={{
                                            padding: '10px 14px', marginBottom: '10px', borderRadius: '8px',
                                            background: submitResult.status === 'accepted' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                                            border: `1px solid ${submitResult.status === 'accepted' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {submitResult.status === 'accepted' ? <CheckCircle2 size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
                                                <span style={{
                                                    fontWeight: 600, fontSize: '0.88rem',
                                                    color: submitResult.status === 'accepted' ? '#22c55e' : '#ef4444',
                                                }}>
                                                    {submitResult.status === 'accepted' ? 'Accepted' : 'Wrong Answer'}
                                                </span>
                                                <span style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>
                                                    {submitResult.passed}/{submitResult.total} test cases passed
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem', color: '#71717a' }}>
                                                {submitResult.time && <span><Clock size={12} style={{ marginRight: '3px' }} />{submitResult.time}</span>}
                                                {submitResult.memory && <span><Cpu size={12} style={{ marginRight: '3px' }} />{submitResult.memory}</span>}
                                            </div>
                                        </div>
                                    )}

                                    {(running || submitting) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa', fontSize: '0.82rem', padding: '10px' }}>
                                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                            {running ? 'Running test cases...' : 'Submitting solution...'}
                                        </div>
                                    )}

                                    {testResults.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {testResults.map((r, i) => (
                                                <div key={i} style={{
                                                    padding: '8px 12px', borderRadius: '6px',
                                                    background: r.passed ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)',
                                                    border: `1px solid ${r.passed ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'}`,
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                        {r.passed ? <CheckCircle2 size={13} color="#22c55e" /> : <XCircle size={13} color="#ef4444" />}
                                                        <span style={{ fontSize: '0.78rem', fontWeight: 500, color: r.passed ? '#22c55e' : '#ef4444' }}>
                                                            Case {i + 1} — {r.passed ? 'Passed' : 'Failed'}
                                                        </span>
                                                    </div>
                                                    {!r.passed && (
                                                        <div style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginTop: '4px' }}>
                                                            <div><span style={{ color: '#71717a' }}>Input:</span> <code style={{ color: '#d4d4d8' }}>{r.input}</code></div>
                                                            <div><span style={{ color: '#71717a' }}>Expected:</span> <code style={{ color: '#22c55e' }}>{r.expected}</code></div>
                                                            <div><span style={{ color: '#71717a' }}>Got:</span> <code style={{ color: '#ef4444' }}>{r.actual}</code></div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!running && !submitting && testResults.length === 0 && !submitResult && (
                                        <p style={{ color: '#52525b', fontSize: '0.82rem', textAlign: 'center', paddingTop: '30px' }}>
                                            Run or submit your code to see results
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemDetail;
