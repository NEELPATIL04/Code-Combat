import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { XCircle, Clock, ChevronUp, ChevronDown, CheckCircle2, XOctagon, AlertCircle } from 'lucide-react';
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

interface TestResult {
    testCase: number;
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    error?: string;
    executionTime?: number;
    memory?: number;
}

type ConsoleTab = 'testcase' | 'result';
type LeftTab = 'description' | 'submissions' | 'solutions';

const LANGUAGE_BOILERPLATES: Record<string, string> = {
    javascript: '// Write your JavaScript solution here\nfunction solve() {\n    \n}\n',
    typescript: '// Write your TypeScript solution here\nfunction solve() {\n    \n}\n',
    python: '# Write your Python solution here\ndef solve():\n    pass\n',
    java: '// Write your Java solution here\nclass Solution {\n    public static void main(String[] args) {\n        \n    }\n}\n',
    cpp: '// Write your C++ solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n',
    csharp: '// Write your C# solution here\nusing System;\n\nclass Solution {\n    static void Main() {\n        \n    }\n}\n',
    go: '// Write your Go solution here\npackage main\n\nimport "fmt"\n\nfunc main() {\n    \n}\n',
    rust: '// Write your Rust solution here\nfn main() {\n    \n}\n',
    ruby: '# Write your Ruby solution here\ndef solve\n  \nend\n',
    php: '<?php\n// Write your PHP solution here\nfunction solve() {\n    \n}\n?>',
    swift: '// Write your Swift solution here\nimport Foundation\n\nfunc solve() {\n    \n}\n',
    kotlin: '// Write your Kotlin solution here\nfun main() {\n    \n}\n',
    sql: '-- Write your SQL solution here\nSELECT * FROM table;\n',
};

