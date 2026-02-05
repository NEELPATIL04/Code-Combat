import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, Send, XCircle, Clock } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface Task {
    id: number;
    contestId: number;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    maxPoints: number;
    orderIndex: number;
}

interface Contest {
    id: number;
    title: string;
    duration: number;
    status: string;
}

const TaskPage: React.FC = () => {
    const navigate = useNavigate();
    const { id: contestId } = useParams<{ id: string }>();
    const [task, setTask] = useState<Task | null>(null);
    const [contest, setContest] = useState<Contest | null>(null);
    const [time, setTime] = useState<number>(45 * 60 + 22);
    const [code, setCode] = useState<string>('// Write your solution here\nfunction solve() {\n    \n}\n');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                console.log('Contest ID from URL:', contestId);
                const token = sessionStorage.getItem('token');
                console.log('Token exists:', !!token);

                if (!token) {
                    console.log('No token found, redirecting to login');
                    navigate('/login');
                    return;
                }

                const apiUrl = `/api/contests/${contestId}/tasks`;
                console.log('Fetching from:', apiUrl);

                // Fetch tasks for the contest
                const response = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Response status:', response.status);
                console.log('Response OK:', response.ok);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                    console.error('API Error:', errorData);
                    throw new Error(errorData.message || 'Failed to fetch tasks');
                }

                const data = await response.json();
                console.log('Received data:', data);

                if (data.tasks && data.tasks.length > 0) {
                    console.log('Setting task:', data.tasks[0]);
                    setTask(data.tasks[0]); // Get the first task
                    setContest(data.contest);

                    // Set timer based on contest duration
                    if (data.contest?.duration) {
                        setTime(data.contest.duration * 60);
                    }
                } else {
                    console.log('No tasks found in response');
                    setError('No tasks found for this contest');
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching task:', err);
                setError(err instanceof Error ? err.message : 'Failed to load task');
                setLoading(false);
            }
        };

        if (contestId) {
            console.log('Starting fetch with contest ID:', contestId);
            fetchTaskData();
        } else {
            console.log('No contest ID provided');
            setError('No contest ID provided');
            setLoading(false);
        }
    }, [contestId, navigate]);

    useEffect(() => {
        const interval = setInterval(() => setTime(prev => prev > 0 ? prev - 1 : 0), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setCode(value);
        }
    };

    const handleRunTests = () => {
        console.log('Running tests with code:', code);
        // TODO: Implement test runner
    };

    const handleSubmit = () => {
        console.log('Submitting code:', code);
        // TODO: Implement submission
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-xl">Loading task...</div>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-xl text-red-500">{error || 'Task not found'}</div>
            </div>
        );
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy':
                return 'bg-emerald-500/15 text-emerald-500';
            case 'Medium':
                return 'bg-amber-500/15 text-amber-500';
            case 'Hard':
                return 'bg-red-500/15 text-red-500';
            default:
                return 'bg-amber-500/15 text-amber-500';
        }
    };

    return (
        <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-[100] py-4 px-8 border-b" style={{
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(255, 255, 255, 0.08)'
            }}>
                <div className="flex justify-between items-center">
                    <a href="/" className="flex items-center gap-2.5 no-underline text-white font-semibold">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <circle cx="14" cy="14" r="12" stroke="url(#logoGrad3)" strokeWidth="1.5" />
                            <circle cx="14" cy="14" r="5" fill="url(#logoGrad3)" />
                            <defs>
                                <linearGradient id="logoGrad3" x1="0" y1="0" x2="28" y2="28">
                                    <stop offset="0%" stopColor="#FDE68A" />
                                    <stop offset="100%" stopColor="#FBBF24" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span style={{
                            background: 'linear-gradient(90deg, #FDE68A 0%, #FBBF24 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>Code Combat</span>
                    </a>
                    <div className="flex items-center gap-5">
                        <span className="text-white/70 text-[0.95rem]">{contest?.title || 'Contest'}</span>
                        <div className="flex items-center gap-2 text-[1.1rem] font-semibold text-yellow-200 font-mono">
                            <Clock size={16} />{formatTime(time)}
                        </div>
                        <button
                            className="flex items-center gap-1.5 py-2 px-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-full font-inherit text-[0.9rem] cursor-pointer transition-all duration-200 hover:bg-red-500/20"
                            onClick={() => navigate('/player')}
                        >
                            <XCircle size={16} /> Abort
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-[1] grid grid-cols-2 gap-6 pt-[88px] px-8 pb-8 h-screen box-border">
                {/* Left Side - Task Description */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col">
                    <div className="py-5 px-6 border-b border-white/[0.08] flex items-center gap-4">
                        <span className={`py-1 px-3 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                            {task.difficulty}
                        </span>
                        <h1 className="m-0 text-[1.3rem] font-medium text-white">{task.title}</h1>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1">
                        <div className="text-white/70 leading-[1.7] whitespace-pre-wrap">
                            {task.description}
                        </div>
                    </div>
                </div>

                {/* Right Side - Monaco Editor */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col">
                    <div className="py-3 px-4 border-b border-white/[0.08] flex items-center">
                        <span className="py-2 px-4 bg-yellow-200/10 text-yellow-200 rounded-lg text-[0.85rem]">solution.ts</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            defaultLanguage="typescript"
                            value={code}
                            onChange={handleEditorChange}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 2,
                                wordWrap: 'on',
                                padding: { top: 16, bottom: 16 },
                                fontFamily: "'JetBrains Mono', 'Consolas', 'Courier New', monospace",
                            }}
                        />
                    </div>
                    <div className="p-4 border-t border-white/[0.08] flex justify-end gap-3">
                        <button
                            className="flex items-center gap-2 py-2.5 px-5 rounded-full font-inherit text-[0.9rem] cursor-pointer bg-white/5 border border-white/15 text-white transition-all duration-200 hover:bg-white/10"
                            onClick={handleRunTests}
                        >
                            <Play size={16} /> Run Tests
                        </button>
                        <button
                            className="flex items-center gap-2 py-2.5 px-5 rounded-full font-inherit text-[0.9rem] cursor-pointer bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 transition-all duration-200 hover:bg-emerald-500/25"
                            onClick={handleSubmit}
                        >
                            <Send size={16} /> Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskPage;
