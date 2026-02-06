import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, Send, XCircle, Clock, GripVertical, ChevronRight, Check, X, Plus } from 'lucide-react';
import Editor from '@monaco-editor/react';
import Split from 'react-split';

interface Task {
    id: number;
    contestId: number;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    maxPoints: number;
    orderIndex: number;
    allowedLanguages: string[];
}

interface Contest {
    id: number;
    title: string;
    duration: number;
    status: string;
}

interface TestCase {
    id: number;
    input: string;
    expectedOutput: string;
    actualOutput?: string;
    passed?: boolean;
    executionTime?: number;
}

interface SubmissionHistory {
    id: number;
    timestamp: Date;
    status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
    runtime: string;
    memory: string;
    language: string;
}

const LANGUAGE_BOILERPLATES: Record<string, string> = {
    javascript: '// Write your JavaScript solution here\nfunction solve(nums, target) {\n    // Your code here\n    return [];\n}\n',
    typescript: '// Write your TypeScript solution here\nfunction solve(nums: number[], target: number): number[] {\n    // Your code here\n    return [];\n}\n',
    python: '# Write your Python solution here\ndef solve(nums, target):\n    # Your code here\n    pass\n',
    java: '// Write your Java solution here\nclass Solution {\n    public int[] solve(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}\n',
    cpp: '// Write your C++ solution here\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solve(vector<int>& nums, int target) {\n        // Your code here\n        return {};\n    }\n};\n',
};

const getFileExtension = (lang: string): string => {
    switch (lang) {
        case 'javascript': return 'js';
        case 'typescript': return 'ts';
        case 'python': return 'py';
        case 'java': return 'java';
        case 'cpp': return 'cpp';
        default: return 'txt';
    }
};