const TaskPage: React.FC = () => {
    const navigate = useNavigate();
    const { id: contestId } = useParams<{ id: string }>();
    const [task, setTask] = useState<Task | null>(null);
    const [contest, setContest] = useState<Contest | null>(null);
    const [time, setTime] = useState<number>(45 * 60 + 22);
    const [language, setLanguage] = useState<string>('javascript');
    const [code, setCode] = useState<string>(LANGUAGE_BOILERPLATES['javascript']);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // UI State
    const [consoleOpen, setConsoleOpen] = useState<boolean>(true);
    const [consoleTab, setConsoleTab] = useState<ConsoleTab>('testcase');
    const [leftTab, setLeftTab] = useState<LeftTab>('description');
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState<boolean>(false);

    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const apiUrl = `/api/contests/${contestId}/tasks`;
                const response = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                    throw new Error(errorData.message || 'Failed to fetch tasks');
                }

                const data = await response.json();

                if (data.tasks && data.tasks.length > 0) {
                    setTask(data.tasks[0]);
                    setContest(data.contest);

                    if (data.tasks[0].allowedLanguages && data.tasks[0].allowedLanguages.length > 0) {
                        const initialLang = data.tasks[0].allowedLanguages[0];
                        setLanguage(initialLang);
                        setCode(LANGUAGE_BOILERPLATES[initialLang] || LANGUAGE_BOILERPLATES['javascript']);
                    }

                    if (data.contest?.duration) {
                        setTime(data.contest.duration * 60);
                    }
                } else {
                    setError('No tasks found for this contest');
                }

                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load task');
                setLoading(false);
            }
        };

        if (contestId) {
            fetchTaskData();
        } else {
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

    const handleLanguageChange = (newLang: string) => {
        const currentBoilerplate = LANGUAGE_BOILERPLATES[language];
        const isDefaultCode = !code.trim() || code === currentBoilerplate;

        if (!isDefaultCode) {
            const confirmReset = window.confirm('Switching languages will reset your current code. Do you want to proceed?');
            if (!confirmReset) return;
        }

        setCode(LANGUAGE_BOILERPLATES[newLang] || LANGUAGE_BOILERPLATES['javascript']);
        setLanguage(newLang);
    };

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setCode(value);
        }
    };

    const handleRunTests = async () => {
        if (!task) return;

        setIsRunning(true);
        setConsoleTab('result');
        setConsoleOpen(true);
        setTestResults([]);

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('/api/submissions/run', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    taskId: task.id,
                    code: code,
                    language: language,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to run code');
            }

            if (data.success && data.data.results) {
                setTestResults(data.data.results);
            }
        } catch (err) {
            console.error('Run code error:', err);
            alert(err instanceof Error ? err.message : 'Failed to execute code. Please make sure Judge0 is running.');
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!task || !contest) return;

        setIsRunning(true);
        setConsoleTab('result');
        setConsoleOpen(true);
        setTestResults([]);

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('/api/submissions/submit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    taskId: task.id,
                    contestId: contest.id,
                    code: code,
                    language: language,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit code');
            }

            if (data.success && data.data.results) {
                setTestResults(data.data.results);
                if (data.data.status === 'accepted') {
                    alert(`🎉 Congratulations! All test cases passed! Score: ${data.data.score}`);
                } else {
                    alert(`${data.data.passed}/${data.data.total} test cases passed. Score: ${data.data.score}`);
                }
            }
        } catch (err) {
            console.error('Submit code error:', err);
            alert(err instanceof Error ? err.message : 'Failed to submit code. Please make sure Judge0 is running.');
        } finally {
            setIsRunning(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center">
                <div className="text-xl">Loading task...</div>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center">
                <div className="text-xl text-red-500">{error || 'Task not found'}</div>
            </div>
        );
    }

    const passedTests = testResults.filter(t => t.passed).length;
    const totalTests = testResults.length;

    return (
        <div className="h-screen bg-[#1a1a1a] text-white flex flex-col">
            {/* Top Navigation */}
            <div className="h-14 bg-[#262626] border-b border-[#3a3a3a] flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <button
                        onClick={() => navigate('/player')}
                        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                    >
                        <div className="relative">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                        <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                            Code Combat
                        </span>
                    </button>

                    <div className="w-px h-6 bg-[#3a3a3a]"></div>

                    <h1 className="text-sm font-medium text-gray-300">{task.title}</h1>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        task.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                        task.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                    }`}>
                        {task.difficulty}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{contest?.title}</span>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <Clock size={16} className="text-orange-500" />
                        <span className="text-orange-500 font-mono text-sm font-semibold">
                            {formatTime(time)}
                        </span>
                    </div>
                    <button
                        onClick={() => navigate('/player')}
                        className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                    >
                        <XCircle size={14} />
                        End Contest
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <Split
                    className="flex h-full"
                    sizes={[50, 50]}
                    minSize={[400, 500]}
                    gutterSize={6}
                    gutterStyle={() => ({
                        backgroundColor: '#3a3a3a',
                        cursor: 'col-resize',
                    })}
                >
                    {/* LEFT PANEL */}
                    <div className="flex flex-col bg-[#262626] h-full">
                        {/* Tabs */}
                        <div className="flex items-center h-11 border-b border-[#3a3a3a] px-4 gap-6">
                            <button
                                onClick={() => setLeftTab('description')}
                                className={`relative h-full text-sm font-medium transition-colors ${
                                    leftTab === 'description' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                                }`}
                            >
                                Description
                                {leftTab === 'description' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                                )}
                            </button>
                            <button
                                onClick={() => setLeftTab('solutions')}
                                className={`relative h-full text-sm font-medium transition-colors ${
                                    leftTab === 'solutions' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                                }`}
                            >
                                Solutions
                                {leftTab === 'solutions' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                                )}
                            </button>
                            <button
                                onClick={() => setLeftTab('submissions')}
                                className={`relative h-full text-sm font-medium transition-colors ${
                                    leftTab === 'submissions' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                                }`}
                            >
                                Submissions
                                {leftTab === 'submissions' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                                )}
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {leftTab === 'description' && (
                                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {task.description}
                                </div>
                            )}
                            {leftTab === 'solutions' && (
                                <div className="text-gray-500 text-center py-12 text-sm">
                                    Solutions will be available after the contest ends
                                </div>
                            )}
                            {leftTab === 'submissions' && (
                                <div className="text-gray-500 text-center py-12 text-sm">
                                    No submissions yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="flex flex-col bg-[#1e1e1e] h-full">
                        {/* Editor Header */}
                        <div className="h-11 bg-[#262626] border-b border-[#3a3a3a] flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <span className="text-gray-400 text-xs">Language:</span>
                                <select
                                    value={language}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    className="bg-[#3a3a3a] border border-[#4a4a4a] text-white text-xs px-2 py-1 rounded focus:outline-none focus:border-blue-500"
                                >
                                    {task?.allowedLanguages && task.allowedLanguages.length > 0 ? (
                                        task.allowedLanguages.map(lang => (
                                            <option key={lang} value={lang}>
                                                {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                            </option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="javascript">JavaScript</option>
                                            <option value="typescript">TypeScript</option>
                                            <option value="python">Python</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Editor */}
                        <div className={consoleOpen ? 'h-[60%]' : 'flex-1'}>
                            <Editor
                                height="100%"
                                language={language}
                                value={code}
                                onChange={handleEditorChange}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 4,
                                    wordWrap: 'off',
                                    fontFamily: "'Consolas', 'Courier New', monospace",
                                    renderWhitespace: 'selection',
                                }}
                            />
                        </div>

                        {/* Console Panel */}
                        {consoleOpen ? (
                            <div className="h-[40%] flex flex-col border-t border-[#3a3a3a] bg-[#1e1e1e]">
                                {/* Console Tabs */}
                                <div className="h-10 bg-[#262626] border-b border-[#3a3a3a] flex items-center justify-between px-4">
                                    <div className="flex items-center gap-6">
                                        <button
                                            onClick={() => setConsoleTab('testcase')}
                                            className={`relative h-10 text-xs font-medium ${
                                                consoleTab === 'testcase' ? 'text-green-500' : 'text-gray-400'
                                            }`}
                                        >
                                            Testcase
                                            {consoleTab === 'testcase' && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></div>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setConsoleTab('result')}
                                            className={`relative h-10 text-xs font-medium ${
                                                consoleTab === 'result' ? 'text-green-500' : 'text-gray-400'
                                            }`}
                                        >
                                            Test Result
                                            {consoleTab === 'result' && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></div>
                                            )}
                                        </button>
                                    </div>
                                    <button onClick={() => setConsoleOpen(false)} className="text-gray-400 hover:text-white">
                                        <ChevronDown size={16} />
                                    </button>
                                </div>

                                {/* Console Content */}
                                <div className="flex-1 overflow-y-auto p-4 bg-[#1e1e1e]">
                                    {consoleTab === 'testcase' && (
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-gray-400 text-xs mb-2">Input:</div>
                                                <div className="bg-[#2a2a2a] rounded p-3 font-mono text-xs text-gray-300">
                                                    nums = [2, 7, 11, 15], target = 9
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-gray-400 text-xs mb-2">Expected Output:</div>
                                                <div className="bg-[#2a2a2a] rounded p-3 font-mono text-xs text-gray-300">
                                                    [0, 1]
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {consoleTab === 'result' && (
                                        <div className="space-y-4">
                                            {isRunning ? (
                                                <div className="text-center py-12 text-gray-500 text-sm">
                                                    Running tests...
                                                </div>
                                            ) : testResults.length > 0 ? (
                                                <>
                                                    <div className={`text-base font-semibold mb-4 ${
                                                        passedTests === totalTests ? 'text-green-500' : 'text-red-500'
                                                    }`}>
                                                        {passedTests === totalTests ? (
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle2 size={20} />
                                                                Accepted
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <XOctagon size={20} />
                                                                Wrong Answer
                                                            </div>
                                                        )}
                                                    </div>

                                                    {testResults.map((result, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`rounded border p-4 ${
                                                                result.passed
                                                                    ? 'border-green-500/30 bg-green-500/5'
                                                                    : 'border-red-500/30 bg-red-500/5'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    {result.passed ? (
                                                                        <CheckCircle2 size={16} className="text-green-500" />
                                                                    ) : (
                                                                        <XOctagon size={16} className="text-red-500" />
                                                                    )}
                                                                    <span className={`text-sm font-medium ${
                                                                        result.passed ? 'text-green-500' : 'text-red-500'
                                                                    }`}>
                                                                        Test Case {result.testCase}
                                                                    </span>
                                                                </div>
                                                                {result.executionTime && (
                                                                    <span className="text-gray-500 text-xs">
                                                                        Runtime: {result.executionTime}ms | Memory: {result.memory}MB
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="space-y-2 text-xs">
                                                                <div>
                                                                    <div className="text-gray-400 mb-1">Input:</div>
                                                                    <div className="bg-[#2a2a2a] rounded p-2 font-mono text-gray-300">
                                                                        {result.input}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-gray-400 mb-1">Expected:</div>
                                                                    <div className="bg-[#2a2a2a] rounded p-2 font-mono text-gray-300">
                                                                        {result.expectedOutput}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-gray-400 mb-1">Output:</div>
                                                                    <div className={`rounded p-2 font-mono ${
                                                                        result.passed
                                                                            ? 'bg-[#2a2a2a] text-gray-300'
                                                                            : 'bg-red-500/10 text-red-400'
                                                                    }`}>
                                                                        {result.actualOutput}
                                                                    </div>
                                                                </div>
                                                                {result.error && (
                                                                    <div>
                                                                        <div className="text-red-400 mb-1 flex items-center gap-1">
                                                                            <AlertCircle size={12} />
                                                                            Error:
                                                                        </div>
                                                                        <div className="bg-red-500/10 rounded p-2 font-mono text-red-400">
                                                                            {result.error}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <div className="text-center py-12 text-gray-500 text-sm">
                                                    You must run your code first
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConsoleOpen(true)}
                                className="h-8 bg-[#262626] border-t border-[#3a3a3a] text-gray-400 hover:text-white text-xs flex items-center justify-center"
                            >
                                <ChevronUp size={16} />
                                Console
                            </button>
                        )}

                        {/* Bottom Buttons */}
                        <div className="h-12 bg-[#262626] border-t border-[#3a3a3a] flex items-center justify-end gap-3 px-4">
                            <button
                                onClick={handleRunTests}
                                disabled={isRunning}
                                className="px-4 py-1.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded text-sm font-medium disabled:opacity-50"
                            >
                                ▶ Run
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isRunning}
                                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </Split>
            </div>
        </div>
    );
};

export default TaskPage;