const TaskPage: React.FC = () => {
    const navigate = useNavigate();
    const { id: contestId } = useParams<{ id: string }>();

    // Data state
    const [task, setTask] = useState<Task | null>(null);
    const [contest, setContest] = useState<Contest | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Timer state
    const [time, setTime] = useState<number>(45 * 60);

    // Editor state
    const [language, setLanguage] = useState<string>('javascript');
    const [code, setCode] = useState<string>(LANGUAGE_BOILERPLATES['javascript']);

    // Panel resize state
    const [leftPanelWidth, setLeftPanelWidth] = useState<number>(40);
    const [editorHeight, setEditorHeight] = useState<number>(60);
    const [isResizingHorizontal, setIsResizingHorizontal] = useState<boolean>(false);
    const [isResizingVertical, setIsResizingVertical] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);

    // Tab state
    const [leftActiveTab, setLeftActiveTab] = useState<'description' | 'submissions'>('description');
    const [testCaseActiveTab, setTestCaseActiveTab] = useState<number>(0);

    // Test execution state
    const [showTestCases, setShowTestCases] = useState<boolean>(false);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [testCases, setTestCases] = useState<TestCase[]>([
        { id: 1, input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]' },
        { id: 2, input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]' },
        { id: 3, input: 'nums = [3,3], target = 6', expectedOutput: '[0,1]' },
    ]);

    // Submission history
    const [submissions, setSubmissions] = useState<SubmissionHistory[]>([
        { id: 1, timestamp: new Date(Date.now() - 3600000), status: 'Wrong Answer', runtime: '52 ms', memory: '42.1 MB', language: 'JavaScript' },
        { id: 2, timestamp: new Date(Date.now() - 7200000), status: 'Time Limit Exceeded', runtime: 'N/A', memory: 'N/A', language: 'JavaScript' },
    ]);

    // Fetch task data
    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch(`/api/contests/${contestId}/tasks`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch tasks');
                }

                const data = await response.json();
                if (data.tasks && data.tasks.length > 0) {
                    setTask(data.tasks[0]);
                    setContest(data.contest);
                    if (data.tasks[0].allowedLanguages?.length > 0) {
                        const initialLang = data.tasks[0].allowedLanguages[0];
                        setLanguage(initialLang);
                        setCode(LANGUAGE_BOILERPLATES[initialLang] || LANGUAGE_BOILERPLATES['javascript']);
                    }
                    if (data.contest?.duration) {
                        setTime(data.contest.duration * 60);
                    }
                } else {
                    setError('No tasks found');
                }
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load task');
                setLoading(false);
            }
        };

        if (contestId) fetchTaskData();
        else {
            setError('No contest ID');
            setLoading(false);
        }
    }, [contestId, navigate]);

    // Timer countdown
    useEffect(() => {
        const interval = setInterval(() => setTime(prev => prev > 0 ? prev - 1 : 0), 1000);
        return () => clearInterval(interval);
    }, []);

    // Horizontal resize handlers
    const handleHorizontalMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizingHorizontal(true);
    }, []);

    const handleHorizontalMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizingHorizontal || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
        setLeftPanelWidth(Math.min(70, Math.max(25, newWidth)));
    }, [isResizingHorizontal]);

    const handleHorizontalMouseUp = useCallback(() => {
        setIsResizingHorizontal(false);
    }, []);

    // Vertical resize handlers
    const handleVerticalMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizingVertical(true);
    }, []);

    const handleVerticalMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizingVertical || !rightPanelRef.current) return;
        const rect = rightPanelRef.current.getBoundingClientRect();
        const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
        setEditorHeight(Math.min(85, Math.max(30, newHeight)));
    }, [isResizingVertical]);

    const handleVerticalMouseUp = useCallback(() => {
        setIsResizingVertical(false);
    }, []);

    // Mouse event listeners
    useEffect(() => {
        if (isResizingHorizontal) {
            document.addEventListener('mousemove', handleHorizontalMouseMove);
            document.addEventListener('mouseup', handleHorizontalMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }
        return () => {
            document.removeEventListener('mousemove', handleHorizontalMouseMove);
            document.removeEventListener('mouseup', handleHorizontalMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizingHorizontal, handleHorizontalMouseMove, handleHorizontalMouseUp]);

    useEffect(() => {
        if (isResizingVertical) {
            document.addEventListener('mousemove', handleVerticalMouseMove);
            document.addEventListener('mouseup', handleVerticalMouseUp);
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
        }
        return () => {
            document.removeEventListener('mousemove', handleVerticalMouseMove);
            document.removeEventListener('mouseup', handleVerticalMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizingVertical, handleVerticalMouseMove, handleVerticalMouseUp]);

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleLanguageChange = (newLang: string) => {
        const currentBoilerplate = LANGUAGE_BOILERPLATES[language];
        if (code !== currentBoilerplate && !window.confirm('Switching languages will reset your code. Continue?')) return;
        setCode(LANGUAGE_BOILERPLATES[newLang] || LANGUAGE_BOILERPLATES['javascript']);
        setLanguage(newLang);
    };

    const handleRun = async () => {
        setIsRunning(true);
        setShowTestCases(true);
        setEditorHeight(60);

        // Simulate test execution
        await new Promise(resolve => setTimeout(resolve, 1500));

        const updatedCases = testCases.map(tc => ({
            ...tc,
            actualOutput: tc.expectedOutput,
            passed: Math.random() > 0.3,
            executionTime: Math.floor(Math.random() * 100) + 10,
        }));
        setTestCases(updatedCases);
        setIsRunning(false);
    };

    const handleSubmit = async () => {
        setIsRunning(true);
        setShowTestCases(true);
        setEditorHeight(60);

        await new Promise(resolve => setTimeout(resolve, 2000));

        const newSubmission: SubmissionHistory = {
            id: submissions.length + 1,
            timestamp: new Date(),
            status: Math.random() > 0.5 ? 'Accepted' : 'Wrong Answer',
            runtime: `${Math.floor(Math.random() * 100) + 20} ms`,
            memory: `${(Math.random() * 10 + 40).toFixed(1)} MB`,
            language: language.charAt(0).toUpperCase() + language.slice(1),
        };
        setSubmissions([newSubmission, ...submissions]);

        const updatedCases = testCases.map(tc => ({
            ...tc,
            actualOutput: tc.expectedOutput,
            passed: newSubmission.status === 'Accepted',
            executionTime: Math.floor(Math.random() * 100) + 10,
        }));
        setTestCases(updatedCases);
        setIsRunning(false);
    };

    const getDifficultyStyles = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' };
            case 'Medium': return { background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' };
            case 'Hard': return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
            default: return { background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)' };
        }
    };

    // Log contest for debugging
    console.log('Contest:', contest?.title);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, border: '3px solid rgba(253, 230, 138, 0.2)', borderTopColor: '#FDE68A', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
                    <p style={{ fontSize: '0.85rem', margin: 0, color: 'rgba(255, 255, 255, 0.5)' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '16px 24px', borderRadius: 12, fontSize: '0.9rem' }}>
                    {error || 'Task not found'}
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', width: '100vw', background: '#0a0a0b', color: '#fff', fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Navbar */}
            <nav style={{ height: 56, minHeight: 56, background: '#111113', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                        <circle cx="14" cy="14" r="12" stroke="url(#lg)" strokeWidth="1.5" />
                        <circle cx="14" cy="14" r="5" fill="url(#lg)" />
                        <defs><linearGradient id="lg" x1="0" y1="0" x2="28" y2="28"><stop offset="0%" stopColor="#FDE68A" /><stop offset="100%" stopColor="#F59E0B" /></linearGradient></defs>
                    </svg>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#FDE68A' }}>Code Combat</span>
                    <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{task.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'rgba(253,230,138,0.1)', border: '1px solid rgba(253,230,138,0.2)', borderRadius: 6 }}>
                        <Clock size={13} style={{ color: '#FDE68A' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#FDE68A', fontFamily: 'monospace' }}>{formatTime(time)}</span>
                    </div>
                    <button onClick={() => navigate('/player')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#f87171', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                        <XCircle size={14} />
                        Exit
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div ref={containerRef} style={{ flex: 1, display: 'flex', padding: 6, gap: 0, overflow: 'hidden' }}>
                {/* Left Panel */}
                <div style={{ width: `calc(${leftPanelWidth}% - 4px)`, height: '100%', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
                    {/* Left Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255, 255, 255, 0.03)' }}>
                        {(['description', 'submissions'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setLeftActiveTab(tab)}
                                style={{
                                    padding: '10px 16px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: leftActiveTab === tab ? '2px solid #FDE68A' : '2px solid transparent',
                                    color: leftActiveTab === tab ? '#FDE68A' : 'rgba(255,255,255,0.5)',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Left Content */}
                    <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                        {leftActiveTab === 'description' ? (
                            <>
                                {/* Task Header */}
                                <div style={{ marginBottom: 16 }}>
                                    <h1 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 600 }}>{task.title}</h1>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, ...getDifficultyStyles(task.difficulty) }}>
                                            {task.difficulty}
                                        </span>
                                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                                            {task.maxPoints} pts
                                        </span>
                                    </div>
                                </div>
                                {/* Description */}
                                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                    {task.description}
                                </div>
                                {/* Example Section */}
                                <div style={{ marginTop: 20 }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'rgba(255,255,255,0.9)' }}>Examples</h3>
                                    {testCases.slice(0, 2).map((tc, i) => (
                                        <div key={tc.id} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: 12, marginBottom: 10, fontFamily: 'monospace', fontSize: 13 }}>
                                            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Example {i + 1}:</div>
                                            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Input: {tc.input}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Output: {tc.expectedOutput}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            /* Submissions Tab */
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Submission History</h3>
                                {submissions.length === 0 ? (
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>No submissions yet</p>
                                ) : (
                                    submissions.map(sub => (
                                        <div key={sub.id} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: 12, marginBottom: 8 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                <span style={{ fontSize: 13, fontWeight: 600, color: sub.status === 'Accepted' ? '#34d399' : '#f87171' }}>
                                                    {sub.status}
                                                </span>
                                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                                                    {sub.timestamp.toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                                                {sub.language} • {sub.runtime} • {sub.memory}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Horizontal Resize Handle */}
                <div
                    onMouseDown={handleHorizontalMouseDown}
                    style={{ width: 8, cursor: 'col-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                    <div style={{ width: 3, height: 30, borderRadius: 2, background: isResizingHorizontal ? 'rgba(253,230,138,0.5)' : 'rgba(255,255,255,0.1)', transition: 'background 0.15s' }}>
                        <GripVertical size={10} style={{ opacity: 0 }} />
                    </div>
                </div>

                {/* Right Panel */}
                <div ref={rightPanelRef} style={{ width: `calc(${100 - leftPanelWidth}% - 4px)`, height: '100%', display: 'flex', flexDirection: 'column', gap: 0, flexShrink: 0 }}>
                    {/* Editor Section */}
                    <div style={{ height: showTestCases ? `calc(${editorHeight}% - 4px)` : '100%', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Editor Header */}
                        <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <select
                                    value={language}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    style={{ padding: '5px 24px 5px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, color: '#fff', fontSize: 12, cursor: 'pointer' }}
                                >
                                    {(task?.allowedLanguages?.length ? task.allowedLanguages : ['javascript', 'typescript', 'python']).map(lang => (
                                        <option key={lang} value={lang} style={{ background: 'rgba(255, 255, 255, 0.03)' }}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                                solution.{getFileExtension(language)}
                            </span>
                        </div>

                        {/* Monaco Editor */}
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <Editor
                                key={`${task.id}-${language}`}
                                height="100%"
                                language={language}
                                value={code}
                                onChange={(v) => v !== undefined && setCode(v)}
                                theme="vs-dark"
                                options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: 'on', scrollBeyondLastLine: false, automaticLayout: true, tabSize: 2, wordWrap: 'on', padding: { top: 12 }, fontFamily: "'JetBrains Mono', monospace" }}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button
                                onClick={handleRun}
                                disabled={isRunning}
                                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: 'rgba(255,255,255,0.8)', fontSize: 13, cursor: isRunning ? 'not-allowed' : 'pointer', opacity: isRunning ? 0.6 : 1 }}
                            >
                                <Play size={14} />
                                {isRunning ? 'Running...' : 'Run'}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isRunning}
                                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, color: '#34d399', fontSize: 13, fontWeight: 500, cursor: isRunning ? 'not-allowed' : 'pointer', opacity: isRunning ? 0.6 : 1 }}
                            >
                                <Send size={14} />
                                Submit
                            </button>
                        </div>
                    </div>

                    {/* Vertical Resize Handle (only when test cases visible) */}
                    {showTestCases && (
                        <div
                            onMouseDown={handleVerticalMouseDown}
                            style={{ height: 8, cursor: 'row-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        >
                            <div style={{ width: 30, height: 3, borderRadius: 2, background: isResizingVertical ? 'rgba(253,230,138,0.5)' : 'rgba(255,255,255,0.1)', transition: 'background 0.15s' }} />
                        </div>
                    )}

                    {/* Test Cases Section */}
                    {showTestCases && (
                        <div style={{ height: `calc(${100 - editorHeight}% - 4px)`, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {/* Test Case Tabs */}
                            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 8px', background: 'rgba(255, 255, 255, 0.03)', gap: 2 }}>
                                <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)', padding: '8px 8px 8px 4px' }}>Testcase</span>
                                {testCases.map((tc, i) => (
                                    <button
                                        key={tc.id}
                                        onClick={() => setTestCaseActiveTab(i)}
                                        style={{
                                            padding: '6px 12px',
                                            background: testCaseActiveTab === i ? 'rgba(255,255,255,0.08)' : 'transparent',
                                            border: 'none',
                                            borderRadius: 4,
                                            color: testCaseActiveTab === i ? '#fff' : 'rgba(255,255,255,0.5)',
                                            fontSize: 12,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                        }}
                                    >
                                        {tc.passed !== undefined && (
                                            tc.passed ? <Check size={12} style={{ color: '#34d399' }} /> : <X size={12} style={{ color: '#f87171' }} />
                                        )}
                                        Case {i + 1}
                                    </button>
                                ))}
                                <button style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                                    <Plus size={14} />
                                </button>
                            </div>

                            {/* Test Case Content */}
                            <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
                                {testCases[testCaseActiveTab] && (
                                    <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
                                        <div style={{ marginBottom: 12 }}>
                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 4 }}>Input</div>
                                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 4, color: 'rgba(255,255,255,0.9)' }}>
                                                {testCases[testCaseActiveTab].input}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: 12 }}>
                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 4 }}>Expected Output</div>
                                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 4, color: 'rgba(255,255,255,0.9)' }}>
                                                {testCases[testCaseActiveTab].expectedOutput}
                                            </div>
                                        </div>
                                        {testCases[testCaseActiveTab].actualOutput && (
                                            <div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 4 }}>Your Output</div>
                                                <div style={{
                                                    background: testCases[testCaseActiveTab].passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                                    border: `1px solid ${testCases[testCaseActiveTab].passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                                    padding: 10,
                                                    borderRadius: 4,
                                                    color: testCases[testCaseActiveTab].passed ? '#34d399' : '#f87171',
                                                }}>
                                                    {testCases[testCaseActiveTab].actualOutput}
                                                    {testCases[testCaseActiveTab].executionTime && (
                                                        <span style={{ marginLeft: 12, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                                                            {testCases[testCaseActiveTab].executionTime}ms
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskPage;
